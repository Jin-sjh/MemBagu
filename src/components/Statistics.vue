<template>
  <div class="statistics">
    <h2>{{ headerTitle }}</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总题数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value learned">{{ stats.learned }}</div>
        <div class="stat-label">已学习</div>
      </div>
      <div class="stat-card">
        <div class="stat-value due">{{ stats.dueToday }}</div>
        <div class="stat-label">待复习</div>
      </div>
      <div class="stat-card">
        <div class="stat-value mastered">{{ stats.mastered }}</div>
        <div class="stat-label">已掌握</div>
      </div>
    </div>
    
    <div class="progress-section">
      <h3>学习进度</h3>
      <ProgressBar 
        :current="stats.learned" 
        :total="stats.total"
      />
    </div>
    
    <div class="retention-section">
      <h3>平均记忆率</h3>
      <div class="retention-value">
        <span class="value">{{ stats.avgRetention }}</span>
        <span class="unit">%</span>
      </div>
    </div>
    
    <div class="category-section" v-if="selectedCategory === 'all'">
      <h3>分类统计</h3>
      <div class="category-list">
        <div 
          v-for="(catStats, category) in categoryStats" 
          :key="category"
          class="category-item"
        >
          <div class="category-header">
            <span class="category-name">{{ category }}</span>
            <span class="category-count">{{ catStats.learned }}/{{ catStats.total }}</span>
          </div>
          <ProgressBar 
            :current="catStats.learned" 
            :total="catStats.total"
            :showPercentage="false"
          />
        </div>
      </div>
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

const emit = defineEmits(['reset'])

const { getStats, getCategoryStats, resetAllProgress } = useProgress()

const headerTitle = computed(() => {
  if (props.selectedCategory === 'all') {
    return '学习统计'
  }
  return `${props.selectedCategory} 统计`
})

const stats = computed(() => getStats(props.questions))
const categoryStats = computed(() => getCategoryStats(props.questions))

function handleReset() {
  if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
    resetAllProgress()
    emit('reset')
  }
}
</script>

<style scoped>
.statistics {
  padding: 10px 0;
}

.statistics h2 {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  color: var(--color-text);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .statistics h2 {
    margin-bottom: var(--spacing-lg);
  }
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
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
}

@media (max-width: 575.98px) {
  .stat-card {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
  }
}

.stat-value {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.stat-value.learned {
  color: var(--color-primary);
}

.stat-value.due {
  color: var(--color-danger);
}

.stat-value.mastered {
  color: var(--color-success);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.progress-section,
.retention-section,
.category-section {
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 575.98px) {
  .progress-section,
  .retention-section,
  .category-section {
    margin-bottom: var(--spacing-lg);
  }
}

.progress-section h3,
.retention-section h3,
.category-section h3 {
  font-size: var(--font-size-base);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.retention-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.retention-value .value {
  font-size: clamp(2rem, 8vw, 2.5rem);
  font-weight: 700;
  color: var(--color-success);
}

.retention-value .unit {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: 575.98px) {
  .category-list {
    gap: var(--spacing-sm);
  }
}

.category-item {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
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
}

.actions-section {
  padding-top: var(--spacing-lg);
  border-top: 1px solid #eee;
  text-align: center;
}

.btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all 0.2s;
  min-height: var(--touch-target-min);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--color-danger-dark);
}
</style>
