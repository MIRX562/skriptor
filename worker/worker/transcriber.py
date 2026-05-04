import os
import whisperx
import torch
import requests
import tempfile
from .config import config

class Transcriber:
    _model_cache = {}
    _align_model_cache = {}
    _diarize_model = None

    def __init__(self, device: str = None):
        self.device = device or config.DEVICE
        self.compute_type = "float16" if self.device == "cuda" else "int8"
        self.hf_token = config.HUGGING_FACE_TOKEN

    def process(self, audio_url: str, model_size: str, language: str, is_diarized: bool, num_speakers: int = None, progress_cb=None):
        import gc
        
        with tempfile.NamedTemporaryFile(suffix=".audio") as tmp:
            # Download audio
            if progress_cb: progress_cb("processing", 10, "Downloading audio...")
            self._download_file(audio_url, tmp.name)
            
            # 1. Transcribe with original whisper (batched)
            model_key = f"{model_size}_{self.compute_type}"
            print(f"Checking for model in cache: {model_key}")
            if progress_cb: progress_cb("processing", 25, f"Loading/Retrieving Whisper model ({model_size})...")
            
            if model_key not in Transcriber._model_cache:
                print(f"Loading Whisper model {model_size} into memory (device={self.device}, compute={self.compute_type})...")
                # Clear other models if we change size to save VRAM
                if Transcriber._model_cache:
                    print("Clearing model cache to make room...")
                    Transcriber._model_cache.clear()
                    gc.collect()
                    if self.device == "cuda": torch.cuda.empty_cache()
                
                Transcriber._model_cache[model_key] = whisperx.load_model(model_size, self.device, compute_type=self.compute_type)
                print("Model loaded successfully.")
            
            model = Transcriber._model_cache[model_key]
            
            print("Loading audio into numpy array...")
            if progress_cb: progress_cb("processing", 40, "Transcribing audio...")
            audio = whisperx.load_audio(tmp.name)
            
            print("Starting transcription...")
            result = model.transcribe(audio, batch_size=16, language=language if language != "default" else None)
            print(f"Transcription finished. Detected language: {result['language']}")
            
            # Capture language from result
            detected_language = result["language"]

            # 2. Align whisper output
            print(f"Aligning transcript for language: {detected_language}...")
            if progress_cb: progress_cb("processing", 60, "Aligning transcript...")
            
            align_key = f"{detected_language}_{self.device}"
            if align_key not in Transcriber._align_model_cache:
                print(f"Loading alignment model for {detected_language}...")
                # Optional: limit cache size for alignment models
                if len(Transcriber._align_model_cache) > 2:
                    Transcriber._align_model_cache.clear()
                
                Transcriber._align_model_cache[align_key] = whisperx.load_align_model(language_code=detected_language, device=self.device)
                print("Alignment model loaded.")
            
            model_a, metadata = Transcriber._align_model_cache[align_key]
            result = whisperx.align(result["segments"], model_a, metadata, audio, self.device, return_char_alignments=False)
            print("Alignment finished.")
            
            # 3. Diarize
            if is_diarized:
                print("Starting diarization...")
                if progress_cb: progress_cb("processing", 80, "Identifying speakers...")
                if Transcriber._diarize_model is None:
                    print("Loading Diarization pipeline...")
                    Transcriber._diarize_model = whisperx.DiarizationPipeline(use_auth_token=self.hf_token, device=self.device)
                    print("Diarization pipeline loaded.")
                
                diarize_segments = Transcriber._diarize_model(audio, min_speakers=num_speakers, max_speakers=num_speakers)
                result = whisperx.assign_word_speakers(diarize_segments, result)
                print("Diarization finished.")

            # Format segments for Skriptor
            print("Formatting segments...")
            segments = []
            for s in result["segments"]:
                segments.append({
                    "speaker": s.get("speaker"),
                    "text": s.get("text", "").strip(),
                    "startTimeMs": int(s["start"] * 1000),
                    "endTimeMs": int(s["end"] * 1000)
                })

            # Cleanup to help memory management
            print("Cleaning up resources...")
            duration = len(audio) / whisperx.audio.SAMPLE_RATE
            del audio
            gc.collect()
            if self.device == "cuda": torch.cuda.empty_cache()

            print("Job processing complete.")
            return {
                "status": "completed",
                "segments": segments,
                "metadata": {
                    "durationSeconds": duration,
                    "model": model_size,
                    "language": detected_language
                }
            }

    def _download_file(self, url: str, dest: str):
        print(f"Downloading audio from {url}...")
        try:
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            with open(dest, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded audio to {dest}")
        except Exception as e:
            print(f"Error downloading audio: {e}")
            raise e
