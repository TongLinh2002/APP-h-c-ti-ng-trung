const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

async function register(req, res) {
  const { email, password, display_name } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })

  const existing = await User.findOne({ where: { email } })
  if (existing) return res.status(409).json({ message: 'Email đã được sử dụng' })

  const password_hash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password_hash, display_name })

  res.status(201).json({ message: 'Đăng ký thành công', userId: user.id })
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })

  const user = await User.findOne({ where: { email } })
  if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })

  const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, display_name: user.display_name, current_hsk_level: user.current_hsk_level, role: user.role } })
}

async function refresh(req, res) {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken là bắt buộc' })

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Refresh token không hợp lệ' })
    const accessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ accessToken })
  })
}

async function getProfile(req, res) {
  const user = await User.findByPk(req.userId, {
    attributes: ['id', 'email', 'display_name', 'current_hsk_level', 'role', 'createdAt'],
  })
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })
  res.json(user)
}

async function updateProfile(req, res) {
  const user = await User.findByPk(req.userId)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' })

  const { display_name, current_hsk_level } = req.body
  const updates = {}
  if (display_name !== undefined) updates.display_name = String(display_name).trim().slice(0, 64) || user.display_name
  if (current_hsk_level !== undefined) {
    const lvl = parseInt(current_hsk_level)
    if (lvl >= 1 && lvl <= 9) updates.current_hsk_level = lvl
  }

  await user.update(updates)
  res.json({ id: user.id, email: user.email, display_name: user.display_name, current_hsk_level: user.current_hsk_level, role: user.role })
}

module.exports = { register, login, refresh, getProfile, updateProfile }
