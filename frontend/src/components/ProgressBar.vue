<template>
  <div class="progress-wrap">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: Math.min(100, percent) + '%' }"></div>
    </div>
    <span class="pct">{{ Math.min(100, percent) }}%</span>
  </div>
</template>
<script setup>
defineProps({ percent: { type: Number, default: 0 } })
</script>
<style scoped>
.progress-wrap { display: flex; align-items: center; gap: 10px; }
.progress-track { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #d32f2f; border-radius: 4px; transition: width 0.4s; }
.pct { font-size: 0.8rem; color: #666; min-width: 36px; }
</style>
