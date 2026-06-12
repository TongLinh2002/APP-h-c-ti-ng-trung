const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getProfile, updateProfile } = require('../controllers/authController')

router.get('/', verifyToken, getProfile)
router.put('/', verifyToken, updateProfile)

module.exports = router
