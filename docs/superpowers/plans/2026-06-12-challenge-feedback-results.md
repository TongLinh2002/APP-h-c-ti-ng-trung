# Challenge Feedback + Results Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add green/red answer feedback with a manual "Câu tiếp" advance button and a per-question results breakdown after the challenge ends.

**Architecture:** Two files only — `ChallengeGame.vue` gains feedback state and a delayed-emit pattern; `ChallengeView.vue` gains an expanded result screen. All data is already in the Pinia store (questions + answers + result.results), so no backend or store changes are needed.

**Tech Stack:** Vue 3 (Composition API), Pinia store, scoped CSS

---

## File Map

| File | Change |
|------|--------|
| `frontend/src/components/ChallengeGame.vue` | Add `showFeedback` state, green/red CSS, "Câu tiếp" button, delay emit to button click |
| `frontend/src/views/ChallengeView.vue` | Expand result screen: keep score header, add scrollable per-question list |

---

### Task 1: Split pick() into choose + advance in ChallengeGame.vue

**Files:**
- Modify: `frontend/src/components/ChallengeGame.vue`

This task makes picking an answer a two-step action: `pick(idx)` records the choice and shows feedback; `advance()` emits the `answer` event (triggering the parent to move to the next question).

- [ ] **Step 1: Add `showFeedback` ref and update `pick()`**

In the `<script setup>` block, after the existing `const answered = ref(false)` line, add:

```js
const showFeedback = ref(false)
```

Replace the existing `pick()` function:

```js
function pick(idx) {
  clearInterval(timer)
  chosen.value = idx
  answered.value = true
  showFeedback.value = true
}
```

Also update `autoSubmit()` so the timer expiry also shows feedback (correct answer highlighted) before the user clicks next:

```js
function autoSubmit() {
  answered.value = true
  showFeedback.value = true
  chosen.value = -1  // no choice made
}
```

- [ ] **Step 2: Add `advance()` function that emits**

Add below `autoSubmit()`:

```js
function advance() {
  const isTimeout = chosen.value === -1
  emit('answer', {
    selected_index: chosen.value,
    time_ms: isTimeout ? 15000 : (15 - timeLeft.value) * 1000,
  })
}
```

- [ ] **Step 3: Reset `showFeedback` in the question watcher**

The `watch(() => props.question, ...)` already resets `chosen` and `answered`. Add `showFeedback` reset too:

```js
watch(() => props.question, () => {
  chosen.value = null
  answered.value = false
  showFeedback.value = false
  timeLeft.value = 15
  startTimer()
}, { immediate: true })
```

- [ ] **Step 4: Verify script compiles — run the dev server**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`, go to Challenge, pick any level, click an answer. At this point the UI will look broken (no button yet) — that is expected. Confirm there are no console errors about undefined variables.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ChallengeGame.vue
git commit -m "feat(challenge): split pick/advance — delay emit until user clicks next"
```

---

### Task 2: Add green/red CSS classes and "Câu tiếp" button to ChallengeGame.vue

**Files:**
- Modify: `frontend/src/components/ChallengeGame.vue`

- [ ] **Step 1: Update the option list in the template**

Replace the existing `<ul class="answer-grid">` block with:

```html
<ul class="answer-grid">
  <li
    v-for="(opt, idx) in question.options"
    :key="idx"
    class="answer-option"
    :class="{
      correct: showFeedback && idx === question.correct_index,
      wrong:   showFeedback && idx === chosen && idx !== question.correct_index,
      disabled: answered,
    }"
    @click="!answered && pick(idx)"
  >{{ opt }}</li>
</ul>
```

Note: The `.chosen` class is no longer needed — `.wrong` replaces it.

- [ ] **Step 2: Add the "Câu tiếp" button below the grid**

Add after the closing `</ul>`, still inside `.challenge-game`:

```html
<div v-if="showFeedback" class="next-btn-row">
  <button class="btn-next" @click="advance()">
    {{ currentIndex + 1 < total ? 'Câu tiếp →' : 'Xem kết quả' }}
  </button>
</div>
```

- [ ] **Step 3: Update the CSS — replace `.chosen` with `.correct` and `.wrong`, add button styles**

In `<style scoped>`, remove:

```css
.answer-option.chosen { border-color: #d32f2f; background: #ffebee; }
```

Add in its place:

```css
.answer-option.correct  { border-color: #388e3c; background: #e8f5e9; color: #1b5e20; font-weight: 600; }
.answer-option.wrong    { border-color: #d32f2f; background: #ffebee; color: #b71c1c; }
.next-btn-row { margin-top: 16px; text-align: center; }
.btn-next { padding: 12px 36px; background: #1565c0; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-next:hover { background: #0d47a1; }
```

