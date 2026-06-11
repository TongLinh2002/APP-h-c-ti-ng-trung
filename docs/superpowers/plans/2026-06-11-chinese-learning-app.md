# APP Học Tiếng Trung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web học tiếng Trung theo chuẩn HSK 1–9 với flashcard SRS, luyện nghe, luyện đọc, bản đồ hành trình gamification, game thử thách từ vựng, và tài liệu tải xuống.

**Architecture:** Monolith repo với `frontend/` (Vue 3 + Vite) và `backend/` (Node.js + Express). Backend phục vụ REST API, frontend gọi qua axios. Auth bằng JWT.

**Tech Stack:** Vue 3, Vite, Pinia, Vue Router, Axios, Node.js, Express, Sequelize, MySQL, bcryptjs, jsonwebtoken, Jest, Supertest, Vitest

---

## Cấu trúc file tổng thể

```
app-hoc-tieng-trung/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          -- Sequelize connection
│   │   ├── models/
│   │   │   ├── index.js             -- Model registry
│   │   │   ├── User.js
│   │   │   ├── Vocabulary.js
│   │   │   ├── UserVocabularyProgress.js
│   │   │   ├── Lesson.js
│   │   │   ├── LessonQuestion.js
│   │   │   └── UserLessonHistory.js
│   │   ├── middleware/
│   │   │   └── verifyToken.js       -- JWT middleware
│   │   ├── utils/
│   │   │   └── srs.js               -- SM-2 algorithm
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vocabularyController.js
│   │   │   ├── lessonsController.js
│   │   │   └── progressController.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── vocabulary.js
│   │       ├── lessons.js
│   │       └── progress.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── srs.test.js
│   │   ├── vocabulary.test.js
│   │   ├── lessons.test.js
│   │   └── progress.test.js
│   ├── .env.example
│   ├── app.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   ├── api.js               -- axios instance
    │   │   ├── authService.js
    │   │   ├── vocabularyService.js
    │   │   ├── lessonsService.js
    │   │   └── progressService.js
    │   ├── stores/
    │   │   ├── auth.js              -- Pinia store
    │   │   ├── vocabulary.js
    │   │   ├── lessons.js
    │   │   └── progress.js
    │   ├── router/
    │   │   └── index.js             -- Vue Router + guards
    │   ├── components/
    │   │   ├── Flashcard.vue
    │   │   ├── AudioPlayer.vue
    │   │   ├── QuizCard.vue
    │   │   └── ProgressBar.vue
    │   ├── views/
    │   │   ├── HomeView.vue
    │   │   ├── LoginView.vue
    │   │   ├── RegisterView.vue
    │   │   ├── LearnView.vue
    │   │   ├── ListenView.vue
    │   │   ├── ReadView.vue
    │   │   └── DashboardView.vue
    │   ├── App.vue
    │   └── main.js
    ├── tests/
    │   ├── Flashcard.test.js
    │   ├── QuizCard.test.js
    │   └── stores/
    │       └── auth.test.js
    ├── index.html
    └── vite.config.js
```

---

## Task 1: Khởi tạo Backend Project

**Files:**
- Create: `backend/package.json`
- Create: `backend/app.js`
- Create: `backend/.env.example`
- Create: `backend/src/config/database.js`

- [ ] **Bước 1: Tạo thư mục và khởi tạo project**

```bash
mkdir app-hoc-tieng-trung && cd app-hoc-tieng-trung
mkdir -p backend/src/{config,models,middleware,utils,controllers,routes} backend/tests
cd backend
npm init -y
```

- [ ] **Bước 2: Cài đặt dependencies**

```bash
npm install express sequelize mysql2 bcryptjs jsonwebtoken dotenv cors
npm install --save-dev jest supertest nodemon
```

- [ ] **Bước 3: Cập nhật package.json — thêm scripts**

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "jest --runInBand"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

- [ ] **Bước 4: Tạo file `.env.example`**

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hoc_tieng_trung
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3000
```

- [ ] **Bước 5: Sao chép thành `.env` và điền thông tin thật**

```bash
cp .env.example .env
# Mở .env và điền DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET thực tế
```

- [ ] **Bước 6: Tạo `src/config/database.js`**

```js
const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
)

module.exports = sequelize
```

- [ ] **Bước 7: Tạo `app.js`**

```js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./src/config/database')

const authRoutes = require('./src/routes/auth')
const vocabularyRoutes = require('./src/routes/vocabulary')
const lessonsRoutes = require('./src/routes/lessons')
const progressRoutes = require('./src/routes/progress')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/vocabulary', vocabularyRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/progress', progressRoutes)

const PORT = process.env.PORT || 3000

async function start() {
  await sequelize.authenticate()
  await sequelize.sync({ alter: true })
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}

start().catch(console.error)

module.exports = app
```

- [ ] **Bước 8: Commit**

```bash
git init
git add .
git commit -m "feat: khởi tạo backend project"
```

---

## Task 2: Tạo Sequelize Models

**Files:**
- Create: `backend/src/models/User.js`
- Create: `backend/src/models/Vocabulary.js`
- Create: `backend/src/models/UserVocabularyProgress.js`
- Create: `backend/src/models/Lesson.js`
- Create: `backend/src/models/LessonQuestion.js`
- Create: `backend/src/models/UserLessonHistory.js`
- Create: `backend/src/models/index.js`

- [ ] **Bước 1: Tạo `src/models/User.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  display_name: { type: DataTypes.STRING },
  current_hsk_level: { type: DataTypes.TINYINT, defaultValue: 1 },
})

module.exports = User
```

- [ ] **Bước 2: Tạo `src/models/Vocabulary.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Vocabulary = sequelize.define('Vocabulary', {
  hanzi: { type: DataTypes.STRING(50), allowNull: false },
  pinyin: { type: DataTypes.STRING(100), allowNull: false },
  meaning_vi: { type: DataTypes.TEXT, allowNull: false },
  example_sentence: { type: DataTypes.STRING(500) },
  example_pinyin: { type: DataTypes.STRING(500) },
  audio_url: { type: DataTypes.STRING },
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = Vocabulary
```

- [ ] **Bước 3: Tạo `src/models/UserVocabularyProgress.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserVocabularyProgress = sequelize.define('UserVocabularyProgress', {
  ease_factor: { type: DataTypes.FLOAT, defaultValue: 2.5 },
  interval_days: { type: DataTypes.INTEGER, defaultValue: 1 },
  next_review_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  times_seen: { type: DataTypes.INTEGER, defaultValue: 0 },
  times_correct: { type: DataTypes.INTEGER, defaultValue: 0 },
})

module.exports = UserVocabularyProgress
```

- [ ] **Bước 4: Tạo `src/models/Lesson.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Lesson = sequelize.define('Lesson', {
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('listening', 'reading'), allowNull: false },
  content: { type: DataTypes.TEXT },
  audio_url: { type: DataTypes.STRING },
  transcript: { type: DataTypes.TEXT },
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = Lesson
```

- [ ] **Bước 5: Tạo `src/models/LessonQuestion.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const LessonQuestion = sequelize.define('LessonQuestion', {
  question: { type: DataTypes.TEXT, allowNull: false },
  options: { type: DataTypes.JSON, allowNull: false },
  correct_answer: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = LessonQuestion
```

- [ ] **Bước 6: Tạo `src/models/UserLessonHistory.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserLessonHistory = sequelize.define('UserLessonHistory', {
  score: { type: DataTypes.TINYINT, allowNull: false },
})

module.exports = UserLessonHistory
```

- [ ] **Bước 7: Tạo `src/models/index.js` — khai báo quan hệ**

```js
const User = require('./User')
const Vocabulary = require('./Vocabulary')
const UserVocabularyProgress = require('./UserVocabularyProgress')
const Lesson = require('./Lesson')
const LessonQuestion = require('./LessonQuestion')
const UserLessonHistory = require('./UserLessonHistory')

User.hasMany(UserVocabularyProgress, { foreignKey: 'user_id' })
Vocabulary.hasMany(UserVocabularyProgress, { foreignKey: 'vocabulary_id' })
UserVocabularyProgress.belongsTo(User, { foreignKey: 'user_id' })
UserVocabularyProgress.belongsTo(Vocabulary, { foreignKey: 'vocabulary_id' })

Lesson.hasMany(LessonQuestion, { foreignKey: 'lesson_id', as: 'questions' })
LessonQuestion.belongsTo(Lesson, { foreignKey: 'lesson_id' })

User.hasMany(UserLessonHistory, { foreignKey: 'user_id' })
Lesson.hasMany(UserLessonHistory, { foreignKey: 'lesson_id' })
UserLessonHistory.belongsTo(User, { foreignKey: 'user_id' })
UserLessonHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' })

module.exports = { User, Vocabulary, UserVocabularyProgress, Lesson, LessonQuestion, UserLessonHistory }
```

- [ ] **Bước 8: Commit**

```bash
git add .
git commit -m "feat: thêm Sequelize models"
```

---

## Task 3: SRS Algorithm (SM-2)

**Files:**
- Create: `backend/src/utils/srs.js`
- Test: `backend/tests/srs.test.js`

- [ ] **Bước 1: Viết test thất bại trước**

Tạo `tests/srs.test.js`:

```js
const { calculateNextReview } = require('../src/utils/srs')

describe('SM-2 Algorithm', () => {
  test('rating=0 (Quên): interval reset về 1, ease_factor giảm', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 0 })
    expect(result.interval_days).toBe(1)
    expect(result.ease_factor).toBeLessThan(2.5)
  })

  test('rating=1 (Khó): interval reset về 1, ease_factor giảm nhẹ', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 1 })
    expect(result.interval_days).toBe(1)
    expect(result.ease_factor).toBeLessThan(2.5)
  })

  test('rating=2 (Bình thường): interval tăng, ease_factor giữ nguyên', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 2 })
    expect(result.interval_days).toBeGreaterThan(6)
    expect(result.ease_factor).toBeCloseTo(2.5)
  })

  test('rating=3 (Dễ): interval tăng nhiều, ease_factor tăng', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 3 })
    expect(result.interval_days).toBeGreaterThan(6)
    expect(result.ease_factor).toBeGreaterThan(2.5)
  })

  test('ease_factor không bao giờ nhỏ hơn 1.3', () => {
    const result = calculateNextReview({ ease_factor: 1.3, interval_days: 1, rating: 0 })
    expect(result.ease_factor).toBeGreaterThanOrEqual(1.3)
  })

  test('trả về next_review_at là Date trong tương lai', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 1, rating: 2 })
    expect(result.next_review_at).toBeInstanceOf(Date)
    expect(result.next_review_at.getTime()).toBeGreaterThan(Date.now())
  })
})
```

- [ ] **Bước 2: Chạy test để xác nhận thất bại**

```bash
npx jest tests/srs.test.js
```

Expected: FAIL — "Cannot find module '../src/utils/srs'"

- [ ] **Bước 3: Implement `src/utils/srs.js`**

```js
/**
 * SM-2 Spaced Repetition algorithm
 * rating: 0=Quên, 1=Khó, 2=Bình thường, 3=Dễ
 */
