<template>
  <div class="category-filter">
    <div class="filter-buttons" :class="{ collapsed: isCollapsed && shouldCollapse }">
      <button 
        v-for="cat in categories" 
        :key="cat"
        :class="['filter-btn', { active: selected === cat }]"
        @click="$emit('select', cat)"
      >
        {{ cat === 'all' ? '全部' : cat }}
      </button>
    </div>
    <button 
      v-if="shouldCollapse" 
      class="toggle-btn"
      @click="isCollapsed = !isCollapsed"
    >
      {{ isCollapsed ? '展开' : '收起' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => ['all']
  },
  selected: {
    type: String,
    default: 'all'
  }
})

defineEmits(['select'])

const isCollapsed = ref(true)
const COLLAPSE_THRESHOLD = 5

const shouldCollapse = computed(() => props.categories.length > COLLAPSE_THRESHOLD)
</script>

<style scoped>
.category-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.filter-buttons.collapsed {
  max-height: 48px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  color: #555;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-btn.active {
  background: #3498db;
  border-color: #3498db;
  color: white;
}

.toggle-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #666;
  align-self: flex-start;
  transition: all 0.2s;
}

.toggle-btn:hover {
  border-color: #3498db;
  color: #3498db;
}
</style>
