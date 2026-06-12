require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const sequelize = require('./src/config/database')

// Ensure uploads directory exists at runtime
const uploadsDir = path.join(__dirname, 'public/uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const authRoutes = require('./src/routes/auth')
const profileRoutes = require('./src/routes/profile')
const vocabularyRoutes = require('./src/routes/vocabulary')
const lessonsRoutes = require('./src/routes/lessons')
const progressRoutes = require('./src/routes/progress')
const challengeRoutes = require('./src/routes/challenge')
const downloadsRoutes = require('./src/routes/downloads')
const adminRoutes = require('./src/routes/admin')
const examRoutes = require('./src/routes/exam')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Endpoint seed dữ liệu — chỉ chạy khi có SEED_SECRET đúng
app.post('/api/seed', async (req, res) => {
  if (req.headers['x-seed-secret'] !== process.env.SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  try {
    const runSeed = require('./seed')
    await runSeed()
    res.json({ message: 'Seed thành công' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/vocabulary', vocabularyRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/challenge', challengeRoutes)
app.use('/api/downloads', downloadsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/exams', examRoutes)

// Global error handler — returns JSON instead of HTML for all errors
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Lỗi upload: ${err.message}` })
  }
  console.error(err)
  res.status(500).json({ message: err.message || 'Lỗi server' })
})

const PORT = process.env.PORT || 3000

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate()
      return
    } catch (err) {
      if (i === retries) throw err
      console.log(`DB not ready (attempt ${i}/${retries}), retrying in ${delay / 1000}s...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

async function start() {
  await connectWithRetry()
  await sequelize.sync()
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}

start().catch(console.error)

module.exports = app
