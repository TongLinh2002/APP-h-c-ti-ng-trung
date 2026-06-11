<template>
  <div class="learn-view">
    <h2>📚 Học từ vựng</h2>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="store.sessionDone" class="session-done">
      <p class="done-icon">🎉</p>
      <p>Hoàn thành phiên học hôm nay!</p>
      <button class="btn-primary" @click="reload">Học lại</button>
    </div>

    <div v-else-if="store.currentCard">
      <div class="progress-info">
        <span>{{ store.currentIndex + 1 }} / {{ store.totalCards }}</span>
        <div class="progress-bar"><div class="progress-fill" :style="{ width: ((store.currentIndex) / store.totalCards * 100) + '%' }"></div></div>
      </div>
      <Flashcard :card="store.currentCard" @rate="store.rateCard" />
    </div>

    <div v-else class="empty-state">
      <p>🎊 Không có thẻ nào cần ôn hôm nay!</p>
      <p class="sub">Quay lại sau để ôn tập tiếp.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Flashcard from '../components/Flashcard.vue'
import { useVocabularyStore } from '../stores/vocabulary'

const store = useVocabularyStore()
const loading = ref(true)

onMounted(async () => {
  await store.loadReviewCards()
  loading.value = false
})

async function reload() {
  loading.value = true
  await store.loadReviewCards()
  loading.value = false
}
</script>

<style scoped>
.learn-view { text-align: center; }
h2 { margin-bottom: 24px; }
.loading { color: #888; }
.progress-info { margin-bottom: 20px; }
.progress-bar { height: 6px; background: #eee; border-radius: 3px; margin-top: 8px; }
.progress-fill { height: 100%; background: #d32f2f; border-radius: 3px; transition: width 0.3s; }
.session-done { padding: 40px; }
.done-icon { font-size: 4rem; margin-bottom: 12px; }
.session-done p { font-size: 1.2rem; margin-bottom: 20px; }
.btn-primary { padding: 12px 28px; background: #d32f2f; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; }
.empty-state { padding: 60px 20px; color: #666; }
.sub { font-size: 0.9rem; margin-top: 8px; }
</style>
