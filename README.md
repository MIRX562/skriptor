# Skriptor — Audio Transcription SaaS

Skriptor is a modern audio transcription service built with Next.js, Drizzle ORM, and a distributed Python worker for high-performance AI transcription.

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Cache/Queue**: Redis & BullMQ
- **Storage**: S3-compatible (Garage)
- **Worker**: Python + WhisperX
- **Auth**: Better-Auth

## Getting Started

### 1. Prerequisites

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Environment Setup

Copy the example environment file:
```bash
cp .example.env .env
```
Update the `.env` file with your specific configurations.

### 3. Database Setup

```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

### 4. Running the Web Stack (Docker)

```bash
docker compose up -d
```

### 5. Initializing Garage (S3 Storage)

After starting the containers for the first time, you must initialize the Garage cluster layout:

1. **Get the Node ID**:
   ```bash
   docker exec skriptor-garage garage node id
   ```
2. **Assign the node to a zone** (replace `<NODE_ID>`):
   ```bash
   docker exec skriptor-garage garage layout assign <NODE_ID> -z dc1 -c 10G
   ```
3. **Apply the layout**:
   ```bash
   docker exec skriptor-garage garage layout apply --version 1
   ```
4. **Create a bucket and keys**:
   Refer to the [Garage Documentation](https://garagehq.deuxfleurs.fr/documentation/quick-start/) to create your bucket and access keys.

### 6. Running the Worker

The worker is deployed separately. Refer to [worker/README.md](worker/README.md) for instructions.

## License

MIT
