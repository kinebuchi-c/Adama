import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { NavigationHeader, CategoryCard } from '../components/common'

type PhraseCategory = 'cityHall' | 'bank' | 'hospital' | 'postOffice' | 'dailyLife'

export function PhrasesPage() {
  const { t } = useTranslation('phrases')
  const { t: tCommon } = useTranslation('common')
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | null>(null)
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null)

  const categories: { key: PhraseCategory; icon: string; color: string }[] = [
    { key: 'cityHall', icon: '🏛️', color: '#8B5CF6' },
    { key: 'bank', icon: '🏦', color: '#3B82F6' },
    { key: 'hospital', icon: '🏥', color: '#EF4444' },
    { key: 'postOffice', icon: '📮', color: '#F59E0B' },
    { key: 'dailyLife', icon: '🏠', color: '#10B981' },
  ]

  const phraseKeys: Record<PhraseCategory, string[]> = {
    cityHall: ['greeting', 'residenceRegistration', 'addressChange', 'myNumber', 'healthInsurance', 'interpreter'],
    bank: ['openAccount', 'transfer', 'balance'],
    hospital: ['reservation', 'symptom', 'insurance'],
    postOffice: ['sendPackage', 'internationalMail'],
    dailyLife: ['dontUnderstand', 'speakSlowly', 'writeDown', 'thankyou'],
  }

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPhrase(key)
      setTimeout(() => setCopiedPhrase(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div>
      <NavigationHeader title={t('title')} />

      <main style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
          {t('subtitle')}
        </p>

        {/* Category Selection */}
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CategoryCard
                    icon={cat.icon}
                    title={t(`categories.${cat.key}.name`)}
                    color={cat.color}
                    onClick={() => setSelectedCategory(cat.key)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="phrases"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                ← {tCommon('actions.back')}
              </button>

              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0' }}>
                {t(`categories.${selectedCategory}.name`)}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {phraseKeys[selectedCategory].map((phraseKey, index) => {
                  const fullKey = `phrases.${selectedCategory}.${phraseKey}`
                  const jaText = t(`${fullKey}.ja`)
                  const romaji = t(`${fullKey}.romaji`)
                  const translation = t(`${fullKey}.translation`, { defaultValue: '' })

                  return (
                    <motion.div
                      key={phraseKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <p
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            margin: 0,
                            color: '#1F2937',
                          }}
                        >
                          {jaText}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#6B7280',
                            margin: '4px 0 0 0',
                            fontStyle: 'italic',
                          }}
                        >
                          {romaji}
                        </p>
                        {translation && (
                          <p
                            style={{
                              fontSize: '14px',
                              color: '#3B82F6',
                              margin: '8px 0 0 0',
                            }}
                          >
                            {translation}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopy(jaText, phraseKey)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: copiedPhrase === phraseKey ? '#22C55E' : '#F3F4F6',
                          color: copiedPhrase === phraseKey ? 'white' : '#6B7280',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {copiedPhrase === phraseKey ? '✓ ' + t('copied') : '📋 ' + t('copy')}
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
