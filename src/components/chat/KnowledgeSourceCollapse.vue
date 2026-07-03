<template>
  <div class="knowledge-source-collapse">
    <div class="collapse-trigger" @click="toggle">
      <span class="trigger-text">📚 知识库来源 ({{ sources.length }}条)</span>
      <span class="arrow" :class="{ expanded }">{{ expanded ? '▲' : '▼' }}</span>
    </div>
    <div v-show="expanded" class="collapse-content">
      <div
        v-for="(source, index) in sources"
        :key="index"
        class="source-item"
      >
        <span class="source-title">{{ source.title }}</span>
        <span
          class="source-similarity"
          :class="source.similarity >= 0.8 ? 'high' : 'medium'"
        >
          {{ Math.round(source.similarity * 100) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { KnowledgeSource } from '@/types/conversation'

defineProps<{
  sources: KnowledgeSource[]
}>()

const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.knowledge-source-collapse {
  margin-top: 8px;
}

.collapse-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}

.trigger-text {
  color: #2563EB;
  font-size: 12px;
}

.arrow {
  font-size: 10px;
  color: #2563EB;
  transition: transform 0.2s;
}

.collapse-content {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.source-title {
  color: #333333;
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-similarity {
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.source-similarity.high {
  color: #52C41A;
}

.source-similarity.medium {
  color: #FF9500;
}
</style>
