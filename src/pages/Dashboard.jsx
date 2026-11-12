import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn, focusRing } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { formatHariTanggal, formatJam, inisial } from "@/lib/format";

// Dashboard dummy: kerangka tampilan saja, belum terhubung API
export default function Dashboard() {
  const { pengguna, logout } = useAuth();
  const navigate = useNavigate();
  const [sekarang, setSekarang] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const konfirmasiKeluar = () =>
    toast("Keluar dari akun?", {
      id: "konfirmasi-keluar",
      action: {
        label: "Ya, keluar",
        onClick: () => {
          logout();
          navigate("/login", { replace: true });
        },
      },
      cancel: { label: "Tidak", onClick: () => {} },
    });

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-bg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-10">
      <header className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-accent text-sm font-bold text-accent-fg">
          {inisial(pengguna?.nama)}
        </span>
        <p className="font-medium text-heading">{pengguna?.nama}</p>
        <ThemeToggle className="ml-auto" />
        <button
          type="button"
          onClick={konfirmasiKeluar}
          aria-label="Keluar"
          className={cn(
            "grid size-11 place-items-center rounded-full bg-surface text-danger-fg shadow-card",
            focusRing,
          )}
        >
          <LogOut className="size-5" aria-hidden="true" />
        </button>
      </header>

      <section className="mt-6 rounded-[2rem] bg-surface p-5 shadow-card">
        <p className="text-xs text-fg-muted">{formatHariTanggal(sekarang)}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-heading tabular-nums">
          {formatJam(sekarang)}
          <span className="ml-1 text-base font-medium text-fg-muted">WITA</span>
        </p>
        <button
          type="button"
          onClick={() => toast.info("Fitur absen belum tersedia")}
          className={cn(
            "mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-ink-fg transition active:scale-[0.98]",
            focusRing,
          )}
        >
          <LogIn className="size-5" aria-hidden="true" /> Absen Masuk
        </button>
      </section>
    </div>
  );
}
