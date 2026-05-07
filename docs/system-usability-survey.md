# 📝 Kuesioner System Usability Scale (SUS) - Skriptor

Dokumen ini berisi draf pertanyaan untuk survei kegunaan sistem (usability) Skriptor menggunakan standar SUS. Setiap pertanyaan menggunakan skala Likert 1-5 (Sangat Tidak Setuju ke Sangat Setuju).

---

## 📋 Daftar Pertanyaan

| No | Pertanyaan (Indonesian) | Alasan & Relevansi untuk Skriptor |
|:---|:---|:---|
| 1 | Saya merasa ingin menggunakan sistem Skriptor ini secara rutin. | Mengukur **daya tarik produk**. Penting untuk SaaS transkripsi di mana pengguna sering memiliki kebutuhan berkelanjutan (misal: jurnalis atau mahasiswa). |
| 2 | Saya merasa sistem ini terlalu rumit padahal bisa dibuat lebih sederhana. | Mengukur **kompleksitas antarmuka**. Skriptor harus terasa "langsung ke poin" (upload -> transkrip) tanpa fitur yang membingungkan. |
| 3 | Saya merasa sistem ini sangat mudah untuk digunakan. | Mengukur **kemudahan penggunaan (ease of use)**. Fokus pada alur unggah file dan kejelasan tombol navigasi. |
| 4 | Saya merasa membutuhkan bantuan teknisi untuk bisa menggunakan sistem ini. | Mengukur **kemandirian pengguna**. Sebagai alat produktivitas, pengguna harus bisa melakukan transkripsi tanpa bantuan admin atau tutorial teknis. |
| 5 | Saya merasa berbagai fitur di sistem ini terintegrasi dengan baik. | Mengukur **koherensi fitur**. Bagaimana alur dari dashboard, halaman upload, hingga halaman editor transkripsi terasa sebagai satu kesatuan. |
| 6 | Saya merasa ada banyak hal yang tidak konsisten pada sistem ini. | Mengukur **konsistensi desain**. Misalnya, apakah skema warna teal dan gaya tombol tetap sama di semua halaman. |
| 7 | Saya membayangkan orang lain akan belajar menggunakan sistem ini dengan sangat cepat. | Mengukur **learnability**. Penting untuk user onboarding. Apakah pengguna baru bisa langsung paham cara kerja sistem dalam hitungan detik. |
| 8 | Saya merasa sistem ini sangat membingungkan/sulit saat digunakan. | Mengukur **hambatan penggunaan (friction)**. Apakah proses menunggu transkripsi (SSE progress) atau mengedit teks terasa berat atau lambat. |
| 9 | Saya merasa sangat percaya diri saat menggunakan sistem ini. | Mengukur **kepercayaan diri pengguna**. Apakah pengguna merasa "aman" saat mengunggah file besar dan yakin data mereka akan diproses dengan benar. |
| 10 | Saya perlu mempelajari banyak hal terlebih dahulu sebelum bisa menggunakan sistem ini. | Mengukur **ambang batas pengetahuan**. Idealnya, Skriptor tidak membutuhkan pengetahuan khusus tentang AI/Whisper untuk bisa digunakan. |

---

## 💡 Panduan Penilaian (Scoring)

1. **Skor Mentah**:
   - Untuk pertanyaan **nomor ganjil** (1, 3, 5, 7, 9): Nilai skala dikurangi 1.
   - Untuk pertanyaan **nomor genap** (2, 4, 6, 8, 10): 5 dikurangi nilai skala.
2. **Total Skor**: Jumlahkan semua skor mentah dan kalikan dengan **2,5**.
3. **Interpretasi**:
   - **> 80.3**: Excellence / A
   - **68 - 80.3**: Good / B (Target minimum Skriptor)
   - **51 - 68**: Fair / C
   - **< 51**: Poor / D-F

---

## 🎯 Fokus Tambahan untuk Skriptor
Meskipun SUS bersifat umum, untuk riset internal Anda mungkin ingin menambahkan pertanyaan kualitatif terbuka di akhir survei:
* "Bagaimana pengalaman Anda saat menunggu progres transkripsi secara real-time?"
* "Apakah editor teks kami memudahkan Anda dalam memperbaiki kesalahan AI?"
* "Fitur apa yang paling membantu pekerjaan Anda di Skriptor?"
