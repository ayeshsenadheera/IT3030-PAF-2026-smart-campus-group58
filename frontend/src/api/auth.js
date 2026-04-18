import api from './axios'

export const authApi = {
  getMe: () => api.get('/auth/me'),
}