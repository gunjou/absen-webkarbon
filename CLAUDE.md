# absen-webkarbon

Aplikasi presensi pegawai Kantor Desa Karang Bongkot: absen masuk/pulang, riwayat, pengajuan izin, profile. **Hanya fitur untuk pegawai** — endpoint berlabel `(admin)` di Swagger tidak dipakai (token absensi ditolak di sana).

## Aturan

- **Mobile-first, selalu diakses dari ponsel.** Semua halaman memakai `MobileLayout` (lebar `max-w-md`, navigasi bawah: Beranda, Riwayat, Izin, Profile). Panel admin (Sidebar/Topbar/AppLayout lama) tidak dipakai. Dashboard dibuat ringkas agar muat satu layar.
- **Gaya visual** mengikuti referensi aplikasi travel: kartu `rounded-3xl`/`rounded-[2rem]`, ubin pastel (`bg-pastel-biru|hijau|ungu|jingga|merah`), tombol pil gelap (`bg-ink text-ink-fg rounded-full h-14`), garis putus-putus masuk → pulang. Token lain: `STYLE_GUIDE.md` dan `src/index.css`; selalu pakai token semantik agar mode gelap jalan.
- Bahasa UI Indonesia, teks status singkat; waktu dalam WITA (`src/lib/format.js`, durasi pakai `formatDurasi`).
- Notifikasi & konfirmasi (batal izin, logout) pakai toast `sonner` dengan tombol aksi, bukan `confirm()`/`alert()`.
- Format kode: kutip ganda + titik koma.

## Stack

React 19 + Vite, Tailwind v4 (konfigurasi di `src/index.css`), react-router 7, react-hook-form, react-query, sonner, lucide-react. Alias `@` → `src`. Cek dengan `npx eslint .` dan `npx vite build` (ESLint tidak menangkap komponen JSX yang belum di-import — cek manual).

## API

- Panggil API lewat `api` (openapi-fetch) / `ambil(path, init)` dari `src/api/client.js`; tipe di `src/api/schema.d.ts` (hasil generate, jangan diedit). Setelah backend berubah: `npm run gen:api`.
- Path tanpa prefix `/api`; respons dibungkus envelope `data.data`; galat `{ error: { code, message } }` → petakan `code` ke pesan Indonesia. Upload pakai `FormData` + `bodySerializer: (b) => b`; file yang butuh token (foto, lampiran) ambil dengan `parseAs: "blob"`.
- Token dibaca dari `localStorage["sesi"].token` (sesi `{token, user, pegawai}` disimpan `AuthContext`). `src/lib/api.js` lama masih dipakai `AuthContext` untuk login.
- Login: `POST /auth/login-absensi` (jangan `/auth/login`). `403 BUKAN_PEGAWAI` → "Akun ini bukan akun pegawai".
- Endpoint pegawai: `/absensi/saya/hari-ini` (`bisa_masuk`/`bisa_pulang`/`wajah_terdaftar` menentukan tombol), `/absensi/saya?bulan&tahun`, `POST /absensi/masuk|pulang` (multipart: foto selfie, latitude, longitude, akurasi), `/perizinan/saya`, `POST /perizinan`, `POST /perizinan/{id}/batal`, `/perizinan/{id}/lampiran`, `/pegawai/me`, `POST /auth/ganti-password`.
- Tombol absen dikunci bila wajah belum terdaftar atau ada izin hari ini berstatus PENDING/DISETUJUI.

## Status

Selesai: Login, Dashboard, Riwayat, Izin, Profile (termasuk ubah password), semua terhubung API. Kamera & GPS butuh HTTPS di ponsel.
