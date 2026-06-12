# Challenge: Answer Feedback + Results Report

**Date:** 2026-06-12  
**Scope:** `ChallengeGame.vue`, `ChallengeView.vue` — frontend only, no backend changes

---

## Problem

Currently:
- When the user picks an answer, it emits immediately — no visual feedback, no green/red coloring.
- The result screen only shows total score + correct count. No per-question breakdown.

---

## Design

### 1. Answer Feedback in `ChallengeGame.vue`

**Behavior after picking an answer:**
1. Timer stops.
2. The correct option turns **green** (border + background).
3. If the user picked wrong, their chosen option turns **red**.
4. All options become non-clickable.
5. A **"Câu tiếp →"** button appears below the options (or **"Xem kết quả"** on the last question).
6. The `answer` event is emitted only when the user clicks this button, not on pick.

**Timer auto-submit (timeout):**  
When the 15s timer runs out without the user picking, the correct option still lights up green, and the same "Câu tiếp →" button appears. The user must still click to advance. `selected_index: -1` is emitted at that point.

**What changes in `ChallengeGame.vue`:**
- Split `pick()` into two steps: mark choice → show feedback → wait for "next" button click.
- Introduce `showFeedback` reactive boolean. When `true`, apply color classes and show the button.
- The `correct_index` is already available in `props.question.correct_index`.
- CSS: add `.correct` class (green) and `.wrong` class (red). Remove the existing `.chosen` red style.
- The "next" button calls a new `advance()` function that emits `answer`.

**Timing data:** `time_ms` is still measured from question start to when the user picks (same as now), not to when they click "Câu tiếp". The button click is just a UI gate.

### 2. Results Report in `ChallengeView.vue`

**Layout of the result screen:**

```
🏆
135 điểm | Best: 140
Đúng 8/10 câu

─────────────────────────────
1.  爱   ài
    ✓ yêu (yêu thương)          +15 đ

2.  好   hǎo
    ✗ bạn → đúng: tốt/được       +0 đ
─────────────────────────────

        [🔄 Chơi lại]
```

**Data sources (all available in the frontend store, no new API):**
- `store.questions[i]` → `{ hanzi, pinyin, options, correct_index }`
- `store.answers[i]` → `{ selected_index, correct_index, time_ms }`
- `store.result.results[i]` → `{ correct, score }` (from backend)

All three arrays are parallel by index.

**Per-row logic:**
- `isCorrect = store.result.results[i].correct`
- `userAnswerText = isCorrect ? options[selected_index] : options[selected_index] + " → đúng: " + options[correct_index]`
- If `selected_index === -1` (timeout): show "⏱ Hết giờ → đúng: <correct>"
- Points: `store.result.results[i].score` (0, 10, or 15)

**What changes in `ChallengeView.vue`:**
- Replace the existing minimal result block with an expanded version: score summary on top, scrollable per-question list below, "Chơi lại" at bottom.
- The per-question list is rendered with `v-for` over `store.result.results`.
- No new store actions or computed properties needed.

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/ChallengeGame.vue` | Add feedback state, color classes, "Câu tiếp" button, delay emit |
| `frontend/src/views/ChallengeView.vue` | Expand result screen with per-question list |

No backend changes. No new store actions. No new routes.

---

## Out of Scope

- Sound effects on correct/wrong
- Animations beyond CSS transitions already in the file
- Sorting or filtering the results list
- Saving or exporting results
