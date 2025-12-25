import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader, CategoryCard } from '../components/common'

export function LifeSupportPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const categories = [
    { key: 'housing', icon: '🏠', color: '#F59E0B' },
    { key: 'medical', icon: '🏥', color: '#EF4444' },
    { key: 'education', icon: '📚', color: '#8B5CF6' },
    { key: 'childcare', icon: '👶', color: '#EC4899' },
    { key: 'employment', icon: '💼', color: '#3B82F6' },
    { key: 'japanese_language', icon: '🗾', color: '#10B981' },
  ]

  // External links for each category
  const categoryLinks: Record<string, { title: string; url: string }[]> = {
    housing: [
      { title: '杉並区 住宅情報', url: 'https://www.city.suginami.tokyo.jp/guide/sumai/index.html' },
    ],
    medical: [
      { title: '杉並区 医療・健康', url: 'https://www.city.suginami.tokyo.jp/guide/kenko/index.html' },
    ],
    education: [
      { title: '杉並区 教育', url: 'https://www.city.suginami.tokyo.jp/guide/gakko/index.html' },
    ],
    childcare: [
      { title: '杉並区 子育て', url: 'https://www.city.suginami.tokyo.jp/guide/kosodate/index.html' },
    ],
    employment: [
      { title: 'ハローワーク', url: 'https://www.hellowork.mhlw.go.jp/' },
    ],
    japanese_language: [
      { title: '杉並区 日本語教室', url: 'https://suginami-kouryu.org/' },
    ],
  }

  const handleCategoryClick = (key: string) => {
    const links = categoryLinks[key]
    if (links && links.length > 0) {
      window.open(links[0].url, '_blank')
    }
  }

  return (
    <div>
      <NavigationHeader title={t('nav.life')} />

      <main style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          生活に役立つ情報をカテゴリ別にご案内します
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
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
                title={t(`nav.${cat.key === 'japanese_language' ? 'info' : cat.key}`) || cat.key}
                color={cat.color}
                onClick={() => handleCategoryClick(cat.key)}
              />
            </motion.div>
          ))}
        </div>

        {/* Consultation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '24px',
            backgroundColor: '#EFF6FF',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
            {t('consultation.title')}
          </h3>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0 16px 0' }}>
            {t('consultation.description')}
          </p>
          <button
            onClick={() => navigate('/suginami/help')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t('consultation.link')} →
          </button>
        </motion.div>
      </main>
    </div>
  )
}
