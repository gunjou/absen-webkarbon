// Semua tanggal/jam ditampilkan dalam WITA (Asia/Makassar)
export const ZONA_WAKTU = 'Asia/Makassar'

const KOSONG = '–'

function keDate(nilai) {
  if (nilai == null || nilai === '') return null
  const d = nilai instanceof Date ? nilai : new Date(nilai)
  return Number.isNaN(d.getTime()) ? null : d
}

function bagian(d, opsi) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('id-ID', { timeZone: ZONA_WAKTU, ...opsi })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  )
}

/** "24 Agustus 2026" */
export function formatTanggal(nilai) {
  const d = keDate(nilai)
  if (!d) return KOSONG
  return new Intl.DateTimeFormat('id-ID', { timeZone: ZONA_WAKTU, day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

/** "Kamis, 29 Oktober 2026" */
export function formatHariTanggal(nilai) {
  const d = keDate(nilai)
  if (!d) return KOSONG
  const p = bagian(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`
}

/** "08.05" */
export function formatJam(nilai) {
  const d = keDate(nilai)
  if (!d) return KOSONG
  const p = bagian(d, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  return `${p.hour}.${p.minute}`
}

/** "27 Okt 2026 09.15" */
export function formatWaktu(nilai) {
  const d = keDate(nilai)
  if (!d) return KOSONG
  const p = bagian(d, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${p.day} ${p.month.replace('.', '')} ${p.year} ${formatJam(d)}`
}

/** formatDurasi(75) → "1 j 15 mnt" (masukan dalam menit) */
export function formatDurasi(menit) {
  if (menit == null || Number.isNaN(menit)) return KOSONG
  const j = Math.floor(menit / 60)
  const m = Math.round(menit % 60)
  if (j === 0) return `${m} mnt`
  if (m === 0) return `${j} j`
  return `${j} j ${m} mnt`
}

/** "2026-10-29" (tanggal hari ini di WITA) */
export function hariIniWita() {
  const p = bagian(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })
  return `${p.year}-${p.month}-${p.day}`
}

/** "Budi Santoso" → "BS" */
export function inisial(nama) {
  if (!nama) return '?'
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase())
    .join('')
}
