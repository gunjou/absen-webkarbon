import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleAlert, LockKeyhole, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { cn, focusRing, FormField, Input, PasswordInput, Spinner } from '@/components/ui'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import logoDesa from '@/assets/logo-karang-bongkot.png'

export default function Login() {
  const { pengguna, login } = useAuth()
  const navigate = useNavigate()
  const lokasi = useLocation()
  const [galat, setGalat] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '' } })

  if (pengguna) return <Navigate to="/" replace />

  const kirim = async (data) => {
    setGalat(null)
    try {
      const sesi = await login(data)
      toast.success(`Selamat datang, ${sesi.pegawai?.nama ?? sesi.user?.nama}`)
      navigate(lokasi.state?.dari ?? '/', { replace: true })
    } catch (e) {
      setGalat(pesanGalat(e))
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-bg">
      {/* Panel atas bergaya ilustrasi */}
      <div className="relative overflow-hidden rounded-b-[2.5rem] bg-pastel-biru px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-24">
        <div className="absolute -top-16 -right-20 size-64 rounded-full border-[28px] border-white/40 dark:border-white/5" aria-hidden="true" />
        <div className="absolute top-28 -left-10 size-32 rounded-full bg-pastel-ungu" aria-hidden="true" />
        <div className="relative">
          <ThemeToggle className="absolute top-0 right-0" />
          <img src={logoDesa} alt="Logo Desa Karang Bongkot" className="h-16 w-auto" />
          <h1 className="mt-8 text-[34px] leading-[1.1] font-medium tracking-tight text-heading">
            Presensi
            <br />
            Jadi Lebih Mudah
          </h1>
          <p className="mt-3 text-sm text-fg-muted">Kantor Desa Karang Bongkot</p>
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
          <p className="text-sm text-fg-muted">Gunakan NIP / username dari admin desa.</p>
        </div>

        {galat && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl bg-danger/10 p-3 text-sm text-danger-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {galat}
          </div>
        )}

        <FormField label="Username" error={errors.username}>
          <IkonField icon={UserRound}>
            <Input
              autoComplete="username"
              placeholder="contoh: 1987xxxx"
              className="h-13 rounded-2xl pl-12"
              {...register('username', { required: 'Username wajib diisi' })}
            />
          </IkonField>
        </FormField>

        <FormField label="Kata sandi" error={errors.password}>
          <IkonField icon={LockKeyhole}>
            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••"
              className="[&_input]:h-13 [&_input]:rounded-2xl [&_input]:pl-12"
              {...register('password', { required: 'Kata sandi wajib diisi' })}
            />
          </IkonField>
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98] disabled:opacity-70',
            focusRing,
          )}
        >
          {isSubmitting ? <Spinner /> : <>Masuk <ArrowRight className="size-5" aria-hidden="true" /></>}
        </button>
      </form>

      <p className="mt-auto px-6 py-6 text-center text-xs text-fg-muted">
        Lupa kata sandi? Hubungi operator kantor desa.
      </p>
    </div>
  )
}

function pesanGalat(e) {
  if (e.kode === 'BUKAN_PEGAWAI' || e.status === 403) return 'Akun ini bukan akun pegawai.'
  if (e.status === 401 || e.status === 400) return 'Username atau kata sandi salah.'
  return e.message
}

function IkonField({ icon: Icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-surface text-fg-muted">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      {children}
    </div>
  )
}
