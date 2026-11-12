import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Badge, cn, EmptyState, ErrorState, focusRing, PageHeader, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { formatHariTanggal, formatJam, hariIniWita } from "@/lib/format";
import { STATUS_ABSEN } from "@/lib/presensi";

const pad = (n) => String(n).padStart(2, "0");

/** "2026-11" ± n bulan */
function geserBulan(bulan, n) {
  const [y, m] = bulan.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** Rentang query satu bulan, dipotong di hari ini (server maks 62 hari). */
function rentangBulan(bulan, hariIni) {
  const [y, m] = bulan.split("-").map(Number);
  const akhir = `${bulan}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
  return { mulai: `${bulan}-01`, selesai: akhir < hariIni ? akhir : hariIni };
}

const labelBulan = (bulan) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${bulan}-01T00:00:00Z`),
  );

/** Baris per jenis dari server → satu entri per tanggal, terbaru di atas. */
function kelompokkan(baris) {
  const peta = {};
  for (const b of baris) (peta[b.tanggal] ??= { tanggal: b.tanggal })[b.jenis] = b;
  return Object.values(peta).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

export default function Riwayat() {
  const hariIni = hariIniWita();
  const bulanIni = hariIni.slice(0, 7);
  const [bulan, setBulan] = useState(bulanIni);
  const [hasil, setHasil] = useState({ bulan: null, data: null, error: null });
  const [percobaan, setPercobaan] = useState(0);
  const [foto, setFoto] = useState(null); // { url, judul }

  useEffect(() => {
    let batal = false;
    const { mulai, selesai } = rentangBulan(bulan, hariIni);
    api(`/presensi/riwayat?tanggal_mulai=${mulai}&tanggal_selesai=${selesai}`)
      .then((data) => !batal && setHasil({ bulan, data: kelompokkan(data ?? []), error: null }))
      .catch((e) => !batal && setHasil({ bulan, data: null, error: e.message }));
    return () => {
      batal = true;
    };
  }, [bulan, hariIni, percobaan]);

  const memuat = hasil.bulan !== bulan;
  const hari = memuat ? null : hasil.data;

  const bukaFoto = async (absen, judul) => {
    try {
      const blob = await api(`/presensi/${absen.id_absensi}/foto`);
      setFoto({ url: URL.createObjectURL(blob), judul });
    } catch (e) {
      toast.error(e.status === 404 ? "Foto tidak tersedia." : e.message);
    }
  };

  const tutupFoto = () => {
    URL.revokeObjectURL(foto.url);
    setFoto(null);
  };

  return (
    <>
      <PageHeader title="Riwayat" />

      <div className="flex items-center gap-2 rounded-full bg-surface p-1.5 shadow-card">
        <TombolBulat label="Bulan sebelumnya" onClick={() => setBulan(geserBulan(bulan, -1))}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </TombolBulat>
        <p className="flex-1 text-center font-semibold text-heading capitalize">{labelBulan(bulan)}</p>
        <TombolBulat
          label="Bulan berikutnya"
          disabled={bulan >= bulanIni}
          onClick={() => setBulan(geserBulan(bulan, 1))}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </TombolBulat>
      </div>

      {hari && <Ringkasan hari={hari} />}

      <div className="mt-4 space-y-3">
        {!memuat && hasil.error ? (
          <ErrorState
            message={hasil.error}
            onRetry={() => {
              setHasil((h) => ({ ...h, bulan: null }));
              setPercobaan((n) => n + 1);
            }}
          />
        ) : memuat ? (
          <div className="grid h-40 place-items-center text-fg-muted">
            <Spinner className="size-6" />
          </div>
        ) : hari.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Belum ada presensi" description="Tidak ada catatan di bulan ini." />
        ) : (
          hari.map((h) => <KartuHari key={h.tanggal} hari={h} onFoto={bukaFoto} />)
        )}
      </div>

      {foto && <LihatFoto foto={foto} onTutup={tutupFoto} />}
    </>
  );
}

function TombolBulat({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid size-10 place-items-center rounded-full bg-surface-2 text-heading disabled:opacity-40",
        focusRing,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Ringkasan({ hari }) {
  const hitung = (fn) => hari.filter(fn).length;
  const ubin = [
    { label: "Hadir", nilai: hitung((h) => h.masuk), warna: "bg-pastel-hijau" },
    { label: "Terlambat", nilai: hitung((h) => h.masuk?.status === "terlambat"), warna: "bg-pastel-jingga" },
    { label: "Pulang cepat", nilai: hitung((h) => h.pulang?.status === "pulang_cepat"), warna: "bg-pastel-ungu" },
  ];
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {ubin.map((u) => (
        <div key={u.label} className={cn("rounded-3xl p-3", u.warna)}>
          <p className="text-2xl font-semibold text-heading tabular-nums">{u.nilai}</p>
          <p className="text-xs text-fg-muted">{u.label}</p>
        </div>
      ))}
    </div>
  );
}

function KartuHari({ hari, onFoto }) {
  const koreksi = hari.masuk?.is_koreksi || hari.pulang?.is_koreksi;
  return (
    <article className="rounded-3xl bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-heading">
          {formatHariTanggal(`${hari.tanggal}T12:00:00+08:00`)}
        </p>
        {koreksi && (
          <Badge variant="info" className="ml-auto">
            Koreksi
          </Badge>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <UjungAbsen label="Masuk" absen={hari.masuk} onFoto={onFoto} />
        <span aria-hidden="true" className="h-0 flex-1 border-t-2 border-dashed border-border" />
        <UjungAbsen label="Pulang" absen={hari.pulang} onFoto={onFoto} kanan />
      </div>
    </article>
  );
}

function UjungAbsen({ label, absen, onFoto, kanan }) {
  const status = absen && STATUS_ABSEN[absen.status];
  const isi = (
    <>
      <span className="text-xs text-fg-muted">{label}</span>
      <span className={cn("text-lg font-semibold tabular-nums", absen ? "text-heading" : "text-fg-muted")}>
        {absen ? formatJam(absen.waktu_absen) : "--.--"}
      </span>
      {status && (
        <Badge variant={status.variant}>
          {status.label}
          {absen.terlambat_menit > 0 && ` ${absen.terlambat_menit} mnt`}
        </Badge>
      )}
    </>
  );
  const kelas = cn("flex flex-col gap-1", kanan ? "items-end text-right" : "items-start text-left");
  if (!absen || absen.is_koreksi) return <div className={kelas}>{isi}</div>;
  return (
    <button
      type="button"
      onClick={() => onFoto(absen, `${label} · ${formatJam(absen.waktu_absen)}`)}
      aria-label={`Lihat foto absen ${label.toLowerCase()}`}
      className={cn(kelas, "rounded-xl", focusRing)}
    >
      {isi}
    </button>
  );
}

function LihatFoto({ foto, onTutup }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onTutup();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onTutup]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${foto.judul}`}
      onClick={onTutup}
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"
    >
      <figure className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-surface shadow-pop" onClick={(e) => e.stopPropagation()}>
        <img src={foto.url} alt={`Selfie ${foto.judul}`} className="aspect-[3/4] w-full object-cover" />
        <figcaption className="flex items-center p-3 pl-5">
          <span className="font-medium text-heading">{foto.judul}</span>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className={cn("ml-auto grid size-10 place-items-center rounded-full bg-surface-2 text-heading", focusRing)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </figcaption>
      </figure>
    </div>
  );
}
