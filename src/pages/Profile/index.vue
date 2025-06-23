<template>
  <div class="profile-page">
    <t-card :bordered="false" shadow>
      <t-row :gutter="[24, 24]">
        <t-col :xs="12" :sm="12" :md="12" :lg="6" :xl="4">
          <div class="avatar-section">
            <t-avatar size="120px">
              <template #icon>
                <user-avatar-icon />
              </template>
            </t-avatar>
            <h3 class="user-name">{{ userInfo?.username }}</h3>
            <p class="user-role">
              <t-tag
                v-if="userInfo?.role === 'admin'"
                theme="success"
                variant="light"
                >管理员</t-tag
              >
              <t-tag v-else theme="primary" variant="light">普通用户</t-tag>
            </p>
          </div>
        </t-col>
        <t-col :xs="12" :sm="12" :md="12" :lg="18" :xl="20">
          <t-card title="详细信息" :bordered="false">
            <t-descriptions bordered :column="1" size="medium">
              <t-descriptions-item label="用户ID">{{
                userInfo?.id
              }}</t-descriptions-item>
              <t-descriptions-item label="邮箱">{{
                userInfo?.email || '未设置'
              }}</t-descriptions-item>
              <t-descriptions-item label="手机号">{{
                userInfo?.phone || '未设置'
              }}</t-descriptions-item>
              <t-descriptions-item label="注册时间">{{
                formattedJoinDate
              }}</t-descriptions-item>
            </t-descriptions>
            <template #actions>
              <t-button theme="primary" @click="handleEditClick"
                >编辑资料</t-button
              >
            </template>
          </t-card>
        </t-col>
      </t-row>
    </t-card>

    <t-dialog
      v-model:visible="editModalVisible"
      header="编辑个人资料"
      :on-confirm="handleUpdateProfile"
    >
      <t-form ref="formRef" :data="editForm" :rules="rules">
        <t-form-item label="用户名" name="username">
          <t-input
            v-model="editForm.username"
            placeholder="请输入用户名"
          ></t-input>
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="editForm.email" placeholder="请输入邮箱"></t-input>
        </t-form-item>
        <t-form-item label="手机号" name="phone">
          <t-input
            v-model="editForm.phone"
            placeholder="请输入手机号"
          ></t-input>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { getMe, updateMe, type User } from '@/api/user'
import {
  MessagePlugin,
  type FormInstanceFunctions,
  type FormRule
} from 'tdesign-vue-next'
import { UserAvatarIcon } from 'tdesign-icons-vue-next'

const userInfo = ref<User | null>(null)
const editModalVisible = ref(false)
const formRef = ref<FormInstanceFunctions | null>(null)

const editForm = reactive({
  username: '',
  email: '',
  phone: ''
})

const rules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }]
}

const fetchUserInfo = async () => {
  try {
    const user = await getMe()
    userInfo.value = user
  } catch (error: any) {
    MessagePlugin.error(`获取用户信息失败: ${error.message}`)
  }
}

const formattedJoinDate = computed(() => {
  if (userInfo.value?.createdAt) {
    return new Date(userInfo.value.createdAt).toLocaleDateString()
  }
  return 'N/A'
})

const handleEditClick = () => {
  if (userInfo.value) {
    editForm.username = userInfo.value.username
    editForm.email = userInfo.value.email || ''
    editForm.phone = userInfo.value.phone || ''
  }
  editModalVisible.value = true
}

const handleUpdateProfile = async () => {
  const result = await formRef.value?.validate()
  if (result === true) {
    try {
      await updateMe(editForm)
      MessagePlugin.success('用户信息更新成功')
      editModalVisible.value = false
      await fetchUserInfo() 
    } catch (error: any) {
      MessagePlugin.error(`更新失败: ${error.message}`)
    }
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-page {
  padding: 24px;
  background-color: #f0f2f5;
}
.avatar-section {
  text-align: center;
  padding: 24px;
}
.user-name {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 600;
}
.user-role {
  margin-top: 8px;
}
</style>
