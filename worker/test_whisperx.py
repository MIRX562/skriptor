import json
import whisperx
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"
model_size = "tiny"

print("Loading model...")
model = whisperx.load_model(model_size, device, compute_type=compute_type)

print("Loading audio...")
audio_file = "/home/mirx/code/skriptor/worker/audio_dataset/1774204205957-cv-corpus-25.0-2026-03-09-id/cv-corpus-25.0-2026-03-09/id/clips/common_voice_id_19051299.mp3"
audio = whisperx.load_audio(audio_file)

print("Transcribing...")
result = model.transcribe(audio, batch_size=16)
print(json.dumps(result, indent=2))

print("Aligning...")
align_model, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
result = whisperx.align(result["segments"], align_model, metadata, audio, device, return_char_alignments=False)

print("Aligned result:")
print(json.dumps(result, indent=2))