function calculateNextReview({ ease_factor, interval_days, rating }) {
  let newEaseFactor = ease_factor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
  if (newEaseFactor < 1.3) newEaseFactor = 1.3

  let newInterval
  if (rating < 2) {
    newInterval = 1
  } else if (interval_days === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(interval_days * newEaseFactor)
  }

  const next_review_at = new Date()
  next_review_at.setDate(next_review_at.getDate() + newInterval)

  return {
    ease_factor: parseFloat(newEaseFactor.toFixed(2)),
    interval_days: newInterval,
    next_review_at,
  }
}

module.exports = { calculateNextReview }
```

- [ ] **Bước 4: Chạy test để xác nhận pass**

```bash
npx jest tests/srs.test.js
```

Expected: PASS — 6 tests passed

- [ ] **Bước 5: Commit**

```bash
git add .
git commit -m "feat: implement SM-2 SRS algorithm với tests"
```

---

## Task 4: Backend Auth

**Files:**
- Create: `backend/src/middleware/verifyToken.js`
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/routes/auth.js`
- Test: `backend/tests/auth.test.js`

- [ ] **Bước 1: Tạo `src/middleware/verifyToken.js`**

```js
const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token không tồn tại' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' })
    req.userId = decoded.id
    next()
  })
}

module.exports = verifyToken
```

- [ ] **Bước 2: Tạo `src/controllers/authController.js`**

```js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

async function register(req, res) {
  const { email, password, display_name } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })

  const existing = await User.findOne({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email đã được sử dụng' })

  const password_hash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password_hash, display_name })

  res.status(201).json({ message: 'Đăng ký thành công', userId: user.id })
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })

  const user = await User.findOne({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, display_name: user.display_name, current_hsk_level: user.current_hsk_level } })
}

async function refresh(req, res) {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken là bắt buộc' })

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Refresh token không hợp lệ' })
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ accessToken })
  })
}

module.exports = { register, login, refresh }
```

- [ ] **Bước 3: Tạo `src/routes/auth.js`**

```js
const express = require('express')
const router = express.Router()
const { register, login, refresh } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)

module.exports = router
```

- [ ] **Bước 4: Viết test cho Auth**

Tạo `tests/auth.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')
const { User } = require('../src/models')

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('POST /api/auth/register', () => {
  test('đăng ký thành công với email và password hợp lệ', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: '123456', display_name: 'Test User' })
    expect(res.status).toBe(201)
    expect(res.body.message).toBe('Đăng ký thành công')
  })

  test('trả về 409 nếu email đã tồn tại', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: '123456' })
    expect(res.status).toBe(409)
  })

  test('trả về 400 nếu thiếu email', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: '123456' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  test('đăng nhập thành công, trả về accessToken và refreshToken', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: '123456' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user.email).toBe('test@example.com')
  })

  test('trả về 401 nếu mật khẩu sai', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/refresh', () => {
  test('trả về accessToken mới khi có refreshToken hợp lệ', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: '123456' })
    const { refreshToken } = loginRes.body

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })
})
```

- [ ] **Bước 5: Chạy test auth**

```bash
npx jest tests/auth.test.js
```

Expected: PASS — 6 tests passed

- [ ] **Bước 6: Commit**

```bash
git add .
git commit -m "feat: backend auth (register, login, refresh) với tests"
```

---

## Task 5: Backend Vocabulary API

**Files:**
- Create: `backend/src/controllers/vocabularyController.js`
- Create: `backend/src/routes/vocabulary.js`
- Test: `backend/tests/vocabulary.test.js`

- [ ] **Bước 1: Tạo `src/controllers/vocabularyController.js`**

```js
const { Op } = require('sequelize')
const { Vocabulary, UserVocabularyProgress } = require('../models')
const { calculateNextReview } = require('../utils/srs')

async function getVocabulary(req, res) {
  const { hsk_level } = req.query
  const where = hsk_level ? { hsk_level: parseInt(hsk_level) } : {}
  const vocabulary = await Vocabulary.findAll({ where })
  res.json(vocabulary)
}

async function getReviewCards(req, res) {
  const userId = req.userId
  const now = new Date()

  const dueCards = await UserVocabularyProgress.findAll({
    where: { user_id: userId, next_review_at: { [Op.lte]: now } },
    include: [{ model: Vocabulary }],
    limit: 20,
  })

  res.json(dueCards)
}

async function submitReview(req, res) {
  const userId = req.userId
  const vocabularyId = parseInt(req.params.id)
  const { rating } = req.body  // 0=Quên, 1=Khó, 2=Bình thường, 3=Dễ

  if (rating === undefined || rating < 0 || rating > 3) {
    return res.status(400).json({ message: 'rating phải từ 0 đến 3' })
  }

  let progress = await UserVocabularyProgress.findOne({ where: { user_id: userId, vocabulary_id: vocabularyId } })

  if (!progress) {
    progress = await UserVocabularyProgress.create({ user_id: userId, vocabulary_id: vocabularyId })
  }

  const next = calculateNextReview({
    ease_factor: progress.ease_factor,
    interval_days: progress.interval_days,
    rating,
  })

  await progress.update({
    ease_factor: next.ease_factor,
    interval_days: next.interval_days,
    next_review_at: next.next_review_at,
    times_seen: progress.times_seen + 1,
    times_correct: rating >= 2 ? progress.times_correct + 1 : progress.times_correct,
  })

  res.json({ message: 'Đã lưu kết quả', next_review_at: next.next_review_at })
}

module.exports = { getVocabulary, getReviewCards, submitReview }
```

- [ ] **Bước 2: Tạo `src/routes/vocabulary.js`**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getVocabulary, getReviewCards, submitReview } = require('../controllers/vocabularyController')

router.get('/', verifyToken, getVocabulary)
router.get('/review', verifyToken, getReviewCards)
router.post('/review/:id', verifyToken, submitReview)

module.exports = router
```

- [ ] **Bước 3: Viết test cho Vocabulary API**

Tạo `tests/vocabulary.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')
const { Vocabulary } = require('../src/models')

