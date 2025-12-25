import { motion } from 'framer-motion'

interface CategoryCardProps {
  icon: string
  title: string
  description?: string
  color?: string
  onClick?: () => void
}

export function CategoryCard({
  icon,
  title,
  description,
  color = '#3B82F6',
  onClick,
}: CategoryCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '20px 16px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}15`,
          borderRadius: '12px',
          fontSize: '24px',
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1F2937',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontSize: '12px',
              color: '#6B7280',
              margin: '4px 0 0 0',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </motion.button>
  )
}
