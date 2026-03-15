<template>
  <div class="progress-bar">
    <div class="bar-bg">
      <div 
        class="bar-fill" 
        :style="{ width: `${percentage}%` }"
        :class="colorClass"
      ></div>
    </div>
    <div class="bar-label">
      <span class="current">{{ current }}</span>
      <span class="separator">/</span>
      <span class="total">{{ total }}</span>
      <span class="percentage" v-if="showPercentage">({{ percentage }}%)</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 100
  },
  showPercentage: {
    type: Boolean,
    default: true
  }
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const colorClass = computed(() => {
  const p = percentage.value
  if (p >= 80) return 'excellent'
  if (p >= 60) return 'good'
  if (p >= 40) return 'average'
  return 'low'
})
</script>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-bg {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-fill.low {
  background: #e74c3c;
}

.bar-fill.average {
  background: #f39c12;
}

.bar-fill.good {
  background: #3498db;
}

.bar-fill.excellent {
  background: #27ae60;
}

.bar-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  white-space: nowrap;
}

.current {
  color: #2c3e50;
  font-weight: 600;
}

.separator {
  margin: 0 2px;
}

.percentage {
  margin-left: 4px;
  font-size: 0.85rem;
}
</style>
