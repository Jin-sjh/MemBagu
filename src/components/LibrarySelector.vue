<template>
  <div class="library-selector">
    <div class="current-library" @click="toggleDropdown">
      <span
        class="library-color"
        :style="{ backgroundColor: activeLibrary?.color || '#3D63DD' }"
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
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
  border-color: var(--color-border-strong);
  background: var(--color-surface-sunken);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
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
    border-radius: var(--radius-xl);
    box-shadow: 0 -8px 32px rgba(16, 24, 40, 0.16);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px var(--spacing-sm);
  background: var(--color-surface-sunken);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.manage-btn {
  padding: 4px 10px;
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  min-height: var(--touch-target-min);
}

.manage-btn:hover {
  background: var(--color-primary-soft);
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
  transition: background-color var(--transition-fast);
  min-height: var(--touch-target-min);
}

.library-item:hover {
  background: var(--color-surface-sunken);
}

.library-item.active {
  background: var(--color-primary-soft);
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
