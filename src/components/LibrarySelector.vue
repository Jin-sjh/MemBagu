<template>
  <div class="library-selector">
    <div class="current-library" @click="toggleDropdown">
      <span 
        class="library-color" 
        :style="{ backgroundColor: activeLibrary?.color || '#3498db' }"
      ></span>
      <span class="library-name">{{ activeLibrary?.name || '选择题库' }}</span>
      <span class="dropdown-icon" :class="{ open: isOpen }">▼</span>
    </div>
    
    <div class="dropdown" v-if="isOpen">
      <div class="dropdown-header">
        <span>题库列表</span>
        <button class="manage-btn" @click="openManager">管理</button>
      </div>
      
      <div class="dropdown-list">
        <div 
          v-for="lib in libraries" 
          :key="lib.id"
          :class="['library-item', { active: lib.id === activeLibraryId }]"
          @click="selectLibrary(lib.id)"
        >
          <span 
            class="library-color" 
            :style="{ backgroundColor: lib.color }"
          ></span>
          <span class="library-name">{{ lib.name }}</span>
          <span class="check-icon" v-if="lib.id === activeLibraryId">✓</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  libraries: {
    type: Array,
    default: () => []
  },
  activeLibraryId: {
    type: String,
    default: 'frontend'
  },
  activeLibrary: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select', 'manage'])

const isOpen = ref(false)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectLibrary(id) {
  emit('select', id)
  isOpen.value = false
}

function openManager() {
  emit('manage')
  isOpen.value = false
}

function closeDropdown() {
  isOpen.value = false
}

defineExpose({
  closeDropdown
})
</script>

<style scoped>
.library-selector {
  position: relative;
  display: inline-block;
}

.current-library {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
  min-height: var(--touch-target-min);
}

@media (max-width: 575.98px) {
  .current-library {
    min-width: 120px;
    padding: 6px var(--spacing-sm);
  }
}

.current-library:hover {
  background: #fff;
  border-color: var(--color-primary);
}

.library-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.library-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

@media (max-width: 575.98px) {
  .dropdown {
    position: fixed;
    left: var(--spacing-md);
    right: var(--spacing-md);
    min-width: auto;
    top: auto;
    bottom: var(--spacing-md);
    border-radius: var(--radius-lg);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px var(--spacing-sm);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.manage-btn {
  padding: 4px 10px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background 0.2s;
  min-height: var(--touch-target-min);
}

.manage-btn:hover {
  background: var(--color-primary-dark);
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 575.98px) {
  .dropdown-list {
    max-height: 50vh;
  }
}

.library-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px var(--spacing-sm);
  cursor: pointer;
  transition: background 0.2s;
  min-height: var(--touch-target-min);
}

.library-item:hover {
  background: #f5f5f5;
}

.library-item.active {
  background: #e8f4fc;
}

.library-item .library-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.library-item .library-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.check-icon {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}
</style>
