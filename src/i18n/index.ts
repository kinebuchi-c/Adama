import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import jaCommon from './locales/ja/common.json'
import jaOnboarding from './locales/ja/onboarding.json'
import jaTasks from './locales/ja/tasks.json'
import jaDocuments from './locales/ja/documents.json'
import jaPhrases from './locales/ja/phrases.json'
import jaOffices from './locales/ja/offices.json'
import jaHelp from './locales/ja/help.json'

import jaEasyCommon from './locales/ja-easy/common.json'
import jaEasyOnboarding from './locales/ja-easy/onboarding.json'
import jaEasyTasks from './locales/ja-easy/tasks.json'
import jaEasyDocuments from './locales/ja-easy/documents.json'
import jaEasyPhrases from './locales/ja-easy/phrases.json'
import jaEasyOffices from './locales/ja-easy/offices.json'
import jaEasyHelp from './locales/ja-easy/help.json'

import enCommon from './locales/en/common.json'
import enOnboarding from './locales/en/onboarding.json'
import enTasks from './locales/en/tasks.json'
import enDocuments from './locales/en/documents.json'
import enPhrases from './locales/en/phrases.json'
import enOffices from './locales/en/offices.json'
import enHelp from './locales/en/help.json'

import frCommon from './locales/fr/common.json'
import frOnboarding from './locales/fr/onboarding.json'
import frTasks from './locales/fr/tasks.json'
import frDocuments from './locales/fr/documents.json'
import frPhrases from './locales/fr/phrases.json'
import frOffices from './locales/fr/offices.json'
import frHelp from './locales/fr/help.json'

import zhCNCommon from './locales/zh-CN/common.json'
import zhCNOnboarding from './locales/zh-CN/onboarding.json'
import zhCNTasks from './locales/zh-CN/tasks.json'
import zhCNDocuments from './locales/zh-CN/documents.json'
import zhCNPhrases from './locales/zh-CN/phrases.json'
import zhCNOffices from './locales/zh-CN/offices.json'
import zhCNHelp from './locales/zh-CN/help.json'

import itCommon from './locales/it/common.json'
import itOnboarding from './locales/it/onboarding.json'
import itTasks from './locales/it/tasks.json'
import itDocuments from './locales/it/documents.json'
import itPhrases from './locales/it/phrases.json'
import itOffices from './locales/it/offices.json'
import itHelp from './locales/it/help.json'

export const SUPPORTED_LANGUAGES = ['ja', 'ja-easy', 'en', 'fr', 'zh-CN', 'it'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'ja': '日本語',
  'ja-easy': 'やさしい日本語',
  'en': 'English',
  'fr': 'Français',
  'zh-CN': '简体中文',
  'it': 'Italiano',
}

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  'ja': '🇯🇵',
  'ja-easy': '🇯🇵',
  'en': '🇬🇧',
  'fr': '🇫🇷',
  'zh-CN': '🇨🇳',
  'it': '🇮🇹',
}

const resources = {
  ja: {
    common: jaCommon,
    onboarding: jaOnboarding,
    tasks: jaTasks,
    documents: jaDocuments,
    phrases: jaPhrases,
    offices: jaOffices,
    help: jaHelp,
  },
  'ja-easy': {
    common: jaEasyCommon,
    onboarding: jaEasyOnboarding,
    tasks: jaEasyTasks,
    documents: jaEasyDocuments,
    phrases: jaEasyPhrases,
    offices: jaEasyOffices,
    help: jaEasyHelp,
  },
  en: {
    common: enCommon,
    onboarding: enOnboarding,
    tasks: enTasks,
    documents: enDocuments,
    phrases: enPhrases,
    offices: enOffices,
    help: enHelp,
  },
  fr: {
    common: frCommon,
    onboarding: frOnboarding,
    tasks: frTasks,
    documents: frDocuments,
    phrases: frPhrases,
    offices: frOffices,
    help: frHelp,
  },
  'zh-CN': {
    common: zhCNCommon,
    onboarding: zhCNOnboarding,
    tasks: zhCNTasks,
    documents: zhCNDocuments,
    phrases: zhCNPhrases,
    offices: zhCNOffices,
    help: zhCNHelp,
  },
  it: {
    common: itCommon,
    onboarding: itOnboarding,
    tasks: itTasks,
    documents: itDocuments,
    phrases: itPhrases,
    offices: itOffices,
    help: itHelp,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    defaultNS: 'common',
    ns: ['common', 'onboarding', 'tasks', 'documents', 'phrases', 'offices', 'help'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
