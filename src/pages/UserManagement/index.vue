<template>
  <div class="user-management-page">
    <div class="page-header">
      <t-button @click="handleCreate">新建用户</t-button>
      <t-space class="header-actions">
        <t-input
          v-model="searchQuery"
          placeholder="请输入用户名"
          clearable
          @clear="handleSearch"
          @enter="handleSearch"
        />
        <t-button @click="handleSearch">查询</t-button>
      </t-space>
    </div>

    <div class="page-content">
      <t-table
        row-key="id"
        :data="filteredUsers"
        :columns="columns"
        :loading="loading"
        stripe
        hover
      >
        <template #role="{ row }">
          <t-tag v-if="row.role === 'admin'" theme="success" variant="light"
            >管理员</t-tag
          >
          <t-tag v-else theme="primary" variant="light">普通用户</t-tag>
        </template>
        <template #createdAt="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
        <template #operations="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" @click="handleEdit(row)"
              >编辑</t-button
            >
            <t-popconfirm
              content="确认删除此用户吗？"
              @confirm="handleDelete(row.id)"
            >
              <t-button theme="danger" variant="text">删除</t-button>
            </t-popconfirm>
          </t-space>
        </template>
      </t-table>
    </div>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogTitle"
      :on-confirm="onConfirm"
      :on-close="() => (dialogVisible = false)"
    >
      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        label-width="80px"
      >
        <t-form-item label="用户名" name="username">
          <t-input v-model="formData.username" placeholder="请输入用户名" />
        </t-form-item>
        <t-form-item label="邮箱" name="email">
          <t-input v-model="formData.email" placeholder="请输入邮箱" />
        </t-form-item>
        <t-form-item label="手机号" name="phone">
          <t-input v-model="formData.phone" placeholder="请输入手机号" />
        </t-form-item>
        <t-form-item v-if="!editMode" label="密码" name="password">
          <t-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
          />
        </t-form-item>
        <t-form-item label="角色" name="role">
          <t-select v-model="formData.role">
            <t-option key="admin" label="管理员" value="admin" />
            <t-option key="user" label="普通用户" value="user" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser,
  type User
} from '@/api/user'
import {
  MessagePlugin,
  type TableProps,
  type FormRule,
  type FormInstanceFunctions
} from 'tdesign-vue-next'

const users = ref<User[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const editMode = ref(false)
const currentUserId = ref<number | null>(null)
const formRef = ref<FormInstanceFunctions | null>(null)
const searchQuery = ref('')

const formData = reactive<{
  username: string
  email: string
  phone: string
  role: 'user' | 'admin'
  password: string
}>({
  username: '',
  email: '',
  phone: '',
  role: 'user',
  password: ''
})

const formRules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  role: [{ required: true, message: '必须选择一个角色', trigger: 'change' }]
}

const dialogTitle = computed(() => (editMode.value ? '编辑用户' : '新建用户'))

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  return users.value.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const columns: TableProps['columns'] = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'username', title: '用户名' },
  { colKey: 'email', title: '邮箱' },
  { colKey: 'phone', title: '手机号' },
  { colKey: 'role', title: '角色' },
  { colKey: 'createdAt', title: '创建时间' },
  { colKey: 'operations', title: '操作', width: 180 }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const userList = await getAllUsers()
    users.value = userList
  } catch (error: any) {
    MessagePlugin.error(`获取用户列表失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formRef.value?.reset()
  formData.username = ''
  formData.email = ''
  formData.phone = ''
  formData.role = 'user'
  formData.password = ''
  currentUserId.value = null
}

const handleCreate = () => {
  editMode.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  editMode.value = true
  resetForm()
  currentUserId.value = row.id
  formData.username = row.username
  formData.email = row.email || ''
  formData.phone = row.phone || ''
  formData.role = row.role
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id)
    MessagePlugin.success('删除成功')
    await fetchUsers()
  } catch (error: any) {
    MessagePlugin.error(`删除失败: ${error.message}`)
  }
}

const handleSearch = () => {}

const onConfirm = async () => {
  const result = await formRef.value?.validate()
  if (result !== true) return

  try {
    if (editMode.value && currentUserId.value) {
      const { password, ...updateData } = formData
      await updateUser(currentUserId.value, updateData)
      MessagePlugin.success('更新成功')
    } else {
      await createUser(formData)
      MessagePlugin.success('新建用户成功')
    }
    dialogVisible.value = false
    await fetchUsers()
  } catch (error: any) {
    MessagePlugin.error(`操作失败: ${error.message}`)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-page {
  background-color: #f0f2f5;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.page-header {
  background-color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
}

:deep(.t-card) {
  border-radius: 8px;
}
</style>
