import { cn } from '../utils/cn'

export function Card({ children, className }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/10 backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  )
}
