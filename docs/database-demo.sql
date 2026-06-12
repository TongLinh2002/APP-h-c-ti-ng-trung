-- ============================================================
--  DATABASE SCHEMA + DEMO DATA
--  APP Học Tiếng Trung
--  Tương thích: MySQL 8.0 / SQLite
-- ============================================================


-- ============================================================
-- 1. USERS — Người dùng
-- ============================================================
CREATE TABLE Users (
    id               INTEGER      PRIMARY KEY AUTO_INCREMENT,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,          -- bcrypt hash
    display_name     VARCHAR(255),
    current_hsk_level TINYINT     DEFAULT 1,         -- 1..9
    role             ENUM('user','admin') DEFAULT 'user',
    createdAt        DATETIME     NOT NULL,
    updatedAt        DATETIME     NOT NULL
);

-- Demo data
INSERT INTO Users (email, password_hash, display_name, current_hsk_level, role, createdAt, updatedAt) VALUES
('admin@example.com',  '$2a$10$hashedpassword1', 'Quản Trị Viên', 1, 'admin', NOW(), NOW()),
('demo@example.com',   '$2a$10$hashedpassword2', 'Người Dùng Demo', 1, 'user',  NOW(), NOW()),
('student@example.com','$2a$10$hashedpassword3', 'Học Sinh',        2, 'user',  NOW(), NOW());


-- ============================================================
-- 2. VOCABULARIES — Từ vựng HSK
-- ============================================================
CREATE TABLE Vocabularies (
    id               INTEGER       PRIMARY KEY AUTO_INCREMENT,
    hanzi            VARCHAR(50)   NOT NULL,          -- Chữ Hán:  你好
    pinyin           VARCHAR(100)  NOT NULL,          -- Phiên âm: nǐ hǎo
    meaning_vi       TEXT          NOT NULL,          -- Nghĩa:    Xin chào
    example_sentence VARCHAR(500),                   -- Câu ví dụ
    example_pinyin   VARCHAR(500),                   -- Pinyin câu ví dụ
    audio_url        VARCHAR(255),                   -- Link file .mp3 (tuỳ chọn)
    hsk_level        TINYINT       NOT NULL,          -- 1..9
    createdAt        DATETIME      NOT NULL,
    updatedAt        DATETIME      NOT NULL,
    UNIQUE KEY uq_hanzi_level (hanzi, hsk_level)
);

-- Demo data
INSERT INTO Vocabularies (hanzi, pinyin, meaning_vi, example_sentence, example_pinyin, hsk_level, createdAt, updatedAt) VALUES
('你好', 'nǐ hǎo',   'Xin chào',            '你好，我叫小明。',     'Nǐ hǎo, wǒ jiào Xiǎomíng.', 1, NOW(), NOW()),
('谢谢', 'xiè xie',  'Cảm ơn',              '谢谢你的帮助。',       'Xiè xie nǐ de bāngzhù.',    1, NOW(), NOW()),
('学习', 'xuéxí',    'Học tập',             '我每天学习汉语。',     'Wǒ měitiān xuéxí Hànyǔ.',   2, NOW(), NOW()),
('朋友', 'péngyou',  'Bạn bè',              '他是我的好朋友。',     'Tā shì wǒ de hǎo péngyou.', 2, NOW(), NOW()),
('图书馆','túshūguǎn','Thư viện',           '我喜欢去图书馆看书。', 'Wǒ xǐhuān qù túshūguǎn.',   3, NOW(), NOW());


