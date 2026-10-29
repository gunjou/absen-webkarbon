import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase,
  HeartPulse,
  Palmtree,
  Paperclip,
  Plane,
  Send,
} from "lucide-react";
import { ambil, api } from "@/api/client";
import {
  cn,
  focusRing,
  FormField,
  Input,
  Spinner,
  Textarea,
} from "@/components/ui";
import { formatTanggal, hariIniWita } from "@/lib/format";

const JENIS_IZIN = [
  { jenis: "IZIN", label: "Izin", icon: Briefcase, warna: "bg-pastel-biru" },
  {
    jenis: "SAKIT",
    label: "Sakit",
    icon: HeartPulse,
    warna: "bg-pastel-hijau",
  },
  { jenis: "DINAS", label: "Dinas", icon: Plane, warna: "bg-pastel-ungu" },
  { jenis: "CUTI", label: "Cuti", icon: Palmtree, warna: "bg-pastel-jingga" },
];
const LABEL_JENIS = Object.fromEntries(
  JENIS_IZIN.map((j) => [j.jenis, j.label]),
);

const STATUS = {
  PENDING: { label: "Menunggu", kelas: "bg-pastel-jingga text-warning-fg" },
  DISETUJUI: { label: "Disetujui", kelas: "bg-pastel-hijau text-success-fg" },
  DITOLAK: { label: "Ditolak", kelas: "bg-pastel-merah text-danger-fg" },
  DIBATALKAN: { label: "Dibatalkan", kelas: "bg-surface-2 text-fg-muted" },
};

const FILTER = [
  { value: "", label: "Semua" },
  ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })),
];

// Pesan untuk kode galat POST /perizinan dan /perizinan/{id}/batal
const PESAN_GALAT = {
  LAMPIRAN_WAJIB:
    "Lampiran wajib untuk jenis ini (mis. surat dokter untuk sakit).",
  RENTANG_IZIN_TERLALU_PANJANG: "Rentang tanggal terlalu panjang.",
  FORMAT_FILE_TIDAK_DIDUKUNG: "Lampiran harus JPG, PNG, atau PDF.",
  IZIN_BENTROK: "Tanggal bentrok dengan pengajuan lain.",
  BUKAN_PEGAWAI: "Akun ini bukan akun pegawai.",
  STATUS_IZIN_TIDAK_VALID: "Izin ini sudah tidak bisa dibatalkan.",
  AKSES_DITOLAK: "Anda tidak berhak membatalkan izin ini.",
};

const pesanGalat = (error, cadangan) =>
  PESAN_GALAT[error?.error?.code] ?? error?.error?.message ?? cadangan;

