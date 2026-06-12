<template>
  <div class="home">

    <!-- LOGGED IN: Quick access dashboard -->
    <template v-if="authStore.isLoggedIn">
      <div class="welcome-bar">
        <div class="welcome-text">
          <h2>Xin chào, {{ authStore.user?.display_name || 'bạn' }}! 👋</h2>
          <p>{{ $t('home.subtitle') }}</p>
        </div>
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
    </template>

    <!-- GUEST: Landing page -->
    <template v-else>
      <div class="hero">
        <div class="hero-badge">🇨🇳 学中文</div>
        <h1>{{ $t('home.title') }}</h1>
        <p class="hero-sub">{{ $t('home.subtitle') }}</p>
        <div class="hero-actions">
          <RouterLink to="/register" class="btn-start">{{ $t('home.getStarted') }}</RouterLink>
          <RouterLink to="/login" class="btn-login-ghost">{{ $t('auth.login') }}</RouterLink>
        </div>
      </div>

      <div class="features">
        <div class="feature-card">
          <span class="feat-icon">📚</span>
          <h3>{{ $t('home.feat1Title') }}</h3>
          <p>{{ $t('home.feat1Desc') }}</p>
        </div>
        <div class="feature-card">
          <span class="feat-icon">🔁</span>
          <h3>{{ $t('home.feat2Title') }}</h3>
          <p>{{ $t('home.feat2Desc') }}</p>
        </div>
        <div class="feature-card">
          <span class="feat-icon">⚔️</span>
          <h3>{{ $t('home.feat3Title') }}</h3>
          <p>{{ $t('home.feat3Desc') }}</p>
        </div>
        <div class="feature-card">
          <span class="feat-icon">🎧</span>
          <h3>{{ $t('home.feat4Title') }}</h3>
          <p>{{ $t('home.feat4Desc') }}</p>
        </div>
      </div>

      <div class="cta-footer">
        <p>{{ $t('home.ctaText') }}</p>
        <RouterLink to="/register" class="btn-start">{{ $t('home.getStarted') }}</RouterLink>
      </div>
    </template>

  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
/* ── Logged-in view ── */
.welcome-bar { margin-bottom: 24px; }
.welcome-text h2 { font-size: 1.6rem; margin-bottom: 4px; }
.welcome-text p { color: #888; font-size: 0.95rem; }
.nav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.nav-card { display: flex; flex-direction: column; align-items: center; padding: 24px 16px; background: white; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; }
.nav-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.card-icon { font-size: 2.5rem; margin-bottom: 10px; }
.card-title { font-weight: 700; font-size: 1rem; color: #333; margin-bottom: 4px; }
.card-desc { font-size: 0.8rem; color: #888; text-align: center; }

/* ── Guest landing page ── */
.hero { text-align: center; padding: 64px 16px 48px; }
.hero-badge { display: inline-block; background: #d32f2f; color: white; font-size: 1.2rem; padding: 6px 20px; border-radius: 20px; margin-bottom: 20px; font-weight: 700; letter-spacing: 2px; }
.hero h1 { font-size: 2.4rem; margin-bottom: 14px; color: #222; }
.hero-sub { font-size: 1.1rem; color: #666; margin-bottom: 32px; max-width: 480px; margin-left: auto; margin-right: auto; }
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-start { padding: 14px 32px; background: #d32f2f; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem; transition: background 0.2s; }
.btn-start:hover { background: #b71c1c; }
.btn-login-ghost { padding: 14px 32px; background: white; color: #d32f2f; border: 2px solid #d32f2f; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1rem; transition: background 0.2s; }
.btn-login-ghost:hover { background: #ffebee; }

.features { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin: 0 0 48px; }
.feature-card { background: white; border-radius: 12px; padding: 28px 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.feat-icon { font-size: 2.4rem; display: block; margin-bottom: 12px; }
.feature-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: #333; }
.feature-card p { font-size: 0.85rem; color: #777; line-height: 1.5; }

.cta-footer { text-align: center; padding: 32px 16px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.cta-footer p { font-size: 1.1rem; margin-bottom: 16px; color: #555; }
</style>
