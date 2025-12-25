import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavigationHeaderProps {
  title?: string
  showBack?: boolean
  showLanguageSwitcher?: boolean
}

export function NavigationHeader({
  title,
  showBack = true,
  showLanguageSwitcher = true,
}: NavigationHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isTopPage = location.pathname === '/suginami'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showBack && !isTopPage && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              backgroundColor: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ←
          </motion.button>
        )}
        {title && (
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1F2937',
              margin: 0,
            }}
          >
            {title}
          </h1>
        )}
      </div>

      {showLanguageSwitcher && <LanguageSwitcher />}
    </header>
  )
}
