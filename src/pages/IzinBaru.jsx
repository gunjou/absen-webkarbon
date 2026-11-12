import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, cn, FormField, focusRing, Input, SegmentedControl, Select, Spinner, Textarea } from "@/components/ui";
import { HeaderKembali } from "@/components/layout/HeaderKembali";
import { api } from "@/lib/api";
import { hariIniWita } from "@/lib/format";

const MAKS_LAMPIRAN = 5 * 1024 * 1024;
const TIPE_LAMPIRAN = ["image/jpeg", "image/png", "application/pdf"];

/** "2026-11-12" − n hari */
function mundur(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function IzinBaru() {
  const navigate = useNavigate();
  const hariIni = hariIniWita();
  const [jenisIzin, setJenisIzin] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      jenis_pengajuan: "izin",
      id_jenis_izin: "",
      tanggal_mulai: hariIni,
      tanggal_selesai: hariIni,
      jenis_absen: "masuk",
      jam_koreksi: "",
      alasan: "",
    },
  });

  const [jenis, mulai, idJenis] = useWatch({
    control,
    name: ["jenis_pengajuan", "tanggal_mulai", "id_jenis_izin"],
  });
  const butuhLampiran =
    jenis === "izin" && !!jenisIzin?.find((j) => String(j.id_jenis_izin) === idJenis)?.butuh_lampiran;

  useEffect(() => {
    api("/presensi/jenis-izin")
      .then((d) => setJenisIzin(d ?? []))
      .catch((e) => {
        setJenisIzin([]);
        toast.error(e.message);
      });
  }, []);

  const kirim = async (v) => {
    const form = new FormData();
    form.append("jenis_pengajuan", v.jenis_pengajuan);
    form.append("tanggal_mulai", v.tanggal_mulai);
    form.append("alasan", v.alasan.trim());
    if (v.jenis_pengajuan === "izin") {
      form.append("id_jenis_izin", v.id_jenis_izin);
      form.append("tanggal_selesai", v.tanggal_selesai || v.tanggal_mulai);
    } else {
      form.append("jenis_absen", v.jenis_absen);
      form.append("jam_koreksi", v.jam_koreksi);
    }
    if (v.lampiran?.[0]) form.append("lampiran", v.lampiran[0]);

    try {
      const hasil = await api("/presensi/perizinan", { method: "POST", body: form });
      toast.success("Pengajuan terkirim");
      navigate(hasil?.id_perizinan ? `/izin/${hasil.id_perizinan}` : "/izin", { replace: true });
    } catch (e) {
      setError("root", { message: e.message });
    }
  };

  const cekLampiran = (files) => {
    const f = files?.[0];
    if (!f) return butuhLampiran ? "Lampiran wajib untuk jenis izin ini" : true;
    if (!TIPE_LAMPIRAN.includes(f.type)) return "Format harus JPG, PNG, atau PDF";
    if (f.size > MAKS_LAMPIRAN) return "Ukuran maksimal 5 MB";
    return true;
  };

  return (
    <>
      <HeaderKembali judul="Ajukan" ke="/izin" />

      <form onSubmit={handleSubmit(kirim)} noValidate className="space-y-4 rounded-[2rem] bg-surface p-5 shadow-card">
        <SegmentedControl
          label="Jenis pengajuan"
          options={[
            { value: "izin", label: "Izin" },
            { value: "koreksi", label: "Koreksi absen" },
          ]}
          value={jenis}
          onChange={(v) => {
            setValue("jenis_pengajuan", v);
            if (v === "koreksi" && mulai < mundur(hariIni, 7)) setValue("tanggal_mulai", hariIni);
          }}
          className="flex w-full [&>button]:flex-1"
        />

        {jenis === "izin" ? (
          <>
            <FormField label="Jenis izin" required error={errors.id_jenis_izin}>
              <Select
                placeholder={jenisIzin ? "Pilih jenis izin" : "Memuat…"}
                options={(jenisIzin ?? []).map((j) => ({ value: String(j.id_jenis_izin), label: j.name }))}
                {...register("id_jenis_izin", { required: "Pilih jenis izin" })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Dari" required error={errors.tanggal_mulai}>
                <Input type="date" {...register("tanggal_mulai", { required: "Wajib diisi" })} />
              </FormField>
              <FormField label="Sampai" error={errors.tanggal_selesai}>
                <Input
                  type="date"
                  min={mulai}
                  {...register("tanggal_selesai", {
                    validate: (v) => !v || v >= mulai || "Tidak boleh sebelum tanggal mulai",
                  })}
                />
              </FormField>
            </div>
          </>
        ) : (
          <>
            <FormField label="Tanggal" required error={errors.tanggal_mulai} hint="Hari ini sampai 7 hari ke belakang">
              <Input
                type="date"
                min={mundur(hariIni, 7)}
                max={hariIni}
                {...register("tanggal_mulai", {
                  required: "Wajib diisi",
                  validate: (v) =>
                    jenis !== "koreksi" || (v >= mundur(hariIni, 7) && v <= hariIni) || "Di luar batas 7 hari",
                })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Absen" required>
                <Select
                  options={[
                    { value: "masuk", label: "Masuk" },
                    { value: "pulang", label: "Pulang" },
                  ]}
                  {...register("jenis_absen")}
                />
              </FormField>
              <FormField label="Jam" required error={errors.jam_koreksi}>
                <Input type="time" {...register("jam_koreksi", { required: jenis === "koreksi" && "Wajib diisi" })} />
              </FormField>
            </div>
          </>
        )}

        <FormField label="Alasan" required error={errors.alasan}>
          <Textarea
            rows={3}
            placeholder={jenis === "izin" ? "mis. Demam, istirahat di rumah" : "mis. Lupa absen, HP mati"}
            {...register("alasan", { validate: (v) => !!v.trim() || "Wajib diisi" })}
          />
        </FormField>

        <FormField
          label="Lampiran"
          required={butuhLampiran}
          error={errors.lampiran}
          hint="JPG, PNG, atau PDF, maks 5 MB"
        >
          <Input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="pt-2.5 file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-1 file:text-sm file:font-semibold file:text-heading"
            {...register("lampiran", { validate: cekLampiran })}
          />
        </FormField>

        {errors.root && <Alert>{errors.root.message}</Alert>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98] disabled:opacity-60",
            focusRing,
          )}
        >
          {isSubmitting && <Spinner className="size-5" />}
          {isSubmitting ? "Mengirim…" : "Kirim pengajuan"}
        </button>
      </form>
    </>
  );
}
