import { useQuery } from '@tanstack/react-query'
import api from '@/api/axios'
import {
  BarChart3, TrendingUp, Star, Zap,
  Activity, CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react'

const fetchAnalytics = () =>
  api.get('/dashboard/analytics').then(r => r.data.data)

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
)

function safeMax(values) {
  if (!values || values.length === 0) return 1
  const m = Math.max(...values)
  return m > 0 ? m : 1
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['analytics'],
    queryFn:  fetchAnalytics,
    retry: 1,
    staleTime: 60_000,
  })

  const byHour     = data?.bookingsByHour   ?? {}
  const topRes     = data?.topResources     ?? []
  const daily      = data?.dailyBookings    ?? {}

  const maxHourVal = safeMax(Object.values(byHour))
  const maxResVal  = safeMax(topRes.map(r => r.bookingCount))
  const dailyMax   = safeMax(Object.values(daily))

  const avgResponse   = data?.avgTimeToFirstResponse ?? 0
  const avgResolution = data?.avgTimeToResolution    ?? 0

  return (
    <div className="animate-fade-in">

      {/* Header */}
      <div className="page-header mb-8">
        <div>
          <h1 className="page-title">Usage Analytics</h1>
          <p className="page-subtitle">Campus resource usage insights and service metrics</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary btn-sm"
        >
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div className="card card-body flex items-center gap-3 mb-6 bg-red-50 border-red-100">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Could not load analytics</p>
            <p className="text-xs text-red-600">Make sure the backend is running and you are logged in as Admin.</p>
          </div>
          <button onClick={() => refetch()} className="btn-sm btn-secondary ml-auto">Retry</button>
        </div>
      )}

      {/* ── Service Level Timers ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <SLACard
          icon={<Zap size={18} className="text-blue-500" />}
          bg="bg-blue-50"
          label="Avg. Time to First Response"
          value={avgResponse}
          unit="hrs"
          desc="From ticket creation to first status change"
          barColor="bg-blue-500"
          barMax={48}
          isLoading={isLoading}
        />
        <SLACard
          icon={<CheckCircle2 size={18} className="text-green-500" />}
          bg="bg-green-50"
          label="Avg. Time to Resolution"
          value={avgResolution}
          unit="hrs"
          desc="From ticket creation to resolved/closed"
          barColor="bg-green-500"
          barMax={96}
          isLoading={isLoading}
        />
      </div>

      {/* ── Top Resources + Daily Bookings ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Top Resources */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <h2 className="text-sm font-semibold text-slate-800">Top Resources by Bookings</h2>
          </div>
          <div className="p-6 space-y-4">
            {isLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="skeleton h-3 w-36 rounded" />
                    <div className="skeleton h-3 w-8 rounded" />
                  </div>
                  <div className="skeleton h-2 w-full rounded-full" />
                </div>
              ))
            ) : topRes.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No approved bookings yet</p>
                <p className="text-xs text-slate-300 mt-1">Data appears once bookings are approved</p>
              </div>
            ) : topRes.map((r, i) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center
                      text-[10px] font-bold text-white shrink-0
                      ${i === 0 ? 'bg-yellow-400'
                      : i === 1 ? 'bg-slate-400'
                      : i === 2 ? 'bg-orange-400'
                      : 'bg-slate-300'}`}>
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate max-w-[180px]">
                      {r.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary-600 shrink-0">
                    {r.bookingCount} booking{r.bookingCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${(r.bookingCount / maxResVal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Bookings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <h2 className="text-sm font-semibold text-slate-800">Daily Bookings — Last 7 Days</h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-end gap-2 h-32">
                {[40,65,30,80,55,70,45].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="skeleton w-full rounded-t-lg" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            ) : Object.keys(daily).length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp size={28} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No bookings in the last 7 days</p>
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 h-32 mb-2">
                  {Object.entries(daily).map(([date, count]) => (
                    <div key={date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative h-full">
                      {/* Tooltip */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white
                        text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100
                        transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {date.slice(5)}: {count}
                      </div>
                      <span className="text-[10px] font-semibold text-primary-600">{count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max((Number(count) / dailyMax) * 80, 4)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  {Object.keys(daily).map(date => (
                    <span key={date} className="text-[9px] text-slate-400 flex-1 text-center">
                      {date.slice(5)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Peak Booking Hours ───────────────────────── */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-800">Peak Booking Hours</h2>
          </div>
          {!isLoading && data?.peakHour != null && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 rounded-xl">
              <AlertCircle size={12} className="text-violet-500" />
              <span className="text-xs font-semibold text-violet-700">
                Peak: {HOURS[data.peakHour]} ({byHour[data.peakHour] ?? 0} bookings)
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-end gap-0.5 h-32">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div className="skeleton rounded-t-sm w-full"
                    style={{ height: `${Math.random() * 60 + 10}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-end gap-0.5 h-32">
                {HOURS.map((label, hr) => {
                  const count  = Number(byHour[hr] ?? 0)
                  const isPeak = hr === data?.peakHour
                  const pct    = count > 0 ? Math.max((count / maxHourVal) * 100, 8) : 3
                  return (
                    <div key={hr} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white
                        text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100
                        transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {label}: {count}
                      </div>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          isPeak
                            ? 'bg-gradient-to-t from-violet-600 to-violet-400'
                            : count > 0
                            ? 'bg-gradient-to-t from-primary-500 to-primary-300'
                            : 'bg-slate-100'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                <span>12am</span>
                <span>3am</span>
                <span>6am</span>
                <span>9am</span>
                <span>12pm</span>
                <span>3pm</span>
                <span>6pm</span>
                <span>9pm</span>
                <span>11pm</span>
              </div>
              {Object.values(byHour).every(v => v === 0) && (
                <p className="text-center text-sm text-slate-400 mt-4">
                  No approved bookings yet — chart will populate once bookings are approved.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SLACard({ icon, bg, label, value, unit, desc, barColor, barMax, isLoading }) {
  const pct = Math.min((value / barMax) * 100, 100)
  return (
    <div className="card card-body">
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <div className="skeleton w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-6 w-20 rounded" />
            </div>
          </div>
          <div className="skeleton h-1.5 w-full rounded-full" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-slate-900">
                {value}
                <span className="text-sm font-normal text-slate-400 ml-1">{unit} avg</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">{desc}</p>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-300 mt-1">
            {value === 0 ? 'No resolved tickets yet' : `${pct.toFixed(0)}% of ${barMax}h benchmark`}
          </p>
        </>
      )}
    </div>
  )
}
