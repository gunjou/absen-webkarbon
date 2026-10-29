import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  ChevronDown,
  UserRound,
  ScanFace,
  Briefcase,
  FileText,
  Fingerprint,
  HeartPulse,
  LogIn,
  LogOut,
  MapPin,
  Palmtree,
  Plane,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ambil, api } from "@/api/client";
import { cn, focusRing, Spinner } from "@/components/ui";
import { KameraAbsen } from "@/components/absen/KameraAbsen";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import {
  formatDurasi,
  formatHariTanggal,
  formatJam,
  hariIniWita,
  inisial,
} from "@/lib/format";

// Ubin pengajuan — warna mengikuti referensi (pastel)
const JENIS_IZIN = [
  { jenis: "izin", label: "Izin", icon: Briefcase, warna: "bg-pastel-biru" },
  {
    jenis: "sakit",
    label: "Sakit",
    icon: HeartPulse,
    warna: "bg-pastel-hijau",
  },
  { jenis: "dinas", label: "Dinas", icon: Plane, warna: "bg-pastel-ungu" },
  { jenis: "cuti", label: "Cuti", icon: Palmtree, warna: "bg-pastel-jingga" },
];

// Pesan untuk kode galat POST /absensi/masuk|pulang
const LABEL_JENIS_IZIN = {
  IZIN: "Izin",
  SAKIT: "Sakit",
  CUTI: "Cuti",
  DINAS: "Dinas",
};

const PESAN_GALAT = {
  WAJAH_BELUM_TERDAFTAR: "Wajah belum terdaftar, hubungi admin.",
  LOKASI_BELUM_DIATUR: "Lokasi absen belum diatur admin.",
  BUKAN_HARI_KERJA: "Hari ini bukan hari kerja.",
  AKURASI_GPS_RENDAH:
    "Akurasi GPS terlalu rendah. Pindah ke tempat terbuka lalu coba lagi.",
  DI_LUAR_RADIUS: "Anda berada di luar radius kantor.",
  FOTO_TIDAK_VALID: "Foto tidak valid, silakan foto ulang.",
  FILE_KOSONG: "Foto kosong, silakan foto ulang.",
  WAJAH_TIDAK_TERDETEKSI:
    "Wajah tidak terdeteksi. Pastikan wajah terlihat jelas.",
  WAJAH_LEBIH_DARI_SATU: "Terdeteksi lebih dari satu wajah. Foto sendirian.",
  WAJAH_TIDAK_COCOK: "Wajah tidak cocok dengan data terdaftar.",
  BUKAN_PEGAWAI: "Akun ini bukan akun pegawai.",
  SUDAH_ADA_KETERANGAN: "Hari ini Anda sudah tercatat izin/sakit/cuti/dinas.",
  SUDAH_ABSEN_MASUK: "Anda sudah absen masuk hari ini.",
};

const jamAtauNull = (iso) => (iso ? formatJam(iso) : null);

function sapaan(d) {
  const j = Number(formatJam(d).slice(0, 2));
  if (j < 11) return "Selamat pagi";
  if (j < 15) return "Selamat siang";
  if (j < 18) return "Selamat sore";
  return "Selamat malam";
}

function useJam() {
  const [sekarang, setSekarang] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return sekarang;
}

