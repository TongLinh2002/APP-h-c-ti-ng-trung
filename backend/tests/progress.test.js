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
