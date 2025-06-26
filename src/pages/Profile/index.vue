<template>
  <div class="profile-container">
    <div class="main-content">
      <!-- 侧边栏导航 -->
      <div class="sidebar">
        <div class="user-info">
          <t-avatar
            :src="defaultAvatar"
            size="60px"
            class="sidebar-avatar"
          ></t-avatar>
          <div class="user-name">{{ userInfo?.username || '用户' }}</div>
          <div class="user-role" v-if="userInfo?.role">{{ userInfo.role }}</div>
          <div class="account-status">
            <t-tag theme="success" variant="light">已认证</t-tag>
          </div>
        </div>

        <div class="sidebar-menu">
          <div
            class="menu-item"
            :class="{ active: activeContent === 'profile' }"
            @click="switchContent('profile')"
          >
            <t-icon name="user-circle"></t-icon>
            <span>个人资料</span>
          </div>
          <div
            class="menu-item"
            :class="{ active: activeContent === 'campaigns' }"
            @click="switchContent('campaigns')"
          >
            <t-icon name="chart-bar"></t-icon>
            <span>我的投放</span>
          </div>
          <div
            class="menu-item"
            :class="{ active: activeContent === 'messages' }"
            @click="switchContent('messages')"
          >
            <t-icon name="mail"></t-icon>
            <span>消息中心</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 个人资料内容 -->
        <div class="profile-content" v-if="activeContent === 'profile'">
          <div class="profile-header">
            <h2>个人资料</h2>
            <t-button
              theme="primary"
              size="small"
              class="edit-btn"
              @click="handleEditClick"
              >编辑资料</t-button
            >
          </div>

          <!-- 基本信息卡片 -->
          <div class="profile-section">
            <h3 class="section-title">基本信息</h3>
            <div class="profile-card">
              <div class="profile-avatar">
                <t-avatar :src="defaultAvatar" size="100px"></t-avatar>
                <t-button
                  variant="outline"
                  size="small"
                  class="avatar-btn"
                  @click="changeAvatar"
                  >更换头像</t-button
                >
              </div>
              <div class="profile-details">
                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">用户名：</span>
                    <span class="value">{{ userInfo?.username }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">用户ID：</span>
                    <span class="value">{{ userInfo?.id }}</span>
                  </div>
                </div>

                <div class="detail-row">
                  <div class="detail-item">
                    <span class="label">注册时间：</span>
                    <span class="value">{{ formattedJoinDate }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">用户角色：</span>
                    <t-tag theme="primary" variant="light" size="small">{{
                      userInfo?.role
                    }}</t-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 联系方式卡片 -->
          <div class="profile-section">
            <h3 class="section-title">联系方式</h3>
            <div class="contact-card">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">邮箱：</span>
                  <span class="value">{{ userInfo?.email || '未设置' }}</span>
                </div>

                <div class="detail-item">
                  <span class="label">手机号：</span>
                  <span class="value">{{ userInfo?.phone || '未设置' }}</span>
                  <t-button variant="text" size="small">更换</t-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息中心内容 -->
        <div class="message-content" v-if="activeContent === 'messages'">
          <div class="message-header">
            <h2>消息中心</h2>
            <t-button
              theme="default"
              size="small"
              variant="outline"
              @click="handleMarkAllRead"
              >全部标记已读</t-button
            >
          </div>

          <!-- 5. 动态渲染消息列表 -->
          <t-loading :loading="messageLoading" text="加载中..." size="small">
            <div class="message-list" v-if="messages.length > 0">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ unread: message.status === 'unread' }"
                @click="handleMessageClick(message)"
              >
                <div class="message-icon">
                  <t-icon name="notification"></t-icon>
                </div>
                <div class="message-content-body">
                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-desc">{{ message.content }}</div>
                  <div class="message-time">
                    {{ new Date(message.createdAt).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon"><t-icon name="mail"></t-icon></div>
              <div class="empty-text">暂无消息</div>
            </div>
          </t-loading>
        </div>
      </div>
    </div>
    <t-dialog
      v-model:visible="editDialogVisible"
      header="编辑个人资料"
      :on-confirm="onConfirmUpdate"
      :on-close="() => (editDialogVisible = false)"
    >
      <t-form
        ref="formRef"
        :data="editFormData"
        :rules="formRules"
        label-width="80px"
      >
        <t-form-item label="用户名" name="username">
          <t-input v-model="editFormData.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="editFormData.email" placeholder="请输入邮箱" />
        </t-form-item>
        <t-form-item label="手机号" name="phone">
          <t-input v-model="editFormData.phone" placeholder="请输入手机号" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { getMe, updateUser, type User } from '@/api/user'
import {
  getMessages,
  markAllMessagesAsRead,
  markMessageAsRead,
  type Message
} from '@/api/message'
import {
  MessagePlugin,
  type FormRule,
  type FormInstanceFunctions
} from 'tdesign-vue-next'

const userInfo = ref<User | null>(null)
const defaultAvatar = ref('@/assets/default-avatar.svg')
const activeContent = ref('profile')
const editDialogVisible = ref(false)
const formRef = ref<FormInstanceFunctions | null>(null)

const messages = ref<Message[]>([])
const messagePagination = reactive({ page: 1, pageSize: 10, total: 0 })
const messageLoading = ref(false)

const editFormData = reactive({
  username: '',
  email: '',
  phone: ''
})

const formRules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }]
}

