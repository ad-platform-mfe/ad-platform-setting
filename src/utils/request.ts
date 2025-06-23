import axios from 'axios'
import microApp from '@micro-zoe/micro-app'

// 从全局数据或 localStorage 获取 token
let token = microApp.getGlobalData()?.token || localStorage.getItem('token')

// 监听全局数据变化，以便 token 能及时同步
microApp.addGlobalDataListener((data: any) => {
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
  (config) => {
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
  (response) => {
    // 后端返回的数据结构是 { code, data, msg }
    // 我们直接返回 data 部分给业务逻辑使用
    if (response.data.code === 0) {
      return response.data
    } else {
      // 通过 Promise.reject 返回错误信息
      return Promise.reject(new Error(response.data.msg || 'Error'))
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