let accessToken

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await request(app).post('/api/auth/register').send({ email: 'vocab@test.com', password: '123456' })
  const res = await request(app).post('/api/auth/login').send({ email: 'vocab@test.com', password: '123456' })
  accessToken = res.body.accessToken

  await Vocabulary.bulkCreate([
    { hanzi: '你好', pinyin: 'nǐ hǎo', meaning_vi: 'Xin chào', hsk_level: 1 },
    { hanzi: '谢谢', pinyin: 'xiè xiè', meaning_vi: 'Cảm ơn', hsk_level: 1 },
    { hanzi: '工作', pinyin: 'gōngzuò', meaning_vi: 'Làm việc', hsk_level: 2 },
  ])
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/vocabulary', () => {
  test('trả về tất cả từ vựng khi không lọc', async () => {
    const res = await request(app).get('/api/vocabulary').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(3)
  })

  test('lọc theo hsk_level=1 trả về 2 từ', async () => {
    const res = await request(app).get('/api/vocabulary?hsk_level=1').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(2)
  })

  test('trả về 401 nếu không có token', async () => {
    const res = await request(app).get('/api/vocabulary')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/vocabulary/review/:id', () => {
  test('lưu kết quả review thành công', async () => {
    const res = await request(app)
      .post('/api/vocabulary/review/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ rating: 2 })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('next_review_at')
  })

  test('trả về 400 nếu rating không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/vocabulary/review/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ rating: 5 })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Bước 4: Chạy test vocabulary**

```bash
npx jest tests/vocabulary.test.js
```

Expected: PASS — 5 tests passed

- [ ] **Bước 5: Commit**

```bash
git add .
git commit -m "feat: vocabulary API với SRS review và tests"
```

---

## Task 6: Backend Lessons API

**Files:**
- Create: `backend/src/controllers/lessonsController.js`
- Create: `backend/src/routes/lessons.js`
- Test: `backend/tests/lessons.test.js`

- [ ] **Bước 1: Tạo `src/controllers/lessonsController.js`**

```js
const { Lesson, LessonQuestion, UserLessonHistory } = require('../models')

async function getLessons(req, res) {
  const { hsk_level, type } = req.query
  const where = {}
  if (hsk_level) where.hsk_level = parseInt(hsk_level)
  if (type) where.type = type

  const lessons = await Lesson.findAll({ where, attributes: ['id', 'title', 'type', 'hsk_level'] })
  res.json(lessons)
}

async function getLessonById(req, res) {
  const lesson = await Lesson.findByPk(req.params.id, {
    include: [{ model: LessonQuestion, as: 'questions' }],
  })
  if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' })
  res.json(lesson)
}

async function submitLesson(req, res) {
  const userId = req.userId
  const lessonId = parseInt(req.params.id)
  const { answers } = req.body  // [{ question_id, selected_answer }]

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'answers phải là mảng' })
  }

  const lesson = await Lesson.findByPk(lessonId, {
    include: [{ model: LessonQuestion, as: 'questions' }],
  })
  if (!lesson) return res.status(404).json({ message: 'Bài học không tồn tại' })

  let correct = 0
  const results = lesson.questions.map((q) => {
    const userAnswer = answers.find((a) => a.question_id === q.id)
    const isCorrect = userAnswer && userAnswer.selected_answer === q.correct_answer
    if (isCorrect) correct++
    return { question_id: q.id, correct: !!isCorrect, correct_answer: q.correct_answer }
  })

  const score = lesson.questions.length > 0 ? Math.round((correct / lesson.questions.length) * 100) : 0

  await UserLessonHistory.create({ user_id: userId, lesson_id: lessonId, score })

  res.json({ score, results })
}

module.exports = { getLessons, getLessonById, submitLesson }
```

- [ ] **Bước 2: Tạo `src/routes/lessons.js`**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getLessons, getLessonById, submitLesson } = require('../controllers/lessonsController')

router.get('/', verifyToken, getLessons)
router.get('/:id', verifyToken, getLessonById)
router.post('/:id/submit', verifyToken, submitLesson)

module.exports = router
```

- [ ] **Bước 3: Viết test cho Lessons API**

Tạo `tests/lessons.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')
const { Lesson, LessonQuestion } = require('../src/models')

let accessToken, lessonId

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await request(app).post('/api/auth/register').send({ email: 'lesson@test.com', password: '123456' })
  const res = await request(app).post('/api/auth/login').send({ email: 'lesson@test.com', password: '123456' })
  accessToken = res.body.accessToken

  const lesson = await Lesson.create({ title: 'Bài nghe 1', type: 'listening', hsk_level: 1, audio_url: '/audio/1.mp3', transcript: 'Nǐ hǎo' })
  lessonId = lesson.id
  await LessonQuestion.create({ lesson_id: lessonId, question: 'Câu hỏi 1?', options: ['A', 'B', 'C', 'D'], correct_answer: 0 })
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/lessons', () => {
  test('trả về danh sách bài học', async () => {
    const res = await request(app).get('/api/lessons').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('lọc theo type=listening', async () => {
    const res = await request(app).get('/api/lessons?type=listening').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    res.body.forEach((l) => expect(l.type).toBe('listening'))
  })
})

describe('GET /api/lessons/:id', () => {
  test('trả về chi tiết bài học kèm câu hỏi', async () => {
    const res = await request(app).get(`/api/lessons/${lessonId}`).set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('questions')
    expect(res.body.questions.length).toBe(1)
  })

  test('trả về 404 nếu không tồn tại', async () => {
    const res = await request(app).get('/api/lessons/9999').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(404)
  })
})

describe('POST /api/lessons/:id/submit', () => {
  test('nộp bài đúng 1/1 câu, nhận điểm 100', async () => {
    const detailRes = await request(app).get(`/api/lessons/${lessonId}`).set('Authorization', `Bearer ${accessToken}`)
    const qId = detailRes.body.questions[0].id

    const res = await request(app)
      .post(`/api/lessons/${lessonId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answers: [{ question_id: qId, selected_answer: 0 }] })
    expect(res.status).toBe(200)
    expect(res.body.score).toBe(100)
  })

  test('nộp bài sai, nhận điểm 0', async () => {
    const detailRes = await request(app).get(`/api/lessons/${lessonId}`).set('Authorization', `Bearer ${accessToken}`)
    const qId = detailRes.body.questions[0].id

    const res = await request(app)
      .post(`/api/lessons/${lessonId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answers: [{ question_id: qId, selected_answer: 2 }] })
    expect(res.status).toBe(200)
    expect(res.body.score).toBe(0)
  })
})
```

- [ ] **Bước 4: Chạy test lessons**

```bash
npx jest tests/lessons.test.js
```

Expected: PASS — 5 tests passed

- [ ] **Bước 5: Commit**

```bash
git add .
git commit -m "feat: lessons API (list, detail, submit) với tests"
```

---

## Task 7: Backend Progress API

**Files:**
- Create: `backend/src/controllers/progressController.js`
- Create: `backend/src/routes/progress.js`
- Test: `backend/tests/progress.test.js`

- [ ] **Bước 1: Tạo `src/controllers/progressController.js`**

```js
const { Op, fn, col, literal } = require('sequelize')
const { UserVocabularyProgress, UserLessonHistory, Vocabulary } = require('../models')
const sequelize = require('../config/database')

async function getProgress(req, res) {
  const userId = req.userId

  // Tổng số từ đã học (có record progress)
  const totalLearned = await UserVocabularyProgress.count({ where: { user_id: userId } })

  // Số từ đã học theo từng cấp HSK
  const byLevel = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    include: [{ model: Vocabulary, attributes: ['hsk_level'] }],
    attributes: [[fn('COUNT', col('UserVocabularyProgress.id')), 'count']],
    group: ['Vocabulary.hsk_level'],
    raw: true,
  })

  // Streak: đếm số ngày liên tiếp học (có activity trong user_lesson_history hoặc vocabulary_progress)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const recentDays = await UserLessonHistory.findAll({
    where: {
      user_id: userId,
      completed_at: { [Op.gte]: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
    },
    attributes: [[fn('DATE', col('completed_at')), 'day']],
    group: [literal('day')],
    raw: true,
    order: [[literal('day'), 'DESC']],
  })

  let streak = 0
  const todayStr = today.toISOString().slice(0, 10)
  const activeDays = recentDays.map((r) => r.day)

  if (activeDays.includes(todayStr)) {
    streak = 1
    let checkDate = new Date(today)
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1)
      const dayStr = checkDate.toISOString().slice(0, 10)
      if (activeDays.includes(dayStr)) {
        streak++
      } else {
        break
      }
    }
  }

  // Hoạt động 7 ngày gần nhất (số bài đã làm mỗi ngày)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  weekAgo.setHours(0, 0, 0, 0)

  const weeklyActivity = await UserLessonHistory.findAll({
    where: { user_id: userId, completed_at: { [Op.gte]: weekAgo } },
    attributes: [[fn('DATE', col('completed_at')), 'day'], [fn('COUNT', col('id')), 'count']],
    group: [literal('day')],
    raw: true,
  })

  res.json({ totalLearned, byLevel, streak, weeklyActivity })
}

module.exports = { getProgress }
```

- [ ] **Bước 2: Tạo `src/routes/progress.js`**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getProgress } = require('../controllers/progressController')

router.get('/', verifyToken, getProgress)

module.exports = router
```

- [ ] **Bước 3: Viết test progress**

Tạo `tests/progress.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')

let accessToken

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await request(app).post('/api/auth/register').send({ email: 'progress@test.com', password: '123456' })
  const res = await request(app).post('/api/auth/login').send({ email: 'progress@test.com', password: '123456' })
  accessToken = res.body.accessToken
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/progress', () => {
  test('trả về dữ liệu dashboard với đúng các fields', async () => {
    const res = await request(app).get('/api/progress').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('totalLearned')
    expect(res.body).toHaveProperty('byLevel')
    expect(res.body).toHaveProperty('streak')
    expect(res.body).toHaveProperty('weeklyActivity')
  })

  test('user mới: totalLearned = 0, streak = 0', async () => {
    const res = await request(app).get('/api/progress').set('Authorization', `Bearer ${accessToken}`)
    expect(res.body.totalLearned).toBe(0)
    expect(res.body.streak).toBe(0)
  })

  test('trả về 401 nếu không có token', async () => {
    const res = await request(app).get('/api/progress')
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Bước 4: Chạy test progress**

```bash
npx jest tests/progress.test.js
```

Expected: PASS — 3 tests passed

- [ ] **Bước 5: Chạy toàn bộ test backend**

```bash
npx jest
```

Expected: PASS — tất cả tests

- [ ] **Bước 6: Commit**

```bash
git add .
git commit -m "feat: progress API với tests — backend hoàn chỉnh"
```

---

## Task 8: Khởi tạo Frontend (Vue 3 + Vite)

**Files:**
- Create: `frontend/` (toàn bộ cấu trúc Vue project)

- [ ] **Bước 1: Tạo Vue 3 project với Vite**

```bash
cd ..  # quay về thư mục gốc app-hoc-tieng-trung
npm create vue@latest frontend
# Chọn: Yes Router, Yes Pinia, Yes Vitest, No khác
cd frontend
npm install
```

- [ ] **Bước 2: Cài thêm axios**

```bash
npm install axios
```

- [ ] **Bước 3: Xóa file mẫu, tạo cấu trúc thư mục**

```bash
# Xóa các file mẫu không cần
rm src/views/AboutView.vue
rm src/components/HelloWorld.vue src/components/TheWelcome.vue src/components/WelcomeItem.vue
rm src/assets/base.css src/assets/logo.svg src/assets/main.css
# Tạo thư mục services và components cần thiết
mkdir -p src/services src/components
```

- [ ] **Bước 4: Tạo `src/services/api.js` — axios instance có auto-refresh**

```js
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return Promise.reject(error)
      try {
        const res = await axios.post('http://localhost:3000/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', res.data.accessToken)
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`
        return api(error.config)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

- [ ] **Bước 5: Commit**

```bash
git add .
git commit -m "feat: khởi tạo frontend Vue 3 + Vite + Pinia"
```

---

## Task 9: Frontend Auth (Store + Views + Router)

**Files:**
- Create: `frontend/src/services/authService.js`
- Create: `frontend/src/stores/auth.js`
- Create: `frontend/src/views/LoginView.vue`
- Create: `frontend/src/views/RegisterView.vue`
- Modify: `frontend/src/router/index.js`

- [ ] **Bước 1: Tạo `src/services/authService.js`**

```js
import api from './api'
import axios from 'axios'

export async function register(email, password, display_name) {
  const res = await axios.post('http://localhost:3000/api/auth/register', { email, password, display_name })
  return res.data
}

export async function login(email, password) {
  const res = await axios.post('http://localhost:3000/api/auth/login', { email, password })
  return res.data
}
```

- [ ] **Bước 2: Tạo `src/stores/auth.js`**

```js
import { defineStore } from 'pinia'
import { login, register } from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
  },
  actions: {
    async loginAction(email, password) {
      const data = await login(email, password)
      this.accessToken = data.accessToken
      this.user = data.user
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    },
    async registerAction(email, password, display_name) {
      await register(email, password, display_name)
      await this.loginAction(email, password)
    },
    logout() {
      this.accessToken = null
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
  },
})
```

- [ ] **Bước 3: Tạo `src/views/LoginView.vue`**

```vue
<template>
  <div class="auth-page">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </form>
    <p>Chưa có tài khoản? <RouterLink to="/register">Đăng ký</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
    error.value = e.response?.data?.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>
