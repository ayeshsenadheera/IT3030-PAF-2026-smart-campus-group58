import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bookingsApi } from '@/api/bookings'
import Modal from '@/components/common/Modal'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { bookingStatusBadge, formatDate } from '@/utils/helpers'
import { CalendarDays, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function AdminBookingsPage() {
  const qc = useQueryClient()
  const [page,      setPage]      = useState(0)
  const [status,    setStatus]    = useState('')
  const [actionModal, setActionModal] = useState(null) // { booking, action }
  const [notes,     setNotes]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, status],
    queryFn: () => bookingsApi.getAll({ page, size: 10, status: status || undefined }),
    placeholderData: (prev) => prev,
  })
  const bookings   = data?.data?.data?.content ?? []
  const totalPages = data?.data?.data?.totalPages ?? 0

  const actionMutation = useMutation({
    mutationFn: ({ id, action, notes }) =>
      bookingsApi.processAction(id, { status: action, adminNotes: notes }),
    onSuccess: () => {
      toast.success('Booking updated successfully')
      qc.invalidateQueries({ queryKey: ['admin-bookings'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setActionModal(null)
      setNotes('')
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update booking'),
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Bookings</h1>
          <p className="page-subtitle">Review and process all booking requests.</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0) }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors border
              ${status === s ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No bookings found" />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Requested By</th>
                <th>Resource</th>
                <th>Start</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="text-slate-400 font-mono text-xs">#{b.id}</td>
                  <td className="font-medium text-slate-900 max-w-[180px] truncate">{b.title}</td>
                  <td className="text-slate-500">{b.requester?.fullName}</td>
                  <td className="text-slate-500">{b.resource?.name}</td>
                  <td className="text-slate-500 whitespace-nowrap text-xs">{formatDate(b.startTime)}</td>
                  <td><span className={bookingStatusBadge(b.status)}>{b.status}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/bookings/${b.id}`} className="btn-ghost btn-sm text-xs px-2">View</Link>
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setActionModal({ booking: b, action: 'APPROVED' })}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => setActionModal({ booking: b, action: 'REJECTED' })}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
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

      {/* Action Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setNotes('') }}
        title={actionModal?.action === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}
        size="sm"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setActionModal(null); setNotes('') }}>
              Cancel
            </button>
            <button
              className={actionModal?.action === 'APPROVED' ? 'btn btn-primary' : 'btn btn-danger'}
              disabled={actionMutation.isPending}
              onClick={() => actionMutation.mutate({
                id: actionModal.booking.id,
                action: actionModal.action,
                notes,
              })}
            >
              {actionMutation.isPending ? 'Processing…'
                : actionModal?.action === 'APPROVED' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-sm">
            <p className="font-medium text-slate-800">{actionModal?.booking?.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">{actionModal?.booking?.requester?.fullName}</p>
          </div>
          <div>
            <label className="form-label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Add a note for the requester…"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
