# HSK / HSKK Exam System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Nghe" and "Đọc" nav tabs with a full HSK/HSKK timed exam system where admins create multi-section exam papers and users take them online with auto-grading.

**Architecture:** 4 new Sequelize models (Exam → ExamSection → ExamQuestion, UserExamResult) auto-synced via `sequelize.sync()`. New `examController.js` + `exam.js` route for user-facing API; exam admin CRUD in `examAdminController.js` wired into existing `admin.js` router. Two thin frontend view wrappers (HskView, HskkView) share a single `ExamTaker.vue` component.

**Tech Stack:** Node.js / Express 5, Sequelize + MySQL, Vue 3 (Composition API), Pinia (not needed — state is local), Vite

---

## File Map

| Action | File | Role |
|--------|------|------|
| Create | `backend/src/models/Exam.js` | Exam metadata model |
| Create | `backend/src/models/ExamSection.js` | Section model (listening/reading/fill) |
| Create | `backend/src/models/ExamQuestion.js` | Question model |
| Create | `backend/src/models/UserExamResult.js` | User submission result model |
| Modify | `backend/src/models/index.js` | Register + associate 4 new models |
| Create | `backend/src/controllers/examController.js` | User routes: list, get, submit |
| Create | `backend/src/routes/exam.js` | Mount user exam routes |
| Modify | `backend/app.js` | Mount `/api/exams` route |
| Create | `backend/src/controllers/examAdminController.js` | Admin CRUD for exams/sections/questions |
| Modify | `backend/src/routes/admin.js` | Add exam admin routes |
| Modify | `frontend/src/i18n/vi.js` | Add hsk/hskk/exam keys, rename nav.listen/read |
| Modify | `frontend/src/i18n/en.js` | Same for English |
| Modify | `frontend/src/i18n/zh.js` | Same for Chinese |
| Modify | `frontend/src/router/index.js` | `/listen`→`/hsk`, `/read`→`/hskk` |
| Modify | `frontend/src/App.vue` | Update nav links |
| Delete | `frontend/src/views/ListenView.vue` | No longer used |
| Delete | `frontend/src/views/ReadView.vue` | No longer used |
| Create | `frontend/src/services/examService.js` | API calls for exam feature |
| Create | `frontend/src/components/ExamTaker.vue` | Timer + sections + submit + result |
| Create | `frontend/src/views/HskView.vue` | HSK exam list + taker |
| Create | `frontend/src/views/HskkView.vue` | HSKK exam list + taker |
| Modify | `frontend/src/views/AdminView.vue` | Add "Đề thi" tab |

---

### Task 1: Four Sequelize models

**Files:**
- Create: `backend/src/models/Exam.js`
- Create: `backend/src/models/ExamSection.js`
- Create: `backend/src/models/ExamQuestion.js`
- Create: `backend/src/models/UserExamResult.js`

- [ ] **Step 1: Create `backend/src/models/Exam.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Exam = sequelize.define('Exam', {
  title:               { type: DataTypes.STRING,  allowNull: false },
  exam_type:           { type: DataTypes.ENUM('hsk', 'hskk'), allowNull: false },
  hsk_level:           { type: DataTypes.TINYINT, allowNull: false },
  time_limit_minutes:  { type: DataTypes.TINYINT, allowNull: false },
  description:         { type: DataTypes.TEXT },
})

module.exports = Exam
```

- [ ] **Step 2: Create `backend/src/models/ExamSection.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamSection = sequelize.define('ExamSection', {
  exam_id:     { type: DataTypes.INTEGER, allowNull: false },
  title:       { type: DataTypes.STRING,  allowNull: false },
  type:        { type: DataTypes.ENUM('listening', 'reading', 'fill'), allowNull: false },
  order_index: { type: DataTypes.TINYINT, defaultValue: 0 },
  audio_url:   { type: DataTypes.STRING },
  passage:     { type: DataTypes.TEXT },
})

module.exports = ExamSection
```

- [ ] **Step 3: Create `backend/src/models/ExamQuestion.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamQuestion = sequelize.define('ExamQuestion', {
  section_id:     { type: DataTypes.INTEGER, allowNull: false },
  order_index:    { type: DataTypes.TINYINT, defaultValue: 0 },
  question_text:  { type: DataTypes.TEXT,    allowNull: false },
  options:        { type: DataTypes.JSON },
  correct_answer: { type: DataTypes.STRING(255), allowNull: false },
  points:         { type: DataTypes.TINYINT, defaultValue: 1 },
})

module.exports = ExamQuestion
```

- [ ] **Step 4: Create `backend/src/models/UserExamResult.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserExamResult = sequelize.define('UserExamResult', {
  user_id:            { type: DataTypes.INTEGER,  allowNull: false },
  exam_id:            { type: DataTypes.INTEGER,  allowNull: false },
  score:              { type: DataTypes.SMALLINT, allowNull: false },
  max_score:          { type: DataTypes.SMALLINT, allowNull: false },
  answers:            { type: DataTypes.JSON,     allowNull: false },
  time_taken_seconds: { type: DataTypes.SMALLINT },
  submitted_at:       { type: DataTypes.DATE,     allowNull: false },
})

module.exports = UserExamResult
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/Exam.js backend/src/models/ExamSection.js backend/src/models/ExamQuestion.js backend/src/models/UserExamResult.js
git commit -m "feat(exam): add 4 Sequelize models — Exam, ExamSection, ExamQuestion, UserExamResult"
```

---

### Task 2: Register models and associations in index.js

**Files:**
- Modify: `backend/src/models/index.js`

- [ ] **Step 1: Replace the full content of `backend/src/models/index.js`**