-- ============================================================
-- 3. UserVocabularyProgresses — Tiến độ học từ (thuật toán SRS)
-- ============================================================
--
-- Thuật toán SRS (Spaced Repetition):
--   ease_factor:   hệ số khó/dễ, khởi đầu 2.5, tăng khi đúng / giảm khi sai
--   interval_days: sau bao nhiêu ngày sẽ ôn lại
--   next_review_at: thời điểm cụ thể sẽ nhắc ôn
--
CREATE TABLE UserVocabularyProgresses (
    id             INTEGER  PRIMARY KEY AUTO_INCREMENT,
    user_id        INTEGER  NOT NULL REFERENCES Users(id),
    vocabulary_id  INTEGER  NOT NULL REFERENCES Vocabularies(id),
    ease_factor    FLOAT    DEFAULT 2.5,   -- 1.3 (rất khó) .. 3.0 (rất dễ)
    interval_days  INTEGER  DEFAULT 1,     -- 1, 3, 7, 14, 30 ...
    next_review_at DATETIME DEFAULT NOW(), -- khi nào cần ôn lại
    times_seen     INTEGER  DEFAULT 0,     -- tổng số lần đã học
    times_correct  INTEGER  DEFAULT 0,     -- số lần trả lời đúng
    createdAt      DATETIME NOT NULL,
    updatedAt      DATETIME NOT NULL
);

-- Demo data (user 2 đã học 2 từ)
INSERT INTO UserVocabularyProgresses
    (user_id, vocabulary_id, ease_factor, interval_days, next_review_at, times_seen, times_correct, createdAt, updatedAt)
VALUES
(2, 1, 2.6, 3,  DATE_ADD(NOW(), INTERVAL 3  DAY), 2, 2, NOW(), NOW()),  -- 你好 dễ
(2, 2, 2.2, 1,  DATE_ADD(NOW(), INTERVAL 1  DAY), 3, 2, NOW(), NOW()),  -- 谢谢 khó hơn
(2, 3, 1.5, 1,  NOW(),                             1, 0, NOW(), NOW()); -- 学习 vừa sai → ôn ngay


-- ============================================================
-- 4. LESSONS — Bài nghe / bài đọc
-- ============================================================
CREATE TABLE Lessons (
    id        INTEGER     PRIMARY KEY AUTO_INCREMENT,
    title     VARCHAR(255) NOT NULL,
    type      ENUM('listening','reading') NOT NULL,
    content   TEXT,                     -- văn bản bài đọc hoặc transcript
    audio_url VARCHAR(255),             -- link .mp3 (chỉ dùng cho listening)
    transcript TEXT,                    -- bản ghi âm đầy đủ
    hsk_level TINYINT     NOT NULL,
    createdAt DATETIME    NOT NULL,
    updatedAt DATETIME    NOT NULL
);

-- Demo data
INSERT INTO Lessons (title, type, content, audio_url, hsk_level, createdAt, updatedAt) VALUES
('Giới thiệu bản thân', 'reading',
 '我叫李明，我是中国人。我今年二十岁，我是大学生。我喜欢学习汉语。',
 NULL, 1, NOW(), NOW()),

('Cuộc trò chuyện ở quán cà phê', 'listening',
 NULL,
 '/uploads/lesson-cafe.mp3', 2, NOW(), NOW());


-- ============================================================
-- 5. LESSON_QUESTIONS — Câu hỏi trắc nghiệm của bài học
-- ============================================================
CREATE TABLE LessonQuestions (
    id             INTEGER  PRIMARY KEY AUTO_INCREMENT,
    lesson_id      INTEGER  NOT NULL REFERENCES Lessons(id),
    question       TEXT     NOT NULL,
    options        JSON     NOT NULL,   -- mảng 4 đáp án: ["A","B","C","D"]
    correct_answer TINYINT  NOT NULL,   -- index đáp án đúng: 0=A, 1=B, 2=C, 3=D
    createdAt      DATETIME NOT NULL,
    updatedAt      DATETIME NOT NULL
);

-- Demo data
INSERT INTO LessonQuestions (lesson_id, question, options, correct_answer, createdAt, updatedAt) VALUES
(1, '李明是哪国人？',
 '["越南人","中国人","日本人","韩国人"]',
 1,   -- đáp án đúng: index 1 = "中国人"
 NOW(), NOW()),

