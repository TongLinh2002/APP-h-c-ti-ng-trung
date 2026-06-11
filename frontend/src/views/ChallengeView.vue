<template>
  <div class="challenge-view">
    <h2>⚔️ {{ $t('challenge.title') }}</h2>

    <div v-if="!store.questions.length && !store.result" class="level-select">
      <p>{{ $t('challenge.selectLevel') }}</p>
      <div class="level-grid">
        <button v-for="n in 9" :key="n" class="level-btn" :disabled="starting" @click="start(n)">
          HSK {{ n }}
        </button>
      </div>
    </div>

    <div v-else-if="store.currentQuestion">
      <ChallengeGame
        :question="store.currentQuestion"
        :current-index="store.currentIndex"
        :total="store.questions.length"
        @answer="handleAnswer"
      />
    </div>

    <div v-else-if="store.isFinished && !store.result" class="calculating">
      {{ $t('challenge.calculating') }}
    </div>

    <div v-else-if="store.result" class="result-screen">
      <p class="trophy">🏆</p>
      <p class="score-big">{{ store.result.score }} {{ $t('challenge.points') }}</p>
      <p class="best">{{ $t('challenge.bestScore') }} <strong>{{ store.result.best_score }}</strong></p>
      <p class="correct-count">{{ $t('challenge.correct') }} {{ store.result.results.filter(r => r.correct).length }}/{{ store.result.results.length }} câu</p>
      <button class="btn-retry" @click="store.reset()">{{ $t('challenge.playAgain') }}</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChallengeGame from '../components/ChallengeGame.vue'
import { useChallengeStore } from '../stores/challenge'
const store = useChallengeStore()
const starting = ref(false)
const { t } = useI18n()

async function start(level) { starting.value = true; await store.start(level); starting.value = false }
async function handleAnswer({ selected_index, time_ms }) {
  store.recordAnswer(selected_index, time_ms)
  if (store.isFinished) await store.submit()
}
</script>
<style scoped>
h2 { margin-bottom: 20px; }
.level-select p { margin-bottom: 16px; color: #666; }
.level-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 360px; }
.level-btn { padding: 14px; background: white; border: 2px solid #eee; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.15s; }
.level-btn:hover:not(:disabled) { border-color: #d32f2f; color: #d32f2f; }
.level-btn:disabled { opacity: 0.5; }
.calculating { text-align: center; padding: 40px; color: #888; }
.result-screen { text-align: center; padding: 32px; }
.trophy { font-size: 4rem; margin-bottom: 12px; }
.score-big { font-size: 3rem; font-weight: 700; color: #d32f2f; margin-bottom: 8px; }
.best, .correct-count { color: #666; margin-bottom: 6px; }
.btn-retry { margin-top: 20px; padding: 12px 32px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
</style>
