# Style Guide — Sistem Administrasi Kantor Desa Karang Bongkot

Panduan gaya visual & pola komponen untuk frontend web ini. Ditulis supaya developer
atau model AI lain bisa membuat halaman baru yang **konsisten** dengan yang sudah ada.

- **Stack:** React 19 + Vite, Tailwind CSS v4 (konfigurasi di CSS lewat `@theme`, tanpa `tailwind.config.js`),
  `lucide-react` (ikon), `sonner` (toast), `react-hook-form`, `@tanstack/react-query`, `react-leaflet` (peta).
- **Bahasa UI:** Bahasa Indonesia. Nama variabel/komponen boleh campur (mis. `bolehUbah`, `useDebouncedValue`).
- **Sumber kebenaran:** `src/index.css` (token), `src/components/ui/*` (komponen dasar), `src/components/layout/*`.

---

## 1. Karakter visual

- **Lembut & mengambang:** kartu putih tanpa border dengan bayangan halus (`shadow-card`), sudut membulat besar (`rounded-2xl`).
- **Biru dari logo desa:** biru laut (primary), biru bahari (tua, untuk judul & gradasi), biru langit (aksen terang).
- **Aksen bergradasi** untuk elemen aktif/utama: tombol primer, menu sidebar aktif, segmen terpilih (`bg-accent-gradient` + `shadow-glow`).
- **Isian abu lembut** (`bg-surface-2`) untuk input, kontrol, dan area sekunder; bukan garis/border.
- **Tipografi tegas:** judul `font-extrabold` + `tracking-tight`; label kecil kapital dengan `tracking` lebar.
- **Mobile-first**, mendukung **mode terang & gelap** penuh.

---

## 2. Warna

### 2.1 Palet dasar (dari logo)

Didefinisikan di `@theme` pada `src/index.css`, dipakai sebagai kelas Tailwind (`bg-primary-600`, `text-bahari-800`, dst).

| Skala | primary (Biru Laut) | bahari (Biru Bahari) | langit (Biru Langit) |
|---|---|---|---|
| 50 | `#E6F4FB` | `#EEF2F8` | `#F0F8FD` |
| 100 | `#CCE8F6` | `#D6DFEC` | `#E0F1FB` |
| 200 | `#99D1EE` | `#ADBFD9` | `#BFE3F7` |
| 300 | `#66BBE5` | `#809BC2` | `#77C6EF` ← logo |
| 400 | `#33A8E0` | `#5879A8` | `#4DB3E8` |
| 500 | `#008DD2` ← logo | `#3B5F92` | `#2A9FDC` |
| 600 | `#0077B6` | `#2B4D7A` ← logo | — |
| 700 | `#005F92` | `#233F65` | — |
| 800 | `#00486F` | `#1B304E` | — |
| 900 | `#00324D` | `#132239` | — |
| 950 | `#001F31` | `#0A1222` | — |

Tambahan: `karang-500 #047EC7`, `karang-900 #020266` (dari logo, jarang dipakai).

**Status:** `success #15803D`, `warning #B45309`, `danger #B91C1C`.

### 2.2 Token semantik (WAJIB dipakai di komponen)

Komponen **tidak** memakai palet mentah untuk warna permukaan/teks; gunakan token semantik supaya otomatis
berganti di mode gelap. Nilai diisi oleh `:root` (terang) dan `.dark` (gelap).

