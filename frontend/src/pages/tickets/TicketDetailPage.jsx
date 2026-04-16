import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ticketsApi } from '@/api/tickets'
import api from '@/api/axios'
import { adminApi } from '@/api/admin'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ticketStatusBadge, priorityBadge, formatDate, formatRelative } from '@/utils/helpers'
import { ArrowLeft, Send, Trash2, Pencil, User } from 'lucide-react'
import toast from 'react-hot-toast'

const TRANSITIONS = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED:    ['CLOSED', 'IN_PROGRESS'],
}

export default function TicketDetailPage() {
  const { id }               = useParams()
  const navigate             = useNavigate()
  const { user, isAdmin, isTechnician } = useAuth()
  const qc                   = useQueryClient()
  const isStaff              = isAdmin() || isTechnician()

  const [commentBody,   setCommentBody]   = useState('')
  const [editingComment, setEditingComment] = useState(null)  // { id, body }
  const [isInternal,    setIsInternal]    = useState(false)
  const [statusAction,  setStatusAction]  = useState('')
  const [assignedToId,  setAssignedToId]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id, true),
  })
  const ticket = data?.data?.data

  const { data: techData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => adminApi.getTechnicians(),
    enabled: isAdmin(),
  })
  const technicians = techData?.data?.data ?? []

  const commentMutation = useMutation({
    mutationFn: () => ticketsApi.addComment(id, { body: commentBody, isInternal }),
    onSuccess: () => {
      toast.success('Comment added')
      setCommentBody('')
      qc.invalidateQueries({ queryKey: ['ticket', id] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to add comment'),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => ticketsApi.update(id, data),
    onSuccess: () => {
      toast.success('Ticket updated')
      setStatusAction('')
      setAssignedToId('')
      qc.invalidateQueries({ queryKey: ['ticket', id] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update'),
  })

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, body }) =>
      api.patch(`/tickets/comments/${commentId}`, { body }),
    onSuccess: () => {
      toast.success('Comment updated')
      setEditingComment(null)
      qc.invalidateQueries({ queryKey: ['ticket', id] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => ticketsApi.deleteComment(commentId),
    onSuccess: () => {
      toast.success('Comment deleted')
      qc.invalidateQueries({ queryKey: ['ticket', id] })
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!ticket)   return <p className="text-center text-slate-400 py-20">Ticket not found.</p>

  const nextStatuses = TRANSITIONS[ticket.status] ?? []

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card card-body">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-lg font-bold text-slate-900">{ticket.title}</h1>
              <span className={ticketStatusBadge(ticket.status)}>{ticket.status?.replace('_', ' ')}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={priorityBadge(ticket.priority)}>{ticket.priority}</span>
              <span className="badge badge-slate">{ticket.category}</span>
              {ticket.resource && <span className="badge badge-blue">{ticket.resource.name}</span>}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

            {ticket.preferredContact && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Preferred Contact</p>
                <p className="text-sm text-slate-700">{ticket.preferredContact}</p>
              </div>
            )}

            {ticket.resolutionNotes && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-1">Resolution Notes</p>
                <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
              </div>
            )}

            {/* Images */}
            {ticket.imageUrls?.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {ticket.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`Attachment ${i + 1}`}
                      className="w-full h-28 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Created by <strong className="text-slate-600">{ticket.createdBy?.fullName}</strong></span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Comments ({ticket.comments?.length ?? 0})
              </h2>
            </div>

            <div className="divide-y divide-slate-50">
              {ticket.comments?.length === 0 && (
                <p className="px-6 py-8 text-sm text-slate-400 text-center">No comments yet.</p>
              )}
              {ticket.comments?.map(c => (
                <div key={c.id} className={`px-6 py-4 ${c.isInternal ? 'bg-yellow-50/60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={12} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{c.author?.fullName}</p>
                        <p className="text-[11px] text-slate-400">{formatRelative(c.createdAt)}</p>
                      </div>
                      {c.isInternal && (
                        <span className="badge badge-yellow text-[10px]">Internal</span>
                      )}
                    </div>
                    {(isAdmin() || c.author?.id === user?.id) && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingComment({ id: c.id, body: c.body })}
                          className="p-1 rounded-lg hover:bg-primary-50 text-slate-300 hover:text-primary-500 transition-colors"
                          title="Edit comment"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed ml-9">{c.body}</p>
                </div>
              ))}
            </div>

            {/* Edit comment inline form */}
            {editingComment && (
              <div className="px-6 py-4 border-t border-amber-100 bg-amber-50">
                <p className="text-xs font-semibold text-amber-700 mb-2">Editing comment</p>
                <textarea
                  value={editingComment.body}
                  onChange={e => setEditingComment(prev => ({ ...prev, body: e.target.value }))}
                  rows={3}
                  className="form-textarea mb-2"
                />
                <div className="flex gap-2 justify-end">
                  <button className="btn-secondary btn-sm" onClick={() => setEditingComment(null)}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary btn-sm"
                    disabled={editCommentMutation.isPending}
                    onClick={() => editCommentMutation.mutate({
                      commentId: editingComment.id,
                      body: editingComment.body,
                    })}
                  >
                    {editCommentMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Add comment */}
            <div className="px-6 py-4 border-t border-slate-100">
              <textarea
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Write a comment…"
                className="form-textarea mb-3"
              />
              <div className="flex items-center justify-between">
                {isStaff && (
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      className="rounded" />
                    Internal note (staff only)
                  </label>
                )}
                <button
                  className="btn-primary btn-sm ml-auto"
                  onClick={() => commentBody.trim() && commentMutation.mutate()}
                  disabled={!commentBody.trim() || commentMutation.isPending}
                >
                  <Send size={13} />
                  {commentMutation.isPending ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Assigned To</dt>
                <dd className="font-medium text-slate-700">
                  {ticket.assignedTo?.fullName ?? <span className="text-slate-400 italic">Unassigned</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 mb-0.5">Created</dt>
                <dd className="font-medium text-slate-700">{formatDate(ticket.createdAt)}</dd>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <dt className="text-xs text-slate-400 mb-0.5">Resolved</dt>
                  <dd className="font-medium text-slate-700">{formatDate(ticket.resolvedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Staff actions */}
          {isStaff && nextStatuses.length > 0 && (
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Update Status</h3>
              <div className="space-y-2">
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => updateMutation.mutate({ status: s })}
                    disabled={updateMutation.isPending}
                    className="w-full btn-secondary text-xs justify-start"
                  >
                    → {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin() && (
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Assign Technician</h3>
              <select
                value={assignedToId}
                onChange={e => setAssignedToId(e.target.value)}
                className="form-select mb-2"
              >
                <option value="">Select technician…</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
              <button
                className="btn-primary btn-sm w-full justify-center"
                disabled={!assignedToId || updateMutation.isPending}
                onClick={() => updateMutation.mutate({ assignedToId: Number(assignedToId) })}
              >
                Assign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
