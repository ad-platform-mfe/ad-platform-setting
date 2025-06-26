import request from '@/utils/request'

export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

export interface User {
  id: number | string
  username: string
  email: string | null
  phone: string | null
  role: 'user' | 'admin' | 'basic' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
  lastLogin?: string
  emailVerified?: boolean
  balance?: number
  activeCampaigns?: number
  creditLevel?: string
  bio?: string
}

export async function getMe(): Promise<User> {
  const response: ApiResponse<User> = await request({
    url: '/auth/me',
    method: 'get'
  })
  return response.data
}

export function updateMe(
  data: Partial<Pick<User, 'username' | 'email' | 'phone'>>
): Promise<ApiResponse<null>> {
  return request({
    url: '/users/me',
    method: 'put',
    data
  })
}

export async function getAllUsers(): Promise<User[]> {
  const response: ApiResponse<User[]> = await request({
    url: '/users',
    method: 'get'
  })
  return response.data
}

export function updateUser(
  id: number,
  data: Partial<Pick<User, 'username' | 'email' | 'phone' | 'role'>>
): Promise<ApiResponse<null>> {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(id: number): Promise<ApiResponse<null>> {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 创建一个新用户 (管理员)
 * @param data 用户数据
 */
export function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<User>> {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}
