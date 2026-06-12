const User = require('./User')
const Vocabulary = require('./Vocabulary')
const UserVocabularyProgress = require('./UserVocabularyProgress')
const Lesson = require('./Lesson')
const LessonQuestion = require('./LessonQuestion')
const UserLessonHistory = require('./UserLessonHistory')
const UserChallengeScore = require('./UserChallengeScore')
const Download = require('./Download')
const Exam = require('./Exam')
const ExamSection = require('./ExamSection')
const ExamQuestion = require('./ExamQuestion')
const UserExamResult = require('./UserExamResult')

User.hasMany(UserVocabularyProgress, { foreignKey: 'user_id' })
Vocabulary.hasMany(UserVocabularyProgress, { foreignKey: 'vocabulary_id' })
UserVocabularyProgress.belongsTo(User, { foreignKey: 'user_id' })
UserVocabularyProgress.belongsTo(Vocabulary, { foreignKey: 'vocabulary_id' })

Lesson.hasMany(LessonQuestion, { foreignKey: 'lesson_id', as: 'questions' })
LessonQuestion.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' })

User.hasMany(UserLessonHistory, { foreignKey: 'user_id' })
Lesson.hasMany(UserLessonHistory, { foreignKey: 'lesson_id' })
UserLessonHistory.belongsTo(User, { foreignKey: 'user_id' })
UserLessonHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' })

User.hasMany(UserChallengeScore, { foreignKey: 'user_id' })
UserChallengeScore.belongsTo(User, { foreignKey: 'user_id' })

Exam.hasMany(ExamSection, { foreignKey: 'exam_id', as: 'sections', onDelete: 'CASCADE', hooks: true })
ExamSection.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' })
ExamSection.hasMany(ExamQuestion, { foreignKey: 'section_id', as: 'questions', onDelete: 'CASCADE', hooks: true })
ExamQuestion.belongsTo(ExamSection, { foreignKey: 'section_id', as: 'section' })
User.hasMany(UserExamResult, { foreignKey: 'user_id' })
UserExamResult.belongsTo(User, { foreignKey: 'user_id' })
Exam.hasMany(UserExamResult, { foreignKey: 'exam_id' })
UserExamResult.belongsTo(Exam, { foreignKey: 'exam_id' })

module.exports = {
  User, Vocabulary, UserVocabularyProgress,
  Lesson, LessonQuestion, UserLessonHistory,
  UserChallengeScore, Download,
  Exam, ExamSection, ExamQuestion, UserExamResult,
}
