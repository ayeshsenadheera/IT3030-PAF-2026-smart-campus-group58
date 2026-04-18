import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { resourcesApi } from '@/api/resources'
import { useAuth } from '@/context/AuthContext'
import SearchBar from '@/components/common/SearchBar'
import Pagination from '@/components/common/Pagination'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { resourceStatusBadge, cn } from '@/utils/helpers'
import { Building2, Plus, MapPin, Users, Filter } from 'lucide-react'

const TYPES    = ['', 'ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['', 'ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE']

export default function ResourcesPage() {
  const { isAdmin } = useAuth()
  const [page,    setPage]    = useState(0)
  const [keyword, setKeyword] = useState('')
  const [type,    setType]    = useState('')
  const [status,  setStatus]  = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['resources', page, keyword, type, status],
    queryFn: () => resourcesApi.search({ page, size: 12, keyword: keyword || undefined, type: type || undefined, status: status || undefined }),
    placeholderData: (prev) => prev,
  })

  const resources   = data?.data?.data?.content ?? []
  const totalPages  = data?.data?.data?.totalPages ?? 0
  const totalElements = data?.data?.data?.totalElements ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resources</h1>
          <p className="page-subtitle">{totalElements} campus resources available</p>
        </div>
        {isAdmin() && (
          <Link to="/admin/resources" className="btn-primary">
            <Plus size={16} /> Manage Resources
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar
          value={keyword}
          onChange={v => { setKeyword(v); setPage(0) }}
          placeholder="Search by name or location…"
          className="flex-1 min-w-[200px] max-w-sm"
        />
        <select
          value={type}
          onChange={e => { setType(e.target.value); setPage(0) }}
          className="form-select w-40"
        >
          {TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(0) }}
          className="form-select w-44"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : resources.length === 0 ? (
        <EmptyState icon={Building2} title="No resources found" description="Try adjusting your filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resources.map(r => (
            <Link key={r.id} to={`/resources/${r.id}`} className="card group hover:shadow-card-hover">
              {/* Image placeholder */}
              <div className={cn(
                'h-32 rounded-t-2xl flex items-center justify-center',
                r.type === 'ROOM'      ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
                r.type === 'LAB'       ? 'bg-gradient-to-br from-purple-50 to-purple-100' :
                                          'bg-gradient-to-br from-green-50 to-green-100'
              )}>
                {r.imageUrl
                  ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover rounded-t-2xl" />
                  : <Building2 size={36} className={cn(
                      'opacity-30',
                      r.type === 'ROOM' ? 'text-blue-600' :
                      r.type === 'LAB'  ? 'text-purple-600' : 'text-green-600'
                    )} />
                }
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {r.name}
                  </h3>
                  <span className={resourceStatusBadge(r.status)} style={{ fontSize: '10px' }}>
                    {r.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={11} />
                    <span className="truncate">{r.location}</span>
                  </div>
                  {r.capacity && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users size={11} />
                      <span>Capacity: {r.capacity}</span>
                    </div>
                  )}
                  <span className="badge badge-blue text-[10px]">{r.type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
