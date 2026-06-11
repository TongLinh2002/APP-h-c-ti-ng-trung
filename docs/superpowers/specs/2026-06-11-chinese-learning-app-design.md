# APP Học Tiếng Trung — Tài liệu Đặc tả (Spec)

**Ngày:** 2026-06-11
**Phiên bản:** 2.0 (cập nhật: thêm Journey Map, Vocabulary Challenge, HSK Groups, Downloads)

---

## 1. Tổng quan

Ứng dụng web học tiếng Trung theo chuẩn **HSK 1–9** (hệ thống mới 2021 của Hanban), lấy cảm hứng từ platform "Khu Vườn Tiếng Trung". Người dùng học qua flashcard SRS, luyện nghe/đọc, và trải nghiệm gamification qua **Bản Đồ Hành Trình** (8 giai đoạn với icon động vật) và **Game Thử Thách Từ Vựng** ⚔️. Nội dung được nhóm theo 4 cụm cấp độ HSK và có thể tải tài liệu PDF.

**Stack công nghệ:**
- Frontend: Vue 3 + Vite
- Backend: Node.js + Express
- Database: MySQL + Sequelize ORM
- Auth: JWT (access token + refresh token)

---

## 2. Kiến trúc tổng thể

Monolith — Frontend và Backend nằm trong cùng một repo, tách thư mục `frontend/` và `backend/`.

```
app-hoc-tieng-trung/
├── frontend/
│   ├── src/
│   │   ├── views/         (Home, Journey, Learn, Listen, Read, Challenge, Resources, Profile, Auth)
│   │   ├── components/    (Flashcard, AudioPlayer, ProgressBar, QuizCard, JourneyMap, ChallengeGame)
│   │   ├── router/        (Vue Router với route guard JWT)
│   │   ├── stores/        (Pinia: auth, vocabulary, lessons, progress)
│   │   └── services/      (axios API calls)
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── routes/        (auth, vocabulary, lessons, progress)
    │   ├── controllers/
    │   ├── models/        (Sequelize models)
    │   ├── middleware/    (verifyToken JWT)
    │   └── utils/         (srs algorithm)
    └── app.js
```

**Luồng dữ liệu:**
1. Vue gọi REST API (`/api/...`) tới Express
2. Middleware kiểm tra JWT
3. Controller truy vấn MySQL qua Sequelize
4. Trả JSON về Vue để render

---

## 3. Tính năng

### 3.1 Xác thực (Auth)
- Đăng ký bằng email + mật khẩu (bcrypt hash)
- Đăng nhập trả về access token (JWT, 1h) + refresh token (7 ngày)
- Token lưu trong `localStorage`
- Vue Router guard: các trang học yêu cầu đăng nhập, redirect về `/login` nếu chưa xác thực
- Endpoint refresh token tự động khi access token hết hạn

### 3.2 Học từ vựng — Flashcard + SRS
- Từ vựng phân theo HSK 1–9, mỗi cấp theo danh sách chuẩn Hanban
- Mỗi thẻ từ hiển thị: Chữ Hán / Pinyin / Nghĩa tiếng Việt / Câu ví dụ / Audio phát âm
- Người dùng lật thẻ, sau đó tự đánh giá: **Quên / Khó / Bình thường / Dễ**
- Backend áp dụng thuật toán **SM-2** để tính `interval_days` và `ease_factor` tiếp theo
- Mỗi phiên học lấy tối đa 20 thẻ đến hạn ôn (`next_review_at <= now`)

### 3.3 Luyện nghe
- Danh sách bài nghe theo cấp HSK
- Mỗi bài: audio MP3 + transcript + câu hỏi trắc nghiệm (3–5 câu)
- Sau khi nộp bài: hiển thị điểm và đáp án đúng
- Lưu lịch sử điểm số vào `user_lesson_history`

### 3.4 Luyện đọc
- Đoạn văn ngắn theo cấp HSK
- Từ mới trong bài được highlight, click để xem nghĩa
- Câu hỏi trắc nghiệm hiểu bài (3–5 câu)
- Lưu lịch sử tương tự bài nghe

