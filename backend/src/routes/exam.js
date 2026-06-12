const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const ctrl = require('../controllers/examController')

router.get('/',     ctrl.listExams)
router.get('/:id',  ctrl.getExam)
router.post('/:id/submit', verifyToken, ctrl.submitExam)

module.exports = router
