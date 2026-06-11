const jwt = require('jsonwebtoken')

function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token không tồn tại' })

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ' })
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Không có quyền admin' })
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  })
}

module.exports = verifyAdmin
