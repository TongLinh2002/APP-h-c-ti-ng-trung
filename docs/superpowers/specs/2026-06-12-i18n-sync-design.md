# I18n Sync — Đồng bộ chuyển đổi ngôn ngữ toàn trang

**Date:** 2026-06-12  
**Status:** Approved

## Mục tiêu

Tất cả text hiển thị trên giao diện phải phản ánh ngôn ngữ đang được chọn (EN / VI / ZH). Hiện tại một số chuỗi vẫn hardcode tiếng Việt, khiến chúng không thay đổi khi người dùng chuyển sang English hoặc 中文.

## Phạm vi thay đổi

### 1. File ngôn ngữ — thêm keys mới (en.js / vi.js / zh.js)

| Key | VI | EN | ZH |
|-----|----|----|-----|
| `home.greeting` | `Xin chào, {name}!` | `Hello, {name}!` | `你好，{name}！` |
| `home.greetingDefault` | `bạn` | `there` | `同学` |
| `home.hskDesc` | `Đề thi HSK 1–9` | `HSK 1–9 Exams` | `HSK 1–9 考试` |
| `home.hskkDesc` | `Đề thi nói HSKK` | `HSKK Speaking Exams` | `HSKK 口语考试` |
| `exam.examsCount` | `{n} đề thi` | `{n} exams` | `{n} 套试卷` |
| `exam.listeningSection` | `🎵 Phần nghe` | `🎵 Listening` | `🎵 听力部分` |
| `exam.noAudio` | `Chưa có file audio` | `No audio file` | `暂无音频文件` |
| `exam.questionCount` | `{n} câu hỏi cho phần này` | `{n} questions in this section` | `本部分共 {n} 题` |
| `exam.fillPlaceholder` | `Nhập câu trả lời...` | `Enter your answer...` | `请输入答案...` |
| `exam.essayPlaceholder` | `Viết bài luận của bạn tại đây...` | `Write your essay here...` | `请在此处写作...` |
| `exam.submitting` | `Đang nộp...` | `Submitting...` | `提交中...` |

### 2. HomeView.vue

- Lời chào: thay `"Xin chào, {name} || 'bạn'"` bằng `$t('home.greeting', { name: ... || $t('home.greetingDefault') })`
- Card HSK: thay `"Đề thi HSK 1–9"` bằng `$t('home.hskDesc')`
- Card HSKK: thay `"Đề thi nói HSKK"` bằng `$t('home.hskkDesc')`
- Thêm `useI18n` import vào `<script setup>`

### 3. HskView.vue và HskkView.vue

- Thay `{{ byLevel(level).length }} đề thi` bằng `$t('exam.examsCount', { n: byLevel(level).length })`
- Không cần thêm `useI18n` vì chỉ dùng `$t` trong template

### 4. ExamTaker.vue

- `🎵 Phần nghe` → `$t('exam.listeningSection')`
- `Chưa có file audio` → `$t('exam.noAudio')`
- `{n} câu hỏi cho phần này` → `$t('exam.questionCount', { n: section.questions.length })`
- placeholder `Nhập câu trả lời...` → `:placeholder="$t('exam.fillPlaceholder')"`
- placeholder `Viết bài luận...` → `:placeholder="$t('exam.essayPlaceholder')"`
- `'Đang nộp...'` inline → `t('exam.submitting')`

### 5. DashboardView.vue

- Thay `toLocaleDateString('vi', { weekday: 'short' })` bằng `toLocaleDateString(locale.value, { weekday: 'short' })`
- Thêm `locale` vào destructure của `useI18n()`

## Files bị ảnh hưởng

```
frontend/src/i18n/en.js
frontend/src/i18n/vi.js
frontend/src/i18n/zh.js
frontend/src/views/HomeView.vue
frontend/src/views/HskView.vue
frontend/src/views/HskkView.vue
frontend/src/components/ExamTaker.vue
frontend/src/views/DashboardView.vue
```

## Không thay đổi

- Tên đề thi (`exam.title`) — đây là dữ liệu từ database, không phải UI text
- Cấu trúc `LanguageSwitcher.vue` — đã hoạt động đúng
- Logic lưu/đọc locale từ localStorage — đã đúng
