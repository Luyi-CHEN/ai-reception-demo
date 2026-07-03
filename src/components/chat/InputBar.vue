<template>
  <div class="input-bar">
    <div class="input-bar-inner">
      <input
        ref="inputRef"
        v-model="content"
        class="message-input"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.exact.prevent="handleSend"
      />
      <button
        class="send-btn"
        :class="{ disabled: !content.trim() }"
        :disabled="!content.trim()"
        @click="handleSend"
      >
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '输入消息...',
})

const emit = defineEmits<{
  (e: 'send', content: string): void
}>()

const content = ref('')
const inputRef = ref<HTMLInputElement>()

function handleSend() {
  const trimmed = content.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  content.value = ''
  inputRef.value?.focus()
}
</script>

<style scoped>
.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #DCDEE0;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
}

.input-bar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-input {
  flex: 1;
  height: 36px;
  border-radius: 18px;
  background: #F5F5F5;
  padding: 0 16px;
  font-size: 15px;
  border: none;
  outline: none;
  color: #333333;
  box-sizing: border-box;
}

.message-input::placeholder {
  color: #BFBFBF;
}

.send-btn {
  flex-shrink: 0;
  width: 60px;
  height: 36px;
  border-radius: 18px;
  background: #2563EB;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:active:not(.disabled) {
  background: #1D4ED8;
}

.send-btn.disabled {
  background: #BFBFBF;
  cursor: not-allowed;
}
</style>
