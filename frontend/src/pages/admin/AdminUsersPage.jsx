import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import Modal from '@/components/common/Modal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import SearchBar from '@/components/common/SearchBar'
import { formatDate } from '@/utils/helpers'
import { Users, ShieldCheck, UserCheck, UserX, Wrench, ShieldOff } from 'lucide-react'
import toast from 'react-hot-toast'

const SUPER_ADMIN_EMAIL = 'ayeshsenadheera7@gmail.com'
const ALL_ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const roleBadge = (role) => ({
  ADMIN:       'badge-red',
  TECHNICIAN:  'badge-purple',
  USER:        'badge-blue',
}[role] ?? 'badge-slate')

const isSuperAdmin = (user) =>
  user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [keyword,      setKeyword]      = useState('')
  const [roleModal,    setRoleModal]    = useState(null)
  const [toggleTarget, setToggleTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ page: 0, size: 100 }),
  })
  const allUsers = data?.data?.data ?? []
  const users    = keyword
    ? allUsers.filter(u =>
        u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
        u.email.toLowerCase().includes(keyword.toLowerCase()))
    : allUsers

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.assignRole(userId, role),
    onSuccess: () => {
      toast.success('Role assigned')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to assign role'),
  })

  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.removeRole(userId, role),
    onSuccess: () => {
      toast.success('Role removed')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to remove role'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId }) => adminApi.toggleActive(userId),
    onSuccess: (res) => {
      const active = res.data.data.isActive
      toast.success(`User ${active ? 'activated' : 'deactivated'}`)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setToggleTarget(null)
    },
    onError: (err) => toast.error(err.response?.data?.message ?? 'Failed to update user'),
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{allUsers.length} registered users</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users',    value: allUsers.length,                                           color: 'bg-blue-50 text-blue-700' },
          { label: 'Admins',         value: allUsers.filter(u => u.roles?.includes('ADMIN')).length,   color: 'bg-red-50 text-red-700' },
          { label: 'Technicians',    value: allUsers.filter(u => u.roles?.includes('TECHNICIAN')).length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Active',         value: allUsers.filter(u => u.isActive !== false).length,         color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-75">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <SearchBar value={keyword} onChange={setKeyword} placeholder="Search by name or email…" className="max-w-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={u.fullName}
                               className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                        : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500
                                          flex items-center justify-center text-white text-xs font-semibold">
                            {u.fullName?.charAt(0)}
                          </div>
                      }
                      <div>
                        <span className="text-sm font-medium text-slate-800">{u.fullName}</span>
                        {isSuperAdmin(u) && (
                          <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50
                                           border border-amber-200 rounded-full px-2 py-0.5">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-500 text-xs">{u.email}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map(r => (
                        <span key={r} className={`badge ${roleBadge(r)} text-[10px]`}>{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {isSuperAdmin(u) ? (
                      <span className="text-xs text-slate-300 italic">Protected</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setRoleModal({ user: u })}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                          title="Manage Roles"
                        >
                          <ShieldCheck size={15} />
                        </button>
                        <button
                          onClick={() => setToggleTarget({ user: u })}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive !== false
                              ? 'hover:bg-red-50 text-red-400'
                              : 'hover:bg-green-50 text-green-500'
                          }`}
                          title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive !== false ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role management modal */}
      <Modal
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
        title={`Manage Roles — ${roleModal?.user?.fullName}`}
        size="sm"
        footer={<button className="btn-secondary" onClick={() => setRoleModal(null)}>Done</button>}
      >
        {roleModal && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              Toggle roles for <strong>{roleModal.user.email}</strong>
            </p>
            {ALL_ROLES.map(role => {
              const hasRole  = roleModal.user.roles?.includes(role)
              const Icon     = role === 'ADMIN' ? ShieldCheck : role === 'TECHNICIAN' ? Wrench : UserCheck
              const isPending = assignRoleMutation.isPending || removeRoleMutation.isPending

              return (
                <div key={role}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={hasRole ? 'text-primary-600' : 'text-slate-400'} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{role}</p>
                      <p className="text-xs text-slate-400">
                        {role === 'ADMIN'       ? 'Full system access'
                        : role === 'TECHNICIAN' ? 'Can handle maintenance tickets'
                        :                         'Standard access'}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isPending}
                    onClick={() => {
                      const updated = { ...roleModal.user, roles: hasRole
                        ? roleModal.user.roles.filter(r => r !== role)
                        : [...(roleModal.user.roles ?? []), role]
                      }
                      setRoleModal({ user: updated })
                      hasRole
                        ? removeRoleMutation.mutate({ userId: roleModal.user.id, role })
                        : assignRoleMutation.mutate({ userId: roleModal.user.id, role })
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${hasRole ? 'bg-primary-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                      ${hasRole ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      {/* Toggle active confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleActiveMutation.mutate({ userId: toggleTarget.user.id })}
        loading={toggleActiveMutation.isPending}
        title={toggleTarget?.user?.isActive !== false ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${
          toggleTarget?.user?.isActive !== false ? 'deactivate' : 'activate'
        } ${toggleTarget?.user?.fullName}?`}
        confirmLabel={toggleTarget?.user?.isActive !== false ? 'Deactivate' : 'Activate'}
        danger={toggleTarget?.user?.isActive !== false}
      />
    </div>
  )
}