```

- [ ] **Bước 4: Tạo `src/views/RegisterView.vue`**

```vue
<template>
  <div class="auth-page">
    <h2>Đăng ký</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="displayName" type="text" placeholder="Tên hiển thị" />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu (ít nhất 6 ký tự)" required minlength="6" />
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
      </button>
    </form>
    <p>Đã có tài khoản? <RouterLink to="/login">Đăng nhập</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
    error.value = e.response?.data?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}
</script>
```

- [ ] **Bước 5: Cập nhật `src/router/index.js` với route guard**

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  { path: '/learn', component: () => import('../views/LearnView.vue'), meta: { requiresAuth: true } },
  { path: '/listen', component: () => import('../views/ListenView.vue'), meta: { requiresAuth: true } },
  { path: '/read', component: () => import('../views/ReadView.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

- [ ] **Bước 6: Commit**

```bash
git add .
git commit -m "feat: frontend auth store, login/register views, router guard"
```

---

## Task 10: Frontend Flashcard + LearnView

**Files:**
- Create: `frontend/src/services/vocabularyService.js`
- Create: `frontend/src/stores/vocabulary.js`
- Create: `frontend/src/components/Flashcard.vue`
- Create: `frontend/src/views/LearnView.vue`

- [ ] **Bước 1: Tạo `src/services/vocabularyService.js`**

```js
import api from './api'

export async function fetchReviewCards() {
  const res = await api.get('/vocabulary/review')
  return res.data
}

export async function submitReview(vocabularyId, rating) {
  const res = await api.post(`/vocabulary/review/${vocabularyId}`, { rating })
  return res.data
}
```

- [ ] **Bước 2: Tạo `src/stores/vocabulary.js`**

```js
import { defineStore } from 'pinia'
import { fetchReviewCards, submitReview } from '../services/vocabularyService'

export const useVocabularyStore = defineStore('vocabulary', {
  state: () => ({
    reviewCards: [],
    currentIndex: 0,
    sessionDone: false,
  }),
  getters: {
    currentCard: (state) => state.reviewCards[state.currentIndex] || null,
    totalCards: (state) => state.reviewCards.length,
  },
  actions: {
    async loadReviewCards() {
      this.reviewCards = await fetchReviewCards()
      this.currentIndex = 0
      this.sessionDone = false
    },
    async rateCard(rating) {
      const card = this.currentCard
      if (!card) return
      await submitReview(card.vocabulary_id || card.Vocabulary?.id || card.id, rating)
      if (this.currentIndex < this.reviewCards.length - 1) {
        this.currentIndex++
      } else {
        this.sessionDone = true
      }
    },
  },
})
```

- [ ] **Bước 3: Tạo `src/components/Flashcard.vue`**

```vue
<template>
  <div class="flashcard" @click="flip">
    <div class="card-inner" :class="{ flipped }">
      <div class="card-front">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="hint">Nhấn để xem nghĩa</p>
      </div>
      <div class="card-back">
        <p class="hanzi">{{ card.Vocabulary?.hanzi }}</p>
        <p class="pinyin">{{ card.Vocabulary?.pinyin }}</p>
        <p class="meaning">{{ card.Vocabulary?.meaning_vi }}</p>
        <p class="example">{{ card.Vocabulary?.example_sentence }}</p>
        <audio v-if="card.Vocabulary?.audio_url" :src="card.Vocabulary.audio_url" controls />
      </div>
    </div>
  </div>

  <div v-if="flipped" class="rating-buttons">
    <button class="btn-forget" @click.stop="$emit('rate', 0)">Quên</button>
    <button class="btn-hard" @click.stop="$emit('rate', 1)">Khó</button>
    <button class="btn-ok" @click.stop="$emit('rate', 2)">Bình thường</button>
    <button class="btn-easy" @click.stop="$emit('rate', 3)">Dễ</button>
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
```

- [ ] **Bước 4: Tạo `src/views/LearnView.vue`**

```vue
<template>
  <div class="learn-view">
    <h2>Học từ vựng</h2>

    <div v-if="loading">Đang tải...</div>

    <div v-else-if="store.sessionDone" class="session-done">
      <p>Hoàn thành phiên học hôm nay!</p>
      <button @click="restart">Học lại</button>
    </div>

    <div v-else-if="store.currentCard">
      <p class="progress">{{ store.currentIndex + 1 }} / {{ store.totalCards }}</p>
      <Flashcard :card="store.currentCard" @rate="store.rateCard" />
    </div>

    <div v-else>
      <p>Không có thẻ nào cần ôn hôm nay.</p>
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

async function restart() {
  loading.value = true
  await store.loadReviewCards()
  loading.value = false
}
</script>
```

- [ ] **Bước 5: Commit**

```bash
git add .
git commit -m "feat: flashcard component, vocabulary store, LearnView"
```

---

## Task 11: Frontend Luyện nghe (ListenView)

**Files:**
- Create: `frontend/src/services/lessonsService.js`
- Create: `frontend/src/stores/lessons.js`
- Create: `frontend/src/components/AudioPlayer.vue`
- Create: `frontend/src/components/QuizCard.vue`
- Create: `frontend/src/views/ListenView.vue`

- [ ] **Bước 1: Tạo `src/services/lessonsService.js`**

```js
import api from './api'

export async function fetchLessons(hsk_level, type) {
  const params = {}
  if (hsk_level) params.hsk_level = hsk_level
  if (type) params.type = type
  const res = await api.get('/lessons', { params })
  return res.data
}

export async function fetchLessonById(id) {
  const res = await api.get(`/lessons/${id}`)
  return res.data
}

export async function submitLesson(id, answers) {
  const res = await api.post(`/lessons/${id}/submit`, { answers })
  return res.data
}
```

- [ ] **Bước 2: Tạo `src/stores/lessons.js`**

```js
import { defineStore } from 'pinia'
import { fetchLessons, fetchLessonById, submitLesson } from '../services/lessonsService'

export const useLessonsStore = defineStore('lessons', {
  state: () => ({
    lessons: [],
    currentLesson: null,
    result: null,
  }),
  actions: {
    async loadLessons(hsk_level, type) {
      this.lessons = await fetchLessons(hsk_level, type)
    },
    async openLesson(id) {
      this.currentLesson = await fetchLessonById(id)
      this.result = null
    },
    async submitAnswers(answers) {
      this.result = await submitLesson(this.currentLesson.id, answers)
    },
  },
})
```

- [ ] **Bước 3: Tạo `src/components/AudioPlayer.vue`**

```vue
<template>
  <div class="audio-player">
    <audio ref="audioEl" :src="src" @timeupdate="onTimeUpdate" />
    <button @click="togglePlay">{{ playing ? 'Dừng' : 'Phát' }}</button>
    <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    <input type="range" :max="duration" :value="currentTime" @input="seek" step="0.1" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({ src: String })
const audioEl = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)

onMounted(() => {
  audioEl.value.addEventListener('loadedmetadata', () => { duration.value = audioEl.value.duration })
  audioEl.value.addEventListener('ended', () => { playing.value = false })
})

function togglePlay() {
  if (playing.value) { audioEl.value.pause() } else { audioEl.value.play() }
  playing.value = !playing.value
}

function onTimeUpdate() { currentTime.value = audioEl.value.currentTime }

function seek(e) { audioEl.value.currentTime = e.target.value }

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
</script>
```

- [ ] **Bước 4: Tạo `src/components/QuizCard.vue`**

```vue
<template>
  <div class="quiz-card">
    <p class="question">{{ question.question }}</p>
    <ul class="options">
      <li
        v-for="(option, idx) in question.options"
        :key="idx"
        :class="getClass(idx)"
        @click="!answered && select(idx)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ question: Object, showResult: Boolean, correctAnswer: Number })
const emit = defineEmits(['answer'])

const selected = ref(null)
const answered = ref(false)

function select(idx) {
  selected.value = idx
  answered.value = true
  emit('answer', { question_id: props.question.id, selected_answer: idx })
}

