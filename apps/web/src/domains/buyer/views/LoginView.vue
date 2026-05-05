<template>
  <AppLayout>
    <div class="auth-page-shell">
      <div class="auth-card page-lite">
        <h1 class="auth-title">{{ mode === 'login' ? '登录' : '注册' }}</h1>

        <form v-if="mode === 'login'" @submit.prevent="submitLogin" class="panel auth-form">
          <input v-model.trim="loginForm.username" placeholder="用户名" autocomplete="username" required />
          <input v-model="loginForm.password" placeholder="密码" type="password" autocomplete="current-password" required />
          <div class="auth-row">
            <label class="remember-check">
              <input v-model="rememberSevenDays" type="checkbox" />
              <span>七天自动登录</span>
            </label>
            <button type="button" class="text-link" @click="goForgotPassword">忘记密码？</button>
          </div>
          <button type="submit" :disabled="submitting">{{ submitting ? '登录中…' : '登录' }}</button>
        </form>

        <form v-else @submit.prevent="submitRegister" class="panel auth-form">
          <input v-model.trim="registerForm.username" placeholder="用户名" autocomplete="username" required />
          <input v-model="registerForm.password" placeholder="密码" type="password" autocomplete="new-password" required />
          <select v-model="registerForm.roleCode">
            <option value="BUYER">买家</option>
            <option value="ADMIN">管理员</option>
            <option value="INVENTORY_MANAGER">库存管理员</option>
          </select>
          <button type="submit" :disabled="submitting">{{ submitting ? '提交中…' : '注册并登录' }}</button>
        </form>

        <p class="auth-switch-text">
          <template v-if="mode === 'login'">
            还没有账号？
            <button type="button" class="text-link" @click="mode = 'register'">去注册</button>
          </template>
          <template v-else>
            已有账号？
            <button type="button" class="text-link" @click="mode = 'login'">去登录</button>
          </template>
        </p>

        <p v-if="message" class="home-message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'
import type { Role } from '../../../core/auth/types'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const error = ref('')
const message = ref('')
const mode = ref<'login' | 'register'>('login')
const rememberSevenDays = ref(false)
const submitting = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '', roleCode: 'BUYER' as Role })

function goRoleHome() {
  const redirect = route.query.redirect as string | undefined
  if (redirect) {
    router.push(redirect)
    return
  }
  if (auth.role === 'ADMIN') router.push('/admin/dashboard')
  else if (auth.role === 'INVENTORY_MANAGER') router.push('/inventory/dashboard')
  else router.push('/profile')
}

function goForgotPassword() {
  router.push('/forgot-password')
}

async function submitLogin() {
  if (submitting.value) return
  error.value = ''
  message.value = rememberSevenDays.value ? '已开启七天自动登录（演示）' : ''

  submitting.value = true
  try {
    await auth.login(loginForm)
    goRoleHome()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '登录失败'
  } finally {
    submitting.value = false
  }
}

async function submitRegister() {
  if (submitting.value) return
  error.value = ''
  message.value = ''

  submitting.value = true
  try {
    await auth.register(registerForm)
    goRoleHome()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '注册失败'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page-shell {
  width: 100%;
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-card {
  width: 100%;
  max-width: 360px;
  min-width: 260px;
  display: grid;
  gap: 16px;
}

.auth-title {
  margin: 0;
  color: #1f7a41;
}

.auth-form {
  margin-bottom: 0;
  display: grid;
  gap: 10px;
}

.auth-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.remember-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
}

.remember-check input {
  margin: 0;
}

.text-link {
  background: transparent;
  border: none;
  padding: 0;
  color: #1f7a41;
  cursor: pointer;
}

.text-link:hover {
  text-decoration: underline;
}

.auth-switch-text {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

.home-message {
  margin: 0;
  color: #1f7a41;
  font-weight: 600;
}

.error {
  margin: 0;
  color: #dc2626;
}

@media (max-width: 760px) {
  .auth-card {
    width: min(92vw, 360px);
    min-width: auto;
  }
}
</style>

