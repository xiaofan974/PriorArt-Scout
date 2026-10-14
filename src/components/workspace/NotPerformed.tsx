interface NotPerformedProps {
  label: string;
}

export function NotPerformed({ label }: NotPerformedProps) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-white/60 px-4 py-4" role="status">
      <p className="text-[13px] font-medium text-ink-2">Not performed</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{label}</p>
    </div>);

}
