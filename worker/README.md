# Skriptor Worker & Benchmarking

This directory contains the Python-based transcription worker for Skriptor, powered by WhisperX, and a dedicated benchmarking suite for performance analysis.

## Docker Images

We maintain two separate Docker images to optimize for both production performance and research convenience.

### 1. Production Worker (`mirxtreme/skriptor-worker`)

The standard worker used in the Skriptor application. It is slim, secure, and optimized for processing jobs from the BullMQ queue.

- **Dockerfile**: `Dockerfile`
- **Primary CMD**: `python3 -m worker.main`
- **Use Case**: Production deployment, live transcription.

### 2. Benchmark Runner (`mirxtreme/skriptor-benchmark`)

A benchmark image designed for RunPod or local performance testing. It includes benchmark scripts + analytics tools, while datasets are expected to be mounted at runtime (to keep image size smaller).

- **Dockerfile**: `Dockerfile.benchmark`
- **Primary CMD**: `python3 benchmark/benchmark.py`
- **Use Case**: Accuracy (WER/CER) testing, RTF analysis, model comparison (including `turbo`).

---

## Deployment to RunPod (Benchmark Workflow)

### 1. Build and Push

Use the helper script to push both images to Docker Hub:

```bash
./push_images.sh
```

By default, the script now pre-bakes common models (`small,turbo,large`) and alignment (`en,id`) into worker/benchmark images. You can override:

```bash
PRELOAD_MODELS=turbo PRELOAD_ALIGN_LANGS=id PRELOAD_DIARIZATION=false ./push_images.sh --worker
```

### 2. Running on RunPod

Deploy the `skriptor-benchmark` image and mount/copy your dataset into `/app/audio_dataset`. Once started, it automatically runs benchmark and launches the dashboard.

### 3. Retrieving Results

Since you have SSH access, you can copy the results to your local machine once the benchmark is finished:

```bash
# On your local machine
scp -P [RUNPOD_PORT] root@[RUNPOD_IP]:/app/benchmark/benchmark_results.json ./benchmark/
scp -P [RUNPOD_PORT] root@[RUNPOD_IP]:/app/benchmark/benchmarking_report.md ./benchmark/
```

### 4. Local Analysis

Once the `benchmark_results.json` is on your machine, you can run the dashboard locally to visualize the data:

```bash
cd worker
streamlit run benchmark/dashboard.py
```

---

## Development Setup

1. Install `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Sync dependencies: `uv sync --index-strategy unsafe-best-match`

### Environment Variables

Copy `.example.env` to `.env`. For production, ensure `REDIS_URL`, `S3_*`, and `HUGGING_FACE_TOKEN` are set.

### Optional: Bake Models into Image

By default, models are downloaded lazily at runtime and cached. To pre-bake model artifacts into the image during build:

```bash
docker build --network=host \
  -f worker/Dockerfile worker/ \
  --build-arg PRELOAD_MODELS=small,turbo,large \
  --build-arg PRELOAD_ALIGN_LANGS=en,id \
  --build-arg PRELOAD_DIARIZATION=true \
  --build-arg HUGGING_FACE_TOKEN=hf_xxx \
  -t mirxtreme/skriptor-worker:prebaked
```

Notes:

- `PRELOAD_DIARIZATION=true` requires accepted pyannote terms and a valid Hugging Face token.
- Pre-baking increases image size but avoids first-run model downloads.
