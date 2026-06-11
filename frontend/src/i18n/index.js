import { createI18n } from 'vue-i18n'
import en from './en'
import vi from './vi'
import zh from './zh'

const saved = localStorage.getItem('locale')
const browser = navigator.language?.toLowerCase() || ''
const detected = saved
  || (browser.startsWith('zh') ? 'zh' : browser.startsWith('vi') ? 'vi' : 'en')

const i18n = createI18n({
  legacy: false,
  locale: detected,
  fallbackLocale: 'en',
  messages: { en, vi, zh },
})

export default i18n
