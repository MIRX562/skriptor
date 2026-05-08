import os
import sys
import time
import json
import psutil
import torch
import pandas as pd
import numpy as np
from jiwer import wer, cer
import threading
import argparse
from datetime import datetime

# Add parent directory to sys.path to import worker modules
# Assuming this script is in worker/benchmark/benchmark.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from worker.transcriber import Transcriber
    from worker.config import config
except ImportError:
    # Fallback for different run environments
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
    from worker.worker.transcriber import Transcriber
    from worker.worker.config import config

MODELS = ["tiny", "base", "small", "medium", "large-v2", "large-v3", "turbo"]
DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'audio_dataset'))

def get_gpu_memory():
    if torch.cuda.is_available():
        return torch.cuda.max_memory_reserved() / (1024 ** 2)  # MB
    return 0

def get_device_info():
    info = {
        "cpu": "Unknown",
        "ram_gb": 0,
        "gpu": "None",
        "vram_gb": 0,
        "os": sys.platform,
        "timestamp": datetime.now().isoformat()
    }
    try:
        # CPU Info (Linux)
        if sys.platform == "linux":
            with open("/proc/cpuinfo", "r") as f:
                for line in f:
                    if "model name" in line:
                        info["cpu"] = line.split(":")[1].strip()
                        break
        
        # RAM Info
        info["ram_gb"] = round(psutil.virtual_memory().total / (1024**3), 2)
        
        # GPU Info
        if torch.cuda.is_available():
            info["gpu"] = torch.cuda.get_device_name(0)
            info["vram_gb"] = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)
    except Exception as e:
        print(f"Error getting device info: {e}")
    return info

def monitor_resources(stop_event, stats):
    stats['peak_cpu'] = 0
    stats['peak_ram'] = 0
    stats['peak_vram'] = 0
    process = psutil.Process(os.getpid())
    
    # Try to see if nvidia-smi is available for more accurate VRAM tracking
    has_nvidia_smi = False
    try:
        import subprocess
        subprocess.check_output(["nvidia-smi", "-L"])
        has_nvidia_smi = True
    except:
        pass

    while not stop_event.is_set():
        try:
            cpu = psutil.cpu_percent(interval=None)
            ram = process.memory_info().rss / (1024 ** 2)  # MB
            stats['peak_cpu'] = max(stats['peak_cpu'], cpu)
            stats['peak_ram'] = max(stats['peak_ram'], ram)
            
            if torch.cuda.is_available():
                if has_nvidia_smi:
                    try:
                        # Query used memory in MB
                        out = subprocess.check_output(["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"])
                        vram = float(out.decode().strip())
                    except:
                        vram = torch.cuda.memory_reserved() / (1024 ** 2)
                else:
                    vram = torch.cuda.memory_reserved() / (1024 ** 2)
                stats['peak_vram'] = max(stats['peak_vram'], vram)
                
            time.sleep(0.5) # Slightly longer interval to reduce overhead
        except:
            break

def normalize_text(text):
    import re
    if not isinstance(text, str):
        return ""
    # Basic normalization for WER
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Common English words for code-switching detection heuristic
ENGLISH_COMMON_WORDS = {
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 
    'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would', 
    'there', 'their', 'what', 'about', 'get', 'which', 'go', 'me', 'when', 'make', 
    'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 
    'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now'
}

def load_ground_truth(dataset_dir):
    gt_map = {}
    dataset_stats = {}
    
    def parse_time(time_str):
        if not isinstance(time_str, str): return 0
        try:
            parts = time_str.split(':')
            if len(parts) == 3: # H:MM:SS
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
            elif len(parts) == 2: # MM:SS
                return int(parts[0]) * 60 + float(parts[1])
        except:
            pass
        return 0

    for item in os.listdir(dataset_dir):
        item_path = os.path.join(dataset_dir, item)
        if os.path.isdir(item_path):
            tsv_files = [f for f in os.listdir(item_path) if f.endswith('.tsv')]
            if tsv_files:
                tsv_path = os.path.join(item_path, tsv_files[0])
                df = pd.read_csv(tsv_path, sep='\t')
                
                dataset_name = item
                dataset_stats[dataset_name] = {
                    "total_files": len(df['Audio file'].unique()),
                    "total_segments": len(df),
                }
                
                # Group by 'Audio file' and join text
                for audio_file, group in df.groupby('Audio file'):
                    full_text = " ".join(group['Text'].astype(str).tolist())
                    norm_text = normalize_text(full_text)
                    
                    # Calculate linguistic metrics
                    words = norm_text.split()
                    word_count = len(words)
                    unique_words = len(set(words))
                    lexical_density = unique_words / word_count if word_count > 0 else 0
                    
                    # Complexity metrics
                    avg_word_len = sum(len(w) for w in words) / word_count if word_count > 0 else 0
                    eng_word_count = sum(1 for w in words if w in ENGLISH_COMMON_WORDS)
                    cs_score = eng_word_count / word_count if word_count > 0 else 0
                    
                    # Duration from TSV if possible
                    ref_duration = 0
                    if 'Start' in group.columns and 'End' in group.columns:
                        ref_duration = parse_time(group['End'].iloc[-1]) - parse_time(group['Start'].iloc[0])
                    
                    wpm = (word_count / ref_duration) * 60 if ref_duration > 0 else 0
                    
                    gt_map[audio_file] = {
                        "text": norm_text,
                        "wpm": round(wpm, 2),
                        "lexical_density": round(lexical_density, 4),
                        "avg_word_len": round(avg_word_len, 2),
                        "cs_score": round(cs_score, 4),
                        "word_count": word_count
                    }
                    
    return gt_map, dataset_stats

