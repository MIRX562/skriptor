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

MODELS = ["tiny", "base", "small", "medium", "large-v2", "large-v3"]
DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'audio_dataset'))

def get_gpu_memory():
    if torch.cuda.is_available():
        # Reset peak stats
        torch.cuda.reset_peak_memory_stats()
        return torch.cuda.max_memory_allocated() / (1024 ** 2)  # MB
    return 0

def monitor_resources(stop_event, stats):
    stats['peak_cpu'] = 0
    stats['peak_ram'] = 0
    process = psutil.Process(os.getpid())
    while not stop_event.is_set():
        try:
            cpu = psutil.cpu_percent(interval=0.1)
            ram = process.memory_info().rss / (1024 ** 2)  # MB
            stats['peak_cpu'] = max(stats['peak_cpu'], cpu)
            stats['peak_ram'] = max(stats['peak_ram'], ram)
            time.sleep(0.1)
        except:
            break

def normalize_text(text):
    import re
    # Basic normalization for WER
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def load_ground_truth(dataset_dir):
    gt_map = {}
    for item in os.listdir(dataset_dir):
        item_path = os.path.join(dataset_dir, item)
        if os.path.isdir(item_path):
            # Look for tsv file
            tsv_files = [f for f in os.listdir(item_path) if f.endswith('.tsv')]
            if tsv_files:
                tsv_path = os.path.join(item_path, tsv_files[0])
                df = pd.read_csv(tsv_path, sep='\t')
                # Group by 'Audio file' and join text
                for audio_file, group in df.groupby('Audio file'):
                    full_text = " ".join(group['Text'].astype(str).tolist())
                    gt_map[audio_file] = normalize_text(full_text)
    return gt_map

def run_benchmark(limit=None, selected_models=None):
    if selected_models:
        models_to_test = [m for m in MODELS if m in selected_models]
    else:
        models_to_test = MODELS

    print(f"Starting benchmark on models: {models_to_test}")
    
    gt_map = load_ground_truth(DATASET_DIR)
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

    for model_size in models_to_test:
        print(f"\n{'='*50}")
        print(f"Benchmarking model: {model_size}")
        print(f"{'='*50}")
        
        for audio in audio_files:
            print(f"Processing: {audio['name']}...")
            
            # Prepare stats and monitoring
            stats = {}
            stop_event = threading.Event()
            monitor_thread = threading.Thread(target=monitor_resources, args=(stop_event, stats))
            
            start_time = time.time()
            monitor_thread.start()
            
            try:
                # We use a local file URL for the transcriber
                audio_url = f"file://{audio['path']}"
                
                # Mock download for local files in transcriber.py if it uses requests
                # Actually, transcriber.py uses requests.get(url, stream=True)
                # I might need to monkeypatch it or just provide a real URL if it supports file://
                # Looking at transcriber.py: self._download_file(audio_url, tmp.name)
                # Let's monkeypatch _download_file to handle local files
                
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
                ref_text = gt_map[audio['name']]
                
                error_rate = wer(ref_text, hyp_text)
                cer_rate = cer(ref_text, hyp_text)
                
                gpu_mem = get_gpu_memory()
                
                results.append({
                    'model': model_size,
                    'dataset': audio['dataset'],
                    'audio_file': audio['name'],
                    'duration_sec': round(duration, 2),
                    'processing_time_sec': round(processing_time, 2),
                    'rtf': round(rtf, 4),
                    'wer': round(error_rate, 4),
                    'cer': round(cer_rate, 4),
                    'peak_cpu_percent': round(stats.get('peak_cpu', 0), 2),
                    'peak_ram_mb': round(stats.get('peak_ram', 0), 2),
                    'peak_vram_mb': round(gpu_mem, 2),
                    'timestamp': datetime.now().isoformat()
                })
                
                print(f"DONE: WER={error_rate:.4f}, CER={cer_rate:.4f}, RTF={rtf:.4f}, RAM={stats.get('peak_ram', 0):.0f}MB")
                
            except Exception as e:
                print(f"FAILED {audio['name']} with {model_size}: {e}")
                stop_event.set()
                monitor_thread.join()

    # Save results
    output_file = os.path.join(os.path.dirname(__file__), 'benchmark_results.json')
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nBenchmark complete! Results saved to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark Whisper models")
    parser.add_argument("--limit", type=int, help="Limit number of audio files")
    parser.add_argument("--models", nargs="+", help="Specific models to test")
    args = parser.parse_args()
    
    run_benchmark(limit=args.limit, selected_models=args.models)
