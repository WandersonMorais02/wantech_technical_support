import { cn } from '../../utils/cn'

export function Table({ children, className }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <div className="overflow-x-auto">
        <table className={cn('w-full border-collapse', className)}>
          {children}
        </table>
      </div>
    </div>
  )
}