function getClass(idx) {
  if (!props.showResult || selected.value === null) {
    return selected.value === idx ? 'selected' : ''
  }
  if (idx === props.correctAnswer) return 'correct'
  if (idx === selected.value) return 'wrong'
  return ''
}
</script>
```

- [ ] **Bước 5: Tạo `src/views/ListenView.vue`**

```vue
<template>
  <div class="listen-view">
    <h2>Luyện nghe</h2>

    <div v-if="!currentLesson">
      <label>Cấp HSK:
        <select v-model="selectedLevel" @change="loadLessons">
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
      </label>
      <ul class="lesson-list">
        <li v-for="lesson in store.lessons" :key="lesson.id" @click="openLesson(lesson.id)">
          {{ lesson.title }}
        </li>
      </ul>
    </div>

    <div v-else>
      <h3>{{ currentLesson.title }}</h3>
      <AudioPlayer :src="currentLesson.audio_url" />

      <details>
        <summary>Xem transcript</summary>
        <p>{{ currentLesson.transcript }}</p>
      </details>

      <div v-if="!store.result">
        <QuizCard
          v-for="q in currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="false"
          @answer="recordAnswer"
        />
        <button @click="submit">Nộp bài</button>
      </div>

      <div v-else class="result">
        <p>Điểm của bạn: <strong>{{ store.result.score }}/100</strong></p>
        <QuizCard
          v-for="(q, i) in currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="true"
          :correct-answer="store.result.results[i]?.correct_answer"
        />
        <button @click="store.currentLesson = null; store.result = null">Quay lại danh sách</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import QuizCard from '../components/QuizCard.vue'
import { useLessonsStore } from '../stores/lessons'

const store = useLessonsStore()
const selectedLevel = ref(1)
const answers = ref([])
const currentLesson = computed(() => store.currentLesson)

onMounted(() => loadLessons())

async function loadLessons() {
  await store.loadLessons(selectedLevel.value, 'listening')
}

async function openLesson(id) {
  answers.value = []
  await store.openLesson(id)
}

function recordAnswer(answer) {
  const idx = answers.value.findIndex((a) => a.question_id === answer.question_id)
  if (idx >= 0) { answers.value[idx] = answer } else { answers.value.push(answer) }
}

async function submit() {
  await store.submitAnswers(answers.value)
}
</script>
```

- [ ] **Bước 6: Commit**

```bash
git add .
git commit -m "feat: ListenView, AudioPlayer, QuizCard components"
```

---

## Task 12: Frontend Luyện đọc (ReadView)

**Files:**
- Create: `frontend/src/views/ReadView.vue`

- [ ] **Bước 1: Tạo `src/views/ReadView.vue`**

```vue
<template>
  <div class="read-view">
    <h2>Luyện đọc</h2>

    <div v-if="!currentLesson">
      <label>Cấp HSK:
        <select v-model="selectedLevel" @change="loadLessons">
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
      </label>
      <ul class="lesson-list">
        <li v-for="lesson in store.lessons" :key="lesson.id" @click="openLesson(lesson.id)">
          {{ lesson.title }}
        </li>
      </ul>
    </div>

    <div v-else>
      <h3>{{ currentLesson.title }}</h3>

      <div class="reading-content">
        <p v-for="(word, idx) in parsedContent" :key="idx">
          <span
            v-if="word.isVocab"
            class="vocab-word"
            @click="toggleTooltip(idx)"
          >{{ word.text }}<span v-if="activeTooltip === idx" class="tooltip">{{ word.meaning }}</span></span>
          <span v-else>{{ word.text }}</span>
        </p>
      </div>

      <div v-if="!store.result">
        <QuizCard
          v-for="q in currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="false"
          @answer="recordAnswer"
        />
        <button @click="submit">Nộp bài</button>
      </div>

      <div v-else class="result">
        <p>Điểm của bạn: <strong>{{ store.result.score }}/100</strong></p>
        <QuizCard
          v-for="(q, i) in currentLesson.questions"
          :key="q.id"
          :question="q"
          :show-result="true"
          :correct-answer="store.result.results[i]?.correct_answer"
        />
        <button @click="store.currentLesson = null; store.result = null">Quay lại danh sách</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import QuizCard from '../components/QuizCard.vue'
import { useLessonsStore } from '../stores/lessons'

const store = useLessonsStore()
const selectedLevel = ref(1)
const answers = ref([])
const activeTooltip = ref(null)
const currentLesson = computed(() => store.currentLesson)

// Nội dung bài đọc được parse thành mảng segments
// Cú pháp trong content: [[chữ Hán|nghĩa]] đánh dấu từ vựng cần highlight
const parsedContent = computed(() => {
  if (!currentLesson.value?.content) return []
  const parts = currentLesson.value.content.split(/(\[\[.*?\]\])/g)
  return parts.map((part) => {
    const match = part.match(/\[\[(.*?)\|(.*?)\]\]/)
    if (match) return { text: match[1], meaning: match[2], isVocab: true }
    return { text: part, isVocab: false }
  })
})

onMounted(() => loadLessons())

async function loadLessons() {
  await store.loadLessons(selectedLevel.value, 'reading')
}

async function openLesson(id) {
  answers.value = []
  await store.openLesson(id)
}

function toggleTooltip(idx) {
  activeTooltip.value = activeTooltip.value === idx ? null : idx
}

function recordAnswer(answer) {
  const idx = answers.value.findIndex((a) => a.question_id === answer.question_id)
  if (idx >= 0) { answers.value[idx] = answer } else { answers.value.push(answer) }
}

async function submit() {
  await store.submitAnswers(answers.value)
}
</script>
```

- [ ] **Bước 2: Commit**

```bash
git add .
git commit -m "feat: ReadView với highlight từ vựng và quiz"
```

---

## Task 13: Frontend Dashboard (DashboardView)

**Files:**
- Create: `frontend/src/services/progressService.js`
- Create: `frontend/src/stores/progress.js`
- Create: `frontend/src/components/ProgressBar.vue`
- Create: `frontend/src/views/DashboardView.vue`

- [ ] **Bước 1: Tạo `src/services/progressService.js`**

```js
import api from './api'

export async function fetchProgress() {
  const res = await api.get('/progress')
  return res.data
}
```

- [ ] **Bước 2: Tạo `src/stores/progress.js`**

```js
import { defineStore } from 'pinia'
import { fetchProgress } from '../services/progressService'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    totalLearned: 0,
    byLevel: [],
    streak: 0,
    weeklyActivity: [],
  }),
  actions: {
    async load() {
      const data = await fetchProgress()
      this.totalLearned = data.totalLearned
      this.byLevel = data.byLevel
      this.streak = data.streak
      this.weeklyActivity = data.weeklyActivity
    },
  },
})
```

- [ ] **Bước 3: Tạo `src/components/ProgressBar.vue`**

```vue
<template>
  <div class="progress-bar-wrap">
    <div class="progress-bar-fill" :style="{ width: percent + '%' }"></div>
    <span>{{ percent }}%</span>
  </div>
</template>

<script setup>
defineProps({ percent: { type: Number, default: 0 } })
</script>
```

- [ ] **Bước 4: Tạo `src/views/DashboardView.vue`**

```vue
<template>
  <div class="dashboard">
    <h2>Tiến độ học của bạn</h2>

    <div v-if="loading">Đang tải...</div>

    <div v-else>
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-number">{{ store.totalLearned }}</p>
          <p class="stat-label">Từ đã học</p>
        </div>
        <div class="stat-card">
          <p class="stat-number">{{ store.streak }}</p>
          <p class="stat-label">Ngày liên tiếp 🔥</p>
        </div>
      </div>

      <h3>Tiến độ theo cấp HSK</h3>
      <div v-for="n in 9" :key="n" class="level-progress">
        <span>HSK {{ n }}</span>
        <ProgressBar :percent="getLevelPercent(n)" />
        <span>{{ getLevelCount(n) }} / {{ hskTotals[n] }} từ</span>
      </div>

      <h3>Hoạt động 7 ngày gần nhất</h3>
      <div class="weekly-chart">
        <div v-for="day in last7Days" :key="day.date" class="day-bar">
          <div class="bar" :style="{ height: (day.count * 10) + 'px' }"></div>
          <span>{{ day.label }}</span>
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

onMounted(async () => {
  await store.load()
  loading.value = false
})

function getLevelCount(level) {
  const found = store.byLevel.find((b) => b['Vocabulary.hsk_level'] === level)
  return found ? parseInt(found.count) : 0
}

function getLevelPercent(level) {
  const count = getLevelCount(level)
  return Math.min(100, Math.round((count / hskTotals[level]) * 100))
}

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const found = store.weeklyActivity.find((a) => a.day === dateStr)
    days.push({ date: dateStr, label: d.toLocaleDateString('vi', { weekday: 'short' }), count: found ? parseInt(found.count) : 0 })
  }
  return days
})
</script>
```

- [ ] **Bước 5: Tạo `src/views/HomeView.vue`**

```vue
<template>
  <div class="home">
    <h1>APP Học Tiếng Trung</h1>
    <p>Học tiếng Trung theo chuẩn HSK 1–9</p>
    <div class="nav-cards">
      <RouterLink to="/learn" class="nav-card">Học từ vựng</RouterLink>
      <RouterLink to="/listen" class="nav-card">Luyện nghe</RouterLink>
      <RouterLink to="/read" class="nav-card">Luyện đọc</RouterLink>
      <RouterLink to="/dashboard" class="nav-card">Tiến độ</RouterLink>
    </div>
  </div>
</template>
```

- [ ] **Bước 6: Cập nhật `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Bước 7: Cập nhật `src/App.vue`**

```vue
<template>
  <nav>
    <RouterLink to="/">Trang chủ</RouterLink>
    <RouterLink to="/learn">Học từ</RouterLink>
    <RouterLink to="/listen">Nghe</RouterLink>
    <RouterLink to="/read">Đọc</RouterLink>
    <RouterLink to="/dashboard">Tiến độ</RouterLink>
    <button v-if="authStore.isLoggedIn" @click="logout">Đăng xuất</button>
    <RouterLink v-else to="/login">Đăng nhập</RouterLink>
  </nav>
  <RouterView />
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
```

- [ ] **Bước 8: Commit cuối**

```bash
git add .
git commit -m "feat: dashboard, progress store, HomeView — MVP hoàn chỉnh"
```

---

## Task 15: Backend Journey + Challenge + Downloads API

