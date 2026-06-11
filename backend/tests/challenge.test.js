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
  test('nộp kết quả đúng hết, nhận điểm cao', async () => {
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

  test('trả về 400 nếu thiếu answers', async () => {
    const res = await request(app)
      .post('/api/challenge/submit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ hsk_level: 1 })
    expect(res.status).toBe(400)
  })
})
