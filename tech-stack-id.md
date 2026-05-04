# Skriptor — Tech Stack (Bahasa Indonesia)

Dokumen ini memberikan tinjauan komprehensif tentang teknologi dan pustaka (library) yang digunakan dalam Skriptor, dikategorikan berdasarkan perannya dalam sistem.

## 1. Frontend & Backend (Aplikasi Next.js)

Aplikasi utama adalah proyek Next.js full-stack yang memanfaatkan fitur terbaru dari React 19 dan Next.js 16.

### Framework Utama & Runtime
| Library | Kegunaan |
|---|---|
| **Next.js 16** | Framework utama yang menggunakan App Router, Turbopack, dan Partial Prerendering (PPR). |
| **React 19** | Library UI yang memanfaatkan hook `use()` baru dan pola context asinkron. |
| **Bun** | Runtime JavaScript dan package manager berperforma tinggi. |
| **TypeScript** | Pengetikan statis untuk keamanan tipe ujung-ke-ujung (end-to-end). |

### Manajemen State & Pengambilan Data
| Library | Kegunaan |
|---|---|
| **TanStack Query v5** | Manajemen state server, caching, dan sinkronisasi dengan API route. |
| **Zustand v5** | Store sisi klien yang ringan untuk state UI dan data efemeral. |
| **React Hook Form** | Formulir yang performan, fleksibel, dan mudah diperluas dengan validasi yang mudah. |
| **Zod** | Deklarasi dan validasi skema berbasis TypeScript (digunakan untuk formulir dan validasi API). |

### UI & Gaya (Styling)
| Library | Kegunaan |
|---|---|
| **Tailwind CSS v4** | Framework CSS utility-first untuk desain modern dan responsif. |
| **shadcn/ui** | Komponen UI yang aksesibel dan dapat disesuaikan, dibangun di atas Radix UI. |
| **Radix UI** | Primitif tanpa gaya yang aksesibel untuk sistem desain berkualitas tinggi. |
| **Framer Motion** | Library animasi yang kuat untuk transisi UI yang mulus dan mikro-interaksi. |
| **Lucide React** | Ikon yang sederhana, indah, dan pixel-perfect. |
| **Wavesurfer.js** | Visualisasi audio interaktif yang dapat dinavigasi. |
| **Sonner** | Notifikasi toast yang bersih dan responsif. |
| **Next Themes** | Dukungan mode gelap yang kokoh untuk Next.js. |

### Autentikasi & Keamanan
| Library | Kegunaan |
|---|---|
| **Better Auth v1** | Framework autentikasi modern yang mendukung Email/Kata Sandi dan Google OAuth. |
| **Jose / Web Crypto** | Digunakan untuk penandatanganan HMAC pada callback worker dan penanganan token yang aman. |

### Persistensi Data (ORM)
| Library | Kegunaan |
|---|---|
| **Drizzle ORM** | ORM TypeScript yang type-safe untuk PostgreSQL. |
| **Drizzle Kit** | CLI untuk migrasi database dan manajemen skema. |
| **pg** | Klien PostgreSQL untuk Node.js. |

### Ekspor & Pemrosesan Dokumen
| Library | Kegunaan |
|---|---|
| **docx** | Pembuatan file `.docx` secara programatik. |
| **jspdf / jspdf-autotable** | Pembuatan PDF di sisi klien untuk transkrip. |
| **xlsx** | Pemrosesan spreadsheet untuk ekspor CSV/Excel. |
| **File Saver / Papaparse** | Utilitas untuk pengunduhan file dan parsing CSV. |

---

## 2. Worker Transkripsi AI (Python)

Sistem worker terdistribusi yang bertanggung jawab atas pemrosesan AI yang berat, ditulis dalam Python untuk performa model yang optimal.

### Mesin Pemrosesan (Processing Engine)
| Library | Kegunaan |
|---|---|
| **WhisperX** | Transkripsi tingkat lanjut dengan penyelarasan tingkat kata (word-level alignment) dan diarization pembicara. |
| **PyTorch** | Framework deep learning yang menggerakkan model Whisper. |
| **Numpy** | Pemrosesan numerik untuk data sinyal audio. |
| **FFmpeg** | Dependensi tingkat sistem untuk konversi dan pemrosesan format audio. |

### Komunikasi & Integrasi
| Library | Kegunaan |
|---|---|
| **BullMQ (Python)** | Implementasi protokol BullMQ dalam Python untuk konsumsi pekerjaan (job). |
| **Redis (python-redis)** | Klien untuk komunikasi Redis (Pub/Sub dan penyimpanan). |
| **Requests** | Klien HTTP untuk mengirim callback bertanda tangan HMAC ke backend. |
| **Python Dotenv** | Memuat variabel lingkungan untuk konfigurasi. |

---

## 3. Infrastruktur & Layanan

Layanan pendukung yang menggerakkan lapisan data, pesan, dan penyimpanan Skriptor.

### Penyimpanan & Database
| Layanan / Alat | Kegunaan |
|---|---|
| **PostgreSQL** | Database relasional utama untuk pengguna, transkripsi, dan segmen. |
| **Redis** | Penyimpanan data berkecepatan tinggi yang digunakan untuk antrean BullMQ dan event progress SSE real-time. |
| **Penyimpanan Kompatibel S3** | Penyimpanan objek (MinIO untuk pengembangan, Garage untuk produksi) untuk file audio. |
| **AWS SDK v3 (S3)** | Klien standar untuk berinteraksi dengan penyimpanan yang kompatibel dengan S3. |

### Pesan & Komunikasi
| Layanan | Kegunaan |
|---|---|
| **Resend** | Layanan email transaksional untuk verifikasi dan pengaturan ulang kata sandi. |
| **React Email** | Pembuatan templat email berbasis komponen. |
| **Server-Sent Events (SSE)** | Streaming real-time bawaan untuk pembaruan progres transkripsi. |

### DevOps & Deployment
| Alat | Kegunaan |
|---|---|
| **Docker / Docker Compose** | Kontainerisasi untuk lingkungan pengembangan dan produksi yang konsisten. |
| **Cloudflare Tunnel** | Mengekspos aplikasi ke internet secara aman. |
| **NVIDIA Container Toolkit** | Mengaktifkan akselerasi GPU untuk worker AI. |
