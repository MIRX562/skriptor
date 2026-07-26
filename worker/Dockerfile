FROM docker.io/nvidia/cuda:11.8.0-base-ubuntu22.04

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive \
    PATH="/app/.venv/bin:${PATH}" \
    HF_HOME="/app/.cache/huggingface" \
    XDG_CACHE_HOME="/app/.cache" \
    UV_HTTP_TIMEOUT=120

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    git \
    ca-certificates \
    tini \
    && rm -rf /var/lib/apt/lists/*

# Install pinned uv
COPY --from=ghcr.io/astral-sh/uv:0.9.3 /uv /usr/local/bin/uv

WORKDIR /app

# Create non-root user
RUN useradd \
        --create-home \
        --uid 10001 \
        --shell /usr/sbin/nologin \
        appuser \
    && mkdir -p /app/.cache \
    && chown -R appuser:appuser /app

# Copy dependency metadata first for Docker layer caching
COPY --chown=appuser:appuser \
    pyproject.toml \
    uv.lock \
    README.md \
    ./

# Install locked dependencies without installing the project yet
RUN uv sync \
    --frozen \
    --no-dev \
    --no-install-project

# Copy application source
COPY --chown=appuser:appuser worker ./worker

# Install the project itself
RUN uv sync \
    --frozen \
    --no-dev

# Model preloading options
ARG PRELOAD_MODELS=""
ARG PRELOAD_ALIGN_LANGS=""
ARG PRELOAD_DIARIZATION="false"

USER appuser

RUN if [ -n "${PRELOAD_MODELS}" ] || \
       [ -n "${PRELOAD_ALIGN_LANGS}" ] || \
       [ "${PRELOAD_DIARIZATION}" = "true" ]; then \
      echo "Preloading WhisperX artifacts into image cache..." && \
      python -c "\
import os; \
import whisperx; \
from whisperx.diarize import DiarizationPipeline; \
device='cpu'; \
models=[m.strip() for m in os.getenv('PRELOAD_MODELS','').split(',') if m.strip()]; \
langs=[l.strip() for l in os.getenv('PRELOAD_ALIGN_LANGS','').split(',') if l.strip()]; \
preload_d=os.getenv('PRELOAD_DIARIZATION','false').lower() == 'true'; \
token=os.getenv('HUGGING_FACE_TOKEN',''); \
[whisperx.load_model(m, device, compute_type='int8') for m in models]; \
[whisperx.load_align_model(language_code=l, device=device) for l in langs]; \
DiarizationPipeline(token=token, device=device) if preload_d and token else None; \
print('Model preload complete')\
"; \
    else \
      echo "Skipping model preloading (runtime lazy download enabled)."; \
    fi

ENTRYPOINT ["tini", "--"]

CMD ["python", "-m", "worker.main"]