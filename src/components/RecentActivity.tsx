import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProjectEvent, ActivityCategory, Project } from '../types'
import { deleteProjectEvent, updateProjectEvent, getAllProjectEvents, getAllProjects } from '../db/cloudDatabase'
import { deleteLarkEvent, updateLarkEvent, isLarkSyncEnabled } from '../services/larkService'
import { COUNTRY_NAMES, EVENT_CATEGORY, ACTIVITY_CATEGORY_LABELS, ACTIVITY_CATEGORY_COLORS, EVENT_PRESETS } from '../types'

interface ActivityWithProject extends ProjectEvent {
  projectName: string
  countryCode: string
}

export function RecentActivity() {
  const navigate = useNavigate()
  const [editingEvent, setEditingEvent] = useState<ActivityWithProject | null>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    title: '',
    description: '',
    internalParticipants: '',
    externalParticipants: '',
    startTime: '10:00',
    endTime: '11:00',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false)
  const [isScheduledExpanded, setIsScheduledExpanded] = useState(false)

  // Cloud data state
  const [allEvents, setAllEvents] = useState<ProjectEvent[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  // Load data from cloud
  const loadData = useCallback(async () => {
    try {
      const [events, projs] = await Promise.all([
        getAllProjectEvents(),
        getAllProjects(),
      ])
      setAllEvents(events)
      setProjects(projs)
    } catch (error) {
      console.error('Failed to load activity data:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  const { scheduledActivities, completedActivities, allActivities } = useMemo(() => {
    if (!allEvents || !projects) {
      return { scheduledActivities: [], completedActivities: [], allActivities: [] }
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

    // 今日の日付（時間は0:00:00にリセット）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 予定：scheduledで今日以降の日付のみ、日付昇順（近い順）
    const allScheduled = activitiesWithProject
      .filter(a => {
        if (a.eventType !== 'scheduled') return false
        const eventDate = new Date(a.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 完了：eventType !== 'scheduled' または 過去日付のscheduled、日付降順（新しい順）で最新8件
    const completed = activitiesWithProject
      .filter(a => {
        if (a.eventType !== 'scheduled') return true
        // scheduledでも過去日付なら完了扱い
        const eventDate = new Date(a.date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < today
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)

    return {
      scheduledActivities: allScheduled.slice(0, 8),
      completedActivities: completed,
      allActivities: activitiesWithProject,
    }
  }, [allEvents, projects])

  const isLoading = false // フォールバック値があるのでロード中にはならない

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

  const handleDeleteEvent = async (e: React.MouseEvent, activity: ActivityWithProject) => {
    e.stopPropagation() // クリックイベントの伝播を止める

    if (!confirm(`「${activity.title}」を削除しますか？`)) return

    try {
      // Lark連携されている場合は先に削除
      if (activity.larkEventId) {
        await deleteLarkEvent(activity)
      }

      // クラウドDBから削除
      await deleteProjectEvent(activity.id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('削除に失敗しました')
    }
  }

  const handleStartEdit = (e: React.MouseEvent, activity: ActivityWithProject) => {
    e.stopPropagation()
    setEditingEvent(activity)
    setEditForm({
      date: new Date(activity.date).toISOString().split('T')[0],
      title: activity.title,
      description: activity.description || '',
      internalParticipants: activity.internalParticipants || activity.participants || '',
      externalParticipants: activity.externalParticipants || '',
      startTime: activity.startTime || '10:00',
      endTime: activity.endTime || '11:00',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingEvent || !editForm.title || !editForm.date) return

    setIsSaving(true)
    try {
      const updatedEvent = await updateProjectEvent(editingEvent.id, {
        date: new Date(editForm.date),
        title: editForm.title,
        description: editForm.description || undefined,
        internalParticipants: editForm.internalParticipants || undefined,
        externalParticipants: editForm.externalParticipants || undefined,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
      })

      // Lark連携されている場合は更新
      if (updatedEvent && updatedEvent.larkEventId) {
        const larkEnabled = await isLarkSyncEnabled()
        if (larkEnabled) {
          await updateLarkEvent(updatedEvent, editingEvent.projectName, getCountryName(editingEvent.countryCode))
        }
      }

      await loadData()
      setEditingEvent(null)
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    if (allActivities.length === 0) return

    const sortedActivities = [...allActivities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const csvHeader = '種別,日付,国,プロジェクト,イベント,社内参加者,社外参加者,メモ,写真有無\n'
    const csvContent = sortedActivities.map(activity => {
      const eventTypeLabel = activity.eventType === 'scheduled' ? '予定' : '完了'
      const date = formatDateForCSV(activity.date)
      const country = getCountryName(activity.countryCode).replace(/"/g, '""')
      const project = activity.projectName.replace(/"/g, '""')
      const title = activity.title.replace(/"/g, '""')
      const internalParticipants = (activity.internalParticipants || activity.participants || '').replace(/"/g, '""')
      const externalParticipants = (activity.externalParticipants || '').replace(/"/g, '""')
      const description = (activity.description || '').replace(/"/g, '""').replace(/\n/g, ' ')
      const hasImage = activity.imageUrl ? 'あり' : ''
      return `${eventTypeLabel},${date},"${country}","${project}","${title}","${internalParticipants}","${externalParticipants}","${description}",${hasImage}`
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
            {(isScheduledExpanded ? scheduledActivities : scheduledActivities.slice(0, 5)).map((activity, index, arr) => (
              <div
                key={activity.id}
                onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode), projectId: activity.projectId, eventId: activity.id } })}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: index < arr.length - 1 ? '1px solid rgba(249, 115, 22, 0.15)' : 'none',
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
                  <div>{formatDate(activity.date)}</div>
                  {activity.startTime && (
                    <div style={{ fontSize: '0.6rem', color: '#f97316', marginTop: '2px' }}>
                      {activity.startTime}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}>
                    {activity.meetingLocation ? (
                      <span style={{
                        fontSize: '0.6rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: activity.meetingLocation === 'visit' ? '#8b5cf620' : '#10b98120',
                        color: activity.meetingLocation === 'visit' ? '#8b5cf6' : '#10b981',
                        fontWeight: 600,
                      }}>
                        {activity.meetingLocation === 'visit' ? '🚗 訪問' : '🏢 来社'}
                      </span>
                    ) : (
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
                    )}
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
                  {(activity.internalParticipants || activity.participants) && (
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#8b5cf6',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <span>🏢</span>
                      <span>{activity.internalParticipants || activity.participants}</span>
                    </div>
                  )}
                </div>
                {/* 編集・削除ボタン */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    onClick={(e) => handleStartEdit(e, activity)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      opacity: 0.6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.color = '#3b82f6'
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6'
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.background = 'none'
                    }}
                    title="この予定を編集"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDeleteEvent(e, activity)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      color: '#9ca3af',
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      opacity: 0.6,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1'
                      e.currentTarget.style.color = '#ef4444'
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6'
                      e.currentTarget.style.color = '#9ca3af'
                      e.currentTarget.style.background = 'none'
                    }}
                    title="この予定を削除"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {scheduledActivities.length > 5 && (
              <button
                onClick={() => setIsScheduledExpanded(!isScheduledExpanded)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ffedd5, #fed7aa)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #fff7ed, #ffedd5)'}
              >
                {isScheduledExpanded ? (
                  <>
                    <span>▲</span>
                    <span>閉じる</span>
                  </>
                ) : (
                  <>
                    <span>▼</span>
                    <span>もっと見る（{scheduledActivities.length - 5}件）</span>
                  </>
                )}
              </button>
            )}
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
            {(isCompletedExpanded ? completedActivities : completedActivities.slice(0, 3)).map((activity, index, arr) => (
              <div
                key={activity.id}
                onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode), projectId: activity.projectId, eventId: activity.id } })}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: index < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
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
                    {activity.meetingLocation ? (
                      <span style={{
                        fontSize: '0.6rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: activity.meetingLocation === 'visit' ? '#8b5cf620' : '#10b98120',
                        color: activity.meetingLocation === 'visit' ? '#8b5cf6' : '#10b981',
                        fontWeight: 600,
                      }}>
                        {activity.meetingLocation === 'visit' ? '🚗 訪問' : '🏢 来社'}
                      </span>
                    ) : (
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
                    )}
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
                  {(activity.internalParticipants || activity.participants) && (
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#8b5cf6',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}>
                      <span>🏢</span>
                      <span>{activity.internalParticipants || activity.participants}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {completedActivities.length > 3 && (
              <button
                onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '8px',
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff, #dbeafe)'}
              >
                {isCompletedExpanded ? (
                  <>
                    <span>▲</span>
                    <span>閉じる</span>
                  </>
                ) : (
                  <>
                    <span>▼</span>
                    <span>もっと見る（{completedActivities.length - 3}件）</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {editingEvent && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 50,
            }}
            onClick={() => setEditingEvent(null)}
          />
          <div style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            zIndex: 51,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                予定を編集
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 日付 */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  日付
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* イベント名 */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  イベント
                </label>
                <select
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <option value="">選択してください</option>
                  {EVENT_PRESETS.map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                  ))}
                </select>
              </div>

              {/* 時間 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    開始時間
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    終了時間
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {/* 社内参加者 */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  社内参加者
                </label>
                <input
                  type="text"
                  value={editForm.internalParticipants}
                  onChange={(e) => setEditForm({ ...editForm, internalParticipants: e.target.value })}
                  placeholder="例: 山田、田中"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* 社外参加者 */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  社外参加者
                </label>
                <input
                  type="text"
                  value={editForm.externalParticipants}
                  onChange={(e) => setEditForm({ ...editForm, externalParticipants: e.target.value })}
                  placeholder="例: 大使館職員、政府関係者"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* メモ */}
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                  メモ
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'none',
                  }}
                />
              </div>

              {/* プロジェクト情報（読み取り専用） */}
              <div style={{
                padding: '8px 12px',
                background: '#f9fafb',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#6b7280',
              }}>
                {getCountryName(editingEvent.countryCode)} / {editingEvent.projectName}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}>
              <button
                onClick={() => setEditingEvent(null)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editForm.title}
                style={{
                  padding: '8px 16px',
                  background: isSaving ? '#d1d5db' : 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
