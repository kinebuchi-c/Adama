import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguageStore } from '../../../../stores/languageStore'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS, type SupportedLanguage } from '../../../../i18n'

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { language, setLanguage } = useLanguageStore()

  const handleSelect = async (lang: SupportedLanguage) => {
    await setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        <span>{LANGUAGE_FLAGS[language]}</span>
        <span>{LANGUAGE_LABELS[language]}</span>
        <span style={{ marginLeft: '4px' }}>▼</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '180px',
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleSelect(lang)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: language === lang ? '#F3F4F6' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                  }}
                >
                  <span>{LANGUAGE_FLAGS[lang]}</span>
                  <span>{LANGUAGE_LABELS[lang]}</span>
                  {language === lang && (
                    <span style={{ marginLeft: 'auto', color: '#3B82F6' }}>✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
