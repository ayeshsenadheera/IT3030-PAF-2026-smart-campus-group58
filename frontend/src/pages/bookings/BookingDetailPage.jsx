import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { bookingStatusBadge, formatDate } from '@/utils/helpers'
import { ArrowLeft, Clock, MapPin, Users, CalendarDays, QrCode } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function BookingDetailPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { user, isAdmin } = useAuth()
  const qc            = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
  })
  const booking = data?.data?.data

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['booking', id] })
      setCancelOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to cancel'),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!booking) return <p className="text-center text-slate-400 py-20">Booking not found.</p>

  const canCancel = ['PENDING', 'APPROVED'].includes(booking.status) &&
    (isAdmin() || booking.requester?.id === user?.id)

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card card-body mb-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-1">{booking.title}</h1>
            <p className="text-sm text-slate-400">Booking #{booking.id}</p>
          </div>
          <span className={`${bookingStatusBadge(booking.status)} text-sm px-3 py-1`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <InfoRow icon={MapPin}       label="Resource"   value={booking.resource?.name} />
          <InfoRow icon={MapPin}       label="Location"   value={booking.resource?.location} />
          <InfoRow icon={CalendarDays} label="Start"      value={formatDate(booking.startTime)} />
          <InfoRow icon={Clock}        label="End"        value={formatDate(booking.endTime)} />
          <InfoRow icon={Users}        label="Attendees"  value={booking.attendees} />
          <InfoRow icon={Users}        label="Requested by" value={booking.requester?.fullName} />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Purpose</p>
          <p className="text-sm text-slate-600 leading-relaxed">{booking.purpose}</p>
        </div>

        {booking.adminNotes && (
          <div className="border-t border-slate-100 pt-5 mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Notes</p>
            <p className="text-sm text-slate-600 leading-relaxed">{booking.adminNotes}</p>
          </div>
        )}

        {booking.approvedBy && (
          <div className="border-t border-slate-100 pt-5 mt-5">
            <p className="text-sm text-slate-400">
              {booking.status === 'APPROVED' ? 'Approved' : 'Processed'} by{' '}
              <span className="font-medium text-slate-700">{booking.approvedBy.fullName}</span>
            </p>
          </div>
        )}

        {/* QR Check-in button for approved bookings */}
        {booking.status === 'APPROVED' && (
          <div className="border-t border-slate-100 pt-5 mt-5">
            <Link to={`/bookings/${booking.id}/qr`} className="btn-primary btn-sm">
              <QrCode size={14} /> View QR Check-in
            </Link>
          </div>
        )}

        {canCancel && (
          <div className="border-t border-slate-100 pt-5 mt-5">
            <button className="btn-danger btn-sm" onClick={() => setCancelOpen(true)}>
              Cancel Booking
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        loading={cancelMutation.isPending}
        title="Cancel Booking"
        message={`Are you sure you want to cancel the booking "${booking.title}"? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        danger
      />
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value ?? '—'}</p>
      </div>
    </div>
  )
}
