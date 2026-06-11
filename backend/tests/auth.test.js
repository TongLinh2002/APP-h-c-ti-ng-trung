const request = require('supertest')
const app = require('../app')
const sequelize = require('../src/config/database')

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
