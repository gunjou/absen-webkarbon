import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Plus } from "lucide-react";
import { Badge, cn, EmptyState, ErrorState, focusRing, PageHeader, SegmentedControl, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { judulPengajuan, rentangPengajuan, STATUS_PERIZINAN } from "@/lib/presensi";

const FILTER = [
  { value: "", label: "Semua" },
  { value: "diajukan", label: "Menunggu" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
];

export default function Izin() {
  const [status, setStatus] = useState("");
  const [hasil, setHasil] = useState({ kunci: null, data: null, error: null });
  const [percobaan, setPercobaan] = useState(0);
  const kunci = `${status}|${percobaan}`;

  useEffect(() => {
    let batal = false;
    api(`/presensi/perizinan${status ? `?status=${status}` : ""}`)
      .then((data) => !batal && setHasil({ kunci, data: data ?? [], error: null }))
      .catch((e) => !batal && setHasil({ kunci, data: null, error: e.message }));
    return () => {
      batal = true;
    };
  }, [status, kunci]);

  const memuat = hasil.kunci !== kunci;

  return (
    <>
      <PageHeader
        title="Izin"
        className="mb-4"
        actions={
          <Link
            to="/izin/baru"
            className={cn("flex h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-ink-fg", focusRing)}
          >
            <Plus className="size-4" aria-hidden="true" /> Ajukan
          </Link>
        }
      />

      <SegmentedControl
        label="Filter status"
        options={FILTER}
        value={status}
        onChange={setStatus}
        size="sm"
        className="flex w-full [&>button]:flex-1"
      />

      <div className="mt-4 space-y-3">
        {memuat ? (
          <div className="grid h-40 place-items-center text-fg-muted">
            <Spinner className="size-6" />
          </div>
        ) : hasil.error ? (
          <ErrorState message={hasil.error} onRetry={() => setPercobaan((n) => n + 1)} />
        ) : hasil.data.length === 0 ? (
          <EmptyState icon={FileText} title="Belum ada pengajuan" description="Ajukan izin atau koreksi absen lewat tombol Ajukan." />
        ) : (
          hasil.data.map((p) => {
            const st = STATUS_PERIZINAN[p.status];
            return (
              <Link
                key={p.id_perizinan}
                to={`/izin/${p.id_perizinan}`}
                className={cn("flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-card", focusRing)}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl text-heading",
                    p.jenis_pengajuan === "koreksi" ? "bg-pastel-biru" : "bg-pastel-ungu",
                  )}
                >
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-heading">{judulPengajuan(p)}</p>
                  <p className="truncate text-sm text-fg-muted">{rentangPengajuan(p)}</p>
                </div>
                {st && <Badge variant={st.variant}>{st.label}</Badge>}
                <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
