# Kerangka Manual Book — Aplikasi ABSEN (HP Pegawai)

> **Status: kerangka, disesuaikan dengan fitur sistem per 18 November 2026** (sudah diuji di browser).
> Ranah buku ini **hanya aplikasi ABSEN** untuk perangkat desa yang punya akun pegawai (role PEGAWAI).
> Panduan aplikasi ADMIN ada di `admin-webkarbon/docs/MANUAL_BOOK_OUTLINE.md`.
>
> Tanda **📷 SS-xx-yy** = posisi screenshot. Tanda **🚧** = fitur direncanakan / belum ada.
> Pola tiap bab sama dengan buku ADMIN: Untuk apa · Siapa · Langkah · Hasil · Jika gagal.
> Semua jam di aplikasi = **jam server WITA**, bukan jam HP.

---

### 1. Tentang aplikasi ABSEN
- **Untuk apa:** absen masuk/pulang dengan **selfie wajah + lokasi GPS**, melihat riwayat absen, mengajukan izin & koreksi absen.
- **Siapa:** pegawai yang sudah dibuatkan akun oleh admin.
- **Kebutuhan sebelum mulai:**
  - HP dengan kamera depan & GPS, browser Chrome, koneksi internet.
  - Akun (username & kata sandi) dari admin.
  - **Wajah sudah didaftarkan admin** — tanpa ini tombol absen tidak muncul.
  - Jadwal kerja sudah diatur admin.
- Membuka aplikasi: alamat web dari admin. Menaruh pintasan di layar utama lewat menu Chrome
  **⋮ → Tambahkan ke layar utama** (🚧 belum berupa aplikasi terpasang/PWA).
- Menu bawah: **Beranda · Riwayat · Izin · Profile**.
- 📷 SS-01-01 Pintasan di layar utama · SS-01-02 Menu bawah

### 2. Masuk (login) & keluar
1. Isi **Username** & **Kata sandi** → **Masuk**. Ikon mata = tampilkan kata sandi.
2. **Lupa kata sandi:** minta **kode pemulihan** (6 karakter) ke admin/operator, ketik di kolom **Kata sandi**.
3. **Keluar:** ketuk **avatar** (inisial nama) di Beranda → **Keluar**, atau **Profile → Keluar** → konfirmasi **Ya, keluar** di notifikasi.
4. **Sesi berakhir:** aplikasi otomatis kembali ke halaman login dengan pesan "Sesi berakhir, silakan masuk lagi."
- Jika gagal:
  - "Username atau kredensial salah" → periksa ejaan / minta kode pemulihan.
  - Akun tidak aktif / bukan akun pegawai → hubungi admin.
- 📷 SS-02-01 Halaman login · SS-02-02 Pesan login gagal · SS-02-03 Menu avatar & konfirmasi keluar

### 3. Beranda
- Isi: salam & nama, **tanggal dan jam WITA** (berjalan), **Masuk – Pulang** (jam absen + status, atau jam jadwal bila belum absen), dan area aksi.
- Tombol tema (terang/gelap) di kanan atas.
- Kemungkinan tampilan area aksi:

  | Tampilan | Artinya |
  |---|---|
  | **Absen Masuk** | Jendela absen masuk terbuka |
  | **Absen dibuka pukul HH.MM** (abu-abu) | Belum waktunya; absen masuk dibuka **60 menit sebelum jam masuk** |
  | **Absen Pulang** | Sudah absen masuk, atau lupa masuk dan jam pulang sudah lewat |
  | **Presensi hari ini lengkap** | Masuk & pulang sudah tercatat |
  | **Bukan hari kerja** (+ nama libur) | Hari libur desa / hari tanpa jadwal |
  | **Izin {jenis}** + status | Ada izin (menunggu/disetujui) hari ini dan belum absen masuk |
  | **Wajah belum terdaftar** | Minta admin mendaftarkan wajah |

- 📷 SS-03-01 Belum absen · SS-03-02 Absen belum dibuka · SS-03-03 Sudah masuk · SS-03-04 Lengkap · SS-03-05 Libur · SS-03-06 Sedang izin · SS-03-07 Wajah belum terdaftar

### 4. Absen masuk & pulang
- **Aturan singkat:**
  - Masuk: dibuka 60 menit sebelum jam masuk, **ditutup saat jam pulang**. Lewat jam masuk + toleransi → **Terlambat** (menit dihitung dari jam masuk).
  - Pulang: setelah absen masuk; bila lupa masuk, boleh setelah jam pulang. Sebelum jam pulang → **Pulang cepat**.
  - Masing-masing **sekali per hari**.
  - Lokasi harus di dalam radius **lokasi kantor aktif terdekat**; akurasi GPS maks **50 m**.
- **Langkah:**
  1. Beranda → **Absen Masuk / Absen Pulang**. Sebelum jam pulang muncul konfirmasi "Belum jam pulang. Tetap absen pulang?" → **Ya, pulang**.
  2. Izinkan **kamera** & **lokasi** saat diminta browser.
  3. Tunggu kotak status GPS hijau: **"Lokasi siap (±xx m)"**. Selama kuning ("Menunggu GPS lebih akurat") tombol belum bisa ditekan.
  4. Posisikan wajah di dalam **bingkai oval** → **Ambil foto & kirim**.
