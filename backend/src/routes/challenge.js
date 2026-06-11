const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { startChallenge, submitChallenge } = require('../controllers/challengeController')

router.get('/start', verifyToken, startChallenge)
router.post('/submit', verifyToken, submitChallenge)

module.exports = router