export default function Izin() {
  const [params] = useSearchParams();
  const jenisAwal = params.get("jenis")?.toUpperCase();
  const [tab, setTab] = useState(jenisAwal ? "ajukan" : "daftar");

  return (
    <>
      <h1 className="text-2xl font-medium tracking-tight text-heading">
        Perizinan
      </h1>

      <div
        role="tablist"
        className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-surface p-1.5 shadow-card"
      >
        {[
          ["daftar", "Pengajuan saya"],
          ["ajukan", "Ajukan izin"],
        ].map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={tab === v}
            onClick={() => setTab(v)}
            className={cn(
              "h-10 rounded-full text-sm font-semibold transition",
              tab === v ? "bg-ink text-ink-fg" : "text-fg-muted",
              focusRing,
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "ajukan" ? (
        <FormIzin
          jenisAwal={LABEL_JENIS[jenisAwal] ? jenisAwal : "IZIN"}
          onSelesai={() => setTab("daftar")}
        />
      ) : (
        <DaftarIzin />
      )}
    </>
  );
}

function FormIzin({ jenisAwal, onSelesai }) {
  const queryClient = useQueryClient();
  const hariIni = hariIniWita();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      jenis: jenisAwal,
      tanggal_mulai: hariIni,
      tanggal_selesai: hariIni,
      alasan: "",
    },
  });
  const jenis = useWatch({ control, name: "jenis" });
  const mulai = useWatch({ control, name: "tanggal_mulai" });

  const kirim = async (v) => {
    const form = new FormData();
    form.append("jenis", v.jenis);
    form.append("tanggal_mulai", v.tanggal_mulai);
    form.append("tanggal_selesai", v.tanggal_selesai);
    form.append("alasan", v.alasan.trim());
    if (v.lampiran?.[0]) form.append("lampiran", v.lampiran[0]);
    const { error } = await api.POST("/perizinan", {
      body: form,
      bodySerializer: (b) => b,
    });
    if (error) {
      toast.error(pesanGalat(error, "Pengajuan gagal"));
      return;
    }
    toast.success("Pengajuan izin terkirim, menunggu persetujuan");
    queryClient.invalidateQueries({ queryKey: ["perizinan"] });
    onSelesai();
  };

  return (
    <form
      onSubmit={handleSubmit(kirim)}
      noValidate
      className="mt-4 space-y-4 rounded-[2rem] bg-surface p-5 shadow-card"
    >
      <div
        role="radiogroup"
        aria-label="Jenis izin"
        className="grid grid-cols-4 gap-2"
      >
        {JENIS_IZIN.map(({ jenis: j, label, icon: Icon, warna }) => (
          <button
            key={j}
            type="button"
            role="radio"
            aria-checked={jenis === j}
            onClick={() => setValue("jenis", j)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl py-2.5 ring-2 transition",
              warna,
              jenis === j ? "ring-ink" : "ring-transparent",
              focusRing,
            )}
          >
            <Icon
              className="size-5 text-heading/80"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-heading">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Mulai" required error={errors.tanggal_mulai}>
          <Input
            type="date"
            {...register("tanggal_mulai", { required: "Wajib diisi" })}
          />
        </FormField>
        <FormField label="Selesai" required error={errors.tanggal_selesai}>
          <Input
            type="date"
            min={mulai}
            {...register("tanggal_selesai", {
              required: "Wajib diisi",
              validate: (v) =>
                v >= mulai || "Tidak boleh sebelum tanggal mulai",
            })}
          />
        </FormField>
      </div>

      <FormField label="Alasan" required error={errors.alasan}>
        <Textarea
          rows={3}
          placeholder="Tuliskan alasan singkat"
          {...register("alasan", {
            validate: (v) => !!v.trim() || "Wajib diisi",
          })}
        />
      </FormField>

      <FormField
        label="Lampiran"
        required={jenis === "SAKIT"}
        hint={
          jenis === "SAKIT"
            ? "Surat dokter (JPG/PNG/PDF)"
            : jenis === "DINAS"
              ? "Mis. surat tugas (JPG/PNG/PDF)"
              : "Opsional (JPG/PNG/PDF)"
        }
        error={errors.lampiran}
      >
        <Input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-sm file:font-medium"
          {...register("lampiran", {
            validate: (f) =>
              jenis !== "SAKIT" ||
              f?.length > 0 ||
              "Lampiran wajib untuk sakit",
          })}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg disabled:bg-surface-2 disabled:text-fg-muted",
          focusRing,
        )}
      >
        {isSubmitting ? (
          <Spinner />
        ) : (
          <>
            <Send className="size-5" aria-hidden="true" /> Kirim pengajuan
          </>
        )}
      </button>
    </form>
  );
}

