#!/bin/bash
set -e

# Configuration
DOCKER_USER="mirxtreme"
WEB_IMAGE="skriptor-web"
WORKER_IMAGE="skriptor-worker"
BENCHMARK_IMAGE="skriptor-benchmark"
DASHBOARD_IMAGE="skriptor-benchmark-dashboard"
TAG="latest"

# Default flags
BUILD_WEB=false
BUILD_WORKER=false
BUILD_BENCHMARK=false
BUILD_DASHBOARD=false

# If no arguments, build all
if [ $# -eq 0 ]; then
    BUILD_WEB=true
    BUILD_WORKER=true
    BUILD_BENCHMARK=true
    BUILD_DASHBOARD=true
fi

# Parse arguments
for arg in "$@"; do
  case $arg in
    --web)
      BUILD_WEB=true
      shift
      ;;
    --worker)
      BUILD_WORKER=true
      shift
      ;;
    --benchmark)
      BUILD_BENCHMARK=true
      shift
      ;;
    --dashboard)
      BUILD_DASHBOARD=true
      shift
      ;;
    --all)
      BUILD_WEB=true
      BUILD_WORKER=true
      BUILD_BENCHMARK=true
      BUILD_DASHBOARD=true
      shift
      ;;
  esac
 done

echo "🚀 Starting build and push for Skriptor images..."

# 1. Build and Push Web Image
if [ "$BUILD_WEB" = true ]; then
    echo "🌐 Building Web App..."
    docker build --network=host -t $DOCKER_USER/$WEB_IMAGE:$TAG -f Dockerfile .
    echo "📤 Pushing Web App..."
    docker push $DOCKER_USER/$WEB_IMAGE:$TAG
fi

# Optional model pre-bake settings (override via env when running this script)
# Example:
# PRELOAD_MODELS=small,turbo,large PRELOAD_ALIGN_LANGS=en,id ./push_images.sh --worker
PRELOAD_MODELS="${PRELOAD_MODELS:-}"
PRELOAD_ALIGN_LANGS="${PRELOAD_ALIGN_LANGS:-}"
PRELOAD_DIARIZATION="${PRELOAD_DIARIZATION:-false}"
HUGGING_FACE_TOKEN="${HUGGING_FACE_TOKEN:-}"

# 2. Build and Push Production Worker
if [ "$BUILD_WORKER" = true ]; then
    echo "📦 Building Production Worker..."
    # Worker Dockerfile is in the worker directory
    docker build --network=host \
      --build-arg PRELOAD_MODELS="$PRELOAD_MODELS" \
      --build-arg PRELOAD_ALIGN_LANGS="$PRELOAD_ALIGN_LANGS" \
      --build-arg PRELOAD_DIARIZATION="$PRELOAD_DIARIZATION" \
      --build-arg HUGGING_FACE_TOKEN="$HUGGING_FACE_TOKEN" \
      -t $DOCKER_USER/$WORKER_IMAGE:$TAG -f worker/Dockerfile worker/
    echo "📤 Pushing Production Worker..."
    docker push $DOCKER_USER/$WORKER_IMAGE:$TAG
fi

# 3. Build and Push Benchmark
if [ "$BUILD_BENCHMARK" = true ]; then
    echo "📊 Building Benchmark Image..."
    docker build --network=host \
      --build-arg PRELOAD_MODELS="$PRELOAD_MODELS" \
      --build-arg PRELOAD_ALIGN_LANGS="$PRELOAD_ALIGN_LANGS" \
      --build-arg PRELOAD_DIARIZATION="$PRELOAD_DIARIZATION" \
      --build-arg HUGGING_FACE_TOKEN="$HUGGING_FACE_TOKEN" \
      -t $DOCKER_USER/$BENCHMARK_IMAGE:$TAG -f worker/Dockerfile.benchmark worker/
    echo "📤 Pushing Benchmark Image..."
    docker push $DOCKER_USER/$BENCHMARK_IMAGE:$TAG
fi

# 4. Build and Push Benchmark Dashboard
if [ "$BUILD_DASHBOARD" = true ]; then
    echo "📊 Building Benchmark Dashboard Image..."
    docker build --network=host \
      -t $DOCKER_USER/$DASHBOARD_IMAGE:$TAG -f worker/Dockerfile.dashboard worker/
    echo "📤 Pushing Benchmark Dashboard Image..."
    docker push $DOCKER_USER/$DASHBOARD_IMAGE:$TAG
fi

echo "✅ Done!"
[ "$BUILD_WEB" = true ] && echo "Web: $DOCKER_USER/$WEB_IMAGE:$TAG"
[ "$BUILD_WORKER" = true ] && echo "Worker: $DOCKER_USER/$WORKER_IMAGE:$TAG"
[ "$BUILD_BENCHMARK" = true ] && echo "Benchmark: $DOCKER_USER/$BENCHMARK_IMAGE:$TAG"
[ "$BUILD_DASHBOARD" = true ] && echo "Dashboard: $DOCKER_USER/$DASHBOARD_IMAGE:$TAG"
