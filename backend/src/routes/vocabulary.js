const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getVocabulary, getReviewCards, submitReview, getSessionStats } = require('../controllers/vocabularyController')

router.get('/', verifyToken, getVocabulary)
router.get('/session-stats', verifyToken, getSessionStats)
router.get('/review', verifyToken, getReviewCards)
router.post('/review/:id', verifyToken, submitReview)

module.exports = router
