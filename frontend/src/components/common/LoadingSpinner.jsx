import { cn } from '@/utils/helpers'

export default function LoadingSpinner({ fullPage = false, size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className={cn(
      'rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin',
      sizes[size],
      className
    )} />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-slate-400 font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  return spinner
}
