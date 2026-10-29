import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { ambil } from '@/api/client'
import { cn, focusRing, Spinner } from '@/components/ui'
import { formatDurasi, formatHariTanggal, formatJam, hariIniWita } from '@/lib/format'

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const FILTER = [
  { value: 'semua', label: 'Semua' },
  { value: 'tepat', label: 'Tepat waktu' },
  { value: 'telat', label: 'Terlambat' },
  { value: 'pulang_cepat', label: 'Pulang cepat' },
  { value: 'izin', label: 'Izin/sakit/cuti/dinas' },
]

const LABEL_STATUS = { IZIN: 'Izin', SAKIT: 'Sakit', CUTI: 'Cuti', DINAS: 'Dinas' }

function kategori(a) {
  if (a.status_kehadiran && a.status_kehadiran !== 'HADIR') return 'izin'
  return a.menit_telat > 0 ? 'telat' : 'tepat'
}

function cocok(a, filter) {
  if (filter === 'semua') return true
  if (filter === 'pulang_cepat') return a.menit_pulang_cepat > 0
  return kategori(a) === filter
}

const jamAtauNull = (iso) => (iso ? formatJam(iso) : null)

export default function Riwayat() {
  // Bulan awal = bulan ini (WITA)
  const [periode, setPeriode] = useState(() => {
    const [t, b] = hariIniWita().split('-').map(Number)
    return { tahun: t, bulan: b }
  })
  const [filter, setFilter] = useState('semua')

  const [tNow, bNow] = hariIniWita().split('-').map(Number)
  const bulanIni = periode.tahun === tNow && periode.bulan === bNow

  const geser = (n) =>
    setPeriode(({ tahun, bulan }) => {
      const i = tahun * 12 + (bulan - 1) + n
      return { tahun: Math.floor(i / 12), bulan: (i % 12) + 1 }
    })

  const riwayat = useQuery({
    queryKey: ['absensi', 'saya', periode.tahun, periode.bulan],
    queryFn: () => ambil('/absensi/saya', { params: { query: periode } }),
  })

  const rekap = riwayat.data?.rekap
  const items = (riwayat.data?.items ?? [])
    .filter((a) => cocok(a, filter))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))

  return (
    <>
      <h1 className="text-2xl font-medium tracking-tight text-heading">Riwayat presensi</h1>

      {/* Pilih bulan */}
      <div className="mt-4 flex items-center justify-between rounded-full bg-surface p-1.5 shadow-card">
        <button
          type="button"
          onClick={() => geser(-1)}
          aria-label="Bulan sebelumnya"
          className={cn('grid size-10 place-items-center rounded-full text-heading hover:bg-surface-2', focusRing)}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-heading">
          {NAMA_BULAN[periode.bulan - 1]} {periode.tahun}
        </p>
        <button
          type="button"
          onClick={() => geser(1)}
          disabled={bulanIni}
          aria-label="Bulan berikutnya"
          className={cn('grid size-10 place-items-center rounded-full text-heading hover:bg-surface-2 disabled:text-fg-muted/40', focusRing)}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Rekap periode */}
      {rekap && (
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-3xl bg-surface p-2 shadow-card">
          <Angka label="Hadir" nilai={`${rekap.hadir}/${rekap.hari_kerja}`} warna="bg-pastel-hijau" />
          <Angka label="Telat" nilai={rekap.telat_kali} warna="bg-pastel-jingga" />
          <Angka label="Izin" nilai={rekap.izin + rekap.sakit + rekap.cuti + rekap.dinas} warna="bg-pastel-biru" />
          <Angka label="Alpha" nilai={rekap.alpha} warna="bg-pastel-merah" />
        </div>
      )}

      {/* Filter status */}
      <div role="radiogroup" aria-label="Filter status" className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {FILTER.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition',
              filter === f.value ? 'bg-ink text-ink-fg' : 'bg-surface text-fg-muted shadow-card',
              focusRing,
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-3">
        {riwayat.isPending && (
          <li className="grid place-items-center py-10">
            <Spinner />
          </li>
        )}
        {riwayat.isError && <li className="rounded-3xl bg-surface p-4 text-sm text-danger-fg shadow-card">{riwayat.error.message}</li>}
        {riwayat.isSuccess && items.length === 0 && (
          <li className="rounded-3xl bg-surface p-6 text-center text-sm text-fg-muted shadow-card">Tidak ada presensi untuk filter ini.</li>
        )}
        {items.map((a) => (
          <ItemRiwayat key={a.id_absensi ?? a.tanggal} a={a} />
        ))}
      </ul>
    </>
  )
}

function ItemRiwayat({ a }) {
  const k = kategori(a)
  const label = k === 'izin' ? LABEL_STATUS[a.status_kehadiran] : k === 'telat' ? 'Terlambat' : 'Tepat waktu'
  return (
    <li className="rounded-3xl bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-heading">{formatHariTanggal(a.tanggal)}</p>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
            k === 'telat' ? 'bg-pastel-jingga text-warning-fg' : k === 'izin' ? 'bg-pastel-biru text-heading' : 'bg-pastel-hijau text-success-fg',
          )}
        >
          {label}
        </span>
      </div>

      {k === 'izin' ? (
        a.keterangan && <p className="mt-2 text-sm text-fg-muted">{a.keterangan}</p>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            <Titik label="Masuk" jam={jamAtauNull(a.jam_masuk)} />
            <span className="flex-1 border-t-2 border-dotted border-border" aria-hidden="true" />
            <Titik label="Pulang" jam={jamAtauNull(a.jam_pulang)} kanan />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
            {a.menit_telat > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pastel-jingga px-2 py-0.5 text-warning-fg">
                <Clock className="size-3" aria-hidden="true" /> Telat {formatDurasi(a.menit_telat)}
              </span>
            )}
            {a.menit_pulang_cepat > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pastel-ungu px-2 py-0.5 text-link">
                <Clock className="size-3" aria-hidden="true" /> Pulang cepat {formatDurasi(a.menit_pulang_cepat)}
              </span>
            )}
            {a.jam_masuk && !a.jam_pulang && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-fg-muted">Tidak absen pulang</span>
            )}
            {a.nama_lokasi_masuk && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-fg-muted">
                <MapPin className="size-3" aria-hidden="true" /> {a.nama_lokasi_masuk}
              </span>
            )}
          </div>
        </>
      )}
    </li>
  )
}

function Titik({ label, jam, kanan }) {
  return (
    <div className={cn(kanan && 'text-right')}>
      <p className="text-base font-semibold text-heading tabular-nums">{jam ?? '--.--'}</p>
      <p className="text-[11px] text-fg-muted">{label}</p>
    </div>
  )
}

function Angka({ label, nilai, warna }) {
  return (
    <div className={cn('rounded-2xl px-1 py-2 text-center', warna)}>
      <p className="text-lg leading-tight font-semibold text-heading tabular-nums">{nilai}</p>
      <p className="text-[11px] font-medium text-fg-muted">{label}</p>
    </div>
  )
}
