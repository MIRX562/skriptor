# 🎙️ Skriptor — High-Performance Audio Transcription SaaS

**Skriptor** is a modern, full-stack audio transcription service designed for speed, accuracy, and scalability. It leverages the latest features of **Next.js 16**, a distributed **Python AI worker** (WhisperX), and a real-time streaming architecture.

> [!NOTE]
> **Open Source & Community Focused**: This project is 100% open source. You are free to use, modify, and host it yourself for personal or commercial use. Contributions are welcome!

---

## ✨ Key Features

-   **⚡ Real-Time Progress**: Watch your transcriptions happen in real-time via Server-Sent Events (SSE) and Redis Pub/Sub.
-   **🤖 Distributed AI Processing**: Transcription is handled by an asynchronous Python worker using **WhisperX**, supporting alignment, diarization (speaker identification), and multiple model sizes (including the new `turbo`).
-   **💎 Premium UI/UX**: Built with **Tailwind CSS v4**, **Framer Motion**, and **shadcn/ui** for a world-class user experience.
-   **🚀 Next.js 16 Native**: Utilizes **Partial Prerendering (PPR)** for instant page loads and **Cache Components** for granular data caching.
-   **🔐 Secure & Flexible Auth**: Powered by **Better-Auth** with support for Email/Password and Google OAuth.
-   **📦 S3-Compatible Storage**: Works with any S3-compatible provider (MinIO, Garage, AWS S3).
-   **📊 Benchmarking Suite**: Includes built-in tools to evaluate model accuracy (WER/CER) and speed (RTF).

---

## 🛠️ Tech Stack

-   **Framework**: Next.js 16 (App Router, PPR, Cache Components)
-   **Runtime**: Bun (Primary) / Node.js
-   **Language**: TypeScript
-   **ORM**: Drizzle ORM (PostgreSQL)
-   **Real-time**: Redis Pub/Sub & SSE
-   **Queue**: BullMQ
-   **Styling**: Tailwind CSS v4
-   **Storage**: S3 API (AWS SDK v3)
-   **Worker**: Python 3.10+, WhisperX, PyTorch

---

## 🚀 Deployment Guide

### 1. Direct Deployment (Local Development)

#### Prerequisites
-   [Bun](https://bun.sh/)
-   [Docker](https://www.docker.com/) (for Redis/Postgres/Garage)
-   [Python 3.10+](https://www.python.org/) (for local worker development)

#### Step-by-Step
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mirxtreme/skriptor.git
    cd skriptor
    ```
2.  **Install dependencies**:
    ```bash
    bun install
    ```
3.  **Setup Environment**:
    ```bash
    cp .example.env .env
    ```
    *Fill in the variables listed in the [Environment Variables](#environment-variables) section.*
4.  **Database Migration**:
    ```bash
    bunx drizzle-kit generate
    bunx drizzle-kit migrate
    ```
5.  **Start Services**:
    ```bash
    docker compose up -d  # Starts Redis, Postgres, and Garage
    bun run dev           # Starts the Next.js app
    ```

### 2. Docker Deployment (Production)

You can run the entire stack using Docker. We provide separate images for the web app and the worker.

1.  **Configure `.env`**: Ensure all variables are correctly set.
2.  **Run with Docker Compose**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d
    ```

> [!TIP]
> Refer to [worker/README.md](worker/README.md) for detailed instructions on deploying the transcription worker to GPU-enabled environments like **RunPod**.

---

## 🔑 Environment Variables

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis URL (e.g., `redis://:pass@localhost:6379`). |
| `S3_ENDPOINT` | Your S3-compatible API endpoint. |
| `S3_ACCESS_KEY` | S3 Access Key. |
| `S3_SECRET_KEY` | S3 Secret Key. |
| `S3_BUCKET` | The name of your S3 bucket. |
| `S3_REGION` | S3 Region (e.g., `us-east-1`). |
| `BETTER_AUTH_SECRET` | Secret key for Better-Auth encryption. |
| `BETTER_AUTH_URL` | The base URL of your application. |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth Client ID. |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth Secret. |
| `RESEND_API_KEY` | API key for Resend email delivery. |
| `HUGGING_FACE_TOKEN` | Required for speaker diarization. |
| `WORKER_SHARED_SECRET` | Shared secret for HMAC-signed worker callbacks. |

---

## 📜 License

Skriptor is released under the **MIT License**. You are encouraged to fork, modify, and build upon this project!
