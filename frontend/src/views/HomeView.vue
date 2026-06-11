<template>
  <div class="home">
    <div class="hero">
      <h1>APP Học Tiếng Trung</h1>
      <p>Học tiếng Trung theo chuẩn HSK 1–9 với phương pháp gamification</p>
    </div>

    <div class="nav-grid">
      <RouterLink to="/journey" class="nav-card journey">
        <span class="card-icon">🗺️</span>
        <span class="card-title">Hành trình</span>
        <span class="card-desc">Lộ trình từ HSK1 đến HSK9</span>
      </RouterLink>
      <RouterLink to="/learn" class="nav-card learn">
        <span class="card-icon">📚</span>
        <span class="card-title">Học từ vựng</span>
        <span class="card-desc">Flashcard + SRS</span>
      </RouterLink>
      <RouterLink to="/challenge" class="nav-card challenge">
        <span class="card-icon">⚔️</span>
        <span class="card-title">Thử thách</span>
        <span class="card-desc">Game từ vựng có giờ</span>
      </RouterLink>
      <RouterLink to="/listen" class="nav-card listen">
        <span class="card-icon">🎧</span>
        <span class="card-title">Luyện nghe</span>
        <span class="card-desc">Bài nghe + trắc nghiệm</span>
      </RouterLink>
      <RouterLink to="/read" class="nav-card read">
        <span class="card-icon">📖</span>
        <span class="card-title">Luyện đọc</span>
        <span class="card-desc">Đọc hiểu + từ vựng</span>
      </RouterLink>
      <RouterLink to="/resources" class="nav-card resources">
        <span class="card-icon">📄</span>
        <span class="card-title">Tài liệu</span>
        <span class="card-desc">PDF tải xuống miễn phí</span>
      </RouterLink>
      <RouterLink to="/dashboard" class="nav-card dashboard">
        <span class="card-icon">📊</span>
        <span class="card-title">Tiến độ</span>
        <span class="card-desc">Streak & thống kê</span>
      </RouterLink>
    </div>
  </div>
</template>

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
