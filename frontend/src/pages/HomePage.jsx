import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { adminApi } from '@/api/admin'
import { bookingsApi } from '@/api/bookings'
import { ticketsApi }  from '@/api/tickets'
import { resourcesApi } from '@/api/resources'
import StatCard from '@/components/common/StatCard'
import {
  Building2, CalendarDays, Wrench, Users,
  Clock, CheckCircle2, AlertCircle, ArrowRight,
  Plus, Bell, TrendingUp, Activity, Star,
} from 'lucide-react'
import { bookingStatusBadge, ticketStatusBadge, priorityBadge, formatRelative, resourceStatusBadge } from '@/utils/helpers'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const { user, isAdmin, isTechnician } = useAuth()
  const isStaff = isAdmin() || isTechnician()

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    retry: false,
  })
  const stats = statsData?.data?.data

  const { data: bookingsData } = useQuery({
    queryKey: ['home-bookings'],
    queryFn: () => bookingsApi.getMy({ page: 0, size: 4 }),
    retry: false,
    enabled: !isTechnician(),
  })
  const myBookings = bookingsData?.data?.data?.content ?? []

  const { data: ticketsData } = useQuery({
    queryKey: ['home-tickets'],
    queryFn: () => ticketsApi.getMy({ page: 0, size: 4 }),
    retry: false,
  })
  const myTickets = ticketsData?.data?.data?.content ?? []

  const { data: resourcesData } = useQuery({
    queryKey: ['home-resources'],
    queryFn: () => resourcesApi.search({ status: 'ACTIVE', size: 4 }),
    retry: false,
  })
  const featuredResources = resourcesData?.data?.data?.content ?? []

  const QUICK_ACTIONS = [
    !isTechnician() && {
      label: 'Book a Resource',
      desc:  'Reserve a room, lab or equipment',
      icon:  CalendarDays,
      to:    '/bookings/new',
      cls:   'from-blue-500 to-blue-600',
    },
    {
      label: 'Report an Issue',
      desc:  'Submit a maintenance ticket',
      icon:  Wrench,
      to:    '/tickets/new',
      cls:   'from-orange-500 to-orange-600',
    },
    {
      label: 'Browse Resources',
      desc:  'Find available campus facilities',
      icon:  Building2,
      to:    '/resources',
      cls:   'from-violet-500 to-violet-600',
    },
    isStaff && {
      label: 'View All Tickets',
      desc:  'Manage maintenance requests',
      icon:  Activity,
      to:    '/tickets',
      cls:   'from-teal-500 to-teal-600',
    },
  ].filter(Boolean)

  return (
    <div className="animate-fade-in">

      {/* ── HERO GREETING ─────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 mb-8 p-8 lg:p-10">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full ring-2 ring-white/20 object-cover" />
                : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                    {user?.fullName?.charAt(0)}
                  </div>
              }
              <div>
                <p className="text-white/60 text-xs font-medium">{getGreeting()}</p>
                <p className="text-white font-bold">{user?.fullName}</p>
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
              Welcome back to<br className="hidden sm:block" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-violet-300">
                Campus<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-violet-300">Flow</span>
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              {isAdmin()       ? 'You have admin access — manage everything from your dashboard.'
              : isTechnician() ? 'Check your assigned tickets and update maintenance status.'
              :                  'Book facilities and report issues — we\'re here to help.'}
            </p>
          </div>

          {/* Live status pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/70 text-xs font-medium">All systems operational</span>
          </div>
        </div>
      </div>

      {/* ── STATS GRID ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Resources"   value={stats?.totalResources}   icon={Building2}    color="blue"   sub={`${stats?.availableResources ?? '…'} available`} />
        <StatCard label="Pending Bookings"  value={stats?.pendingBookings}  icon={Clock}        color="yellow" sub={`${stats?.approvedBookings ?? '…'} approved`} />
        <StatCard label="Open Tickets"      value={stats?.openTickets}      icon={AlertCircle}  color="red"    sub={`${stats?.inProgressTickets ?? '…'} in progress`} />
        {isAdmin()
          ? <StatCard label="Total Users"    value={stats?.totalUsers}       icon={Users}        color="purple" sub={`${stats?.resolvedTickets ?? '…'} tickets resolved`} />
          : <StatCard label="Resolved Tickets" value={stats?.resolvedTickets} icon={CheckCircle2} color="green" />
        }
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Star size={16} className="text-primary-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, to, cls }) => (
            <Link key={to} to={to}
              className="group card card-body flex items-start gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cls} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Bookings */}
        {!isTechnician() && (
          <div className="card lg:col-span-1">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary-500" />
                <h3 className="text-sm font-semibold text-slate-800">Recent Bookings</h3>
              </div>
              <Link to="/bookings" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {myBookings.length === 0
                ? <EmptySlate icon={CalendarDays} label="No bookings yet">
                    <Link to="/bookings/new" className="btn-primary btn-sm mt-3"><Plus size={13}/>New Booking</Link>
                  </EmptySlate>
                : myBookings.map(b => (
                  <Link key={b.id} to={`/bookings/${b.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors">{b.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{b.resource?.name} · {formatRelative(b.startTime)}</p>
                    </div>
                    <span className={`${bookingStatusBadge(b.status)} ml-2 shrink-0`}>{b.status}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        )}

        {/* Recent Tickets */}
        <div className={`card ${isTechnician() ? 'lg:col-span-2' : 'lg:col-span-1'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-orange-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                {isTechnician() ? 'My Assigned Tickets' : 'Recent Tickets'}
              </h3>
            </div>
            <Link to="/tickets" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {myTickets.length === 0
              ? <EmptySlate icon={Wrench} label="No tickets found">
                  <Link to="/tickets/new" className="btn-primary btn-sm mt-3"><Plus size={13}/>Report Issue</Link>
                </EmptySlate>
              : myTickets.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={priorityBadge(t.priority)}>{t.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.category} · {formatRelative(t.createdAt)}</p>
                  </div>
                  <span className={`${ticketStatusBadge(t.status)} ml-2 shrink-0`}>{t.status?.replace('_',' ')}</span>
                </Link>
              ))
            }
          </div>
        </div>

        {/* Available Resources */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-violet-500" />
              <h3 className="text-sm font-semibold text-slate-800">Available Now</h3>
            </div>
            <Link to="/resources" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              Browse all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {featuredResources.length === 0
              ? <EmptySlate icon={Building2} label="No resources available" />
              : featuredResources.map(r => (
                <Link key={r.id} to={`/resources/${r.id}`}
                  className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/70 transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    r.type === 'ROOM'      ? 'bg-blue-50 text-blue-500'
                    : r.type === 'LAB'    ? 'bg-violet-50 text-violet-500'
                    :                       'bg-green-50 text-green-500'
                  }`}>
                    <Building2 size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors">{r.name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.location}{r.capacity ? ` · ${r.capacity} seats` : ''}</p>
                  </div>
                  <span className="badge badge-green text-[10px]">Free</span>
                </Link>
              ))
            }
          </div>
        </div>

      </div>

      {/* ── ADMIN CTA BANNER ──────────────────────────── */}
      {isAdmin() && (
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Admin Panel</p>
              <p className="text-white/70 text-xs">Manage users, bookings, resources and tickets</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Users',     to: '/admin/users'     },
              { label: 'Bookings',  to: '/admin/bookings'  },
              { label: 'Resources', to: '/admin/resources' },
            ].map(({ label, to }) => (
              <Link key={to} to={to}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold rounded-xl transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

function EmptySlate({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Icon size={24} className="text-slate-300 mb-2" />
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {children}
    </div>
  )
}
