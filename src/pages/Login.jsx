import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert, LockKeyhole, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  cn,
  focusRing,
  FormField,
  Input,
  PasswordInput,
  Spinner,
} from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { BelahKetupat } from "@/components/layout/Motif";
import logoDesa from "@/assets/logo-karang-bongkot.png";

export default function Login() {
  const { pengguna, login } = useAuth();
  const navigate = useNavigate();
  const lokasi = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: "", password: "" } });

  if (pengguna) return <Navigate to="/" replace />;

  const kirim = async (data) => {
    try {
      const { user } = await login(data);
      toast.success(`Selamat datang, ${user.full_name ?? user.username}`);
      navigate(lokasi.state?.dari ?? "/", { replace: true });
    } catch (e) {
      setError("root", { message: e.message });
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg">
      {/* Panel atas bergaya ilustrasi */}
      <div className="relative px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-24">
        <LatarSongket />
        <div className="relative">
          <ThemeToggle className="absolute top-0 right-0" />
          <img
            src={logoDesa}
            alt="Logo Desa Karang Bongkot"
            className="h-16 w-auto"
          />
          <h1 className="mt-8 text-[34px] leading-[1.1] font-medium tracking-tight text-white">
            Presensi
            <br />
            Jadi Lebih Mudah
          </h1>
          <p className="mt-3 text-sm text-white/75">
            Kantor Desa Karang Bongkot
          </p>
        </div>
      </div>

      {/* Kartu form, menumpuk di atas panel */}
      <form
        onSubmit={handleSubmit(kirim)}
        noValidate
        className="relative mx-5 -mt-16 space-y-4 rounded-[2rem] bg-surface p-5 shadow-pop"
      >
        <div>
          <h2 className="text-lg font-semibold text-heading">Masuk ke akun</h2>
          <p className="text-sm text-fg-muted">
            Gunakan username dari admin desa.
          </p>
        </div>

        {errors.root && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl bg-danger/10 p-3 text-sm text-danger-fg"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {errors.root.message}
          </div>
        )}

        <FormField label="Username" error={errors.username}>
          <IkonField icon={UserRound}>
            <Input
              autoComplete="username"
              placeholder="username"
              className="h-13 rounded-2xl pl-12"
              {...register("username", { required: "Username wajib diisi" })}
            />
          </IkonField>
        </FormField>

        <FormField label="Kata sandi" error={errors.password}>
          <IkonField icon={LockKeyhole}>
            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••"
              className="[&_input]:h-13 [&_input]:rounded-2xl [&_input]:pl-12"
              {...register("password", { required: "Kata sandi wajib diisi" })}
            />
          </IkonField>
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98] disabled:opacity-70",
            focusRing,
          )}
        >
          {isSubmitting ? (
            <Spinner />
          ) : (
            <>
              Masuk <ArrowRight className="size-5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-auto px-6 py-6 text-center text-xs text-fg-muted">
        Lupa kata sandi? Hubungi operator Kantor Desa.
      </p>
    </div>
  );
}

function IkonField({ icon: Icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-surface text-fg-muted">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      {children}
    </div>
  );
}

/* Latar bermotif songket Sasak: kisi belah ketupat + deret tumpal sebagai tepi pita. */
function LatarSongket() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Pita setinggi panel */}
      <div className="absolute inset-0 bg-linear-to-br from-bahari-800 via-bahari-600 to-primary-700">
        <BelahKetupat id="motif-pita" className="absolute inset-0 size-full text-white/[0.07]" />
        {/* cahaya lembut supaya motif tidak terasa datar */}
        <div className="absolute inset-0 bg-radial-[at_70%_0%] from-langit-300/25 to-transparent to-60%" />
        <svg className="absolute inset-x-0 bottom-0 block h-[18px] w-full">
          <defs>
            <pattern id="tumpal" width="28" height="18" patternUnits="userSpaceOnUse">
              <path d="M0 18 14 0 28 18Z" className="fill-bg" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tumpal)" />
        </svg>
      </div>

      {/* Sisa motif samar di bawah pita, memudar ke bawah */}
      <BelahKetupat
        id="motif-latar"
        className="absolute inset-x-0 top-full h-64 w-full text-heading/[0.05] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
    </div>
  );
}
