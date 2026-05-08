# 🚀 Panduan Template RunPod - Skriptor

Dokumen ini menjelaskan konfigurasi yang direkomendasikan untuk menjalankan **Skriptor Worker** dan **Benchmarking Suite** di RunPod.

---

## 🏗️ 1. Skriptor Worker (Production)

Gunakan template ini untuk memproses tugas transkripsi asli dari antrian Redis.

### General Settings
*   **Template Name**: `skriptor-worker`
*   **Container Image**: `mirxtreme/skriptor-worker:latest`
*   **Docker Registry**: Docker Hub (Public)
*   **Resource Type**: GPU Pod

### Container & Volume Disk
*   **Container Disk**: **20 GB**
    *   *Alasan*: Image dasar (~5GB) + ruang untuk mengunduh model Whisper secara dinamis (~10GB untuk semua ukuran) + OS temp files.
*   **Volume Disk**: **10 GB** (Opsional)
    *   *Saran*: Pasang (mount) ke `/root/.cache/huggingface` atau direktori model whisper untuk persistensi jika Anda sering mematikan/menyalakan Pod.

### Environment Variables
| Variable | Value | Description |
|:---|:---|:---|
| `REDIS_URL` | `redis://your-ip:6379` | URL server Redis Skriptor |
| `WORKER_SHARED_SECRET` | `your-secret-key` | Harus sama dengan yang ada di server Next.js |
| `HUGGING_FACE_TOKEN` | `hf_xxxxxx` | Diperlukan untuk modul Diarization (pyannote) |
| `S3_ENDPOINT` | `https://s3.your-storage.com` | Endpoint MinIO/Garage |
| `S3_ACCESS_KEY` | `your-access-key` | |
| `S3_SECRET_KEY` | `your-secret-key` | |
| `S3_BUCKET` | `skriptor` | |

---

## 📊 2. Skriptor Benchmark (Performance Testing)

Gunakan template ini untuk menjalankan pengujian akurasi (WER/CER) dan kecepatan (RTF) pada berbagai ukuran model.

### General Settings
*   **Template Name**: `skriptor-benchmark`
*   **Container Image**: `mirxtreme/skriptor-benchmark:latest`
*   **Resource Type**: GPU Pod (Direkomendasikan: RTX 3090, A6000, atau L4 untuk VRAM > 12GB)

### Container & Volume Disk
*   **Container Disk**: **30 GB**
    *   *Alasan*: Image benchmark lebih besar karena mengandung dataset audio lokal. Dibutuhkan ruang ekstra untuk memuat semua model (tiny s/d large-v3) secara bergantian.
*   **Volume Disk**: **5 GB** (Opsional)

### Environment Variables
| Variable | Value | Description |
|:---|:---|:---|
| `HUGGING_FACE_TOKEN` | `hf_xxxxxx` | Diperlukan jika Anda mengaktifkan pengujian Diarization |

### Port Settings
| Port | Protocol | Description |
|:---|:---|:---|
| `8501` | HTTP | Port default Streamlit Dashboard |

---

## 💡 Rekomendasi Hardware (GPU)

Berdasarkan ukuran model yang akan dijalankan:

| Model | Min. VRAM | Rekomendasi GPU RunPod |
|:---|:---|:---|
| **Tiny / Base** | 1 GB | Tesla T4, A4000 (Paling murah) |
| **Small / Medium** | 2 - 5 GB | RTX 3070, RTX 4000 |
| **Large-v3** | 10 GB | **RTX 3090, RTX 4090, A6000** |
| **Turbo** | 6 GB | RTX 3080, A5000 |

> [!IMPORTANT]
> Untuk menjalankan **Benchmark Suite** lengkap (termasuk `large-v3`), pilih GPU dengan **VRAM minimal 16GB** (seperti RTX 3090) untuk menghindari error *Out of Memory (OOM)* saat proses diarization dan transkripsi model besar dilakukan secara bersamaan.

---

## 🛠️ Cara Menjalankan Dashboard Setelah Pod Aktif
1.  Buka tab **Connect** di RunPod.
2.  Gunakan **HTTP Service** pada port `8501`.
3.  Jika Anda ingin melihat dashboard secara interaktif, jalankan perintah ini di terminal Pod:
    ```bash
    streamlit run benchmark/dashboard.py --server.port 8501
    ```
