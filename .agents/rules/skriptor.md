---
trigger: always_on
---

# Skriptor — Core Project Rules

**Skriptor** is an Audio Transcription SaaS. Users upload audio files → queued asynchronously → processed by a distributed Python AI worker (WhisperX) → results returned via HMAC-signed HTTP callback → surfaced in real-time via SSE.

> See `skriptor-architecture.md` for API contracts, worker protocol, data flow, and the refactor roadmap.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime / Package Manager | **Bun** — never use `npm`, `yarn`, or `pnpm` |
| Frontend / Backend | **Next.js 15** (App Router, Turbopack) |
| Language | **TypeScript** (strict) |
| UI Components | **shadcn/ui** + **Radix UI** primitives |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) |
| Animation | **Framer Motion** |
| Auth | **better-auth** v1 — email/password + Google OAuth, Redis secondary storage |
| ORM | **Drizzle ORM** (PostgreSQL dialect) |
| Database | **PostgreSQL** |
| Queue | **BullMQ** on top of **ioredis** — key prefix `transcription` |
| Object Storage | S3-compatible (MinIO → Garage) via **AWS SDK v3** `@aws-sdk/client-s3` |
| Email | **Resend** + `@react-email/components` templates |
| Python Worker | **WhisperX** — communicates via BullMQ + HTTP callback |
| Real-time | **SSE** via Redis Pub/Sub (`ioredis`) |
| State Management | **Zustand** v5 (client/UI) + **TanStack Query** v5 (server state) |
| Form Handling | **React Hook Form** + **Zod** |

---

## Directory Structure

```
src/
├── app/
│   ├── (auth)/                     # sign-in, sign-up, reset/forget password
│   ├── (landing)/                  # public pages (ToS, etc.)
│   ├── api/
│   │   ├── auth/                   # better-auth catch-all handler
│   │   ├── transcriptions/
│   │   │   └── route.ts            # GET: list authenticated user's transcriptions
│   │   ├── transcribe-upload/
│   │   │   ├── route.ts            # POST: validate → upload → enqueue
│   │   │   └── worker-callback/
│   │   │       └── route.ts        # POST: HMAC-verified result ingestion
│   │   └── transcription/[id]/
│   │       ├── route.ts            # GET: single transcription with segments; DELETE
│   │       ├── sse/route.ts        # GET: SSE progress stream
│   │       ├── audio/route.ts      # GET: return presigned audio URL
│   │       └── segments/route.ts   # PATCH: persist edited segments
│   ├── dashboard/                  # protected: transcription list
│   └── settings/                   # protected: user settings
├── components/
│   └── ui/                         # shadcn/ui — DO NOT hand-edit
├── db/
│   ├── index.ts                    # Drizzle db instance
│   └── schema/
│       ├── index.ts                # re-exports all schemas
│       ├── users.ts                # better-auth tables (do not modify)
│       ├── transcriptions.ts       # transcriptions + status/model enums
│       ├── segments.ts             # transcript segments
│       └── settings.ts             # user_settings
├── features/
│   ├── auth/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── sign-in/
│   ├── sign-out/
│   ├── sign-up/
│   ├── verify-email/
│   ├── landing/
│   ├── setting/
│   ├── transcibe-upload/           # ⚠ intentional typo — do NOT rename
│   │   ├── const/                  # supported-languages.ts
│   │   ├── schema/                 # Zod upload schema
│   │   ├── server/                 # legacy dead code — upload handled by API route
│   │   ├── store/                  # upload UI Zustand store
│   │   └── ui/                     # upload form, record form, speed selector
│   └── transcribe-manage/
│       ├── model/                  # TanStack Query hooks: use-transcription-list,
│       │                           # use-transcription, use-delete-transcription,
│       │                           # use-save-segments
│       ├── store/                  # transcription-list-store (search UI only),
│       │                           # transcription-view-store (editor UI state)
│       └── ui/                     # TranscriptionView, list, audio player
├── hooks/                          # shared custom hooks
├── lib/
│   ├── auth.ts                     # better-auth server instance
│   ├── auth-client.ts              # better-auth browser client
│   ├── storage.ts                  # S3Client factory + upload/presign helpers [TARGET]
│   ├── minio.ts                    # legacy MinIO SDK client — do not use in new code
│   ├── queue.ts                    # BullMQ queue singleton [TARGET]
│   ├── redis.ts                    # IORedis singleton (used by BullMQ + SSE pub/sub)
│   ├── email.ts                    # Resend helper
│   ├── audio-utils.ts              # audio processing utilities
│   └── utils.ts                    # cn(), formatDate(), formatSrtTime(), formatTime(), formatTimeMMSS()
├── middleware.ts                   # route protection
└── store/
    ├── auth-store.ts
    └── ui-store.ts
```

---

## Database Schema

