<template>
  <div class="admin">
    <h1>{{ $t('admin.title') }}</h1>
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.key" :class="['tab', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
        {{ $t(tab.i18nKey) }}
      </button>
    </div>

    <!-- DOWNLOADS TAB -->
    <div v-if="activeTab === 'downloads'" class="panel">
      <h2>{{ $t('admin.downloads') }}</h2>
      <form class="form-card" @submit.prevent="submitDownload">
        <div class="form-row">
          <input v-model="dlForm.title" placeholder="Tên tài liệu *" required />
          <select v-model="dlForm.file_type" required>
            <option value="">-- Loại --</option>
            <option value="vocabulary_list">Danh sách từ vựng</option>
            <option value="pinyin_chart">Bảng Pinyin</option>
            <option value="slide">Slide bài giảng</option>
            <option value="other">Khác</option>
          </select>
          <select v-model="dlForm.hsk_level">
            <option value="">-- HSK --</option>
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </div>
        <input v-model="dlForm.description" placeholder="Mô tả" />
        <div class="form-row">
          <input v-model="dlForm.file_url" placeholder="URL file (nếu không upload)" />
          <label class="file-label">
            <input type="file" accept=".pdf,.zip,.pptx,.docx,.xlsx,.xls" @change="onFileChange" />
            {{ dlForm.file ? dlForm.file.name : 'Chọn file để upload' }}
          </label>
        </div>
        <button type="submit" class="btn-primary">{{ $t('admin.create') }}</button>
      </form>

      <div v-if="dlMsg" class="msg" :class="dlMsg.type">{{ dlMsg.text }}</div>

      <table class="data-table">
        <thead><tr><th>Tên</th><th>Loại</th><th>HSK</th><th>URL</th><th></th></tr></thead>
        <tbody>
          <tr v-for="d in downloads" :key="d.id">
            <td>{{ d.title }}</td>
            <td>{{ d.file_type }}</td>
            <td>{{ d.hsk_level || 'Tất cả' }}</td>
            <td class="url-cell"><a :href="d.file_url" target="_blank">{{ d.file_url }}</a></td>
            <td><button class="btn-del" @click="deleteDownload(d.id)">{{ $t('admin.delete') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VOCABULARY TAB -->
    <div v-if="activeTab === 'vocabulary'" class="panel">
      <h2>{{ $t('admin.vocabulary') }}</h2>

      <!-- Import Excel Section -->
      <div class="import-section">
        <h3 class="import-title">📥 Nhập từ file Excel</h3>
        <div class="import-upload-row">
          <label class="file-label-xl">
            <input type="file" accept=".xlsx,.xls" @change="onImportFileChange" ref="importFileInput" />
            <span class="file-icon">📂</span>
            <span>{{ importFile ? importFile.name : 'Chọn file .xlsx / .xls' }}</span>
          </label>
          <button class="btn-preview" :disabled="!importFile || previewing" @click="previewImport">
            {{ previewing ? 'Đang phân tích...' : '🔍 Phân tích file' }}
          </button>
        </div>
        <p class="import-hint">Mỗi sheet trong file = một cấp HSK. Tên sheet "HSK 1", "hsk_2", "Cấp 3", "1"... sẽ được tự động nhận diện.</p>

        <!-- Preview result -->
        <div v-if="importPreview" class="preview-box">
          <div class="preview-header">
            <div class="preview-meta">
              <span class="preview-filename">{{ importPreview.fileName }}</span>
              <span class="preview-total">{{ importPreview.total }} từ vựng trên {{ importPreview.sheets.length }} sheet</span>
            </div>
            <button
              class="btn-import-confirm"
              :disabled="importing || importPreview.total === 0"
              @click="confirmImport"
            >
              {{ importing ? 'Đang nhập...' : `✅ Nhập ${importPreview.total} từ vào DB` }}
            </button>
          </div>

          <!-- Sheet tabs -->
          <div class="sheet-tabs">
            <button
              v-for="(sheet, idx) in importPreview.sheets"
              :key="idx"
              :class="['sheet-tab', { active: activeSheetIdx === idx, skipped: sheet.skipped }]"
              @click="activeSheetIdx = idx"
            >
              {{ sheet.sheet }}
              <span v-if="!sheet.skipped" class="sheet-badge">HSK {{ sheet.level }} · {{ sheet.count }} từ</span>
              <span v-else class="sheet-badge skipped">bỏ qua</span>
            </button>
          </div>

          <!-- Words table for active sheet -->
          <div v-if="activeSheet" class="sheet-words">
            <div v-if="activeSheet.skipped" class="sheet-skipped-msg">
              Sheet này bị bỏ qua vì không thể xác định cấp HSK từ tên sheet.
            </div>
            <table v-else class="data-table preview-table">
              <thead>
                <tr>
                  <th style="width:36px">#</th>
                  <th>Chữ Hán</th>
                  <th>Pinyin</th>
                  <th>Nghĩa tiếng Việt</th>
                  <th>HSK</th>
                  <th>Câu ví dụ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(w, i) in sheetWords" :key="i">
                  <td class="row-num">{{ i + 1 }}</td>
                  <td class="hanzi">{{ w.hanzi }}</td>
                  <td>{{ w.pinyin }}</td>
                  <td>{{ w.meaning_vi }}</td>
                  <td>{{ w.hsk_level }}</td>
                  <td class="example">{{ w.example_sentence }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="importMsg" class="msg" :class="importMsg.type">{{ importMsg.text }}</div>
      </div>

      <hr class="section-divider" />

      <!-- Manual add form -->
      <h3 class="section-subtitle">Thêm từ thủ công</h3>
      <form class="form-card" @submit.prevent="submitVocab">
        <div class="form-row">
          <input v-model="vocabForm.hanzi" placeholder="Chữ Hán *" required />
          <input v-model="vocabForm.pinyin" placeholder="Pinyin *" required />
          <input v-model="vocabForm.meaning_vi" placeholder="Nghĩa tiếng Việt *" required />
          <select v-model="vocabForm.hsk_level" required>
            <option value="">-- HSK --</option>
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </div>
        <div class="form-row">
          <input v-model="vocabForm.example_sentence" placeholder="Câu ví dụ" />
          <input v-model="vocabForm.example_pinyin" placeholder="Pinyin câu ví dụ" />
        </div>
        <button type="submit" class="btn-primary">{{ $t('admin.create') }}</button>
      </form>

      <div v-if="vocabMsg" class="msg" :class="vocabMsg.type">{{ vocabMsg.text }}</div>

      <!-- Current vocabulary table -->
      <h3 class="section-subtitle">Từ vựng hiện có</h3>
      <div class="filter-row">
        <select v-model="vocabFilter" @change="loadVocab">
          <option value="">Tất cả cấp</option>
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
        <span class="vocab-count">{{ vocabulary.length }} từ</span>
      </div>
      <table class="data-table">
        <thead><tr><th>Chữ Hán</th><th>Pinyin</th><th>Nghĩa</th><th>HSK</th><th></th></tr></thead>
        <tbody>
          <tr v-for="w in vocabulary" :key="w.id">
            <td class="hanzi">{{ w.hanzi }}</td>
            <td>{{ w.pinyin }}</td>
            <td>{{ w.meaning_vi }}</td>
            <td>{{ w.hsk_level }}</td>
            <td><button class="btn-del" @click="deleteVocab(w.id)">{{ $t('admin.delete') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- LESSONS TAB -->
    <div v-if="activeTab === 'lessons'" class="panel">
      <h2>{{ $t('admin.lessons') }}</h2>
      <form class="form-card" @submit.prevent="submitLesson">
        <div class="form-row">
          <input v-model="lessonForm.title" placeholder="Tiêu đề *" required />
          <select v-model="lessonForm.type" required>
            <option value="">-- Loại --</option>
            <option value="listening">Nghe</option>
            <option value="reading">Đọc</option>
          </select>
          <select v-model="lessonForm.hsk_level" required>
            <option value="">-- HSK --</option>
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </div>
        <textarea v-model="lessonForm.content" placeholder="Nội dung bài (văn bản đọc hoặc transcript)" rows="4"></textarea>
        <input v-if="lessonForm.type === 'listening'" v-model="lessonForm.audio_url" placeholder="URL file audio" />
        <button type="submit" class="btn-primary">{{ $t('admin.create') }}</button>
      </form>

      <div v-if="lessonMsg" class="msg" :class="lessonMsg.type">{{ lessonMsg.text }}</div>

      <table class="data-table">
        <thead><tr><th>Tiêu đề</th><th>Loại</th><th>HSK</th><th></th></tr></thead>
        <tbody>
          <tr v-for="l in lessons" :key="l.id">
            <td>{{ l.title }}</td>
            <td>{{ l.type === 'listening' ? 'Nghe' : 'Đọc' }}</td>
            <td>{{ l.hsk_level }}</td>
            <td><button class="btn-del" @click="deleteLesson(l.id)">{{ $t('admin.delete') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- USERS TAB -->
    <div v-if="activeTab === 'users'" class="panel">
      <h2>{{ $t('admin.users') }}</h2>
      <div v-if="userMsg" class="msg" :class="userMsg.type">{{ userMsg.text }}</div>
      <table class="data-table">
        <thead><tr><th>Email</th><th>Tên</th><th>HSK</th><th>Quyền</th><th>Ngày tạo</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.email }}</td>
            <td>{{ u.display_name }}</td>
            <td>{{ u.current_hsk_level }}</td>
            <td><span :class="['badge', u.role]">{{ u.role }}</span></td>
            <td>{{ new Date(u.createdAt).toLocaleDateString('vi-VN') }}</td>
            <td>
              <button v-if="u.role === 'user'" class="btn-promote" @click="setRole(u.id, 'admin')">Nâng admin</button>
              <button v-else class="btn-demote" @click="setRole(u.id, 'user')">Hạ xuống</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const { t } = useI18n()

const tabs = [
  { key: 'downloads', i18nKey: 'admin.downloads' },
  { key: 'vocabulary', i18nKey: 'admin.vocabulary' },
  { key: 'lessons', i18nKey: 'admin.lessons' },
  { key: 'users', i18nKey: 'admin.users' },
]
const activeTab = ref('downloads')

// Downloads
const downloads = ref([])
const dlMsg = ref(null)
const dlForm = ref({ title: '', description: '', file_url: '', file_type: '', hsk_level: '', file: null })

async function loadDownloads() {
  const res = await api.get('/admin/downloads')
  downloads.value = res.data
}
function onFileChange(e) { dlForm.value.file = e.target.files[0] }
async function submitDownload() {
  try {
    const fd = new FormData()
    fd.append('title', dlForm.value.title)
    fd.append('description', dlForm.value.description)
    fd.append('file_type', dlForm.value.file_type)
    if (dlForm.value.hsk_level) fd.append('hsk_level', dlForm.value.hsk_level)
    if (dlForm.value.file) fd.append('file', dlForm.value.file)
    else fd.append('file_url', dlForm.value.file_url)
    const { data } = await api.post('/admin/downloads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    let importNote = ''
    if (data.imported > 0) {
      const levelSummary = Object.entries(data.byLevel)
        .sort(([a], [b]) => a - b)
        .map(([lvl, cnt]) => `HSK ${lvl}: ${cnt} từ`)
        .join(' · ')
      importNote = ` Đã nhập ${data.imported} từ vựng (${levelSummary})`
    }
    dlMsg.value = { type: 'success', text: `Đã thêm tài liệu!${importNote}` }
    dlForm.value = { title: '', description: '', file_url: '', file_type: '', hsk_level: '', file: null }
    await loadDownloads()
    if (data.imported > 0) await loadVocab()
  } catch (e) {
    dlMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi khi thêm tài liệu' }
  }
  setTimeout(() => { dlMsg.value = null }, 3000)
}
async function deleteDownload(id) {
  if (!confirm(t('admin.confirmDelete'))) return
  await api.delete(`/admin/downloads/${id}`)
  await loadDownloads()
}

// Vocabulary — Excel import
const importFile = ref(null)
const importFileInput = ref(null)
const previewing = ref(false)
const importing = ref(false)
const importPreview = ref(null)
const importMsg = ref(null)
const activeSheetIdx = ref(0)

const activeSheet = computed(() => importPreview.value?.sheets?.[activeSheetIdx.value] || null)
const sheetWords = computed(() => {
  if (!importPreview.value || !activeSheet.value || activeSheet.value.skipped) return []
  return importPreview.value.words.filter(w => w.hsk_level === activeSheet.value.level)
})

function onImportFileChange(e) {
  importFile.value = e.target.files[0] || null
  importPreview.value = null
  importMsg.value = null
  activeSheetIdx.value = 0
}

async function previewImport() {
  if (!importFile.value) return
  previewing.value = true
  importMsg.value = null
  importPreview.value = null
  try {
    const fd = new FormData()
    fd.append('file', importFile.value)
    const { data } = await api.post('/admin/vocabulary/preview', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    importPreview.value = data
    activeSheetIdx.value = 0
  } catch (e) {
    importMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi khi phân tích file' }
  } finally {
    previewing.value = false
  }
}

async function confirmImport() {
  if (!importPreview.value?.tempFile) return
  importing.value = true
  importMsg.value = null
  try {
    const { data } = await api.post('/admin/vocabulary/import', { tempFile: importPreview.value.tempFile })
    const levelSummary = Object.entries(data.byLevel)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([lvl, cnt]) => `HSK ${lvl}: ${cnt} từ`)
      .join(' · ')
    importMsg.value = { type: 'success', text: `✅ Đã nhập ${data.imported} từ vựng (${levelSummary})` }
    importPreview.value = null
    importFile.value = null
    if (importFileInput.value) importFileInput.value.value = ''
    await loadVocab()
  } catch (e) {
    importMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi khi nhập từ vựng' }
  } finally {
    importing.value = false
  }
}

// Vocabulary — manual
const vocabulary = ref([])
const vocabMsg = ref(null)
const vocabFilter = ref('')
const vocabForm = ref({ hanzi: '', pinyin: '', meaning_vi: '', hsk_level: '', example_sentence: '', example_pinyin: '' })

async function loadVocab() {
  const params = vocabFilter.value ? { hsk_level: vocabFilter.value } : {}
  const res = await api.get('/admin/vocabulary', { params })
  vocabulary.value = res.data
}
async function submitVocab() {
  try {
    await api.post('/admin/vocabulary', vocabForm.value)
    vocabMsg.value = { type: 'success', text: 'Đã thêm từ vựng!' }
    vocabForm.value = { hanzi: '', pinyin: '', meaning_vi: '', hsk_level: '', example_sentence: '', example_pinyin: '' }
    await loadVocab()
  } catch (e) {
    vocabMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi khi thêm từ vựng' }
  }
  setTimeout(() => { vocabMsg.value = null }, 3000)
}
async function deleteVocab(id) {
  if (!confirm(t('admin.confirmDelete'))) return
  await api.delete(`/admin/vocabulary/${id}`)
  await loadVocab()
}

// Lessons
const lessons = ref([])
const lessonMsg = ref(null)
const lessonForm = ref({ title: '', type: '', content: '', audio_url: '', hsk_level: '' })

async function loadLessons() {
  const res = await api.get('/admin/lessons')
  lessons.value = res.data
}
async function submitLesson() {
  try {
    await api.post('/admin/lessons', lessonForm.value)
    lessonMsg.value = { type: 'success', text: 'Đã thêm bài học!' }
    lessonForm.value = { title: '', type: '', content: '', audio_url: '', hsk_level: '' }
    await loadLessons()
  } catch (e) {
    lessonMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi khi thêm bài học' }
  }
  setTimeout(() => { lessonMsg.value = null }, 3000)
}
async function deleteLesson(id) {
  if (!confirm(t('admin.confirmDelete'))) return
  await api.delete(`/admin/lessons/${id}`)
  await loadLessons()
}

// Users
const users = ref([])
const userMsg = ref(null)

async function loadUsers() {
  const res = await api.get('/admin/users')
  users.value = res.data
}
async function setRole(id, role) {
  try {
    await api.patch(`/admin/users/${id}/role`, { role })
    userMsg.value = { type: 'success', text: 'Đã cập nhật quyền!' }
    await loadUsers()
  } catch (e) {
    userMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi' }
  }
  setTimeout(() => { userMsg.value = null }, 3000)
}

onMounted(async () => {
  await Promise.all([loadDownloads(), loadVocab(), loadLessons(), loadUsers()])
})
</script>

<style scoped>
.admin { padding: 8px; }
h1 { margin-bottom: 20px; color: #d32f2f; }
h2 { margin-bottom: 16px; color: #333; }
.tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e0e0e0; padding-bottom: 0; }
.tab { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 15px; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.tab.active { color: #d32f2f; border-bottom-color: #d32f2f; font-weight: 600; }
.panel { animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.form-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
.form-row { display: flex; gap: 10px; flex-wrap: wrap; }
.form-row input, .form-row select { flex: 1; min-width: 140px; }
input, select, textarea { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; width: 100%; }
textarea { resize: vertical; }
.file-label { flex: 1; min-width: 140px; padding: 8px 12px; border: 1px dashed #bbb; border-radius: 4px; cursor: pointer; font-size: 13px; color: #666; display: flex; align-items: center; background: #fafafa; }
.file-label input[type="file"] { display: none; }
.btn-primary { background: #d32f2f; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: 600; align-self: flex-start; }
.btn-primary:hover { background: #b71c1c; }
.btn-del { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-del:hover { background: #ef9a9a; }
.btn-promote { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.btn-demote { background: #fff3e0; color: #e65100; border: 1px solid #ffcc80; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
.data-table th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 13px; color: #666; }
.data-table td { padding: 10px 12px; border-top: 1px solid #f0f0f0; font-size: 14px; }
.data-table tr:hover td { background: #fafafa; }
.url-cell a { color: #1976d2; font-size: 12px; word-break: break-all; }
.hanzi { font-size: 18px; font-weight: 500; }
.filter-row { margin-bottom: 12px; }
.filter-row select { width: auto; }
.badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge.admin { background: #fff3e0; color: #e65100; }
.badge.user { background: #e8f5e9; color: #2e7d32; }
.msg { padding: 10px 14px; border-radius: 4px; margin-bottom: 12px; font-size: 14px; }
.msg.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
.msg.error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }

/* ── Vocabulary import ── */
.import-section { background: #fff8f0; border: 1px solid #ffe0b2; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; }
.import-title { font-size: 1rem; font-weight: 700; color: #e65100; margin-bottom: 12px; }
.import-upload-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.file-label-xl { flex: 1; min-width: 220px; padding: 10px 14px; border: 2px dashed #ffb74d; border-radius: 6px; cursor: pointer; font-size: 14px; color: #555; display: flex; align-items: center; gap: 8px; background: white; }
.file-label-xl input[type="file"] { display: none; }
.file-icon { font-size: 1.2rem; }
.btn-preview { padding: 10px 20px; background: #e65100; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; white-space: nowrap; }
.btn-preview:hover:not(:disabled) { background: #bf360c; }
.btn-preview:disabled { opacity: 0.55; cursor: not-allowed; }
.import-hint { font-size: 0.78rem; color: #888; margin-top: 2px; }

.preview-box { margin-top: 16px; background: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; flex-wrap: wrap; gap: 10px; }
.preview-meta { display: flex; flex-direction: column; gap: 2px; }
.preview-filename { font-weight: 700; font-size: 0.9rem; color: #333; }
.preview-total { font-size: 0.8rem; color: #888; }
.btn-import-confirm { padding: 9px 20px; background: #2e7d32; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 14px; white-space: nowrap; }
.btn-import-confirm:hover:not(:disabled) { background: #1b5e20; }
.btn-import-confirm:disabled { opacity: 0.55; cursor: not-allowed; }

.sheet-tabs { display: flex; gap: 6px; padding: 10px 12px; overflow-x: auto; border-bottom: 1px solid #eee; flex-wrap: wrap; }
.sheet-tab { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; font-size: 13px; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 80px; transition: border-color 0.15s; }
.sheet-tab.active { border-color: #d32f2f; background: #fff8f8; }
.sheet-tab.skipped { opacity: 0.5; }
.sheet-badge { font-size: 0.7rem; color: #888; font-weight: 500; }
.sheet-badge.skipped { color: #e65100; }

.sheet-words { max-height: 420px; overflow-y: auto; }
.sheet-skipped-msg { padding: 24px; text-align: center; color: #888; font-size: 0.9rem; }
.preview-table { font-size: 13px; }
.preview-table td.row-num { color: #bbb; font-size: 11px; width: 36px; }
.preview-table td.example { color: #888; font-size: 12px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.section-divider { border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }
.section-subtitle { font-size: 0.95rem; font-weight: 600; color: #555; margin-bottom: 12px; }
.vocab-count { font-size: 0.82rem; color: #aaa; margin-left: 8px; }
.filter-row { display: flex; align-items: center; margin-bottom: 12px; }
</style>
