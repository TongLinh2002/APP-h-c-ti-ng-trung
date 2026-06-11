const { Download } = require('../models')

async function getDownloads(req, res) {
  const { hsk_level } = req.query
  const where = {}
  if (hsk_level) where.hsk_level = parseInt(hsk_level)

  const downloads = await Download.findAll({ where, order: [['hsk_level', 'ASC'], ['title', 'ASC']] })
  res.json(downloads)
}

module.exports = { getDownloads }
