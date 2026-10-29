import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { CalendarDays, FileText, House, UserRound } from "lucide-react";
import { cn, focusRing } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/", label: "Beranda", icon: House, end: true },
  { to: "/riwayat", label: "Riwayat", icon: CalendarDays },
  { to: "/izin", label: "Izin", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

/** Kerangka aplikasi mobile: konten selebar ponsel + navigasi bawah. */
export function MobileLayout() {
  const { pengguna } = useAuth();
  const lokasi = useLocation();
  if (!pengguna)
    return <Navigate to="/login" replace state={{ dari: lokasi.pathname }} />;

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-bg">
      <main className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
        <Outlet />
      </main>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-pop"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                    isActive ? "text-accent" : "text-fg-muted hover:text-fg",
                    focusRing,
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="size-[22px]"
                      strokeWidth={isActive ? 2.4 : 1.8}
                      aria-hidden="true"
                    />
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 h-1 w-8 rounded-t-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