- **Hasil:** notifikasi "Absen Masuk tercatat" (+ "terlambat xx mnt" bila terlambat), kembali ke Beranda dengan status **Tepat waktu / Terlambat / Pulang cepat**.
- **Jika gagal** (pesan muncul di notifikasi, tetap di layar absen — bisa langsung coba lagi):

  | Pesan | Penyebab / solusi |
  |---|---|
  | Izin lokasi/kamera ditolak | Aktifkan izin di pengaturan browser → **Coba lagi** |
  | Lokasi tidak tersedia / GPS terlalu lama | Nyalakan GPS, pindah ke area terbuka → **Coba lagi** |
  | Akurasi GPS kurang baik | Tunggu / pindah ke area terbuka |
  | Di luar area {kantor} (jarak, maks radius) | Mendekat ke kantor |
  | Wajah tidak terdeteksi | Wajah harus terlihat jelas, satu orang, cahaya cukup |
  | Wajah tidak cocok | Ulangi; bila terus gagal hubungi admin (foto tersimpan untuk diperiksa admin) |
  | Absen masuk ditutup pukul … | Lewat jam pulang → ajukan **koreksi absen** (Bab 6) |
  | Sudah absen … hari ini | Absen jenis itu sudah tercatat |

- Setiap kegagalan tercatat otomatis untuk admin.
- 📷 SS-04-01 Permintaan izin lokasi/kamera · SS-04-02 Konfirmasi pulang cepat · SS-04-03 Layar absen (GPS siap) · SS-04-04 GPS menunggu akurasi · SS-04-05 Berhasil · SS-04-06 Contoh gagal (di luar area)

### 5. Riwayat absen
1. Menu **Riwayat** → bulan berjalan tampil. Tombol **‹ ›** untuk pindah bulan (tidak bisa ke bulan depan).
2. Ringkasan bulan: **Hadir** (hari dengan absen masuk atau pulang), **Terlambat**, **Pulang cepat**.
3. Kartu per hari: jam masuk & pulang + status.
4. Ketuk jam absen untuk melihat **foto selfie**.
5. Label **Koreksi** = absen dicatat/diubah admin (hasil koreksi). Absen koreksi **tidak punya foto**.
- 📷 SS-05-01 Riwayat bulan ini · SS-05-02 Foto absen · SS-05-03 Hari berlabel Koreksi

### 6. Pengajuan izin & koreksi absen
- **Daftar:** menu **Izin**. Filter **Semua · Menunggu · Disetujui · Ditolak** (pengajuan dibatalkan muncul di Semua). Ketuk item untuk detail.
- **Ajukan izin** (**Ajukan** → tab **Izin**):
  1. Pilih **jenis izin** (Sakit, Izin, Cuti, Dinas Luar, Tugas Lapangan — sesuai data admin).
  2. Tanggal **Dari – Sampai** (boleh tanggal lalu; maks **30 hari**; tidak boleh bertabrakan dengan izin lain yang menunggu/disetujui).
  3. **Alasan** (wajib).
  4. **Lampiran** JPG/PNG/PDF maks 5 MB — **wajib** untuk jenis tertentu (mis. Dinas Luar, tanda * muncul).
  5. **Kirim pengajuan** → terbuka halaman detail.
- **Ajukan koreksi absen** (lupa/gagal absen; tab **Koreksi absen**):
  1. **Tanggal**: hari ini s/d **7 hari ke belakang** (hari libur boleh).
  2. **Absen** masuk/pulang + **Jam** sebenarnya.
  3. Alasan, lampiran opsional → **Kirim**.
  - Ditolak bila absen jenis itu di tanggal tsb sudah tercatat, atau sudah ada koreksi yang sama.
  - Setelah **disetujui admin**, absen otomatis tercatat dan tampil di Riwayat berlabel **Koreksi**.
- **Detail pengajuan:** status (**Menunggu / Disetujui / Ditolak / Dibatalkan**), alasan, waktu diajukan & ditinjau + nama peninjau, **catatan peninjau**, **Unduh lampiran**.
- **Batalkan:** hanya selama status **Menunggu** → **Batalkan pengajuan** → **Ya, batalkan**. Pengajuan tidak bisa diubah; batalkan lalu ajukan ulang.
- Izin yang menunggu/disetujui untuk hari ini tampil di Beranda dan menyembunyikan tombol absen masuk.
- 📷 SS-06-01 Daftar & filter · SS-06-02 Form izin · SS-06-03 Lampiran wajib · SS-06-04 Form koreksi · SS-06-05 Detail & status · SS-06-06 Konfirmasi batal

### 7. Profile
- Nama, username, **email**, **peran**; tombol **tema tampilan** (terang/gelap); **Keluar**.
- 🚧 Ganti kata sandi sendiri belum ada — minta admin.
- 📷 SS-07-01 Profile

---

### 8. Tanya jawab
- **Tombol absen tidak muncul?** Cek Beranda: belum jam buka, hari libur, sedang izin, atau wajah belum didaftarkan.
- **GPS lama/lemah?** Nyalakan mode akurasi tinggi, keluar ruangan, tunggu beberapa detik.
- **Di luar area padahal di kantor?** Tunggu akurasi GPS membaik lalu coba lagi; bila tetap, lapor admin (radius kantor).
- **Lupa absen / lewat jam?** Ajukan koreksi maks 7 hari.
- **Sudah absen masuk lalu izin pulang?** Tombol Absen Pulang tetap tersedia.
- **Pengajuan ditolak?** Baca catatan peninjau, ajukan ulang bila perlu.
- **Jam di HP beda?** Aplikasi memakai jam server WITA.

## Catatan untuk penyesuaian
- [ ] Ambil screenshot langsung di HP (bukan desktop) sesuai daftar SS.
- [ ] Nilai 60 menit, 50 m, radius & toleransi terlambat bisa diubah admin — sesuaikan bila berubah.
- [ ] Fitur baru: tambahkan bab mengikuti pola & lanjutkan penomoran SS.
