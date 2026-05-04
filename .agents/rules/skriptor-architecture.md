---
trigger: always_on
---

# Skriptor — Architecture & Contracts

> Core stack, directory structure, DB schema, and dev commands → `skriptor.md`

---

## Rendering & Caching Strategy

Skriptor leverages **Next.js 16 Partial Prerendering (PPR)** and the **Cache Components** model.

### Partial Prerendering (PPR)
- **Static Shell**: Navigation, footers, and static marketing content are prerendered at build time.
- **Dynamic Holes**: User-specific data (transcription lists, active job progress) are streamed into `<Suspense>` boundaries.
- **Benefits**: Immediate TTFB (Time to First Byte) and improved SEO with a fast-loading static shell.

### Caching Model
- **`use cache` Directive**: Used in Server Components/Functions to cache expensive computations or data fetching results with granular control.
- **`<Cache>` Component**: Used for declarative caching of JSX chunks.
- **Asynchronous Context**: `params` and `searchParams` must always be `await`-ed in Page and Layout components.

---

## System Data Flow

```
Browser
  │  POST /api/transcribe-upload (multipart)
  ▼
Next.js Route Handler (Dynamic)
  ├─ Zod validate
  ├─ Auth check (better-auth session)
  ├─ Upload audio → S3 (AWS SDK v3, PutObjectCommand)
  ├─ INSERT transcriptions row (status=queued)
  └─ Enqueue BullMQ job → Redis
         │
         ▼ (BLPOP / BullMQ worker)
   Python Worker
     ├─ GET audio via presigned S3 URL
     ├─ Run WhisperX (transcribe + align + diarize)
     ├─ PUBLISH progress → Redis Pub/Sub
     └─ POST /api/transcribe-upload/worker-callback (HMAC signed)
              │
              ▼
         Next.js Callback Handler
           ├─ Verify HMAC signature
           ├─ INSERT segments rows
           ├─ UPDATE transcriptions (status=completed)
           └─ DEL Redis progress keys

Browser (PPR - Static Shell + Dynamic Holes)
  ├─ Static Shell (Navigation, Layout)
  ├─ Dynamic Holes (Streaming Transcription Data, Progress)
  │    └─ GET /api/transcription/[id]/sse
  └─ Receives Redis Pub/Sub events until status=completed|error
```

---

## API Conventions

### Response Shape
All route handlers return consistent JSON:
```ts
// Success
NextResponse.json({ success: true, data?: ... })

// Error
NextResponse.json({ success: false, error: string | ZodFlatError }, { status: 400|401|403|404|500 })
```

Status codes:
- `400` — validation error (include Zod `flatten()` output)
- `401` — not authenticated
- `403` — authenticated but not authorized (e.g., accessing another user's resource)
- `404` — resource not found
- `500` — unexpected server error (log to console, never expose internals)

### Page / Layout Auth Pattern
In Next.js 16, `params` and `searchParams` are asynchronous.

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.id) redirect("/sign-in");
  // ...
}
```

### Ownership Check
Always verify the requested resource belongs to the authenticated user. Use `await params` before accessing properties.

```ts
const { id } = await params;
const record = await db.query.transcriptions.findFirst({
  where: and(eq(transcriptions.id, id), eq(transcriptions.userId, session.user.id)),
});
if (!record) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
```

---

## Object Storage (S3)

### Client — `src/lib/storage.ts`
The single source of truth for all S3 operations. Instantiated once; use it everywhere.

```ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // required for MinIO and Garage
});

export const S3_BUCKET = process.env.S3_BUCKET!;
```

Export additional helpers from the same file:
- `uploadAudio(buffer, key, contentType)` — wraps `PutObjectCommand`
- `getPresignedUrl(key, expiresIn?)` — wraps `@aws-sdk/s3-request-presigner` `getSignedUrl`, default `expiresIn = 3600`

### Object Key Format
```
{userId}-{uuid}-{sanitizedTitle}.{ext}
```
- Sanitize title: replace spaces/special chars with `_`
- `ext` derived from `File.type` (e.g. `audio/mpeg` → `mp3`)
- `audioUrl` in the DB stores **only the key**, never a full URL
- Generate presigned URL on demand at `GET /api/transcription/[id]/audio`

### Presigned URL Endpoint
`GET /api/transcription/[id]/audio`
- Auth-guarded + ownership check
- Generates a presigned GET URL with 1-hour TTL
- Returns `{ success: true, url: "https://..." }`
- Client uses this URL directly for audio playback (no proxying through Next.js)

---

## Queue (BullMQ)

### Setup — `src/lib/queue.ts`
```ts
import { Queue } from "bullmq";
import { redis } from "./redis";

