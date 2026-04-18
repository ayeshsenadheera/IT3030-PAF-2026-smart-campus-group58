import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/helpers'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i)
  const showEllipsisStart = page > 3
  const showEllipsisEnd   = page < totalPages - 4

  const visiblePages = pages.filter(p => {
    if (p === 0 || p === totalPages - 1) return true
    if (Math.abs(p - page) <= 1) return true
    return false
  })

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {visiblePages.map((p, i) => {
        const prev = visiblePages[i - 1]
        const showDots = prev !== undefined && p - prev > 1

        return (
          <span key={p} className="flex items-center gap-1">
            {showDots && (
              <span className="px-2 text-slate-400 text-sm">…</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={cn(
                'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                p === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {p + 1}
            </button>
          </span>
        )
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}