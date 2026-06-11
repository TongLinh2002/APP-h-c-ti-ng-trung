const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getProgress } = require('../controllers/progressController')
const { getJourney } = require('../controllers/journeyController')

router.get('/', verifyToken, getProgress)
router.get('/journey', verifyToken, getJourney)

module.exports = router
