import { useEffect, useRef, useState } from 'react'
import { Camera, MapPin, RotateCcw, X } from 'lucide-react'
import { cn, focusRing, Spinner } from '@/components/ui'

/**
 * Lembar layar penuh: kamera depan + lokasi GPS untuk absen.
 * onKirim({ foto: Blob, latitude, longitude, akurasi }) → Promise; galat ditampilkan di lembar.
 */
export function KameraAbsen({ judul, onKirim, onTutup }) {
  const videoRef = useRef(null)
  const [galatKamera, setGalatKamera] = useState(() =>
    navigator.mediaDevices ? null : 'Browser ini tidak mendukung kamera (butuh HTTPS).',
  )
  const [posisi, setPosisi] = useState(null)
  const [galatLokasi, setGalatLokasi] = useState(() => (navigator.geolocation ? null : 'Browser ini tidak mendukung GPS.'))
  const [foto, setFoto] = useState(null) // { blob, url }
  const [mengirim, setMengirim] = useState(false)
  const [galat, setGalat] = useState(null)

  // Kamera depan
  useEffect(() => {
    let stream
    let batal = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 } }, audio: false })
      .then((s) => {
        if (batal) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setGalatKamera('Kamera tidak bisa dibuka. Izinkan akses kamera di browser.'))
    return () => {
      batal = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // Lokasi GPS, diperbarui terus agar akurasi membaik
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPosisi(p.coords)
        setGalatLokasi(null)
      },
      () => setGalatLokasi('Lokasi tidak bisa dibaca. Nyalakan GPS dan izinkan akses lokasi.'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto])

  const jepret = () => {
    const v = videoRef.current
    if (!v?.videoWidth) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob((blob) => blob && setFoto({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.9)
  }

  const kirim = async () => {
    setGalat(null)
    setMengirim(true)
    try {
      await onKirim({ foto: foto.blob, latitude: posisi.latitude, longitude: posisi.longitude, akurasi: posisi.accuracy })
    } catch (e) {
      setGalat(e.message)
      setFoto(null)
    } finally {
      setMengirim(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={judul} className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-bg">
      <div className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <h2 className="text-xl font-medium text-heading">{judul}</h2>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup"
          className={cn('grid size-11 place-items-center rounded-full bg-surface text-heading shadow-card', focusRing)}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="relative mx-5 aspect-[3/4] overflow-hidden rounded-[2rem] bg-ink">
        {galatKamera ? (
          <p className="grid h-full place-items-center p-6 text-center text-sm text-ink-fg">{galatKamera}</p>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={cn('size-full -scale-x-100 object-cover', foto && 'hidden')} />
            {foto && <img src={foto.url} alt="Pratinjau foto" className="size-full -scale-x-100 object-cover" />}
            <div className="pointer-events-none absolute inset-[18%] rounded-[50%] border-2 border-dashed border-white/60" aria-hidden="true" />
          </>
        )}
      </div>

      <p
        className={cn(
          'mx-5 mt-3 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm',
          galatLokasi ? 'bg-danger/10 text-danger-fg' : 'bg-surface text-fg-muted',
        )}
      >
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        {galatLokasi ?? (posisi ? `Lokasi terbaca · akurasi ±${Math.round(posisi.accuracy)} m` : 'Mencari lokasi…')}
      </p>

      {galat && (
        <p role="alert" className="mx-5 mt-2 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger-fg">
          {galat}
        </p>
      )}

      <div className="mt-auto flex gap-3 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {foto ? (
          <>
            <button
              type="button"
              onClick={() => setFoto(null)}
              disabled={mengirim}
              aria-label="Foto ulang"
              className={cn('grid size-14 shrink-0 place-items-center rounded-full bg-surface text-heading shadow-card', focusRing)}
            >
              <RotateCcw className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={kirim}
              disabled={mengirim || !posisi}
              className={cn(
                'flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg disabled:bg-surface-2 disabled:text-fg-muted',
                focusRing,
              )}
            >
              {mengirim ? <Spinner /> : 'Kirim presensi'}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={jepret}
            disabled={!!galatKamera}
            className={cn(
              'flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg disabled:bg-surface-2 disabled:text-fg-muted',
              focusRing,
            )}
          >
            <Camera className="size-5" aria-hidden="true" /> Ambil foto
          </button>
        )}
      </div>
    </div>
  )
}
