<template>
  <div class="journey-view">
    <h2>🗺️ {{ $t('journey.title') }}</h2>
    <p class="subtitle">{{ $t('journey.subtitle') }}</p>
    <div v-if="loading" class="loading">{{ $t('journey.loading') }}</div>
    <JourneyMap v-else :stages="store.stages" :current-stage="store.currentStage" @select="selected = $event" />
    <div v-if="selected" class="detail-panel">
      <h3>{{ selected.icon }} {{ selected.name }}</h3>
      <p>HSK {{ selected.hsk_levels.join(' & ') }} — {{ selected.learnedVocab }}/{{ selected.totalVocab }} {{ $t('journey.words') }} ({{ selected.percent }}%)</p>
      <RouterLink :to="`/learn`" class="btn-go">{{ $t('journey.goLearn') }}</RouterLink>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import JourneyMap from '../components/JourneyMap.vue'
import { useJourneyStore } from '../stores/journey'
const store = useJourneyStore()
const loading = ref(true)
const selected = ref(null)
const { t } = useI18n()
onMounted(async () => { await store.load(); loading.value = false })
</script>
<style scoped>
h2 { margin-bottom: 6px; }
.subtitle { color: #888; margin-bottom: 24px; }
.loading { color: #888; }
.detail-panel { margin-top: 20px; background: #fff3e0; border-radius: 10px; padding: 16px 20px; }
.detail-panel h3 { margin-bottom: 6px; }
.btn-go { display: inline-block; margin-top: 12px; padding: 8px 20px; background: #d32f2f; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; }
</style>