```js
const User = require('./User')
const Vocabulary = require('./Vocabulary')
const UserVocabularyProgress = require('./UserVocabularyProgress')
const Lesson = require('./Lesson')
const LessonQuestion = require('./LessonQuestion')
const UserLessonHistory = require('./UserLessonHistory')
const UserChallengeScore = require('./UserChallengeScore')
const Download = require('./Download')
const Exam = require('./Exam')
const ExamSection = require('./ExamSection')
const ExamQuestion = require('./ExamQuestion')
const UserExamResult = require('./UserExamResult')

User.hasMany(UserVocabularyProgress, { foreignKey: 'user_id' })
Vocabulary.hasMany(UserVocabularyProgress, { foreignKey: 'vocabulary_id' })
UserVocabularyProgress.belongsTo(User, { foreignKey: 'user_id' })
UserVocabularyProgress.belongsTo(Vocabulary, { foreignKey: 'vocabulary_id' })

Lesson.hasMany(LessonQuestion, { foreignKey: 'lesson_id', as: 'questions' })
LessonQuestion.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' })

User.hasMany(UserLessonHistory, { foreignKey: 'user_id' })
Lesson.hasMany(UserLessonHistory, { foreignKey: 'lesson_id' })
UserLessonHistory.belongsTo(User, { foreignKey: 'user_id' })
UserLessonHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' })

User.hasMany(UserChallengeScore, { foreignKey: 'user_id' })
UserChallengeScore.belongsTo(User, { foreignKey: 'user_id' })

Exam.hasMany(ExamSection, { foreignKey: 'exam_id', as: 'sections', onDelete: 'CASCADE', hooks: true })
ExamSection.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' })
ExamSection.hasMany(ExamQuestion, { foreignKey: 'section_id', as: 'questions', onDelete: 'CASCADE', hooks: true })
ExamQuestion.belongsTo(ExamSection, { foreignKey: 'section_id', as: 'section' })
User.hasMany(UserExamResult, { foreignKey: 'user_id' })
UserExamResult.belongsTo(User, { foreignKey: 'user_id' })
Exam.hasMany(UserExamResult, { foreignKey: 'exam_id' })
UserExamResult.belongsTo(Exam, { foreignKey: 'exam_id' })

module.exports = {
  User, Vocabulary, UserVocabularyProgress,
  Lesson, LessonQuestion, UserLessonHistory,
  UserChallengeScore, Download,
  Exam, ExamSection, ExamQuestion, UserExamResult,
}
```

- [ ] **Step 2: Verify backend starts and creates tables**

```bash
cd backend
node app.js
```

Expected: server starts on port 3000, no errors. MySQL should now have `Exams`, `ExamSections`, `ExamQuestions`, `UserExamResults` tables (Sequelize creates them via `sync()`).

Stop the server with Ctrl+C after verifying.

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/index.js
git commit -m "feat(exam): register exam models + associations in index.js"
```

---

### Task 3: User-facing exam controller

**Files:**
- Create: `backend/src/controllers/examController.js`

- [ ] **Step 1: Create `backend/src/controllers/examController.js`**

```js
const { Exam, ExamSection, ExamQuestion, UserExamResult } = require('../models')

async function listExams(req, res) {
  const { type, hsk_level } = req.query
  const where = {}
  if (type) where.exam_type = type
  if (hsk_level) where.hsk_level = parseInt(hsk_level)
  const exams = await Exam.findAll({
    where,
    attributes: ['id', 'title', 'exam_type', 'hsk_level', 'time_limit_minutes', 'description'],
    order: [['hsk_level', 'ASC'], ['createdAt', 'DESC']],
  })
  res.json(exams)
}

async function getExam(req, res) {
  const exam = await Exam.findByPk(req.params.id, {
    include: [{
      model: ExamSection,
      as: 'sections',
      include: [{
        model: ExamQuestion,
        as: 'questions',
        attributes: ['id', 'order_index', 'question_text', 'options', 'points'],
        // correct_answer intentionally excluded — sent only after submit
      }],
    }],
    order: [
      [{ model: ExamSection, as: 'sections' }, 'order_index', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, { model: ExamQuestion, as: 'questions' }, 'order_index', 'ASC'],
    ],
  })
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  res.json(exam)
}

async function submitExam(req, res) {
  const { answers, time_taken_seconds } = req.body
  const examId = parseInt(req.params.id)
  const userId = req.userId

  if (!Array.isArray(answers)) return res.status(400).json({ message: 'answers là bắt buộc' })

  const sections = await ExamSection.findAll({
    where: { exam_id: examId },
    include: [{ model: ExamQuestion, as: 'questions' }],
  })

  const questionMap = {}
  sections.forEach(s => s.questions.forEach(q => { questionMap[q.id] = q }))

  const maxScore = Object.values(questionMap).reduce((sum, q) => sum + q.points, 0)
  let score = 0

  const results = answers.map(({ question_id, answer }) => {
    const q = questionMap[question_id]
    if (!q) return { question_id, correct: false, correct_answer: null, user_answer: answer, points: 0 }
    const correct = q.correct_answer.trim().toLowerCase() === String(answer || '').trim().toLowerCase()
    if (correct) score += q.points
    return { question_id, correct, correct_answer: q.correct_answer, user_answer: answer, points: correct ? q.points : 0 }
  })

  await UserExamResult.create({
    user_id: userId,
    exam_id: examId,
    score,
    max_score: maxScore,
    answers,
    time_taken_seconds: time_taken_seconds || null,
    submitted_at: new Date(),
  })

  res.json({ score, max_score: maxScore, results })
}

module.exports = { listExams, getExam, submitExam }
```

- [ ] **Step 2: Create `backend/src/routes/exam.js`**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const ctrl = require('../controllers/examController')

router.get('/',     ctrl.listExams)
router.get('/:id',  ctrl.getExam)
router.post('/:id/submit', verifyToken, ctrl.submitExam)

module.exports = router
```

- [ ] **Step 3: Mount the route in `backend/app.js`**

Add after the existing `require` lines and before the route registrations:

```js
const examRoutes = require('./src/routes/exam')
```

Add after `app.use('/api/challenge', challengeRoutes)`:

```js
app.use('/api/exams', examRoutes)
```

- [ ] **Step 4: Manual test — GET /api/exams**

```bash
cd backend && node app.js
```

In another terminal:
```bash
curl http://localhost:3000/api/exams
```

Expected: `[]` (empty array — no exams yet). No 500 error.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/examController.js backend/src/routes/exam.js backend/app.js
git commit -m "feat(exam): user-facing exam routes — list, get, submit"
```

---

### Task 4: Admin exam controller

**Files:**
- Create: `backend/src/controllers/examAdminController.js`
- Modify: `backend/src/routes/admin.js`

- [ ] **Step 1: Create `backend/src/controllers/examAdminController.js`**

```js
const { Exam, ExamSection, ExamQuestion } = require('../models')