def run_benchmark(limit=None, selected_models=None):
    if selected_models:
        models_to_test = [m for m in MODELS if m in selected_models]
    else:
        models_to_test = MODELS

    device_info = get_device_info()
    print(f"Device: {device_info['cpu']} | {device_info['gpu']} ({device_info['vram_gb']}GB VRAM)")
    print(f"Starting benchmark on models: {models_to_test}")
    
    gt_map, dataset_stats = load_ground_truth(DATASET_DIR)
    audio_files = []
    
    for root, dirs, files in os.walk(DATASET_DIR):
        for f in files:
            if f.endswith('.mp3'):
                name_without_ext = os.path.splitext(f)[0]
                if name_without_ext in gt_map:
                    audio_files.append({
                        'path': os.path.join(root, f),
                        'name': name_without_ext,
                        'dataset': os.path.basename(root)
                    })

    if limit:
        audio_files = audio_files[:limit]
        print(f"Limiting to {limit} audio files.")

    print(f"Found {len(audio_files)} valid audio files with ground truth.")

    results = []
    transcriber = Transcriber()
    import jiwer

    for model_size in models_to_test:
        print(f"\n{'='*50}")
        print(f"Benchmarking model: {model_size}")
        print(f"{'='*50}")
        
        # Reset peak stats before model run
        if torch.cuda.is_available():
            torch.cuda.reset_peak_memory_stats()
        
        for audio in audio_files:
            print(f"Processing: {audio['name']}...")
            
            # Prepare stats and monitoring
            stats = {'peak_vram': 0}
            stop_event = threading.Event()
            monitor_thread = threading.Thread(target=monitor_resources, args=(stop_event, stats))
            
            start_time = time.time()
            monitor_thread.start()
            
            try:
                # We use a local file URL for the transcriber
                audio_url = f"file://{audio['path']}"
                
                original_download = transcriber._download_file
                def _mock_download(url, dest):
                    if url.startswith("file://"):
                        import shutil
                        shutil.copy(url[7:], dest)
                    else:
                        original_download(url, dest)
                
                transcriber._download_file = _mock_download
                
                result = transcriber.process(
                    audio_url=audio_url,
                    model_size=model_size,
                    language="id", # Default to Indonesian for this dataset
                    is_diarized=False
                )
                
                end_time = time.time()
                stop_event.set()
                monitor_thread.join()
                
                duration = result['metadata']['durationSeconds']
                processing_time = end_time - start_time
                rtf = processing_time / duration if duration > 0 else 0
                
                hyp_text = normalize_text(" ".join([s['text'] for s in result['segments']]))
                ref_info = gt_map[audio['name']]
                ref_text = ref_info['text']
                
                # Detailed WER analysis
                wer_output = jiwer.process(ref_text, hyp_text)
                
                # Detailed CER analysis (split by character)
                cer_output = jiwer.process(list(ref_text), list(hyp_text))
                
                results.append({
                    'model': model_size,
                    'dataset': audio['dataset'],
                    'audio_file': audio['name'],
                    'duration_sec': round(duration, 2),
                    'processing_time_sec': round(processing_time, 2),
                    'rtf': round(rtf, 4),
                    'wer': round(wer_output.wer, 4),
                    'wer_sub': wer_output.substitutions,
                    'wer_del': wer_output.deletions,
                    'wer_ins': wer_output.insertions,
                    'cer': round(cer_output.wer, 4), # jiwer 'wer' on characters is CER
                    'cer_sub': cer_output.substitutions,
                    'cer_del': cer_output.deletions,
                    'cer_ins': cer_output.insertions,
                    'wpm': ref_info['wpm'],
                    'lexical_density': ref_info['lexical_density'],
                    'avg_word_len': ref_info['avg_word_len'],
                    'cs_score': ref_info['cs_score'],
                    'peak_cpu_percent': round(stats.get('peak_cpu', 0), 2),
                    'peak_ram_mb': round(stats.get('peak_ram', 0), 2),
                    'peak_vram_mb': round(stats.get('peak_vram', 0), 2),
                    'timestamp': datetime.now().isoformat()
                })
                
                print(f"DONE: WER={wer_output.wer:.4f}, RTF={rtf:.4f}, VRAM={stats.get('peak_vram', 0):.0f}MB")
                
            except Exception as e:
                print(f"FAILED {audio['name']} with {model_size}: {e}")
                stop_event.set()
                monitor_thread.join()

    # Save results with metadata
    output_data = {
        "device_info": device_info,
        "dataset_stats": dataset_stats,
        "results": results
    }
    
    # Also save as individual file for this run/device to allow comparison
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    device_name_slug = device_info['gpu'].replace(' ', '_').lower() if device_info['gpu'] != "None" else "cpu"
    individual_file = os.path.join(os.path.dirname(__file__), f'results_{device_name_slug}_{timestamp_str}.json')
    
    # Update main results file (legacy support)
    main_output_file = os.path.join(os.path.dirname(__file__), 'benchmark_results.json')
    
    with open(main_output_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    with open(individual_file, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\nBenchmark complete!")
    print(f"Results saved to {main_output_file}")
    print(f"Individual run saved to {individual_file}")
    
    print(f"\nBenchmark complete! Results saved to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark Whisper models")
    parser.add_argument("--limit", type=int, help="Limit number of audio files")
    parser.add_argument("--models", nargs="+", help="Specific models to test")
    args = parser.parse_args()
    
    run_benchmark(limit=args.limit, selected_models=args.models)