**Files:**
- Modify: `backend/src/models/index.js` — thêm UserChallengeScore, Download
- Create: `backend/src/models/UserChallengeScore.js`
- Create: `backend/src/models/Download.js`
- Create: `backend/src/controllers/journeyController.js`
- Create: `backend/src/controllers/challengeController.js`
- Create: `backend/src/controllers/downloadsController.js`
- Modify: `backend/src/routes/progress.js` → thêm journey route
- Create: `backend/src/routes/challenge.js`
- Create: `backend/src/routes/downloads.js`
- Modify: `backend/app.js` — mount routes mới
- Test: `backend/tests/journey.test.js`
- Test: `backend/tests/challenge.test.js`
- Test: `backend/tests/downloads.test.js`

- [ ] **Bước 1: Tạo `src/models/UserChallengeScore.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UserChallengeScore = sequelize.define('UserChallengeScore', {
  hsk_level: { type: DataTypes.TINYINT, allowNull: false },
  best_score: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_games: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_played_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

module.exports = UserChallengeScore
```

- [ ] **Bước 2: Tạo `src/models/Download.js`**

```js
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Download = sequelize.define('Download', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  file_url: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.ENUM('vocabulary_list', 'pinyin_chart', 'slide', 'other'), allowNull: false },
  hsk_level: { type: DataTypes.TINYINT },
})

module.exports = Download
```

- [ ] **Bước 3: Cập nhật `src/models/index.js` — thêm 2 models mới**

```js
const User = require('./User')
const Vocabulary = require('./Vocabulary')
const UserVocabularyProgress = require('./UserVocabularyProgress')
const Lesson = require('./Lesson')
const LessonQuestion = require('./LessonQuestion')
const UserLessonHistory = require('./UserLessonHistory')
const UserChallengeScore = require('./UserChallengeScore')
const Download = require('./Download')

User.hasMany(UserVocabularyProgress, { foreignKey: 'user_id' })
Vocabulary.hasMany(UserVocabularyProgress, { foreignKey: 'vocabulary_id' })
UserVocabularyProgress.belongsTo(User, { foreignKey: 'user_id' })
UserVocabularyProgress.belongsTo(Vocabulary, { foreignKey: 'vocabulary_id' })

Lesson.hasMany(LessonQuestion, { foreignKey: 'lesson_id', as: 'questions' })
LessonQuestion.belongsTo(Lesson, { foreignKey: 'lesson_id' })

User.hasMany(UserLessonHistory, { foreignKey: 'user_id' })
Lesson.hasMany(UserLessonHistory, { foreignKey: 'lesson_id' })
UserLessonHistory.belongsTo(User, { foreignKey: 'user_id' })
UserLessonHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' })

User.hasMany(UserChallengeScore, { foreignKey: 'user_id' })
UserChallengeScore.belongsTo(User, { foreignKey: 'user_id' })

module.exports = { User, Vocabulary, UserVocabularyProgress, Lesson, LessonQuestion, UserLessonHistory, UserChallengeScore, Download }
```

- [ ] **Bước 4: Tạo `src/controllers/journeyController.js`**

```js
const { UserVocabularyProgress, Vocabulary } = require('../models')

const STAGES = [
  { stage: 1, icon: '🌱', name: 'Mầm xanh', hsk_levels: [1] },
  { stage: 2, icon: '🐢', name: 'Rùa kiên nhẫn', hsk_levels: [2] },
  { stage: 3, icon: '🐸', name: 'Ếch nhảy xa', hsk_levels: [3] },
  { stage: 4, icon: '🦁', name: 'Sư tử dũng mãnh', hsk_levels: [4] },
  { stage: 5, icon: '🦊', name: 'Cáo thông minh', hsk_levels: [5] },
  { stage: 6, icon: '🦅', name: 'Đại bàng bay cao', hsk_levels: [6] },
  { stage: 7, icon: '🦋', name: 'Bướm biến đổi', hsk_levels: [7, 8] },
  { stage: 8, icon: '🐉', name: 'Rồng thành thạo', hsk_levels: [9] },
]

const HSK_TOTALS = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000, 7: 8000, 8: 11000, 9: 15000 }

async function getJourney(req, res) {
  const userId = req.userId

  const progress = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    include: [{ model: Vocabulary, attributes: ['hsk_level'] }],
    attributes: ['id'],
  })

  const countByLevel = {}
  progress.forEach((p) => {
    const lvl = p.Vocabulary?.hsk_level
    if (lvl) countByLevel[lvl] = (countByLevel[lvl] || 0) + 1
  })

  const stages = STAGES.map((s) => {
    const totalVocab = s.hsk_levels.reduce((sum, lvl) => sum + (HSK_TOTALS[lvl] || 0), 0)
    const learnedVocab = s.hsk_levels.reduce((sum, lvl) => sum + (countByLevel[lvl] || 0), 0)
    const percent = totalVocab > 0 ? Math.min(100, Math.round((learnedVocab / totalVocab) * 100)) : 0
    return { ...s, totalVocab, learnedVocab, percent, completed: percent >= 80 }
  })

  const currentStage = stages.findIndex((s) => !s.completed)
  res.json({ stages, currentStage: currentStage === -1 ? 7 : currentStage })
}

module.exports = { getJourney }
```

- [ ] **Bước 5: Tạo `src/controllers/challengeController.js`**

```js
const { Op } = require('sequelize')
const sequelize = require('../config/database')
const { Vocabulary, UserChallengeScore } = require('../models')

async function startChallenge(req, res) {
  const { hsk_level } = req.query
  if (!hsk_level) return res.status(400).json({ message: 'hsk_level là bắt buộc' })

  const words = await Vocabulary.findAll({
    where: { hsk_level: parseInt(hsk_level) },
    order: sequelize.literal('rand()'),
    limit: 10,
  })

  if (words.length < 4) return res.status(400).json({ message: 'Không đủ từ vựng để tạo game' })

  // Với mỗi từ, tạo 3 đáp án sai từ các từ khác trong cùng cấp
  const allWords = await Vocabulary.findAll({ where: { hsk_level: parseInt(hsk_level) } })

  const questions = words.map((word) => {
    const wrongPool = allWords.filter((w) => w.id !== word.id)
    const shuffled = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...shuffled.map((w) => w.meaning_vi), word.meaning_vi].sort(() => Math.random() - 0.5)
    const correctIndex = options.indexOf(word.meaning_vi)
    return {
      id: word.id,
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      options,
      correct_index: correctIndex,
    }
  })

  res.json({ questions, hsk_level: parseInt(hsk_level) })
}

async function submitChallenge(req, res) {
  const userId = req.userId
  const { hsk_level, answers, time_taken_ms } = req.body
  // answers: [{ question_id, selected_index, time_ms }]

  if (!hsk_level || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'hsk_level và answers là bắt buộc' })
  }

  const words = await Vocabulary.findAll({ where: { id: answers.map((a) => a.question_id) } })
  const wordMap = {}
  words.forEach((w) => { wordMap[w.id] = w })

  let score = 0
  const results = answers.map((a) => {
    const word = wordMap[a.question_id]
    if (!word) return { question_id: a.question_id, correct: false, score: 0 }

    const allWords2 = []
    const wrongPool2 = []
    const options2 = []
    const correctIndex2 = 0

    const isCorrect = a.selected_index !== undefined && a.selected_index === a.correct_index
    let questionScore = 0
    if (isCorrect) {
      questionScore = 10
      if (a.time_ms && a.time_ms < 5000) questionScore += 5
    }
    score += questionScore
    return { question_id: a.question_id, correct: isCorrect, score: questionScore }
  })

  // Lưu/cập nhật điểm cao nhất
  let record = await UserChallengeScore.findOne({ where: { user_id: userId, hsk_level } })
  if (!record) {
    record = await UserChallengeScore.create({ user_id: userId, hsk_level, best_score: score, total_games: 1 })
  } else {
    await record.update({
      best_score: Math.max(record.best_score, score),
      total_games: record.total_games + 1,
      last_played_at: new Date(),
    })
  }

  res.json({ score, best_score: Math.max(record.best_score, score), results })
}

module.exports = { startChallenge, submitChallenge }
```

- [ ] **Bước 6: Tạo `src/controllers/downloadsController.js`**

```js
const { Download } = require('../models')

async function getDownloads(req, res) {
  const { hsk_level } = req.query
  const where = {}
  if (hsk_level) where.hsk_level = parseInt(hsk_level)

  const downloads = await Download.findAll({ where, order: [['hsk_level', 'ASC'], ['title', 'ASC']] })
  res.json(downloads)
}

module.exports = { getDownloads }
```

- [ ] **Bước 7: Tạo `src/routes/challenge.js`**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { startChallenge, submitChallenge } = require('../controllers/challengeController')

router.get('/start', verifyToken, startChallenge)
router.post('/submit', verifyToken, submitChallenge)

module.exports = router
```

- [ ] **Bước 8: Tạo `src/routes/downloads.js`**

```js
const express = require('express')
const router = express.Router()
const { getDownloads } = require('../controllers/downloadsController')

router.get('/', getDownloads)

module.exports = router
```

- [ ] **Bước 9: Cập nhật `src/routes/progress.js` — thêm journey endpoint**

```js
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getProgress } = require('../controllers/progressController')
const { getJourney } = require('../controllers/journeyController')

router.get('/', verifyToken, getProgress)
router.get('/journey', verifyToken, getJourney)

module.exports = router
```

- [ ] **Bước 10: Cập nhật `app.js` — mount 2 routes mới**

Thêm vào sau các route hiện có:

```js
const challengeRoutes = require('./src/routes/challenge')
const downloadsRoutes = require('./src/routes/downloads')

