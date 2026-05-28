import { cn } from '../../utils/cn'

export function TableCell({
  children,
  className,
  head = false,
}) {
  const Tag = head ? 'th' : 'td'

  return (
    <Tag
      className={cn(
        'px-4 py-4 text-left text-sm',
        head
          ? 'font-semibold text-slate-300'
          : 'text-slate-200',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
