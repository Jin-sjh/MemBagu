<template>
  <div class="category-filter">
    <button 
      v-for="cat in categories" 
      :key="cat"
      :class="['filter-btn', { active: selected === cat }]"
      @click="$emit('select', cat)"
    >
      {{ cat === 'all' ? '全部' : cat }}
    </button>
  </div>
</template>

<script setup>
defineProps({
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
</script>

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
</style>
