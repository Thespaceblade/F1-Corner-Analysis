type LoadingIndicatorProps = {
  label: string
  compact?: boolean
  className?: string
}

export default function LoadingIndicator({
  label,
  compact = false,
  className = '',
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center text-gray-400 ${
        compact ? 'gap-2 text-xs' : 'flex-col gap-3 text-sm'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex ${compact ? 'h-4 w-4' : 'h-9 w-9'}`}
      >
        <span className="absolute inset-0 rounded-full border-2 border-white/10" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/40 motion-safe:animate-spin" />
        <span className="absolute inset-[35%] rounded-full bg-accent motion-safe:animate-pulse" />
      </span>
      <span>{label}</span>
    </div>
  )
}
