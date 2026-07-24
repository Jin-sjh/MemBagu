<template>
  <div class="statistics">
    <h2>{{ headerTitle }}</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value coverage">{{ stats.coverage }}%</div>
        <div class="stat-label">覆盖率 ({{ stats.covered }}/{{ stats.total }})</div>
      </div>
      <div class="stat-card">
        <div class="stat-value wrong">{{ stats.wrong }}</div>
        <div class="stat-label">错题数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value pending">{{ stats.pending }}</div>
        <div class="stat-label">待确认</div>
      </div>
      <div class="stat-card">
        <div class="stat-value mastered">{{ stats.mastered }}</div>
        <div class="stat-label">已掌握</div>
      </div>
    </div>
    
    <div class="progress-section">
      <h3>覆盖进度</h3>
      <ProgressBar 
        :current="stats.covered" 
        :total="stats.total"
      />
      <p class="unlearned-hint" v-if="stats.unlearned > 0">
        还有 {{ stats.unlearned }} 题未覆盖
      </p>
    </div>
    
    <div class="category-section" v-if="selectedCategory === 'all'">
      <h3>分类覆盖</h3>
      <div class="category-list">
        <div 
          v-for="(catStats, category) in categoryCoverage" 
          :key="category"
          class="category-item"
          :class="{ 'weak': catStats.covered / catStats.total < 0.3 }"
        >
          <div class="category-header">
            <span class="category-name">{{ category }}</span>
            <span class="category-count">{{ catStats.covered }}/{{ catStats.total }} · 掌握 {{ catStats.mastered }}</span>
          </div>
          <ProgressBar 
            :current="catStats.covered" 
            :total="catStats.total"
            :showPercentage="false"
          />
        </div>
      </div>
    </div>
    
    <div class="exam-section" v-if="stats.mastered > 0">
      <h3>考前总复习</h3>
      <p class="exam-desc">已掌握 {{ stats.mastered }} 题。考前一键召回所有已掌握的题，快速确认没有遗忘。</p>
      <button class="btn btn-exam" @click="$emit('startExam')">
        开始考前总复习
      </button>
    </div>
    
    <div class="actions-section">
      <button class="btn btn-danger" @click="handleReset">
        重置所有进度
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from './ProgressBar.vue'
import { useProgress } from '../composables/useProgress'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  progress: {
    type: Object,
    default: () => ({})
  },
  selectedCategory: {
    type: String,
    default: 'all'
  }
})

defineEmits(['reset', 'startExam'])

const { getCoverageStats, getCategoryCoverage, resetAllProgress } = useProgress()

const headerTitle = computed(() => {
  if (props.selectedCategory === 'all') {
    return '冲刺统计'
  }
  return `${props.selectedCategory} 统计`
})

const stats = computed(() => getCoverageStats(props.questions))
const categoryCoverage = computed(() => getCategoryCoverage(props.questions))

function handleReset() {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    resetAllProgress()
  }
}
</script>

<style scoped>
.statistics {
  padding: 0;
}

.statistics h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 767.98px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
}

@media (max-width: 575.98px) {
  .stats-grid {
    margin-bottom: var(--spacing-lg);
  }
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  transition: box-shadow var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-sm);
}

@media (max-width: 575.98px) {
  .stat-card {
    padding: var(--spacing-md);
  }
}

.stat-value {
  font-size: clamp(1.75rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.stat-value.coverage { color: var(--color-primary); }
.stat-value.wrong { color: var(--color-danger); }
.stat-value.pending { color: var(--color-warning); }
.stat-value.mastered { color: var(--color-success); }

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.progress-section,
.category-section,
.exam-section {
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .progress-section,
  .category-section,
  .exam-section {
    margin-bottom: var(--spacing-lg);
  }
}

.progress-section h3,
.category-section h3,
.exam-section h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.unlearned-hint {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.category-item.weak {
  background: var(--color-danger-soft);
  border-color: transparent;
}

@media (max-width: 575.98px) {
  .category-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.category-name {
  font-weight: 500;
  color: var(--color-text);
}

.category-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.exam-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
  min-height: var(--touch-target-min);
}

.btn:active {
  transform: scale(0.98);
}

.btn-exam {
  background: var(--color-primary);
  color: white;
}

.btn-exam:hover {
  background: var(--color-primary-dark);
}

.btn-danger {
  background: var(--color-surface);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger-soft);
}

.actions-section {
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  text-align: center;
}
</style>
