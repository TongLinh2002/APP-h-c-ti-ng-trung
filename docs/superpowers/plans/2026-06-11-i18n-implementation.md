# I18n — Đa ngôn ngữ EN / ZH / VI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm hỗ trợ 3 ngôn ngữ (EN/ZH/VI) với dropdown 🌐 trong navbar, detect ngôn ngữ hệ thống, lưu localStorage.

**Architecture:** Dùng `vue-i18n@9` (legacy: false / Composition API). File locale riêng cho từng ngôn ngữ trong `src/i18n/`. Component `LanguageSwitcher.vue` đặt trong navbar `App.vue`. Tất cả views/components dùng `const { t } = useI18n()`.

**Tech Stack:** Vue 3, vue-i18n@9, Pinia, Vite

---

## File Structure

```
frontend/src/i18n/
  index.js            ← tạo mới: createI18n, detect locale, export instance
  vi.js               ← tạo mới: tất cả chuỗi tiếng Việt
  en.js               ← tạo mới: tiếng Anh (fallback locale)
  zh.js               ← tạo mới: tiếng Trung giản thể

frontend/src/components/
  LanguageSwitcher.vue   ← tạo mới: globe icon + dropdown

frontend/src/main.js                ← sửa: app.use(i18n)
frontend/src/App.vue                ← sửa: navbar dùng $t, thêm <LanguageSwitcher />
frontend/src/views/HomeView.vue     ← sửa: dùng t()
frontend/src/views/LoginView.vue    ← sửa: dùng t()
frontend/src/views/RegisterView.vue ← sửa: dùng t()
frontend/src/views/DashboardView.vue← sửa: dùng t()
frontend/src/views/LearnView.vue    ← sửa: dùng t()
frontend/src/views/ListenView.vue   ← sửa: dùng t()
frontend/src/views/ReadView.vue     ← sửa: dùng t()
frontend/src/views/ChallengeView.vue← sửa: dùng t()
frontend/src/views/JourneyView.vue  ← sửa: dùng t()
frontend/src/views/ResourcesView.vue← sửa: dùng t()
frontend/src/components/Flashcard.vue ← sửa: dùng t()
```

---

