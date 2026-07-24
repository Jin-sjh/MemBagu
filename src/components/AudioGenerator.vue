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
  gap: var(--spacing-md);
}

.section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

@media (max-width: 575.98px) {
  .section {
    padding: var(--spacing-md);
  }
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-info {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 2px 10px;
  border-radius: 999px;
}

.mode-selector {
  display: flex;
  gap: 12px;
}

@media (max-width: 575.98px) {
  .mode-selector {
    flex-direction: column;
  }
}

.mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.mode-option:hover {
  border-color: var(--color-border-strong);
}

.mode-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.mode-option input {
  display: none;
}

.mode-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text);
}

.mode-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
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

@media (max-width: 575.98px) {
  .setting-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}

.setting-row label {
  min-width: 80px;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.voice-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.voice-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
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
  accent-color: var(--color-primary);
}

.rate-value {
  min-width: 50px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.preview-controls {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-btn {
  padding: 8px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  min-width: 80px;
}

.preview-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.preview-btn:disabled {
  background: var(--color-border-strong);
  cursor: not-allowed;
}

.preview-btn.playing {
  background: var(--color-danger);
}

.preview-btn.playing:hover {
  background: var(--color-danger-dark);
}

.preview-btn.loading {
  background: var(--color-text-light);
}

.preview-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  font-style: italic;
}

.preview-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--color-danger-soft);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.category-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn {
  padding: 6px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.category-item:hover {
  border-color: var(--color-border-strong);
}

.category-item.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.category-item input {
  display: none;
}

.category-item::before {
  content: '';
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
  flex-shrink: 0;
}

.category-item.selected::before {
  background: var(--color-primary);
  border-color: var(--color-primary);
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
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  font-variant-numeric: tabular-nums;
}

.generate-section {
  text-align: center;
}

.generate-btn {
  padding: 14px 48px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
}

.generate-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.generate-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.generate-btn:disabled {
  background: var(--color-border-strong);
  cursor: not-allowed;
}

.generate-btn.generating {
  background: var(--color-text-light);
}

.progress-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.clear-progress-btn {
  padding: 4px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast), background-color var(--transition-fast);
}

.clear-progress-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.progress-bar-container {
  position: relative;
  height: 20px;
  background: var(--color-surface-sunken);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  text-align: center;
}

.progress-info .status {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.progress-info .file {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.error-section {
  background: var(--color-danger-soft);
  border-radius: var(--radius-lg);
  padding: 12px;
}

.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin: 0;
}

.results-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
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
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
}

.result-icon {
  font-size: 1.2rem;
}

.result-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.download-btn {
  padding: 6px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-success);
  color: var(--color-success);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.download-btn:hover {
  background: var(--color-success-soft);
}
</style>
