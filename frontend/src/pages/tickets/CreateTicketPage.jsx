import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ticketsApi } from '@/api/tickets'
import { resourcesApi } from '@/api/resources'
import toast from 'react-hot-toast'
import { ArrowLeft, Wrench } from 'lucide-react'

const CATEGORIES = ['MAINTENANCE', 'ELECTRICAL', 'PLUMBING', 'IT', 'SAFETY', 'OTHER']
const PRIORITIES  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const schema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category:    z.string().min(1, 'Category is required'),
  priority:    z.string().min(1, 'Priority is required'),
  resourceId:       z.string().optional(),
  preferredContact:  z.string().optional(),
})

export default function CreateTicketPage() {
  const navigate = useNavigate()

  const { data: resourcesData } = useQuery({
    queryKey: ['resources-select'],
    queryFn: () => resourcesApi.search({ size: 100 }),
  })
  const resources = resourcesData?.data?.data?.content ?? []

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const mutation = useMutation({
    mutationFn: (data) => ticketsApi.create({
      ...data,
      resourceId:      data.resourceId ? Number(data.resourceId) : undefined,
      preferredContact: data.preferredContact || undefined,
    }),
    onSuccess: (res) => {
      toast.success('Ticket created successfully!')
      navigate(`/tickets/${res.data.data.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to create ticket'),
  })

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Report an Issue</h1>
          <p className="page-subtitle">Create a maintenance or incident ticket.</p>
        </div>
      </div>

      <div className="card card-body">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          {/* Title */}
          <div>
            <label className="form-label">Title *</label>
            <input {...register('title')} className="form-input" placeholder="Brief summary of the issue" />
            {errors.title && <p className="form-error">{errors.title.message}</p>}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category *</label>
              <select {...register('category')} className="form-select">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="form-error">{errors.category.message}</p>}
            </div>
            <div>
              <label className="form-label">Priority *</label>
              <select {...register('priority')} className="form-select">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.priority && <p className="form-error">{errors.priority.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea {...register('description')} rows={5} className="form-textarea"
              placeholder="Describe the issue in detail. Include when it started, how severe it is, and any relevant context…" />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
          </div>

          {/* Related Resource (optional) */}
          <div>
            <label className="form-label">Related Resource <span className="text-slate-400 font-normal">(optional)</span></label>
            <select {...register('resourceId')} className="form-select">
              <option value="">None</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} — {r.location}</option>
              ))}
            </select>
          </div>

          {/* Preferred Contact */}
          <div>
            <label className="form-label">
              Preferred Contact <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('preferredContact')}
              className="form-input"
              placeholder="Phone number, office room, or alternate email for follow-up"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              <Wrench size={16} />
              {mutation.isPending ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
