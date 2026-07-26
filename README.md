# 🎙️ Skriptor — High-Performance Audio Transcription SaaS

Skriptor is a full-stack transcription platform with:

- **Web app**: Next.js 16 + Better Auth + Drizzle/Postgres
- **Queue + realtime**: Redis + BullMQ
- **AI worker**: Python + WhisperX (+ optional speaker diarization via pyannote)
- **Object storage**: S3-compatible (MinIO by default in local Docker)

This guide is intentionally detailed so you can get from clone → working app with minimal guesswork.

---

## Table of Contents

1. [Architecture at a glance](#architecture-at-a-glance)
2. [Prerequisites](#prerequisites)
3. [Environment variables (complete reference)](#environment-variables-complete-reference)
4. [Get external credentials](#get-external-credentials)
5. [Method A — Local development (recommended for coding)](#method-a--local-development-recommended-for-coding)
6. [Method B — Full Docker stack (production-like)](#method-b--full-docker-stack-production-like)
7. [Validation checklist](#validation-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Benchmarking](#benchmarking)

---

## Architecture at a glance

```mermaid
flowchart TD
    U[Browser] --> W[Next.js Web :3000]
    W --> DB[(Postgres)]
    W --> R[(Redis)]
    W --> S3[(MinIO / S3)]
    W --> Q[Enqueue transcription job]
    Q --> R
    WK[Python Worker] --> R
    WK --> S3
    WK --> HF[Hugging Face + pyannote]
    WK --> CB[Signed callback to Web]
    CB --> W
```

---

## Prerequisites

### Required

- **Git**
- **Bun** (for web app): <https://bun.sh>
- **Docker + Docker Compose**
- **Python 3.10+** (for local worker execution)
- **uv** (recommended Python package manager): <https://docs.astral.sh/uv/>

### Optional but strongly recommended

- **NVIDIA GPU + drivers + NVIDIA Container Toolkit** (for fast transcription)
  - Without GPU, worker can run on CPU (`DEVICE=cpu`) but slower.

---

## Environment variables (complete reference)

There are two env contexts:

1. **Root web env**: `./.env` (used by Next.js app and production compose)
2. **Worker local env**: `./worker/.env` (used when running worker directly with Python)

> Important: `WORKER_SHARED_SECRET` must match between web and worker.

### 1) Root `./.env` variables

Start from:

```bash
cp .example.env .env
```

| Variable               | Required                   | Example                                                  | Used by                                    | Notes                                                  |
| ---------------------- | -------------------------- | -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| `DATABASE_URL`         | Yes                        | `postgresql://postgres:password@localhost:5432/skriptor` | Web, Drizzle                               | Postgres connection string                             |
| `REDIS_URL`            | Yes                        | `redis://:password@localhost:6379`                       | Web queue/events                           | Must include password if Redis requires auth           |
| `S3_ENDPOINT`          | Yes                        | `http://localhost:9000`                                  | Web upload/download                        | MinIO local endpoint                                   |
| `S3_ACCESS_KEY`        | Yes                        | `mirx`                                                   | Web storage                                | MinIO/AWS access key                                   |
| `S3_SECRET_KEY`        | Yes                        | `asemjowo`                                               | Web storage                                | MinIO/AWS secret                                       |
| `S3_BUCKET`            | Yes                        | `skriptor-bucket`                                        | Web storage                                | Bucket must exist                                      |
| `S3_REGION`            | Yes                        | `us-east-1`                                              | Web storage                                | Any valid region label                                 |
| `S3_FORCE_PATH_STYLE`  | Recommended for MinIO      | `true`                                                   | Web storage client                         | Helps compatibility with local S3-compatible providers |
| `BETTER_AUTH_SECRET`   | Yes                        | (random 64 hex)                                          | Auth                                       | Generate securely                                      |
| `BETTER_AUTH_URL`      | Yes                        | `http://localhost:3000`                                  | Auth                                       | Public base URL                                        |
| `RESEND_API_KEY`       | Recommended                | `re_xxx`                                                 | Email verification/reset                   | Required for real email delivery                       |
| `GOOGLE_CLIENT_ID`     | Optional                   | `...apps.googleusercontent.com`                          | Google login                               | Needed only for Google OAuth                           |
| `GOOGLE_CLIENT_SECRET` | Optional                   | `...`                                                    | Google login                               | Needed only for Google OAuth                           |
| `HUGGING_FACE_TOKEN`   | Yes (for diarization jobs) | `hf_xxx`                                                 | Worker (in Docker stack)                   | Must have pyannote gated-model access                  |
| `WORKER_SHARED_SECRET` | Yes                        | random high-entropy string                               | Web callback verification + worker signing | Must match worker                                      |

### 2) Worker local `./worker/.env` variables

If running worker directly outside Docker:

```bash
cp worker/.example.env worker/.env
```

| Variable               | Required              | Example                                                       | Notes                                   |
| ---------------------- | --------------------- | ------------------------------------------------------------- | --------------------------------------- |
| `REDIS_URL`            | Yes                   | `redis://:password@localhost:6379`                            | Must point to same queue Redis as web   |
| `BACKEND_CALLBACK_URL` | Yes                   | `http://localhost:3000/api/transcribe-upload/worker-callback` | Worker sends final status/results here  |
| `WORKER_SHARED_SECRET` | Yes                   | same as root `.env`                                           | Must match web exactly                  |
| `HUGGING_FACE_TOKEN`   | Yes (for diarization) | `hf_xxx`                                                      | Same token with accepted pyannote terms |
| `DEVICE`               | Yes                   | `cuda` or `cpu`                                               | Use `cpu` if no GPU                     |

---

## Get external credentials

## 1) Better Auth secret

Generate a strong secret:

```bash
openssl rand -hex 32
```

Set this as `BETTER_AUTH_SECRET`.

## 2) Resend API key (email)

1. Create account at <https://resend.com>
2. Create an API key
3. (Production) verify your sender domain
4. Set `RESEND_API_KEY`

## 3) Hugging Face token + pyannote access (critical for diarization)

The worker can transcribe without diarization, but **speaker diarization requires gated pyannote models**.

### Step-by-step

1. Create/sign in at <https://huggingface.co>
2. Open **Settings → Access Tokens**
3. Create a token with at least **Read** scope
4. Accept model terms on these pages **while logged in**:
   - <https://huggingface.co/pyannote/segmentation-3.0>
   - <https://huggingface.co/pyannote/speaker-diarization-3.1>
5. Put token into:
   - root `.env` as `HUGGING_FACE_TOKEN` (for Docker stack)
   - `worker/.env` as `HUGGING_FACE_TOKEN` (for local worker)

### How to verify your token access quickly

After starting worker, run a diarized transcription job. If access is missing, you will typically see errors about unauthorized/gated model access in worker logs.

## 4) Google OAuth (optional)

Only required for "Sign in with Google".

1. Go to <https://console.cloud.google.com>
2. Create/select project
3. Configure OAuth consent screen
4. Create OAuth Client ID (Web application)
5. Add redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 5) S3-compatible storage credentials

### Local (default): MinIO via Docker

`docker-compose.yml` already starts MinIO and creates bucket. Use credentials matching your compose/env setup.

### Production: AWS S3/MinIO/Garage

Use real provider credentials and endpoint/region/bucket values.

---

## Method A — Local development (recommended for coding)

This gives best dev UX: hot reload for web + direct Python worker process.

### A1) Clone and install web deps

```bash
git clone https://github.com/mirxtreme/skriptor.git
cd skriptor
bun install
```

### A2) Configure env files

```bash
cp .example.env .env
cp worker/.example.env worker/.env
```

Then edit both files.

Minimum consistency checks:

- `WORKER_SHARED_SECRET` must be identical in both files
- Web/worker Redis URLs must target same Redis instance
- `BACKEND_CALLBACK_URL` should point to web callback endpoint

### A3) Start infrastructure only (db, redis, minio)

```bash
docker compose up -d
```

Services started by this file:

- Postgres (`localhost:5432`)
- Redis (`localhost:6379`, password-protected)
- MinIO API (`localhost:9000`) + Console (`localhost:9001`)

### A4) Run database migrations

```bash
bun run db:generate
bun run db:migrate
```

### A5) Start web app

```bash
bun run dev
```

Web URL: <http://localhost:3000>

### A6) Start worker (new terminal)

```bash
cd worker
uv sync --index-strategy unsafe-best-match
python3 -m worker.main
```

If you do **not** have GPU:

- set `DEVICE=cpu` in `worker/.env`

---

## Method B — Full Docker stack (production-like)

Use this when you want everything containerized (web + worker + infra).

### B1) Prepare root `.env`

```bash
cp .example.env .env
```

Fill all values, especially:

- `WORKER_SHARED_SECRET`
- `HUGGING_FACE_TOKEN`
- `S3_*`
- `DATABASE_URL`
- `REDIS_URL`

### B2) Start full stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### B3) Open app

- <http://localhost:3000>

### B4) Monitor logs

```bash
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f worker
```

### GPU note

`docker-compose.prod.yml` requests NVIDIA GPU for worker. Ensure NVIDIA runtime/toolkit is correctly installed on the host.

---

## Validation checklist

After setup, verify in this order:

1. **Web boots**
   - Open <http://localhost:3000>
2. **DB reachable**
   - No startup DB connection errors in web logs
3. **Redis reachable**
   - No BullMQ/ioredis connection errors
4. **S3 storage works**
   - Upload attempt does not fail with auth/bucket errors
5. **Worker connected**
   - Worker logs show it is listening on transcription queue
6. **Callback auth works**
   - Worker completion callbacks are accepted (no shared-secret mismatch)
7. **Diarization works**
   - Submit diarized job and confirm no Hugging Face/pyannote access errors

---

## Troubleshooting

### `Missing required environment variables: WORKER_SHARED_SECRET, HUGGING_FACE_TOKEN`

Set these in worker env context:

- local worker: `worker/.env`
- docker worker: root `.env` used by compose

### Worker cannot call back web (`401/403` or signature errors)

- Ensure `WORKER_SHARED_SECRET` values are identical in web and worker envs
- Verify `BACKEND_CALLBACK_URL` is correct and reachable from worker runtime

### Redis auth failures

Check password in `REDIS_URL` matches the Redis server config in compose.

### Hugging Face diarization access denied

Most common root cause: token exists but pyannote terms were not accepted.

Re-check and accept terms on:

- <https://huggingface.co/pyannote/segmentation-3.0>
- <https://huggingface.co/pyannote/speaker-diarization-3.1>

### MinIO/S3 errors (`NoSuchBucket`, signature mismatch)

- Confirm bucket exists (`skriptor-bucket` in local compose)
- Confirm `S3_ENDPOINT`, access key, secret key, bucket, region
- For MinIO/local S3-compatible targets, set `S3_FORCE_PATH_STYLE=true`

### No GPU available

- Local worker: set `DEVICE=cpu`
- Docker worker: remove/adjust GPU reservation or provide proper NVIDIA runtime

---

## Benchmarking

Inside `worker/`:

```bash
python3 benchmark/benchmark.py
streamlit run benchmark/dashboard.py
```

Benchmark image is also available via `worker/Dockerfile.benchmark`.

---

## License

MIT
