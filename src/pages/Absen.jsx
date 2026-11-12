import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, CameraOff, MapPin, MapPinOff, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { cn, focusRing, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDurasi } from "@/lib/format";

const KODE_GPS = { 1: "GPS_PERMISSION_DENIED", 2: "GPS_UNAVAILABLE", 3: "GPS_TIMEOUT" };
const PESAN_GPS = {
  GPS_PERMISSION_DENIED: "Izin lokasi ditolak. Aktifkan izin lokasi untuk aplikasi ini.",
  GPS_UNAVAILABLE: "Lokasi tidak tersedia. Pastikan GPS menyala.",
  GPS_TIMEOUT: "GPS terlalu lama merespons.",
  GPS_UNSUPPORTED: "Perangkat tidak mendukung lokasi.",
};
const PESAN_KAMERA = {
  CAMERA_PERMISSION_DENIED: "Izin kamera ditolak. Aktifkan izin kamera untuk aplikasi ini.",
  CAMERA_NOT_FOUND: "Kamera tidak ditemukan.",
  CAMERA_UNSUPPORTED: "Kamera tidak tersedia (butuh HTTPS).",
  CAMERA_ERROR: "Kamera tidak dapat dibuka.",
};

// Lapor gagal sebelum absen terkirim; fire-and-forget, jangan ganggu pengguna jika ikut gagal
function laporGagal(payload) {
  api("/presensi/gagal", {
    method: "POST",
    body: { ...payload, detail: { user_agent: navigator.userAgent } },
  }).catch(() => {});
}

function kodeKamera(e) {
  if (e?.name === "NotAllowedError" || e?.name === "SecurityError") return "CAMERA_PERMISSION_DENIED";
  if (e?.name === "NotFoundError" || e?.name === "OverconstrainedError") return "CAMERA_NOT_FOUND";
  return "CAMERA_ERROR";
}

export default function Absen() {
  const { state } = useLocation();
  if (!state?.jenis) return <Navigate to="/" replace />;
  return <LayarAbsen jenis={state.jenis} gpsMax={state.gpsMax} />;
}

