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

  test('user mới: tất cả stages có percent = 0', async () => {
    const res = await request(app).get('/api/progress/journey').set('Authorization', `Bearer ${accessToken}`)
    res.body.stages.forEach((s) => expect(s.percent).toBe(0))
  })
})
