import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header style={{
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <motion.span
            style={{ fontSize: '24px' }}
            animate={{ rotate: isHome ? 0 : 360 }}
            transition={{ duration: 0.5 }}
          >
            🌳
          </motion.span>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>Baobab World Map</span>
        </Link>

        {!isHome && (
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              color: '#4b5563',
              textDecoration: 'none',
            }}
          >
            <span>←</span>
            <span>地図に戻る</span>
          </Link>
        )}
      </div>
    </header>
  )
}
