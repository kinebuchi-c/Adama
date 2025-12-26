import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import type { ProjectEvent, ActivityCategory } from '../types'
import { db } from '../db/database'
import { COUNTRY_NAMES, EVENT_CATEGORY, ACTIVITY_CATEGORY_LABELS, ACTIVITY_CATEGORY_COLORS } from '../types'

interface ActivityWithProject extends ProjectEvent {
  projectName: string
  countryCode: string
}

export function SchedulePage() {
  const navigate = useNavigate()

  // useLiveQueryでデータベースの変更を自動監視
  const allEvents = useLiveQuery(() => db.projectEvents.toArray())
  const projects = useLiveQuery(() => db.projects.toArray())

  const scheduledActivities = useMemo(() => {
    if (!allEvents || !projects) {
      return []
    }

    const projectMap = new Map(projects.map(p => [p.id, p]))

    const activitiesWithProject: ActivityWithProject[] = allEvents
      .map(event => {
        const project = projectMap.get(event.projectId)
        if (!project) return null
        return {
          ...event,
          projectName: project.name,
          countryCode: project.countryCode,
        }
      })
      .filter((a): a is ActivityWithProject => a !== null)

    // 予定のみ：日付昇順（近い順）
    return activitiesWithProject
      .filter(a => a.eventType === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [allEvents, projects])

  const isLoading = allEvents === undefined || projects === undefined

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateShort = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getCountryName = (code: string) => {
    return COUNTRY_NAMES[code] || code
  }

  const getActivityCategory = (activity: ActivityWithProject): ActivityCategory => {
    return activity.activityCategory || EVENT_CATEGORY[activity.title] || 'internal'
  }

  // 日付でグループ化
  const groupedByDate = scheduledActivities.reduce((acc, activity) => {
    const dateKey = new Date(activity.date).toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(activity)
    return acc
  }, {} as Record<string, ActivityWithProject[]>)

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          読み込み中...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #fed7aa',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#ea580c',
            }}
          >
            ← 戻る
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ea580c',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>📅</span>
            <span>すべての予定</span>
          </h1>
        </div>

        {/* 予定一覧 */}
        {scheduledActivities.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
              予定はまだありません
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedDates.map(dateKey => (
              <div key={dateKey}>
                {/* 日付ヘッダー */}
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ea580c',
                  marginBottom: '8px',
                  padding: '8px 12px',
                  background: 'rgba(249, 115, 22, 0.1)',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}>
                  {formatDate(new Date(dateKey))}
                </div>

                {/* その日の予定 */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}>
                  {groupedByDate[dateKey].map((activity, index) => (
                    <div
                      key={activity.id}
                      style={{
                        padding: '16px',
                        borderBottom: index < groupedByDate[dateKey].length - 1
                          ? '1px solid #fed7aa'
                          : 'none',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                          }}>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: `${ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)]}20`,
                              color: ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)],
                              fontWeight: 600,
                            }}>
                              {getActivityCategory(activity) === 'external' ? '🚀' : '📝'} {ACTIVITY_CATEGORY_LABELS[getActivityCategory(activity)]}
                            </span>
                            <span style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: '#1f2937',
                            }}>
                              {activity.title}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#78716c',
                            marginBottom: '4px',
                          }}>
                            {getCountryName(activity.countryCode)} / {activity.projectName}
                          </div>
                          {activity.participants && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#ea580c',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '6px',
                            }}>
                              <span>👥</span>
                              <span>{activity.participants}</span>
                            </div>
                          )}
                          {activity.description && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#9ca3af',
                              marginTop: '8px',
                              padding: '8px 12px',
                              background: '#fef6ee',
                              borderRadius: '8px',
                            }}>
                              {activity.description}
                            </div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#ea580c',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}>
                          {formatDateShort(activity.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
