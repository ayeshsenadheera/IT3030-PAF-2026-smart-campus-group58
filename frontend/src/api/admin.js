import api from './axios'

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getTechnicians: () => api.get('/admin/technicians'),
  assignRole: (userId, roleName) => api.put(`/admin/users/${userId}/roles/${roleName}`),
  removeRole: (userId, roleName) => api.delete(`/admin/users/${userId}/roles/${roleName}`),
  toggleActive: (userId) => api.patch(`/admin/users/${userId}/toggle-active`),
  getDashboardStats:          () => api.get('/dashboard/stats'),
  getAnalytics:               () => api.get('/dashboard/analytics'),
  getNotificationPreferences: () => api.get('/dashboard/notification-preferences'),
  updateNotificationPrefs:    (data) => api.put('/dashboard/notification-preferences', data),
}