| Token (kelas) | Fungsi | Terang | Gelap |
|---|---|---|---|
| `bg-bg` | Latar halaman | `#F3F6FA` | `#0A1222` |
| `bg-surface` | Kartu, modal, topbar | `#FFFFFF` | `#101B2E` |
| `bg-surface-2` | Input, kontrol, hover, area sekunder | `#F1F4F9` | `#17243B` |
| `border-border` | Garis pemisah (tipis, seperlunya) | `#E3E9F1` | `#22334F` |
| `text-fg` | Teks utama | `#0F1B2D` | `#E6EDF6` |
| `text-fg-muted` | Teks sekunder, label, placeholder | `#64748B` | `#94A6BE` |
| `text-heading` | Judul, nama entitas | `#1B304E` (bahari-800) | `#F0F6FC` |
| `bg-accent` / `text-accent` | Aksen utama | `#0077B6` (primary-600) | `#33A8E0` |
| `text-accent-fg` | Teks di atas aksen | `#FFFFFF` | `#0A1222` |
| `bg-accent-hover` | Hover aksen | `#005F92` | `#66BBE5` |
| `bg-accent-soft` | Latar aksen lembut (ikon, badge info, item terpilih) | `#E6F4FB` | `#0F2A42` |
| `text-link` | Tautan, ikon aksen di atas `accent-soft` | `#005F92` | `#77C6EF` |
| `bg-sidebar` / `text-sidebar-fg` | Sidebar | `#FFFFFF` / `#51627A` | `#0D1729` / `#94A6BE` |
| `ring-ring` | Fokus & border input aktif | `#008DD2` | `#33A8E0` |
| `text-success-fg` | Teks status sukses | `#15803D` | `#4ADE80` |
| `text-warning-fg` | Teks status peringatan | `#B45309` | `#FBBF24` |
| `text-danger-fg` | Teks error/hapus | `#B91C1C` | `#F87171` |

> Latar status memakai warna status + opacity: `bg-success/10`, `bg-warning/10`, `bg-danger/10`;
> teksnya memakai varian `-fg` (`text-danger-fg`) karena kontras di mode gelap.

### 2.3 Bayangan

| Kelas | Pakai untuk |
|---|---|
| `shadow-card` | Kartu, tile, tombol kecil mengambang |
| `shadow-pop` | Modal, dropdown, drawer, kartu login |
| `shadow-glow` | Elemen beraksen gradasi (tombol primer, nav aktif, segmen aktif) |

Di mode gelap, `shadow-card`/`shadow-pop` otomatis menambah garis 1px agar kartu tetap terlihat.

### 2.4 Gradasi

```css
/* src/index.css */
@utility bg-accent-gradient {            /* primary-600 -> primary-700, teks putih ≥ 4.5:1 */
  background-image: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
}
.dark .bg-accent-gradient {               /* lebih terang di mode gelap */
  background-image: linear-gradient(135deg, var(--color-primary-300), var(--color-primary-500));
}
```

**Gradasi hero/banner** (banner dashboard, pita atas halaman login):

```jsx
<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-bahari-700 via-bahari-600 to-primary-700 p-6 text-white shadow-card sm:p-8">
  <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10" aria-hidden="true" />
  <div className="absolute -bottom-24 right-24 size-48 rounded-full bg-langit-300/15" aria-hidden="true" />
  <div className="relative">…konten (teks putih, aksen text-langit-100/300)…</div>
</div>
```

### 2.5 Aturan pakai warna

- Judul & nama entitas → `text-heading`. Teks biasa → `text-fg`. Keterangan → `text-fg-muted`.
- Ikon dekoratif dalam kotak → `bg-accent-soft text-link`.
- Overlay gelap (backdrop modal, overlay foto) → `bg-bahari-950/50` atau `/55`–`/75`.
- Jangan pakai `text-white`/`bg-white` di komponen umum (kecuali di atas gradasi/foto); gunakan token.
- Jangan pakai warna hex langsung di JSX. Pengecualian: opsi SVG Leaflet (tidak bisa membaca CSS variable),
  memakai konstanta `WARNA_AREA = '#008DD2'`.

---

## 3. Tipografi

- **Font:** `Plus Jakarta Sans` (Google Fonts, bobot 400–800) → `--font-sans`; `body` memakai `font-sans antialiased`.
- **Angka** (jam, jumlah, NIK, koordinat) → `tabular-nums`.

| Peran | Kelas |
|---|---|
| Judul halaman (h1) | `text-2xl font-extrabold tracking-tight text-heading sm:text-[28px]` |
| Judul modal | `text-lg font-bold text-heading` |
| Judul kartu / seksi | `text-[13px] font-bold uppercase tracking-[0.06em] text-heading` |
| Header tabel | `text-[11px] uppercase tracking-[0.08em] font-semibold text-fg-muted` |
| Eyebrow / label kecil | `text-[11px] font-semibold uppercase tracking-wider text-fg-muted` |
| Label form | `text-sm font-semibold text-fg` |
| Teks biasa | `text-sm text-fg` |
| Deskripsi / hint | `text-sm text-fg-muted` / `text-xs text-fg-muted` |
| Angka besar (stat) | `text-3xl font-extrabold tabular-nums tracking-tight text-accent` |

