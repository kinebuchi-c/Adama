import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { NavigationHeader } from '../components/common'
import { useSuginamiTaskStore } from '../../../stores/suginamiTaskStore'
import type { TaskStatus, TaskCategory } from '../../../types/suginami'
import { TASK_STATUS_COLORS, CATEGORY_COLORS, PRIORITY_COLORS } from '../../../types/suginami'

type FilterType = 'all' | 'priority' | TaskCategory

export function TaskListPage() {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation('common')
  const { tasks, loadTasks, updateTaskStatus, getCompletionStats } = useSuginamiTaskStore()
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const stats = getCompletionStats()

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    if (filter === 'priority') return task.priority === 'high' && task.status !== 'completed'
    return task.category === filter
  })

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus)
  }

  const categories: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'priority', label: t('filter.priority') },
    { key: 'residence', label: t('categories.residence') },
    { key: 'municipal', label: t('categories.municipal') },
    { key: 'insurance', label: t('categories.insurance') },
    { key: 'daily_life', label: t('categories.daily_life') },
  ]

  return (
    <div>
      <NavigationHeader title={t('title')} />

      <main style={{ padding: '16px' }}>
        {/* Stats */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('subtitle')}</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {stats.completed}/{stats.total}
            </span>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              style={{
                height: '100%',
                backgroundColor: '#22C55E',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === cat.key ? '#3B82F6' : 'white',
                color: filter === cat.key ? 'white' : '#6B7280',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  style={{
                    height: '4px',
                    backgroundColor: CATEGORY_COLORS[task.category],
                  }}
                />
                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          margin: 0,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          color: task.status === 'completed' ? '#9CA3AF' : '#1F2937',
                        }}
                      >
                        {t(task.titleKey)}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: '#6B7280',
                          margin: '4px 0 0 0',
                        }}
                      >
                        {t(task.descriptionKey)}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        backgroundColor: `${PRIORITY_COLORS[task.priority]}20`,
                        color: PRIORITY_COLORS[task.priority],
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {tCommon(`priority.${task.priority}`)}
                    </span>
                  </div>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {(['not_started', 'in_progress', 'completed'] as TaskStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(task.id, status)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor:
                            task.status === status ? TASK_STATUS_COLORS[status] : '#F3F4F6',
                          color: task.status === status ? 'white' : '#6B7280',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {tCommon(`status.${status === 'not_started' ? 'notStarted' : status === 'in_progress' ? 'inProgress' : 'completed'}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6B7280',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                {t('empty.title')}
              </h3>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>{t('empty.message')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
