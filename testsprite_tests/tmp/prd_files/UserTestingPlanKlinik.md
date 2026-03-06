# Rencana Pengujian Pengguna (User Testing Plan)
**Proyek:** Klinik Sehat Selalu  
**Fase:** Pra-Rilis / UAT (User Acceptance Testing)

---

## 1. Tujuan Pengujian
1. Memastikan seluruh alur pengguna utama (Pasien, Dokter, Admin) dapat dijalankan tanpa hambatan atau *error*.
2. Memvalidasi isu-isu yang pernah terjadi (seperti sinkronisasi nomor antrean, tampilan di layar *mobile*, dan aksesibilitas) sudah terselesaikan dengan baik.
3. Mengukur tingkat kemudahan penggunaan (*usability*) antarmuka sistem baru, termasuk fitur *Dark Mode* dan interaksi *real-time*.

## 2. Profil Test User (Kriteria Partisipan)
*   **Pasien:** 3-5 orang dengan rentang usia campuran (termasuk lansia/dewasa tua untuk mengetes aksesibilitas UI).
*   **Dokter:** 1-2 orang perwakilan tim medis.
*   **Admin/Perawat:** 1-2 orang staf faskes.

---

## 3. Skenario Pengujian (Task Scenarios)

### A. Skenario Pasien
*   **Task 1 (Autentikasi & Profil):** Buka aplikasi di *smartphone*, lakukan pendaftaran/login. Buka halaman Profil, edit data diri, lalu simpan. Ubah tema tampilan bolak-balik (Dark/Light mode) menggunakan *toggle*.
*   **Task 2 (Melihat Jadwal):** Cari jadwal dokter spesialis yang tersedia pada hari ini.
*   **Task 3 (Proses Antrean):** Ambil nomor antrean. Tutup *browser*, lalu buka kembali untuk melihat apakah nomor antrean yang "sedang dilayani" (Live Queue) ter-update secara presisi tanpa perlu memuat ulang halaman (*refresh*).

### B. Skenario Dokter
*   **Task 1 (Manajemen Pemeriksaan):** Login di perangkat Desktop/Tablet. Akses halaman Pemeriksaan Dokter.
*   **Task 2 (Pemanggilan Pasien):** Panggil pasien selanjutkan di antrean. Pastikan pasien yang dipanggil (*status: 'called'*) muncul dengan benar di daftar tunggu dokter tanpa masalah filter.
*   **Task 3 (Rekam Medis):** Input hasil diagnosa dan resep ke dalam sistem untuk pasien yang sedang diperiksa, lalu tandai sebagai "Selesai".

### C. Skenario Admin/Perawat
*   **Task 1 (Dashboard & Chart):** Buka halaman Admin, amati grafik statistik pasien mingguan (Recharts). Pastikan render grafik mulus dan tidak ada *loading* macet.
*   **Task 2 (Manajemen Data):** Tambahkan jadwal dokter baru, pantau sisa antrean keseluruhan, dan gunakan tabel (*DataTables*) untuk mencari riwayat pasien tertentu dengan cepat.

---

## 4. Metrik Keberhasilan
*   **Task Success Rate:** Persentase kelancaran menyelesaikan skenario di atas tanpa bantuan. (Target: > 90%).
*   **Time on Task:** Waktu yang dihabiskan untuk tiap tugas utama (contoh: mengambil antrean butuh waktu rata-rata < 30 detik).
*   **Error Rate:** Menghitung jumlah klik yang salah atau fitur yang memunculkan blank screen/error merah.

---
---

# Evaluasi & Saran Analitik (AI sebagai User 🤖)

Berdasarkan struktur dan rekam jejak pembangunan fitur "Klinik Sehat Selalu", berikut adalah evaluasi dan saran saya jika memposisikan diri sebagai User:

### ✅ Hal yang Kuat (Kelebihan)
1. **End-to-End Flow:** Sistem ini sangat solid karena mencakup dari A - Z (mulai dari pasien daftar hingga admin mendapat analitik). Banyak klinik kecil hanya punya sistem rekam medis internal tanpa portal pasien.
2. **Modernitas UX:** Adanya fitur *Dark Mode* dan *Password Visibility* menunjukkan perhatian lebih pada kenyamanan *user*.
3. **Penyelesaian *Edge-case*:** Upaya Anda untuk memastikan pasien dengan *status: called* tetap masuk ke layar antrean/pemeriksaan membuktikan *logic* aplikasi ini dirancang secara berhati-hati.

### ⚠️ Titik Kritis yang Perlu Diwaspadai
1. **Sensitivitas Sinkronisasi Antrean:** Karena mengandalkan antrean langsung/live, jika jaringan internet pasien tidak stabil, pasien mungkin tidak sadar nomornya sudah dipanggil.
2. **Responsivitas Layar:** Aplikasi kesehatan paling banyak diakses pasien via HP, tapi diakses operator (Dokter/Admin) via Layar Desktop/Laptop. Jangan sampai komponen tabel (DataTables) atau grafik admin "pecah" jikalau sewaktu-waktu diakses lewat layar tablet kecil oleh dokter.

### 💡 Rekomendasi Fitur Tambahan (Next-Action Suggestions)
Jika aplikasi dijadwalkan untuk *update/scale up*, saya sarankan fitur berikut:

1. **Notifikasi Estimasi Waktu (WhatsApp / Push Notif):** Ketimbang hanya menampilkan "Nomor Saat Ini", akan sangat luar biasa jika pasien bisa mendapat notifikasi: *"Giliran Anda kurang 3 orang lagi, estimasi 15 menit, silakan bersiap ke ruang periksa"*. Ini akan sangat mengurai penumpukan di ruang tunggu klinik riil.
2. **Indikator "Offline" yang Jelas:** Beri tulisan warna merah/abu-abu kecil ("Koneksi terputus") di pojok atas layar antrean pasien jika internet drop, agar pasien tahu mereka harus memuat ulang aplikasi untuk melihat antrean terbaru.
3. **Skeleton Loading:** Karena antrean selalu mengambil data (fetch API), hindari penggunaan *spinner* bulat biasa yang terkesan lambat. Gunakan animasi *skeleton* (garis bayangan) pada list pasien/antrean saat data *loading* agar terasa jauh lebih profesional dan *native*.
4. **Skema Warna Aksesibel:** Pada mode terang (Light Mode) maupun gelap (Dark Mode), pastikan kontras *font* vs *background* cukup tinggi. Aplikasi faskes kerap dipakai orang tua bermata minus/plus. Gunakan *font size* yang sedikit lebih besar di halaman mobile pasien.