---

## 4. Ruang, radius, ukuran

- **Radius:** kartu/modal `rounded-2xl` (modal mobile `rounded-t-3xl`), input/tombol/item `rounded-xl`,
  elemen kecil di dalam kontrol `rounded-lg`, badge `rounded-md`, avatar `rounded-xl`, foto besar `rounded-3xl`.
- **Tinggi kontrol:** input/select/tombol `h-11` (44px, ramah sentuh); tombol kecil `h-9`; segmen `h-8`/`h-9`.
- **Padding kartu:** `px-4 sm:px-6`, vertikal `py-4`/`pt-4 sm:pt-5`.
- **Halaman (`<main>`):** `mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8`.
- **Jarak antar-blok:** `mb-6` setelah header halaman, `mb-4`/`mt-6` antar-kartu, `space-y-4`/`gap-4` di form.
- **Breakpoint:** mobile default → `sm` 640 → `md` 768 (tabel muncul) → `lg` 1024 (sidebar tetap) → `xl` 1280.

---

## 5. Mode gelap

- Varian: `@custom-variant dark (&:where(.dark, .dark *));` → kelas `.dark` di `<html>`.
- `ThemeContext` menyimpan pilihan di `localStorage['tema']`: `'light' | 'dark' | 'system'`.
- Komponen cukup memakai token semantik; **hindari `dark:` manual** kecuali benar-benar perlu.
- Peta Leaflet di mode gelap: tile dibalik lewat CSS
  `.dark .peta-lokasi .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(.9) contrast(.9) }`.
- Toast (`sonner`) mengikuti tema: `<Toaster theme={theme} position="top-center" richColors closeButton />`.

---

## 6. Utilitas bersama (`src/components/ui/cn.js`)

```js
export function cn(...classes) { return classes.filter(Boolean).join(' ') }

// Cincin fokus keyboard standar untuk semua elemen interaktif
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

// Dasar semua input/select/textarea
export const fieldBase =
  'block w-full rounded-xl border border-transparent bg-surface-2 px-3.5 py-2 text-base text-fg placeholder:text-fg-muted/80 sm:text-sm transition-colors ' +
  'hover:border-border focus:outline-none focus:border-ring focus:bg-surface focus:ring-4 focus:ring-ring/15 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-transparent ' +
  'aria-[invalid=true]:border-danger-fg aria-[invalid=true]:bg-surface aria-[invalid=true]:focus:ring-danger-fg/15'
```

- `text-base sm:text-sm` di input mencegah zoom otomatis iOS.
- `cn` hanya menggabungkan string (bukan `tailwind-merge`): **jangan** menimpa kelas `display` yang sama
  (mis. `hidden` di elemen yang sudah `inline-flex`); bungkus dengan `<div className="hidden lg:block">`.

---

## 7. Layout aplikasi

```
┌──────────────────────── Topbar (sticky, h-16 / lg:h-[72px], bg-surface/90 backdrop-blur) ──────┐
│ [≡ mobile] Logo + "DESA / Karang Bongkot" │ [« ciutkan] [NavSearch md+] ……… [Tema] [User menu] │
├────────────┬───────────────────────────────────────────────────────────────────────────────────┤
│ Sidebar    │ <main class="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">                        │
│ w-64 /     │   PageHeader (judul + deskripsi + aksi)                                            │
│ ciut 88px  │   Konten: Card, tabel, dsb.                                                        │
│ (lg+)      │                                                                                     │
│ drawer di  │                                                                                     │
│ mobile     │                                                                                     │
└────────────┴───────────────────────────────────────────────────────────────────────────────────┘
```

