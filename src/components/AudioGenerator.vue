<template>
  <div class="audio-generator">
    <div class="section">
      <h3 class="section-title">生成模式</h3>
      <div class="mode-selector">
        <label class="mode-option" :class="{ active: mode === 'separate' }">
          <input type="radio" v-model="mode" value="separate" />
          <span class="mode-label">单独文件</span>
          <span class="mode-desc">每个问题生成独立 MP3</span>
        </label>
        <label class="mode-option" :class="{ active: mode === 'collection' }">
          <input type="radio" v-model="mode" value="collection" />
          <span class="mode-label">合集模式</span>
          <span class="mode-desc">合并为一个 MP3 文件</span>
        </label>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">语音设置</h3>
      <div class="voice-settings">
        <div class="setting-row">
          <label>语音角色</label>
          <select v-model="selectedVoice" class="voice-select">
            <option v-for="v in voices" :key="v.id" :value="v.id">
              {{ v.name }} ({{ v.gender }}) - {{ v.style }}
            </option>
          </select>
        </div>
        <div class="setting-row">
          <label>语速</label>
          <div class="rate-slider">
            <input 
              type="range" 
              v-model.number="rate" 
              min="-50" 
              max="100" 
              step="10"
            />
            <span class="rate-value">{{ rate > 0 ? '+' : '' }}{{ rate }}%</span>
          </div>
        </div>
        <div class="setting-row">
          <label>试听</label>
          <div class="preview-controls">
            <button 
              class="preview-btn"
              :class="{ playing: previewPlaying, loading: previewLoading }"
              :disabled="previewLoading"
              @click="playPreview"
            >
              <span v-if="previewLoading">生成中...</span>
              <span v-else-if="previewPlaying">停止</span>
              <span v-else>播放</span>
            </button>
            <span class="preview-text">{{ previewText }}</span>
          </div>
        </div>
        <div v-if="previewError" class="preview-error">
          {{ previewError }}
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">
        选择内容
        <span class="count-info">已选 {{ selectedCount }} 题</span>
      </h3>
      <div class="category-actions">
        <button class="action-btn" @click="selectAll">全选</button>
        <button class="action-btn" @click="deselectAll">取消全选</button>
      </div>
      <div class="category-list">
        <label 
          v-for="cat in categories" 
          :key="cat.name" 
          class="category-item"
          :class="{ selected: selectedCategories.includes(cat.name) }"
        >
          <input 
            type="checkbox" 
            :checked="selectedCategories.includes(cat.name)"
            @change="toggleCategory(cat.name)"
          />
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }} 题</span>
        </label>
      </div>
    </div>

    <div class="generate-section">
      <button 
        class="generate-btn" 
        :class="{ generating }"
        :disabled="generating || selectedCount === 0"
        @click="generateAudio"
      >
        {{ generating ? '生成中...' : '生成音频' }}
      </button>
    </div>

    <div v-if="generating || progress > 0" class="progress-section">
      <div class="progress-header">
        <h3 class="section-title">生成进度</h3>
        <button 
          v-if="!generating"
          class="clear-progress-btn"
          @click="clearProgress"
        >清除进度</button>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
      <div class="progress-info">
        <span class="status">{{ currentStatus }}</span>
        <span v-if="currentFile" class="file">{{ currentFile }}</span>
      </div>
    </div>

    <div v-if="error" class="error-section">
      <p class="error-message">{{ error }}</p>
    </div>

    <div v-if="results.length > 0 && !generating" class="results-section">
      <h3 class="section-title">生成结果</h3>
      <div class="results-list">
        <div v-for="(r, i) in results" :key="i" class="result-item">
          <span class="result-icon">✅</span>
          <span class="result-name">{{ r.filename }}</span>
          <a 
            v-if="r.url" 
            :href="r.url" 
            class="download-btn"
            download
          >下载</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAudioGenerator } from '../composables/useAudioGenerator'

const {
  voices,
  categories,
  selectedCategories,
  selectedVoice,
  rate,
  mode,
  generating,
  progress,
  currentStatus,
  currentFile,
  results,
  error,
  selectedCount,
  previewLoading,
  previewPlaying,
  previewError,
  previewText,
  loadCategories,
  toggleCategory,
  selectAll,
  deselectAll,
  generateAudio,
  playPreview,
  restoreProgress,
  clearProgress
} = useAudioGenerator()

onMounted(() => {
  loadCategories()
  restoreProgress()
})
</script>

<style scoped>
.audio-generator {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-info {
  font-size: 0.85rem;
  font-weight: normal;
  color: #7f8c8d;
}

.mode-selector {
  display: flex;
  gap: 12px;
}

.mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-option:hover {
  border-color: #3498db;
}

.mode-option.active {
  border-color: #3498db;
  background: #ebf5fb;
}

.mode-option input {
  display: none;
}

.mode-label {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.mode-desc {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 4px;
}

.voice-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-row label {
  min-width: 80px;
  color: #555;
}

.voice-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.rate-slider {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rate-slider input[type="range"] {
  flex: 1;
  height: 6px;
}

.rate-value {
  min-width: 50px;
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}

.preview-controls {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-btn {
  padding: 8px 20px;
  background: #9b59b6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.preview-btn:hover:not(:disabled) {
  background: #8e44ad;
}

.preview-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.preview-btn.playing {
  background: #e74c3c;
}

.preview-btn.playing:hover {
  background: #c0392b;
}

.preview-btn.loading {
  background: #95a5a6;
}

.preview-text {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-style: italic;
}

.preview-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c0392b;
  font-size: 0.85rem;
}

.category-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #3498db;
}

.category-item.selected {
  border-color: #3498db;
  background: #ebf5fb;
}

.category-item input {
  display: none;
}

.category-item::before {
  content: '';
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: all 0.2s;
}

.category-item.selected::before {
  background: #3498db;
  border-color: #3498db;
}

.category-item.selected::after {
  content: '✓';
  position: absolute;
  margin-left: -14px;
  color: white;
  font-size: 12px;
}

.category-name {
  flex: 1;
  font-size: 0.9rem;
}

.category-count {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.generate-section {
  text-align: center;
}

.generate-btn {
  padding: 14px 48px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: #2980b9;
}

.generate-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.generate-btn.generating {
  background: #95a5a6;
}

.progress-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.clear-progress-btn {
  padding: 4px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-progress-btn:hover {
  background: #c0392b;
}

.progress-bar-container {
  position: relative;
  height: 24px;
  background: #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  text-align: center;
}

.progress-info .status {
  font-size: 0.9rem;
  color: #555;
}

.progress-info .file {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.error-section {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px;
}

.error-message {
  color: #c0392b;
  font-size: 0.9rem;
  margin: 0;
}

.results-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
}

.result-icon {
  font-size: 1.2rem;
}

.result-name {
  flex: 1;
  font-size: 0.9rem;
  color: #2c3e50;
}

.download-btn {
  padding: 6px 16px;
  background: #27ae60;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.download-btn:hover {
  background: #219a52;
}
</style>
