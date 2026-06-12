# HSK / HSKK Exam System Design

**Date:** 2026-06-12
**Scope:** Replace `/listen` (Nghe) and `/read` (Đọc) tabs with HSK and HSKK exam-taking system.

---

## Problem

The "Nghe" and "Đọc" nav tabs currently hold simple listening/reading lessons. The app needs a proper exam-taking system where:
- Users can take timed HSK and HSKK mock exams online
- Admins can create and manage exam papers with multiple section types
- After submitting, users see their score and a per-question review

---

## Decisions

| Question | Answer |
|----------|--------|
| Replace existing Nghe/Đọc? | Yes — tabs become HSK / HSKK, old lesson content stays in DB but is no longer surfaced |
| Question format | Multi-type: listening (audio), reading (passage), fill-in-blank (text input) |
| Time limit | Admin-configured per exam, countdown timer, auto-submit on expiry |
| Result display | Total score + per-question correct/incorrect review |

---

## Architecture

### Data Model — 4 new tables

```sql
-- Đề thi
CREATE TABLE Exams (
    id                   INTEGER      PRIMARY KEY AUTO_INCREMENT,
    title                VARCHAR(255) NOT NULL,
    exam_type            ENUM('hsk','hskk') NOT NULL,
    hsk_level            TINYINT      NOT NULL,        -- 1..9
    time_limit_minutes   TINYINT      NOT NULL,
    description          TEXT,
    createdAt            DATETIME     NOT NULL,
    updatedAt            DATETIME     NOT NULL
);

-- Phần thi
CREATE TABLE ExamSections (
    id          INTEGER      PRIMARY KEY AUTO_INCREMENT,
    exam_id     INTEGER      NOT NULL REFERENCES Exams(id),
    title       VARCHAR(255) NOT NULL,
    type        ENUM('listening','reading','fill') NOT NULL,
    order_index TINYINT      NOT NULL DEFAULT 0,
    audio_url   VARCHAR(255),   -- only for type=listening
    passage     TEXT,           -- only for type=reading
    createdAt   DATETIME     NOT NULL,
    updatedAt   DATETIME     NOT NULL
);

-- Câu hỏi
CREATE TABLE ExamQuestions (
    id             INTEGER  PRIMARY KEY AUTO_INCREMENT,
    section_id     INTEGER  NOT NULL REFERENCES ExamSections(id),
    order_index    TINYINT  NOT NULL DEFAULT 0,
    question_text  TEXT     NOT NULL,
    options        JSON,                   -- ["A","B","C","D"], NULL for fill
    correct_answer VARCHAR(255) NOT NULL,  -- option index "0".."3" or fill text
    points         TINYINT  NOT NULL DEFAULT 1,
    createdAt      DATETIME NOT NULL,
    updatedAt      DATETIME NOT NULL
);

-- Kết quả làm bài
CREATE TABLE UserExamResults (
    id                 INTEGER  PRIMARY KEY AUTO_INCREMENT,
    user_id            INTEGER  NOT NULL REFERENCES Users(id),
    exam_id            INTEGER  NOT NULL REFERENCES Exams(id),
    score              SMALLINT NOT NULL,
    max_score          SMALLINT NOT NULL,
    answers            JSON     NOT NULL,  -- [{question_id, answer}]
    time_taken_seconds SMALLINT,
    submitted_at       DATETIME NOT NULL,
    createdAt          DATETIME NOT NULL,
    updatedAt          DATETIME NOT NULL
);
```

Old tables (`Lessons`, `LessonQuestions`, `UserLessonHistories`) are kept but no longer surfaced in the UI.

---

### Backend

**New files:**
- `backend/src/models/Exam.js`
- `backend/src/models/ExamSection.js`
- `backend/src/models/ExamQuestion.js`
- `backend/src/models/UserExamResult.js`
- `backend/src/controllers/examController.js`
- `backend/src/routes/exam.js`

**Modify:**
- `backend/src/models/index.js` — register new models + associations
- `backend/src/controllers/adminController.js` — add exam CRUD functions
- `backend/src/routes/admin.js` — mount exam admin routes
- `backend/app.js` — mount `/api/exams` route

**User routes (`/api/exams`):**
```
GET  /api/exams?type=hsk&hsk_level=1   → list exams (no auth)
GET  /api/exams/:id                    → full exam with sections + questions
POST /api/exams/:id/submit             → submit answers, returns score + review
```

`GET /api/exams/:id` returns:
```json
{
  "id": 1,
  "title": "Đề HSK 1 - Tháng 6",
  "exam_type": "hsk",
  "hsk_level": 1,
  "time_limit_minutes": 90,
  "sections": [
    {
      "id": 1,
      "title": "Phần 1 – Nghe",
      "type": "listening",
      "audio_url": "/uploads/exam1-listen.mp3",
      "passage": null,
      "questions": [
        { "id": 1, "question_text": "...", "options": ["A","B","C","D"], "order_index": 0 }
      ]
    }
  ]
}
```

