import api from './axiosInstance'

export const toggleSympathy = (reportId, memberId) =>
  api.post(`/api/reports/${reportId}/sympathy?memberId=${memberId}`)

export const getSympathyStatus = (reportId, memberId) =>
  api.get(`/api/reports/${reportId}/sympathy?memberId=${memberId}`)