export default function Dashboard() {
  const { pengguna, pegawai } = useAuth();
  const sekarang = useJam();
  const hariIni = useQuery({
    queryKey: ["absensi", "saya", "hari-ini"],
    queryFn: () => ambil("/absensi/saya/hari-ini"),
  });
  const riwayat = useQuery({
    queryKey: ["absensi", "saya"],
    queryFn: () => ambil("/absensi/saya"),
  });

  const status = hariIni.data;
  const dariApi = status?.absensi;
  const absen = {
    masuk: jamAtauNull(dariApi?.jam_masuk),
    pulang: jamAtauNull(dariApi?.jam_pulang),
  };
  const rekap = riwayat.data?.rekap;
  const izinMenunggu = useQuery({
    queryKey: ["perizinan", "saya", "PENDING"],
    queryFn: () =>
      ambil("/perizinan/saya", {
        params: { query: { status: "PENDING", per_page: 1 } },
      }),
  });
  const menunggu = izinMenunggu.data?.total ?? 0;

  // Izin yang mencakup hari ini (menunggu atau disetujui) → tombol absen dikunci
  const izinSaya = useQuery({
    queryKey: ["perizinan", "saya", "semua"],
    queryFn: () =>
      ambil("/perizinan/saya", { params: { query: { per_page: 100 } } }),
  });
  const tanggalIni = hariIniWita();
  const izinHariIni = (izinSaya.data?.items ?? []).find(
    (i) =>
      ["PENDING", "DISETUJUI"].includes(i.status_izin) &&
      i.tanggal_mulai <= tanggalIni &&
      tanggalIni <= i.tanggal_selesai,
  );

  // Tahap mengikuti izin dari server (bisa_masuk / bisa_pulang)
  const tahap = izinHariIni
    ? "izin"
    : status?.bisa_masuk
      ? "masuk"
      : status?.bisa_pulang
        ? "pulang"
        : absen.pulang
          ? "selesai"
          : "tutup";
  const wajahBelum = status
    ? status.wajah_terdaftar === false
    : pegawai?.id_wajah == null;
  const [kameraBuka, setKameraBuka] = useState(false);

  const queryClient = useQueryClient();
  const kirimAbsen = useMutation({
    mutationFn: async ({ foto, latitude, longitude, akurasi }) => {
      const form = new FormData();
      form.append("foto", foto, "selfie.jpg");
      form.append("latitude", latitude);
      form.append("longitude", longitude);
      form.append("akurasi", akurasi);
      const path = tahap === "pulang" ? "/absensi/pulang" : "/absensi/masuk";
      const { data, error } = await api.POST(path, {
        body: form,
        bodySerializer: (b) => b,
      });
      if (error)
        throw new Error(
          PESAN_GALAT[error?.error?.code] ??
            error?.error?.message ??
            "Presensi gagal",
        );
      return data.data;
    },
    onSuccess: (a) => {
      const jam = tahap === "pulang" ? a?.jam_pulang : a?.jam_masuk;
      toast.success(
        `Absen ${tahap} tercatat${jam ? ` pukul ${formatJam(jam)}` : ""}`,
      );
      setKameraBuka(false);
      queryClient.invalidateQueries({ queryKey: ["absensi", "saya"] });
    },
  });

  return (
    <>
      {/* Baris atas */}
      <header className="flex items-center gap-3">
        <MenuAkun pengguna={pengguna} />
        <ThemeToggle className="ml-auto" />
        {/* <button
          type="button"
          aria-label="Notifikasi"
          className={cn(
            "relative grid size-11 place-items-center rounded-full bg-surface shadow-card",
            focusRing,
          )}
        >
          <Bell className="size-5 text-heading" aria-hidden="true" />
          <span
            className="absolute top-2 right-2.5 size-2 rounded-full bg-danger"
            aria-hidden="true"
          />
        </button> */}
      </header>

      <h1 className="mt-5 text-xl font-medium tracking-tight text-heading">
        {sapaan(sekarang)}, {pengguna?.nama?.split(" ").slice(0, 2).join(" ")}
      </h1>

      {wajahBelum && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-3xl bg-pastel-jingga p-4"
        >
          <ScanFace
            className="mt-0.5 size-5 shrink-0 text-warning-fg"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-heading">
              Wajah belum terdaftar
            </p>
            <p className="text-sm text-fg-muted">
              Hubungi admin desa untuk mendaftarkan wajah Anda. Sebelum itu,
              absen akan ditolak.
            </p>
          </div>
        </div>
      )}

      {/* Kartu presensi hari ini */}
      <section
        className="mt-6 rounded-[2rem] bg-surface p-5 shadow-card"
        aria-labelledby="judul-presensi"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="judul-presensi" className="text-xs text-fg-muted">
              {formatHariTanggal(sekarang)}
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-heading tabular-nums">
              {formatJam(sekarang)}
              <span className="ml-1 text-base font-medium text-fg-muted">
                WITA
              </span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pastel-hijau px-2.5 py-1 text-[11px] font-semibold text-success-fg">
            <MapPin className="size-3" aria-hidden="true" />
            {status && !status.hari_kerja
              ? (status.libur?.keterangan ?? "Libur")
              : (dariApi?.nama_lokasi_masuk ?? "Belum absen")}
          </span>
        </div>

        {/* Garis masuk → pulang, seperti rute pada referensi */}
        <div className="mt-5 flex items-center gap-3">
          <TitikWaktu label="Masuk" jam={absen.masuk} />
          <div className="flex flex-1 items-center" aria-hidden="true">
            <span
              className={cn(
                "size-2 rounded-full",
                absen.masuk ? "bg-accent" : "bg-border",
              )}
            />
            <span className="mx-1 flex-1 border-t-2 border-dashed border-border" />
            <span
              className={cn(
                "size-2 rounded-full",
                absen.pulang ? "bg-accent" : "bg-border",
              )}
            />
          </div>
          <TitikWaktu label="Pulang" jam={absen.pulang} rata="kanan" />
        </div>

        {dariApi?.menit_telat > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pastel-jingga px-3 py-1 text-xs font-semibold text-warning-fg">
            <Clock className="size-3.5" aria-hidden="true" />
            Terlambat {formatDurasi(dariApi.menit_telat)}
          </p>
        )}

        <button
          type="button"
          onClick={() => setKameraBuka(true)}
          disabled={!["masuk", "pulang"].includes(tahap) || wajahBelum}
          className={cn(
            "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98] disabled:bg-surface-2 disabled:text-fg-muted",
            focusRing,
          )}
        >
          {tahap === "masuk" && (
            <>
              <LogIn className="size-5" aria-hidden="true" /> Absen Masuk
            </>
          )}
          {tahap === "pulang" && (
            <>
              <LogOut className="size-5" aria-hidden="true" /> Absen Pulang
            </>
          )}
          {tahap === "selesai" && (
            <>
              <Fingerprint className="size-5" aria-hidden="true" /> Presensi
              hari ini selesai
            </>
          )}
          {tahap === "izin" && (
            <>
              <FileText className="size-5" aria-hidden="true" />
              {LABEL_JENIS_IZIN[izinHariIni.jenis]} ·{" "}
              {izinHariIni.status_izin === "PENDING" ? "Menunggu" : "Disetujui"}
            </>
          )}
          {tahap === "tutup" &&
            (hariIni.isPending ? <Spinner /> : "Belum bisa absen saat ini")}
        </button>
        {kameraBuka && (
          <KameraAbsen
            judul={tahap === "pulang" ? "Absen Pulang" : "Absen Masuk"}
            onKirim={kirimAbsen.mutateAsync}
            onTutup={() => setKameraBuka(false)}
          />
        )}
      </section>

      {/* Rekap bulan ini — satu kartu ringkas */}
      <JudulBagian judul="Rekap bulan ini" />
      {riwayat.isError ? (
        <p className="rounded-3xl bg-surface p-4 text-sm text-danger-fg shadow-card">
          {riwayat.error.message}
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-1 rounded-3xl bg-surface p-2 shadow-card">
          <AngkaRekap
            label="Hadir"
            nilai={rekap && `${rekap.hadir}/${rekap.hari_kerja}`}
            warna="bg-pastel-hijau"
          />
          <AngkaRekap
            label="Telat"
            nilai={rekap?.telat_kali}
            warna="bg-pastel-jingga"
          />
          <AngkaRekap
            label="Izin"
            nilai={rekap && rekap.izin + rekap.sakit + rekap.cuti + rekap.dinas}
            warna="bg-pastel-biru"
          />
          <AngkaRekap
            label="Alpha"
            nilai={rekap?.alpha}
            warna="bg-pastel-merah"
          />
        </div>
      )}

      {/* Pengajuan izin — baris ikon ringkas */}
      <JudulBagian judul="Ajukan izin" to="/izin" />
      <div className="grid grid-cols-4 gap-2">
        {JENIS_IZIN.map(({ jenis, label, icon: Icon, warna }) => (
          <Link
            key={jenis}
            to={`/izin?jenis=${jenis}`}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl py-2.5 transition active:scale-95",
              warna,
              focusRing,
            )}
          >
            <Icon
              className="size-5 text-heading/80"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-heading">{label}</span>
          </Link>
        ))}
      </div>
      {menunggu > 0 && (
        <Link
          to="/izin"
          className={cn(
            "mt-2 flex items-center justify-between rounded-2xl bg-surface px-4 py-2.5 text-sm shadow-card",
            focusRing,
          )}
        >
          <span className="text-fg-muted">
            <span className="font-semibold text-heading">{menunggu}</span> izin
            menunggu
          </span>
          <span className="text-xs font-medium text-link">Lihat</span>
        </Link>
      )}
    </>
  );
}

