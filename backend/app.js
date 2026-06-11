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
