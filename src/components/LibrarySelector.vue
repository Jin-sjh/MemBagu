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
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.current-library:hover {
  background: #fff;
  border-color: #3498db;
}

.library-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.library-name {
  flex: 1;
  font-size: 0.9rem;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 0.7rem;
  color: #7f8c8d;
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
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.manage-btn {
  padding: 4px 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.manage-btn:hover {
  background: #2980b9;
}

.dropdown-list {
  max-height: 300px;
  overflow-y: auto;
}

.library-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
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
  font-size: 0.9rem;
  color: #2c3e50;
}

.check-icon {
  color: #3498db;
  font-size: 0.9rem;
}
</style>