// Thêm sau app.use('/api/progress', progressRoutes)
app.use('/api/challenge', challengeRoutes)
app.use('/api/downloads', downloadsRoutes)
```

- [ ] **Bước 11: Viết tests**

Tạo `tests/journey.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')

let accessToken

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await request(app).post('/api/auth/register').send({ email: 'journey@test.com', password: '123456' })
  const res = await request(app).post('/api/auth/login').send({ email: 'journey@test.com', password: '123456' })
  accessToken = res.body.accessToken
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/progress/journey', () => {
  test('trả về 8 giai đoạn hành trình', async () => {
    const res = await request(app).get('/api/progress/journey').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.stages).toHaveLength(8)
    expect(res.body).toHaveProperty('currentStage')
  })

  test('mỗi giai đoạn có đủ fields', async () => {
    const res = await request(app).get('/api/progress/journey').set('Authorization', `Bearer ${accessToken}`)
    const stage = res.body.stages[0]
    expect(stage).toHaveProperty('icon')
    expect(stage).toHaveProperty('name')
    expect(stage).toHaveProperty('percent')
    expect(stage).toHaveProperty('completed')
  })
})
```

Tạo `tests/challenge.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')
const { Vocabulary } = require('../src/models')

let accessToken

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await request(app).post('/api/auth/register').send({ email: 'challenge@test.com', password: '123456' })
  const res = await request(app).post('/api/auth/login').send({ email: 'challenge@test.com', password: '123456' })
  accessToken = res.body.accessToken

  // Tạo đủ từ vựng để chạy game
  const words = Array.from({ length: 20 }, (_, i) => ({
    hanzi: `词${i}`, pinyin: `cí${i}`, meaning_vi: `nghĩa ${i}`, hsk_level: 1
  }))
  await Vocabulary.bulkCreate(words)
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/challenge/start', () => {
  test('trả về 10 câu hỏi với 4 đáp án mỗi câu', async () => {
    const res = await request(app).get('/api/challenge/start?hsk_level=1').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.questions).toHaveLength(10)
    expect(res.body.questions[0].options).toHaveLength(4)
  })

  test('trả về 400 nếu thiếu hsk_level', async () => {
    const res = await request(app).get('/api/challenge/start').set('Authorization', `Bearer ${accessToken}`)
    expect(res.status).toBe(400)
  })
})