- [ ] **Step 4: Manual test — green/red feedback**

With the dev server running, go to Challenge:
- Pick the **correct** answer → that option should turn **green**, a "Câu tiếp →" button appears.
- Start a new round, pick the **wrong** answer → your pick turns **red**, the correct one turns **green**, button appears.
- Let the timer run out → correct option turns green, button appears (no red since nothing was picked).
- Click "Câu tiếp →" → next question loads, colors reset.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ChallengeGame.vue
git commit -m "feat(challenge): green/red answer feedback with Câu tiếp button"
```

---

### Task 3: Expand the result screen in ChallengeView.vue

**Files:**
- Modify: `frontend/src/views/ChallengeView.vue`

The result screen currently shows trophy + score + correct count + retry button. Add a scrollable per-question breakdown below the score header.

- [ ] **Step 1: Replace the result screen template block**

Find and replace the entire `<div v-else-if="store.result" class="result-screen">` block with:

```html
<div v-else-if="store.result" class="result-screen">
  <p class="trophy">🏆</p>
  <p class="score-big">{{ store.result.score }} {{ $t('challenge.points') }}</p>
  <p class="best">{{ $t('challenge.bestScore') }} <strong>{{ store.result.best_score }}</strong></p>
  <p class="correct-count">
    {{ $t('challenge.correct') }}
    {{ store.result.results.filter(r => r.correct).length }}/{{ store.result.results.length }} câu
  </p>

  <div class="result-list">
    <div
      v-for="(r, i) in store.result.results"
      :key="i"
      class="result-row"
    >
      <div class="result-hanzi">
        <span class="rh-hanzi">{{ store.questions[i].hanzi }}</span>
        <span class="rh-pinyin">{{ store.questions[i].pinyin }}</span>
      </div>
      <div class="result-answer">
        <span v-if="store.answers[i].selected_index === -1" class="answer-timeout">
          ⏱ Hết giờ → đúng:
          <span class="correct-text">{{ store.questions[i].options[store.questions[i].correct_index] }}</span>
        </span>
        <span v-else-if="r.correct" class="answer-correct">
          ✓ {{ store.questions[i].options[store.answers[i].selected_index] }}
        </span>
        <span v-else class="answer-wrong">
          ✗ {{ store.questions[i].options[store.answers[i].selected_index] }}
          → đúng: <span class="correct-text">{{ store.questions[i].options[store.questions[i].correct_index] }}</span>
        </span>
      </div>
      <div class="result-score" :class="r.correct ? 'pts-correct' : 'pts-zero'">
        +{{ r.score }} đ
      </div>
    </div>
  </div>

  <button class="btn-retry" @click="store.reset()">{{ $t('challenge.playAgain') }}</button>
</div>
```

- [ ] **Step 2: Add CSS for the result list**

In `<style scoped>`, add after the existing `.btn-retry` rule:

```css
.result-list { margin: 24px 0 20px; text-align: left; max-height: 420px; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; }
.result-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f5f5f5; }
.result-row:last-child { border-bottom: none; }
.result-hanzi { min-width: 80px; }
.rh-hanzi { font-size: 1.4rem; font-weight: 700; display: block; }
.rh-pinyin { font-size: 0.75rem; color: #e65100; }
.result-answer { flex: 1; font-size: 0.9rem; }
.answer-correct { color: #2e7d32; font-weight: 600; }
.answer-wrong { color: #c62828; }
.answer-timeout { color: #888; }
.correct-text { color: #2e7d32; font-weight: 600; }
.result-score { min-width: 44px; text-align: right; font-weight: 700; font-size: 0.9rem; }
.pts-correct { color: #2e7d32; }
.pts-zero { color: #aaa; }
```

- [ ] **Step 3: Manual test — result screen**

Run a full 10-question challenge:
- Answer some correctly, some wrongly, let one time out.
- After the last question + "Xem kết quả" click, the result screen should show:
  - Trophy, score, best score, correct count (unchanged).
  - Scrollable list of 10 rows, each with hanzi + pinyin, answer feedback (green ✓ / red ✗ / timeout), and points.
  - "Chơi lại" / playAgain button still works.
- Confirm correct answers show green ✓, wrong answers show red ✗ with the correct answer highlighted, timed-out questions show ⏱ Hết giờ.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/views/ChallengeView.vue
git commit -m "feat(challenge): per-question results report on result screen"
```

---

## Done

Both features are complete when all three tasks are committed and manual tests pass. No backend deploy needed — this is frontend-only.
