import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bookingsApi } from '@/api/bookings'
import { useAuth } from '@/context/AuthContext'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { bookingStatusBadge, formatDate } from '@/utils/helpers'
import { CalendarDays, Plus } from 'lucide-react'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function BookingsPage() {
  const { isAdmin } = useAuth()
  const [page,   setPage]   = useState(0)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page, status],
    queryFn: () => bookingsApi.getMy({ page, size: 10, status: status || undefined }),
    placeholderData: (prev) => prev,
  })
  const bookings   = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track all your resource booking requests.</p>
        </div>
        <Link to="/bookings/new" className="btn-primary">
          <Plus size={16} /> New Booking
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(0) }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors border
              ${status === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings found"
          description="You haven't made any bookings yet."
          action={<Link to="/bookings/new" className="btn-primary">Create your first booking</Link>}
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Resource</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="font-medium text-slate-900">{b.title}</td>
                  <td className="text-slate-500">{b.resource?.name}</td>
                  <td className="text-slate-500 whitespace-nowrap">{formatDate(b.startTime)}</td>
                  <td className="text-slate-500 whitespace-nowrap">{formatDate(b.endTime)}</td>
                  <td><span className={bookingStatusBadge(b.status)}>{b.status}</span></td>
                  <td>
                    <Link to={`/bookings/${b.id}`} className="text-xs text-primary-600 font-medium hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