## Task 1: Cài vue-i18n + tạo 3 file locale

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/i18n/vi.js`
- Create: `frontend/src/i18n/en.js`
- Create: `frontend/src/i18n/zh.js`

- [ ] **Bước 1: Cài vue-i18n@9**

```bash
cd frontend
npm install vue-i18n@9
```

Kết quả mong đợi: `vue-i18n` xuất hiện trong `package.json` dependencies.

- [ ] **Bước 2: Tạo `frontend/src/i18n/vi.js`**

```js
export default {
  nav: {
    home: 'Trang chủ', journey: 'Hành trình', learn: 'Học từ',
    challenge: 'Thử thách', listen: 'Nghe', read: 'Đọc',
    resources: 'Tài liệu', dashboard: 'Tiến độ',
    admin: 'Quản trị', logout: 'Đăng xuất', login: 'Đăng nhập',
  },
  auth: {
    login: 'Đăng nhập', register: 'Đăng ký',
    email: 'Email', password: 'Mật khẩu',
    displayName: 'Tên hiển thị',
    displayNamePlaceholder: 'Tên của bạn',
    passwordPlaceholder: 'Ít nhất 6 ký tự',
    loggingIn: 'Đang đăng nhập...', registering: 'Đang đăng ký...',
    noAccount: 'Chưa có tài khoản?', hasAccount: 'Đã có tài khoản?',
    loginFailed: 'Đăng nhập thất bại', registerFailed: 'Đăng ký thất bại',
  },
  home: {
    title: 'APP Học Tiếng Trung',
    subtitle: 'Học tiếng Trung theo chuẩn HSK 1–9 với phương pháp gamification',
    journey: 'Hành trình', journeyDesc: 'Lộ trình từ HSK1 đến HSK9',
    learn: 'Học từ vựng', learnDesc: 'Flashcard + SRS',
    challenge: 'Thử thách', challengeDesc: 'Game từ vựng có giờ',
    listen: 'Luyện nghe', listenDesc: 'Bài nghe + trắc nghiệm',
    read: 'Luyện đọc', readDesc: 'Đọc hiểu + từ vựng',
    resources: 'Tài liệu', resourcesDesc: 'PDF tải xuống miễn phí',
    dashboard: 'Tiến độ', dashboardDesc: 'Streak & thống kê',
  },
  dashboard: {
    title: 'Tiến độ học', totalLearned: 'Từ đã học',
    streak: 'Ngày liên tiếp', hskProgress: 'Tiến độ theo cấp HSK',
    weeklyActivity: 'Hoạt động 7 ngày qua', loading: 'Đang tải...',
  },
  learn: {
    title: 'Học từ vựng', loading: 'Đang tải...',
    sessionDone: 'Hoàn thành phiên học hôm nay!', studyAgain: 'Học lại',
    noCards: '🎊 Không có thẻ nào cần ôn hôm nay!',
    noCardsSub: 'Quay lại sau để ôn tập tiếp.',
  },
  flashcard: {
    hint: 'Nhấn để xem nghĩa ↓',
    forget: '😵 Quên', hard: '😓 Khó', ok: '🙂 Ổn', easy: '😄 Dễ',
  },
  listen: {
    title: 'Luyện nghe', hskLevel: 'Cấp HSK:', loading: 'Đang tải...',
    empty: 'Chưa có bài nghe cho cấp này.', back: '← Quay lại',
    transcript: 'Xem transcript', questions: 'Câu hỏi:',
    submit: 'Nộp bài', score: 'Điểm:', chooseAnother: 'Chọn bài khác',
  },
  read: {
    title: 'Luyện đọc', hskLevel: 'Cấp HSK:', loading: 'Đang tải...',
    empty: 'Chưa có bài đọc cho cấp này.', back: '← Quay lại',
    questions: 'Câu hỏi:', submit: 'Nộp bài',
    score: 'Điểm:', chooseAnother: 'Chọn bài khác',
  },
  challenge: {
    title: 'Thử Thách Từ Vựng', selectLevel: 'Chọn cấp HSK để bắt đầu thử thách:',
    calculating: 'Đang tính điểm...', points: 'điểm',
    bestScore: 'Điểm cao nhất:', correct: 'Đúng:', playAgain: 'Chơi lại',
  },
  journey: {
    title: 'Bản Đồ Hành Trình',
    subtitle: 'Từ mầm xanh 🌱 đến rồng thành thạo 🐉',
    loading: 'Đang tải...', words: 'từ', goLearn: 'Học từ vựng ngay →',
  },
  resources: {
    title: 'Tài Liệu Học Tập',
    subtitle: 'Tải miễn phí — không cần đăng nhập',
    filterBy: 'Lọc theo cấp:', all: 'Tất cả',
    loading: 'Đang tải...', empty: 'Chưa có tài liệu nào.', download: '⬇ Tải',
    types: { vocabulary_list: 'Từ vựng', pinyin_chart: 'Bảng Pinyin', slide: 'Slide', other: 'Khác' },
  },
  admin: {
    title: 'Quản trị', users: 'Người dùng', downloads: 'Tài liệu',
    vocabulary: 'Từ vựng', lessons: 'Bài học',
    save: 'Lưu', delete: 'Xóa', create: 'Tạo mới', update: 'Cập nhật',
    confirmDelete: 'Xác nhận xóa?', loading: 'Đang tải...',
    noData: 'Chưa có dữ liệu.', role: 'Quyền',
  },
}
```

- [ ] **Bước 3: Tạo `frontend/src/i18n/en.js`**

```js
export default {
  nav: {
    home: 'Home', journey: 'Journey', learn: 'Vocabulary',
    challenge: 'Challenge', listen: 'Listening', read: 'Reading',
    resources: 'Resources', dashboard: 'Progress',
    admin: 'Admin', logout: 'Log out', login: 'Log in',
  },
  auth: {
    login: 'Log In', register: 'Register',
    email: 'Email', password: 'Password',
    displayName: 'Display Name',
    displayNamePlaceholder: 'Your name',
    passwordPlaceholder: 'At least 6 characters',
    loggingIn: 'Logging in...', registering: 'Registering...',
    noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    loginFailed: 'Login failed', registerFailed: 'Registration failed',
  },
  home: {
    title: 'Chinese Learning App',
    subtitle: 'Learn Chinese to HSK 1–9 standard with gamification',
    journey: 'Journey', journeyDesc: 'Path from HSK1 to HSK9',
    learn: 'Vocabulary', learnDesc: 'Flashcard + SRS',
    challenge: 'Challenge', challengeDesc: 'Timed vocabulary game',
    listen: 'Listening', listenDesc: 'Audio + comprehension',
    read: 'Reading', readDesc: 'Reading + vocabulary',
    resources: 'Resources', resourcesDesc: 'Free PDF downloads',
    dashboard: 'Progress', dashboardDesc: 'Streak & statistics',
  },
  dashboard: {
    title: 'Learning Progress', totalLearned: 'Words Learned',
    streak: 'Day Streak', hskProgress: 'HSK Level Progress',
    weeklyActivity: 'Last 7 Days Activity', loading: 'Loading...',
  },
  learn: {
    title: 'Vocabulary', loading: 'Loading...',
    sessionDone: "Today's session complete!", studyAgain: 'Study Again',
    noCards: '🎊 No cards due for review today!',
    noCardsSub: 'Come back later for more practice.',
  },
  flashcard: {
    hint: 'Tap to reveal ↓',
    forget: '😵 Forgot', hard: '😓 Hard', ok: '🙂 OK', easy: '😄 Easy',
  },
  listen: {
    title: 'Listening Practice', hskLevel: 'HSK Level:', loading: 'Loading...',
    empty: 'No listening lessons for this level.', back: '← Back',
    transcript: 'View transcript', questions: 'Questions:',
    submit: 'Submit', score: 'Score:', chooseAnother: 'Choose Another',
  },
  read: {
    title: 'Reading Practice', hskLevel: 'HSK Level:', loading: 'Loading...',
    empty: 'No reading lessons for this level.', back: '← Back',
    questions: 'Questions:', submit: 'Submit',
    score: 'Score:', chooseAnother: 'Choose Another',
  },
  challenge: {
    title: 'Vocabulary Challenge', selectLevel: 'Select HSK level to start:',
    calculating: 'Calculating score...', points: 'points',
    bestScore: 'Best Score:', correct: 'Correct:', playAgain: 'Play Again',
  },
  journey: {
    title: 'Learning Journey Map',
    subtitle: 'From seedling 🌱 to master dragon 🐉',
    loading: 'Loading...', words: 'words', goLearn: 'Study vocabulary now →',
  },
  resources: {
    title: 'Learning Resources',
    subtitle: 'Free downloads — no login required',
    filterBy: 'Filter by level:', all: 'All',
    loading: 'Loading...', empty: 'No resources available.', download: '⬇ Download',
    types: { vocabulary_list: 'Vocabulary', pinyin_chart: 'Pinyin Chart', slide: 'Slides', other: 'Other' },
  },
  admin: {
    title: 'Admin', users: 'Users', downloads: 'Resources',
    vocabulary: 'Vocabulary', lessons: 'Lessons',
    save: 'Save', delete: 'Delete', create: 'Create', update: 'Update',
    confirmDelete: 'Confirm delete?', loading: 'Loading...',
    noData: 'No data.', role: 'Role',
  },
}
```

- [ ] **Bước 4: Tạo `frontend/src/i18n/zh.js`**

```js
export default {
  nav: {
    home: '首页', journey: '学习路线', learn: '词汇',
    challenge: '挑战', listen: '听力', read: '阅读',
    resources: '资料', dashboard: '进度',
    admin: '管理', logout: '退出', login: '登录',
  },
  auth: {
    login: '登录', register: '注册',
    email: '电子邮箱', password: '密码',
    displayName: '显示名称',
    displayNamePlaceholder: '您的姓名',
    passwordPlaceholder: '至少6个字符',
    loggingIn: '登录中...', registering: '注册中...',
    noAccount: '还没有账号？', hasAccount: '已有账号？',
    loginFailed: '登录失败', registerFailed: '注册失败',
  },
  home: {
    title: '中文学习应用',
    subtitle: '按HSK 1–9标准学习中文，游戏化学习体验',
    journey: '学习路线', journeyDesc: 'HSK1到HSK9的学习路径',
    learn: '词汇学习', learnDesc: '闪卡 + 间隔重复',
    challenge: '挑战', challengeDesc: '限时词汇游戏',
    listen: '听力练习', listenDesc: '听力 + 理解',
    read: '阅读练习', readDesc: '阅读 + 词汇',
    resources: '学习资料', resourcesDesc: '免费PDF下载',
    dashboard: '学习进度', dashboardDesc: '连续学习 & 统计',
  },
  dashboard: {
    title: '学习进度', totalLearned: '已学词汇',
    streak: '连续天数', hskProgress: 'HSK各级进度',
    weeklyActivity: '最近7天活动', loading: '加载中...',
  },
  learn: {
    title: '词汇学习', loading: '加载中...',
    sessionDone: '今日学习完成！', studyAgain: '再次学习',
    noCards: '🎊 今天没有需要复习的词汇！',
    noCardsSub: '稍后再来继续练习。',
  },
  flashcard: {
    hint: '点击查看释义 ↓',
    forget: '😵 忘了', hard: '😓 难', ok: '🙂 还好', easy: '😄 简单',
  },
  listen: {
    title: '听力练习', hskLevel: 'HSK级别：', loading: '加载中...',
    empty: '该级别暂无听力课程。', back: '← 返回',
    transcript: '查看文本', questions: '问题：',
    submit: '提交', score: '得分：', chooseAnother: '选择其他',
  },
  read: {
    title: '阅读练习', hskLevel: 'HSK级别：', loading: '加载中...',
    empty: '该级别暂无阅读课程。', back: '← 返回',
    questions: '问题：', submit: '提交',
    score: '得分：', chooseAnother: '选择其他',
  },
  challenge: {
    title: '词汇挑战', selectLevel: '选择HSK级别开始挑战：',
    calculating: '计算得分中...', points: '分',
    bestScore: '最高分：', correct: '正确：', playAgain: '再玩一次',
  },
  journey: {
    title: '学习地图',
    subtitle: '从幼苗 🌱 到精通之龙 🐉',
    loading: '加载中...', words: '词', goLearn: '立即学习词汇 →',
  },
  resources: {
    title: '学习资料',
    subtitle: '免费下载 — 无需登录',
    filterBy: '按级别筛选：', all: '全部',
    loading: '加载中...', empty: '暂无资料。', download: '⬇ 下载',
    types: { vocabulary_list: '词汇表', pinyin_chart: '拼音表', slide: '幻灯片', other: '其他' },
  },
  admin: {
    title: '管理', users: '用户', downloads: '资料',
    vocabulary: '词汇', lessons: '课程',
    save: '保存', delete: '删除', create: '新建', update: '更新',
    confirmDelete: '确认删除？', loading: '加载中...',
    noData: '暂无数据。', role: '权限',
  },
}
```

- [ ] **Bước 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/i18n/
git commit -m "feat: cài vue-i18n@9, tạo locale files vi/en/zh"
```

