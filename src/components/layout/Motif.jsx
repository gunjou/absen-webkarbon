// warna motif = currentColor dari className svg ini (pattern harus di svg yang sama)
export function BelahKetupat({ id, className }) {
  return (
    <svg className={className}>
      <defs>
        <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M18 2 34 18 18 34 2 18Z" fill="none" stroke="currentColor" />
          <path d="M18 12 24 18 18 24 12 18Z" fill="currentColor" opacity=".5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Motif belah ketupat samar menutupi seluruh latar halaman (tanpa memudar). */
export function LatarMotif() {
  return (
    <BelahKetupat
      id="motif-halaman"
      className="pointer-events-none fixed inset-y-0 left-1/2 h-full w-full max-w-md -translate-x-1/2 text-heading/[0.05]"
    />
  );
}
