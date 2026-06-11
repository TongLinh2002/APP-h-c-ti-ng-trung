const { calculateNextReview } = require('../src/utils/srs')

describe('SM-2 Algorithm', () => {
  test('rating=0 (Quên): interval reset về 1, ease_factor giảm', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 0 })
    expect(result.interval_days).toBe(1)
    expect(result.ease_factor).toBeLessThan(2.5)
  })

  test('rating=1 (Khó): interval reset về 1, ease_factor giảm nhẹ', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 1 })
    expect(result.interval_days).toBe(1)
    expect(result.ease_factor).toBeLessThan(2.5)
  })

  test('rating=2 (Bình thường): interval tăng, ease_factor giữ nguyên', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 2 })
    expect(result.interval_days).toBeGreaterThan(6)
    expect(result.ease_factor).toBeCloseTo(2.5)
  })

  test('rating=3 (Dễ): interval tăng nhiều, ease_factor tăng', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 6, rating: 3 })
    expect(result.interval_days).toBeGreaterThan(6)
    expect(result.ease_factor).toBeGreaterThan(2.5)
  })

  test('ease_factor không bao giờ nhỏ hơn 1.3', () => {
    const result = calculateNextReview({ ease_factor: 1.3, interval_days: 1, rating: 0 })
    expect(result.ease_factor).toBeGreaterThanOrEqual(1.3)
  })

  test('trả về next_review_at là Date trong tương lai', () => {
    const result = calculateNextReview({ ease_factor: 2.5, interval_days: 1, rating: 2 })
    expect(result.next_review_at).toBeInstanceOf(Date)
    expect(result.next_review_at.getTime()).toBeGreaterThan(Date.now())
  })
})
