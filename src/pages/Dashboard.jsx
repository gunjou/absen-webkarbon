import { useEffect, useRef, useState } from "react";
import {
  CalendarOff,
  CircleCheck,
  FileText,
  LogIn,
  LogOut,
  ScanFace,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge, cn, ErrorState, focusRing, Spinner } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { STATUS_ABSEN } from "@/lib/presensi";
import { formatHariTanggal, formatJam, inisial } from "@/lib/format";


const STATUS_IZIN = { diajukan: "menunggu persetujuan", disetujui: "disetujui" };

// "08.05" → "08:05" agar bisa dibandingkan dengan jam jadwal (HH:MM)
const jamHHMM = (d) => formatJam(d).replace(".", ":");

/** Salam sesuai jam WITA */
function salam(d) {
  const jam = Number(formatJam(d).slice(0, 2));
  if (jam >= 4 && jam < 11) return "Selamat pagi";
  if (jam >= 11 && jam < 15) return "Selamat siang";
  if (jam >= 15 && jam < 18) return "Selamat sore";
  return "Selamat malam";
}

/** Tentukan apa yang tampil di area aksi; urutan mengikuti aturan API_GUIDE §4. */
function aksiHariIni(data, sekarang) {
  if (!data.hari_kerja) return { jenis: "libur" };
  if (data.izin) return { jenis: "izin" };
  if (data.masuk && data.pulang) return { jenis: "selesai" };
  if (!data.pegawai?.face_enrolled) return { jenis: "wajah" };
  const jam = jamHHMM(sekarang);
  const { jadwal } = data;
  if (data.masuk || (jadwal && jam >= jadwal.pulang)) {
    return { jenis: "absen", absen: "pulang", cepat: !!jadwal && jam < jadwal.pulang };
  }
  if (jadwal && jam < jadwal.masuk_dibuka) return { jenis: "belum_dibuka" };
  return { jenis: "absen", absen: "masuk" };
}

export default function Dashboard() {
  const { pengguna } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selisih, setSelisih] = useState(0); // jam server − jam HP (ms)
  const [sekarang, setSekarang] = useState(() => new Date());

  const [percobaan, setPercobaan] = useState(0); // naik → muat ulang

  useEffect(() => {
    let batal = false;
    api("/presensi/hari-ini")
      .then((hasil) => {
        if (batal) return;
        setSelisih(new Date(hasil.waktu_server).getTime() - Date.now() || 0);
        setData(hasil);
      })
      .catch((e) => !batal && setError(e.message));
    return () => {
      batal = true;
    };
  }, [percobaan]);

  const muatUlang = () => {
    setError(null);
    setPercobaan((n) => n + 1);
  };

  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date(Date.now() + selisih)), 1000);
    return () => clearInterval(t);
  }, [selisih]);

  const navigate = useNavigate();
  const mulaiAbsen = (jenis) =>
    navigate("/absen", { state: { jenis, gpsMax: data.gps_max_akurasi_meter } });

  const tekanAbsen = ({ absen, cepat }) => {
    if (!cepat) return mulaiAbsen(absen);
    toast("Belum jam pulang. Tetap absen pulang?", {
      id: "konfirmasi-pulang-cepat",
      action: { label: "Ya, pulang", onClick: () => mulaiAbsen(absen) },
      cancel: { label: "Batal", onClick: () => {} },
    });
  };

  return (
    <>
      <header className="flex items-center gap-3">
        <MenuAvatar />
        <div className="min-w-0">
          <p className="text-xs text-fg-muted">{salam(sekarang)},</p>
          <p className="truncate font-semibold text-heading">{pengguna?.nama}</p>
        </div>
        <ThemeToggle className="ml-auto" />
      </header>

      <section className="mt-6 rounded-[2rem] bg-surface p-5 shadow-card">
        <p className="text-xs text-fg-muted">{formatHariTanggal(sekarang)}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-heading tabular-nums">
          {formatJam(sekarang)}
          <span className="ml-1 text-base font-medium text-fg-muted">WITA</span>
        </p>

        {error ? (
          <ErrorState message={error} onRetry={muatUlang} className="py-6" />
        ) : !data ? (
          <div className="grid h-40 place-items-center text-fg-muted">
            <Spinner className="size-6" />
          </div>
        ) : (
          <>
            <JalurHari data={data} />
            <AreaAksi aksi={aksiHariIni(data, sekarang)} data={data} onAbsen={tekanAbsen} />
          </>
        )}
      </section>
    </>
  );
}