- **Sidebar:** `bg-sidebar`, grup menu berlabel kecil; item `min-h-11 rounded-xl px-3 text-sm font-medium`.
  Aktif: `bg-accent-gradient font-semibold text-accent-fg shadow-glow`. Tidak aktif: `text-sidebar-fg hover:bg-surface-2`,
  ikon `size-[18px] text-fg-muted group-hover:text-accent`.
  Drawer mobile memakai backdrop `bg-bahari-950/50 backdrop-blur-[2px]`.
- **Menu** didefinisikan di `src/components/layout/nav.js` (`NAV_GROUPS`) dengan kunci izin `izin` dari `lib/roles.js`.
  Grup: Utama · Layanan · Data (Penduduk, Pegawai, Absensi) · Sistem (Pengguna, Lokasi Absen, Pengaturan).
- **Tombol ikon topbar:** `rounded-xl p-2.5 text-fg-muted hover:bg-surface-2 hover:text-fg` + `focusRing`.

### Header halaman

```jsx
<PageHeader
  title="Pegawai"
  description="Data perangkat dan staf Kantor Desa."
  actions={bolehUbah && <Button icon={Plus} onClick={…}>Tambah pegawai</Button>}
/>
```

Untuk halaman dengan sub-tab (mis. Absensi): judul di kiri dan tab di kanan pada `xl`, tab di bawah judul di layar lebih kecil
(`flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between`). Tab = pil di dalam wadah `bg-surface-2 p-1 rounded-xl`,
aktif `bg-surface text-heading shadow-card`, bisa digeser horizontal di mobile.

---

## 8. Komponen dasar (`src/components/ui`)

### Button

```jsx
<Button>Simpan</Button>                               // primary (default)
<Button variant="secondary">Batal</Button>
<Button variant="ghost" icon={Trash2} className="text-danger-fg">Hapus</Button>
<Button variant="danger" loading={isPending}>Ya, hapus</Button>
<Button size="sm" icon={Plus}>Tambah</Button>
<Button size="icon" icon={ChevronLeft} aria-label="Sebelumnya" />
<Button to="/pegawai">Ke pegawai</Button>             // render sebagai <Link>
```

| Varian | Kelas |
|---|---|
| `primary` | `bg-accent-gradient text-accent-fg shadow-glow hover:brightness-110` |
| `secondary` | `bg-surface-2 text-fg hover:bg-border/70` |
| `ghost` | `text-fg hover:bg-surface-2` |
| `danger` | `bg-danger text-white` + bayangan merah |

Ukuran: `md` `h-11 px-5` (default) · `sm` `h-9 px-3.5` · `icon` `size-10`. Dasar: `rounded-xl font-semibold`.
`loading` → spinner + disabled. Ikon selalu `size-4`.
Footer form: tombol **Batal** (`secondary`) lalu tombol aksi utama. Di mobile tombol berderet vertikal penuh (`flex-col-reverse`).

### Card

```jsx
<Card>                                   {/* rounded-2xl bg-surface shadow-card */}
  <CardHeader title="Akses cepat" description="…" actions={…} />
  <CardBody>…</CardBody>
</Card>
<DetailList items={[{ label: 'NIK', value: '…' }, { label: 'Alamat', value: '…', full: true }]} />
```

### Badge

```jsx
<Badge variant="success">Hadir</Badge>   // neutral | info | success | warning | danger
```

`rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide`; latar `/10` + teks `-fg`.
`info` = `bg-accent-soft text-link`, `neutral` = `bg-surface-2 text-fg-muted`.

### Input, Select, Textarea, PasswordInput, FormField

```jsx
<FormField label="Username" required error={errors.username} hint="3–50 karakter">
  <Input autoComplete="off" {...register('username', { required: 'Username wajib diisi' })} />
</FormField>
<Select placeholder="Pilih role" options={[{ value: 'ADMIN', label: 'Admin' }]} {...register('role')} />
<Textarea rows={3} {...register('keterangan')} />
<PasswordInput autoComplete="new-password" {...register('password')} />
```

