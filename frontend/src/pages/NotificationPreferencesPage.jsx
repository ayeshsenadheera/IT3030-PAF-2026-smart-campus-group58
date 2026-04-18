import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import { Bell, BellOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fetchPrefs  = () => api.get('/dashboard/notification-preferences').then(r => r.data.data)
const savePrefs   = (data) => api.put('/dashboard/notification-preferences', data).then(r => r.data.data)

const DEFAULT_PREFS = {
  bookingUpdates: true,
  ticketUpdates:  true,
  commentAlerts:  true,
  assignments:    true,
  systemAlerts:   true,
}

const PREF_ITEMS = [
  { key: 'bookingUpdates', label: 'Booking Updates',        desc: 'Notify me when my booking is approved, rejected, or cancelled', icon: '📅' },
  { key: 'ticketUpdates',  label: 'Ticket Updates',         desc: 'Notify me when my maintenance ticket status changes',            icon: '🔧' },
  { key: 'commentAlerts',  label: 'Comment Alerts',         desc: 'Notify me when someone comments on my tickets',                 icon: '💬' },
  { key: 'assignments',    label: 'Assignment Notifications',desc: 'Notify me when a ticket is assigned to me',                    icon: '👤' },
  { key: 'systemAlerts',   label: 'System Alerts',          desc: 'Important system-wide announcements and updates',               icon: '🔔' },
]

export default function NotificationPreferencesPage() {
  const navigate = useNavigate()
  const qc       = useQueryClient()

  // Local optimistic state — UI updates instantly, backend saves async
  const [local, setLocal] = useState(DEFAULT_PREFS)
  const [saved,  setSaved] = useState(false)

  const { data: serverPrefs, isLoading } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn:  fetchPrefs,
    retry: 1,
  })

  // Sync server prefs into local state once loaded
  useEffect(() => {
    if (serverPrefs) {
      setLocal({
        bookingUpdates: serverPrefs.bookingUpdates ?? true,
        ticketUpdates:  serverPrefs.ticketUpdates  ?? true,
        commentAlerts:  serverPrefs.commentAlerts  ?? true,
        assignments:    serverPrefs.assignments     ?? true,
        systemAlerts:   serverPrefs.systemAlerts    ?? true,
      })
    }
  }, [serverPrefs])

  const mutation = useMutation({
    mutationFn: savePrefs,
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      qc.invalidateQueries({ queryKey: ['notification-prefs'] })
    },
    onError: () => {
      toast.error('Could not save — check your connection')
    },
  })

  const toggle = (key) => {
    const updated = { ...local, [key]: !local[key] }
    setLocal(updated)   // instant UI update
    mutation.mutate(updated)
  }

  const enableAll = () => {
    const all = { bookingUpdates: true, ticketUpdates: true, commentAlerts: true, assignments: true, systemAlerts: true }
    setLocal(all)
    mutation.mutate(all)
  }

  const disableAll = () => {
    const none = { bookingUpdates: false, ticketUpdates: false, commentAlerts: false, assignments: false, systemAlerts: false }
    setLocal(none)
    mutation.mutate(none)
  }

  const enabledCount = PREF_ITEMS.filter(p => local[p.key]).length

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Preferences</h1>
          <p className="page-subtitle">
            {enabledCount} of {PREF_ITEMS.length} categories enabled
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle size={13} /> Saved
            </span>
          )}
          <button onClick={disableAll} className="btn-secondary btn-sm">
            <BellOff size={13} /> Mute All
          </button>
          <button onClick={enableAll} className="btn-primary btn-sm">
            <Bell size={13} /> Enable All
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {PREF_ITEMS.map(p => (
            <div key={p.key} className="card card-body flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="skeleton w-10 h-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="skeleton h-3 w-40 rounded" />
                  <div className="skeleton h-3 w-64 rounded" />
                </div>
              </div>
              <div className="skeleton h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {PREF_ITEMS.map(p => {
            const enabled = local[p.key]
            return (
              <div key={p.key}
                className={`card card-body flex items-center justify-between gap-4 transition-all duration-200
                  ${!enabled ? 'opacity-55' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
                    ${enabled ? 'bg-primary-50' : 'bg-slate-100'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                      {p.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-snug">{p.desc}</p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggle(p.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                    transition-colors duration-200 focus:outline-none
                    ${enabled ? 'bg-primary-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow
                    transition-transform duration-200
                    ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
