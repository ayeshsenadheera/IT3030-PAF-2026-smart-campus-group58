import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'
import { formatRelative, cn } from '@/utils/helpers'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = {
  BOOKING_UPDATE: 'bg-blue-100 text-blue-600',
  TICKET_UPDATE:  'bg-purple-100 text-purple-600',
  COMMENT_ADDED:  'bg-green-100 text-green-600',
  ASSIGNMENT:     'bg-orange-100 text-orange-600',
  SYSTEM:         'bg-slate-100 text-slate-500',
}

export default function NotificationPanel({ onClose }) {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ page: 0, size: 15 }),
    retry: false,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const notifications = data?.data?.data?.content ?? []

  const handleClick = (n) => {
    if (!n.isRead) markOneMutation.mutate(n.id)
    if (n.refType === 'BOOKING') navigate(`/bookings/${n.refId}`)
    if (n.refType === 'TICKET')  navigate(`/tickets/${n.refId}`)
    onClose()
  }

  return (
    <div className="w-96 bg-white rounded-2xl shadow-card-hover border border-slate-100 flex flex-col max-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-600" />
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
        </div>
        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
          className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {markAllMutation.isPending
            ? <Loader2 size={12} className="animate-spin" />
            : <CheckCheck size={13} />}
          Mark all read
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <Bell size={28} className="text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                'w-full flex gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50',
                !n.isRead && 'bg-primary-50/40'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold',
                TYPE_COLORS[n.type] ?? 'bg-slate-100 text-slate-500'
              )}>
                {n.type?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    'text-sm leading-snug truncate',
                    !n.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                  )}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                <p className="text-[11px] text-slate-300 mt-1">{formatRelative(n.createdAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
