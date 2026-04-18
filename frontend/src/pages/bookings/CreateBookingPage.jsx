import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { bookingsApi } from '@/api/bookings'
import { resourcesApi } from '@/api/resources'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import {
  ArrowLeft, CalendarDays, Users, AlertCircle,
  CheckCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'

const today = () => new Date().toISOString().split('T')[0]

const addDays = (dateStr, n) => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const isToday = (dateStr) => dateStr === today()

export default function CreateBookingPage() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const defaultResourceId = searchParams.get('resourceId') ?? ''

  const [selectedResource, setSelectedResource] = useState(null)
  const [form, setForm] = useState({
    resourceId: defaultResourceId,
    title:      '',
    purpose:    '',
    attendees:  1,
  })
  const [errors, setErrors]             = useState({})
  const [selectedDate, setSelectedDate] = useState(today())
  const [selectedSlots, setSelectedSlots] = useState([])

  const capacity = selectedResource?.capacity ?? null

  const { data: resourcesData } = useQuery({
    queryKey: ['resources-select'],
    queryFn: () => resourcesApi.search({ status: 'ACTIVE', size: 100 }),
    retry: false,
  })
  const resources = resourcesData?.data?.data?.content ?? []

  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ['slots', form.resourceId, selectedDate],
    queryFn: () => api.get('/bookings/available-slots', {
      params: { resourceId: form.resourceId, date: selectedDate }
    }).then(r => r.data.data),
    enabled: !!form.resourceId && !!selectedDate,
    retry: false,
  })
  const slots = slotsData ?? []

  useEffect(() => {
    if (!form.resourceId) { setSelectedResource(null); return }
    const found = resources.find(r => String(r.id) === String(form.resourceId))
    setSelectedResource(found ?? null)
    setSelectedSlots([])
  }, [form.resourceId, resources])

  useEffect(() => {
    if (defaultResourceId && resources.length > 0) {
      const found = resources.find(r => String(r.id) === String(defaultResourceId))
      if (found) setSelectedResource(found)
    }
  }, [defaultResourceId, resources])

  useEffect(() => { setSelectedSlots([]) }, [selectedDate])

  const toggleSlot = (slot) => {
    if (!slot.available) return
    setSelectedSlots(prev => {
      const existingIdx = prev.findIndex(s => s.startTime === slot.startTime)
      if (existingIdx !== -1) return prev.slice(0, existingIdx)
      if (prev.length === 0) return [slot]
      const last = prev[prev.length - 1]
      if (last.endTime === slot.startTime) {
        if (prev.length >= 5) {
          toast.error('Maximum booking is 5 hours (5 slots)')
          return prev
        }
        return [...prev, slot]
      }
      return [slot]
    })
  }

  const bookingStart = selectedSlots.length > 0 ? selectedSlots[0].startTime : null
  const bookingEnd   = selectedSlots.length > 0 ? selectedSlots[selectedSlots.length - 1].endTime : null
  const durationHrs  = selectedSlots.length

  const validate = () => {
    const e = {}
    if (!form.resourceId)           e.resourceId = 'Please select a resource'
    if (!form.title?.trim() || form.title.trim().length < 3)
                                    e.title      = 'Title must be at least 3 characters'
    if (!form.purpose?.trim() || form.purpose.trim().length < 10)
                                    e.purpose    = 'Purpose must be at least 10 characters'
    if (selectedSlots.length === 0) e.slots      = 'Please select at least one time slot'
    const att = Number(form.attendees)
    if (!att || att < 1)            e.attendees  = 'At least 1 attendee required'
    else if (capacity != null && att > capacity)
                                    e.attendees  = `Exceeds capacity — max ${capacity} seats`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () => bookingsApi.create({
      resourceId: Number(form.resourceId),
      title:      form.title.trim(),
      purpose:    form.purpose.trim(),
      attendees:  Number(form.attendees),
      startTime:  bookingStart,
      endTime:    bookingEnd,
    }),
    onSuccess: (res) => {
      toast.success('Booking submitted for approval!')
      navigate(`/bookings/${res.data.data.id}`)
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? 'Failed to create booking'
      if (msg.toLowerCase().includes('already booked') || msg.toLowerCase().includes('conflict')) {
        toast.error('Time conflict — please select different slots')
        refetchSlots()
        setSelectedSlots([])
      } else {
        toast.error(msg)
      }
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate()
  }

  const attendeesNum = Number(form.attendees) || 0
  const usagePercent = capacity ? Math.min((attendeesNum / capacity) * 100, 100) : 0
  const overCapacity = capacity != null && attendeesNum > capacity

  const slotClass = (slot) => {
    const isSelected = selectedSlots.some(s => s.startTime === slot.startTime)
    if (isSelected)               return 'bg-primary-600 text-white border-primary-600 shadow-sm'
    if (slot.status === 'BOOKED') return 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through'
    if (slot.status === 'PAST')   return 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
    return 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">New Booking Request</h1>
          <p className="page-subtitle">
            University hours: <strong>8:30 AM – 5:30 PM</strong>. Select up to 5 consecutive slots (max 5 hrs).
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>

        {/* Step 1 — Resource */}
        <div className="card card-body">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            Select Resource
          </h2>

          <select
            value={form.resourceId}
            onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}
            className="form-select"
          >
            <option value="">Choose a resource…</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.location}{r.capacity ? ` (${r.capacity} seats)` : ''}
              </option>
            ))}
          </select>
          {errors.resourceId && <p className="form-error mt-1">{errors.resourceId}</p>}

          {selectedResource && (
            <div className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Users size={14} className="text-primary-600" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-primary-800">{selectedResource.name}</p>
                <p className="text-primary-600">
                  {selectedResource.location}
                  {selectedResource.capacity
                    ? <> · <strong>Max {selectedResource.capacity} seats</strong></>
                    : ' · No seat limit'}
                </p>
                {selectedResource.availabilityWindows && (
                  <p className="text-primary-500 mt-0.5">Available: {selectedResource.availabilityWindows}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2 — Date & Slots */}
        {form.resourceId && (
          <div className="card card-body">
            <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              Select Date & Time Slots
            </h2>
            <p className="text-xs text-slate-400 mb-4 ml-7">
              Slots available from <strong>8:30 AM to 5:30 PM</strong> — 9 slots per day
            </p>

            {/* Date navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setSelectedDate(d => addDays(d, -1))}
                disabled={isToday(selectedDate)}
                className="btn-secondary btn-sm disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">{formatDisplayDate(selectedDate)}</p>
                {isToday(selectedDate) && (
                  <span className="text-[10px] bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">Today</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(d => addDays(d, 1))}
                disabled={selectedDate >= addDays(today(), 30)}
                className="btn-secondary btn-sm disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-[11px] font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-white border border-slate-200" />Available</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary-600" />Selected</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-200" />Booked</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100" />Past</div>
            </div>

            {/* Slots grid */}
            {slotsLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No slots available for this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`px-2 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${slotClass(slot)}`}
                    title={
                      slot.status === 'BOOKED' ? 'Already booked' :
                      slot.status === 'PAST'   ? 'Time has passed' :
                      'Click to select'
                    }
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            {errors.slots && <p className="form-error mt-2">{errors.slots}</p>}

            {/* Selected summary */}
            {selectedSlots.length > 0 && (
              <div className="mt-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle size={16} className="text-green-500 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-green-800">
                    {durationHrs} hour{durationHrs > 1 ? 's' : ''} selected
                    — {selectedSlots[0].label.split('–')[0].trim()} to {selectedSlots[selectedSlots.length - 1].label.split('–')[1].trim()}
                  </p>
                  <p className="text-green-600 mt-0.5">{formatDisplayDate(selectedDate)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlots([])}
                  className="ml-auto text-green-600 hover:text-green-800 text-xs underline shrink-0"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Booking Details */}
        {form.resourceId && (
          <div className="card card-body">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              Booking Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="form-label">Booking Title *</label>
                <input
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })) }}
                  className="form-input"
                  placeholder="e.g., CS301 Weekly Lab Session"
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div>
                <label className="form-label">Purpose / Description *</label>
                <textarea
                  value={form.purpose}
                  onChange={e => { setForm(f => ({ ...f, purpose: e.target.value })); setErrors(er => ({ ...er, purpose: '' })) }}
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe why you need this resource…"
                />
                {errors.purpose && <p className="form-error">{errors.purpose}</p>}
              </div>

              <div>
                <label className="form-label">
                  Number of Attendees *
                  {capacity && <span className="ml-2 text-xs font-normal text-slate-400">(max {capacity} seats)</span>}
                </label>
                <input
                  value={form.attendees}
                  onChange={e => { setForm(f => ({ ...f, attendees: e.target.value })); setErrors(er => ({ ...er, attendees: '' })) }}
                  type="number"
                  min={1}
                  max={capacity ?? undefined}
                  className={`form-input ${errors.attendees ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder={capacity ? `1 – ${capacity}` : 'Number of attendees'}
                />

                {capacity && attendeesNum > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Capacity usage</span>
                      <span className={`font-semibold ${usagePercent > 90 ? 'text-red-600' : usagePercent > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {attendeesNum} / {capacity} ({Math.round(usagePercent)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    {overCapacity && (
                      <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> Exceeds capacity — max {capacity} seats
                      </p>
                    )}
                  </div>
                )}

                {errors.attendees && <p className="form-error">{errors.attendees}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedSlots.length > 0 && form.title && (
          <div className="card card-body bg-slate-50 border-slate-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Resource</p>
                <p className="font-medium text-slate-800">{selectedResource?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Date</p>
                <p className="font-medium text-slate-800">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Time</p>
                <p className="font-medium text-slate-800">
                  {selectedSlots[0].label.split('–')[0].trim()} – {selectedSlots[selectedSlots.length - 1].label.split('–')[1].trim()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Duration</p>
                <p className="font-medium text-slate-800">{durationHrs} hour{durationHrs > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {form.resourceId && (
          <div className="flex items-center justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending || overCapacity}
            >
              <CalendarDays size={16} />
              {mutation.isPending ? 'Submitting…' : 'Submit Booking Request'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}