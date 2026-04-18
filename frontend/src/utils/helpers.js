import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatDate = (dateStr) =>
  dateStr ? format(new Date(dateStr), 'dd MMM yyyy, hh:mm a') : '—'

export const formatRelative = (dateStr) =>
  dateStr ? formatDistanceToNow(new Date(dateStr), { addSuffix: true }) : '—'

export const formatDateOnly = (dateStr) =>
  dateStr ? format(new Date(dateStr), 'dd MMM yyyy') : '—'

// Status badge helpers
export const bookingStatusBadge = (status) => ({
  PENDING:   'badge-yellow',
  APPROVED:  'badge-green',
  REJECTED:  'badge-red',
  CANCELLED: 'badge-slate',
}[status] ?? 'badge-slate')

export const ticketStatusBadge = (status) => ({
  OPEN:        'badge-blue',
  IN_PROGRESS: 'badge-yellow',
  RESOLVED:    'badge-green',
  CLOSED:      'badge-slate',
  REJECTED:    'badge-red',
}[status] ?? 'badge-slate')

export const priorityBadge = (priority) => ({
  CRITICAL: 'priority-critical',
  HIGH:     'priority-high',
  MEDIUM:   'priority-medium',
  LOW:      'priority-low',
}[priority] ?? 'priority-low')

export const resourceStatusBadge = (status) => ({
  ACTIVE:            'badge-green',
  UNDER_MAINTENANCE: 'badge-yellow',
  OUT_OF_SERVICE:    'badge-red',
}[status] ?? 'badge-slate')

export const buildQueryString = (params) => {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, v)
  })
  return p.toString()
}
