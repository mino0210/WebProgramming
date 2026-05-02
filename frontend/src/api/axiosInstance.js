import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.request.use((config) => config)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '서버 오류가 발생했습니다.'
    return Promise.reject(new Error(message))
  }
)

export default api