- `FormField` otomatis menghubungkan `id`, `aria-invalid`, `aria-describedby`; tanda wajib `*` merah.
- Pesan error di bawah field: `text-sm text-danger-fg`; hint: `text-xs text-fg-muted`.
- Input pencarian: ikon `Search` absolut di kiri (`left-3.5 size-4 text-fg-muted`) + `className="pl-10"`.

### Modal & ConfirmDialog

```jsx
<Modal open={open} onClose={onClose} title="Tambah pegawai" description="…" size="md" busy={isPending}
  footer={<><Button variant="secondary" onClick={onClose}>Batal</Button>
           <Button type="submit" form="form-pegawai" loading={isPending}>Simpan</Button></>}>
  <form id="form-pegawai" onSubmit={…} className="grid gap-4 sm:grid-cols-2" noValidate>…</form>
</Modal>

<ConfirmDialog open={…} onClose={…} onConfirm={hapus} loading={…}
  title="Hapus pegawai?" message="Data … akan dihapus." />
```

- Bottom sheet di mobile (`rounded-t-3xl`), terpusat di `sm+` (`rounded-2xl`), ukuran `sm` | `md` | `lg`.
- Backdrop `bg-bahari-950/50 backdrop-blur-[2px]`, fokus dikunci, Esc menutup (kecuali `busy`).
- Tombol submit di footer memakai atribut `form="<id form>"`.
- **Jangan menumpuk modal.** Konfirmasi di dalam modal dibuat inline (mis. "Hapus foto ini?" + Batal/Ya),
  atau tutup modal lalu buka dialog lain (satu state `dialog = { type, data }` per halaman).

### Menu (dropdown aksi)

```jsx
<Menu items={[
  { label: 'Ubah', icon: Pencil, onClick: … },
  bolehUbah && { label: 'Hapus', icon: Trash2, danger: true, onClick: … },  // falsy otomatis dibuang
]} />
```

Pemicu default ikon titik tiga; panel `rounded-xl bg-surface p-1.5 shadow-pop min-w-48`.
Jangan taruh `Menu` di dalam kontainer `overflow-x-auto`/`overflow-hidden` (dropdown terpotong).

### DataTable

```jsx
<DataTable
  columns={[
    { key: 'nama', header: 'Pegawai', mobile: 'title', cell: (r) => … },
    { key: 'jabatan', header: 'Jabatan', mobile: 'subtitle' },
    { key: 'nik', header: 'NIK', cell: (r) => <span className="tabular-nums">{r.nik || '–'}</span> },
    { key: 'foto', header: 'Foto', mobile: false },
  ]}
  rows={data} getRowKey={(r) => r.id} actions={(r) => [ … ]}
  onRowClick={…} isLoading={isLoading} error={error} onRetry={refetch}
  empty={<EmptyState icon={Users} title="Belum ada data" description="…" />}
/>
```

- Tabel di `md+` (header `bg-surface-2`, baris `divide-y divide-border hover:bg-surface-2/50`, sel `px-4 py-3.5 first:pl-6`).
- Di mobile menjadi daftar kartu: kolom `mobile: 'title'` jadi judul, `'subtitle'` di bawahnya, sisanya baris "label: nilai",
  `mobile: false` disembunyikan.
- Sudah menangani skeleton loading, error (`ErrorState` + "Coba lagi"), dan kosong.
- Nilai kosong ditampilkan sebagai `–` (en dash).

### EmptyState / ErrorState

Ikon dalam kotak `size-14 rounded-2xl bg-accent-soft text-link`, judul `font-bold text-heading`, deskripsi `text-sm text-fg-muted`,
aksi opsional. Bedakan "belum ada data" vs "tidak ditemukan (filter)" — yang kedua diberi tombol **Hapus filter**.

### Pagination

`<Pagination page={page} perPage={20} total={total} onPageChange={setPage} />` di bawah tabel (`border-t`),
teks "1–20 dari 120" + tombol ikon kiri/kanan.

### SegmentedControl

```jsx
<SegmentedControl label="Filter role" size="sm" value={role} onChange={setRole}
  options={[{ value: '', label: 'Semua (12)' }, { value: 'ADMIN', label: 'Admin (2)' }]} />
```

