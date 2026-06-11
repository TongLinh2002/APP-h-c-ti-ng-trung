<template>
  <div class="resources-view">
    <h2>📄 Tài Liệu Học Tập</h2>
    <p class="subtitle">Tải miễn phí — không cần đăng nhập</p>

    <div class="filter-bar">
      <label>Lọc theo cấp:
        <select v-model="selectedLevel" @change="load">
          <option value="">Tất cả</option>
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="!downloads.length" class="empty">Chưa có tài liệu nào.</div>
    <ul v-else class="downloads-list">
      <li v-for="doc in downloads" :key="doc.id" class="doc-item">
        <div class="doc-info">
          <p class="doc-title">{{ doc.title }}</p>
          <p v-if="doc.description" class="doc-desc">{{ doc.description }}</p>
          <div class="doc-tags">
            <span class="tag type">{{ typeLabel(doc.file_type) }}</span>
            <span v-if="doc.hsk_level" class="tag hsk">HSK {{ doc.hsk_level }}</span>
          </div>
        </div>
        <a :href="'http://localhost:3000' + doc.file_url" target="_blank" class="btn-dl">⬇ Tải</a>
      </li>
    </ul>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { fetchDownloads } from '../services/downloadsService'
const downloads = ref([])
const selectedLevel = ref('')
const loading = ref(true)
const TYPES = { vocabulary_list: 'Từ vựng', pinyin_chart: 'Bảng Pinyin', slide: 'Slide', other: 'Khác' }
onMounted(() => load())
async function load() { loading.value = true; downloads.value = await fetchDownloads(selectedLevel.value || undefined); loading.value = false }
function typeLabel(t) { return TYPES[t] || t }
</script>
<style scoped>
h2 { margin-bottom: 4px; }
.subtitle { color: #888; margin-bottom: 20px; }
.filter-bar { margin-bottom: 16px; }
.filter-bar select { margin-left: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.downloads-list { list-style: none; }
.doc-item { background: white; border-radius: 10px; padding: 16px 20px; margin-bottom: 10px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.doc-info { flex: 1; }
.doc-title { font-weight: 700; margin-bottom: 4px; }
.doc-desc { font-size: 0.85rem; color: #666; margin-bottom: 8px; }
.doc-tags { display: flex; gap: 6px; }
.tag { padding: 2px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.tag.type { background: #e3f2fd; color: #1565c0; }
.tag.hsk { background: #fce4ec; color: #880e4f; }
.btn-dl { padding: 8px 18px; background: #d32f2f; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; white-space: nowrap; }
.loading, .empty { color: #888; padding: 20px 0; }
</style>