async function adminListExams(req, res) {
  const exams = await Exam.findAll({
    include: [{
      model: ExamSection,
      as: 'sections',
      include: [{ model: ExamQuestion, as: 'questions' }],
    }],
    order: [
      ['hsk_level', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, 'order_index', 'ASC'],
      [{ model: ExamSection, as: 'sections' }, { model: ExamQuestion, as: 'questions' }, 'order_index', 'ASC'],
    ],
  })
  res.json(exams)
}

async function createExam(req, res) {
  const { title, exam_type, hsk_level, time_limit_minutes, description } = req.body
  if (!title || !exam_type || !hsk_level || !time_limit_minutes)
    return res.status(400).json({ message: 'Thiếu: title, exam_type, hsk_level, time_limit_minutes' })
  const exam = await Exam.create({
    title, exam_type,
    hsk_level: parseInt(hsk_level),
    time_limit_minutes: parseInt(time_limit_minutes),
    description: description || null,
  })
  res.status(201).json(exam)
}

async function updateExam(req, res) {
  const exam = await Exam.findByPk(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  const { title, exam_type, hsk_level, time_limit_minutes, description } = req.body
  await exam.update({
    title, exam_type,
    hsk_level: parseInt(hsk_level),
    time_limit_minutes: parseInt(time_limit_minutes),
    description: description || null,
  })
  res.json(exam)
}

async function deleteExam(req, res) {
  const exam = await Exam.findByPk(req.params.id)
  if (!exam) return res.status(404).json({ message: 'Không tìm thấy đề thi' })
  await exam.destroy()
  res.json({ message: 'Đã xóa đề thi' })
}

async function createSection(req, res) {
  const { title, type, order_index, passage } = req.body
  if (!title || !type) return res.status(400).json({ message: 'Thiếu: title, type' })
  const audio_url = req.file ? `/uploads/${req.file.filename}` : (req.body.audio_url || null)
  const section = await ExamSection.create({
    exam_id: parseInt(req.params.id),
    title, type,
    order_index: parseInt(order_index) || 0,
    audio_url,
    passage: passage || null,
  })
  res.status(201).json(section)
}

async function updateSection(req, res) {
  const section = await ExamSection.findByPk(req.params.sid)
  if (!section) return res.status(404).json({ message: 'Không tìm thấy phần thi' })
  const { title, type, order_index, passage } = req.body
  const audio_url = req.file ? `/uploads/${req.file.filename}` : (req.body.audio_url || section.audio_url)
  await section.update({ title, type, order_index: parseInt(order_index) || 0, audio_url, passage: passage || null })
  res.json(section)
}

async function deleteSection(req, res) {
  const section = await ExamSection.findByPk(req.params.sid)
  if (!section) return res.status(404).json({ message: 'Không tìm thấy phần thi' })
  await section.destroy()
  res.json({ message: 'Đã xóa phần thi' })
}

async function createQuestion(req, res) {
  const { question_text, options, correct_answer, points, order_index } = req.body
  if (!question_text || correct_answer === undefined || correct_answer === '')
    return res.status(400).json({ message: 'Thiếu: question_text, correct_answer' })
  const question = await ExamQuestion.create({
    section_id: parseInt(req.params.sid),
    question_text,
    options: options || null,
    correct_answer: String(correct_answer),
    points: parseInt(points) || 1,
    order_index: parseInt(order_index) || 0,
  })
  res.status(201).json(question)
}

async function updateQuestion(req, res) {
  const question = await ExamQuestion.findByPk(req.params.qid)
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' })
  const { question_text, options, correct_answer, points, order_index } = req.body
  await question.update({
    question_text,
    options: options || null,
    correct_answer: String(correct_answer),
    points: parseInt(points) || 1,
    order_index: parseInt(order_index) || 0,
  })
  res.json(question)
}

async function deleteQuestion(req, res) {
  const question = await ExamQuestion.findByPk(req.params.qid)
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi' })
  await question.destroy()
  res.json({ message: 'Đã xóa câu hỏi' })
}

module.exports = {
  adminListExams, createExam, updateExam, deleteExam,
  createSection, updateSection, deleteSection,
  createQuestion, updateQuestion, deleteQuestion,
}
```

- [ ] **Step 2: Add exam admin routes to `backend/src/routes/admin.js`**

Add at the top after the existing `require` for `ctrl`:

```js
const examCtrl = require('../controllers/examAdminController')
```

Add at the bottom, before `module.exports = router`:

```js
// Exam admin routes
router.get('/exams',                              examCtrl.adminListExams)
router.post('/exams',                             examCtrl.createExam)
router.put('/exams/:id',                          examCtrl.updateExam)
router.delete('/exams/:id',                       examCtrl.deleteExam)
router.post('/exams/:id/sections',   uploadSingle, examCtrl.createSection)
router.put('/exams/sections/:sid',   uploadSingle, examCtrl.updateSection)
router.delete('/exams/sections/:sid',              examCtrl.deleteSection)
router.post('/exams/sections/:sid/questions',      examCtrl.createQuestion)
router.put('/exams/questions/:qid',                examCtrl.updateQuestion)
router.delete('/exams/questions/:qid',             examCtrl.deleteQuestion)
```

- [ ] **Step 3: Manual test — create an exam**

With backend running (`node app.js`):

```bash
curl -X POST http://localhost:3000/api/admin/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"title":"Đề HSK 1 thử nghiệm","exam_type":"hsk","hsk_level":1,"time_limit_minutes":90}'
```

Expected: `201` with exam object including `id`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/examAdminController.js backend/src/routes/admin.js
git commit -m "feat(exam): admin CRUD — exams, sections, questions"
```

---

### Task 5: Frontend i18n + router + nav changes

**Files:**
- Modify: `frontend/src/i18n/vi.js`
- Modify: `frontend/src/i18n/en.js`
- Modify: `frontend/src/i18n/zh.js`
- Modify: `frontend/src/router/index.js`
- Modify: `frontend/src/App.vue`
- Delete: `frontend/src/views/ListenView.vue`
- Delete: `frontend/src/views/ReadView.vue`

- [ ] **Step 1: Update `frontend/src/i18n/vi.js`**

Change the `nav` section — replace `listen` and `read` keys with `hsk` and `hskk`:

```js
nav: {
  home: 'Trang chủ', journey: 'Hành trình', learn: 'Học từ',
  challenge: 'Thử thách', hsk: 'HSK', hskk: 'HSKK',
  resources: 'Tài liệu', dashboard: 'Tiến độ',
  admin: 'Quản trị', logout: 'Đăng xuất', login: 'Đăng nhập',
},
```

Add an `exam` section at the end of the object (before the closing `}`):

```js
exam: {
  hskTitle: 'Đề thi HSK',
  hskkTitle: 'Đề thi HSKK',
  filterLevel: 'Cấp HSK:',
  loading: 'Đang tải...',
  empty: 'Chưa có đề thi cho cấp này.',
  minutes: 'phút',
  start: 'Bắt đầu làm',
  timeLeft: 'Thời gian còn lại:',
  section: 'Phần',
  submit: 'Nộp bài',
  confirmSubmit: 'Xác nhận nộp bài? Bạn chưa thể chỉnh sửa sau khi nộp.',
  result: 'Kết quả',
  score: 'Điểm:',
  yourAnswer: 'Bạn chọn:',
  correctAnswer: 'Đáp án đúng:',
  noAnswer: '(Không trả lời)',
  retry: 'Làm lại',
  backToList: 'Chọn đề khác',
  types: { listening: 'Nghe', reading: 'Đọc', fill: 'Điền từ' },
},
```

- [ ] **Step 2: Update `frontend/src/i18n/en.js`**

Change `nav.listen` → `hsk: 'HSK'`, `nav.read` → `hskk: 'HSKK'`.

Add `exam` section:

```js
exam: {
  hskTitle: 'HSK Exams',
  hskkTitle: 'HSKK Exams',
  filterLevel: 'HSK Level:',
  loading: 'Loading...',
  empty: 'No exams for this level.',
  minutes: 'min',
  start: 'Start Exam',
  timeLeft: 'Time left:',
  section: 'Section',
  submit: 'Submit',
  confirmSubmit: 'Submit exam? You cannot edit answers after submitting.',
  result: 'Results',
  score: 'Score:',
  yourAnswer: 'Your answer:',
  correctAnswer: 'Correct answer:',
  noAnswer: '(No answer)',
  retry: 'Retry',
  backToList: 'Choose Another',
  types: { listening: 'Listening', reading: 'Reading', fill: 'Fill in Blank' },
},
```

- [ ] **Step 3: Update `frontend/src/i18n/zh.js`**

Change `nav.listen` → `hsk: 'HSK'`, `nav.read` → `hskk: 'HSKK'`.

Add `exam` section:

```js
exam: {
  hskTitle: 'HSK考试',
  hskkTitle: 'HSKK考试',
  filterLevel: 'HSK级别:',
  loading: '加载中...',
  empty: '该级别暂无考题。',
  minutes: '分钟',
  start: '开始考试',
  timeLeft: '剩余时间:',
  section: '部分',
  submit: '提交',
  confirmSubmit: '确认提交？提交后无法修改。',
  result: '考试结果',
  score: '得分:',
  yourAnswer: '您的答案:',
  correctAnswer: '正确答案:',
  noAnswer: '(未作答)',
  retry: '重新考试',
  backToList: '选择其他考题',
  types: { listening: '听力', reading: '阅读', fill: '填空' },
},
```

- [ ] **Step 4: Update `frontend/src/router/index.js`**

Replace the `/listen` and `/read` route lines:

```js
{ path: '/hsk',   component: () => import('../views/HskView.vue'),   meta: { requiresAuth: true } },
{ path: '/hskk',  component: () => import('../views/HskkView.vue'),  meta: { requiresAuth: true } },
```

Remove these two lines:
```js
{ path: '/listen', component: () => import('../views/ListenView.vue'), meta: { requiresAuth: true } },
{ path: '/read',   component: () => import('../views/ReadView.vue'),   meta: { requiresAuth: true } },
```

- [ ] **Step 5: Update nav links in `frontend/src/App.vue`**

Replace:
```html
<RouterLink to="/listen">{{ $t('nav.listen') }}</RouterLink>
<RouterLink to="/read">{{ $t('nav.read') }}</RouterLink>
```

With:
```html
<RouterLink to="/hsk">{{ $t('nav.hsk') }}</RouterLink>
<RouterLink to="/hskk">{{ $t('nav.hskk') }}</RouterLink>
```

- [ ] **Step 6: Delete old views**

```bash
rm frontend/src/views/ListenView.vue
rm frontend/src/views/ReadView.vue
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/i18n/vi.js frontend/src/i18n/en.js frontend/src/i18n/zh.js
git add frontend/src/router/index.js frontend/src/App.vue
git rm frontend/src/views/ListenView.vue frontend/src/views/ReadView.vue
git commit -m "feat(exam): rename nav Nghe→HSK, Đọc→HSKK; update router + i18n"
```

---

### Task 6: examService.js

**Files:**
- Create: `frontend/src/services/examService.js`

- [ ] **Step 1: Create `frontend/src/services/examService.js`**

```js
import api from './api'

export async function listExams(type, hsk_level) {
  const res = await api.get('/exams', { params: { type, hsk_level } })
  return res.data
}

export async function getExam(id) {
  const res = await api.get(`/exams/${id}`)
  return res.data
}

export async function submitExam(id, answers, time_taken_seconds) {
  const res = await api.post(`/exams/${id}/submit`, { answers, time_taken_seconds })
  return res.data
}

export async function adminListExams() {
  const res = await api.get('/admin/exams')
  return res.data
}

export async function adminCreateExam(data) {
  const res = await api.post('/admin/exams', data)
  return res.data
}

export async function adminDeleteExam(id) {
  await api.delete(`/admin/exams/${id}`)
}

export async function adminCreateSection(examId, formData) {
  const res = await api.post(`/admin/exams/${examId}/sections`, formData)
  return res.data
}

export async function adminDeleteSection(sid) {
  await api.delete(`/admin/exams/sections/${sid}`)
}

export async function adminCreateQuestion(sid, data) {
  const res = await api.post(`/admin/exams/sections/${sid}/questions`, data)
  return res.data
}

export async function adminDeleteQuestion(qid) {
  await api.delete(`/admin/exams/questions/${qid}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/examService.js
git commit -m "feat(exam): add examService.js with user + admin API calls"
```

---

### Task 7: ExamTaker.vue — the core exam component

**Files:**
- Create: `frontend/src/components/ExamTaker.vue`

This component receives an `exam` prop (full object with sections + questions), shows a countdown timer, renders each section by type, collects answers, and submits. After submit it shows the result screen.

- [ ] **Step 1: Create `frontend/src/components/ExamTaker.vue`**

```vue
<template>
  <div class="exam-taker">
    <!-- Header: title + timer -->
    <div class="exam-header">
      <h3>{{ exam.title }}</h3>
      <div class="timer" :class="{ warning: timeLeft <= 60 }">
        ⏱ {{ formattedTime }}
      </div>
    </div>

    <!-- Result screen -->
    <div v-if="result" class="result-screen">
      <p class="result-title">{{ $t('exam.result') }}</p>
      <p class="result-score">{{ $t('exam.score') }} <strong>{{ result.score }}/{{ result.max_score }}</strong></p>

      <div v-for="section in exam.sections" :key="section.id" class="result-section">
        <h4>{{ section.title }}</h4>
        <div v-for="q in section.questions" :key="q.id" class="result-row">
          <p class="rq-text">{{ q.question_text }}</p>
          <div class="rq-answers">
            <template v-if="findResult(q.id)">
              <span :class="findResult(q.id).correct ? 'ans-correct' : 'ans-wrong'">
                {{ findResult(q.id).correct ? '✓' : '✗' }}
                {{ $t('exam.yourAnswer') }}
                {{ displayAnswer(q, findResult(q.id).user_answer) }}
              </span>
              <span v-if="!findResult(q.id).correct" class="ans-correct-text">
                {{ $t('exam.correctAnswer') }}
                {{ displayAnswer(q, findResult(q.id).correct_answer) }}
              </span>
            </template>
            <span v-else class="ans-none">{{ $t('exam.noAnswer') }}</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" @click="$emit('back')">{{ $t('exam.backToList') }}</button>
        <button class="btn-primary" @click="retry">{{ $t('exam.retry') }}</button>
      </div>
    </div>

    <!-- Exam content -->
    <div v-else>
      <div v-for="section in exam.sections" :key="section.id" class="exam-section">
        <h4 class="section-title">
          <span class="section-type-badge">{{ $t(`exam.types.${section.type}`) }}</span>
          {{ section.title }}
        </h4>

        <!-- Listening: audio player -->
        <div v-if="section.type === 'listening' && section.audio_url" class="audio-block">
          <audio :src="section.audio_url" controls class="audio-player" />
        </div>

        <!-- Reading: passage -->
        <div v-if="section.type === 'reading' && section.passage" class="passage-block">
          <pre class="passage-text">{{ section.passage }}</pre>
        </div>

        <!-- Questions -->
        <div v-for="(q, qi) in section.questions" :key="q.id" class="question-block">
          <p class="q-text"><span class="q-num">{{ qi + 1 }}.</span> {{ q.question_text }}</p>

          <!-- Multiple choice -->
          <div v-if="q.options" class="options-list">
            <label v-for="(opt, i) in q.options" :key="i" class="option-label">
              <input
                type="radio"
                :name="`q${q.id}`"
                :value="String(i)"
                v-model="answers[q.id]"
              />
              <span>{{ ['A','B','C','D'][i] }}. {{ opt }}</span>
            </label>
          </div>

          <!-- Fill in blank -->
          <input
            v-else
            type="text"
            v-model="answers[q.id]"
            class="fill-input"
            placeholder="Nhập câu trả lời..."
          />
        </div>
      </div>

      <div class="submit-row">
        <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? 'Đang nộp...' : $t('exam.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { submitExam } from '../services/examService'

const props = defineProps({ exam: Object })
const emit = defineEmits(['back'])
const { t } = useI18n()

const answers = ref({})
const result = ref(null)
const submitting = ref(false)
const timeLeft = ref(props.exam.time_limit_minutes * 60)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      doSubmit()
    }
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function handleSubmit() {
  if (!confirm(t('exam.confirmSubmit'))) return
  doSubmit()
}

async function doSubmit() {
  clearInterval(timer)
  submitting.value = true
  const timeTaken = props.exam.time_limit_minutes * 60 - timeLeft.value
  const answerList = Object.entries(answers.value).map(([question_id, answer]) => ({
    question_id: parseInt(question_id),
    answer,
  }))
  try {
    result.value = await submitExam(props.exam.id, answerList, timeTaken)
  } finally {
    submitting.value = false
  }
}

function retry() {
  result.value = null
  answers.value = {}
  timeLeft.value = props.exam.time_limit_minutes * 60
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { clearInterval(timer); doSubmit() }
  }, 1000)
}

