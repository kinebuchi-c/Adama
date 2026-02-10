import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProjectEvent, Project } from '../types'
import { getAllProjectEvents, getAllProjects } from '../db/cloudDatabase'
import { COUNTRY_NAMES } from '../types'

interface ActivityWithProject extends ProjectEvent {
  projectName: string
  countryCode: string
}

export function PersonSchedule() {
  const navigate = useNavigate()
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

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
      console.error('Failed to load person schedule data:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  const personActivities = useMemo(() => {
    if (!allEvents || !projects) return []

    const projectMap = new Map(projects.map(p => [p.id, p]))

    // 全アクティビティをプロジェクト情報付きで取得
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

    // 参加者ごとにグループ化
    const personMap = new Map<string, { scheduled: ActivityWithProject[]; completed: ActivityWithProject[] }>()

    activitiesWithProject.forEach(activity => {
      // 社内参加者のみを使用（後方互換性のため旧participantsもフォールバック）
      const internalParticipantsStr = activity.internalParticipants || activity.participants
      if (!internalParticipantsStr) return

      // カンマや「、」で区切られた複数の参加者を処理
      const participants = internalParticipantsStr.split(/[,、]/).map(p => p.trim()).filter(p => p)

      // 日付チェック
      const eventDate = new Date(activity.date)
      eventDate.setHours(0, 0, 0, 0)
      const isPast = eventDate < today

      participants.forEach(person => {
        if (!personMap.has(person)) {
          personMap.set(person, { scheduled: [], completed: [] })
        }

        const personData = personMap.get(person)!
        // scheduledでも過去日付なら完了扱い
        if (activity.eventType === 'scheduled' && !isPast) {
          personData.scheduled.push(activity)
        } else {
          personData.completed.push(activity)
        }
      })
    })

    // 配列に変換してソート（予定が多い人順）
    return Array.from(personMap.entries())
      .map(([name, data]) => ({
        name,
        scheduled: data.scheduled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        completed: data.completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }))
      .sort((a, b) => b.scheduled.length - a.scheduled.length || b.completed.length - a.completed.length)
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

  if (isLoading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid rgba(168, 85, 247, 0.2)',
      }}>
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
          読み込み中...
        </div>
      </div>
    )
  }

  if (personActivities.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
        borderRadius: '20px',
        padding: '16px',
        border: '1px solid rgba(168, 85, 247, 0.2)',
      }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#9333ea',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>👤</span>
          <span>担当者別予定</span>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '12px',
          color: '#9ca3af',
          fontSize: '0.75rem',
        }}>
          参加者が登録された予定はありません
        </div>
      </div>
    )
  }

  const selectedPersonData = selectedPerson
    ? personActivities.find(p => p.name === selectedPerson)
    : null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
      borderRadius: '20px',
      padding: '16px',
      border: '1px solid rgba(168, 85, 247, 0.2)',
    }}>
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#9333ea',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>👤</span>
        <span>担当者別予定</span>
      </div>

      {/* 担当者リスト */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '12px',
      }}>
        {personActivities.map(person => (
          <button
            key={person.name}
            onClick={() => setSelectedPerson(selectedPerson === person.name ? null : person.name)}
            style={{
              padding: '6px 10px',
              borderRadius: '12px',
              border: 'none',
              background: selectedPerson === person.name
                ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
                : 'rgba(168, 85, 247, 0.15)',
              color: selectedPerson === person.name ? 'white' : '#7c3aed',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <span>{person.name}</span>
            {person.scheduled.length > 0 && (
              <span style={{
                background: selectedPerson === person.name ? 'rgba(255,255,255,0.3)' : '#f97316',
                color: selectedPerson === person.name ? 'white' : 'white',
                fontSize: '0.6rem',
                padding: '1px 5px',
                borderRadius: '8px',
              }}>
                {person.scheduled.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 選択された担当者の詳細 */}
      {selectedPersonData && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '12px',
          marginTop: '8px',
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>👤</span>
            <span>{selectedPersonData.name}</span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 400 }}>
              の予定
            </span>
          </div>

          {/* 予定 */}
          {selectedPersonData.scheduled.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#f97316',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>📅</span>
                <span>予定 ({selectedPersonData.scheduled.length})</span>
              </div>
              {selectedPersonData.scheduled.map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode) } })}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '6px',
                    borderRadius: '8px',
                    marginBottom: index < selectedPersonData.scheduled.length - 1 ? '4px' : 0,
                    cursor: 'pointer',
                    background: '#fff7ed',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ffedd5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fff7ed'}
                >
                  <div style={{
                    fontSize: '0.65rem',
                    color: '#ea580c',
                    fontWeight: 600,
                    minWidth: '45px',
                  }}>
                    {formatDate(activity.date)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: '#1f2937',
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#9ca3af',
                    }}>
                      {getCountryName(activity.countryCode)} / {activity.projectName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 完了 */}
          {selectedPersonData.completed.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#10b981',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>✅</span>
                <span>完了 ({selectedPersonData.completed.length})</span>
              </div>
              {selectedPersonData.completed.slice(0, 3).map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={() => navigate(`/country/${activity.countryCode}`, { state: { countryName: getCountryName(activity.countryCode) } })}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '6px',
                    borderRadius: '8px',
                    marginBottom: index < Math.min(selectedPersonData.completed.length, 3) - 1 ? '4px' : 0,
                    cursor: 'pointer',
                    background: '#f0fdf4',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
                >
                  <div style={{
                    fontSize: '0.65rem',
                    color: '#059669',
                    fontWeight: 600,
                    minWidth: '45px',
                  }}>
                    {formatDate(activity.date)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: '#1f2937',
                    }}>
                      {activity.title}
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      color: '#9ca3af',
                    }}>
                      {getCountryName(activity.countryCode)} / {activity.projectName}
                    </div>
                  </div>
                </div>
              ))}
              {selectedPersonData.completed.length > 3 && (
                <div style={{
                  fontSize: '0.65rem',
                  color: '#9ca3af',
                  textAlign: 'center',
                  marginTop: '4px',
                }}>
                  他 {selectedPersonData.completed.length - 3} 件
                </div>
              )}
            </div>
          )}

          {selectedPersonData.scheduled.length === 0 && selectedPersonData.completed.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.75rem',
              padding: '8px',
            }}>
              予定・履歴はありません
            </div>
          )}
        </div>
      )}

      {/* 未選択時のヒント */}
      {!selectedPerson && (
        <div style={{
          textAlign: 'center',
          color: '#a78bfa',
          fontSize: '0.7rem',
          padding: '8px',
        }}>
          担当者をクリックして予定を表示
        </div>
      )}
    </div>
  )
}
