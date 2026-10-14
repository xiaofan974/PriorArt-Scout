interface PendingRowsProps {
  rows: number;
  label: string;
}

export function PendingRows({ rows, label }: PendingRowsProps) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-white/60 px-4 py-4" role="status">
      <p className="text-[13px] text-ink-3">{label}</p>
      <div className="mt-3 space-y-2.5" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) =>
        <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-8 animate-pulse rounded bg-subtle" />
            <div className="h-3 animate-pulse rounded bg-subtle" style={{ width: `${70 - i * 12}%` }} />
          </div>
        )}
      </div>
    </div>);

}