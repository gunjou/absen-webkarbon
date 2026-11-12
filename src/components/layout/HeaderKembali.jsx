import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn, focusRing } from "@/components/ui";

/** Judul halaman turunan dengan tombol kembali bulat. */
export function HeaderKembali({ judul, ke }) {
  const navigate = useNavigate();
  return (
    <header className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={() => (ke ? navigate(ke) : navigate(-1))}
        aria-label="Kembali"
        className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-surface text-heading shadow-card", focusRing)}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <h1 className="truncate text-xl font-extrabold tracking-tight text-heading">{judul}</h1>
    </header>
  );
}