function LayarAbsen({ jenis, gpsMax }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const sudahLapor = useRef(new Set()); // satu laporan per kode per percobaan
  const [percobaan, setPercobaan] = useState(0);
  const [kamera, setKamera] = useState({ siap: false, error: null });
  const [posisi, setPosisi] = useState(null);
  const [errorGps, setErrorGps] = useState(null);
  const [mengirim, setMengirim] = useState(false);

  const judul = jenis === "masuk" ? "Absen Masuk" : "Absen Pulang";

  const lapor = useCallback(
    (payload) => {
      if (sudahLapor.current.has(payload.error_code)) return;
      sudahLapor.current.add(payload.error_code);
      laporGagal({ jenis, ...payload });
    },
    [jenis],
  );

  // Kamera depan
  useEffect(() => {
    let stream;
    let batal = false;
    const gagal = (kode, pesan) => {
      setKamera({ siap: false, error: kode });
      lapor({ stage: "CAMERA", error_code: kode, error_message: pesan });
    };
    if (!navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() => gagal("CAMERA_UNSUPPORTED", "mediaDevices tidak tersedia"));
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 720 } }, audio: false })
      .then((s) => {
        if (batal) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        videoRef.current.srcObject = s;
        setKamera({ siap: true, error: null });
      })
      .catch((e) => !batal && gagal(kodeKamera(e), `${e?.name}: ${e?.message}`));
    return () => {
      batal = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [percobaan, lapor]);

  // GPS terus dipantau sampai akurasi cukup
  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() => {
        setErrorGps("GPS_UNSUPPORTED");
        lapor({ stage: "GPS", error_code: "GPS_UNSUPPORTED" });
      });
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setErrorGps(null);
        setPosisi(p.coords);
      },
      (e) => {
        const kode = KODE_GPS[e.code] ?? "GPS_ERROR";
        setErrorGps(kode);
        lapor({ stage: "GPS", error_code: kode, error_message: e.message });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [percobaan, lapor]);

  const gpsCukup = posisi && (gpsMax == null || posisi.accuracy <= gpsMax);
  const bisaKirim = kamera.siap && gpsCukup && !mengirim;

  const ulangi = () => {
    sudahLapor.current.clear();
    setKamera({ siap: false, error: null });
    setErrorGps(null);
    setPosisi(null);
    setPercobaan((n) => n + 1);
  };

  const kirim = async () => {
    const video = videoRef.current;
    const skala = Math.min(1, 720 / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * skala);
    canvas.height = Math.round(video.videoHeight * skala);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const foto = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!foto) {
      lapor({ stage: "CAMERA", error_code: "CAMERA_CAPTURE_FAILED" });
      return toast.error("Gagal mengambil foto, coba lagi.");
    }

    const form = new FormData();
    form.append("jenis", jenis);
    form.append("latitude", posisi.latitude);
    form.append("longitude", posisi.longitude);
    form.append("akurasi_gps", posisi.accuracy);
    form.append("foto", foto, "selfie.jpg");

    setMengirim(true);
    try {
      const hasil = await api("/presensi", { method: "POST", body: form });
      const telat = hasil?.terlambat_menit > 0 ? ` · terlambat ${formatDurasi(hasil.terlambat_menit)}` : "";
      toast.success(`${judul} tercatat${telat}`);
      navigate("/", { replace: true });
    } catch (e) {
      // 422 sudah dicatat server; cukup tampilkan pesannya
      toast.error(e.message, { id: "absen-gagal" });
      setMengirim(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
          className={cn("grid size-11 place-items-center rounded-full bg-surface text-heading shadow-card", focusRing)}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold text-heading">{judul}</h1>
      </header>

      <div className="relative mt-5 aspect-[3/4] overflow-hidden rounded-[2rem] bg-surface-2 shadow-card">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("size-full -scale-x-100 object-cover", !kamera.siap && "invisible")}
        />
        {kamera.siap ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[18%] top-[14%] bottom-[22%] rounded-[50%] border-2 border-dashed border-white/80"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-fg-muted">
            {kamera.error ? (
              <div className="flex flex-col items-center gap-2">
                <CameraOff className="size-8" aria-hidden="true" />
                <p className="text-sm">{PESAN_KAMERA[kamera.error]}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="size-8" aria-hidden="true" />
                <p className="text-sm">Membuka kamera…</p>
              </div>
            )}
          </div>
        )}
      </div>

      <StatusGps posisi={posisi} error={errorGps} gpsMax={gpsMax} cukup={gpsCukup} />

      <div className="mt-auto flex flex-col gap-3 pt-5">
        {(kamera.error || errorGps) && (
          <button
            type="button"
            onClick={ulangi}
            className={cn(
              "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-surface font-semibold text-heading shadow-card",
              focusRing,
            )}
          >
            <RotateCw className="size-5" aria-hidden="true" /> Coba lagi
          </button>
        )}
        <button
          type="button"
          onClick={kirim}
          disabled={!bisaKirim}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
            focusRing,
          )}
        >
          {mengirim ? <Spinner className="size-5" /> : <Camera className="size-5" aria-hidden="true" />}
          {mengirim ? "Mengirim…" : "Ambil foto & kirim"}
        </button>
      </div>
    </div>
  );
}

function StatusGps({ posisi, error, gpsMax, cukup }) {
  const Ikon = error ? MapPinOff : MapPin;
  const akurasi = posisi && `±${Math.round(posisi.accuracy)} m`;
  const teks = error
    ? PESAN_GPS[error] ?? "Lokasi tidak dapat dibaca."
    : !posisi
      ? "Mencari lokasi…"
      : cukup
        ? `Lokasi siap (${akurasi})`
        : `Menunggu GPS lebih akurat (${akurasi}, maks ${gpsMax} m)`;
  return (
    <div
      role="status"
      className={cn(
        "mt-4 flex items-center gap-3 rounded-3xl p-4 text-sm text-heading",
        error ? "bg-pastel-merah" : cukup ? "bg-pastel-hijau" : "bg-pastel-jingga",
      )}
    >
      {!error && !cukup ? <Spinner className="size-5 shrink-0" /> : <Ikon className="size-5 shrink-0" aria-hidden="true" />}
      <p>{teks}</p>
    </div>
  );
}
