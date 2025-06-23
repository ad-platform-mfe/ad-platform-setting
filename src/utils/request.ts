import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse
} from 'axios'
import microApp from '@micro-zoe/micro-app'

// 从全局数据或 localStorage 获取 token
let token: string | null =
  (microApp.getGlobalData()?.token as string) || localStorage.getItem('token')

// 监听全局数据变化，以便 token 能及时同步
microApp.addGlobalDataListener((data: { token?: string }) => {
  if (data.token) {
    token = data.token
    localStorage.setItem('token', token)
  }
})

const service = axios.create({
  baseURL: 'http://localhost:9090/api',
  timeout: 10000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data.code === 0) {
      return response.data
    }
    const { data } = response
    if (data.code !== undefined && data.code !== 0) {
      console.error('API Error:', data.msg || data.message)
      return Promise.reject(new Error(data.msg || data.message || 'Error'))
    }
    return data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
