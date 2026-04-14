<template>
  <AppLayout>
    <div class="auth-page-shell">
      <div class="auth-card page-lite auth-card-animated">
        <template v-if="mode === 'login'">
          <h1 class="auth-title">登录</h1>
          <form @submit.prevent="submitLogin" class="panel auth-form">
            <input v-model="loginForm.username" placeholder="用户名" required />
            <input v-model="loginForm.password" placeholder="密码" type="password" required />
            <div class="auth-row">
              <label class="remember-check">
                <input v-model="rememberSevenDays" type="checkbox" />
                <span>七天自动登录</span>
              </label>
              <button type="button" class="text-link" @click="goForgotPassword">忘记密码？</button>
            </div>
            <button type="submit">登录</button>
          </form>
          <p class="auth-switch-text">还没有账号？<button type="button" class="text-link" @click="mode = 'register'">去注册</button></p>
        </template>

        <template v-else>
          <h1 class="auth-title">注册</h1>
          <form @submit.prevent="submitRegister" class="panel auth-form">
            <input v-model="registerForm.username" placeholder="用户名" required />
            <input v-model="registerForm.password" placeholder="密码" type="password" required />
            <select v-model="registerForm.roleCode">
              <option value="BUYER">买家</option>
              <option value="ADMIN">管理员</option>
              <option value="INVENTORY_MANAGER">库存管理员</option>
            </select>
            <button type="submit">注册并登录</button>
          </form>
          <p class="auth-switch-text">已有账号？<button type="button" class="text-link" @click="mode = 'login'">去登录</button></p>
        </template>

        <p v-if="message" class="home-message">{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../../../layouts/AppLayout.vue'
import { useAuthStore } from '../../../core/auth/useAuthStore'

const router = useRouter()
const auth = useAuthStore()
const error = ref('')
const message = ref('')
const mode = ref<'login' | 'register'>('login')
const rememberSevenDays = ref(false)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '', roleCode: 'BUYER' as 'BUYER' | 'ADMIN' | 'INVENTORY_MANAGER' })

function goRoleHome() {
  if (auth.role === 'ADMIN') router.push('/admin/dashboard')
  else if (auth.role === 'INVENTORY_MANAGER') router.push('/inventory/dashboard')
  else router.push('/profile')
}

function goForgotPassword() {
  router.push('/forgot-password')
}

async function submitLogin() {
  error.value = ''
  message.value = rememberSevenDays.value ? '已勾选七天自动登录' : ''
  try {
    await auth.login(loginForm)
    goRoleHome()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '登录失败'
  }
}

async function submitRegister() {
  error.value = ''
  message.value = ''
  try {
    await auth.register(registerForm)
    goRoleHome()
  } catch (e: any) {
    error.value = e?.response?.data?.message || '注册失败'
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
  max-width: 340px;
  min-width: 260px;
  display: grid;
  gap: 16px;
  animation: authCardEnter 0.48s ease-out;
}

@keyframes authCardEnter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-title {
  margin: 0;
  color: #1f7a41;
}

.auth-form {
  margin-bottom: 0;
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

.auth-switch-text {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}

@media (max-width: 760px) {
  .auth-card {
    width: min(92vw, 340px);
    min-width: auto;
  }
}
</style>
