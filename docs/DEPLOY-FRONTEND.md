# Dokumentasi Deployment Frontend — Webkarbon (React + Vite)

> Dokumen transfer knowledge: cara deploy frontend React (Vite) ke VPS Webkarbon,
> akses database dari laptop, dan migrasi data dari VPS lama.
> Pelengkap dari dokumen **Deployment Backend** (Flask, Gunicorn, Nginx, Cloudflare Tunnel).
> Terakhir diperbarui: 12 November 2026
>
> ⚠️ Dokumen ini **tidak** berisi password/secret. Semua nilai rahasia hanya ada di server (`.env`).

---

## Daftar Isi

1. [Ringkasan & Prinsip](#1-ringkasan--prinsip)
2. [Daftar Frontend Aktif](#2-daftar-frontend-aktif)
3. [Langkah Deploy Frontend Baru (Template)](#3-langkah-deploy-frontend-baru-template)
4. [Script Deploy (`deploy-<APP>.sh`)](#4-script-deploy-deploy-appsh)
5. [Rollback](#5-rollback)
6. [Catatan Khusus per Aplikasi](#6-catatan-khusus-per-aplikasi)
7. [Akses Database dari Laptop (SSH Tunnel)](#7-akses-database-dari-laptop-ssh-tunnel)
8. [Migrasi Data dari VPS Lama](#8-migrasi-data-dari-vps-lama)
9. [Troubleshooting](#9-troubleshooting)
10. [Checklist Frontend Baru](#10-checklist-frontend-baru)

---

## 1. Ringkasan & Prinsip

```
Laptop: git commit → npm run build → rsync dist/ ──SSH:20143──► /srv/webkarbon/www/<APP>/releases/<versi>/
                                                                  └─ symlink "current" dipindah ke versi baru
Pengguna ► Cloudflare (HTTPS) ► tunnel ► Nginx :80 (server_name <SUBDOMAIN>) ► file statis di current/
                └─ panggilan API ► https://bdg.karangbongkot.com (Flask)
```

**Prinsip:**

| Prinsip                                                          | Alasan                                                                                                                                        |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Build di laptop, bukan di VPS**                                | RAM VPS hanya 1 GB. `npm install` + `vite build` bisa memakan ratusan MB dan mengganggu Gunicorn/PostgreSQL. Server juga tidak perlu Node.js. |
| **Yang dikirim adalah hasil build (`dist/`), bukan source code** | Berbeda dengan backend (`git pull`). Frontend hanyalah file statis.                                                                           |
| **Pola `releases/` + symlink `current`**                         | Pergantian versi atomik (tidak ada momen setengah ter-upload) dan rollback cukup satu perintah.                                               |
| **Frontend tidak pernah mengakses database**                     | React hanya memanggil API. Hanya Flask yang konek ke PostgreSQL via `localhost`.                                                              |
| **Semua subdomain lewat Cloudflare Tunnel (CNAME)**              | IP `141.11.160.130` dipakai bersama (NAT). Jangan pernah membuat A record ke IP tersebut.                                                     |

---

## 2. Daftar Frontend Aktif

| Aplikasi | Repo              | Subdomain                 | Folder server              | Config Nginx      | Pengguna                   |
| -------- | ----------------- | ------------------------- | -------------------------- | ----------------- | -------------------------- |
| Admin    | `admin-webkarbon` | `admin.karangbongkot.com` | `/srv/webkarbon/www/admin` | `webkarbon-admin` | Admin/operator desa        |
| Absen    | `absen-webkarbon` | `absen.karangbongkot.com` | `/srv/webkarbon/www/absen` | `webkarbon-absen` | Pegawai (HP, kamera + GPS) |

Struktur folder di server:

```
/srv/webkarbon/www/
├── admin/
│   ├── releases/
│   │   ├── 20261112-153000-a1b2c3d/
│   │   └── 20261112-160500-e4f5a6b/
│   ├── current -> releases/20261112-160500-e4f5a6b
│   └── deploy-admin.log
└── absen/
    ├── releases/
    ├── current -> releases/...
    └── deploy-absen.log
```

---

## 3. Langkah Deploy Frontend Baru (Template)

Ganti placeholder berikut:

| Placeholder   | Contoh admin              | Contoh absen              |
| ------------- | ------------------------- | ------------------------- |
| `<APP>`       | `admin`                   | `absen`                   |
| `<SUBDOMAIN>` | `admin.karangbongkot.com` | `absen.karangbongkot.com` |

### 3.1 Persiapan project (laptop)

Buat `.env.production` di root project:

```bash
VITE_API_URL=https://bdg.karangbongkot.com
```

Di kode, gunakan `import.meta.env.VITE_API_URL` sebagai base URL axios/fetch.

> ⚠️ Variabel `VITE_*` **ditanam ke dalam file JS saat build** dan bisa dibaca siapa pun.
> Jangan taruh secret di sana. Kalau nilainya berubah, harus build ulang.

Pastikan `dist/` ada di `.gitignore`.

Karena setiap aplikasi punya subdomain sendiri, `base` di `vite.config.js` tetap default (`/`).

### 3.2 Folder di server

```bash
sudo mkdir -p /srv/webkarbon/www/<APP>/releases
sudo chown -R webkarbon:webkarbon /srv/webkarbon/www/<APP>
# Nginx (user www-data) harus bisa menembus folder induk (cukup sekali untuk semua frontend):
sudo chmod 755 /srv/webkarbon /srv/webkarbon/www
namei -l /srv/webkarbon/www/<APP>     # cek semua level punya izin x untuk others
```

> `.env` backend tetap aman karena permission-nya `600`.

### 3.3 Nginx

File `/etc/nginx/sites-available/webkarbon-<APP>`:

```nginx
server {
    listen 80;
    server_name <SUBDOMAIN>;
    root /srv/webkarbon/www/<APP>/current;
    index index.html;

    # Routing React (BrowserRouter): refresh di sub-halaman tidak 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # index.html jangan di-cache, supaya versi baru langsung terpakai
    location = /index.html {
        add_header Cache-Control "no-cache";
        # (opsional, lihat bagian 6) header tambahan khusus aplikasi diletakkan DI SINI
    }

    # File di /assets/ punya hash di namanya, jadi aman di-cache lama
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
}
```

> **Penting:** di Nginx, begitu sebuah `location` punya `add_header` sendiri, header dari level `server`
> **tidak diwariskan**. Karena itu header tambahan diletakkan di dalam blok `location`, bukan di level `server`.

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/webkarbon-<APP> /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3.4 Cloudflare Tunnel & DNS

Tambahkan ingress di `/etc/cloudflared/config.yml`, **sebelum** baris `http_status:404`:

```yaml
tunnel: 7281ddcd-0900-4d51-8ece-f744422595ef
credentials-file: /etc/cloudflared/7281ddcd-0900-4d51-8ece-f744422595ef.json

ingress:
  - hostname: bdg.karangbongkot.com
    service: http://localhost:80
  - hostname: admin.karangbongkot.com
    service: http://localhost:80
  - hostname: absen.karangbongkot.com
    service: http://localhost:80
  # - hostname: <SUBDOMAIN>          ← frontend baru ditambahkan di sini
  #   service: http://localhost:80
  - service: http_status:404
```

Lalu jalankan:

```bash
cloudflared tunnel ingress validate --config /etc/cloudflared/config.yml
cloudflared tunnel route dns --overwrite-dns webkarbon <SUBDOMAIN>
sudo systemctl restart cloudflared
```

> Semua frontend memakai `service: http://localhost:80`. Nginx yang memilah tujuan berdasarkan `server_name`.

### 3.5 CORS di backend

Frontend berada di subdomain berbeda dari API (`bdg.`), jadi browser akan memblokir request
kecuali origin-nya diizinkan di Flask:

```python
CORS(app, origins=[
    "https://admin.karangbongkot.com",
    "https://absen.karangbongkot.com",
    # "https://<SUBDOMAIN>",   ← tambahkan untuk frontend baru
])
```

- Sebaiknya daftar origin dibaca dari `.env`, bukan di-hardcode.
- Untuk development lokal, tambahkan `http://localhost:5173` hanya di `.env` laptop.
- Perubahan ini di-deploy lewat alur backend biasa (`deploy-karbon`).

### 3.6 Script deploy

Salin script dari [bagian 4](#4-script-deploy-deploy-appsh) ke root repo frontend, sesuaikan variabel di bagian atasnya, lalu:

```bash
chmod +x deploy-<APP>.sh
```

Alias di `~/.zshrc` / `~/.bashrc`:

```bash
alias deploy-<APP>='cd ~/path/ke/<APP>-webkarbon && ./deploy-<APP>.sh'
```

### 3.7 Deploy pertama & verifikasi

```bash
deploy-<APP>
```

Lalu buka `https://<SUBDOMAIN>` di browser, login, refresh di sub-halaman, dan cek console untuk error CORS.

---

## 4. Script Deploy (`deploy-<APP>.sh`)

Script ini dijalankan **dari laptop**, di root repo frontend. Cukup ubah 3 variabel teratas.

```bash
#!/usr/bin/env bash
# Deploy frontend Webkarbon (jalankan dari laptop, di root repo frontend)
set -Eeuo pipefail

# ===== SESUAIKAN =====
APP=absen                                   # admin | absen | ...
URL=https://absen.karangbongkot.com
KEEP=5                                      # jumlah rilis yang disimpan untuk rollback
# =====================

HOST=webkarbon@141.11.160.130
PORT=20143
REMOTE=/srv/webkarbon/www/$APP

# 1. Tolak kalau ada perubahan yang belum di-commit
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: ada perubahan belum di-commit. Commit dulu."; exit 1
fi

REL="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
echo "===== DEPLOY ${APP^^}: $REL ====="

# 2. Build bersih
npm ci
npm run build
[[ -f dist/index.html ]] || { echo "Build gagal: dist/index.html tidak ada"; exit 1; }

# 3. Upload ke folder rilis baru (belum aktif)
rsync -az -e "ssh -p $PORT" dist/ "$HOST:$REMOTE/releases/$REL/"

# 4. Bawa aset lama, aktifkan rilis baru secara atomik, hapus rilis lama
ssh -p $PORT "$HOST" "set -e; cd $REMOTE
  if [[ -d current/assets ]]; then
    rsync -a --ignore-existing current/assets/ releases/$REL/assets/
  fi
  ln -sfn releases/$REL current.tmp && mv -Tf current.tmp current
  ls -1dt releases/* | tail -n +$((KEEP+1)) | xargs -r rm -rf
  echo \"$REL \$(date '+%F %T')\" >> deploy-$APP.log"

# 5. Cek dari luar
sleep 2
if curl -fsS "$URL/" | grep -q 'id="root"'; then
  echo "✅ Deploy BERHASIL: $REL aktif di $URL"
else
  echo "⚠️  Halaman tidak merespons seperti harapan. Cek Nginx/tunnel."; exit 1
fi
```

### Penjelasan langkah

| Langkah                             | Fungsi                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Cek `git status`                    | Memastikan yang di-deploy sama persis dengan commit (bisa dilacak dari nama rilis)                      |
| `npm ci`                            | Install dependensi persis sesuai `package-lock.json`                                                    |
| `rsync` ke `releases/$REL`          | Upload ke folder baru; versi yang sedang aktif tidak tersentuh                                          |
| `rsync --ignore-existing` aset lama | Pengguna yang tab-nya masih memuat versi lama tidak error saat aplikasi memuat file JS lama (lazy load) |
| `ln -sfn` + `mv -Tf`                | Mengganti symlink `current` secara atomik                                                               |
| `tail -n +$((KEEP+1))`              | Menghapus rilis lama, hanya menyimpan `KEEP` terakhir                                                   |
| `curl ... id="root"`                | Memastikan halaman benar-benar tersaji dari luar (lewat Cloudflare)                                     |

---

## 5. Rollback

Rollback tidak butuh restart apa pun, cukup memindahkan symlink:

```bash
ssh -p 20143 webkarbon@141.11.160.130
cd /srv/webkarbon/www/<APP>
ls -1t releases/                         # daftar rilis, terbaru di atas
cat deploy-<APP>.log                     # riwayat deploy
ln -sfn releases/<rilis-sebelumnya> current.tmp && mv -Tf current.tmp current
```

Nama rilis berisi hash commit (`20261112-160500-e4f5a6b`), jadi mudah dicocokkan dengan `git log` di laptop.

---

## 6. Catatan Khusus per Aplikasi

### 6.1 Admin (`admin.karangbongkot.com`)

- **Disarankan** dilindungi dengan **Cloudflare Zero Trust Access** (gratis sampai 50 user). Pengguna harus login (misalnya OTP email) sebelum halaman bisa dibuka. Ini lapisan tambahan di atas login JWT aplikasi.

### 6.2 Absen (`absen.karangbongkot.com`)

- Tambahkan header berikut di blok `location = /index.html`:

  ```nginx
  add_header Permissions-Policy "camera=(self), geolocation=(self), microphone=()";
  ```

- **Jangan** pasang Cloudflare Access, karena pegawai akan terganggu dengan login ganda setiap hari.
- **Hindari deploy di jam absen masuk/pulang (WITA).**
- **Wajib uji di HP sungguhan** setelah deploy pertama atau setelah perubahan pada fitur kamera/GPS:

| Cek                    | Cara                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| HTTPS aktif            | Ikon gembok di browser HP                                                                              |
| Izin kamera muncul     | Uji di Android Chrome dan iPhone Safari                                                                |
| Izin lokasi muncul     | Uji juga di luar ruangan (akurasi GPS di dalam gedung bisa buruk)                                      |
| Upload selfie berhasil | Batas Nginx `bdg.` adalah **5 MB**. Kompres foto di frontend (resize lebar ±800 px, JPEG kualitas 0.8) |
| Jam tercatat benar     | Cek di database bahwa waktu absen sesuai WITA                                                          |
| Refresh tidak 404      | Refresh di halaman selain beranda                                                                      |

### 6.3 Frontend baru di masa depan

Tanyakan dua hal ini:

1. **Siapa penggunanya?** Kalau internal/admin → pertimbangkan Cloudflare Access. Kalau publik/pegawai → jangan.
2. **Butuh fitur browser khusus (kamera, GPS, mikrofon)?** Kalau ya → tambahkan `Permissions-Policy` dan uji di HP.

---

## 7. Akses Database dari Laptop (SSH Tunnel)

Port 5432 di VPS baru **tidak dibuka dan tidak boleh dibuka**. Akses dari laptop harus lewat SSH tunnel.

### 7.1 Buka tunnel

```bash
ssh -N -L 5433:127.0.0.1:5432 -p 20143 webkarbon@141.11.160.130
```

Port `5433` di laptop diteruskan ke `5432` di VPS. Biarkan terminal ini tetap terbuka selama dipakai.

Alias:

```bash
alias tunnel-db='ssh -N -L 5433:127.0.0.1:5432 -p 20143 webkarbon@141.11.160.130'
```

> Di DBeaver/pgAdmin/TablePlus, gunakan tab **SSH** bawaan: host `141.11.160.130`, port `20143`,
> user `webkarbon`, lalu koneksi DB ke `localhost:5432`.

### 7.2 Ambil password (jangan dikirim lewat chat/email/commit)

```bash
ssh -p 20143 webkarbon@141.11.160.130 "grep DB_PASSWORD /srv/webkarbon/bdg-webkarbon/.env"
```

### 7.3 `.env` laptop (backend)

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=webkarbon
DB_USER=karbon
DB_PASSWORD=<salin dari server>

# Khusus laptop, HARUS berbeda dengan production
JWT_SECRET_KEY=<python3 -c "import secrets; print(secrets.token_urlsafe(48))">
JWT_ACCESS_EXPIRES=480
JWT_REFRESH_EXPIRES=7
```

> ⚠️ Lewat tunnel, laptop memakai **database production**. Data uji coba akan tercampur dengan data asli,
> dan migrasi yang dijalankan dari laptop langsung mengubah production.
> Untuk development sehari-hari, lebih aman memakai PostgreSQL lokal (`localhost:5432`) dan menjalankan
> file `migrations/` di sana. Tunnel hanya untuk memeriksa data asli.

> ⚠️ **Jangan pernah memakai ulang** nilai `.env` dari VPS lama (`72.60.74.195`). Nilai itu sudah bocor.

---

## 8. Migrasi Data dari VPS Lama

Skema di VPS baru sudah dibuat oleh migrasi `001` dan `002`, jadi yang dipindah **cukup datanya saja**.

### 8.1 Dump di VPS lama

```bash
sudo -u postgres pg_dump -d webkarbon --data-only --no-owner \
  --exclude-table=schema_migrations -Fc -f /tmp/webkarbon-data.dump
```

### 8.2 Pindahkan file (lewat laptop)

```bash
scp <user>@72.60.74.195:/tmp/webkarbon-data.dump .
scp -P 20143 webkarbon-data.dump webkarbon@141.11.160.130:/tmp/
```

> `scp` memakai `-P` (huruf besar), sedangkan `ssh` memakai `-p`.

### 8.3 Backup lalu restore di VPS baru

```bash
cd /srv/webkarbon/bdg-webkarbon && set -a && source .env && set +a
export PGPASSWORD="$DB_PASSWORD"

pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" -Fc -f ~/backup-sebelum-restore.dump

pg_restore -h localhost -U "$DB_USER" -d "$DB_NAME" --data-only --single-transaction \
  /tmp/webkarbon-data.dump
unset PGPASSWORD
```

### 8.4 Catatan

| Masalah                                                        | Solusi                                                                                                                                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `duplicate key` (misalnya tabel roles sudah diisi migrasi 002) | Kosongkan tabel yang bentrok, atau tambahkan `--exclude-table=<tabel>` saat dump. Restore yang gagal tidak meninggalkan data setengah jadi berkat `--single-transaction` |
| Kolom tidak cocok                                              | Skema lama berbeda dengan `001_init.sql`; sesuaikan dulu skemanya                                                                                                        |
| `pg_restore` menolak file dump                                 | Versi PostgreSQL lama lebih baru dari 16. Cek `psql --version` di VPS lama                                                                                               |

**Setelah selesai:**

1. Hapus file dump di `/tmp` kedua server dan di laptop (berisi data pribadi pegawai).
2. **Tutup port 5432 di VPS lama:**

   ```bash
   sudo ufw deny 5432
   # dan/atau di postgresql.conf:  listen_addresses = 'localhost'
   sudo systemctl restart postgresql
   ```

3. Kalau database lama tidak dipakai lagi, hentikan PostgreSQL di VPS lama sepenuhnya.

---

## 9. Troubleshooting

| Gejala                                          | Penyebab                                              | Solusi                                                                               |
| ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Refresh sub-halaman → 404                       | `try_files` belum ada di Nginx                        | Cek bagian 3.3                                                                       |
| `403 Forbidden`                                 | Nginx (www-data) tidak bisa membaca folder            | `namei -l /srv/webkarbon/www/<APP>/current/index.html`                               |
| Halaman putih, console: `CORS policy`           | Origin belum diizinkan di Flask                       | Bagian 3.5                                                                           |
| API dipanggil ke `localhost`                    | `.env.production` tidak terbaca saat build            | Cek nama file, lalu build ulang                                                      |
| Versi lama masih muncul                         | Browser cache `index.html`                            | Cek header `no-cache`; hard refresh (Ctrl+Shift+R)                                   |
| Subdomain → 404 dari Cloudflare                 | Ingress belum ditambahkan / cloudflared belum restart | Bagian 3.4                                                                           |
| Subdomain → error DNS                           | `route dns` belum dijalankan                          | `cloudflared tunnel route dns --overwrite-dns webkarbon <SUBDOMAIN>`                 |
| Halaman putih setelah deploy, hanya di tab lama | Aset lama terhapus                                    | Pastikan script memakai `rsync --ignore-existing` (bagian 4); minta pengguna refresh |
| Kamera/GPS tidak muncul                         | Bukan HTTPS, atau `Permissions-Policy` salah          | Akses lewat `https://`; cek header di bagian 6.2                                     |
| `rsync: command not found`                      | rsync belum terpasang di laptop atau server           | `sudo apt install rsync` (server), `brew install rsync` (macOS)                      |
| Tunnel DB: `connection refused` di 5433         | Terminal tunnel belum dibuka/tertutup                 | Jalankan `tunnel-db` lagi                                                            |

---

## 10. Checklist Frontend Baru

**Laptop**

- [ ] `.env.production` berisi `VITE_API_URL=https://bdg.karangbongkot.com`
- [ ] `dist/` ada di `.gitignore`
- [ ] `deploy-<APP>.sh` disalin, variabel `APP` dan `URL` disesuaikan, `chmod +x`
- [ ] Alias `deploy-<APP>` ditambahkan

**Server**

- [ ] Folder `/srv/webkarbon/www/<APP>/releases` dibuat, owner `webkarbon`
- [ ] Config Nginx `webkarbon-<APP>` dibuat, di-symlink ke `sites-enabled`, lolos `nginx -t`
- [ ] Ingress ditambahkan di `/etc/cloudflared/config.yml`, lolos `ingress validate`
- [ ] `cloudflared tunnel route dns --overwrite-dns webkarbon <SUBDOMAIN>`
- [ ] `sudo systemctl restart cloudflared`

**Backend**

- [ ] Origin `https://<SUBDOMAIN>` ditambahkan ke CORS, lalu `deploy-karbon`

**Verifikasi**

- [ ] Deploy pertama berhasil (✅ di output script)
- [ ] Halaman terbuka via HTTPS, login berhasil, refresh sub-halaman tidak 404
- [ ] Tidak ada error CORS di console
- [ ] (Jika pakai kamera/GPS) diuji di HP Android dan iPhone
- [ ] Tabel di [bagian 2](#2-daftar-frontend-aktif) diperbarui