Wadah `bg-surface-2 p-1 rounded-xl`; terpilih `bg-accent-gradient text-accent-fg shadow-glow`.

### StatCard, MiniStat, RingkasanStrip

- `StatCard` — kartu angka besar (`text-3xl text-accent`) dengan ikon dalam `bg-accent-soft`.
- `MiniStat` — kartu angka kecil (`text-2xl`), opsional bisa diklik sebagai filter (`ring-2 ring-ring` saat aktif).
- `RingkasanStrip` — ringkasan **paling ringkas**: satu strip `grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-2xl`,
  tiap item `bg-surface px-4 py-2.5` berisi titik warna `size-2` + label `text-xs` + angka `text-lg font-extrabold`;
  item aktif `bg-accent-soft`. Dipakai di monitor harian.

### Spinner, AuthImage

- `<Spinner />` — `Loader2 size-4 animate-spin`.
- `<AuthImage src={foto_url} className="size-9 rounded-xl" />` — gambar dari API yang butuh header `Authorization`
  (foto wajah, foto absen). Diambil sebagai Blob via `useAuthImage`, skeleton saat memuat, ikon `ImageOff` saat gagal.
  **Jangan** memasang URL foto API langsung di `<img src>`.

---

## 9. Pola halaman yang dipakai berulang

### 9.1 Halaman daftar (CRUD)

```
PageHeader (judul, deskripsi, tombol "Tambah …" hanya bila boleh ubah)
Card
 ├─ Toolbar: pencarian (+ filter)
 ├─ DataTable (aksi titik tiga: Ubah, …, Hapus [danger, paling bawah])
 └─ Pagination (bila API berpaginasi)
FormModal (tambah/ubah dalam satu komponen) · ConfirmDialog (hapus)
```

- **Toolbar pencarian + filter:** di mobile/tablet **satu baris grid 5 kolom** — pencarian `col-span-3`, dropdown
  filter `col-span-2`; di `lg` berubah jadi `flex` dengan pencarian `lg:w-80` dan filter berupa `SegmentedControl`.

  ```jsx
  <div className="grid grid-cols-5 items-center gap-2 p-4 sm:gap-3 sm:px-6 lg:flex lg:justify-between">
    <div className="relative col-span-3 min-w-0 lg:w-80">…Search + Input…</div>
    <Select className="col-span-2 min-w-0 lg:hidden" … />
    <div className="hidden shrink-0 lg:block"><SegmentedControl … /></div>
  </div>
  ```
- Pencarian memakai `useDebouncedValue(cari.trim())` (300 ms) lalu dikirim sebagai `?q=` ke API.
- Filter yang perlu dibagikan/ditautkan (riwayat, rekap) disimpan di URL dengan `useSearchParams`.

### 9.2 Form modal

- Satu komponen untuk tambah & ubah (`isEdit = Boolean(data)`), `reset()` di `useEffect` saat `open` berubah.
- Grid `gap-4 sm:grid-cols-2`; field panjang `sm:col-span-2`.
- Validasi klien meniru aturan API (pola, panjang, rentang) dengan pesan Bahasa Indonesia.
- Error API: kode yang dikenal dipetakan ke field (`setError(field, { message: err.message })`),
  sisanya lewat `showFormError(err, setError, FIELDS)` (menandai `details.fields` + toast).
- PUT mengirim **semua** field; field opsional kosong dikirim `null`.
- Sukses → `toast.success('Pegawai berhasil ditambahkan')` lalu tutup modal.

### 9.3 Hak akses di UI

- `const { can } = useAuth(); const bolehUbah = can('pegawai.ubah')` — kunci izin di `src/lib/roles.js`.
- Tombol tambah/ubah/hapus **disembunyikan** (bukan dinonaktifkan) bila tidak berhak; backend tetap penentu akhir.
- Aksi berbahaya pada diri sendiri disembunyikan (mis. hapus akun sendiri).

### 9.4 Avatar

Foto wajah bila ada (`AuthImage`), selain itu inisial: `size-9 rounded-xl bg-accent-soft text-xs font-bold text-link`
(`inisial(nama)` dari `lib/format.js`). Avatar di tabel hanya tampil di `md+` (`hidden md:flex`).

