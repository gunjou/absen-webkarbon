import { formatTanggal } from "@/lib/format";

// Label & warna Badge untuk status absen dari server
export const STATUS_ABSEN = {
  tepat_waktu: { label: "Tepat waktu", variant: "success" },
  terlambat: { label: "Terlambat", variant: "warning" },
  pulang_cepat: { label: "Pulang cepat", variant: "warning" },
};

export const STATUS_PERIZINAN = {
  diajukan: { label: "Menunggu", variant: "warning" },
  disetujui: { label: "Disetujui", variant: "success" },
  ditolak: { label: "Ditolak", variant: "danger" },
  dibatalkan: { label: "Dibatalkan", variant: "neutral" },
};

/** "2026-11-12" → Date siang WITA, aman untuk formatter tanggal */
export const dariTanggal = (iso) => iso && `${iso}T12:00:00+08:00`;

/** Simpan Blob (lampiran) sebagai file */
export function simpanBlob(blob, nama) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: nama });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function rentangPengajuan(p) {
  if (p.jenis_pengajuan === "koreksi") {
    return `${formatTanggal(dariTanggal(p.tanggal_mulai))} · ${p.jenis_absen} ${p.jam_koreksi?.replace(":", ".")}`;
  }
  const mulai = formatTanggal(dariTanggal(p.tanggal_mulai));
  return p.tanggal_selesai && p.tanggal_selesai !== p.tanggal_mulai
    ? `${mulai} – ${formatTanggal(dariTanggal(p.tanggal_selesai))}`
    : mulai;
}

export const judulPengajuan = (p) =>
  p.jenis_pengajuan === "koreksi" ? "Koreksi absen" : `Izin ${p.jenis_izin_name ?? ""}`.trim();
