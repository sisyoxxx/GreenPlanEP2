<template>
  <section class="page-lite content-card">
    <div class="content-head">
      <div>
        <h1>个人信息</h1>
        <p class="desc">昵称未填写时，将默认使用账号名作为显示名称。</p>
      </div>
      <div class="head-actions">
        <button type="button" @click="emit('save')" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>

    <div class="form-grid">
      <div class="field span-2">
        <label>头像</label>
        <div class="avatar-editor">
          <div class="avatar large clickable" role="button" tabindex="0" @click="emit('openAvatarViewer')">
            <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
            <span v-else>{{ (displayName.charAt(0) || 'U').toUpperCase() }}</span>
          </div>
          <div class="avatar-actions">
            <div class="btn-row">
              <label class="file-btn secondary-btn">
                修改头像
                <input type="file" accept="image/*" @change="handleAvatarChange" />
              </label>
            </div>
            <p class="hint">单击头像可查看大图。支持 JPG/PNG/GIF，建议使用小尺寸图片（会以 base64 保存到数据库）。</p>
          </div>
        </div>
      </div>

      <div class="field">
        <label>昵称</label>
        <input v-model="form.nickname" type="text" placeholder="未填写则默认使用账号名" />
      </div>

      <div class="field">
        <label>性别</label>
        <select v-model="form.gender">
          <option value="">保密</option>
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
      </div>

      <div class="field span-2">
        <label>手机号</label>
        <input v-model="form.phone" type="text" placeholder="例如 13800000000" />
      </div>
    </div>

    <p v-if="tip" class="tip">{{ tip }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    nickname: string
    gender: string
    phone: string
    avatarDataUrl: string | null
  }
  avatarPreview: string
  displayName: string
  saving: boolean
  tip: string
}>()

const emit = defineEmits<{
  save: []
  avatarChange: [event: Event]
  openAvatarViewer: []
}>()

function handleAvatarChange(e: Event) {
  emit('avatarChange', e)
}
</script>

<style scoped>
.content-card {
  display: grid;
  gap: 16px;
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.head-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

h1 {
  margin: 0;
}

.desc {
  margin: 6px 0 0;
  color: #6b7280;
  line-height: 1.7;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.field label {
  color: #1f7a41;
  font-weight: 800;
  font-size: 13px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
}

.span-2 {
  grid-column: 1 / 3;
}

.avatar-editor {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.avatar-actions {
  display: grid;
  gap: 12px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #dff4e4, #f3fbf4);
  border: 2px solid #cfe9d7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1f7a41;
  font-weight: 900;
}

.avatar.clickable {
  cursor: pointer;
}

.avatar.clickable:hover {
  border-color: rgba(31, 122, 65, 0.38);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar.large {
  width: 76px;
  height: 76px;
}

.hint {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.tip {
  margin: 0;
  color: #1f7a41;
  font-weight: 800;
}

.btn-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 800;
  cursor: pointer;
}

.file-btn input[type="file"] {
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

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: 1 / 2;
  }

  .content-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
