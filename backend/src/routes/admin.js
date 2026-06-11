const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const verifyAdmin = require('../middleware/verifyAdmin')
const ctrl = require('../controllers/adminController')

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

router.use(verifyAdmin)

router.get('/users', ctrl.listUsers)
router.patch('/users/:id/role', ctrl.updateUserRole)

router.get('/downloads', ctrl.listDownloads)
router.post('/downloads', upload.single('file'), ctrl.createDownload)
router.put('/downloads/:id', upload.single('file'), ctrl.updateDownload)
router.delete('/downloads/:id', ctrl.deleteDownload)

router.get('/vocabulary', ctrl.listVocabulary)
router.post('/vocabulary', ctrl.createVocabulary)
router.delete('/vocabulary/:id', ctrl.deleteVocabulary)

router.get('/lessons', ctrl.listLessons)
router.post('/lessons', ctrl.createLesson)
router.delete('/lessons/:id', ctrl.deleteLesson)

module.exports = router