### 9.5 Kotak alert inline

```jsx
<div role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 px-3.5 py-3 text-sm text-danger-fg">
  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {pesan}
</div>
```

Varian: peringatan `bg-warning/10 text-warning-fg`, info `bg-accent-soft text-link`, netral `bg-surface-2 text-fg-muted`.

### 9.6 Area unggah / dropzone

`border-2 border-dashed border-border rounded-3xl text-fg-muted hover:border-ring hover:text-link`;
saat file diseret `border-ring bg-accent-soft text-link`. Pratinjau sebelum simpan diberi label "Belum disimpan".

### 9.7 Peta (Leaflet)

`PetaDasar` (OpenStreetMap) dengan kelas `isolate z-0` supaya pane Leaflet tidak menutupi topbar/modal.
Penanda memakai `divIcon` `.lokasi-pin` (bulatan `primary-500`, border putih 3px); area radius `Circle`
warna `#008DD2`, `fillOpacity: 0.15`.

### 9.8 Halaman login

Bukan layout dua kolom. Pita gradasi bahari di atas (tinggi ~300–340px) dengan tepi bawah bergelombang (SVG `fill-bg`),
satu kartu `max-w-[420px] rounded-3xl bg-surface shadow-pop` di tengah bergaya **kop surat dinas**:
logo + "Kab. Lombok Barat · Kec. Labuapi" + "KANTOR DESA KARANG BONGKOT", lalu **garis ganda** (tebal 3px + tipis 1px, `bg-heading`).
Semboyan "Tutur Tatar Tapsile" di kaki kartu (`bg-surface-2 italic text-xs`).

---

## 10. Format & bahasa

- Semua teks UI Bahasa Indonesia, kalimat biasa (bukan Title Case): "Tambah pegawai", "Simpan perubahan".
- Zona waktu **WITA** (`Asia/Makassar`). Helper di `src/lib/format.js`:
  `formatTanggal` → "24 Agustus 2026", `formatHariTanggal` → "Kamis, 29 Oktober 2026", `formatWaktu` → "27 Okt 2026 09.15",
  `formatJam` → "08.05", `formatDurasi(75)` → "1 j 15 mnt", `hariIniWita()` → "2026-10-29".
- Jam memakai titik (`08.05`), rentang memakai en dash (`08.00–14.00`), nilai kosong `–`.
- Pesan error dari API (`err.message`) sudah berbahasa Indonesia → tampilkan apa adanya.

---

## 11. Aksesibilitas

- Semua elemen interaktif kustom memakai `focusRing`; tombol ikon wajib `aria-label`.
- Ikon dekoratif `aria-hidden="true"`; status loading `aria-busy` / `role="status"`.
- Kontras: teks putih hanya di atas `primary-600`+ / gradasi aksen; di mode gelap teks status memakai varian `-fg`.
- Target sentuh minimal 40–44px (`h-11`, `size-10`).
- Hormati `prefers-reduced-motion` (sudah diatur global di `index.css`).

---

## 12. Do & Don't

**Do**
- Pakai token semantik (`bg-surface`, `text-heading`, `text-fg-muted`, `bg-accent-soft`, `text-link`).
- Pakai komponen di `src/components/ui` sebelum membuat yang baru.
- Kartu tanpa border + `shadow-card`; pemisah seperlunya dengan `divide-border`/`border-border`.
- Mobile-first; cek tampilan kartu (DataTable mobile) dan bottom sheet (Modal).
- Satu aksi utama (`primary`) per area; sisanya `secondary`/`ghost`.

**Don't**
- Jangan hard-code hex atau `bg-white`/`text-black` di komponen.
- Jangan menumpuk modal di atas modal.
- Jangan memasang URL foto API langsung di `<img src>` (butuh token → `AuthImage`).
- Jangan menimpa kelas display yang bentrok via `className` (tidak ada `tailwind-merge`).
- Jangan menaruh dropdown `Menu` di dalam kontainer yang `overflow` tersembunyi/scroll.
- Jangan membuat layout login dua kolom ala template generik.
