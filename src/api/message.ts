import request from '@/utils/request'

export interface Message {
  id: number
  title: string
  content: string
  type: string
  status: 'read' | 'unread'
  createdAt: string
  meta?: any
}

export interface MessageListResponse {
  count: number
  rows: Message[]
}

// 定义一个包含 code 和 data 的完整响应类型
export interface ApiResponse<T> {
  code: number
  data: T
}

/**
 * 获取消息列表
 */
export function getMessages(params: {
  page?: number
  pageSize?: number
}): Promise<ApiResponse<MessageListResponse>> {
  return request.get('/messages', {
    params
  })
}

/**
 * 将所有消息标记为已读
 */
export function markAllMessagesAsRead(): Promise<void> {
  return request.put('/messages/mark-all-read')
}

/**
 * 将单条消息标记为已读
 */
export function markMessageAsRead(id: number): Promise<void> {
  return request.put(`/messages/${id}/read`)
}
