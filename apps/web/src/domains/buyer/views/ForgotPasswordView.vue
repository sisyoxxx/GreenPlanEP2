<template>
  <div class="auth-page-shell">
    <div class="auth-card page-lite auth-card-animated">
      <h1 class="auth-title">找回密码</h1>
      <form class="panel auth-form" @submit.prevent="submit">
        <input v-model="username" placeholder="请输入用户名" required />
        <input v-model="email" placeholder="请输入邮箱（演示用）" required />
        <button type="submit">提交找回申请</button>
      </form>
      <p class="auth-switch-text">想起密码了？<button type="button" class="text-link" @click="goLogin">返回登录</button></p>
      <p v-if="message" class="home-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const message = ref('')

function submit() {
  message.value = `已收到 ${username.value} 的找回申请，后续可接入真实邮件找回流程。`
}

function goLogin() {
  router.push('/login')
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