function TitikWaktu({ label, jam, rata, kecil }) {
  return (
    <div className={cn(rata === "kanan" && "text-right")}>
      <p
        className={cn(
          "font-semibold text-heading tabular-nums",
          kecil ? "text-base" : "text-xl",
        )}
      >
        {jam ?? "--.--"}
      </p>
      <p className="text-[11px] text-fg-muted">{label}</p>
    </div>
  );
}

function AngkaRekap({ label, nilai, warna }) {
  return (
    <div className={cn("rounded-2xl px-1 py-2 text-center", warna)}>
      <p className="text-lg leading-tight font-semibold text-heading tabular-nums">
        {nilai ?? "–"}
      </p>
      <p className="text-[11px] font-medium text-fg-muted">{label}</p>
    </div>
  );
}

function JudulBagian({ judul, to }) {
  return (
    <div className="mt-5 mb-2 flex items-center justify-between">
      <h2 className="text-base font-medium text-heading">{judul}</h2>
      {to && (
        <Link
          to={to}
          className={cn("rounded-md text-sm font-medium text-link", focusRing)}
        >
          Lihat semua
        </Link>
      )}
    </div>
  );
}

/** Avatar + jabatan; klik membuka menu Profile / Keluar. */
function MenuAkun({ pengguna }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [buka, setBuka] = useState(false);
  const ref = useRef(null);

  // Tutup saat klik di luar menu
  useEffect(() => {
    if (!buka) return;
    const tutup = (e) => {
      if (!ref.current?.contains(e.target)) setBuka(false);
    };
    document.addEventListener("pointerdown", tutup);
    return () => document.removeEventListener("pointerdown", tutup);
  }, [buka]);

  const keProfile = () => {
    setBuka(false);
    navigate("/profile");
  };

  const keluar = () => {
    localStorage.clear();
    logout();
    navigate("/login", { replace: true });
  };

  // Konfirmasi lewat toast agar tidak langsung keluar
  const konfirmasiKeluar = () => {
    setBuka(false);
    toast("Keluar dari akun?", {
      id: "konfirmasi-keluar",
      duration: 8000,
      action: { label: "Ya, keluar", onClick: keluar },
      cancel: { label: "Tidak", onClick: () => {} },
    });
  };

  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-haspopup="menu"
        aria-expanded={buka}
        className={cn(
          "flex max-w-full items-center gap-2.5 rounded-full bg-surface py-1.5 pr-3 pl-1.5 shadow-card",
          focusRing,
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg">
          {inisial(pengguna?.nama)}
        </span>
        <span className="truncate text-sm font-medium text-heading">
          {pengguna?.jabatan}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-fg-muted transition-transform",
            buka && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {buka && (
        <div
          role="menu"
          className="absolute top-full left-0 z-30 mt-2 w-48 overflow-hidden rounded-2xl bg-surface p-1.5 shadow-pop"
        >
          <button
            type="button"
            role="menuitem"
            onClick={keProfile}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-heading hover:bg-surface-2",
              focusRing,
            )}
          >
            <UserRound className="size-4" aria-hidden="true" /> Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={konfirmasiKeluar}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-fg hover:bg-danger/10",
              focusRing,
            )}
          >
            <LogOut className="size-4" aria-hidden="true" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}
