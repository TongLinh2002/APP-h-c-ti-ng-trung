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

      <div class="filter-row">
        <select v-model="vocabFilter" @change="loadVocab">
          <option value="">Tất cả cấp</option>
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
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
import { ref, onMounted } from 'vue'
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
    await api.post('/admin/downloads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    dlMsg.value = { type: 'success', text: 'Đã thêm tài liệu!' }
    dlForm.value = { title: '', description: '', file_url: '', file_type: '', hsk_level: '', file: null }
    await loadDownloads()
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

// Vocabulary
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
</style>
