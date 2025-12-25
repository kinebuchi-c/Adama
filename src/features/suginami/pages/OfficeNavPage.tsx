import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader } from '../components/common'

export function OfficeNavPage() {
  const { t } = useTranslation('offices')

  const offices = [
    { key: 'suginamiCityHall', icon: '🏛️' },
    { key: 'suginamiTaxOffice', icon: '💰' },
    { key: 'immigrationBureau', icon: '✈️' },
    { key: 'suginamiInternational', icon: '🌍' },
  ]

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/-/g, '')}`
  }

  const handleMap = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank')
  }

  return (
    <div>
      <NavigationHeader title={t('title')} />

      <main style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
          {t('subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {offices.map((office, index) => (
            <motion.div
              key={office.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    {office.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                      {t(`list.${office.key}.name`)}
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {t(`list.${office.key}.description`)}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    📍 {t(`list.${office.key}.address`)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                    🕐 {t(`list.${office.key}.hours`)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    📞 {t(`list.${office.key}.phone`)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleCall(t(`list.${office.key}.phone`))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    📞 {t('call')}
                  </button>
                  <button
                    onClick={() => handleMap(t(`list.${office.key}.address`))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#F3F4F6',
                      color: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    🗺️ {t('map')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
