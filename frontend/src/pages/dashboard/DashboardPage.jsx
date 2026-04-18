import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { useAuth } from '@/context/AuthContext'
import StatCard from '@/components/common/StatCard'
import {
  Building2, CalendarDays, Wrench, Users,
  Clock, CheckCircle2, AlertCircle, TrendingUp,
} from 'lucide-react'
import { bookingsApi } from '@/api/bookings'
import { ticketsApi }  from '@/api/tickets'
import { formatDate, bookingStatusBadge, ticketStatusBadge, priorityBadge } from '@/utils/helpers'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    retry: false,
  })
  const stats = statsData?.data?.data

  const { data: bookingsData } = useQuery({
    queryKey: ['my-bookings-recent'],
    queryFn: () => bookingsApi.getMy({ page: 0, size: 5 }),
    retry: false,
  })
  const recentBookings = bookingsData?.data?.data?.content ?? []

  const { data: ticketsData } = useQuery({
    queryKey: ['my-tickets-recent'],
    queryFn: () => ticketsApi.getMy({ page: 0, size: 5 }),
    retry: false,
  })
  const recentTickets = ticketsData?.data?.data?.content ?? []

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">
          Good {getGreeting()},{' '}
          <span className="text-primary-600">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="page-subtitle">Here's what's happening on campus today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Resources"
          value={stats?.totalResources}
          icon={Building2}
          color="blue"
          sub={`${stats?.availableResources ?? '…'} available`}
        />
        <StatCard
          label="Pending Bookings"
          value={stats?.pendingBookings}
          icon={Clock}
          color="yellow"
          sub={`${stats?.approvedBookings ?? '…'} approved`}
        />
        <StatCard
          label="Open Tickets"
          value={stats?.openTickets}
          icon={AlertCircle}
          color="red"
          sub={`${stats?.inProgressTickets ?? '…'} in progress`}
        />
        {isAdmin() ? (
          <StatCard
            label="Total Users"
            value={stats?.totalUsers}
            icon={Users}
            color="purple"
            sub={`${stats?.resolvedTickets ?? '…'} tickets resolved`}
          />
        ) : (
          <StatCard
            label="Resolved Tickets"
            value={stats?.resolvedTickets}
            icon={CheckCircle2}
            color="green"
          />
        )}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CalendarDays size={17} className="text-primary-600" />
              <h2 className="text-sm font-semibold text-slate-800">My Recent Bookings</h2>
            </div>
            <Link to="/bookings" className="text-xs text-primary-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">No bookings yet.</p>
            ) : recentBookings.map(b => (
              <Link
                key={b.id}
                to={`/bookings/${b.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.resource?.name} · {formatDate(b.startTime)}</p>
                </div>
                <span className={bookingStatusBadge(b.status)}>{b.status}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wrench size={17} className="text-purple-600" />
              <h2 className="text-sm font-semibold text-slate-800">My Recent Tickets</h2>
            </div>
            <Link to="/tickets" className="text-xs text-primary-600 font-medium hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentTickets.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">No tickets yet.</p>
            ) : recentTickets.map(t => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={priorityBadge(t.priority)}>{t.priority}</span>
                    <span className="text-xs text-slate-400">{t.category}</span>
                  </div>
                </div>
                <span className={ticketStatusBadge(t.status)}>{t.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
