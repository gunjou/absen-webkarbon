import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, FileText, House, UserRound } from "lucide-react";
import { cn, focusRing } from "@/components/ui";
import { LatarMotif } from "@/components/layout/Motif";

const MENU = [
  { to: "/", label: "Beranda", ikon: House, end: true },
  { to: "/riwayat", label: "Riwayat", ikon: CalendarDays },
  { to: "/izin", label: "Izin", ikon: FileText },
  { to: "/profile", label: "Profile", ikon: UserRound },
];

/** Kerangka halaman pegawai: konten + navbar bawah ala aplikasi ponsel. */
export function AppLayout() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-bg px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
      <LatarMotif />
      <div className="relative">
        <Outlet />
      </div>
      <nav
        aria-label="Menu utama"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <ul className="flex rounded-full bg-surface p-1.5 shadow-pop">
          {MENU.map(({ to, label, ikon: Ikon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition",
                    isActive ? "bg-ink text-ink-fg" : "text-fg-muted",
                    focusRing,
                  )
                }
              >
                <Ikon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
