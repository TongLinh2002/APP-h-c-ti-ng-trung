<template>
  <div class="learn-view">

    <!-- LEVEL SELECTION SCREEN -->
    <div v-if="!activeLevel">
      <h2>{{ $t('learn.title') }}</h2>
      <p class="subtitle">{{ $t('learn.chooseLevel') }}</p>

      <div v-if="store.statsLoading" class="loading">{{ $t('learn.loading') }}</div>

      <div v-else class="level-grid">
        <div
          v-for="level in 9"
          :key="level"
          class="level-card"
          :class="{ 'has-cards': hasCards(level), 'no-vocab': !hasVocab(level) }"
          @click="startLevel(level)"
        >
          <div class="level-title">HSK {{ level }}</div>
          <div class="level-counts" v-if="hasVocab(level)">
            <span v-if="stats(level).due > 0" class="count-due">{{ stats(level).due }} {{ $t('learn.review') }}</span>
            <span v-if="stats(level).new > 0" class="count-new">{{ stats(level).new }} {{ $t('learn.new') }}</span>
            <span v-if="!hasCards(level)" class="count-done">{{ $t('learn.allDone') }}</span>
          </div>
          <div class="level-counts" v-else>
            <span class="count-empty">{{ $t('learn.noVocab') }}</span>
          </div>
          <div class="level-total">{{ stats(level).total || 0 }} {{ $t('learn.words') }}</div>
        </div>
      </div>
    </div>

    <!-- FLASHCARD SESSION SCREEN -->
    <div v-else>
      <div class="session-topbar">
        <button class="btn-back" @click="backToLevels">← {{ $t('learn.back') }}</button>
        <span class="session-title">HSK {{ activeLevel }}</span>
        <div class="session-badges">
          <span v-if="reviewCount > 0" class="badge badge-review">{{ reviewCount }} {{ $t('learn.review') }}</span>
          <span v-if="newCount > 0" class="badge badge-new">{{ newCount }} {{ $t('learn.new') }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading">{{ $t('learn.loading') }}</div>

      <div v-else-if="store.sessionDone" class="session-done">
        <p class="done-icon">🎉</p>
        <p>{{ $t('learn.sessionDone') }}</p>
        <div class="done-actions">
          <button class="btn-primary" @click="reloadLevel">{{ $t('learn.studyAgain') }}</button>
          <button class="btn-secondary" @click="backToLevels">{{ $t('learn.chooseOther') }}</button>
        </div>
      </div>

      <div v-else-if="store.currentCard">
        <div class="card-meta">
          <span v-if="store.currentCard.isNew" class="card-tag new-tag">{{ $t('learn.newWord') }}</span>
          <span v-else class="card-tag review-tag">{{ $t('learn.reviewWord') }}</span>
          <span class="progress-text">{{ store.currentIndex + 1 }} / {{ store.totalCards }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (store.currentIndex / store.totalCards * 100) + '%' }"></div>
        </div>
        <Flashcard :card="store.currentCard" @rate="store.rateCard" />
      </div>

      <div v-else class="empty-state">
        <p class="empty-icon">✅</p>
        <p>{{ $t('learn.noCards') }}</p>
        <p class="sub">{{ $t('learn.noCardsSub') }}</p>
        <button class="btn-secondary" style="margin-top:16px" @click="backToLevels">{{ $t('learn.chooseOther') }}</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Flashcard from '../components/Flashcard.vue'
import { useVocabularyStore } from '../stores/vocabulary'

const { t } = useI18n()
const store = useVocabularyStore()

const activeLevel = ref(null)
const loading = ref(false)

const reviewCount = computed(() => store.reviewCards.filter(c => !c.isNew).length)
const newCount = computed(() => store.reviewCards.filter(c => c.isNew).length)

function stats(level) {
  return store.levelStats[level] || { total: 0, new: 0, due: 0 }
}
function hasVocab(level) {
  return stats(level).total > 0
}
function hasCards(level) {
  return stats(level).due > 0 || stats(level).new > 0
}

async function startLevel(level) {
  if (!hasVocab(level)) return
  activeLevel.value = level
  loading.value = true
  await store.loadReviewCards(level)
  loading.value = false
}

async function reloadLevel() {
  loading.value = true
  await store.loadReviewCards(activeLevel.value)
  loading.value = false
}

function backToLevels() {
  activeLevel.value = null
  store.loadLevelStats()
}

onMounted(() => store.loadLevelStats())
</script>

<style scoped>
.learn-view { max-width: 700px; margin: 0 auto; }
h2 { margin-bottom: 6px; }
.subtitle { color: #888; margin-bottom: 24px; font-size: 0.95rem; }
.loading { color: #888; text-align: center; padding: 40px; }

/* Level grid */
.level-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 500px) {
  .level-grid { grid-template-columns: repeat(2, 1fr); }
}
.level-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.level-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
.level-card.has-cards { border-color: #d32f2f; }
.level-card.no-vocab { opacity: 0.45; cursor: default; }
.level-card.no-vocab:hover { transform: none; box-shadow: none; }
.level-title { font-size: 1.3rem; font-weight: 700; color: #d32f2f; margin-bottom: 8px; }
.level-counts { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 6px; min-height: 22px; }
.count-due { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.count-new { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.count-done { color: #aaa; font-size: 0.78rem; }
.count-empty { color: #bbb; font-size: 0.78rem; }
.level-total { color: #999; font-size: 0.78rem; }

/* Session topbar */
.session-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.btn-back {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}
.btn-back:hover { background: #f5f5f5; }
.session-title { font-size: 1.1rem; font-weight: 700; color: #d32f2f; }
.session-badges { display: flex; gap: 8px; margin-left: auto; }
.badge { padding: 3px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.badge-review { background: #e3f2fd; color: #1565c0; }
.badge-new { background: #e8f5e9; color: #2e7d32; }

/* Card session */
.card-meta { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; }
.card-tag { padding: 3px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.new-tag { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
.review-tag { background: #e3f2fd; color: #1565c0; border: 1px solid #90caf9; }
.progress-text { color: #888; font-size: 0.88rem; }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; margin-bottom: 20px; }
.progress-fill { height: 100%; background: #d32f2f; border-radius: 3px; transition: width 0.3s; }

/* Session done */
.session-done { padding: 40px; text-align: center; }
.done-icon { font-size: 4rem; margin-bottom: 12px; }
.session-done p { font-size: 1.2rem; margin-bottom: 20px; }
.done-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; }
.btn-primary:hover { background: #b71c1c; }
.btn-secondary { padding: 12px 28px; background: white; color: #d32f2f; border: 2px solid #d32f2f; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 600; }
.btn-secondary:hover { background: #ffebee; }

/* Empty */
.empty-state { padding: 60px 20px; color: #666; text-align: center; }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.sub { font-size: 0.9rem; margin-top: 8px; }
</style>
