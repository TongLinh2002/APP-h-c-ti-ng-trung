const { User, Download, Vocabulary, Lesson, LessonQuestion } = require('../models')
const path = require('path')
const XLSX = require('xlsx')

// Detect HSK level from sheet name
// Supports: "HSK 1", "HSK1", "Cấp 1", "Level 2", "hsk_3", "1", "Sheet1" ...
function detectLevelFromSheetName(name) {
  const cleaned = name.toLowerCase().replace(/[_\-\s]+/g, ' ').trim()
  // Explicit HSK/level keyword + number
  const keywordMatch = cleaned.match(/(?:hsk|cấp|cap|level)\s*(\d+)/)
  if (keywordMatch) return parseInt(keywordMatch[1])
  // Sheet name is just a number "1".."9"
  const numOnly = cleaned.match(/^(\d)$/)
  if (numOnly) return parseInt(numOnly[1])
  return null
}

function parseSheet(ws, sheetLevel) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  if (rows.length < 2) return []

  const header = rows[0].map(h => String(h).toLowerCase())
  const col = (keywords) => {
    const idx = header.findIndex(h => keywords.some(k => h.includes(k)))
    return idx >= 0 ? idx : -1
  }
  const hanziCol      = col(['汉字','hanzi','词汇','word','chinese']) >= 0 ? col(['汉字','hanzi','词汇','word','chinese']) : 0
  const pinyinCol     = col(['拼音','pinyin'])                        >= 0 ? col(['拼音','pinyin'])                        : 1
  const meaningCol    = col(['越南','nghĩa','meaning','tiếng việt','viet']) >= 0 ? col(['越南','nghĩa','meaning','tiếng việt','viet']) : 2
  const hskCol        = col(['hsk','级别','level','cấp'])             >= 0 ? col(['hsk','级别','level','cấp'])             : -1
  const sentenceCol   = col(['例句','sentence','ví dụ','câu'])        >= 0 ? col(['例句','sentence','ví dụ','câu'])        : -1
  const sentPinyinCol = col(['例句拼音','sentence pinyin','câu pinyin']) >= 0 ? col(['例句拼音','sentence pinyin','câu pinyin']) : -1

  const words = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    const hanzi = String(r[hanziCol] || '').trim()
    if (!hanzi) continue

    // Priority: column value → sheet-detected level
    const colLevel = hskCol >= 0 ? parseInt(r[hskCol]) || null : null
    const hsk = colLevel || sheetLevel

    words.push({
      hanzi,
      pinyin:           String(r[pinyinCol]     || '').trim(),
      meaning_vi:       String(r[meaningCol]    || '').trim(),
      hsk_level:        hsk,
      example_sentence: sentenceCol   >= 0 ? String(r[sentenceCol]   || '').trim() : '',
      example_pinyin:   sentPinyinCol >= 0 ? String(r[sentPinyinCol] || '').trim() : '',
    })
  }
  return words
}

// Parse all sheets — each sheet maps to its HSK level
// Returns { words: [...], byLevel: { 1: N, 2: N, ... }, sheets: [...] }
function parseVocabXlsx(filePath, defaultLevel) {
  const wb = XLSX.readFile(filePath)
  const allWords = []
  const byLevel = {}
  const sheetLog = []

  wb.SheetNames.forEach((sheetName, idx) => {
    // Detect level: from name, or fallback to sheet index+1, or defaultLevel
    const detected = detectLevelFromSheetName(sheetName)
    const level = detected || (wb.SheetNames.length <= 9 ? idx + 1 : null) || defaultLevel

    if (!level || level < 1 || level > 9) {
      sheetLog.push({ sheet: sheetName, level: null, count: 0, skipped: true })
      return
    }

    const ws = wb.Sheets[sheetName]
    const words = parseSheet(ws, level)
    allWords.push(...words)

    const count = words.length
    byLevel[level] = (byLevel[level] || 0) + count
    sheetLog.push({ sheet: sheetName, level, count })
  })

  return { words: allWords, byLevel, sheets: sheetLog }
}

// ── USERS ───────────────────────────────────────────────────────────────────

async function listUsers(req, res) {
  const users = await User.findAll({
    attributes: ['id', 'email', 'display_name', 'role', 'current_hsk_level', 'createdAt'],
    order: [['createdAt', 'DESC']],
  })
  res.json(users)
}

async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Role không hợp lệ' })
  const user = await User.findByPk(id)
  if (!user) return res.status(404).json({ message: 'Không tìm thấy user' })
  await user.update({ role })
  res.json({ message: 'Cập nhật quyền thành công', user: { id: user.id, email: user.email, role: user.role } })
}

// ── DOWNLOADS ────────────────────────────────────────────────────────────────

