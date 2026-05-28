import { ImagePlus, Loader2, X } from 'lucide-react'

export function FileUpload({
  label,
  preview,
  loading,
  onChange,
  onRemove,
}) {
  return (
    <div>
      {label && (
        <p className="mb-3 text-sm font-semibold text-slate-300">
          {label}
        </p>
      )}

      {!preview ? (
        <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]">
          {loading ? (
            <>
              <Loader2
                size={42}
                className="animate-spin text-cyan-300"
              />

              <p className="mt-4 text-sm text-slate-400">
                Enviando imagem...
              </p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <ImagePlus size={28} />
              </div>

              <p className="mt-5 font-semibold text-white">
                Clique para enviar imagem
              </p>

              <p className="mt-2 text-sm text-slate-500">
                PNG, JPG ou WEBP
              </p>
            </>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <img
            src={preview}
            alt="Preview"
            className="h-[260px] w-full object-cover"
          />

          <button
            type="button"
            onClick={onRemove}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black/70 text-white backdrop-blur-xl transition hover:bg-red-500"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
