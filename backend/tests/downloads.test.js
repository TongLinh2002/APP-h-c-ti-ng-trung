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
