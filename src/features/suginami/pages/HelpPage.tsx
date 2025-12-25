import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader } from '../components/common'

export function HelpPage() {
  const { t } = useTranslation('help')

  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/[^0-9#*]/g, '')
    window.location.href = `tel:${cleanNumber}`
  }

  return (
    <div>
      <NavigationHeader title={t('title')} />

      <main style={{ padding: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
          {t('subtitle')}
        </p>

        {/* Emergency Contacts */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0', color: '#DC2626' }}>
            🚨 {t('emergency.title')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {['police', 'fire', 'coast'].map((key, index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCall(t(`emergency.${key}.number`))}
                style={{
                  padding: '16px 12px',
                  backgroundColor: key === 'coast' ? '#F3F4F6' : '#FEE2E2',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: key === 'coast' ? '#1F2937' : '#DC2626',
                  }}
                >
                  {t(`emergency.${key}.number`)}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                  {t(`emergency.${key}.name`)}
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Consultation Services */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>
            📞 {t('consultation.title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['fresc', 'tokyoMultilingual', 'suginamiInternational'].map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  {t(`consultation.${key}.name`)}
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0' }}>
                  {t(`consultation.${key}.description`)}
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 12px 0' }}>
                  🕐 {t(`consultation.${key}.hours`)}
                </p>
                <button
                  onClick={() => handleCall(t(`consultation.${key}.number`))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  📞 {t(`consultation.${key}.number`)} - {t('call')}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Crisis Support */}
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>
            💛 {t('crisis.title')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['mentalHealth', 'domesticViolence', 'childAbuse', 'laborConsultation'].map(
              (key, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                      {t(`crisis.${key}.name`)}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: '2px 0 0 0' }}>
                      {t(`crisis.${key}.description`)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCall(t(`crisis.${key}.number`))}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t(`crisis.${key}.number`)}
                  </button>
                </motion.div>
              )
            )}
          </div>
        </section>

        {/* Disaster Info */}
        <section>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px 0' }}>
            ⚠️ {t('disaster.title')}
          </h2>
          <div
            style={{
              backgroundColor: '#FEF3C7',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                🌏 {t('disaster.earthquakeInfo')}
              </span>
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                🌀 {t('disaster.typhoonInfo')}
              </span>
              <span
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                🏃 {t('disaster.evacuationShelter')}
              </span>
            </div>
            <button
              onClick={() => handleCall('171')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📞 {t('disaster.disasterVoiceDial.number')} - {t('disaster.disasterVoiceDial.name')}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
