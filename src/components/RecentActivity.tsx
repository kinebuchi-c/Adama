import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProjectEvent, ActivityCategory } from '../types'
import { db } from '../db/database'
import { COUNTRY_NAMES, EVENT_CATEGORY, ACTIVITY_CATEGORY_LABELS, ACTIVITY_CATEGORY_COLORS } from '../types'

interface ActivityWithProject extends ProjectEvent {
  projectName: string
  countryCode: string
}

export function RecentActivity() {
  const navigate = useNavigate()
  const [scheduledActivities, setScheduledActivities] = useState<ActivityWithProject[]>([])
  const [completedActivities, setCompletedActivities] = useState<ActivityWithProject[]>([])
  const [allActivities, setAllActivities] = useState<ActivityWithProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentActivities()
  }, [])

  const loadRecentActivities = async () => {
    try {
      const allEvents = await db.projectEvents.toArray()
      const projects = await db.projects.toArray()
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

      setAllActivities(activitiesWithProject)

      // 予定：日付昇順（近い順）
      const allScheduled = activitiesWithProject
        .filter(a => a.eventType === 'scheduled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setScheduledActivities(allScheduled.slice(0, 8))

      // 完了：日付降順（新しい順）で最新8件
      const completed = activitiesWithProject
        .filter(a => a.eventType !== 'scheduled')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8)
      setCompletedActivities(completed)
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
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

  const formatDateForCSV = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-')
  }

  const handleDownload = () => {
    if (allActivities.length === 0) return

    const sortedActivities = [...allActivities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const csvHeader = '種別,日付,国,プロジェクト,イベント,参加者,メモ,写真有無\n'
    const csvContent = sortedActivities.map(activity => {
      const eventTypeLabel = activity.eventType === 'scheduled' ? '予定' : '完了'
      const date = formatDateForCSV(activity.date)
      const country = getCountryName(activity.countryCode).replace(/"/g, '""')
      const project = activity.projectName.replace(/"/g, '""')
      const title = activity.title.replace(/"/g, '""')
      const participants = (activity.participants || '').replace(/"/g, '""')
      const description = (activity.description || '').replace(/"/g, '""').replace(/\n/g, ' ')
      const hasImage = activity.imageUrl ? 'あり' : ''
      return `${eventTypeLabel},${date},"${country}","${project}","${title}","${participants}","${description}",${hasImage}`
    }).join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `全活動履歴_${formatDateForCSV(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
          読み込み中...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* これからの予定 */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid rgba(249, 115, 22, 0.2)',
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#ea580c',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅</span>
            <span>これからの予定</span>
          </div>
          <button
            onClick={() => navigate('/schedule')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            すべて見る →
          </button>
        </div>

        {scheduledActivities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            color: '#9ca3af',
            fontSize: '0.75rem',
          }}>
            予定はありません
          </div>
        ) : (
          <div>
            {scheduledActivities.map((activity, index) => (
              <div
                key={activity.id}
                onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode) } })}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: index < scheduledActivities.length - 1 ? '1px solid rgba(249, 115, 22, 0.15)' : 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  margin: '0 -4px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  fontSize: '0.7rem',
                  color: '#ea580c',
                  fontWeight: 600,
                  minWidth: '50px',
                }}>
                  {formatDate(activity.date)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}>
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: `${ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)]}20`,
                      color: ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)],
                      fontWeight: 600,
                    }}>
                      {getActivityCategory(activity) === 'external' ? '🚀' : '📝'} {ACTIVITY_CATEGORY_LABELS[getActivityCategory(activity)]}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#1f2937',
                    }}>
                      {activity.title}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: '#78716c',
                  }}>
                    {getCountryName(activity.countryCode)} / {activity.projectName}
                  </div>
                  {activity.participants && (
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#ea580c',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <span>👥</span>
                      <span>{activity.participants}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 完了した活動 */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#3b82f6',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✅</span>
            <span>完了した活動</span>
          </div>
          {allActivities.length > 0 && (
            <button
              onClick={handleDownload}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
              title="全履歴をCSVでダウンロード"
            >
              <span>📥</span> CSV
            </button>
          )}
        </div>

        {completedActivities.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            color: '#9ca3af',
            fontSize: '0.75rem',
          }}>
            まだ活動履歴がありません
          </div>
        ) : (
          <div>
            {completedActivities.map((activity, index) => (
              <div
                key={activity.id}
                onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode) } })}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: index < completedActivities.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  margin: '0 -4px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  fontSize: '0.7rem',
                  color: '#3b82f6',
                  fontWeight: 600,
                  minWidth: '50px',
                }}>
                  {formatDate(activity.date)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}>
                    <span style={{
                      fontSize: '0.6rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: `${ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)]}20`,
                      color: ACTIVITY_CATEGORY_COLORS[getActivityCategory(activity)],
                      fontWeight: 600,
                    }}>
                      {getActivityCategory(activity) === 'external' ? '🚀' : '📝'} {ACTIVITY_CATEGORY_LABELS[getActivityCategory(activity)]}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#1f2937',
                    }}>
                      {activity.title}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: '#9ca3af',
                  }}>
                    {getCountryName(activity.countryCode)} / {activity.projectName}
                  </div>
                  {activity.participants && (
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#8b5cf6',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <span>👥</span>
                      <span>{activity.participants}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
