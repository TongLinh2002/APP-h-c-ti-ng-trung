const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { getLessons, getLessonById, submitLesson } = require('../controllers/lessonsController')

router.get('/', verifyToken, getLessons)
router.get('/:id', verifyToken, getLessonById)
router.post('/:id/submit', verifyToken, submitLesson)

module.exports = router
