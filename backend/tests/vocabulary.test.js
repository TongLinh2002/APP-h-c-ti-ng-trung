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
    { hanzi: '谢谢', pinyin: 'xiè xie', meaning_vi: 'Cảm ơn', hsk_level: 1 },
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
    const vocabRes = await request(app).get('/api/vocabulary').set('Authorization', `Bearer ${accessToken}`)
    const vocabId = vocabRes.body[0].id

    const res = await request(app)
      .post(`/api/vocabulary/review/${vocabId}`)
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
