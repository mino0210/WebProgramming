import api from './axiosInstance'

export const createReport = (formData, memberId) =>
  // FormData는 브라우저가 boundary를 포함한 Content-Type을 자동 설정해야 안정적입니다.
  api.post(`/api/reports?memberId=${memberId}`, formData)
export const getReports    = (categoryId) =>
  api.get('/api/reports', { params: categoryId ? { categoryId } : {} })
export const getAllReports = async () => {
  try {
    return await api.get('/api/reports/all')
  } catch (error) {
    console.warn('[reportApi] /api/reports/all 조회 실패, 기존 /api/reports로 대체합니다:', error?.message || error)
    return api.get('/api/reports')
  }
}
export const resolveReport = (reportId, memberId) =>
  api.patch(`/api/reports/${reportId}/resolve?memberId=${memberId}`)
export const getMyReports  = (memberId) =>
  api.get(`/api/reports/my?memberId=${memberId}`)
export const getCategories = () => api.get('/api/categories')