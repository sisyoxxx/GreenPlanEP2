<template>
  <AdminLayout>
    <section class="page-shell page-lite">
      <div class="head">
        <div>
          <h2>个人信息</h2>
          <p>可设置用户名、手机号、性别和头像。</p>
        </div>
        <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
      </div>

      <div class="form-grid">
        <label>
          <span>用户名</span>
          <input v-model="form.username" type="text" maxlength="64" placeholder="请输入用户名" />
        </label>

        <label>
          <span>手机号</span>
          <input v-model="form.phone" type="text" maxlength="32" placeholder="请输入手机号" />
        </label>

        <label>
          <span>性别</span>
          <select v-model="form.gender">
            <option value="保密">保密</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </label>

        <label class="avatar-field">
          <span>头像（可选）</span>
          <div class="avatar-row">
            <div class="avatar-preview">
              <img v-if="form.avatarDataUrl" :src="form.avatarDataUrl" alt="avatar" />
              <span v-else>{{ (form.username || auth.user?.username || 'A').charAt(0).toUpperCase() }}</span>
            </div>
            <label class="secondary-btn file-btn">
              上传头像
              <input type="file" accept="image/*" @change="onAvatarChange" />
            </label>
            <button type="button" class="secondary-btn" @click="clearAvatar">移除</button>
          </div>
        </label>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import { fetchMyProfile, updateMyProfile } from '../api'

const auth = useAuthStore()
const saving = ref(false)
const message = ref('')

const form = reactive({
  username: '',
  gender: '保密',
  phone: '',
  avatarDataUrl: '' as string | null
})

async function loadProfile() {
  message.value = ''
  try {
    const data = await fetchMyProfile()
    form.username = data.username || ''
    form.gender = normalizeGenderValue(data.gender)
    form.phone = data.phone || ''
    form.avatarDataUrl = data.avatarDataUrl || ''
    auth.syncUserProfile({
      username: data.username,
      avatarDataUrl: data.avatarDataUrl || null
    })
  } catch (err: any) {
    message.value = err?.response?.data?.message || '加载个人信息失败'
  }
}

async function save() {
  if (!form.username.trim()) {
    message.value = '用户名不能为空'
    return
  }
  saving.value = true
  message.value = ''
  try {
    const saved = await updateMyProfile({
      username: form.username.trim(),
      gender: normalizeGenderValue(form.gender),
      phone: form.phone.trim() || null,
      avatarDataUrl: form.avatarDataUrl || null
    })
    form.username = saved.username || ''
    form.gender = normalizeGenderValue(saved.gender)
    form.phone = saved.phone || ''
    form.avatarDataUrl = saved.avatarDataUrl || ''
    auth.syncUserProfile({
      username: saved.username,
      avatarDataUrl: saved.avatarDataUrl || null
    })
    message.value = '保存成功'
  } catch (err: any) {
    message.value = err?.response?.data?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

function clearAvatar() {
  form.avatarDataUrl = ''
}

function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.avatarDataUrl = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

function normalizeGenderValue(value: string | null | undefined) {
  if (value === '男' || value === '女' || value === '保密') return value
  return '保密'
}

onMounted(loadProfile)
</script>

<style scoped>
.page-shell {
  display: grid;
  gap: 16px;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.head h2 {
  margin: 0;
  color: #16351f;
}

.head p {
  margin: 6px 0 0;
  color: #6b7280;
}

.form-grid {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
}

label span {
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
}

.avatar-field {
  gap: 10px;
}

.avatar-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: #edf9ef;
  color: #1f7a41;
  border: 2px solid #d7eadc;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-btn {
  position: relative;
  cursor: pointer;
}

.file-btn input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.secondary-btn {
  background: #f2f6f2;
  border: 1px solid #e3e8e3;
  color: #1f2937;
}

.message {
  margin: 0;
  color: #1f7a41;
  font-weight: 700;
}
</style>
