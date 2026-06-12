const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const verifyAdmin = require('../middleware/verifyAdmin')
const ctrl = require('../controllers/adminController')
const examCtrl = require('../controllers/examAdminController')

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Lỗi upload file' })
    next()
  })
}

router.use(verifyAdmin)

router.get('/users', ctrl.listUsers)
router.patch('/users/:id/role', ctrl.updateUserRole)

router.get('/downloads', ctrl.listDownloads)
router.post('/downloads', uploadSingle, ctrl.createDownload)
router.put('/downloads/:id', uploadSingle, ctrl.updateDownload)
router.delete('/downloads/:id', ctrl.deleteDownload)

router.post('/vocabulary/preview', uploadSingle, ctrl.previewVocabImport)
router.post('/vocabulary/import', ctrl.confirmVocabImport)
router.get('/vocabulary', ctrl.listVocabulary)
router.post('/vocabulary', ctrl.createVocabulary)
router.delete('/vocabulary/:id', ctrl.deleteVocabulary)

router.get('/lessons', ctrl.listLessons)
router.post('/lessons', ctrl.createLesson)
router.delete('/lessons/:id', ctrl.deleteLesson)

// Exam admin routes
router.get('/exams',                               examCtrl.adminListExams)
router.post('/exams',                              examCtrl.createExam)
router.put('/exams/:id',                           examCtrl.updateExam)
router.delete('/exams/:id',                        examCtrl.deleteExam)
router.post('/exams/:id/sections',   uploadSingle, examCtrl.createSection)
router.put('/exams/sections/:sid',   uploadSingle, examCtrl.updateSection)
router.delete('/exams/sections/:sid',              examCtrl.deleteSection)
router.post('/exams/sections/:sid/questions',      examCtrl.createQuestion)
router.put('/exams/questions/:qid',                examCtrl.updateQuestion)
router.delete('/exams/questions/:qid',             examCtrl.deleteQuestion)

module.exports = router
