import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ticketsApi } from '@/api/tickets'
import { adminApi } from '@/api/admin'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import SearchBar from '@/components/common/SearchBar'
import { ticketStatusBadge, priorityBadge, formatRelative } from '@/utils/helpers'
import { Wrench, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES   = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const PRIORITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const CATEGORIES = ['', 'MAINTENANCE', 'ELECTRICAL', 'PLUMBING', 'IT', 'SAFETY', 'OTHER']

export default function AdminTicketsPage() {
  const qc = useQueryClient()
  const [page,       setPage]       = useState(0)
  const [status,     setStatus]     = useState('')
  const [priority,   setPriority]   = useState('')
  const [category,   setCategory]   = useState('')
  const [keyword,    setKeyword]     = useState('')
  const [assignModal, setAssignModal] = useState(null) // { ticket }
  const [selectedTech, setSelectedTech] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page, status, priority, category, keyword],
    queryFn: () => ticketsApi.search({
      page, size: 10,
      status:   status   || undefined,
      priority: priority || undefined,
      category: category || undefined,
      keyword:  keyword  || undefined,
    }),
    placeholderData: (prev) => prev,
  })
  const tickets    = data?.data?.data?.content    ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0
  const totalElements = data?.data?.data?.totalElements ?? 0

  const { data: techData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => adminApi.getTechnicians(),
  })
  const technicians = techData?.data?.data ?? []

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, techId }) =>
      ticketsApi.update(ticketId, { assignedToId: techId }),
    onSuccess: () => {
      toast.success('Technician assigned')
      qc.invalidateQueries({ queryKey: ['admin-tickets'] })
      setAssignModal(null)
      setSelectedTech('')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to assign'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, newStatus }) =>
      ticketsApi.update(ticketId, { status: newStatus }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['admin-tickets'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update status'),
  })

  const QUICK_ACTIONS = {
    OPEN:        'IN_PROGRESS',
    IN_PROGRESS: 'RESOLVED',
    RESOLVED:    'CLOSED',
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-subtitle">{totalElements} total tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={keyword} onChange={v => { setKeyword(v); setPage(0) }}
          placeholder="Search tickets…" className="flex-1 min-w-[180px] max-w-xs" />
        <select value={status}   onChange={e => { setStatus(e.target.value);   setPage(0) }} className="form-select w-40">
          {STATUSES.map(s   => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0) }} className="form-select w-40">
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priority'}</option>)}
        </select>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(0) }} className="form-select w-44">
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={Wrench} title="No tickets found" description="Try adjusting your filters." />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td className="text-slate-400 font-mono text-xs">#{t.id}</td>
                  <td>
                    <Link to={`/tickets/${t.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-primary-600 max-w-[160px] block truncate">
                      {t.title}
                    </Link>
                  </td>
                  <td><span className={priorityBadge(t.priority)}>{t.priority}</span></td>
                  <td className="text-xs text-slate-500">{t.category}</td>
                  <td className="text-xs text-slate-500">{t.createdBy?.fullName}</td>
                  <td>
                    {t.assignedTo
                      ? <span className="text-xs text-slate-600 font-medium">{t.assignedTo.fullName}</span>
                      : <span className="text-xs text-slate-300 italic">Unassigned</span>
                    }
                  </td>
                  <td><span className={ticketStatusBadge(t.status)}>{t.status?.replace('_', ' ')}</span></td>
                  <td className="text-xs text-slate-400 whitespace-nowrap">{formatRelative(t.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {/* Assign technician */}
                      <button
                        onClick={() => { setAssignModal({ ticket: t }); setSelectedTech(t.assignedTo?.id ?? '') }}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors"
                        title="Assign Technician"
                      >
                        <UserCog size={15} />
                      </button>

                      {/* Quick status advance */}
                      {QUICK_ACTIONS[t.status] && (
                        <button
                          onClick={() => statusMutation.mutate({ ticketId: t.id, newStatus: QUICK_ACTIONS[t.status] })}
                          disabled={statusMutation.isPending}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-500
                                     hover:text-primary-600 text-[10px] font-medium transition-colors"
                          title={`Move to ${QUICK_ACTIONS[t.status]}`}
                        >
                          → {QUICK_ACTIONS[t.status].replace('_', ' ')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Assign Modal */}
      <Modal
        open={!!assignModal}
        onClose={() => { setAssignModal(null); setSelectedTech('') }}
        title={`Assign Ticket #${assignModal?.ticket?.id}`}
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setAssignModal(null); setSelectedTech('') }}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={!selectedTech || assignMutation.isPending}
              onClick={() => assignMutation.mutate({ ticketId: assignModal.ticket.id, techId: Number(selectedTech) })}
            >
              {assignMutation.isPending ? 'Assigning…' : 'Assign'}
            </button>
          </>
        }
      >
        {assignModal && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-800 truncate">{assignModal.ticket.title}</p>
              <div className="flex gap-1.5 mt-1">
                <span className={priorityBadge(assignModal.ticket.priority)}>{assignModal.ticket.priority}</span>
                <span className="badge badge-slate">{assignModal.ticket.category}</span>
              </div>
            </div>

            <div>
              <label className="form-label">Select Technician</label>
              {technicians.length === 0 ? (
                <p className="text-sm text-slate-400">No technicians available. Assign the TECHNICIAN role to a user first.</p>
              ) : (
                <select
                  value={selectedTech}
                  onChange={e => setSelectedTech(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a technician…</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} — {t.email}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
