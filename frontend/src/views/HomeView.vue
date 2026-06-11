<template>
  <div class="home">
    <div class="hero">
      <h1>{{ $t('home.title') }}</h1>
      <p>{{ $t('home.subtitle') }}</p>
    </div>

    <div class="nav-grid">
      <RouterLink to="/journey" class="nav-card journey">
        <span class="card-icon">🗺️</span>
        <span class="card-title">{{ $t('home.journey') }}</span>
        <span class="card-desc">{{ $t('home.journeyDesc') }}</span>
      </RouterLink>
      <RouterLink to="/learn" class="nav-card learn">
        <span class="card-icon">📚</span>
        <span class="card-title">{{ $t('home.learn') }}</span>
        <span class="card-desc">{{ $t('home.learnDesc') }}</span>
      </RouterLink>
      <RouterLink to="/challenge" class="nav-card challenge">
        <span class="card-icon">⚔️</span>
        <span class="card-title">{{ $t('home.challenge') }}</span>
        <span class="card-desc">{{ $t('home.challengeDesc') }}</span>
      </RouterLink>
      <RouterLink to="/listen" class="nav-card listen">
        <span class="card-icon">🎧</span>
        <span class="card-title">{{ $t('home.listen') }}</span>
        <span class="card-desc">{{ $t('home.listenDesc') }}</span>
      </RouterLink>
      <RouterLink to="/read" class="nav-card read">
        <span class="card-icon">📖</span>
        <span class="card-title">{{ $t('home.read') }}</span>
        <span class="card-desc">{{ $t('home.readDesc') }}</span>
      </RouterLink>
      <RouterLink to="/resources" class="nav-card resources">
        <span class="card-icon">📄</span>
        <span class="card-title">{{ $t('home.resources') }}</span>
        <span class="card-desc">{{ $t('home.resourcesDesc') }}</span>
      </RouterLink>
      <RouterLink to="/dashboard" class="nav-card dashboard">
        <span class="card-icon">📊</span>
        <span class="card-title">{{ $t('home.dashboard') }}</span>
        <span class="card-desc">{{ $t('home.dashboardDesc') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
// i18n is globally available as $t in templates via vue-i18n registration in main.js
</script>

<style scoped>
.hero { text-align: center; padding: 48px 0 32px; }
.hero h1 { font-size: 2.2rem; margin-bottom: 12px; }
.hero p { color: #666; font-size: 1.1rem; }
.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
.nav-card { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: white; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
.nav-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.card-icon { font-size: 2.5rem; margin-bottom: 10px; }
.card-title { font-weight: 700; font-size: 1rem; color: #333; margin-bottom: 4px; }
.card-desc { font-size: 0.8rem; color: #888; text-align: center; }
</style>
