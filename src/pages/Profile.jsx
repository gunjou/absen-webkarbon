import { LogOut } from "lucide-react";
import { cn, focusRing, PageHeader } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { inisial } from "@/lib/format";

export default function Profile() {
  const { pengguna, konfirmasiKeluar } = useAuth();
  return (
    <>
      <PageHeader title="Profile" />
      <section className="flex items-center gap-4 rounded-[2rem] bg-surface p-5 shadow-card">
        <span className="grid size-14 place-items-center rounded-full bg-accent text-lg font-bold text-accent-fg">
          {inisial(pengguna?.nama)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-heading">{pengguna?.nama}</p>
          <p className="truncate text-sm text-fg-muted">@{pengguna?.username}</p>
        </div>
      </section>

      <dl className="mt-4 space-y-3 rounded-3xl bg-surface p-5 text-sm shadow-card">
        <Baris label="Email">{pengguna?.email || "–"}</Baris>
        <Baris label="Peran">
          {pengguna?.roles?.length ? pengguna.roles.map((r) => r?.name ?? r).join(", ") : "–"}
        </Baris>
      </dl>

      <section className="mt-4 flex items-center rounded-3xl bg-surface p-4 pl-5 shadow-card">
        <p className="font-medium text-heading">Tema tampilan</p>
        <ThemeToggle className="ml-auto bg-surface-2 shadow-none" />
      </section>

      <button
        type="button"
        onClick={konfirmasiKeluar}
        className={cn(
          "mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-pastel-merah font-semibold text-danger-fg transition active:scale-[0.98]",
          focusRing,
        )}
      >
        <LogOut className="size-5" aria-hidden="true" /> Keluar
      </button>
    </>
  );
}

function Baris({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-fg">{children}</dd>
    </div>
  );
}
