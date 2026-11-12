# absen-webkarbon

Aplikasi presensi pegawai Kantor Desa Karang Bongkot: absen masuk/pulang, riwayat, profile. **Hanya fitur untuk pegawai** (permission `absensi.self`); endpoint admin/master di spec tidak dipakai.

## Aturan

- **Mobile-first, selalu diakses dari ponsel.** Halaman selebar ponsel (`max-w-md`). Dashboard dibuat ringkas agar muat satu layar.
- **Gaya visual** mengikuti referensi aplikasi travel: kartu `rounded-3xl`/`rounded-[2rem]`, ubin pastel (`bg-pastel-biru|hijau|ungu|jingga|merah`), tombol pil gelap (`bg-ink text-ink-fg rounded-full h-14`), garis putus-putus masuk → pulang. Token lain: `docs/STYLE_GUIDE.md` dan `src/index.css`; selalu pakai token semantik agar mode gelap jalan.
- Bahasa UI Indonesia, teks status singkat; waktu dalam WITA (`src/lib/format.js`, durasi pakai `formatDurasi`).
- Notifikasi & konfirmasi (mis. logout) pakai toast `sonner` dengan tombol aksi, bukan `confirm()`/`alert()`.
- Format kode: kutip ganda + titik koma.

## Stack

React 19 + Vite, Tailwind v4 (konfigurasi di `src/index.css`), react-router 7, react-hook-form, sonner, lucide-react. Alias `@` → `src`. Cek dengan `npx eslint .` dan `npx vite build` (ESLint tidak menangkap komponen JSX yang belum di-import — cek manual).

## Status

Dibangun ulang dari awal. Tersisa: halaman Login (`POST /auth/login` dengan `client: "absensi"` via `src/lib/api.js`; sesi `{ token, refresh_token, user }` di `localStorage["sesi"]`), Dashboard dummy, dan sistem gaya (`src/index.css`, `src/components/ui`, tema terang/gelap, toaster). Kode hanya `.jsx`/`.js`. Kontrak API backend untuk nanti: `docs/openapi.json` + `docs/API_GUIDE.md`.
