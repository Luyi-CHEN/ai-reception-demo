<template>
  <div v-if="tags.length > 0" class="intent-tag-bar">
    <template v-for="(tag, index) in slicedTags" :key="tag.name">
      <van-tag type="primary" plain size="medium">
        {{ numberCircle(tag.order) }}{{ tag.name }}
      </van-tag>
      <span v-if="index < slicedTags.length - 1" class="tag-arrow">→</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IntentTag } from '@/types/conversation'

const props = defineProps<{
  tags: IntentTag[]
}>()

const CIRCLES = ['①', '②', '③', '④', '⑤']

const slicedTags = computed(() => props.tags.slice(0, 5))

function numberCircle(order: number): string {
  if (order >= 1 && order <= 5) return CIRCLES[order - 1]
  return `(${order})`
}
</script>

<style scoped>
.intent-tag-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  background: #F8FAFF;
  border-bottom: 1px solid #E8E8E8;
}

.tag-arrow {
  color: #BFBFBF;
  font-size: 12px;
  flex-shrink: 0;
}
</style>