describe('POST /api/challenge/submit', () => {
  test('nộp kết quả, nhận điểm và best_score', async () => {
    const startRes = await request(app).get('/api/challenge/start?hsk_level=1').set('Authorization', `Bearer ${accessToken}`)
    const questions = startRes.body.questions

    const answers = questions.map((q) => ({
      question_id: q.id,
      selected_index: q.correct_index,
      correct_index: q.correct_index,
      time_ms: 3000,
    }))

    const res = await request(app)
      .post('/api/challenge/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ hsk_level: 1, answers })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('score')
    expect(res.body).toHaveProperty('best_score')
    expect(res.body.score).toBeGreaterThan(0)
  })
})
```

Tạo `tests/downloads.test.js`:

```js
const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')
const { Download } = require('../src/models')

beforeAll(async () => {
  await sequelize.sync({ force: true })
  await Download.bulkCreate([
    { title: 'Từ vựng HSK 1', file_url: '/downloads/hsk1.pdf', file_type: 'vocabulary_list', hsk_level: 1 },
    { title: 'Từ vựng HSK 2', file_url: '/downloads/hsk2.pdf', file_type: 'vocabulary_list', hsk_level: 2 },
    { title: 'Bảng Pinyin', file_url: '/downloads/pinyin.pdf', file_type: 'pinyin_chart', hsk_level: null },
  ])
})

afterAll(async () => { await sequelize.close() })

describe('GET /api/downloads', () => {
  test('trả về tất cả tài liệu', async () => {
    const res = await request(app).get('/api/downloads')
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(3)
  })

  test('lọc theo hsk_level=1 trả về 1 tài liệu', async () => {
    const res = await request(app).get('/api/downloads?hsk_level=1')
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
  })

  test('không cần token (public endpoint)', async () => {
    const res = await request(app).get('/api/downloads')
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Bước 12: Chạy tests mới**

```bash
cd backend
npx jest tests/journey.test.js tests/challenge.test.js tests/downloads.test.js
```

Expected: PASS — tất cả tests

- [ ] **Bước 13: Commit**

```bash
git add .
git commit -m "feat: journey map, vocabulary challenge, downloads API"
```

---

## Task 16: Frontend Journey Map + Challenge + Downloads

**Files:**
- Create: `frontend/src/views/JourneyView.vue`
- Create: `frontend/src/views/ChallengeView.vue`
- Create: `frontend/src/views/ResourcesView.vue`
- Create: `frontend/src/components/JourneyMap.vue`
- Create: `frontend/src/components/ChallengeGame.vue`
- Create: `frontend/src/services/journeyService.js`
- Create: `frontend/src/services/challengeService.js`
- Create: `frontend/src/services/downloadsService.js`
- Create: `frontend/src/stores/journey.js`
- Create: `frontend/src/stores/challenge.js`
- Modify: `frontend/src/router/index.js` — thêm 3 routes mới
- Modify: `frontend/src/App.vue` — thêm nav links

- [ ] **Bước 1: Tạo `src/services/journeyService.js`**

```js
import api from './api'

export async function fetchJourney() {
  const res = await api.get('/progress/journey')
  return res.data
}
```

- [ ] **Bước 2: Tạo `src/services/challengeService.js`**

```js
import api from './api'

export async function startChallenge(hsk_level) {
  const res = await api.get('/challenge/start', { params: { hsk_level } })
  return res.data
}

export async function submitChallenge(hsk_level, answers) {
  const res = await api.post('/challenge/submit', { hsk_level, answers })
  return res.data
}
```

- [ ] **Bước 3: Tạo `src/services/downloadsService.js`**

```js
import axios from 'axios'

export async function fetchDownloads(hsk_level) {
  const params = hsk_level ? { hsk_level } : {}
  const res = await axios.get('http://localhost:3000/api/downloads', { params })
  return res.data
}
```

- [ ] **Bước 4: Tạo `src/stores/journey.js`**

```js
import { defineStore } from 'pinia'
import { fetchJourney } from '../services/journeyService'

export const useJourneyStore = defineStore('journey', {
  state: () => ({ stages: [], currentStage: 0 }),
  actions: {
    async load() {
      const data = await fetchJourney()
      this.stages = data.stages
      this.currentStage = data.currentStage
    },
  },
})
```

- [ ] **Bước 5: Tạo `src/stores/challenge.js`**

```js
import { defineStore } from 'pinia'
import { startChallenge, submitChallenge } from '../services/challengeService'

export const useChallengeStore = defineStore('challenge', {
  state: () => ({
    questions: [],
    hsk_level: null,
    result: null,
    currentIndex: 0,
    answers: [],
  }),
  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || null,
    isFinished: (state) => state.currentIndex >= state.questions.length && state.questions.length > 0,
  },
  actions: {
    async start(hsk_level) {
      const data = await startChallenge(hsk_level)
      this.questions = data.questions
      this.hsk_level = hsk_level
      this.currentIndex = 0
      this.answers = []
      this.result = null
    },
    recordAnswer(selected_index, time_ms) {
      const q = this.currentQuestion
      this.answers.push({
        question_id: q.id,
        selected_index,
        correct_index: q.correct_index,
        time_ms,
      })
      this.currentIndex++
    },
    async submit() {
      this.result = await submitChallenge(this.hsk_level, this.answers)
    },
  },
})
```

- [ ] **Bước 6: Tạo `src/components/JourneyMap.vue`**

```vue
<template>
  <div class="journey-map">
    <div
      v-for="(stage, idx) in stages"
      :key="stage.stage"
      class="journey-stage"
      :class="{
        completed: stage.completed,
        current: idx === currentStage,
        locked: idx > currentStage && !stage.completed
      }"
      @click="$emit('select', stage)"
    >
      <div class="stage-icon">{{ stage.icon }}</div>
      <div class="stage-info">
        <p class="stage-name">{{ stage.name }}</p>
        <p class="stage-hsk">HSK {{ stage.hsk_levels.join('-') }}</p>
        <div class="stage-progress-bar">
          <div class="stage-progress-fill" :style="{ width: stage.percent + '%' }"></div>
        </div>
        <p class="stage-percent">{{ stage.percent }}%</p>
      </div>
      <div v-if="stage.completed" class="completed-badge">✓</div>
      <div v-if="idx === currentStage" class="current-badge">Đang học</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stages: { type: Array, default: () => [] },
  currentStage: { type: Number, default: 0 },
})
defineEmits(['select'])
</script>
```

- [ ] **Bước 7: Tạo `src/views/JourneyView.vue`**

```vue
<template>
  <div class="journey-view">
    <h2>Bản Đồ Hành Trình</h2>
    <p class="subtitle">Từ mầm xanh 🌱 đến rồng thành thạo 🐉</p>

    <div v-if="loading">Đang tải...</div>
    <JourneyMap
      v-else
      :stages="store.stages"
      :current-stage="store.currentStage"
      @select="onSelectStage"
    />

    <div v-if="selectedStage" class="stage-detail">
      <h3>{{ selectedStage.icon }} {{ selectedStage.name }}</h3>
      <p>HSK {{ selectedStage.hsk_levels.join(' & ') }}</p>
      <p>Tiến độ: {{ selectedStage.learnedVocab }}/{{ selectedStage.totalVocab }} từ ({{ selectedStage.percent }}%)</p>
      <RouterLink :to="`/learn?hsk_level=${selectedStage.hsk_levels[0]}`">Học từ vựng cấp này</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import JourneyMap from '../components/JourneyMap.vue'
import { useJourneyStore } from '../stores/journey'

const store = useJourneyStore()
const loading = ref(true)
const selectedStage = ref(null)

onMounted(async () => {
  await store.load()
  loading.value = false
})

function onSelectStage(stage) {
  selectedStage.value = stage
}
</script>
```

- [ ] **Bước 8: Tạo `src/components/ChallengeGame.vue`**

```vue
<template>
  <div class="challenge-game">
    <div class="challenge-header">
      <span>Câu {{ currentIndex + 1 }}/{{ total }}</span>
      <span class="timer" :class="{ warning: timeLeft <= 5 }">⏱ {{ timeLeft }}s</span>
    </div>

    <div class="question-card">
      <p class="hanzi">{{ question.hanzi }}</p>
      <p class="pinyin">{{ question.pinyin }}</p>
    </div>

    <ul class="options">
      <li
        v-for="(option, idx) in question.options"
        :key="idx"
        :class="{ selected: selectedIdx === idx, disabled: answered }"
        @click="!answered && selectAnswer(idx)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  question: Object,
  currentIndex: Number,
  total: Number,
})
const emit = defineEmits(['answer'])

const selectedIdx = ref(null)
const answered = ref(false)
const timeLeft = ref(15)
let timer = null

watch(() => props.question, () => {
  selectedIdx.value = null
  answered.value = false
  timeLeft.value = 15
  startTimer()
}, { immediate: true })

onUnmounted(() => clearInterval(timer))

function startTimer() {
  clearInterval(timer)
  const startTime = Date.now()
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      if (!answered.value) autoSubmit()
    }
  }, 1000)
}

function selectAnswer(idx) {
  clearInterval(timer)
  selectedIdx.value = idx
  answered.value = true
  const elapsed = (15 - timeLeft.value) * 1000
  emit('answer', { selected_index: idx, time_ms: elapsed })
}

function autoSubmit() {
  answered.value = true
  emit('answer', { selected_index: -1, time_ms: 15000 })
}
</script>
```

- [ ] **Bước 9: Tạo `src/views/ChallengeView.vue`**

```vue
<template>
  <div class="challenge-view">
    <h2>⚔️ Thử Thách Từ Vựng</h2>

    <!-- Chọn cấp để bắt đầu -->
    <div v-if="!store.questions.length && !store.result">
      <p>Chọn cấp HSK để thử thách:</p>
      <div class="level-grid">
        <button
          v-for="n in 9"
          :key="n"
          class="level-btn"
          @click="startGame(n)"
          :disabled="loading"
        >
          HSK {{ n }}
        </button>
      </div>
    </div>

    <!-- Đang chơi -->
    <div v-else-if="store.currentQuestion && !store.result">
      <ChallengeGame
        :question="store.currentQuestion"
        :current-index="store.currentIndex"
        :total="store.questions.length"
        @answer="handleAnswer"
      />
    </div>

    <!-- Tự động submit khi hết câu -->
    <div v-else-if="store.isFinished && !store.result">
      <p>Đang tính điểm...</p>
    </div>

    <!-- Kết quả -->
    <div v-else-if="store.result" class="result-screen">
      <h3>Kết quả</h3>
      <p class="score-big">{{ store.result.score }} điểm</p>
      <p>Điểm cao nhất: {{ store.result.best_score }}</p>
      <p>Đúng: {{ store.result.results.filter(r => r.correct).length }}/{{ store.result.results.length }} câu</p>
      <button @click="resetGame">Chơi lại</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ChallengeGame from '../components/ChallengeGame.vue'
import { useChallengeStore } from '../stores/challenge'

const store = useChallengeStore()
const loading = ref(false)

async function startGame(level) {
  loading.value = true
  await store.start(level)
  loading.value = false
}

async function handleAnswer({ selected_index, time_ms }) {
  store.recordAnswer(selected_index, time_ms)
  if (store.isFinished) {
    await store.submit()
  }
}

function resetGame() {
  store.$reset()
}
</script>
```

- [ ] **Bước 10: Tạo `src/views/ResourcesView.vue`**

```vue
<template>
  <div class="resources-view">
    <h2>Tài Liệu Học Tập</h2>

    <div class="filter-bar">
      <label>Lọc theo cấp:
        <select v-model="selectedLevel" @change="loadDownloads">
          <option value="">Tất cả</option>
          <option v-for="n in 9" :key="n" :value="n">HSK {{ n }}</option>
        </select>
      </label>
    </div>

    <div v-if="loading">Đang tải...</div>

    <div v-else-if="!downloads.length" class="empty">
      <p>Chưa có tài liệu nào.</p>
    </div>

    <ul v-else class="downloads-list">
      <li v-for="doc in downloads" :key="doc.id" class="download-item">
        <div class="doc-info">
          <p class="doc-title">{{ doc.title }}</p>
          <p v-if="doc.description" class="doc-desc">{{ doc.description }}</p>
          <span class="doc-badge">{{ typeLabel(doc.file_type) }}</span>
          <span v-if="doc.hsk_level" class="hsk-badge">HSK {{ doc.hsk_level }}</span>
        </div>
        <a :href="doc.file_url" target="_blank" download class="btn-download">⬇ Tải xuống</a>
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

const TYPE_LABELS = {
  vocabulary_list: 'Từ vựng',
  pinyin_chart: 'Bảng Pinyin',
  slide: 'Slide bài giảng',
  other: 'Khác',
}

onMounted(() => loadDownloads())

async function loadDownloads() {
  loading.value = true
  downloads.value = await fetchDownloads(selectedLevel.value || undefined)
  loading.value = false
}

function typeLabel(type) {
  return TYPE_LABELS[type] || type
}
</script>
```

- [ ] **Bước 11: Cập nhật `src/router/index.js` — thêm 3 routes**

Thêm vào mảng `routes`:

```js
{ path: '/journey', component: () => import('../views/JourneyView.vue'), meta: { requiresAuth: true } },
{ path: '/challenge', component: () => import('../views/ChallengeView.vue'), meta: { requiresAuth: true } },
{ path: '/resources', component: () => import('../views/ResourcesView.vue') },
```

- [ ] **Bước 12: Cập nhật `src/App.vue` — thêm nav links**

Thêm vào `<nav>`:

```html
<RouterLink to="/journey">Hành trình</RouterLink>
<RouterLink to="/challenge">Thử thách</RouterLink>
<RouterLink to="/resources">Tài liệu</RouterLink>
```

- [ ] **Bước 13: Cập nhật `src/views/HomeView.vue` — thêm nav cards mới**

```vue
<template>
  <div class="home">
    <h1>APP Học Tiếng Trung</h1>
    <p>Học tiếng Trung theo chuẩn HSK 1–9</p>
    <div class="nav-cards">
      <RouterLink to="/journey" class="nav-card">🗺️ Hành trình</RouterLink>
      <RouterLink to="/learn" class="nav-card">📚 Học từ vựng</RouterLink>
      <RouterLink to="/challenge" class="nav-card">⚔️ Thử thách</RouterLink>
      <RouterLink to="/listen" class="nav-card">🎧 Luyện nghe</RouterLink>
      <RouterLink to="/read" class="nav-card">📖 Luyện đọc</RouterLink>
      <RouterLink to="/resources" class="nav-card">📄 Tài liệu</RouterLink>
      <RouterLink to="/dashboard" class="nav-card">📊 Tiến độ</RouterLink>
    </div>
  </div>
</template>
```

- [ ] **Bước 14: Commit**

```bash
git add .
git commit -m "feat: journey map, vocabulary challenge game, resources download page"
```

---

## Task 14: Kiểm tra MVP end-to-end

- [ ] **Bước 1: Khởi động backend**

```bash
cd backend
npm run dev
# Expected: "Backend running on port 3000"
```

- [ ] **Bước 2: Khởi động frontend**

```bash
cd frontend
npm run dev
# Expected: "Local: http://localhost:5173"
```

- [ ] **Bước 3: Kiểm tra checklist MVP**

Mở trình duyệt tại `http://localhost:5173`:

- [ ] Đăng ký tài khoản mới → redirect về dashboard
- [ ] Đăng nhập, đăng xuất hoạt động đúng
- [ ] Vào `/learn` khi chưa đăng nhập → redirect về `/login`
- [ ] Thêm từ vựng thủ công vào DB, vào `/learn` → thẻ flashcard hiển thị
- [ ] Lật thẻ → thấy nghĩa, đánh giá → thẻ tiếp theo
- [ ] Vào `/listen` → chọn bài nghe → phát audio → trả lời quiz → xem điểm
- [ ] Vào `/read` → đọc bài → click từ highlight → xem nghĩa → trả lời quiz
- [ ] Vào `/dashboard` → thấy số từ đã học, streak, biểu đồ tuần
- [ ] Vào `/journey` → thấy 8 giai đoạn hành trình, giai đoạn hiện tại được highlight
- [ ] Vào `/challenge` → chọn HSK 1 → chơi 10 câu hỏi → xem điểm sau khi hết
- [ ] Vào `/resources` → thấy danh sách tài liệu, click tải được

- [ ] **Bước 4: Chạy toàn bộ test backend lần cuối**

```bash
cd backend && npx jest
# Expected: tất cả tests PASS
```

---

## Self-Review

**Spec coverage:**
- [x] Auth (register/login/refresh) — Task 4
- [x] Vocabulary + SRS SM-2 — Task 3, 5, 10
- [x] Luyện nghe — Task 6, 11
- [x] Luyện đọc — Task 6, 12
- [x] Dashboard/Progress — Task 7, 13
- [x] Route guard JWT — Task 9
- [x] Tất cả 10 API endpoints — Tasks 4,5,6,7

**Type consistency:**
- `calculateNextReview` dùng nhất quán ở Task 3 và 5
- `store.rateCard(rating)` → `submitReview(id, rating)` → POST `/vocabulary/review/:id` — nhất quán
- `store.submitAnswers(answers)` → `submitLesson(id, answers)` — nhất quán

**Không có TBD/TODO placeholder.**
