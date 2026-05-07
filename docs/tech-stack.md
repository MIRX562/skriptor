# Skriptor — Tech Stack

This document provides a comprehensive overview of the technologies and libraries used in Skriptor, categorized by their role in the system.

## 1. Frontend & Backend (Next.js Application)

The main application is a full-stack Next.js project leveraging the latest features of React 19 and Next.js 16.

### Core Framework & Runtime
| Library | Purpose |
|---|---|
| **Next.js 16** | Core framework using App Router, Turbopack, and Partial Prerendering (PPR). |
| **React 19** | UI library utilizing the new `use()` hook and asynchronous context patterns. |
| **Bun** | High-performance JavaScript runtime and package manager. |
| **TypeScript** | Static typing for end-to-end type safety. |

### State Management & Data Fetching
| Library | Purpose |
|---|---|
| **TanStack Query v5** | Server state management, caching, and synchronization with API routes. |
| **Zustand v5** | Lightweight client-side store for UI state and ephemeral data. |
| **React Hook Form** | Performant, flexible, and extensible forms with easy validation. |
| **Zod** | TypeScript-first schema declaration and validation (used for forms and API validation). |

### UI & Styling
| Library | Purpose |
|---|---|
| **Tailwind CSS v4** | Utility-first CSS framework for modern, responsive designs. |
| **shadcn/ui** | Accessible and customizable UI components built on Radix UI. |
| **Radix UI** | Unstyled, accessible primitives for high-quality design systems. |
| **Framer Motion** | Powerful animation library for smooth UI transitions and micro-interactions. |
| **Lucide React** | Beautifully simple, pixel-perfect icons. |
| **Wavesurfer.js** | Interactive navigable audio visualization. |
| **Sonner** | Clean and responsive toast notifications. |
| **Next Themes** | Robust dark mode support for Next.js. |

### Authentication & Security
| Library | Purpose |
|---|---|
| **Better Auth v1** | Modern authentication framework supporting Email/Password and Google OAuth. |
| **Jose / Web Crypto** | Used for HMAC signing of worker callbacks and secure token handling. |

### Data Persistence (ORM)
| Library | Purpose |
|---|---|
| **Drizzle ORM** | Type-safe TypeScript ORM for PostgreSQL. |
| **Drizzle Kit** | CLI for database migrations and schema management. |
| **pg** | PostgreSQL client for Node.js. |

### Export & Document Processing
| Library | Purpose |
|---|---|
| **docx** | Programmatic generation of `.docx` files. |
| **jspdf / jspdf-autotable** | Client-side PDF generation for transcripts. |
| **xlsx** | Spreadsheet processing for CSV/Excel exports. |
| **File Saver / Papaparse** | Utilities for file downloads and CSV parsing. |

---

## 2. AI Transcription Worker (Python)

A distributed worker system responsible for heavy AI processing, written in Python for optimal model performance.

### Processing Engine
| Library | Purpose |
|---|---|
| **WhisperX** | Advanced transcription with word-level alignment and speaker diarization. |
| **PyTorch** | Deep learning framework powering the Whisper models. |
| **Numpy** | Numerical processing for audio signal data. |
| **FFmpeg** | System-level dependency for audio format conversion and processing. |

### Communication & Integration
| Library | Purpose |
|---|---|
| **BullMQ (Python)** | Python implementation of the BullMQ protocol for job consumption. |
| **Redis (python-redis)** | Client for Redis communication (Pub/Sub and storage). |
| **Requests** | HTTP client for sending HMAC-signed callbacks to the backend. |
| **Python Dotenv** | Loading environment variables for configuration. |

---

## 3. Infrastructure & Services

The backing services that power Skriptor's data, messaging, and storage layers.

### Storage & Database
| Service / Tool | Purpose |
|---|---|
| **PostgreSQL** | Primary relational database for users, transcriptions, and segments. |
| **Redis** | High-speed data store used for BullMQ queues and real-time SSE progress events. |
| **S3-Compatible Storage** | Object storage (MinIO for dev, Garage for prod) for audio files. |
| **AWS SDK v3 (S3)** | Standard client for interacting with S3-compatible storage. |

### Messaging & Communication
| Service | Purpose |
|---|---|
| **Resend** | Transactional email service for verification and password resets. |
| **React Email** | Component-based email template authoring. |
| **Server-Sent Events (SSE)** | Native real-time streaming for transcription progress updates. |

### DevOps & Deployment
| Tool | Purpose |
|---|---|
| **Docker / Docker Compose** | Containerization for consistent development and production environments. |
| **Cloudflare Tunnel** | Securely exposing the application to the internet. |
| **NVIDIA Container Toolkit** | Enabling GPU acceleration for the AI worker. |
