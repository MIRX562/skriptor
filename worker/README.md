# Skriptor Worker

Python-based transcription worker using WhisperX.

## Setup

1. Install `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Sync dependencies: `uv sync`
3. Install WhisperX: `uv pip install git+https://github.com/m-bain/whisperX.git`

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. 

If your Redis uses a password, use the following format for `REDIS_URL`:
`redis://:password@host:port`
