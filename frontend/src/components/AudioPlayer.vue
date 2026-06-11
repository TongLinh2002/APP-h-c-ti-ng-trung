<template>
  <div class="audio-player">
    <audio ref="audioEl" :src="src" @timeupdate="onTimeUpdate" @loadedmetadata="onMeta" @ended="onEnded" />
    <div class="player-controls">
      <button class="play-btn" @click="togglePlay">{{ playing ? '⏸' : '▶️' }}</button>
      <div class="time-bar">
        <span class="time-text">{{ fmt(currentTime) }}</span>
        <input class="seek-bar" type="range" :max="duration || 1" :value="currentTime" @input="seek" step="0.1" />
        <span class="time-text">{{ fmt(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ src: String })
const audioEl = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (playing.value) { audioEl.value.pause() } else { audioEl.value.play() }
  playing.value = !playing.value
}
function onTimeUpdate() { currentTime.value = audioEl.value.currentTime }
function onMeta() { duration.value = audioEl.value.duration }
function onEnded() { playing.value = false }
function seek(e) { audioEl.value.currentTime = parseFloat(e.target.value) }
function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
</script>

<style scoped>
.audio-player { background: #f5f5f5; border-radius: 10px; padding: 14px 16px; margin: 16px 0; }
.player-controls { display: flex; align-items: center; gap: 12px; }
.play-btn { font-size: 1.4rem; background: none; border: none; cursor: pointer; }
.time-bar { display: flex; align-items: center; gap: 8px; flex: 1; }
.seek-bar { flex: 1; accent-color: #d32f2f; }
.time-text { font-size: 0.8rem; color: #666; min-width: 36px; }
</style>
