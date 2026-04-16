import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '@/api/resources'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import SearchBar from '@/components/common/SearchBar'
import { resourceStatusBadge } from '@/utils/helpers'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const TYPES    = ['ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE']

const schema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  type:        z.string().min(1, 'Type is required'),
  capacity:    z.coerce.number().min(1).optional().or(z.literal('')),
  location:    z.string().min(2, 'Location is required'),
  description:          z.string().optional(),
  availabilityWindows:  z.string().optional(),
  status:               z.string().min(1, 'Status is required'),
  imageUrl:    z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

function ResourceForm({ defaultValues, onSubmit, isPending }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { type: 'ROOM', status: 'ACTIVE' },
  })

  return (
    <form id="resource-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Name *</label>
        <input {...register('name')} className="form-input" placeholder="e.g., Lecture Hall A" />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Type *</label>
          <select {...register('type')} className="form-select">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.type && <p className="form-error">{errors.type.message}</p>}
        </div>
        <div>
          <label className="form-label">Capacity</label>
          <input {...register('capacity')} type="number" min={1} className="form-input" placeholder="e.g., 40" />
          {errors.capacity && <p className="form-error">{errors.capacity.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">Location *</label>
        <input {...register('location')} className="form-input" placeholder="e.g., Block A, Floor 2" />
        {errors.location && <p className="form-error">{errors.location.message}</p>}
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea {...register('description')} rows={3} className="form-textarea"
          placeholder="Optional description of this resource…" />
      </div>

      <div>
        <label className="form-label">Availability Windows <span className="text-slate-400 font-normal">(optional)</span></label>
        <input {...register('availabilityWindows')} className="form-input"
          placeholder="e.g., Mon-Fri 08:00-18:00, or 24/7" />
      </div>

      <div>
        <label className="form-label">Status *</label>
        <select {...register('status')} className="form-select">
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label">Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
        <input {...register('imageUrl')} className="form-input" placeholder="https://…" />
        {errors.imageUrl && <p className="form-error">{errors.imageUrl.message}</p>}
      </div>
    </form>
  )
}

export default function AdminResourcesPage() {
  const qc = useQueryClient()
  const [keyword,      setKeyword]      = useState('')
  const [page,         setPage]         = useState(0)
  const [createOpen,   setCreateOpen]   = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resources', page, keyword],
    queryFn: () => resourcesApi.search({ page, size: 15, keyword: keyword || undefined }),
    placeholderData: (prev) => prev,
  })
  const resources  = data?.data?.data?.content ?? []
  const totalElements = data?.data?.data?.totalElements ?? 0

  const createMutation = useMutation({
    mutationFn: (data) => resourcesApi.create(data),
    onSuccess: () => {
      toast.success('Resource created')
      qc.invalidateQueries({ queryKey: ['admin-resources'] })
      qc.invalidateQueries({ queryKey: ['resources'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setCreateOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => resourcesApi.update(id, data),
    onSuccess: () => {
      toast.success('Resource updated')
      qc.invalidateQueries({ queryKey: ['admin-resources'] })
      qc.invalidateQueries({ queryKey: ['resources'] })
      setEditTarget(null)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => resourcesApi.delete(id),
    onSuccess: () => {
      toast.success('Resource deleted')
      qc.invalidateQueries({ queryKey: ['admin-resources'] })
      qc.invalidateQueries({ queryKey: ['resources'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setDeleteTarget(null)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
  })

  const handleCreate = (formData) => {
    createMutation.mutate({
      ...formData,
      capacity: formData.capacity || undefined,
      imageUrl: formData.imageUrl || undefined,
    })
  }

  const handleUpdate = (formData) => {
    updateMutation.mutate({
      id: editTarget.id,
      data: {
        ...formData,
        capacity:             formData.capacity || undefined,
        imageUrl:             formData.imageUrl || undefined,
        availabilityWindows:  formData.availabilityWindows || undefined,
      },
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Resources</h1>
          <p className="page-subtitle">{totalElements} resources in the system</p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add Resource
        </button>
      </div>

      <div className="mb-4">
        <SearchBar value={keyword} onChange={v => { setKeyword(v); setPage(0) }}
          placeholder="Search by name or location…" className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon={Building2} title="No resources found"
          action={<button className="btn-primary" onClick={() => setCreateOpen(true)}>Add First Resource</button>} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-slate-900">{r.name}</td>
                  <td><span className="badge badge-blue text-[10px]">{r.type}</span></td>
                  <td className="text-slate-500 text-xs">{r.location}</td>
                  <td className="text-slate-500">{r.capacity ?? '—'}</td>
                  <td><span className={resourceStatusBadge(r.status)}>{r.status?.replace('_', ' ')}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditTarget(r)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Resource"
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="resource-form" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Resource'}
            </button>
          </>
        }
      >
        <ResourceForm onSubmit={handleCreate} isPending={createMutation.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit — ${editTarget?.name}`}
        size="md"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
            <button type="submit" form="resource-form" className="btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        {editTarget && (
          <ResourceForm
            defaultValues={{
              name: editTarget.name,
              type: editTarget.type,
              capacity: editTarget.capacity ?? '',
              location: editTarget.location,
              description: editTarget.description ?? '',
              status: editTarget.status,
              imageUrl: editTarget.imageUrl ?? '',
            }}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
        title="Delete Resource"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This will also remove all associated bookings.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
