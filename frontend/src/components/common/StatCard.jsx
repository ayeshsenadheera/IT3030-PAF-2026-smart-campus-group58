import { cn } from '@/utils/helpers'

export default function StatCard({ label, value, icon: Icon, color = 'blue', trend, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'text-blue-500'   },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  icon: 'text-green-500'  },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-500' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'text-red-500'    },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    slate:  { bg: 'bg-slate-100', text: 'text-slate-600',  icon: 'text-slate-400'  },
  }
  const c = colors[color] ?? colors.blue

  return (
    <div className="card card-body flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
        <p className="text-3xl font-bold text-slate-900 leading-none mb-1">
          {value ?? <span className="skeleton w-16 h-8 inline-block" />}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        {trend !== undefined && (
          <p className={cn('text-xs font-medium mt-1', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', c.bg)}>
          <Icon size={20} className={c.icon} />
        </div>
      )}
    </div>
  )
}
