import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      lang: 'Lang',
      myProfile: 'My profile',
      logout: 'Logout',
      edit_mode: 'Edit Mode',
      account_setting: 'Account Setting',
      change_password: 'Change Password',
    },
  },
  'zh-TW': {
    translation: {
      lang: '語言',
      myProfile: '个人資料',
      logout: '登出',
      edit_mode: '編輯模式',
      account_setting: '帳戶設定',
      change_password: '修改密碼',
    },
  },
  'zh-CN': {
    translation: {
      lang: '语言',
      myProfile: '个人资料',
      logout: '登出',
      edit_mode: '编辑模式',
      account_setting: '账户设置',
      change_password: '修改密码',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    detection: {
      order: ['localStorage', 'path', 'cookie', 'htmlTag', 'subdomain'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
