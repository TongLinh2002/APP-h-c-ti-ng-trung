<template>
  <div class="journey-map">
    <div
      v-for="(stage, idx) in stages"
      :key="stage.stage"
      class="stage-card"
      :class="{ completed: stage.completed, current: idx === currentStage, locked: idx > currentStage && !stage.completed }"
      @click="$emit('select', stage)"
    >
      <div class="stage-icon">{{ stage.icon }}</div>
      <div class="stage-body">
        <p class="stage-name">{{ stage.name }}</p>
        <p class="stage-hsk">HSK {{ stage.hsk_levels.join(' & ') }}</p>
        <div class="stage-bar"><div class="stage-fill" :style="{ width: stage.percent + '%' }"></div></div>
        <p class="stage-pct">{{ stage.percent }}%</p>
      </div>
      <span v-if="stage.completed" class="badge done">✓</span>
      <span v-else-if="idx === currentStage" class="badge active">Đang học</span>
    </div>
  </div>
</template>
<script setup>
defineProps({ stages: Array, currentStage: Number })
defineEmits(['select'])
</script>
<style scoped>
.journey-map { display: flex; flex-direction: column; gap: 12px; }
.stage-card { display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); cursor: pointer; position: relative; transition: transform 0.15s; }
.stage-card:hover { transform: translateX(4px); }
.stage-card.current { border-left: 4px solid #d32f2f; }
.stage-card.completed { opacity: 0.75; }
.stage-card.locked { opacity: 0.45; cursor: default; }
.stage-icon { font-size: 2.4rem; min-width: 52px; text-align: center; }
.stage-body { flex: 1; }
.stage-name { font-weight: 700; margin-bottom: 2px; }
.stage-hsk { font-size: 0.8rem; color: #888; margin-bottom: 6px; }
.stage-bar { height: 6px; background: #eee; border-radius: 3px; margin-bottom: 4px; }
.stage-fill { height: 100%; background: #d32f2f; border-radius: 3px; }
.stage-pct { font-size: 0.8rem; color: #666; }
.badge { position: absolute; right: 16px; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
.badge.done { background: #e8f5e9; color: #2e7d32; }
.badge.active { background: #ffebee; color: #d32f2f; }
</style>