async function listDownloads(req, res) {
  const downloads = await Download.findAll({ order: [['hsk_level', 'ASC'], ['title', 'ASC']] })
  res.json(downloads)
}

async function createDownload(req, res) {
  const { title, description, file_type, hsk_level } = req.body
  if (!title || !file_type) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })

  let file_url = req.body.file_url || ''
  if (req.file) {
    file_url = `/uploads/${req.file.filename}`
  }
  if (!file_url) return res.status(400).json({ message: 'Cần cung cấp file hoặc URL' })

  const download = await Download.create({
    title,
    description,
    file_url,
    file_type,
    hsk_level: hsk_level ? parseInt(hsk_level) : null,
  })

  // Auto-import vocabulary when uploading a vocabulary list xlsx/xls
  let imported = 0
  let byLevel = {}
  let sheets = []
  if (req.file && file_type === 'vocabulary_list') {
    const ext = path.extname(req.file.originalname).toLowerCase()
    if (ext === '.xlsx' || ext === '.xls') {
      const hskDefault = hsk_level ? parseInt(hsk_level) : null
      const result = parseVocabXlsx(req.file.path, hskDefault)
      const valid = result.words.filter(w => w.hsk_level >= 1 && w.hsk_level <= 9)
      if (valid.length > 0) {
        await Vocabulary.bulkCreate(valid, { ignoreDuplicates: true })
        imported = valid.length
        byLevel = result.byLevel
        sheets = result.sheets
      }
    }
  }

  res.status(201).json({ ...download.toJSON(), imported, byLevel, sheets })
}

async function updateDownload(req, res) {
  const { id } = req.params
  const download = await Download.findByPk(id)
  if (!download) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })

  const { title, description, file_type, hsk_level } = req.body
  let file_url = req.body.file_url || download.file_url
  if (req.file) file_url = `/uploads/${req.file.filename}`

  await download.update({ title, description, file_url, file_type, hsk_level: hsk_level ? parseInt(hsk_level) : null })
  res.json(download)
}

async function deleteDownload(req, res) {
  const { id } = req.params
  const download = await Download.findByPk(id)
  if (!download) return res.status(404).json({ message: 'Không tìm thấy tài liệu' })
  await download.destroy()
  res.json({ message: 'Đã xóa tài liệu' })
}

// ── VOCABULARY ────────────────────────────────────────────────────────────────

async function listVocabulary(req, res) {
  const { hsk_level } = req.query
  const where = hsk_level ? { hsk_level: parseInt(hsk_level) } : {}
  const words = await Vocabulary.findAll({ where, order: [['hsk_level', 'ASC'], ['hanzi', 'ASC']] })
  res.json(words)
}

async function createVocabulary(req, res) {
  const { hanzi, pinyin, meaning_vi, hsk_level, example_sentence, example_pinyin, audio_url } = req.body
  if (!hanzi || !pinyin || !meaning_vi || !hsk_level) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })
  const word = await Vocabulary.create({ hanzi, pinyin, meaning_vi, hsk_level: parseInt(hsk_level), example_sentence, example_pinyin, audio_url })
  res.status(201).json(word)
}

async function deleteVocabulary(req, res) {
  const { id } = req.params
  const word = await Vocabulary.findByPk(id)
  if (!word) return res.status(404).json({ message: 'Không tìm thấy từ vựng' })
  await word.destroy()
  res.json({ message: 'Đã xóa từ vựng' })
}

// ── LESSONS ──────────────────────────────────────────────────────────────────

async function listLessons(req, res) {
  const lessons = await Lesson.findAll({ order: [['hsk_level', 'ASC'], ['title', 'ASC']] })
  res.json(lessons)
}

async function createLesson(req, res) {
  const { title, type, content, audio_url, transcript, hsk_level, questions } = req.body
  if (!title || !type || !hsk_level) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' })

  const lesson = await Lesson.create({ title, type, content, audio_url, transcript, hsk_level: parseInt(hsk_level) })

  if (Array.isArray(questions) && questions.length > 0) {
    for (const q of questions) {
      await LessonQuestion.create({ lesson_id: lesson.id, question: q.question, options: q.options, correct_answer: q.correct_answer })
    }
  }

  res.status(201).json(lesson)
}

async function deleteLesson(req, res) {
  const { id } = req.params
  const lesson = await Lesson.findByPk(id)
  if (!lesson) return res.status(404).json({ message: 'Không tìm thấy bài học' })
  await LessonQuestion.destroy({ where: { lesson_id: id } })
  await lesson.destroy()
  res.json({ message: 'Đã xóa bài học' })
}

module.exports = {
  listUsers, updateUserRole,
  listDownloads, createDownload, updateDownload, deleteDownload,
  listVocabulary, createVocabulary, deleteVocabulary,
  listLessons, createLesson, deleteLesson,
}
