const { UserVocabularyProgress, Vocabulary } = require('../models')

const STAGES = [
  { stage: 1, icon: '🌱', name: 'Mầm xanh', hsk_levels: [1] },
  { stage: 2, icon: '🐢', name: 'Rùa kiên nhẫn', hsk_levels: [2] },
  { stage: 3, icon: '🐸', name: 'Ếch nhảy xa', hsk_levels: [3] },
  { stage: 4, icon: '🦁', name: 'Sư tử dũng mãnh', hsk_levels: [4] },
  { stage: 5, icon: '🦊', name: 'Cáo thông minh', hsk_levels: [5] },
  { stage: 6, icon: '🦅', name: 'Đại bàng bay cao', hsk_levels: [6] },
  { stage: 7, icon: '🦋', name: 'Bướm biến đổi', hsk_levels: [7, 8] },
  { stage: 8, icon: '🐉', name: 'Rồng thành thạo', hsk_levels: [9] },
]

const HSK_TOTALS = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2500, 6: 5000, 7: 8000, 8: 11000, 9: 15000 }

async function getJourney(req, res) {
  const userId = req.userId

  const progress = await UserVocabularyProgress.findAll({
    where: { user_id: userId },
    include: [{ model: Vocabulary, attributes: ['hsk_level'] }],
    attributes: ['id'],
  })

  const countByLevel = {}
  progress.forEach((p) => {
    const lvl = p.Vocabulary?.hsk_level
    if (lvl) countByLevel[lvl] = (countByLevel[lvl] || 0) + 1
  })

  const stages = STAGES.map((s) => {
    const totalVocab = s.hsk_levels.reduce((sum, lvl) => sum + (HSK_TOTALS[lvl] || 0), 0)
    const learnedVocab = s.hsk_levels.reduce((sum, lvl) => sum + (countByLevel[lvl] || 0), 0)
    const percent = totalVocab > 0 ? Math.min(100, Math.round((learnedVocab / totalVocab) * 100)) : 0
    return { ...s, totalVocab, learnedVocab, percent, completed: percent >= 80 }
  })

  const currentStage = stages.findIndex((s) => !s.completed)
  res.json({ stages, currentStage: currentStage === -1 ? 7 : currentStage })
}

module.exports = { getJourney }
