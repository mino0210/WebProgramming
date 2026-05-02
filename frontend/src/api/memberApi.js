import api from './axiosInstance'
export const signUp = (data) => api.post('/api/members/signup', data)
export const login  = (data) => api.post('/api/members/login',  data)