### 3.5 Bản Đồ Hành Trình (Journey Map)
- Hiển thị lộ trình học dạng bản đồ với **8 giai đoạn**, mỗi giai đoạn có icon động vật đặc trưng:

| Giai đoạn | Icon | HSK tương ứng | Tên giai đoạn |
|-----------|------|---------------|---------------|
| 1 | 🌱 | HSK 1 | Mầm xanh |
| 2 | 🐢 | HSK 2 | Rùa kiên nhẫn |
| 3 | 🐸 | HSK 3 | Ếch nhảy xa |
| 4 | 🦁 | HSK 4 | Sư tử dũng mãnh |
| 5 | 🦊 | HSK 5 | Cáo thông minh |
| 6 | 🦅 | HSK 6 | Đại bàng bay cao |
| 7 | 🦋 | HSK 7-8 | Bướm biến đổi |
| 8 | 🐉 | HSK 9 | Rồng thành thạo |

- Giai đoạn hiện tại của user được highlight, các giai đoạn đã qua hiển thị trạng thái "hoàn thành"
- Click vào giai đoạn → xem danh sách bài học và từ vựng của cấp đó
- Hiển thị % tiến độ hoàn thành từng giai đoạn

### 3.6 Nhóm Cấp Độ HSK (HSK Groups)
Nội dung được phân thành **4 cụm** để người học dễ định hướng:

| Cụm | Cấp HSK | Tên | Màu sắc UI |
|-----|---------|-----|------------|
| Sơ cấp | HSK 1–2 | Nhập môn | Xanh lá |
| Trung cấp | HSK 3–4 | Giao tiếp | Xanh dương |
| Cao cấp | HSK 5–6 | Thành thạo | Tím |
| Tinh thông | HSK 7–9 | Chuyên gia | Vàng/cam |

- Trang chủ và Journey Map hiển thị theo cụm, không theo từng cấp riêng lẻ
- Bộ lọc trong Learn/Listen/Read cho phép chọn theo cụm hoặc cấp cụ thể

### 3.7 Game Thử Thách Từ Vựng ⚔️
- Người dùng chọn cấp HSK (hoặc cụm) để bắt đầu game
- Mỗi ván: **10 câu hỏi** trắc nghiệm 4 đáp án, có đồng hồ đếm ngược **15 giây/câu**
- Câu hỏi ngẫu nhiên từ vocabulary của cấp được chọn — hiển thị chữ Hán, người dùng chọn nghĩa tiếng Việt
- Tính điểm: đúng trong 15s = +10đ, trả lời nhanh dưới 5s = bonus +5đ, sai = 0đ
- Sau ván: hiển thị điểm tổng, số câu đúng/sai, review đáp án
- Lưu điểm cao nhất (best score) của user theo từng cấp

### 3.8 Tài Liệu Tải Xuống
- Danh sách tài liệu PDF được tổ chức theo cấp HSK: danh sách từ vựng, bảng Pinyin, slide bài giảng
- API trả về metadata (tên file, cấp HSK, loại tài liệu, URL tải)
- File thực tế lưu tĩnh trong `backend/public/downloads/` hoặc CDN URL
- Không cần đăng nhập để tải (public endpoint)

### 3.9 Tiến độ học (Dashboard)
- Tổng số từ đã học / tổng từ theo cấp hiện tại
- Streak: số ngày học liên tiếp
- Biểu đồ hoạt động theo tuần (số thẻ đã ôn mỗi ngày)
- Tiến độ từng cấp HSK (H1 → H9): % hoàn thành

---

## 4. Cấu trúc Database (MySQL)