### Tables Overview
| Table | Owner | Notes |
|---|---|---|
| `user`, `session`, `account`, `verification` | better-auth | Do NOT modify manually |
| `transcriptions` | App | Job + result record |
| `segments` | App | One row per transcript segment |
| `user_settings` | App | One row per user (unique on `user_id`) |

### `transcriptions` Key Fields
- `status`: `queued | processing | completed | failed`
- `model`: `small | medium | large` (WhisperX model size)
- `audioUrl`: S3 object key only — never a full URL
- `metadata`: JSONB (filename, type, size, duration in seconds)
- `isSpeakerDiarized`: boolean
- `numberOfSpeaker`: integer

### `segments` Key Fields
- `startTime` / `endTime`: **integers in milliseconds** — never seconds or floats
- `speaker`: nullable text

### Drizzle Conventions
- Define all relations explicitly with `relations()` from `drizzle-orm`
- Schema entry point: `src/db/schema/index.ts` (re-export everything from here)
- Import DB instance as `import { db } from "@/db"`
- Always use `.returning()` when you need the inserted/updated row
- Always use `eq()`, `and()`, `asc()`, `desc()` — never raw SQL strings
- Run migrations: `bunx drizzle-kit generate` → `bunx drizzle-kit migrate`

---

## Environment Variables

Documented in `.example.env`. Never commit `.env`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `BETTER_AUTH_SECRET` | Auth signing secret |
| `BETTER_AUTH_URL` | App base URL (e.g. `https://skriptor.example.com`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `RESEND_API_KEY` | Email delivery |
| `HUGGING_FACE_TOKEN` | HuggingFace — required for speaker diarization |
| `WORKER_SHARED_SECRET` | HMAC secret shared between Next.js and the Python worker |
| `S3_ENDPOINT` | S3-compatible endpoint URL (MinIO or Garage) |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | S3 credentials |
| `S3_BUCKET` | Bucket name |
| `S3_REGION` | Region (use `us-east-1` as default for MinIO/Garage) |

> **Migration note**: env vars are being renamed from `MINIO_*` to `S3_*` for storage-agnosticism. Update `.example.env` accordingly.

---

## Frontend Conventions

### Feature-Sliced Architecture
Each feature in `src/features/<name>/` follows this internal structure:
- `ui/` — React components (client or server)
- `model/` — TanStack Query hooks (`useQuery`, `useMutation`) that call API routes — **no `"use server"`**
- `store/` — Zustand slice for UI/ephemeral state only (never server-derived data)
- `schema/` — Zod validation schemas
- `const/` — static constants

> **No server actions** — all data fetching and mutations go through API routes called from TanStack Query hooks.

Shared cross-feature components live in `src/components/` (not `ui/`).

### Naming
- Filenames: `kebab-case.tsx`
- Exports: `PascalCase` (e.g. `export function TranscriptionView`)
- Stores: `use<Feature>Store` hook name
- API routes: follow Next.js App Router file convention

### State Ownership
| Data Type | Tool |
|---|---|
| Remote / server state | TanStack Query (`useQuery`, `useMutation`) |
| Local UI / ephemeral state | Zustand |
| Form state | React Hook Form + Zod |
| Never | `useState` for server-derived data |

### Styling
- Tailwind CSS v4 utilities
- Brand: **teal** — `teal-600` (light mode), `teal-400` (dark mode)
- `cn()` from `@/lib/utils` for conditional class merging
- Dark/light theme via `next-themes` + CSS variables (shadcn pattern)
- Fonts: **Geist Sans** + **Geist Mono** from `next/font/google`
- Toasts: `sonner` via `<Toaster position="bottom-center" richColors />`

### Audio Time Units
- **All time values in DB and on the wire: milliseconds (integer)**
- `formatTime(ms)` → `MM:SS.mmm`
- `formatTimeMMSS(ms)` → `MM:SS`
- `formatSrtTime(ms)` → `HH:MM:SS,mmm` (SRT format)
- All three are in `src/lib/utils.ts`

### Upload Constraints
- Max file size: **50 MB**
- Accepted: `audio/*` → `.mp3`, `.m4a`, `.wav`, `.flac`
- Route handler body limit: **500 MB** (`next.config.ts`)

---

## Auth & Middleware

- Protected routes: `/dashboard`, `/profile`, `/settings` → redirect to `/sign-in` if no session
- Auth routes (`/sign-in`, `/sign-up`) → redirect to `/dashboard` if session exists
- Middleware uses `getSessionCookie()` from `better-auth/cookies` — no DB calls in middleware
- `requireEmailVerification: true` enforced by better-auth
- Google OAuth redirect: `${BETTER_AUTH_URL}/api/auth/callback/google`
- Rate limit: 5 requests / 5-second window (better-auth built-in)

### Server-Side Auth Pattern
```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) throw new Error("Unauthorized");
```

---

## Development Commands

```bash
bun run dev              # start dev server (Turbopack)
bun run build            # production build
bun run lint             # ESLint

bunx drizzle-kit generate   # generate migration from schema changes
bunx drizzle-kit migrate    # apply pending migrations
```