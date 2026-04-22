import os
import whisperx
import torch
import requests
import tempfile
from .config import config

class Transcriber:
    def __init__(self, device: str = None):
        self.device = device or config.DEVICE
        self.compute_type = "float16" if self.device == "cuda" else "int8"
        self.hf_token = config.HUGGING_FACE_TOKEN

    def process(self, audio_url: str, model_size: str, language: str, is_diarized: bool, num_speakers: int = None, progress_cb=None):
        with tempfile.NamedTemporaryFile(suffix=".audio") as tmp:
            # Download audio
            if progress_cb: progress_cb("processing", 10, "Downloading audio...")
            self._download_file(audio_url, tmp.name)
            
            # 1. Transcribe with original whisper (batched)
            if progress_cb: progress_cb("processing", 25, f"Loading Whisper model ({model_size})...")
            model = whisperx.load_model(model_size, self.device, compute_type=self.compute_type)
            
            if progress_cb: progress_cb("processing", 40, "Transcribing audio...")
            audio = whisperx.load_audio(tmp.name)
            result = model.transcribe(audio, batch_size=16, language=language if language != "default" else None)
            
            # 2. Align whisper output
            if progress_cb: progress_cb("processing", 60, "Aligning transcript...")
            model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=self.device)
            result = whisperx.align(result["segments"], model_a, metadata, audio, self.device, return_char_alignments=False)
            
            # 3. Diarize
            if is_diarized:
                if progress_cb: progress_cb("processing", 80, "Identifying speakers...")
                diarize_model = whisperx.DiarizationPipeline(use_auth_token=self.hf_token, device=self.device)
                diarize_segments = diarize_model(audio, min_speakers=num_speakers, max_speakers=num_speakers)
                result = whisperx.assign_word_speakers(diarize_segments, result)

            # Format segments for Skriptor
            segments = []
            for s in result["segments"]:
                segments.append({
                    "speaker": s.get("speaker"),
                    "text": s.get("text", "").strip(),
                    "startTimeMs": int(s["start"] * 1000),
                    "endTimeMs": int(s["end"] * 1000)
                })

            return {
                "status": "completed",
                "segments": segments,
                "metadata": {
                    "durationSeconds": len(audio) / whisperx.audio.SAMPLE_RATE,
                    "model": model_size,
                    "language": result["language"]
                }
            }

    def _download_file(self, url: str, dest: str):
        response = requests.get(url, stream=True)
        response.raise_for_status()
        with open(dest, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
