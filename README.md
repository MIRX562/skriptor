# 🎙️ Skriptor — High-Performance Audio Transcription SaaS

**Skriptor** is a modern, full-stack audio transcription service designed for speed, accuracy, and scalability. It leverages **Next.js 16**, a distributed **Python AI worker** (WhisperX), and a real-time streaming architecture.

---

## 🔑 1. Setup API Keys

Before running the app, you need to collect several API keys. Follow this guide to get them:

### 🔐 Better-Auth Secret
This is used for encrypting session cookies.
- **How to get**: Generate a random 32-character hex string.
- **Command**: `openssl rand -hex 32`

### 📧 Resend (Email Delivery)
Used for sending verification emails and password resets.
- **How to get**: Sign up at [Resend.com](https://resend.com), create an API key, and verify your domain.
- **Variable**: `RESEND_API_KEY`

### 🤖 HuggingFace (Transcription Diarization)
Required by the worker for speaker identification (diarization).
- **How to get**:
  1. Create an account at [huggingface.co](https://huggingface.co).
  2. Go to **Settings > Access Tokens** and create a "Read" token.
  3. **Crucial**: You MUST visit the model pages and "Accept Terms" for:
     - [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0)
     - [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)
- **Variable**: `HUGGING_FACE_TOKEN`

### 🌐 Google OAuth (Optional)
If you want to enable "Sign in with Google".
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/).
  2. Create a new project -> APIs & Services -> Credentials.
  3. Create "OAuth 2.0 Client IDs".
  4. Set Authorized Redirect URI to: `http://localhost:3000/api/auth/callback/google`
- **Variables**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 📦 S3 Storage
Used for storing audio files. By default, the app uses **Garage** (self-hosted) via Docker.
- If using local Docker: The default values in `.env` will work.
- If using AWS S3/MinIO: Get your Access Key and Secret Key from your provider's dashboard.

---

## 🚀 2. Method A: Direct Run (Development)

Best for developers who want to modify the code with Hot Module Replacement (HMR).

### Prerequisites
- **Bun**: [Install Bun](https://bun.sh/)
- **Docker**: For running infrastructure (Postgres, Redis, Garage).
- **Python 3.10+**: For running the worker locally.

### Steps
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/mirxtreme/skriptor.git
    cd skriptor
    bun install
    ```
2.  **Environment Setup**:
    ```bash
    cp .example.env .env
    # Fill in the keys you collected in Step 1
    ```
3.  **Start Infrastructure**:
    ```bash
    docker compose up -d # Starts Postgres, Redis, and Garage
    ```
4.  **Database Migration**:
    ```bash
    bunx drizzle-kit generate
    bunx drizzle-kit migrate
    ```
5.  **Run Web App**:
    ```bash
    bun run dev
    ```
6.  **Run Worker** (Open a new terminal):
    ```bash
    cd worker
    # We recommend using 'uv' for python dependency management
    uv sync
    # Or using standard pip
    pip install .
    python3 -m worker.main
    ```

---

## 🐳 3. Method B: Docker Run (Production-ready)

Best for a quick start or production deployment. This runs the entire stack (including Web and Worker) in containers.

### Prerequisites
- **Docker** and **Docker Compose**.
- **NVIDIA Container Toolkit** (if running the worker with GPU/CUDA).

### Steps
1.  **Configure `.env`**:
    Ensure your `.env` file is filled with all required API keys.
2.  **Start the Stack**:
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
3.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Benchmarking

Skriptor includes a benchmarking suite to test Whisper model performance (WER, CER, RTF).

1.  **Run Benchmark**:
    ```bash
    cd worker
    python3 benchmark/benchmark.py
    ```
2.  **Visualize Results**:
    ```bash
    streamlit run benchmark/dashboard.py
    ```

---

## 📜 License

Skriptor is released under the **MIT License**.
