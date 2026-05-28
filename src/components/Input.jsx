import { cn } from '../utils/cn'

export function Input({ className, error, ...props }) {
  return (
    <div className="w-full">
      <input
        className={cn(
          'h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-400/10',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/10',
          className,
        )}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  )
}
