<template>
  <div class="staff-floating-button" @click="$emit('click')">
    <van-badge :content="count > 0 ? count : undefined" :show-zero="false">
      <div class="fab-inner">
        <van-icon name="chat-o" color="#fff" size="24" />
      </div>
    </van-badge>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.staff-floating-button {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 100;
}

.fab-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  cursor: pointer;
}

.fab-inner:active {
  opacity: 0.85;
  transform: scale(0.96);
  transition: all 0.1s ease;
}
</style>
