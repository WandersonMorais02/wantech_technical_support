import { X } from 'lucide-react'

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-slate-950 shadow-2xl">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {title}
              </h2>

              {description && (
                <p className="mt-2 text-sm text-slate-400">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