/** Masuk - - - - → Pulang: jam absen (atau jadwal) di kedua ujung. */
function JalurHari({ data }) {
  const ujung = [
    { label: "Masuk", absen: data.masuk, jadwal: data.jadwal?.masuk },
    { label: "Pulang", absen: data.pulang, jadwal: data.jadwal?.pulang },
  ];
  return (
    <div className="mt-5 flex items-center gap-3">
      {ujung.map(({ label, absen, jadwal }, i) => (
        <div key={label} className="contents">
          {i === 1 && (
            <span
              aria-hidden="true"
              className="mb-6 h-0 flex-1 border-t-2 border-dashed border-border"
            />
          )}
          <div className={cn("flex flex-col gap-1", i === 1 && "items-end text-right")}>
            <p className="text-xs text-fg-muted">{label}</p>
            <p
              className={cn(
                "text-xl font-semibold tabular-nums",
                absen ? "text-heading" : "text-fg-muted",
              )}
            >
              {absen ? formatJam(absen.waktu_absen) : "--.--"}
            </p>
            {absen && STATUS_ABSEN[absen.status] ? (
              <Badge variant={STATUS_ABSEN[absen.status].variant}>
                {STATUS_ABSEN[absen.status].label}
                {absen.terlambat_menit > 0 && ` ${absen.terlambat_menit} mnt`}
              </Badge>
            ) : (
              <p className="text-xs text-fg-muted">
                {jadwal ? `Jadwal ${jadwal.replace(":", ".")}` : "–"}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Ubin({ ikon: Ikon, warna, judul, teks }) {
  return (
    <div className={cn("mt-5 flex items-center gap-3 rounded-3xl p-4", warna)}>
      <Ikon className="size-6 shrink-0 text-heading" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold text-heading">{judul}</p>
        {teks && <p className="text-sm text-fg-muted">{teks}</p>}
      </div>
    </div>
  );
}

function AreaAksi({ aksi, data, onAbsen }) {
  switch (aksi.jenis) {
    case "libur":
      return <Ubin ikon={CalendarOff} warna="bg-pastel-jingga" judul="Bukan hari kerja" teks={data.keterangan} />;
    case "izin":
      return (
        <Ubin
          ikon={FileText}
          warna="bg-pastel-ungu"
          judul={`Izin ${data.izin.jenis_izin_name}`}
          teks={`Status: ${STATUS_IZIN[data.izin.status] ?? data.izin.status}`}
        />
      );
    case "selesai":
      return <Ubin ikon={CircleCheck} warna="bg-pastel-hijau" judul="Presensi hari ini lengkap" teks="Terima kasih, sampai jumpa besok." />;
    case "wajah":
      return <Ubin ikon={ScanFace} warna="bg-pastel-merah" judul="Wajah belum terdaftar" teks="Hubungi admin untuk pendaftaran wajah." />;
    case "belum_dibuka":
      return (
        <button
          type="button"
          disabled
          className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-surface-2 text-base font-semibold text-fg-muted"
        >
          Absen dibuka pukul {data.jadwal.masuk_dibuka.replace(":", ".")}
        </button>
      );
    default: {
      const Ikon = aksi.absen === "masuk" ? LogIn : LogOut;
      return (
        <button
          type="button"
          onClick={() => onAbsen(aksi)}
          className={cn(
            "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98]",
            focusRing,
          )}
        >
          <Ikon className="size-5" aria-hidden="true" /> Absen {aksi.absen === "masuk" ? "Masuk" : "Pulang"}
        </button>
      );
    }
  }
}

/** Avatar yang membuka menu Profile / Keluar. */
function MenuAvatar() {
  const { pengguna, konfirmasiKeluar } = useAuth();
  const [buka, setBuka] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!buka) return;
    const tutupLuar = (e) => !ref.current?.contains(e.target) && setBuka(false);
    const esc = (e) => e.key === "Escape" && setBuka(false);
    document.addEventListener("pointerdown", tutupLuar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", tutupLuar);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);

  const item = cn(
    "flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium hover:bg-surface-2",
    focusRing,
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={buka}
        aria-label="Menu akun"
        className={cn(
          "grid size-11 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg",
          focusRing,
        )}
      >
        {inisial(pengguna?.nama)}
      </button>
      {buka && (
        <div
          role="menu"
          className="absolute top-full left-0 z-30 mt-2 w-48 rounded-3xl bg-surface p-1.5 shadow-pop"
        >
          <Link role="menuitem" to="/profile" className={cn(item, "text-heading")}>
            <UserRound className="size-5" aria-hidden="true" /> Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setBuka(false);
              konfirmasiKeluar();
            }}
            className={cn(item, "text-danger-fg")}
          >
            <LogOut className="size-5" aria-hidden="true" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}