function findResult(questionId) {
  return result.value?.results?.find(r => r.question_id === questionId)
}

function displayAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === '') return t('exam.noAnswer')
  if (question.options) {
    const idx = parseInt(answer)
    return `${['A','B','C','D'][idx]}. ${question.options[idx] || answer}`
  }
  return answer
}
</script>

<style scoped>
.exam-taker { max-width: 800px; margin: 0 auto; }
.exam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 16px 20px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 10; }
.exam-header h3 { font-size: 1.1rem; color: #333; }
.timer { font-size: 1.2rem; font-weight: 700; color: #1565c0; }
.timer.warning { color: #d32f2f; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
.exam-section { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
.section-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-type-badge { background: #d32f2f; color: white; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; }
.audio-block { margin-bottom: 16px; }
.audio-player { width: 100%; }
.passage-block { background: #f9f9f9; border-left: 3px solid #d32f2f; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }
.passage-text { white-space: pre-wrap; font-family: inherit; line-height: 1.8; font-size: 1rem; }
.question-block { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.question-block:last-child { border-bottom: none; }
.q-text { margin-bottom: 10px; font-size: 0.95rem; line-height: 1.5; }
.q-num { color: #d32f2f; font-weight: 700; margin-right: 4px; }
.options-list { display: flex; flex-direction: column; gap: 8px; }
.option-label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 12px; border: 1px solid #eee; border-radius: 6px; transition: background 0.1s; }
.option-label:hover { background: #fff5f5; }
.option-label input { accent-color: #d32f2f; }
.fill-input { width: 100%; max-width: 340px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
.submit-row { text-align: center; padding: 24px 0; }
.btn-submit { padding: 14px 48px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Result screen */
.result-screen { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.result-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 8px; }
.result-score { font-size: 1.8rem; font-weight: 700; color: #d32f2f; margin-bottom: 24px; }
.result-section { margin-bottom: 20px; }
.result-section h4 { font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #555; }
.result-row { padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.result-row:last-child { border-bottom: none; }
.rq-text { font-size: 0.9rem; color: #555; margin-bottom: 4px; }
.rq-answers { font-size: 0.9rem; display: flex; flex-direction: column; gap: 2px; }
.ans-correct { color: #2e7d32; font-weight: 600; }
.ans-wrong { color: #c62828; }
.ans-correct-text { color: #2e7d32; }
.ans-none { color: #aaa; }
.result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 12px 28px; background: white; color: #d32f2f; border: 2px solid #d32f2f; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ExamTaker.vue
git commit -m "feat(exam): ExamTaker.vue — timer, sections, submit, result screen"
```

---

### Task 8: HskView.vue and HskkView.vue

**Files:**
- Create: `frontend/src/views/HskView.vue`
- Create: `frontend/src/views/HskkView.vue`

Both views share the same pattern: level filter → exam list → ExamTaker. The only difference is `examType`.

- [ ] **Step 1: Create `frontend/src/views/HskView.vue`**

```vue
<template>
  <div class="exam-view">
    <h2>📋 {{ $t('exam.hskTitle') }}</h2>

    <div v-if="!activeExam">
      <div class="filter-bar">
        <label>{{ $t('exam.filterLevel') }}
          <select v-model="selectedLevel" @change="load">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>

      <div v-if="loading" class="empty">{{ $t('exam.loading') }}</div>
      <div v-else-if="!exams.length" class="empty">{{ $t('exam.empty') }}</div>
      <ul v-else class="exam-list">
        <li v-for="exam in exams" :key="exam.id" class="exam-card">
          <div class="exam-info">
            <span class="exam-title">{{ exam.title }}</span>
            <span class="exam-meta">{{ exam.time_limit_minutes }} {{ $t('exam.minutes') }}</span>
          </div>
          <button class="btn-start" @click="open(exam.id)">{{ $t('exam.start') }}</button>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="activeExam = null">← {{ $t('exam.backToList') }}</button>
      <ExamTaker :exam="activeExam" @back="activeExam = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ExamTaker from '../components/ExamTaker.vue'
import { listExams, getExam } from '../services/examService'

const selectedLevel = ref(1)
const exams = ref([])
const loading = ref(false)
const activeExam = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  exams.value = await listExams('hsk', selectedLevel.value)
  loading.value = false
}

async function open(id) {
  activeExam.value = await getExam(id)
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.filter-bar { margin-bottom: 16px; }
.filter-bar select { margin-left: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.exam-list { list-style: none; }
.exam-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.exam-info { display: flex; flex-direction: column; gap: 4px; }
.exam-title { font-weight: 600; font-size: 1rem; }
.exam-meta { font-size: 0.85rem; color: #888; }
.btn-start { padding: 10px 24px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-back { background: none; border: none; color: #d32f2f; cursor: pointer; margin-bottom: 16px; font-size: 0.95rem; }
.empty { color: #888; padding: 20px 0; }
</style>
```

- [ ] **Step 2: Create `frontend/src/views/HskkView.vue`**

Identical to HskView.vue with two changes — `listExams('hskk', ...)` and `$t('exam.hskkTitle')`:

```vue
<template>
  <div class="exam-view">
    <h2>📋 {{ $t('exam.hskkTitle') }}</h2>

    <div v-if="!activeExam">
      <div class="filter-bar">
        <label>{{ $t('exam.filterLevel') }}
          <select v-model="selectedLevel" @change="load">
            <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
          </select>
        </label>
      </div>

      <div v-if="loading" class="empty">{{ $t('exam.loading') }}</div>
      <div v-else-if="!exams.length" class="empty">{{ $t('exam.empty') }}</div>
      <ul v-else class="exam-list">
        <li v-for="exam in exams" :key="exam.id" class="exam-card">
          <div class="exam-info">
            <span class="exam-title">{{ exam.title }}</span>
            <span class="exam-meta">{{ exam.time_limit_minutes }} {{ $t('exam.minutes') }}</span>
          </div>
          <button class="btn-start" @click="open(exam.id)">{{ $t('exam.start') }}</button>
        </li>
      </ul>
    </div>

    <div v-else>
      <button class="btn-back" @click="activeExam = null">← {{ $t('exam.backToList') }}</button>
      <ExamTaker :exam="activeExam" @back="activeExam = null" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ExamTaker from '../components/ExamTaker.vue'
import { listExams, getExam } from '../services/examService'

const selectedLevel = ref(1)
const exams = ref([])
const loading = ref(false)
const activeExam = ref(null)

onMounted(load)

async function load() {
  loading.value = true
  exams.value = await listExams('hskk', selectedLevel.value)
  loading.value = false
}

async function open(id) {
  activeExam.value = await getExam(id)
}
</script>

<style scoped>
h2 { margin-bottom: 20px; }
.filter-bar { margin-bottom: 16px; }
.filter-bar select { margin-left: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; }
.exam-list { list-style: none; }
.exam-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.exam-info { display: flex; flex-direction: column; gap: 4px; }
.exam-title { font-weight: 600; font-size: 1rem; }
.exam-meta { font-size: 0.85rem; color: #888; }
.btn-start { padding: 10px 24px; background: #d32f2f; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-back { background: none; border: none; color: #d32f2f; cursor: pointer; margin-bottom: 16px; font-size: 0.95rem; }
.empty { color: #888; padding: 20px 0; }
</style>
```

- [ ] **Step 3: Manual test — frontend**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`, log in, check nav shows "HSK" and "HSKK". Click "HSK" → empty exam list (no exams in DB yet). No console errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/HskView.vue frontend/src/views/HskkView.vue
git commit -m "feat(exam): HskView + HskkView — exam list + ExamTaker integration"
```

---

### Task 9: Admin "Đề thi" tab in AdminView.vue

**Files:**
- Modify: `frontend/src/views/AdminView.vue`

Add a "Đề thi" tab that lets admins create exams, add sections, and add questions.

- [ ] **Step 1: Add "exams" to the `tabs` array**

Find the `tabs` array (around line 250):

```js
const tabs = [
  { key: 'downloads', i18nKey: 'admin.downloads' },
  { key: 'vocabulary', i18nKey: 'admin.vocabulary' },
  { key: 'lessons', i18nKey: 'admin.lessons' },
  { key: 'users', i18nKey: 'admin.users' },
]
```

Replace with:

```js
const tabs = [
  { key: 'downloads', i18nKey: 'admin.downloads' },
  { key: 'vocabulary', i18nKey: 'admin.vocabulary' },
  { key: 'lessons', i18nKey: 'admin.lessons' },
  { key: 'exams', i18nKey: 'admin.exams' },
  { key: 'users', i18nKey: 'admin.users' },
]
```

- [ ] **Step 2: Add i18n key for the tab**

In `frontend/src/i18n/vi.js`, inside the `admin` object, add:

```js
exams: 'Đề thi',
```

In `frontend/src/i18n/en.js`, inside the `admin` object, add:

```js
exams: 'Exams',
```

In `frontend/src/i18n/zh.js`, inside the `admin` object, add:

```js
exams: '考试',
```

- [ ] **Step 3: Add exam state and functions to AdminView.vue `<script setup>`**

Add the following imports at the top of `<script setup>`:

```js
import {
  adminListExams, adminCreateExam, adminDeleteExam,
  adminCreateSection, adminDeleteSection,
  adminCreateQuestion, adminDeleteQuestion,
} from '../services/examService'
```

Add state and functions after the existing `loadLessons` section (before `onMounted`):

```js
// Exams
const exams = ref([])
const examMsg = ref(null)
const examForm = ref({ title: '', exam_type: 'hsk', hsk_level: 1, time_limit_minutes: 90, description: '' })
const expandedExam = ref(null)
const sectionForms = ref({})   // { [examId]: { title, type, order_index, passage, audioFile } }
const questionForms = ref({})  // { [sectionId]: { question_text, options: ['','','',''], correct_index: 0, correct_fill: '', fill_mode: false } }

async function loadExams() {
  exams.value = await adminListExams()
}

async function submitExamForm() {
  try {
    await adminCreateExam(examForm.value)
    examMsg.value = { type: 'success', text: 'Đã tạo đề thi!' }
    examForm.value = { title: '', exam_type: 'hsk', hsk_level: 1, time_limit_minutes: 90, description: '' }
    await loadExams()
  } catch (e) {
    examMsg.value = { type: 'error', text: e.response?.data?.message || 'Lỗi tạo đề' }
  }
  setTimeout(() => { examMsg.value = null }, 3000)
}

async function deleteExam(id) {
  if (!confirm(t('admin.confirmDelete'))) return
  await adminDeleteExam(id)
  await loadExams()
}

function toggleExam(id) {
  expandedExam.value = expandedExam.value === id ? null : id
  if (!sectionForms.value[id]) {
    sectionForms.value[id] = { title: '', type: 'listening', order_index: 0, passage: '', audioFile: null }
  }
}

async function submitSection(examId) {
  const f = sectionForms.value[examId]
  const fd = new FormData()
  fd.append('title', f.title)
  fd.append('type', f.type)
  fd.append('order_index', f.order_index)
  if (f.passage) fd.append('passage', f.passage)
  if (f.audioFile) fd.append('file', f.audioFile)
  await adminCreateSection(examId, fd)
  sectionForms.value[examId] = { title: '', type: 'listening', order_index: 0, passage: '', audioFile: null }
  await loadExams()
}

async function deleteSection(sid) {
  if (!confirm(t('admin.confirmDelete'))) return
  await adminDeleteSection(sid)
  await loadExams()
}

function initQuestionForm(sid, isFill) {
  questionForms.value[sid] = {
    question_text: '',
    options: ['', '', '', ''],
    correct_index: 0,
    correct_fill: '',
    fill_mode: isFill,
  }
}

async function submitQuestion(sid) {
  const f = questionForms.value[sid]
  const payload = {
    question_text: f.question_text,
    correct_answer: f.fill_mode ? f.correct_fill : String(f.correct_index),
    options: f.fill_mode ? null : f.options,
  }
  await adminCreateQuestion(sid, payload)
  delete questionForms.value[sid]
  await loadExams()
}

async function deleteQuestion(qid) {
  if (!confirm(t('admin.confirmDelete'))) return
  await adminDeleteQuestion(qid)
  await loadExams()
}
```

- [ ] **Step 4: Update `onMounted` to also load exams**

Find the `onMounted` block:

```js
onMounted(async () => {
  await Promise.all([loadDownloads(), loadVocab(), loadLessons(), loadUsers()])
})
```

Replace with:

```js
onMounted(async () => {
  await Promise.all([loadDownloads(), loadVocab(), loadLessons(), loadExams(), loadUsers()])
})
```

- [ ] **Step 5: Add the EXAMS tab panel in the template**

Add this block after the LESSONS tab panel (`</div>` closing the `v-if="activeTab === 'lessons'"` div) and before the USERS tab panel:

```html
<!-- EXAMS TAB -->
<div v-if="activeTab === 'exams'" class="panel">
  <h2>Đề thi</h2>

  <!-- Create exam form -->
  <form class="form-card" @submit.prevent="submitExamForm">
    <div class="form-row">
      <input v-model="examForm.title" placeholder="Tên đề thi *" required />
      <select v-model="examForm.exam_type" required>
        <option value="hsk">HSK</option>
        <option value="hskk">HSKK</option>
      </select>
      <select v-model="examForm.hsk_level" required>
        <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
      </select>
      <input v-model.number="examForm.time_limit_minutes" type="number" min="1" max="240" placeholder="Thời gian (phút) *" required style="width:150px" />
    </div>
    <input v-model="examForm.description" placeholder="Mô tả (tuỳ chọn)" />
    <button type="submit" class="btn-primary">+ Tạo đề thi</button>
  </form>
  <div v-if="examMsg" class="msg" :class="examMsg.type">{{ examMsg.text }}</div>

  <!-- Exam list -->
  <div v-for="exam in exams" :key="exam.id" class="exam-admin-card">
    <div class="exam-admin-header" @click="toggleExam(exam.id)">
      <span>
        <strong>{{ exam.title }}</strong>
        <span class="badge">{{ exam.exam_type.toUpperCase() }} {{ exam.hsk_level }}</span>
        <span class="badge-grey">{{ exam.time_limit_minutes }} phút</span>
      </span>
      <span>
        <span style="color:#888;font-size:0.85rem">{{ exam.sections?.length || 0 }} phần</span>
        <button class="btn-del" @click.stop="deleteExam(exam.id)">Xóa đề</button>
        <span style="margin-left:8px">{{ expandedExam === exam.id ? '▲' : '▼' }}</span>
      </span>
    </div>

    <!-- Expanded: sections -->
    <div v-if="expandedExam === exam.id" class="exam-admin-body">

      <!-- Add section form -->
      <div class="section-form">
        <h4>+ Thêm phần thi</h4>
        <div class="form-row">
          <input v-model="sectionForms[exam.id].title" placeholder="Tên phần *" />
          <select v-model="sectionForms[exam.id].type">
            <option value="listening">Nghe</option>
            <option value="reading">Đọc</option>
            <option value="fill">Điền từ</option>
          </select>
          <input v-model.number="sectionForms[exam.id].order_index" type="number" placeholder="Thứ tự" style="width:80px" />
        </div>
        <textarea
          v-if="sectionForms[exam.id].type === 'reading'"
          v-model="sectionForms[exam.id].passage"
          placeholder="Đoạn văn bài đọc..."
          rows="4"
        />
        <label v-if="sectionForms[exam.id].type === 'listening'" class="file-label">
          <input type="file" accept="audio/*" @change="e => sectionForms[exam.id].audioFile = e.target.files[0]" />
          {{ sectionForms[exam.id].audioFile?.name || 'Chọn file audio' }}
        </label>
        <button class="btn-primary" @click="submitSection(exam.id)" style="margin-top:8px">Thêm phần</button>
      </div>

      <!-- Existing sections -->
      <div v-for="section in exam.sections" :key="section.id" class="section-admin-card">
        <div class="section-admin-header">
          <strong>{{ section.title }}</strong>
          <span class="badge">{{ section.type }}</span>
          <button class="btn-del" @click="deleteSection(section.id)">Xóa phần</button>
        </div>

        <!-- Questions list -->
        <div v-for="q in section.questions" :key="q.id" class="question-admin-row">
          <span class="q-preview">{{ q.question_text }}</span>
          <button class="btn-del" @click="deleteQuestion(q.id)">Xóa</button>
        </div>

        <!-- Add question form -->
        <div v-if="questionForms[section.id]" class="question-form">
          <textarea v-model="questionForms[section.id].question_text" placeholder="Câu hỏi *" rows="2" />
          <div v-if="!questionForms[section.id].fill_mode">
            <div v-for="(_, i) in questionForms[section.id].options" :key="i" class="form-row" style="margin-bottom:4px">
              <label style="min-width:24px">{{ ['A','B','C','D'][i] }}.</label>
              <input v-model="questionForms[section.id].options[i]" :placeholder="`Đáp án ${['A','B','C','D'][i]}`" />
              <label>
                <input type="radio" :value="i" v-model="questionForms[section.id].correct_index" />
                Đúng
              </label>
            </div>
          </div>
          <input v-else v-model="questionForms[section.id].correct_fill" placeholder="Đáp án đúng (điền từ)" />
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn-primary" @click="submitQuestion(section.id)">Lưu câu hỏi</button>
            <button class="btn-del" @click="delete questionForms[section.id]">Hủy</button>
          </div>
        </div>
        <button v-else class="btn-add-q" @click="initQuestionForm(section.id, section.type === 'fill')">
          + Thêm câu hỏi
        </button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 6: Add exam admin CSS to `<style scoped>`**

Add at the end of the `<style scoped>` block:

```css
.exam-admin-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
.exam-admin-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; }
.exam-admin-header:hover { background: #fafafa; }
.exam-admin-body { padding: 16px; border-top: 1px solid #eee; display: flex; flex-direction: column; gap: 12px; }
.badge { background: #d32f2f; color: white; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; margin-left: 6px; }
.badge-grey { background: #eee; color: #555; font-size: 0.72rem; padding: 2px 7px; border-radius: 4px; margin-left: 4px; }
.section-form { background: #fafafa; border: 1px dashed #ddd; border-radius: 6px; padding: 12px; }
.section-form h4 { margin-bottom: 10px; font-size: 0.9rem; color: #555; }
.section-admin-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 12px; }
.section-admin-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.question-admin-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.88rem; }
.q-preview { flex: 1; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%; }
.question-form { background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; margin-top: 10px; }
.btn-add-q { margin-top: 8px; background: none; border: 1px dashed #bbb; border-radius: 4px; padding: 6px 14px; cursor: pointer; color: #666; font-size: 0.85rem; }
.msg { padding: 10px 14px; border-radius: 6px; margin-bottom: 10px; }
.msg.success { background: #e8f5e9; color: #2e7d32; }
.msg.error { background: #ffebee; color: #c62828; }
```

- [ ] **Step 7: Manual test — full exam flow**

1. Start backend: `cd backend && node app.js`
2. Start frontend: `cd frontend && npm run dev`
3. Log in as admin → go to `/admin` → click "Đề thi" tab
4. Create an exam: "Đề HSK 1 thử", HSK, level 1, 90 minutes → click "Tạo đề thi"
5. Click the exam card to expand → add a section: "Phần 1 – Điền từ", type "fill" → "Thêm phần"
6. Click "+ Thêm câu hỏi" → enter question + correct answer → "Lưu câu hỏi"
7. Go to nav → "HSK" → select level 1 → exam appears in list → "Bắt đầu làm"
8. Answer the question → "Nộp bài" → result screen shows score and correct/incorrect

- [ ] **Step 8: Commit**

```bash
git add frontend/src/views/AdminView.vue frontend/src/i18n/vi.js frontend/src/i18n/en.js frontend/src/i18n/zh.js
git commit -m "feat(exam): admin Đề thi tab — create/delete exams, sections, questions"
```

---

## Done

All 9 tasks complete when:
- Backend starts with no errors and 4 new tables exist in MySQL
- Admin can create an exam with sections and questions via `/admin` → "Đề thi" tab
- Users can go to `/hsk` or `/hskk`, select a level, start an exam, answer, submit, and see results
- Timer counts down and auto-submits on expiry
