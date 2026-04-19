import api from './axios'

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getMy: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  processAction: (id, data) => api.put(`/bookings/${id}/action`, data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}