(1, '李明今年多少岁？',
 '["十八岁","十九岁","二十岁","二十一岁"]',
 2,   -- đáp án đúng: index 2 = "二十岁"
 NOW(), NOW());


-- ============================================================
-- 6. UserLessonHistories — Lịch sử làm bài của user
-- ============================================================
CREATE TABLE UserLessonHistories (
    id        INTEGER  PRIMARY KEY AUTO_INCREMENT,
    user_id   INTEGER  NOT NULL REFERENCES Users(id),
    lesson_id INTEGER  NOT NULL REFERENCES Lessons(id),
    score     TINYINT  NOT NULL,   -- điểm: 0..100
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- Demo data
INSERT INTO UserLessonHistories (user_id, lesson_id, score, createdAt, updatedAt) VALUES
(2, 1, 100, NOW(), NOW()),   -- demo user làm bài 1 đạt 100
(2, 1,  50, NOW(), NOW());   -- làm lại lần 2 đạt 50


-- ============================================================
-- 7. UserChallengeScores — Điểm cao nhất trò chơi thử thách
-- ============================================================
CREATE TABLE UserChallengeScores (
    id            INTEGER  PRIMARY KEY AUTO_INCREMENT,
    user_id       INTEGER  NOT NULL REFERENCES Users(id),
    hsk_level     TINYINT  NOT NULL,        -- cấp HSK đang chơi
    best_score    INTEGER  DEFAULT 0,       -- điểm cao nhất đạt được
    total_games   INTEGER  DEFAULT 0,       -- tổng số ván đã chơi
    last_played_at DATETIME DEFAULT NOW(),
    createdAt     DATETIME NOT NULL,
    updatedAt     DATETIME NOT NULL,
    UNIQUE KEY uq_user_level (user_id, hsk_level)
);

-- Demo data
INSERT INTO UserChallengeScores (user_id, hsk_level, best_score, total_games, last_played_at, createdAt, updatedAt) VALUES
(2, 1, 850, 5, NOW(), NOW(), NOW()),
(2, 2, 420, 2, NOW(), NOW(), NOW());


-- ============================================================
-- 8. DOWNLOADS — Tài liệu học tập có thể tải về
-- ============================================================
CREATE TABLE Downloads (
    id          INTEGER      PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    file_url    VARCHAR(500) NOT NULL,   -- link tải hoặc /uploads/filename.pdf
    file_type   ENUM('vocabulary_list','pinyin_chart','slide','other') NOT NULL,
    hsk_level   TINYINT,                -- NULL = áp dụng cho tất cả cấp
    createdAt   DATETIME     NOT NULL,
    updatedAt   DATETIME     NOT NULL
);

-- Demo data
INSERT INTO Downloads (title, description, file_url, file_type, hsk_level, createdAt, updatedAt) VALUES
('Từ vựng HSK 1 - 150 từ',  'Danh sách đầy đủ 150 từ HSK cấp 1', '/uploads/hsk1-vocab.xlsx',  'vocabulary_list', 1, NOW(), NOW()),
('Bảng Pinyin đầy đủ',      'Toàn bộ âm tiết tiếng Trung',        '/uploads/pinyin-chart.pdf', 'pinyin_chart',    NULL, NOW(), NOW()),
('Slide bài giảng HSK 2',   'Bài giảng PowerPoint cấp 2',         '/uploads/hsk2-slide.pptx',  'slide',           2, NOW(), NOW());


-- ============================================================
-- SƠ ĐỒ QUAN HỆ (ERD tóm tắt)
-- ============================================================
--
--  Users ──────────┬─── UserVocabularyProgresses ───── Vocabularies
--                  │
--                  ├─── UserLessonHistories ─────────── Lessons ──── LessonQuestions
--                  │
--                  └─── UserChallengeScores
--
--  Downloads  (độc lập, không FK)



--
-- ============================================================
