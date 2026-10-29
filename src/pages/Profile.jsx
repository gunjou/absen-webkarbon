import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  IdCard,
  KeyRound,
  LogOut,
  Phone,
  ScanFace,
} from "lucide-react";
import { ambil, api } from "@/api/client";
import {
  cn,
  focusRing,
  FormField,
  PasswordInput,
  Spinner,
} from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { formatTanggal, inisial } from "@/lib/format";

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const saya = useQuery({
    queryKey: ["pegawai", "me"],
    queryFn: () => ambil("/pegawai/me"),
  });
  const p = saya.data;

  const keluar = () => {
    localStorage.clear();
    logout();
    navigate("/login", { replace: true });
  };

  // Konfirmasi lewat toast agar tidak langsung keluar
  const konfirmasiKeluar = () => {
    toast("Keluar dari akun?", {
      id: "konfirmasi-keluar",
      duration: 8000,
      action: { label: "Ya, keluar", onClick: keluar },
      cancel: { label: "Tidak", onClick: () => {} },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight text-heading">
          Profile
        </h1>
        <ThemeToggle />
      </div>

      {saya.isPending && (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      )}
      {saya.isError && (
        <p className="mt-4 rounded-3xl bg-surface p-4 text-sm text-danger-fg shadow-card">
          {saya.error.message}
        </p>
      )}

      {p && (
        <>
          <section className="relative mt-4 overflow-hidden rounded-[2rem] bg-pastel-biru p-5 text-center">
            <div
              className="absolute -top-12 -right-14 size-40 rounded-full border-[20px] border-white/40 dark:border-white/5"
              aria-hidden="true"
            />
            <FotoWajah pegawai={p} />
            <p className="relative mt-3 text-xl font-medium text-heading">
              {p.nama}
            </p>
            <p className="relative text-sm text-fg-muted">{p.jabatan}</p>
          </section>

          <ul className="mt-4 divide-y divide-border rounded-3xl bg-surface px-4 shadow-card">
            <Baris icon={IdCard} label="NIK" nilai={p.nik} />
            <Baris icon={Phone} label="No. HP" nilai={p.no_hp} />
            <Baris
              icon={CalendarDays}
              label="Mulai bekerja"
              nilai={p.tanggal_mulai && formatTanggal(p.tanggal_mulai)}
            />
            <Baris
              icon={p.wajah_terdaftar ? BadgeCheck : ScanFace}
              label="Wajah"
              nilai={
                p.wajah_terdaftar
                  ? "Terdaftar"
                  : "Belum terdaftar, hubungi admin"
              }
              kelasNilai={
                p.wajah_terdaftar ? "text-success-fg" : "text-warning-fg"
              }
            />
          </ul>
        </>
      )}

      <UbahPassword />

      <button
        type="button"
        onClick={konfirmasiKeluar}
        className={cn(
          "mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-surface text-base font-semibold text-danger-fg shadow-card",
          focusRing,
        )}
      >
        <LogOut className="size-5" aria-hidden="true" /> Keluar
      </button>
    </>
  );
}

// Foto wajah butuh header Authorization → ambil sebagai blob
function FotoWajah({ pegawai }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!pegawai.foto_wajah_url || !pegawai.id_pegawai) return;
    let objUrl;
    let batal = false;
    api
      .GET("/pegawai/{id_pegawai}/wajah/foto", {
        params: { path: { id_pegawai: pegawai.id_pegawai } },
        parseAs: "blob",
      })
      .then(({ data }) => {
        if (batal || !data) return;
        objUrl = URL.createObjectURL(data);
        setUrl(objUrl);
      });
    return () => {
      batal = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [pegawai.foto_wajah_url, pegawai.id_pegawai]);

  return url ? (
    <img
      src={url}
      alt={`Foto ${pegawai.nama}`}
      className="relative mx-auto size-24 rounded-full object-cover ring-4 ring-surface"
    />
  ) : (
    <span className="relative mx-auto grid size-24 place-items-center rounded-full bg-accent text-3xl font-bold text-accent-fg ring-4 ring-surface">
      {inisial(pegawai.nama)}
    </span>
  );
}

function Baris({ icon: Icon, label, nilai, kelasNilai }) {
  return (
    <li className="flex items-center gap-3 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-fg-muted">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-fg-muted">{label}</p>
        <p
          className={cn(
            "truncate text-sm font-medium text-heading",
            kelasNilai,
          )}
        >
          {nilai || "–"}
        </p>
      </div>
    </li>
  );
}

const PESAN_GALAT = {
  PASSWORD_LAMA_SALAH: "Password lama salah.",
  PASSWORD_TERLALU_PENDEK: "Password baru minimal 5 karakter.",
};

function UbahPassword() {
  const [buka, setBuka] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password_lama: "", password_baru: "", konfirmasi: "" },
  });

  const kirim = async ({ password_lama, password_baru }) => {
    const { error } = await api.POST("/auth/ganti-password", {
      body: { password_lama, password_baru },
    });
    if (error) {
      const kode = error?.error?.code;
      const pesan =
        PESAN_GALAT[kode] ?? error?.error?.message ?? "Gagal mengubah password";
      if (kode === "PASSWORD_LAMA_SALAH")
        setError("password_lama", { message: pesan });
      else if (kode === "PASSWORD_TERLALU_PENDEK")
        setError("password_baru", { message: pesan });
      else toast.error(pesan);
      return;
    }
    toast.success("Password berhasil diubah");
    reset();
    setBuka(false);
  };

  return (
    <section className="mt-4 rounded-3xl bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setBuka((b) => !b)}
        aria-expanded={buka}
        className={cn(
          "flex w-full items-center gap-3 rounded-3xl px-4 py-3.5 text-left",
          focusRing,
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pastel-ungu text-heading">
          <KeyRound className="size-4" aria-hidden="true" />
        </span>
        <span className="flex-1 text-sm font-medium text-heading">
          Ubah password
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-fg-muted transition-transform",
            buka && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {buka && (
        <form
          onSubmit={handleSubmit(kirim)}
          noValidate
          className="space-y-3 px-4 pb-4"
        >
          <FormField
            label="Password lama"
            required
            error={errors.password_lama}
          >
            <PasswordInput
              autoComplete="current-password"
              {...register("password_lama", { required: "Wajib diisi" })}
            />
          </FormField>
          <FormField
            label="Password baru"
            required
            hint="Minimal 5 karakter"
            error={errors.password_baru}
          >
            <PasswordInput
              autoComplete="new-password"
              {...register("password_baru", {
                required: "Wajib diisi",
                minLength: { value: 5, message: "Minimal 5 karakter" },
                validate: (v) =>
                  v !== getValues("password_lama") ||
                  "Harus berbeda dari password lama",
              })}
            />
          </FormField>
          <FormField
            label="Ulangi password baru"
            required
            error={errors.konfirmasi}
          >
            <PasswordInput
              autoComplete="new-password"
              {...register("konfirmasi", {
                required: "Wajib diisi",
                validate: (v) =>
                  v === getValues("password_baru") || "Password tidak sama",
              })}
            />
          </FormField>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-semibold text-ink-fg disabled:bg-surface-2 disabled:text-fg-muted",
              focusRing,
            )}
          >
            {isSubmitting ? <Spinner /> : "Simpan password"}
          </button>
        </form>
      )}
    </section>
  );
}
