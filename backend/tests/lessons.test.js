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
  await LessonQuestion.create({ lesson_id: lessonId, question: 'Câu hỏi 1?', options: JSON.stringify(['A', 'B', 'C', 'D']), correct_answer: 0 })
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
