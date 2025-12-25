import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader, CategoryCard } from '../components/common'
import { useSuginamiTaskStore } from '../../../stores/suginamiTaskStore'

export function TopPage() {
  const { t } = useTranslation('common')
  const { t: tTasks } = useTranslation('tasks')
  const navigate = useNavigate()
  const { tasks, loadTasks, getHighPriorityTasks, getCompletionStats } = useSuginamiTaskStore()

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const highPriorityTasks = getHighPriorityTasks()
  const stats = getCompletionStats()

  const categories = [
    { icon: '📋', labelKey: 'nav.tasks', path: '/suginami/tasks', color: '#3B82F6' },
    { icon: '📄', labelKey: 'nav.documents', path: '/suginami/documents', color: '#10B981' },
    { icon: '🏛️', labelKey: 'nav.offices', path: '/suginami/offices', color: '#8B5CF6' },
    { icon: '🏠', labelKey: 'nav.life', path: '/suginami/life', color: '#F59E0B' },
    { icon: '💬', labelKey: 'nav.phrases', path: '/suginami/phrases', color: '#EC4899' },
    { icon: 'ℹ️', labelKey: 'nav.info', path: '/suginami/info', color: '#6366F1' },
  ]

  return (
    <div>
      <NavigationHeader showBack={false} />

      <main style={{ padding: '16px' }}>
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            borderRadius: '20px',
            padding: '24px',
            color: 'white',
            marginBottom: '24px',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            {t('welcome.greeting')} 👋
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: '8px 0 0 0' }}>
            {t('welcome.message')}
          </p>

          {tasks.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px' }}>{tTasks('title')}</span>
                <span style={{ fontSize: '12px' }}>
                  {stats.completed}/{stats.total} ({stats.percentage}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* High Priority Tasks */}
        {highPriorityTasks.length > 0 && (
          <section style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#1F2937' }}>
                ⚡ {tTasks('filter.priority')}
              </h2>
              <button
                onClick={() => navigate('/suginami/tasks')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {t('actions.viewAll')} →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highPriorityTasks.slice(0, 3).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate('/suginami/tasks')}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    borderLeft: '4px solid #EF4444',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {tTasks(task.titleKey)}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>
                    {tTasks(task.descriptionKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 12px 0',
              color: '#1F2937',
            }}
          >
            🧭 {t('nav.home')}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.path}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <CategoryCard
                  icon={category.icon}
                  title={t(category.labelKey)}
                  color={category.color}
                  onClick={() => navigate(category.path)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
