import api from './axios'

export const ticketsApi = {
  create: (data) => api.post('/tickets', data),
  search: (params) => api.get('/tickets', { params }),
  getMy: (params) => api.get('/tickets/my', { params }),
  getAssigned: (params) => api.get('/tickets/assigned', { params }),
  getById: (id, includeComments = true) =>
    api.get(`/tickets/${id}`, { params: { includeComments } }),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
  deleteComment: (commentId) => api.delete(`/tickets/comments/${commentId}`),
  editComment:   (commentId, data) => api.patch(`/tickets/comments/${commentId}`, data),
  addImages: (id, imageUrls) => api.post(`/tickets/${id}/images`, imageUrls),
}
