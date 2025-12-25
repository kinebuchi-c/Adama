import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader } from '../components/common'

interface LinkItem {
  title: string
  url: string
  description: string
  isOfficial: boolean
}

interface LinkCategory {
  key: string
  icon: string
  links: LinkItem[]
}

export function InfoHubPage() {
  const { t } = useTranslation('common')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: LinkCategory[] = [
    {
      key: '杉並区公式',
      icon: '🏛️',
      links: [
        {
          title: '杉並区役所',
          url: 'https://www.city.suginami.tokyo.jp/',
          description: '杉並区の公式ウェブサイト',
          isOfficial: true,
        },
        {
          title: '外国人相談窓口',
          url: 'https://www.city.suginami.tokyo.jp/guide/gaikokujin/index.html',
          description: '外国人向け情報',
          isOfficial: true,
        },
      ],
    },
    {
      key: '入国管理',
      icon: '✈️',
      links: [
        {
          title: '出入国在留管理庁',
          url: 'https://www.moj.go.jp/isa/',
          description: '在留資格、ビザ情報',
          isOfficial: true,
        },
        {
          title: 'FRESC (外国人在留支援センター)',
          url: 'https://www.moj.go.jp/isa/support/fresc/fresc01.html',
          description: '総合的な外国人支援',
          isOfficial: true,
        },
      ],
    },
    {
      key: '生活情報',
      icon: '🏠',
      links: [
        {
          title: '生活・就労ガイドブック',
          url: 'https://www.moj.go.jp/isa/support/portal/guidebook.html',
          description: '日本での生活ガイド（多言語）',
          isOfficial: true,
        },
        {
          title: 'NHK WORLD',
          url: 'https://www3.nhk.or.jp/nhkworld/',
          description: '多言語ニュース',
          isOfficial: true,
        },
      ],
    },
    {
      key: '医療・健康',
      icon: '🏥',
      links: [
        {
          title: '東京都医療機関案内',
          url: 'https://www.himawari.metro.tokyo.jp/',
          description: '病院検索（ひまわり）',
          isOfficial: true,
        },
        {
          title: '救急相談センター',
          url: 'https://www.tfd.metro.tokyo.lg.jp/lfe/kyuu-adv/soudan-center.htm',
          description: '#7119 電話相談',
          isOfficial: true,
        },
      ],
    },
  ]

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    links: cat.links.filter(
      (link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.links.length > 0)

  return (
    <div>
      <NavigationHeader title={t('nav.info')} />

      <main style={{ padding: '16px' }}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder={`🔍 ${t('actions.search')}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Official Badge Explanation */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#EFF6FF',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              padding: '2px 6px',
              backgroundColor: '#3B82F6',
              color: 'white',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            公式
          </span>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>
            = 政府・自治体の公式サイト
          </span>
        </div>

        {/* Links by Category */}
        {filteredCategories.map((category, catIndex) => (
          <motion.section
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            style={{ marginBottom: '24px' }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {category.icon} {category.key}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {category.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                      {link.title}
                    </span>
                    {link.isOfficial && (
                      <span
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                        }}
                      >
                        公式
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', color: '#9CA3AF' }}>↗</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </motion.section>
        ))}
      </main>
    </div>
  )
}
