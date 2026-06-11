/**
 * SM-2 Spaced Repetition algorithm
 * rating: 0=Quên, 1=Khó, 2=Bình thường, 3=Dễ
 */
function calculateNextReview({ ease_factor, interval_days, rating }) {
  let newEaseFactor = ease_factor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
  if (newEaseFactor < 1.3) newEaseFactor = 1.3

  let newInterval
  if (rating < 2) {
    newInterval = 1
  } else if (interval_days === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(interval_days * newEaseFactor)
  }

  const next_review_at = new Date()
  next_review_at.setDate(next_review_at.getDate() + newInterval)

  return {
    ease_factor: parseFloat(newEaseFactor.toFixed(2)),
    interval_days: newInterval,
    next_review_at,
  }
}

module.exports = { calculateNextReview }
