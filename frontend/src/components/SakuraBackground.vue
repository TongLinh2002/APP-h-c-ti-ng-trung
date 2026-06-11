<template>
  <div ref="container" class="sakura-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const COLORS = ['#ffb7c5', '#ffccd5', '#ff85a1', '#ffd6e0', '#ffaec9', '#ff9ab2']
const MAX_PETALS = 20

let timer = null

function createPetal() {
  if (!container.value) return
  if (container.value.children.length >= MAX_PETALS) return

  const el = document.createElement('div')
  el.className = 'petal'

  const width = 8 + Math.random() * 10
  const duration = 3 + Math.random() * 3
  const drift = Math.round(-40 + Math.random() * 100)

  el.style.cssText = `
    left: ${Math.random() * 93}%;
    width: ${width}px;
    height: ${width * 0.65}px;
    background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
    animation-duration: ${duration}s;
    --drift: ${drift}px;
  `

  container.value.appendChild(el)
  setTimeout(() => el.remove(), duration * 1000 + 200)
}

function spawnLoop() {
  createPetal()
  timer = setTimeout(spawnLoop, 400 + Math.random() * 350)
}

onMounted(() => {
  for (let i = 0; i < 8; i++) {
    setTimeout(createPetal, i * 250)
  }
  timer = setTimeout(spawnLoop, 2200)
})

onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.sakura-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.sakura-container :deep(.petal) {
  position: absolute;
  top: -20px;
  border-radius: 50% 0 50% 0;
  opacity: 0;
  animation: petalFall linear forwards;
}

@keyframes petalFall {
  0%   { transform: translateY(0) rotate(0deg) translateX(0);             opacity: 0; }
  10%  { opacity: 0.85; }
  85%  { opacity: 0.75; }
  100% { transform: translateY(110vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
}
</style>
