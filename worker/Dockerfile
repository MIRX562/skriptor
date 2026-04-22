# Use NVIDIA CUDA base image
FROM nvidia/cuda:11.8.0-base-ubuntu22.04

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv/bin/uv
ENV PATH="/uv/bin:${PATH}"

# Set working directory
WORKDIR /app

# Copy project files
COPY pyproject.toml README.md ./

# Install dependencies using uv
# We use --system to install into the system python since we are in a container
RUN uv pip install --system -r pyproject.toml
RUN uv pip install --system git+https://github.com/m-bain/whisperX.git

# Copy source code
COPY . .

# Run the worker
CMD ["python3", "-m", "worker.main"]
