import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { resourcesApi } from '@/api/resources'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { resourceStatusBadge, formatDate } from '@/utils/helpers'
import { Building2, MapPin, Users, ArrowLeft, CalendarPlus } from 'lucide-react'

export default function ResourceDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => resourcesApi.getById(id),
  })
  const resource = data?.data?.data

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!resource) return <p className="text-center text-slate-400 py-20">Resource not found.</p>

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card card-body">
            {/* Image */}
            <div className="h-52 rounded-xl bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center mb-6">
              {resource.imageUrl
                ? <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover rounded-xl" />
                : <Building2 size={56} className="text-primary-300" />
              }
            </div>

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-slate-900">{resource.name}</h1>
              <span className={resourceStatusBadge(resource.status)}>
                {resource.status?.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                {resource.location}
              </div>
              {resource.capacity && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  Capacity: {resource.capacity}
                </div>
              )}
              <span className="badge badge-blue">{resource.type}</span>
            </div>

            {resource.description && (
              <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Actions</h3>
            {resource.status === 'ACTIVE' ? (
              <Link
                to={`/bookings/new?resourceId=${resource.id}`}
                className="btn-primary w-full justify-center"
              >
                <CalendarPlus size={16} /> Book This Resource
              </Link>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                This resource is currently not available for booking.
              </p>
            )}
          </div>

          <div className="card card-body">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Details</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Type</dt>
                <dd className="font-medium text-slate-700">{resource.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Status</dt>
                <dd className="font-medium text-slate-700">{resource.status?.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Added</dt>
                <dd className="font-medium text-slate-700 text-right">{formatDate(resource.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
