import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ticketsApi } from '@/api/tickets'
import { useAuth } from '@/context/AuthContext'
import SearchBar from '@/components/common/SearchBar'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ticketStatusBadge, priorityBadge, formatRelative } from '@/utils/helpers'
import { Wrench, Plus } from 'lucide-react'

const STATUSES    = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const PRIORITIES  = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export default function TicketsPage() {
  const { isAdmin, isTechnician } = useAuth()
  const [page,     setPage]     = useState(0)
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const [keyword,  setKeyword]  = useState('')

  const isStaff = isAdmin() || isTechnician()

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', page, status, priority, keyword, isStaff],
    queryFn: () => isStaff
      ? ticketsApi.search({ page, size: 10, status: status || undefined, priority: priority || undefined, keyword: keyword || undefined })
      : ticketsApi.getMy({ page, size: 10 }),
    placeholderData: (prev) => prev,
  })
  const tickets    = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isStaff ? 'All Tickets' : 'My Tickets'}</h1>
          <p className="page-subtitle">Maintenance and incident reports.</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <Plus size={16} /> New Ticket
        </Link>
      </div>

      {/* Filters (staff only) */}
      {isStaff && (
        <div className="flex flex-wrap gap-3 mb-6">
          <SearchBar value={keyword} onChange={v => { setKeyword(v); setPage(0) }}
            placeholder="Search tickets…" className="flex-1 min-w-[200px] max-w-xs" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}
            className="form-select w-40">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0) }}
            className="form-select w-40">
            {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priority'}</option>)}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={Wrench} title="No tickets found"
          description="No maintenance or incident tickets to display."
          action={<Link to="/tickets/new" className="btn-primary">Create a ticket</Link>}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`}
              className="card card-body flex items-start justify-between gap-4 hover:shadow-card-hover">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={priorityBadge(t.priority)}>{t.priority}</span>
                  <span className="badge badge-slate">{t.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 truncate">{t.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.createdBy?.fullName} · {formatRelative(t.createdAt)}
                  {t.assignedTo && ` · Assigned to ${t.assignedTo.fullName}`}
                </p>
              </div>
              <span className={ticketStatusBadge(t.status)}>{t.status?.replace('_', ' ')}</span>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
