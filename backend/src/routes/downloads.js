const express = require('express')
const router = express.Router()
const { getDownloads } = require('../controllers/downloadsController')

router.get('/', getDownloads)

module.exports = router
