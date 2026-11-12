import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paperclip, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge, cn, ErrorState, focusRing, Spinner } from "@/components/ui";
import { HeaderKembali } from "@/components/layout/HeaderKembali";
import { api } from "@/lib/api";
import { formatWaktu } from "@/lib/format";
import { judulPengajuan, rentangPengajuan, simpanBlob, STATUS_PERIZINAN } from "@/lib/presensi";

export default function IzinDetail() {
  const { id } = useParams();
  const [hasil, setHasil] = useState({ kunci: null, data: null, error: null });
  const [percobaan, setPercobaan] = useState(0);
  const [sibuk, setSibuk] = useState(false);
  const kunci = `${id}|${percobaan}`;

  useEffect(() => {
    let batal = false;
    api(`/presensi/perizinan/${id}`)
      .then((data) => !batal && setHasil({ kunci, data, error: null }))
      .catch((e) => !batal && setHasil({ kunci, data: null, error: e.message }));
    return () => {
      batal = true;
    };
  }, [id, kunci]);

  const p = hasil.kunci === kunci ? hasil.data : null;

  const unduhLampiran = async () => {
    try {
      const blob = await api(`/presensi/perizinan/${id}/lampiran`);
      simpanBlob(blob, `lampiran-${id}.${blob.type === "application/pdf" ? "pdf" : "jpg"}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const batalkan = () =>
    toast("Batalkan pengajuan ini?", {
      id: "konfirmasi-batal-izin",
      action: {
        label: "Ya, batalkan",
        onClick: async () => {
          setSibuk(true);
          try {
            await api(`/presensi/perizinan/${id}/batal`, { method: "PUT" });
            toast.success("Pengajuan dibatalkan");
            setPercobaan((n) => n + 1);
          } catch (e) {
            toast.error(e.message);
          } finally {
            setSibuk(false);
          }
        },
      },
      cancel: { label: "Tidak", onClick: () => {} },
    });

  return (
    <>
      <HeaderKembali judul="Detail pengajuan" ke="/izin" />

      {hasil.kunci === kunci && hasil.error ? (
        <ErrorState message={hasil.error} onRetry={() => setPercobaan((n) => n + 1)} />
      ) : !p ? (
        <div className="grid h-40 place-items-center text-fg-muted">
          <Spinner className="size-6" />
        </div>
      ) : (
        <>
          <section className="rounded-[2rem] bg-surface p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-heading">{judulPengajuan(p)}</p>
                <p className="text-sm text-fg-muted">{rentangPengajuan(p)}</p>
              </div>
              {STATUS_PERIZINAN[p.status] && (
                <Badge variant={STATUS_PERIZINAN[p.status].variant}>{STATUS_PERIZINAN[p.status].label}</Badge>
              )}
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <Baris label="Alasan">{p.alasan}</Baris>
              <Baris label="Diajukan">{formatWaktu(p.created_at)}</Baris>
              {p.reviewed_at && (
                <Baris label="Ditinjau">
                  {formatWaktu(p.reviewed_at)}
                  {p.reviewed_by_name && ` · ${p.reviewed_by_name}`}
                </Baris>
              )}
            </dl>

            {p.catatan_peninjau && (
              <div className="mt-4 rounded-3xl bg-pastel-biru p-4 text-sm text-heading">
                <p className="text-xs text-fg-muted">Catatan peninjau</p>
                <p className="mt-1">{p.catatan_peninjau}</p>
              </div>
            )}

            {p.has_lampiran && (
              <button
                type="button"
                onClick={unduhLampiran}
                className={cn(
                  "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface-2 text-sm font-semibold text-heading",
                  focusRing,
                )}
              >
                <Paperclip className="size-4" aria-hidden="true" /> Unduh lampiran
              </button>
            )}
          </section>

          {p.status === "diajukan" && (
            <button
              type="button"
              onClick={batalkan}
              disabled={sibuk}
              className={cn(
                "mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-pastel-merah font-semibold text-danger-fg transition active:scale-[0.98] disabled:opacity-60",
                focusRing,
              )}
            >
              {sibuk ? <Spinner className="size-5" /> : <XCircle className="size-5" aria-hidden="true" />}
              Batalkan pengajuan
            </button>
          )}
        </>
      )}
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
