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
  gap: var(--spacing-sm);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  overflow: hidden;
  transition: all 0.3s ease;
}

@media (max-width: 575.98px) {
  .filter-buttons {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding-bottom: var(--spacing-xs);
  }
  
  .filter-buttons::-webkit-scrollbar {
    display: none;
  }
}

.filter-buttons.collapsed {
  max-height: 48px;
}

@media (max-width: 575.98px) {
  .filter-buttons.collapsed {
    max-height: none;
  }
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all 0.2s;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
  min-height: var(--touch-target-min);
}

@media (max-width: 575.98px) {
  .filter-btn {
    padding: 6px var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}

.filter-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.toggle-btn {
  padding: 6px var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: var(--font-size-xs);
  color: #666;
  align-self: flex-start;
  transition: all 0.2s;
  min-height: var(--touch-target-min);
}

@media (max-width: 575.98px) {
  .toggle-btn {
    display: none;
  }
}

.toggle-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