---

## Task 2: Tạo `i18n/index.js` và cập nhật `main.js`

**Files:**
- Create: `frontend/src/i18n/index.js`
- Modify: `frontend/src/main.js`

- [ ] **Bước 1: Tạo `frontend/src/i18n/index.js`**

```js
import { createI18n } from 'vue-i18n'
import en from './en'
import vi from './vi'
import zh from './zh'

const saved = localStorage.getItem('locale')
const browser = navigator.language?.toLowerCase() || ''
const detected = saved
  || (browser.startsWith('zh') ? 'zh' : browser.startsWith('vi') ? 'vi' : 'en')

const i18n = createI18n({
  legacy: false,
  locale: detected,
  fallbackLocale: 'en',
  messages: { en, vi, zh },
})

export default i18n
```

- [ ] **Bước 2: Cập nhật `frontend/src/main.js`**

Nội dung mới của file:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n/index'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
```

- [ ] **Bước 3: Verify build không lỗi**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Kết quả mong đợi: `✓ built in X.XXs`

- [ ] **Bước 4: Commit**

```bash
git add frontend/src/i18n/index.js frontend/src/main.js
git commit -m "feat: khởi tạo vue-i18n với detect ngôn ngữ hệ thống"
```

---

## Task 3: Tạo `LanguageSwitcher.vue`

**Files:**
- Create: `frontend/src/components/LanguageSwitcher.vue`

- [ ] **Bước 1: Tạo `frontend/src/components/LanguageSwitcher.vue`**

```vue
<template>
  <div class="lang-switcher" ref="wrapper">
    <button class="lang-btn" @click="toggle">
      🌐 {{ current.label }} ▾
    </button>
    <div v-if="open" class="lang-dropdown">
      <button
        v-for="lang in langs"
        :key="lang.code"
        class="lang-option"
        :class="{ active: locale === lang.code }"
        @click="select(lang.code)"
      >
        {{ lang.flag }} {{ lang.name }}
        <span v-if="locale === lang.code" class="check">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const open = ref(false)
const wrapper = ref(null)

const langs = [
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'zh', label: '中', flag: '🇨🇳', name: '中文' },
  { code: 'vi', label: 'VI', flag: '🇻🇳', name: 'Tiếng Việt' },
]

const current = computed(() => langs.find(l => l.code === locale.value) || langs[0])

function toggle() { open.value = !open.value }

function select(code) {
  locale.value = code
  localStorage.setItem('locale', code)
  open.value = false
}

function onClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.lang-switcher { position: relative; }