const switchContent = (content: string) => {
  activeContent.value = content
}

const fetchMessages = async () => {
  if (messageLoading.value) return
  messageLoading.value = true
  try {
    const res = await getMessages({
      page: messagePagination.page,
      pageSize: messagePagination.pageSize
    })
    messages.value = res.data.rows
    messagePagination.total = res.data.count
  } catch (error: any) {
    MessagePlugin.error(`获取消息失败: ${error.message || '请稍后重试'}`)
  } finally {
    messageLoading.value = false
  }
}

const handleMessageClick = async (message: Message) => {
  if (message.status === 'unread') {
    try {
      await markMessageAsRead(message.id)
      const target = messages.value.find((m) => m.id === message.id)
      if (target) {
        target.status = 'read'
      }
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
}

const handleMarkAllRead = async () => {
  try {
    await markAllMessagesAsRead()
    MessagePlugin.success('全部标记为已读成功')
    await fetchMessages()
  } catch (error: any) {
    MessagePlugin.error(`操作失败: ${error.message || '请稍后重试'}`)
  }
}

watch(
  activeContent,
  (newVal) => {
    if (newVal === 'messages' && messages.value.length === 0) {
      fetchMessages()
    }
  },
  { immediate: true }
)

const handleEditClick = () => {
  if (!userInfo.value) return
  editFormData.username = userInfo.value.username
  editFormData.email = userInfo.value.email || ''
  editFormData.phone = userInfo.value.phone || ''
  editDialogVisible.value = true
}

const onConfirmUpdate = async () => {
  const result = await formRef.value?.validate()
  if (result !== true || !userInfo.value) return

  try {
    const payload = {
      username: editFormData.username,
      email: editFormData.email || null,
      phone: editFormData.phone || null
    }
    await updateUser(Number(userInfo.value.id), payload)
    MessagePlugin.success('更新成功')
    editDialogVisible.value = false
    await fetchUserInfo()
  } catch (error: any) {
    MessagePlugin.error(`更新失败: ${error.message || '请稍后重试'}`)
  }
}

const changeAvatar = () => {
  MessagePlugin.info('头像更换功能即将上线')
}

const formattedJoinDate = computed(() => {
  if (userInfo.value?.createdAt) {
    return new Date(userInfo.value.createdAt).toLocaleDateString()
  }
  return ''
})

const fetchUserInfo = async () => {
  try {
    const user = await getMe()
    userInfo.value = user
  } catch (error: any) {
    MessagePlugin.error(`获取用户信息失败: ${error.message || '请稍后重试'}`)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  height: 100vh;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.user-info {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 20px;
}

.sidebar-avatar {
  margin: 0 auto 15px;
  border: 3px solid #f0f2f5;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.user-role {
  font-size: 13px;
  color: #5a78ed;
  background-color: #f0f3ff;
  padding: 3px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.account-status {
  display: inline-block;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item.active {
  background-color: #e8f3ff;
  color: #165dff;
  font-weight: 500;
}

/* 内容区域 */
.content-area {
  width: 940px;
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}

.profile-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  border-radius: 20px;
  padding: 6px 16px;
}

/* 分区标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #165dff;
}

.profile-section {
  margin-bottom: 30px;
}

.profile-card {
  display: flex;
  gap: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-btn {
  width: 100px;
}

.profile-details {
  flex: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.detail-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-item {
  flex: 1;
  min-width: 250px;
}

.label {
  display: block;
  color: #999;
  font-size: 13px;
  margin-bottom: 4px;
}

.value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

/* 联系方式卡片 */
.contact-card {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #666;
}

.stat-icon {
  font-size: 20px;
}

.stat-icon.balance {
  color: #67c23a;
}
.stat-icon.campaign {
  color: #5a78ed;
}
.stat-icon.credit {
  color: #f56c6c;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

/* 个人简介卡片 */
.bio-card {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
}

.bio-content {
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
  min-height: 60px;
}

/* 我的投放内容 */
.campaign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #e0e0e0;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 20px;
}

.create-btn {
  border-radius: 30px;
  padding: 10px 30px;
}

/* 消息中心内容 */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f5f7fa;
  border: 1px solid #f0f2f5;
  cursor: pointer;
}

.message-item.unread {
  background-color: #e8f3ff;
  border-left: 3px solid #165dff;
}

.message-icon {
  width: 40px;
  height: 40px;
  background-color: #e8f3ff;
  color: #165dff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content-body {
  flex: 1;
}

.message-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.message-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.message-time {
  font-size: 12px;
  color: #999;
}
</style>
