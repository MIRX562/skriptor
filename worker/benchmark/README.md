# Skriptor Benchmarking Suite

This suite allows you to benchmark Whisper models for accuracy (WER/CER) and resource usage.

## Setup

The dependencies have already been installed in the worker's virtual environment.
If you need to reinstall them:
```bash
uv pip install -r requirements.txt
```

## Running the Benchmark

To run the benchmark on all models and all audio files:
```bash
python benchmark.py
```

To limit to a few files or specific models:
```bash
python benchmark.py --limit 5 --models tiny base small
```

The results will be saved to `benchmark_results.json`.

## Generating Reports

After running the benchmark, generate the Markdown and Excel reports:
```bash
python exporter.py
```
- `benchmarking_report.md`: Detailed analysis and summary tables (including WER and CER).
- `benchmarking_raw.xlsx`: Categorized raw data.

## Viewing the Dashboard

To launch the interactive Streamlit dashboard:
```bash
streamlit run dashboard.py
```

## Dataset Structure

The script automatically discovers datasets in `worker/audio_dataset/`.
Each dataset folder should contain:
- `.mp3` audio files.
- A `.tsv` file with columns: `Audio file`, `Start`, `End`, `Text`.

## Key Metrics Evaluated
- **WER (Word Error Rate)**: Measure of transcription accuracy at the word level.
- **CER (Character Error Rate)**: Measure of transcription accuracy at the character level.
- **RTF (Real-Time Factor)**: Processing time divided by audio duration.
- **Peak RAM/VRAM**: Maximum memory footprint during inference.