.lang-btn {
  background: rgba(255,255,255,0.2);
  border: none; border-radius: 4px;
  color: white; padding: 6px 12px;
  cursor: pointer; font-size: 0.9rem;
  font-weight: 600; white-space: nowrap;
}
.lang-btn:hover { background: rgba(255,255,255,0.3); }

.lang-dropdown {
  position: absolute; top: calc(100% + 6px); right: 0;
  background: white; border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  overflow: hidden; min-width: 150px; z-index: 100;
}

.lang-option {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 10px 16px;
  background: none; border: none; border-bottom: 1px solid #f5e8ec;
  cursor: pointer; font-size: 0.9rem; color: #333; text-align: left;
}
.lang-option:last-child { border-bottom: none; }
.lang-option:hover { background: #fff0f5; }
.lang-option.active { background: #fff0f5; font-weight: 700; color: #d32f2f; }

.check { margin-left: auto; color: #d32f2f; font-weight: 700; }
</style>
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/components/LanguageSwitcher.vue
git commit -m "feat: tạo LanguageSwitcher component (dropdown 🌐)"
```

---

## Task 4: Cập nhật `App.vue`

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Bước 1: Thay toàn bộ nội dung `frontend/src/App.vue`**

```vue
<template>
  <SakuraBackground />
  <nav class="navbar">
    <RouterLink to="/">{{ $t('nav.home') }}</RouterLink>
    <RouterLink to="/journey">{{ $t('nav.journey') }}</RouterLink>
    <RouterLink to="/learn">{{ $t('nav.learn') }}</RouterLink>
    <RouterLink to="/challenge">{{ $t('nav.challenge') }}</RouterLink>
    <RouterLink to="/listen">{{ $t('nav.listen') }}</RouterLink>
    <RouterLink to="/read">{{ $t('nav.read') }}</RouterLink>
    <RouterLink to="/resources">{{ $t('nav.resources') }}</RouterLink>
    <RouterLink to="/dashboard">{{ $t('nav.dashboard') }}</RouterLink>
    <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn-admin">{{ $t('nav.admin') }}</RouterLink>
    <LanguageSwitcher />
    <button v-if="authStore.isLoggedIn" @click="logout" class="btn-logout">{{ $t('nav.logout') }}</button>
    <RouterLink v-else to="/login" class="btn-login">{{ $t('nav.login') }}</RouterLink>
  </nav>
  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import SakuraBackground from './components/SakuraBackground.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(160deg, #fff0f5 0%, #ffe4ee 50%, #ffd6e0 100%);
  background-attachment: fixed;
  color: #333;
  min-height: 100vh;
}
.navbar { position: relative; z-index: 1; background: #d32f2f; padding: 12px 24px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.navbar a { color: white; text-decoration: none; font-weight: 500; padding: 6px 12px; border-radius: 4px; }
.navbar a:hover, .navbar a.router-link-active { background: rgba(255,255,255,0.2); }
.btn-logout { background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.btn-login { margin-left: 0 !important; }
.btn-admin { background: #ff8f00 !important; color: white !important; font-weight: 700 !important; }
.main-content { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; padding: 24px 16px; }
</style>
```

- [ ] **Bước 2: Verify build**

```bash
cd frontend && npm run build 2>&1 | tail -5
```

Kết quả mong đợi: `✓ built in X.XXs`

- [ ] **Bước 3: Commit**

```bash
git add frontend/src/App.vue
git commit -m "feat: navbar dùng i18n + thêm LanguageSwitcher"
```

---

## Task 5: Cập nhật `HomeView.vue`

**Files:**
- Modify: `frontend/src/views/HomeView.vue`

- [ ] **Bước 1: Thay nội dung `frontend/src/views/HomeView.vue`**

```vue
<template>
  <div class="home">
    <div class="hero">
      <h1>{{ $t('home.title') }}</h1>
      <p>{{ $t('home.subtitle') }}</p>
    </div>

    <div class="nav-grid">
      <RouterLink to="/journey" class="nav-card journey">
        <span class="card-icon">🗺️</span>
        <span class="card-title">{{ $t('home.journey') }}</span>
        <span class="card-desc">{{ $t('home.journeyDesc') }}</span>
      </RouterLink>
      <RouterLink to="/learn" class="nav-card learn">
        <span class="card-icon">📚</span>
        <span class="card-title">{{ $t('home.learn') }}</span>
        <span class="card-desc">{{ $t('home.learnDesc') }}</span>
      </RouterLink>
      <RouterLink to="/challenge" class="nav-card challenge">
        <span class="card-icon">⚔️</span>
        <span class="card-title">{{ $t('home.challenge') }}</span>
        <span class="card-desc">{{ $t('home.challengeDesc') }}</span>
      </RouterLink>
      <RouterLink to="/listen" class="nav-card listen">
        <span class="card-icon">🎧</span>
        <span class="card-title">{{ $t('home.listen') }}</span>
        <span class="card-desc">{{ $t('home.listenDesc') }}</span>
      </RouterLink>
      <RouterLink to="/read" class="nav-card read">
        <span class="card-icon">📖</span>
        <span class="card-title">{{ $t('home.read') }}</span>
        <span class="card-desc">{{ $t('home.readDesc') }}</span>
      </RouterLink>
      <RouterLink to="/resources" class="nav-card resources">
        <span class="card-icon">📄</span>
        <span class="card-title">{{ $t('home.resources') }}</span>
        <span class="card-desc">{{ $t('home.resourcesDesc') }}</span>
      </RouterLink>
      <RouterLink to="/dashboard" class="nav-card dashboard">
        <span class="card-icon">📊</span>
        <span class="card-title">{{ $t('home.dashboard') }}</span>
        <span class="card-desc">{{ $t('home.dashboardDesc') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 48px 0 32px; }
.hero h1 { font-size: 2.2rem; margin-bottom: 12px; }
.hero p { color: #666; font-size: 1.1rem; }
.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
.nav-card { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: white; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
.nav-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.card-icon { font-size: 2.5rem; margin-bottom: 10px; }
.card-title { font-weight: 700; font-size: 1rem; color: #333; margin-bottom: 4px; }
.card-desc { font-size: 0.8rem; color: #888; text-align: center; }
</style>
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/views/HomeView.vue
git commit -m "feat: HomeView dùng i18n"
```

---

## Task 6: Cập nhật `LoginView.vue` và `RegisterView.vue`

**Files:**
- Modify: `frontend/src/views/LoginView.vue`
- Modify: `frontend/src/views/RegisterView.vue`

- [ ] **Bước 1: Thay nội dung `frontend/src/views/LoginView.vue`**

```vue
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ $t('auth.login') }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>{{ $t('auth.email') }}</label>
          <input v-model="email" type="email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.password') }}</label>
          <input v-model="password" type="password" placeholder="••••••" required />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('auth.loggingIn') : $t('auth.login') }}
        </button>
      </form>
      <p class="auth-link">{{ $t('auth.noAccount') }} <RouterLink to="/register">{{ $t('auth.register') }}</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.loginAction(email.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || t('auth.loginFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.auth-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { margin-bottom: 24px; font-size: 1.5rem; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.btn-primary { width: 100%; padding: 12px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 8px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { color: #d32f2f; margin-bottom: 8px; font-size: 0.9rem; }
.auth-link { text-align: center; margin-top: 16px; color: #666; }
.auth-link a { color: #d32f2f; }
</style>
```

- [ ] **Bước 2: Thay nội dung `frontend/src/views/RegisterView.vue`**

```vue
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ $t('auth.register') }}</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>{{ $t('auth.displayName') }}</label>
          <input v-model="displayName" type="text" :placeholder="$t('auth.displayNamePlaceholder')" />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.email') }}</label>
          <input v-model="email" type="email" placeholder="email@example.com" required />
        </div>
        <div class="form-group">
          <label>{{ $t('auth.password') }}</label>
          <input v-model="password" type="password" :placeholder="$t('auth.passwordPlaceholder')" required minlength="6" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? $t('auth.registering') : $t('auth.register') }}
        </button>
      </form>
      <p class="auth-link">{{ $t('auth.hasAccount') }} <RouterLink to="/login">{{ $t('auth.login') }}</RouterLink></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const displayName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await authStore.registerAction(email.value, password.value, displayName.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || t('auth.registerFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.auth-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { margin-bottom: 24px; font-size: 1.5rem; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 500; }
.form-group input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.btn-primary { width: 100%; padding: 12px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 8px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.error-msg { color: #d32f2f; margin-bottom: 8px; font-size: 0.9rem; }
.auth-link { text-align: center; margin-top: 16px; color: #666; }
.auth-link a { color: #d32f2f; }
</style>
```

- [ ] **Bước 3: Commit**

```bash
git add frontend/src/views/LoginView.vue frontend/src/views/RegisterView.vue
git commit -m "feat: LoginView + RegisterView dùng i18n"
```

---

## Task 7: Cập nhật `DashboardView.vue`

**Files:**
- Modify: `frontend/src/views/DashboardView.vue`

- [ ] **Bước 1: Thay nội dung `frontend/src/views/DashboardView.vue`**

```vue
<template>
  <div class="dashboard">
    <h2>📊 {{ $t('dashboard.title') }}</h2>

    <div v-if="loading" class="loading">{{ $t('dashboard.loading') }}</div>
    <div v-else>
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-num">{{ store.totalLearned }}</p>
          <p class="stat-label">{{ $t('dashboard.totalLearned') }}</p>
        </div>
        <div class="stat-card fire">
          <p class="stat-num">{{ store.streak }} 🔥</p>
          <p class="stat-label">{{ $t('dashboard.streak') }}</p>
        </div>
      </div>

      <h3>{{ $t('dashboard.hskProgress') }}</h3>
      <div v-for="n in 9" :key="n" class="level-row">
        <span class="level-label">HSK {{ n }}</span>
        <ProgressBar :percent="getLevelPercent(n)" />
        <span class="level-count">{{ getLevelCount(n) }}/{{ hskTotals[n] }}</span>
      </div>

      <h3>{{ $t('dashboard.weeklyActivity') }}</h3>
      <div class="weekly-chart">
        <div v-for="day in last7Days" :key="day.date" class="day-col">
          <div class="day-bar-wrap">
            <div class="day-bar" :style="{ height: Math.max(4, day.count * 12) + 'px' }"></div>
          </div>
          <span class="day-label">{{ day.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import ProgressBar from '../components/ProgressBar.vue'
import { useProgressStore } from '../stores/progress'

const store = useProgressStore()
const loading = ref(true)
const hskTotals = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000, 7: 8000, 8: 11000, 9: 15000 }

onMounted(async () => { await store.load(); loading.value = false })

function getLevelCount(level) {
  const found = store.byLevel.find((b) => b['Vocabulary.hsk_level'] === level || b['Vocabulary.hsk_level'] === String(level))
  return found ? parseInt(found.count) : 0
}
function getLevelPercent(level) {
  return Math.min(100, Math.round((getLevelCount(level) / hskTotals[level]) * 100))
}

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = store.weeklyActivity.find((a) => a.day === dateStr)
    days.push({ date: dateStr, label: d.toLocaleDateString('vi', { weekday: 'short' }), count: found ? parseInt(found.count) : 0 })
  }
  return days
})
</script>

<style scoped>
h2, h3 { margin-bottom: 16px; }
h3 { margin-top: 28px; }
.loading { color: #888; }
.stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.stat-card { background: white; padding: 20px 28px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; min-width: 140px; }
.stat-num { font-size: 2.2rem; font-weight: 700; color: #d32f2f; }
.stat-label { color: #666; font-size: 0.9rem; margin-top: 4px; }
.level-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.level-label { min-width: 56px; font-weight: 600; font-size: 0.9rem; }
.level-count { font-size: 0.8rem; color: #888; min-width: 72px; text-align: right; }
.weekly-chart { display: flex; gap: 8px; align-items: flex-end; height: 100px; padding-top: 8px; }
.day-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.day-bar-wrap { display: flex; align-items: flex-end; height: 72px; }
.day-bar { width: 28px; background: #d32f2f; border-radius: 4px 4px 0 0; min-height: 4px; }
.day-label { font-size: 0.7rem; color: #888; }
</style>
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/views/DashboardView.vue
git commit -m "feat: DashboardView dùng i18n"
```

---

## Task 8: Cập nhật `LearnView.vue` và `Flashcard.vue`

**Files:**
- Modify: `frontend/src/views/LearnView.vue`
- Modify: `frontend/src/components/Flashcard.vue`

- [ ] **Bước 1: Thay nội dung `frontend/src/views/LearnView.vue`**

```vue
<template>
  <div class="learn-view">
    <h2>📚 {{ $t('learn.title') }}</h2>

    <div v-if="loading" class="loading">{{ $t('learn.loading') }}</div>

    <div v-else-if="store.sessionDone" class="session-done">
      <p class="done-icon">🎉</p>
      <p>{{ $t('learn.sessionDone') }}</p>
      <button class="btn-primary" @click="reload">{{ $t('learn.studyAgain') }}</button>
    </div>

    <div v-else-if="store.currentCard">
      <div class="progress-info">
        <span>{{ store.currentIndex + 1 }} / {{ store.totalCards }}</span>
        <div class="progress-bar"><div class="progress-fill" :style="{ width: ((store.currentIndex) / store.totalCards * 100) + '%' }"></div></div>
      </div>
      <Flashcard :card="store.currentCard" @rate="store.rateCard" />
    </div>

    <div v-else class="empty-state">
      <p>{{ $t('learn.noCards') }}</p>
      <p class="sub">{{ $t('learn.noCardsSub') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Flashcard from '../components/Flashcard.vue'
import { useVocabularyStore } from '../stores/vocabulary'

const store = useVocabularyStore()
const loading = ref(true)

onMounted(async () => {
  await store.loadReviewCards()
  loading.value = false
})

async function reload() {
  loading.value = true
  await store.loadReviewCards()
  loading.value = false
}
</script>

<style scoped>
.learn-view { text-align: center; }
h2 { margin-bottom: 24px; }
.loading { color: #888; }
.progress-info { margin-bottom: 20px; }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; margin-top: 8px; }
.progress-fill { height: 100%; background: #d32f2f; border-radius: 3px; transition: width 0.3s; }
.session-done { padding: 40px; }
.done-icon { font-size: 4rem; margin-bottom: 12px; }
.session-done p { font-size: 1.2rem; margin-bottom: 20px; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
.empty-state { padding: 60px 20px; color: #666; }
.sub { font-size: 0.9rem; margin-top: 8px; }
</style>
```

- [ ] **Bước 2: Thay nội dung `frontend/src/components/Flashcard.vue`**

```vue
<template>
  <div class="flashcard-wrap">
    <div class="flashcard" :class="{ flipped }" @click="flip">
      <div class="card-face card-front">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="hint">{{ $t('flashcard.hint') }}</p>
      </div>
      <div class="card-face card-back">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="pinyin">{{ card.Vocabulary?.pinyin }}</p>
        <p class="meaning">{{ card.Vocabulary?.meaning_vi }}</p>
        <p v-if="card.Vocabulary?.example_sentence" class="example">
          {{ card.Vocabulary.example_sentence }}
        </p>
      </div>
    </div>

    <div v-if="flipped" class="rating-row">
      <button class="btn-rating forget" @click.stop="$emit('rate', 0)">{{ $t('flashcard.forget') }}</button>
      <button class="btn-rating hard"   @click.stop="$emit('rate', 1)">{{ $t('flashcard.hard') }}</button>
      <button class="btn-rating ok"     @click.stop="$emit('rate', 2)">{{ $t('flashcard.ok') }}</button>
      <button class="btn-rating easy"   @click.stop="$emit('rate', 3)">{{ $t('flashcard.easy') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ card: Object })
defineEmits(['rate'])
const flipped = ref(false)
watch(() => props.card, () => { flipped.value = false })
function flip() { flipped.value = !flipped.value }
</script>

<style scoped>
.flashcard-wrap { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.flashcard { width: 340px; height: 200px; cursor: pointer; perspective: 1000px; }
.card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
.card-front { background: white; }
.card-back { background: #fff8e1; transform: rotateY(180deg); }
.flashcard.flipped .card-front { transform: rotateY(180deg); }
.flashcard.flipped .card-back { transform: rotateY(0deg); }
.hanzi { font-size: 3rem; margin-bottom: 8px; }
.hint { color: #aaa; font-size: 0.85rem; }
.pinyin { color: #e65100; font-size: 1.2rem; margin-bottom: 6px; }
.meaning { font-size: 1.1rem; font-weight: 600; }
.example { font-size: 0.85rem; color: #666; margin-top: 8px; text-align: center; }
.rating-row { display: flex; gap: 12px; }
.btn-rating { padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.95rem; font-weight: 600; }
.forget { background: #ffcdd2; color: #c62828; }
.hard { background: #ffe0b2; color: #e65100; }
.ok { background: #dcedc8; color: #33691e; }
.easy { background: #b3e5fc; color: #01579b; }
</style>
```

- [ ] **Bước 3: Commit**

```bash
git add frontend/src/views/LearnView.vue frontend/src/components/Flashcard.vue
git commit -m "feat: LearnView + Flashcard dùng i18n"
```

---

## Task 9: Cập nhật `ListenView.vue` và `ReadView.vue`

**Files:**
- Modify: `frontend/src/views/ListenView.vue`
- Modify: `frontend/src/views/ReadView.vue`

- [ ] **Bước 1: Thay `<template>` trong `frontend/src/views/ListenView.vue`**

Thay toàn bộ phần `<template>` (giữ nguyên `<script setup>` và `<style>`):

```vue
<template>
  <div class="listen-view">
    <h2>🎧 {{ $t('listen.title') }}</h2>

    <div v-if="!store.currentLesson">
      <div class="filter-bar">
        <label>{{ $t('listen.hskLevel') }}
          <select v-model="selectedLevel" @change="loadLessons">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>
      <div v-if="loading" class="loading">{{ $t('listen.loading') }}</div>
      <div v-else-if="!store.lessons.length" class="empty">{{ $t('listen.empty') }}</div>
      <ul v-else class="lesson-list">
        <li v-for="lesson in store.lessons" :key="lesson.id" class="lesson-item" @click="openLesson(lesson.id)">
          <span class="lesson-icon">🎧</span>
          <span>{{ lesson.title }}</span>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="store.closeLesson">{{ $t('listen.back') }}</button>
      <h3>{{ store.currentLesson.title }}</h3>

      <AudioPlayer v-if="store.currentLesson.audio_url" :src="store.currentLesson.audio_url" />

      <details class="transcript-box">
        <summary>{{ $t('listen.transcript') }}</summary>
        <pre>{{ store.currentLesson.transcript }}</pre>
      </details>

      <div v-if="!store.result">
        <h4>{{ $t('listen.questions') }}</h4>
        <QuizCard
          v-for="q in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="false"
          @answer="recordAnswer"
        />
        <button class="btn-primary" @click="submit">{{ $t('listen.submit') }}</button>
      </div>

      <div v-else class="result-box">
        <p class="score">{{ $t('listen.score') }} <strong>{{ store.result.score }}/100</strong></p>
        <QuizCard
          v-for="(q, i) in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="true"
          :correct-answer="store.result.results[i]?.correct_answer"
        />
        <button class="btn-primary" @click="store.closeLesson">{{ $t('listen.chooseAnother') }}</button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Bước 2: Thay `<template>` trong `frontend/src/views/ReadView.vue`**

Thay toàn bộ phần `<template>` (giữ nguyên `<script setup>` và `<style>`):

```vue
<template>
  <div class="read-view">
    <h2>📖 {{ $t('read.title') }}</h2>

    <div v-if="!store.currentLesson">
      <div class="filter-bar">
        <label>{{ $t('read.hskLevel') }}
          <select v-model="selectedLevel" @change="loadLessons">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>
      <div v-if="loading" class="loading">{{ $t('read.loading') }}</div>
      <div v-else-if="!store.lessons.length" class="empty">{{ $t('read.empty') }}</div>
      <ul v-else class="lesson-list">
        <li v-for="lesson in store.lessons" :key="lesson.id" class="lesson-item" @click="openLesson(lesson.id)">
          <span class="lesson-icon">📖</span>
          <span>{{ lesson.title }}</span>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="store.closeLesson">{{ $t('read.back') }}</button>
      <h3>{{ store.currentLesson.title }}</h3>

      <div class="reading-content">
        <span v-for="(seg, idx) in parsedContent" :key="idx">
          <span v-if="seg.isVocab" class="vocab-word" @click="toggleTooltip(idx)">
            {{ seg.text }}<span v-if="activeTooltip === idx" class="tooltip">{{ seg.meaning }}</span>
          </span>
          <span v-else>{{ seg.text }}</span>
        </span>
      </div>

      <div v-if="!store.result">
        <h4>{{ $t('read.questions') }}</h4>
        <QuizCard
          v-for="q in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="false"
          @answer="recordAnswer"
        />
        <button class="btn-primary" @click="submit">{{ $t('read.submit') }}</button>
      </div>

      <div v-else class="result-box">
        <p class="score">{{ $t('read.score') }} <strong>{{ store.result.score }}/100</strong></p>
        <QuizCard
          v-for="(q, i) in store.currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="true"
          :correct-answer="store.result.results[i]?.correct_answer"
        />
        <button class="btn-primary" @click="store.closeLesson">{{ $t('read.chooseAnother') }}</button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Bước 3: Commit**

```bash
git add frontend/src/views/ListenView.vue frontend/src/views/ReadView.vue
git commit -m "feat: ListenView + ReadView dùng i18n"
```

---

## Task 10: Cập nhật `ChallengeView.vue`

**Files:**
- Modify: `frontend/src/views/ChallengeView.vue`

- [ ] **Bước 1: Thay toàn bộ nội dung `frontend/src/views/ChallengeView.vue`**

```vue
<template>
  <div class="challenge-view">
    <h2>⚔️ {{ $t('challenge.title') }}</h2>

    <div v-if="!store.questions.length && !store.result" class="level-select">
      <p>{{ $t('challenge.selectLevel') }}</p>
      <div class="level-grid">
        <button v-for="n in 9" :key="n" class="level-btn" :disabled="starting" @click="start(n)">
          HSK {{ n }}
        </button>
      </div>
    </div>

    <div v-else-if="store.currentQuestion">
      <ChallengeGame
        :question="store.currentQuestion"
        :current-index="store.currentIndex"
        :total="store.questions.length"
        @answer="handleAnswer"
      />
    </div>

    <div v-else-if="store.isFinished && !store.result" class="calculating">
      {{ $t('challenge.calculating') }}
    </div>

    <div v-else-if="store.result" class="result-screen">
      <p class="trophy">🏆</p>
      <p class="score-big">{{ store.result.score }} {{ $t('challenge.points') }}</p>
      <p class="best">{{ $t('challenge.bestScore') }} <strong>{{ store.result.best_score }}</strong></p>
      <p class="correct-count">{{ $t('challenge.correct') }} {{ store.result.results.filter(r => r.correct).length }}/{{ store.result.results.length }}</p>
      <button class="btn-retry" @click="store.reset()">{{ $t('challenge.playAgain') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChallengeGame from '../components/ChallengeGame.vue'
import { useChallengeStore } from '../stores/challenge'

const store = useChallengeStore()
const starting = ref(false)

async function start(level) { starting.value = true; await store.start(level); starting.value = false }
async function handleAnswer({ selected_index, time_ms }) {
  store.recordAnswer(selected_index, time_ms)
  if (store.isFinished) await store.submit()
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.level-select p { margin-bottom: 16px; color: #666; }
.level-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 360px; }
.level-btn { padding: 14px; background: white; border: 2px solid #eee; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.15s; }
.level-btn:hover:not(:disabled) { border-color: #d32f2f; color: #d32f2f; }
.level-btn:disabled { opacity: 0.5; }
.calculating { text-align: center; padding: 40px; color: #888; }
.result-screen { text-align: center; padding: 32px; }
.trophy { font-size: 4rem; margin-bottom: 12px; }
.score-big { font-size: 3rem; font-weight: 700; color: #d32f2f; margin-bottom: 8px; }
.best, .correct-count { color: #666; margin-bottom: 6px; }
.btn-retry { margin-top: 20px; padding: 12px 32px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
</style>
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/views/ChallengeView.vue
git commit -m "feat: ChallengeView dùng i18n"
```

---

## Task 11: Cập nhật `JourneyView.vue`

**Files:**
- Modify: `frontend/src/views/JourneyView.vue`

- [ ] **Bước 1: Thay toàn bộ nội dung `frontend/src/views/JourneyView.vue`**

```vue
<template>
  <div class="journey-view">
    <h2>🗺️ {{ $t('journey.title') }}</h2>
    <p class="subtitle">{{ $t('journey.subtitle') }}</p>
    <div v-if="loading" class="loading">{{ $t('journey.loading') }}</div>
    <JourneyMap v-else :stages="store.stages" :current-stage="store.currentStage" @select="selected = $event" />
    <div v-if="selected" class="detail-panel">
      <h3>{{ selected.icon }} {{ selected.name }}</h3>
      <p>HSK {{ selected.hsk_levels.join(' & ') }} — {{ selected.learnedVocab }}/{{ selected.totalVocab }} {{ $t('journey.words') }} ({{ selected.percent }}%)</p>
      <RouterLink to="/learn" class="btn-go">{{ $t('journey.goLearn') }}</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import JourneyMap from '../components/JourneyMap.vue'
import { useJourneyStore } from '../stores/journey'

const store = useJourneyStore()
const loading = ref(true)
const selected = ref(null)
onMounted(async () => { await store.load(); loading.value = false })
</script>

<style scoped>
h2 { margin-bottom: 6px; }
.subtitle { color: #888; margin-bottom: 24px; }
.loading { color: #888; }
.detail-panel { margin-top: 20px; background: #fff3e0; border-radius: 10px; padding: 16px 20px; }
.detail-panel h3 { margin-bottom: 6px; }
.btn-go { display: inline-block; margin-top: 12px; padding: 8px 20px; background: #d32f2f; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; }
</style>
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/views/JourneyView.vue
git commit -m "feat: JourneyView dùng i18n"
```

---

## Task 12: Cập nhật `ResourcesView.vue`

**Files:**
- Modify: `frontend/src/views/ResourcesView.vue`

- [ ] **Bước 1: Thay toàn bộ nội dung `frontend/src/views/ResourcesView.vue`**

```vue
<template>
  <div class="resources-view">
    <h2>📄 {{ $t('resources.title') }}</h2>
    <p class="subtitle">{{ $t('resources.subtitle') }}</p>

    <div class="filter-bar">
      <label>{{ $t('resources.filterBy') }}
        <select v-model="selectedLevel" @change="load">
          <option value="">{{ $t('resources.all') }}</option>
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
      </label>
    </div>

    <div v-if="loading" class="loading">{{ $t('resources.loading') }}</div>
    <div v-else-if="!downloads.length" class="empty">{{ $t('resources.empty') }}</div>
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
        <a :href="'http://localhost:3000' + doc.file_url" target="_blank" class="btn-dl">{{ $t('resources.download') }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchDownloads } from '../services/downloadsService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const downloads = ref([])
const selectedLevel = ref('')
const loading = ref(true)

onMounted(() => load())

async function load() {
  loading.value = true
  downloads.value = await fetchDownloads(selectedLevel.value || undefined)
  loading.value = false
}

function typeLabel(type) {
  return t(`resources.types.${type}`) || type
}
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
```

- [ ] **Bước 2: Commit**

```bash
git add frontend/src/views/ResourcesView.vue
git commit -m "feat: ResourcesView dùng i18n"
```

---

## Task 13: Cập nhật `AdminView.vue` (admin-only)

**Files:**
- Modify: `frontend/src/views/AdminView.vue`

> **Note cho executor:** File này 317 dòng. Đọc `frontend/src/views/AdminView.vue` trước để thấy toàn bộ text cần dịch. Các key đã có trong locale files (`admin.*`). Pattern thay thế giống các task trước: thêm `import { useI18n } from 'vue-i18n'` và `const { t } = useI18n()` vào `<script setup>`, thay mọi string hardcode bằng `t('admin.key')` trong template.

- [ ] **Bước 1: Thêm i18n vào `<script setup>` của AdminView.vue**

Thêm vào đầu phần imports:
```js
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
```

- [ ] **Bước 2: Thay các string hardcode trong template**

Các chuỗi cần thay (tra trong file rồi áp key tương ứng):
- `'Người dùng'` / `'Users'` → `t('admin.users')`
- `'Tài liệu'` → `t('admin.downloads')`
- `'Từ vựng'` → `t('admin.vocabulary')`
- `'Bài học'` → `t('admin.lessons')`
- `'Lưu'` / `'Tạo mới'` / `'Xóa'` → `t('admin.save')` / `t('admin.create')` / `t('admin.delete')`
- `'Đang tải...'` → `t('admin.loading')`

- [ ] **Bước 3: Commit**

```bash
git add frontend/src/views/AdminView.vue
git commit -m "feat: AdminView dùng i18n"
```

---

## Task 14: Build kiểm tra cuối cùng

- [ ] **Bước 1: Build production**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Kết quả mong đợi: `✓ built in X.XXs` không có lỗi.

- [ ] **Bước 2: Commit cuối**

```bash
git add -A
git commit -m "feat: hoàn thiện i18n EN/ZH/VI cho toàn bộ app"
```

---

*Spec: `docs/superpowers/specs/2026-06-11-i18n-design.md`*
