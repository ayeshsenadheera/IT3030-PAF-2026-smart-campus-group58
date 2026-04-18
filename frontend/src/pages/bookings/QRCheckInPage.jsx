import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useRef } from 'react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { formatDate } from '@/utils/helpers'
import {
  CheckCircle2, XCircle, Clock, MapPin,
  Users, CalendarDays, ArrowLeft, Printer,
} from 'lucide-react'

export default function QRCheckInPage() {
  const { id }   = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const qrRef     = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id),
  })
  const booking = data?.data?.data

  // Generate QR code using a free CDN service
  const qrUrl = booking
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `CampusFlow Check-In\nBooking #${booking.id}\n${booking.title}\n${booking.resource?.name}\n${formatDate(booking.startTime)}`
      )}`
    : null

  const isOwner    = booking?.requester?.id === user?.id
  const isApproved = booking?.status === 'APPROVED'
  const isPast     = booking ? new Date(booking.endTime) < new Date() : false
  const isNow      = booking
    ? new Date(booking.startTime) <= new Date() && new Date(booking.endTime) >= new Date()
    : false

  const statusColor =
    isPast      ? 'bg-slate-100 text-slate-500'   :
    isNow       ? 'bg-green-100 text-green-700'   :
    isApproved  ? 'bg-blue-100 text-blue-700'     :
                  'bg-yellow-100 text-yellow-700'

  const statusLabel =
    isPast      ? 'Booking Expired'   :
    isNow       ? 'Active Now — Check In' :
    isApproved  ? 'Approved — Upcoming'  :
                  booking?.status ?? '—'

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!booking)  return <p className="text-center py-20 text-slate-400">Booking not found.</p>
  if (!isOwner && !isApproved) return (
    <div className="max-w-md mx-auto pt-16 text-center">
      <XCircle size={48} className="text-red-400 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 text-sm">You can only view QR codes for your own approved bookings.</p>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card card-body text-center" ref={qrRef}>
        {/* Header */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${statusColor}`}>
            {isNow ? <CheckCircle2 size={15} /> : <Clock size={15} />}
            {statusLabel}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">{booking.title}</h1>
          <p className="text-sm text-slate-400">Booking #{booking.id}</p>
        </div>

        {/* QR Code */}
        {isApproved ? (
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-card inline-block mb-3">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="Check-in QR Code"
                  className="w-48 h-48"
                />
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Show this QR code at the venue to verify your booking. Valid only for the booked time slot.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-6 p-8 bg-yellow-50 rounded-2xl">
            <Clock size={40} className="text-yellow-400 mb-3" />
            <p className="text-sm font-semibold text-yellow-800">Awaiting Approval</p>
            <p className="text-xs text-yellow-600 mt-1">QR code will be available once approved</p>
          </div>
        )}

        {/* Booking Details */}
        <div className="grid grid-cols-1 gap-3 text-left bg-slate-50 rounded-2xl p-4 mb-5">
          <Detail icon={<MapPin size={14} />}     label="Location"   value={`${booking.resource?.name} — ${booking.resource?.location}`} />
          <Detail icon={<CalendarDays size={14} />} label="Start"    value={formatDate(booking.startTime)} />
          <Detail icon={<Clock size={14} />}       label="End"       value={formatDate(booking.endTime)} />
          <Detail icon={<Users size={14} />}       label="Attendees" value={`${booking.attendees} people`} />
        </div>

        {/* Booked by */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-4">
          {booking.requester?.avatarUrl && (
            <img src={booking.requester.avatarUrl} className="w-5 h-5 rounded-full" alt="" />
          )}
          <span>Booked by <strong className="text-slate-600">{booking.requester?.fullName}</strong></span>
        </div>

        {/* Print button */}
        {isApproved && (
          <button
            onClick={() => window.print()}
            className="btn-secondary w-full justify-center mt-4"
          >
            <Printer size={15} /> Print / Save QR
          </button>
        )}
      </div>
    </div>
  )
}

function Detail({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-700 font-medium">{value}</p>
      </div>
    </div>
  )
}
