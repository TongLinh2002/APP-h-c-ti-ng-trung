# Sakura Background & Falling Petals — Design Spec
Date: 2026-06-11

## Overview

Thêm nền động hoa anh đào (sakura) vào toàn bộ trang của ứng dụng học tiếng Trung. Bao gồm nền gradient hồng nhạt toàn trang và hiệu ứng cánh hoa anh đào rơi liên tục phía trên tất cả các view.

## Visual Design

- **Màu nền trang:** gradient tĩnh `linear-gradient(160deg, #fff0f5 0%, #ffe4ee 50%, #ffd6e0 100%)` thay thế `#f5f5f5` hiện tại
- **Màu petals:** các tông hồng `#ffb7c5`, `#ffccd5`, `#ff85a1`, `#ffd6e0`, `#ffaec9`, `#ff9ab2`
- **Hình dạng petal:** `border-radius: 50% 0 50% 0` — hình elip lệch góc giống cánh hoa thật
- **Số lượng:** 15–20 petals hiển thị cùng lúc trên màn hình

## Architecture

### Thay đổi trong `App.vue`

1. Đổi `body { background: #f5f5f5 }` → `body { background: linear-gradient(160deg, #fff0f5 0%, #ffe4ee 50%, #ffd6e0 100%); background-attachment: fixed; }`
2. Thêm `<SakuraBackground />` component vào template, đặt trước `<nav>`
3. Đảm bảo `.navbar` và `.main-content` có `position: relative; z-index: 1`

### Component `SakuraBackground.vue`

**Template:** một `<div class="sakura-container">` rỗng — petals được inject bằng JS.

**CSS:**
```
.sakura-container {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.petal {
  position: absolute;
  border-radius: 50% 0 50% 0;
  animation: petalFall linear forwards;
  pointer-events: none;
}
@keyframes petalFall {
  0%   { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 0; }
  10%  { opacity: 0.85; }
  85%  { opacity: 0.75; }
  100% { transform: translateY(110vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
}
```

**Script (Composition API):**
- `onMounted` → gọi `spawnLoop()`
- `spawnLoop()`: mỗi 400–700ms (random), tạo 1 petal mới bằng `createPetal()`, append vào container, sau khi animation kết thúc thì remove element
- `createPetal()`: random `left` (0–92%), `width` (8–18px), `height` (width × 0.65), `color` từ palette, `animationDuration` (3–6s), `animationDelay` 0. Horizontal drift được set qua CSS custom property `--drift` (random –40px đến +60px) trên mỗi petal element, keyframe dùng `translateX(var(--drift))`
- `onUnmounted` → clear interval để tránh memory leak

**Giới hạn số petals:** không spawn mới nếu container đã có ≥ 20 petal elements (tránh chất đống khi tab ẩn lâu)

## Phạm vi thay đổi

| File | Thay đổi |
|------|----------|
| `frontend/src/App.vue` | Đổi body background, thêm `<SakuraBackground />`, thêm z-index cho navbar/main-content |
| `frontend/src/components/SakuraBackground.vue` | Tạo mới — component lá rơi |

Không có thay đổi nào ở backend, router, store, hay các view riêng lẻ.

## Constraints

- `pointer-events: none` trên toàn bộ sakura layer — không được block click/scroll của user
- Animation dùng `transform` + `opacity` (GPU-accelerated) — không dùng `top`/`left` trong keyframe
- Component tự cleanup khi unmount — không leak interval hay DOM nodes
- Hiển thị đúng trên mobile (responsive — petals scale theo viewport width)