```sql
-- Tài khoản người dùng
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  current_hsk_level TINYINT DEFAULT 1,  -- 1-9
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Từ vựng chuẩn HSK
CREATE TABLE vocabulary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hanzi VARCHAR(50) NOT NULL,
  pinyin VARCHAR(100) NOT NULL,
  meaning_vi TEXT NOT NULL,
  example_sentence VARCHAR(500),
  example_pinyin VARCHAR(500),
  audio_url VARCHAR(255),
  hsk_level TINYINT NOT NULL  -- 1-9
);

-- Bài nghe / bài đọc
CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('listening', 'reading') NOT NULL,
  content TEXT,
  audio_url VARCHAR(255),
  transcript TEXT,
  hsk_level TINYINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Câu hỏi trắc nghiệm
CREATE TABLE lesson_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,       -- ["A","B","C","D"]
  correct_answer TINYINT NOT NULL,  -- index 0-3
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Tiến độ học từ vựng (SRS - SM-2)
CREATE TABLE user_vocabulary_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vocabulary_id INT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  next_review_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  times_seen INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  UNIQUE KEY unique_user_vocab (user_id, vocabulary_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id)
);

-- Điểm cao nhất game thử thách theo cấp HSK
CREATE TABLE user_challenge_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  hsk_level TINYINT NOT NULL,  -- 1-9
  best_score INT DEFAULT 0,
  total_games INT DEFAULT 0,
  last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_level (user_id, hsk_level),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tài liệu tải xuống
CREATE TABLE downloads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type ENUM('vocabulary_list', 'pinyin_chart', 'slide', 'other') NOT NULL,
  hsk_level TINYINT,  -- NULL = áp dụng cho tất cả cấp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lịch sử làm bài học
CREATE TABLE user_lesson_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  score TINYINT NOT NULL,  -- 0-100
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

---

## 5. API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký | Không |
| POST | `/api/auth/login` | Đăng nhập | Không |
| POST | `/api/auth/refresh` | Làm mới token | Không |
| GET | `/api/vocabulary` | Lấy danh sách từ theo cấp HSK | Có |
| GET | `/api/vocabulary/review` | Lấy thẻ cần ôn hôm nay | Có |
| POST | `/api/vocabulary/review/:id` | Gửi kết quả đánh giá thẻ | Có |
| GET | `/api/lessons` | Lấy danh sách bài theo cấp & loại | Có |
| GET | `/api/lessons/:id` | Chi tiết bài học | Có |
| POST | `/api/lessons/:id/submit` | Nộp bài và lưu điểm | Có |
| GET | `/api/progress` | Lấy dữ liệu dashboard | Có |
| GET | `/api/journey` | Lấy trạng thái 8 giai đoạn hành trình | Có |
| GET | `/api/challenge/start` | Lấy 10 từ ngẫu nhiên để bắt đầu game | Có |
| POST | `/api/challenge/submit` | Nộp kết quả game, lưu điểm cao | Có |
| GET | `/api/downloads` | Lấy danh sách tài liệu (theo cấp HSK) | Không |

---

## 6. Phân bổ nội dung theo cấp HSK

| Cấp | Số từ vựng chuẩn | Đặc điểm nội dung |
|-----|-----------------|-------------------|
| HSK 1 | ~150 từ | Chủ đề: chào hỏi, số đếm, màu sắc |
| HSK 2 | ~300 từ | Chủ đề: gia đình, mua sắm, thời gian |
| HSK 3 | ~600 từ | Chủ đề: du lịch, sức khỏe, cảm xúc |
| HSK 4 | ~1.200 từ | Chủ đề: công việc, xã hội |
| HSK 5 | ~2.500 từ | Chủ đề: văn học, tin tức |
| HSK 6 | ~5.000 từ | Chủ đề: học thuật, báo chí |
| HSK 7 | ~8.000 từ | Nâng cao, ngữ pháp phức tạp |
| HSK 8 | ~11.000 từ | Chuyên ngành, văn phong trang trọng |
| HSK 9 | ~15.000 từ | Thành thạo hoàn toàn |

---

## 7. Tiêu chí thành công (MVP)

- [ ] Người dùng đăng ký, đăng nhập, đăng xuất thành công
- [ ] Học flashcard với SRS hoạt động đúng (thẻ khó xuất hiện lại sớm hơn)
- [ ] Nghe bài audio, trả lời trắc nghiệm, xem điểm
- [ ] Đọc bài văn, click từ mới xem nghĩa, trả lời trắc nghiệm
- [ ] Dashboard hiển thị tiến độ và streak chính xác
- [ ] Bản đồ hành trình hiển thị 8 giai đoạn, highlight giai đoạn hiện tại
- [ ] Game thử thách từ vựng: 10 câu hỏi, đồng hồ 15s, tính điểm, lưu best score
- [ ] Trang tài liệu liệt kê file PDF theo cấp HSK, click tải được
