const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getVocabulary, getReviewCards, submitReview } = require('../controllers/vocabularyController')

router.get('/', verifyToken, getVocabulary)
router.get('/review', verifyToken, getReviewCards)
router.post('/review/:id', verifyToken, submitReview)

module.exports = router
