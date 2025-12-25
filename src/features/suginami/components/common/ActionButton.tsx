import { motion } from 'framer-motion'

interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  icon?: string
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
}: ActionButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#3B82F6',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3B82F6',
      border: '2px solid #3B82F6',
    },
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '16px',
    },
    lg: {
      padding: '16px 32px',
      fontSize: '18px',
    },
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={disabled ? undefined : onClick}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  )
}
