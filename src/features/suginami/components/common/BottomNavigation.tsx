import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { path: '/suginami', icon: '🏠', labelKey: 'nav.home' },
  { path: '/suginami/tasks', icon: '📋', labelKey: 'nav.tasks' },
  { path: '/suginami/documents', icon: '📄', labelKey: 'nav.documents' },
  { path: '/suginami/offices', icon: '🏛️', labelKey: 'nav.offices' },
  { path: '/suginami/help', icon: '🆘', labelKey: 'nav.help' },
]

export function BottomNavigation() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/suginami') {
      return location.pathname === '/suginami'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 0',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path)
        return (
          <motion.button
            key={item.path}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: active ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: active ? 600 : 400,
                color: active ? '#3B82F6' : '#6B7280',
              }}
            >
              {t(item.labelKey)}
            </span>
            {active && (
              <motion.div
                layoutId="bottomNavIndicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
