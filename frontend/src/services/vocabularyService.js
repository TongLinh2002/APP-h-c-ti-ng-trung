import api from './api'

export async function fetchReviewCards() {
  const res = await api.get('/vocabulary/review')
  return res.data
}

export async function submitReview(vocabularyId, rating) {
  const res = await api.post(`/vocabulary/review/${vocabularyId}`, { rating })
  return res.data
}
