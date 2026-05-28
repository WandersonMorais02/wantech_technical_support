import { cn } from '../../utils/cn'

export function TableRow({ children, className }) {
  return (
    <tr
      className={cn(
        'border-t border-white/10 transition hover:bg-white/[0.03]',
        className,
      )}
    >
      {children}
    </tr>
  )
}