function DaftarIzin() {
  const [status, setStatus] = useState("");
  const daftar = useQuery({
    queryKey: ["perizinan", "saya", status],
    queryFn: () =>
      ambil("/perizinan/saya", {
        params: { query: { per_page: 100, ...(status && { status }) } },
      }),
  });
  const items = daftar.data?.items ?? [];

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Filter status"
        className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1"
      >
        {FILTER.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={status === f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "h-9 shrink-0 rounded-full px-4 text-sm font-medium whitespace-nowrap transition",
              status === f.value
                ? "bg-ink text-ink-fg"
                : "bg-surface text-fg-muted shadow-card",
              focusRing,
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-3">
        {daftar.isPending && (
          <li className="grid place-items-center py-10">
            <Spinner />
          </li>
        )}
        {daftar.isError && (
          <li className="rounded-3xl bg-surface p-4 text-sm text-danger-fg shadow-card">
            {daftar.error.message}
          </li>
        )}
        {daftar.isSuccess && items.length === 0 && (
          <li className="rounded-3xl bg-surface p-6 text-center text-sm text-fg-muted shadow-card">
            Belum ada pengajuan.
          </li>
        )}
        {items.map((i) => (
          <ItemIzin key={i.id_izin} izin={i} />
        ))}
      </ul>
    </>
  );
}

function ItemIzin({ izin }) {
  const queryClient = useQueryClient();
  const s = STATUS[izin.status_izin] ?? STATUS.PENDING;
  const satuHari = izin.tanggal_mulai === izin.tanggal_selesai;

  const batal = useMutation({
    mutationFn: async () => {
      const { error } = await api.POST("/perizinan/{id_izin}/batal", {
        params: { path: { id_izin: izin.id_izin } },
      });
      if (error) throw new Error(pesanGalat(error, "Gagal membatalkan"));
    },
    onSuccess: () => {
      toast.success("Pengajuan dibatalkan");
      queryClient.invalidateQueries({ queryKey: ["perizinan"] });
    },
    onError: (e) => toast.error(e.message),
  });

  // Konfirmasi lewat toast (sonner), bukan confirm() bawaan browser
  const konfirmasiBatal = () =>
    toast(`Batalkan pengajuan ${LABEL_JENIS[izin.jenis].toLowerCase()}?`, {
      id: `batal-${izin.id_izin}`,
      duration: 8000,
      action: { label: "Ya, batalkan", onClick: () => batal.mutate() },
      cancel: { label: "Tidak", onClick: () => {} },
    });

  // Lampiran butuh header Authorization → unduh sebagai blob lalu buka
  const bukaLampiran = async () => {
    const { data, error } = await api.GET("/perizinan/{id_izin}/lampiran", {
      params: { path: { id_izin: izin.id_izin } },
      parseAs: "blob",
    });
    if (error) return toast.error("Lampiran tidak bisa dibuka");
    const url = URL.createObjectURL(data);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <li className="rounded-3xl bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-heading">
          {LABEL_JENIS[izin.jenis]} · {izin.jumlah_hari} hari
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            s.kelas,
          )}
        >
          {s.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-fg-muted">
        {satuHari
          ? formatTanggal(izin.tanggal_mulai)
          : `${formatTanggal(izin.tanggal_mulai)} – ${formatTanggal(izin.tanggal_selesai)}`}
      </p>
      {izin.alasan && <p className="mt-2 text-sm text-fg">{izin.alasan}</p>}
      {izin.catatan_proses && (
        <p className="mt-2 rounded-2xl bg-surface-2 px-3 py-2 text-xs text-fg-muted">
          Catatan{izin.diproses_oleh ? ` ${izin.diproses_oleh}` : ""}:{" "}
          {izin.catatan_proses}
        </p>
      )}

      {(izin.lampiran_url || izin.status_izin === "PENDING") && (
        <div className="mt-3 flex gap-2">
          {izin.lampiran_url && (
            <button
              type="button"
              onClick={bukaLampiran}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-xs font-medium text-heading",
                focusRing,
              )}
            >
              <Paperclip className="size-3.5" aria-hidden="true" /> Lampiran
            </button>
          )}
          {izin.status_izin === "PENDING" && (
            <button
              type="button"
              onClick={konfirmasiBatal}
              disabled={batal.isPending}
              className={cn(
                "ml-auto h-9 rounded-full px-3 text-xs font-semibold text-danger-fg hover:bg-danger/10",
                focusRing,
              )}
            >
              {batal.isPending ? "Membatalkan…" : "Batalkan"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
