<template>
  <div class="category-filter">
    <!-- 一级分类行（面经库下整体隐藏） -->
    <template v-if="!hidePrimary">
      <div class="filter-buttons" ref="buttonsRef" :class="{ collapsed: isCollapsed && shouldCollapse }">
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
        v-if="shouldCollapse && hasOverflow" 
        class="toggle-btn"
        @click="isCollapsed = !isCollapsed"
      >
        {{ isCollapsed ? '展开' : '收起' }}
      </button>
    </template>

    <!-- 二级：公司 chip（仅面经库启用） -->
    <div class="filter-buttons sub-row" v-if="companies.length > 0">
      <button
        v-for="company in companies"
        :key="company"
        :class="['filter-btn', { active: selectedCompany === company }]"
        @click="$emit('selectCompany', company)"
      >
        {{ company }}
      </button>
    </div>

    <!-- 三级：岗位 chip（选中公司后出现） -->
    <div class="filter-buttons sub-row" v-if="positions.length > 0">
      <button
        v-for="position in positions"
        :key="position"
        :class="['filter-btn', { active: selectedPosition === position }]"
        @click="$emit('selectPosition', position)"
      >
        {{ position }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => ['all']
  },
  selected: {
    type: String,
    default: 'all'
  },
  hidePrimary: {
    type: Boolean,
    default: false
  },
  companies: {
    type: Array,
    default: () => []
  },
  selectedCompany: {
    type: String,
    default: ''
  },
  positions: {
    type: Array,
    default: () => []
  },
  selectedPosition: {
    type: String,
    default: ''
  }
})

defineEmits(['select', 'selectCompany', 'selectPosition'])

const isCollapsed = ref(true)
const COLLAPSE_THRESHOLD = 5
const COLLAPSED_HEIGHT = 48

const shouldCollapse = computed(() => props.categories.length > COLLAPSE_THRESHOLD)

const buttonsRef = ref(null)
const hasOverflow = ref(false)
let resizeObserver = null

function checkOverflow() {
  const el = buttonsRef.value
  if (!el || !shouldCollapse.value) {
    hasOverflow.value = false
    return
  }
  hasOverflow.value = el.scrollHeight > COLLAPSED_HEIGHT + 1
}

onMounted(() => {
  nextTick(checkOverflow)
  if (typeof ResizeObserver !== 'undefined' && buttonsRef.value) {
    resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(buttonsRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.categories, () => {
  nextTick(checkOverflow)
})
</script>

<style scoped>
.category-filter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sub-row {
  padding-top: var(--spacing-xs);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  overflow: hidden;
  max-height: 480px;
  transition: max-height 0.3s ease;
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
  padding: 6px var(--spacing-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
  min-height: 36px;
}

@media (max-width: 575.98px) {
  .filter-btn {
    padding: 6px var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}

.filter-btn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.filter-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

.toggle-btn {
  padding: 6px var(--spacing-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  align-self: flex-start;
  transition: border-color var(--transition-fast), color var(--transition-fast);
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
