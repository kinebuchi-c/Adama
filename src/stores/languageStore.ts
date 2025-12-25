import { create } from 'zustand'
import i18n, { type SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n'
import { getLanguagePreference, saveLanguagePreference } from '../db/database'

interface LanguageState {
  language: SupportedLanguage
  isLoading: boolean
  error: string | null

  loadLanguage: () => Promise<void>
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  detectBrowserLanguage: () => SupportedLanguage
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'ja',
  isLoading: false,
  error: null,

  loadLanguage: async () => {
    set({ isLoading: true, error: null })
    try {
      const preference = await getLanguagePreference()

      if (preference) {
        await i18n.changeLanguage(preference.language)
        set({ language: preference.language, isLoading: false })
      } else {
        const detected = get().detectBrowserLanguage()
        await i18n.changeLanguage(detected)
        set({ language: detected, isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setLanguage: async (lang: SupportedLanguage) => {
    set({ isLoading: true, error: null })
    try {
      await i18n.changeLanguage(lang)
      await saveLanguagePreference(lang)
      set({ language: lang, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  detectBrowserLanguage: (): SupportedLanguage => {
    const browserLang = navigator.language.toLowerCase()

    if (browserLang.startsWith('ja')) {
      return 'ja'
    }
    if (browserLang.startsWith('en')) {
      return 'en'
    }
    if (browserLang.startsWith('fr')) {
      return 'fr'
    }
    if (browserLang.startsWith('zh')) {
      return 'zh-CN'
    }
    if (browserLang.startsWith('it')) {
      return 'it'
    }

    for (const lang of SUPPORTED_LANGUAGES) {
      if (browserLang.startsWith(lang)) {
        return lang
      }
    }

    return 'ja'
  },
}))