export const transcriptionQueue = new Queue("transcription", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});
```

### Job Payload
```ts
interface TranscriptionJobPayload {
  transcriptionId: string;  // UUID
  filename: string;          // S3 object key
  language: string;          // e.g. "en", "id", "default"
  model: "small" | "medium" | "large";
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
}
```

### Enqueueing (in the upload route handler)
```ts
await transcriptionQueue.add("transcribe", payload, {
  jobId: transcriptionId, // idempotent — prevents duplicate jobs
});
```

### Python Worker Consumption
The Python worker uses `bullmq` Python package (`pip install bullmq`) or compatible BullMQ-Redis protocol to `BLPOP` from the queue. The job data JSON matches `TranscriptionJobPayload` above.

> `isSpeakerDiarized` is sent as **boolean** (not string) — the Python `bullmq` package handles JSON deserialization correctly.

---

## Worker Callback Security

`POST /api/transcribe-upload/worker-callback`

### HMAC Verification
- Header `x-worker-timestamp`: Unix timestamp in seconds
- Header `x-worker-signature`: `sha256=<hmac(WORKER_SHARED_SECRET, timestamp + "." + rawBody)>`
- Server rejects: missing headers, timestamp drift > 120s, signature mismatch
- Constant-time comparison via `crypto.timingSafeEqual`
- **Never skip or bypass** — not even in development

### Callback Payload (Worker → Server)
```ts
{
  transcriptionId: string;     // UUID
  status: "completed" | "failed";
  summary?: string | null;
  metadata?: {
    durationSeconds?: number;
    model?: "small" | "medium" | "large";
    originalFilename?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  segments?: Array<{
    speaker?: string | null;    // e.g. "SPEAKER_00"
    text: string;
    startTimeMs: number;        // integer milliseconds
    endTimeMs: number;          // integer milliseconds
  }>;
}
```

### Callback Handler Behavior
1. Verify HMAC
2. Zod-validate body
3. If `status === "failed"`: update `transcriptions.status = "failed"`, delete Redis progress keys
4. If `status === "completed"`: batch-insert segments, update transcription status + summary + metadata, delete Redis progress keys
5. Always return `200` after successful processing (worker does not retry on `2xx`)

---

## Real-Time (SSE)

### Endpoint
`GET /api/transcription/[id]/sse`
- Must declare `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`

### Flow
1. On connect: read `transcription:progress:<id>:last` from Redis and send as initial event (reconnect support)
2. Create a **dedicated** Redis subscriber (`redis.duplicate()`) — do not reuse the shared singleton for subscriptions
3. Subscribe to `transcription:progress:<id>` channel
4. Relay each message as `data: <json>\n\n`
5. On `status === "completed"` or `status === "error"`: delay 1s → unsubscribe → `controller.close()`
6. On client disconnect (`request.signal` abort): unsubscribe → quit subscriber → close stream

### Progress Event Shape (Worker → Redis Pub/Sub)
```json
{
  "id": "<transcriptionId>",
  "status": "processing | completed | error",
  "progress": 0,
  "message": "Transcribing audio..."
}
```

### Client-Side Usage
- Open `EventSource` to `/api/transcription/[id]/sse`
- Update Zustand store with progress/status on each message
- Close `EventSource` when `status === "completed"` or `status === "error"`
- On `completed`: invalidate TanStack Query cache for this transcription to fetch final data

---

## Redis Key Conventions

| Key | Type | Purpose |
|---|---|---|
| `bull:transcription:*` | BullMQ internal | Job queue state (managed by BullMQ) |
| `transcription:progress:<id>` | Pub/Sub channel | Live progress from worker |
| `transcription:progress:<id>:last` | String | Cached last progress event (for SSE reconnect) |
| `transcription:status:<id>` | String | Final status cache (optional) |

**Cleanup**: Delete `transcription:progress:<id>:last` after callback completion/failure.

---

## Worker Contract Summary

### Technology
- **WhisperX** for transcription + forced alignment + speaker diarization
- Model mapping: `small → whisper-small`, `medium → whisper-medium`, `large → whisper-large-v3`
- Device: auto-detect CUDA, fall back to CPU
- Diarization requires `HuggingFace` token (`HUGGING_FACE_TOKEN` env var)

### Worker Environment Variables
```
REDIS_URL=redis://localhost:6379
BACKEND_CALLBACK_URL=https://<app-domain>/api/transcribe-upload/worker-callback
WORKER_SHARED_SECRET=<same as server>
HUGGING_FACE_TOKEN=<hf token>
DEVICE=cuda  # or cpu
```

### Worker Lifecycle Per Job
1. Dequeue job from BullMQ (`transcription` queue)
2. Generate presigned GET URL for `filename` via `GET /api/transcription/<id>/audio` OR use a pre-included signed URL in job payload
3. Download audio
4. Publish progress events to Redis Pub/Sub at key milestones (0%, 25%, 50%, 75%, 100%)
5. POST callback with results (HMAC signed)
6. Acknowledge BullMQ job as complete

> **Presigned URL strategy**: Prefer including a short-lived (1h) presigned URL in the BullMQ job payload at enqueue time, avoiding a separate API call from the worker.

---

## Segment Persistence API

`PATCH /api/transcription/[id]/segments`

Used by the frontend "Save Changes" button in `TranscriptionView`.

```ts
// Request body
{
  segments: Array<{
    id: string;     // segment UUID
    text: string;   // edited text
    speaker?: string | null;
  }>
}
// Response
{ success: true }
```

Auth-guarded. Verify transcription ownership before updating. Use Drizzle batch update.

---

## Transcription List API

`GET /api/transcriptions`

Returns all transcriptions for the authenticated user ordered by `createdAt desc`.

```ts
// Response
{ success: true, data: TranscriptionListItem[] }
```

Auth-guarded. No body. Used by `useTranscriptionList()` TanStack Query hook.

---

## Transcription Detail API

`GET /api/transcription/[id]`

Returns a single transcription with its segments for the authenticated user.

```ts
// Response
{ success: true, data: { ...transcription, segments: TranscriptionSegment[] } }
```

Auth-guarded + ownership check. Segments ordered by `startTime asc`. Used by `useTranscription(id)` TanStack Query hook.

---