Note: `correct_answer` is NOT included in the GET response — only returned after submit.

`POST /api/exams/:id/submit` body:
```json
{ "answers": [{ "question_id": 1, "answer": "2" }], "time_taken_seconds": 240 }
```

Response:
```json
{
  "score": 18,
  "max_score": 20,
  "results": [
    { "question_id": 1, "correct": true, "correct_answer": "2", "user_answer": "2", "points": 1 }
  ]
}
```

Fill-in grading: case-insensitive exact match after trimming whitespace.

**Admin routes (under `/api/admin/exams`):**
```
GET    /api/admin/exams                       → list all exams
POST   /api/admin/exams                       → create exam
PUT    /api/admin/exams/:id                   → update exam metadata
DELETE /api/admin/exams/:id                   → delete exam (cascades sections + questions)
POST   /api/admin/exams/:id/sections          → add section (with optional audio upload)
PUT    /api/admin/exams/sections/:sid         → update section
DELETE /api/admin/exams/sections/:sid         → delete section (cascades questions)
POST   /api/admin/exams/sections/:sid/questions → add question
PUT    /api/admin/exams/questions/:qid        → update question
DELETE /api/admin/exams/questions/:qid        → delete question
```

---

### Frontend

**Nav changes (`App.vue` + `i18n`):**
- `/listen` → `/hsk`, label "Nghe" → "HSK"
- `/read` → `/hskk`, label "Đọc" → "HSKK"

**New files:**
- `frontend/src/views/HskView.vue` — HSK exam list + exam taker
- `frontend/src/views/HskkView.vue` — HSKK exam list + exam taker
- `frontend/src/components/ExamTaker.vue` — shared exam UI (timer, sections, submit)
- `frontend/src/services/examService.js` — API calls

**Modify:**
- `frontend/src/router/index.js` — change `/listen` → `/hsk`, `/read` → `/hskk`
- `frontend/src/App.vue` — update nav links
- `frontend/src/i18n/vi.js` + `en.js` + `zh.js` — update nav labels + exam strings
- `frontend/src/views/AdminView.vue` — add "Đề thi" tab

**Delete:**
- `frontend/src/views/ListenView.vue`
- `frontend/src/views/ReadView.vue`

---

### User Flow

**Exam list page (HskView / HskkView):**
```
Level filter: [HSK 1] [HSK 2] ... [HSK 9]

📋 Đề HSK 1 – Thử nghiệm tháng 6    90 phút    [Bắt đầu làm]
📋 Đề HSK 1 – Đề chính thức 2023    90 phút    [Bắt đầu làm]
```

**Exam taker (ExamTaker.vue):**
- Countdown timer fixed at top-right
- Sections displayed as scrollable page (not tabs — user can scroll freely)
- **Listening section:** audio player plays once; questions appear below player
- **Reading section:** passage text above questions (single column on mobile, two-column on desktop)
- **Fill section:** text `<input>` per question, graded case-insensitively
- [Nộp bài] button fixed at bottom
- Timer reaches 0 → auto-submit with whatever answers exist

**Result screen:**
```
✅ Kết quả: 18/20 điểm

Phần 1 – Nghe
  1. [câu hỏi text]
     Bạn chọn: B  ✗  →  Đúng: C
  2. [câu hỏi text]
     Bạn chọn: A  ✓

[Làm lại] [Chọn đề khác]
```

---

### Admin UI — "Đề thi" tab in AdminView

**Tab layout:**
```
[Người dùng] [Tài liệu] [Từ vựng] [Bài học] [Đề thi ←]
```

**Exam list sub-panel:**
- Table: Title | Type | Level | Time | Actions (Sửa / Xóa / Xem câu hỏi)
- [+ Tạo đề mới] button

**Create/edit exam form:**
- Title, Type (HSK / HSKK), Level (1–9), Time limit (minutes), Description

**Section management (expanded inline below each exam):**
- List of sections with type badge
- [+ Thêm phần] → form: Title, Type (listening/reading/fill), audio upload or passage textarea
- Each section collapsible to show its questions

**Question management (inline under each section):**
- List of questions
- [+ Thêm câu] → form:
  - Question text
  - If type ≠ fill: 4 option inputs + radio to select correct one
  - If type = fill: correct answer text input

---

## Out of Scope

- User exam history / past results page
- Speaking simulation for HSKK
- Question reordering via drag-and-drop
- Bulk question import from Excel
- Leaderboard / ranking by exam score
