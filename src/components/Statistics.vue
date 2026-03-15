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
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.stat-value.learned {
  color: #3498db;
}

.stat-value.due {
  color: #e74c3c;
}

.stat-value.mastered {
  color: #27ae60;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.progress-section,
.retention-section,
.category-section {
  margin-bottom: 32px;
}

.progress-section h3,
.retention-section h3,
.category-section h3 {
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 12px;
}

.retention-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.retention-value .value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #27ae60;
}

.retention-value .unit {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 500;
  color: #2c3e50;
}

.category-count {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.actions-section {
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
