require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const sequelize = require('./src/config/database')

const authRoutes = require('./src/routes/auth')
const vocabularyRoutes = require('./src/routes/vocabulary')
const lessonsRoutes = require('./src/routes/lessons')
const progressRoutes = require('./src/routes/progress')
const challengeRoutes = require('./src/routes/challenge')
const downloadsRoutes = require('./src/routes/downloads')
const adminRoutes = require('./src/routes/admin')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/vocabulary', vocabularyRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/challenge', challengeRoutes)
app.use('/api/downloads', downloadsRoutes)
app.use('/api/admin', adminRoutes)

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
