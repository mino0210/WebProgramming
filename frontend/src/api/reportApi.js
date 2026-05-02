import api from './axiosInstance'

export const createReport = (formData, memberId) =>
  api.post(`/api/reports?memberId=${memberId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getReports    = (categoryId) =>
  api.get('/api/reports', { params: categoryId ? { categoryId } : {} })
export const resolveReport = (reportId, memberId) =>
  api.patch(`/api/reports/${reportId}/resolve?memberId=${memberId}`)
export const getMyReports  = (memberId) =>
  api.get(`/api/reports/my?memberId=${memberId}`)
