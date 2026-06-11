require('dotenv').config()
const sequelize = require('./src/config/database')
const { User, Vocabulary, Lesson, LessonQuestion, Download } = require('./src/models')
const bcrypt = require('bcryptjs')

async function seed() {
  await sequelize.sync({ force: true })
  console.log('Database synced.')

  // Admin user
  const admin_hash = await bcrypt.hash('admin123', 10)
  await User.create({
    email: 'admin@example.com',
    password_hash: admin_hash,
    display_name: 'Quản Trị Viên',
    current_hsk_level: 1,
    role: 'admin',
  })
  console.log('Created admin user: admin@example.com / admin123')

  // Demo user
  const password_hash = await bcrypt.hash('123456', 10)
  await User.create({
    email: 'demo@example.com',
    password_hash,
    display_name: 'Người Dùng Demo',
    current_hsk_level: 1,
    role: 'user',
  })
  console.log('Created demo user: demo@example.com / 123456')

  // HSK 1 Vocabulary (15 words)
  await Vocabulary.bulkCreate([
    { hanzi: '你好', pinyin: 'nǐ hǎo', meaning_vi: 'Xin chào', example_sentence: '你好，我叫小明。', example_pinyin: 'Nǐ hǎo, wǒ jiào Xiǎomíng.', hsk_level: 1 },
    { hanzi: '谢谢', pinyin: 'xiè xie', meaning_vi: 'Cảm ơn', example_sentence: '谢谢你的帮助。', example_pinyin: 'Xiè xie nǐ de bāngzhù.', hsk_level: 1 },
    { hanzi: '再见', pinyin: 'zài jiàn', meaning_vi: 'Tạm biệt', example_sentence: '明天再见！', example_pinyin: 'Míngtiān zài jiàn!', hsk_level: 1 },
    { hanzi: '你', pinyin: 'nǐ', meaning_vi: 'Bạn / Anh / Chị (ngôi thứ hai)', example_sentence: '你是学生吗？', example_pinyin: 'Nǐ shì xuésheng ma?', hsk_level: 1 },
    { hanzi: '我', pinyin: 'wǒ', meaning_vi: 'Tôi / Mình (ngôi thứ nhất)', example_sentence: '我是越南人。', example_pinyin: 'Wǒ shì Yuènán rén.', hsk_level: 1 },
    { hanzi: '他', pinyin: 'tā', meaning_vi: 'Anh ấy / Ông ấy (ngôi thứ ba nam)', example_sentence: '他是我的老师。', example_pinyin: 'Tā shì wǒ de lǎoshī.', hsk_level: 1 },
    { hanzi: '好', pinyin: 'hǎo', meaning_vi: 'Tốt / Được', example_sentence: '今天天气很好。', example_pinyin: 'Jīntiān tiānqì hěn hǎo.', hsk_level: 1 },
    { hanzi: '不', pinyin: 'bù', meaning_vi: 'Không (phủ định)', example_sentence: '我不喝咖啡。', example_pinyin: 'Wǒ bù hē kāfēi.', hsk_level: 1 },
    { hanzi: '是', pinyin: 'shì', meaning_vi: 'Là (động từ liên kết)', example_sentence: '这是我的书。', example_pinyin: 'Zhè shì wǒ de shū.', hsk_level: 1 },
    { hanzi: '有', pinyin: 'yǒu', meaning_vi: 'Có (sở hữu / tồn tại)', example_sentence: '我有一个妹妹。', example_pinyin: 'Wǒ yǒu yī gè mèimei.', hsk_level: 1 },
    { hanzi: '一', pinyin: 'yī', meaning_vi: 'Một (số đếm)', example_sentence: '我要一杯水。', example_pinyin: 'Wǒ yào yī bēi shuǐ.', hsk_level: 1 },
    { hanzi: '二', pinyin: 'èr', meaning_vi: 'Hai (số đếm)', example_sentence: '我有两个哥哥。', example_pinyin: 'Wǒ yǒu liǎng gè gēge.', hsk_level: 1 },
    { hanzi: '三', pinyin: 'sān', meaning_vi: 'Ba (số đếm)', example_sentence: '他有三本书。', example_pinyin: 'Tā yǒu sān běn shū.', hsk_level: 1 },
    { hanzi: '人', pinyin: 'rén', meaning_vi: 'Người', example_sentence: '这里有很多人。', example_pinyin: 'Zhèlǐ yǒu hěn duō rén.', hsk_level: 1 },
    { hanzi: '水', pinyin: 'shuǐ', meaning_vi: 'Nước', example_sentence: '我想喝水。', example_pinyin: 'Wǒ xiǎng hē shuǐ.', hsk_level: 1 },
  ])
  console.log('Created 15 HSK 1 vocabulary words.')

  // HSK 2 Vocabulary (10 words)
  await Vocabulary.bulkCreate([
    { hanzi: '学习', pinyin: 'xuéxí', meaning_vi: 'Học tập', example_sentence: '我每天学习汉语。', example_pinyin: 'Wǒ měitiān xuéxí Hànyǔ.', hsk_level: 2 },
    { hanzi: '工作', pinyin: 'gōngzuò', meaning_vi: 'Làm việc / Công việc', example_sentence: '她的工作很忙。', example_pinyin: 'Tā de gōngzuò hěn máng.', hsk_level: 2 },
    { hanzi: '朋友', pinyin: 'péngyou', meaning_vi: 'Bạn bè', example_sentence: '他是我的好朋友。', example_pinyin: 'Tā shì wǒ de hǎo péngyou.', hsk_level: 2 },
    { hanzi: '时间', pinyin: 'shíjiān', meaning_vi: 'Thời gian', example_sentence: '我没有时间。', example_pinyin: 'Wǒ méi yǒu shíjiān.', hsk_level: 2 },
    { hanzi: '今天', pinyin: 'jīntiān', meaning_vi: 'Hôm nay', example_sentence: '今天是星期一。', example_pinyin: 'Jīntiān shì xīngqīyī.', hsk_level: 2 },
    { hanzi: '明天', pinyin: 'míngtiān', meaning_vi: 'Ngày mai', example_sentence: '明天我去上海。', example_pinyin: 'Míngtiān wǒ qù Shànghǎi.', hsk_level: 2 },
    { hanzi: '吃饭', pinyin: 'chī fàn', meaning_vi: 'Ăn cơm / Ăn bữa', example_sentence: '我们一起吃饭吧。', example_pinyin: 'Wǒmen yīqǐ chī fàn ba.', hsk_level: 2 },
    { hanzi: '喜欢', pinyin: 'xǐhuān', meaning_vi: 'Thích', example_sentence: '我喜欢学习汉语。', example_pinyin: 'Wǒ xǐhuān xuéxí Hànyǔ.', hsk_level: 2 },
    { hanzi: '知道', pinyin: 'zhīdào', meaning_vi: 'Biết', example_sentence: '我知道了，谢谢。', example_pinyin: 'Wǒ zhīdào le, xiè xie.', hsk_level: 2 },
    { hanzi: '高兴', pinyin: 'gāoxìng', meaning_vi: 'Vui mừng / Hạnh phúc', example_sentence: '见到你很高兴。', example_pinyin: 'Jiàn dào nǐ hěn gāoxìng.', hsk_level: 2 },
  ])
  console.log('Created 10 HSK 2 vocabulary words.')

  // HSK 3 Vocabulary (5 words)
  await Vocabulary.bulkCreate([
    { hanzi: '旅游', pinyin: 'lǚyóu', meaning_vi: 'Du lịch', example_sentence: '我喜欢旅游。', example_pinyin: 'Wǒ xǐhuān lǚyóu.', hsk_level: 3 },
    { hanzi: '健康', pinyin: 'jiànkāng', meaning_vi: 'Sức khỏe / Khỏe mạnh', example_sentence: '身体健康最重要。', example_pinyin: 'Shēntǐ jiànkāng zuì zhòngyào.', hsk_level: 3 },
    { hanzi: '文化', pinyin: 'wénhuà', meaning_vi: 'Văn hóa', example_sentence: '中国文化很丰富。', example_pinyin: 'Zhōngguó wénhuà hěn fēngfù.', hsk_level: 3 },
    { hanzi: '发展', pinyin: 'fāzhǎn', meaning_vi: 'Phát triển', example_sentence: '经济发展很快。', example_pinyin: 'Jīngjì fāzhǎn hěn kuài.', hsk_level: 3 },
    { hanzi: '问题', pinyin: 'wèntí', meaning_vi: 'Vấn đề / Câu hỏi', example_sentence: '你有什么问题？', example_pinyin: 'Nǐ yǒu shénme wèntí?', hsk_level: 3 },
  ])
  console.log('Created 5 HSK 3 vocabulary words.')

  // Listening Lesson HSK 1
  const listenLesson1 = await Lesson.create({
    title: 'Bài nghe 1: Chào hỏi cơ bản',
    type: 'listening',
    hsk_level: 1,
    audio_url: '/audio/hsk1_lesson1.mp3',
    transcript: 'A: 你好！我叫小明，你叫什么名字？\nB: 你好！我叫小红。很高兴认识你！\nA: 我也很高兴认识你。你是学生吗？\nB: 是的，我是学生。你呢？\nA: 我也是学生。',
    content: null,
  })
  await LessonQuestion.bulkCreate([
    { lesson_id: listenLesson1.id, question: 'Tên của người nói đầu tiên là gì?', options: JSON.stringify(['Tiểu Hoa', 'Tiểu Minh', 'Tiểu Hồng', 'Tiểu Lý']), correct_answer: 1 },
    { lesson_id: listenLesson1.id, question: 'Hai người này là gì?', options: JSON.stringify(['Giáo viên', 'Học sinh', 'Bác sĩ', 'Nhân viên văn phòng']), correct_answer: 1 },
    { lesson_id: listenLesson1.id, question: 'Cảm xúc của họ khi gặp nhau?', options: JSON.stringify(['Buồn', 'Tức giận', 'Vui mừng', 'Lo lắng']), correct_answer: 2 },
  ])
  console.log('Created listening lesson 1 (HSK 1).')

  // Reading Lesson HSK 1
  const readLesson1 = await Lesson.create({
    title: 'Bài đọc 1: Gia đình tôi',
    type: 'reading',
    hsk_level: 1,
    audio_url: null,
    transcript: null,
    content: '我[[家|gia đình]]有四口人。[[爸爸|bố]]、[[妈妈|mẹ]]、[[哥哥|anh trai]]和我。我们[[住|sống/ở]]在河内。我[[爸爸|bố]]是[[老师|giáo viên]]，我[[妈妈|mẹ]]是[[医生|bác sĩ]]。我[[哥哥|anh trai]]在[[大学|đại học]]学习。我很[[喜欢|thích]]我的家。',
  })
  await LessonQuestion.bulkCreate([
    { lesson_id: readLesson1.id, question: 'Gia đình tác giả có bao nhiêu người?', options: JSON.stringify(['Ba người', 'Bốn người', 'Năm người', 'Hai người']), correct_answer: 1 },
    { lesson_id: readLesson1.id, question: 'Bố của tác giả làm nghề gì?', options: JSON.stringify(['Bác sĩ', 'Kỹ sư', 'Giáo viên', 'Nhân viên']), correct_answer: 2 },
    { lesson_id: readLesson1.id, question: 'Anh trai của tác giả đang làm gì?', options: JSON.stringify(['Làm việc', 'Học đại học', 'Du lịch', 'Nghỉ ngơi']), correct_answer: 1 },
  ])
  console.log('Created reading lesson 1 (HSK 1).')

  // Listening Lesson HSK 2
  const listenLesson2 = await Lesson.create({
    title: 'Bài nghe 2: Công việc hàng ngày',
    type: 'listening',
    hsk_level: 2,
    audio_url: '/audio/hsk2_lesson1.mp3',
    transcript: 'A: 你每天几点起床？\nB: 我每天七点起床。\nA: 你几点去工作？\nB: 我八点半去工作。工作很忙，但是我很喜欢。\nA: 你下班以后做什么？\nB: 我下班以后学习汉语。',
    content: null,
  })
  await LessonQuestion.bulkCreate([
    { lesson_id: listenLesson2.id, question: 'Người B thức dậy lúc mấy giờ?', options: JSON.stringify(['6 giờ', '7 giờ', '8 giờ', '9 giờ']), correct_answer: 1 },
    { lesson_id: listenLesson2.id, question: 'Người B đi làm lúc mấy giờ?', options: JSON.stringify(['8 giờ', '8 giờ 30', '9 giờ', '7 giờ 30']), correct_answer: 1 },
    { lesson_id: listenLesson2.id, question: 'Sau giờ làm, người B làm gì?', options: JSON.stringify(['Xem TV', 'Nấu ăn', 'Học tiếng Trung', 'Đi mua sắm']), correct_answer: 2 },
  ])
  console.log('Created listening lesson 2 (HSK 2).')

  // Downloads
  await Download.bulkCreate([
    { title: 'Danh sách từ vựng HSK 1 (150 từ)', description: 'Toàn bộ 150 từ vựng chuẩn HSK 1 kèm Pinyin và nghĩa tiếng Việt', file_url: '/downloads/hsk1-vocabulary.pdf', file_type: 'vocabulary_list', hsk_level: 1 },
    { title: 'Danh sách từ vựng HSK 2 (300 từ)', description: 'Toàn bộ 300 từ vựng chuẩn HSK 2 kèm Pinyin và nghĩa tiếng Việt', file_url: '/downloads/hsk2-vocabulary.pdf', file_type: 'vocabulary_list', hsk_level: 2 },
    { title: 'Danh sách từ vựng HSK 3 (600 từ)', description: 'Toàn bộ 600 từ vựng chuẩn HSK 3 kèm Pinyin và nghĩa tiếng Việt', file_url: '/downloads/hsk3-vocabulary.pdf', file_type: 'vocabulary_list', hsk_level: 3 },
    { title: 'Bảng Pinyin đầy đủ', description: 'Bảng phiên âm Pinyin với tất cả thanh điệu, âm đầu, vần', file_url: '/downloads/pinyin-chart.pdf', file_type: 'pinyin_chart', hsk_level: null },
    { title: 'Slide bài giảng HSK 1', description: 'Slide giảng dạy HSK 1 theo phương pháp gamification', file_url: '/downloads/hsk1-slides.pdf', file_type: 'slide', hsk_level: 1 },
    { title: 'Slide bài giảng HSK 2', description: 'Slide giảng dạy HSK 2 theo phương pháp gamification', file_url: '/downloads/hsk2-slides.pdf', file_type: 'slide', hsk_level: 2 },
  ])
  console.log('Created 6 download resources.')

  console.log('\n✅ Seed hoàn tất!')
  console.log('Demo account: demo@example.com / 123456')
  await sequelize.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
