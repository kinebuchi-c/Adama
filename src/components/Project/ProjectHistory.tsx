import { useState, useEffect, useRef } from 'react'
import type { ProjectEvent, EventType, DiplomacyPhase, ProjectStatus } from '../../types'
import { EVENT_PRESETS, EVENT_AUTO_UPDATE, DIPLOMACY_PHASE_LABELS, STATUS_LABELS } from '../../types'
import { getProjectEvents, addProjectEvent, deleteProjectEvent, updateProjectEvent } from '../../db/database'

interface ProjectHistoryProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
  currentDiplomacyPhase?: DiplomacyPhase
  currentStatus?: ProjectStatus
  onUpdateProject?: (updates: { diplomacyPhase?: DiplomacyPhase; status?: ProjectStatus }) => void
}

export function ProjectHistory({
  projectId,
  projectName,
  isOpen,
  onClose,
  currentDiplomacyPhase,
  currentStatus,
  onUpdateProject,
}: ProjectHistoryProps) {
  const [events, setEvents] = useState<ProjectEvent[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [autoSync, setAutoSync] = useState(true)
  const [newEvent, setNewEvent] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    imageUrl: '',
    eventType: 'completed' as EventType,
    participants: '',
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 選択中のイベントに対する自動更新情報を取得
  const getAutoUpdateInfo = () => {
    const update = EVENT_AUTO_UPDATE[newEvent.title]
    if (!update) return null

    const changes: string[] = []

    // フェーズの変更をチェック（現在より高いフェーズのみ適用）
    if (update.diplomacyPhase !== undefined &&
        currentDiplomacyPhase !== undefined &&
        update.diplomacyPhase > currentDiplomacyPhase) {
      changes.push(`外交フェーズ → ${DIPLOMACY_PHASE_LABELS[update.diplomacyPhase]}`)
    }

    // ステータスの変更をチェック
    if (update.status && update.status !== currentStatus) {
      changes.push(`進行状況 → ${STATUS_LABELS[update.status]}`)
    }

    return changes.length > 0 ? changes : null
  }

  useEffect(() => {
    if (isOpen && projectId) {
      loadEvents()
    }
  }, [isOpen, projectId])

  const loadEvents = async () => {
    const loaded = await getProjectEvents(projectId)
    // 予定を上、完了を下に。それぞれ日付でソート
    setEvents(loaded.sort((a, b) => {
      // まず予定を上に
      if (a.eventType === 'scheduled' && b.eventType !== 'scheduled') return -1
      if (a.eventType !== 'scheduled' && b.eventType === 'scheduled') return 1
      // 予定は日付昇順（近い順）、完了は日付降順（新しい順）
      if (a.eventType === 'scheduled') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像を圧縮してbase64に変換
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // 画像を圧縮（最大幅800px）
        const canvas = document.createElement('canvas')
        const maxWidth = 800
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setNewEvent({ ...newEvent, imageUrl: compressedDataUrl })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) return

    await addProjectEvent({
      projectId,
      date: new Date(newEvent.date),
      title: newEvent.title,
      description: newEvent.description || undefined,
      imageUrl: newEvent.imageUrl || undefined,
      eventType: newEvent.eventType,
      participants: newEvent.participants || undefined,
    })

    // 完了イベントの場合、自動同期が有効なら更新
    if (autoSync && newEvent.eventType === 'completed' && onUpdateProject) {
      const update = EVENT_AUTO_UPDATE[newEvent.title]
      if (update) {
        const updates: { diplomacyPhase?: DiplomacyPhase; status?: ProjectStatus } = {}

        // フェーズは現在より高い場合のみ更新
        if (update.diplomacyPhase !== undefined &&
            currentDiplomacyPhase !== undefined &&
            update.diplomacyPhase > currentDiplomacyPhase) {
          updates.diplomacyPhase = update.diplomacyPhase
        }

        // ステータスは変更がある場合のみ更新
        if (update.status && update.status !== currentStatus) {
          updates.status = update.status
        }

        if (Object.keys(updates).length > 0) {
          onUpdateProject(updates)
        }
      }
    }

    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      imageUrl: '',
      eventType: 'completed',
      participants: '',
    })
    setIsAdding(false)
    await loadEvents()
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('このイベントを削除しますか？')) {
      await deleteProjectEvent(eventId)
      await loadEvents()
    }
  }

  const handleStartEdit = (event: ProjectEvent) => {
    setEditingEventId(event.id)
    setNewEvent({
      date: new Date(event.date).toISOString().split('T')[0],
      title: event.title,
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      eventType: event.eventType || 'completed',
      participants: event.participants || '',
    })
    setIsAdding(false)
  }

  const handleUpdateEvent = async () => {
    if (!editingEventId || !newEvent.title || !newEvent.date) return

    await updateProjectEvent(editingEventId, {
      date: new Date(newEvent.date),
      title: newEvent.title,
      description: newEvent.description || undefined,
      imageUrl: newEvent.imageUrl || undefined,
      eventType: newEvent.eventType,
      participants: newEvent.participants || undefined,
    })

    setEditingEventId(null)
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      imageUrl: '',
      eventType: 'completed',
      participants: '',
    })
    await loadEvents()
  }

  const handleCancelEdit = () => {
    setEditingEventId(null)
    setNewEvent({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      imageUrl: '',
      eventType: 'completed',
      participants: '',
    })
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
    if (events.length === 0) return

    // 時系列順（古い順）にソート
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // CSV形式で作成
    const csvHeader = '種別,日付,イベント,参加者,メモ,写真有無\n'
    const csvContent = sortedEvents.map(event => {
      const eventTypeLabel = event.eventType === 'scheduled' ? '予定' : '完了'
      const date = formatDateForCSV(event.date)
      const title = event.title.replace(/"/g, '""')
      const participants = (event.participants || '').replace(/"/g, '""')
      const description = (event.description || '').replace(/"/g, '""').replace(/\n/g, ' ')
      const hasImage = event.imageUrl ? 'あり' : ''
      return `${eventTypeLabel},${date},"${title}","${participants}","${description}",${hasImage}`
    }).join('\n')

    const bom = '\uFEFF' // Excel用BOM
    const blob = new Blob([bom + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName}_活動履歴_${formatDateForCSV(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
        }}
        onClick={onClose}
      />

      {/* モーダル */}
      <div style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        zIndex: 51,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* ヘッダー */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>
              活動履歴
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '4px 0 0 0' }}>
              {projectName}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {events.length > 0 && (
              <button
                onClick={handleDownload}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="CSVでダウンロード"
              >
                <span>📥</span> CSV
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '4px',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
        }}>
          {/* 追加ボタン */}
          {!isAdding && !editingEventId && (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>+</span> 新しいイベントを追加
            </button>
          )}

          {/* 追加・編集フォーム */}
          {(isAdding || editingEventId) && (
            <div style={{
              background: editingEventId ? '#fef3c7' : '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: editingEventId ? '1px solid #fcd34d' : 'none',
            }}>
              {editingEventId && (
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#92400e',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  ✏️ イベントを編集中
                </div>
              )}
              {/* 種別選択 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  種別 *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, eventType: 'completed' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: newEvent.eventType === 'completed' ? '#3b82f6' : '#f3f4f6',
                      color: newEvent.eventType === 'completed' ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    ✓ 完了
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, eventType: 'scheduled' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: newEvent.eventType === 'scheduled' ? '#f97316' : '#f3f4f6',
                      color: newEvent.eventType === 'scheduled' ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    📅 予定
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  {newEvent.eventType === 'scheduled' ? '予定日 *' : '日付 *'}
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  イベント内容 *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {EVENT_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, title: preset })}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        background: newEvent.title === preset ? '#3b82f6' : '#e5e7eb',
                        color: newEvent.title === preset ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="例: 大使館訪問、政府関係者との面談"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* 自動同期オプション（完了イベントで自動更新がある場合のみ表示） */}
              {newEvent.eventType === 'completed' && onUpdateProject && getAutoUpdateInfo() && (
                <div style={{
                  marginBottom: '12px',
                  background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#065f46',
                  }}>
                    <input
                      type="checkbox"
                      checked={autoSync}
                      onChange={(e) => setAutoSync(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                    />
                    <span>プロジェクト状態を自動更新</span>
                  </label>
                  {autoSync && (
                    <div style={{
                      marginTop: '8px',
                      paddingLeft: '24px',
                      fontSize: '0.75rem',
                      color: '#047857',
                    }}>
                      {getAutoUpdateInfo()?.map((change, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✓</span>
                          <span>{change}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  メモ（任意）
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="詳細メモ..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'none',
                  }}
                />
              </div>

              {/* 参加者 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  参加者（任意）
                </label>
                <input
                  type="text"
                  value={newEvent.participants}
                  onChange={(e) => setNewEvent({ ...newEvent, participants: e.target.value })}
                  placeholder="例: 山田太郎, 田中花子"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* 写真追加 */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  写真（任意）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                {newEvent.imageUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={newEvent.imageUrl}
                      alt="プレビュー"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '150px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewEvent({ ...newEvent, imageUrl: '' })
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '1px dashed #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>📷</span> 写真を追加
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={editingEventId ? handleCancelEdit : () => setIsAdding(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={editingEventId ? handleUpdateEvent : handleAddEvent}
                  disabled={!newEvent.title || !newEvent.date}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: newEvent.title && newEvent.date
                      ? (editingEventId ? '#f59e0b' : '#3b82f6')
                      : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: newEvent.title && newEvent.date ? 'pointer' : 'not-allowed',
                  }}
                >
                  {editingEventId ? '更新' : '追加'}
                </button>
              </div>
            </div>
          )}

          {/* イベント一覧 */}
          {events.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              color: '#9ca3af',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
              <p>まだ活動履歴がありません</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* タイムライン線 */}
              <div style={{
                position: 'absolute',
                left: '8px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: '#e5e7eb',
              }} />

              {events.map((event, index) => {
                const isScheduled = event.eventType === 'scheduled'
                const dotColor = isScheduled ? '#f97316' : '#3b82f6'
                const bgColor = isScheduled ? '#fff7ed' : '#f9fafb'
                const borderColor = isScheduled ? '#fed7aa' : 'transparent'

                return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: index < events.length - 1 ? '16px' : 0,
                    position: 'relative',
                  }}
                >
                  {/* タイムラインドット */}
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: dotColor,
                    border: '3px solid white',
                    boxShadow: `0 0 0 2px ${dotColor}`,
                    flexShrink: 0,
                    zIndex: 1,
                  }} />

                  {/* イベント内容 */}
                  <div style={{
                    flex: 1,
                    background: bgColor,
                    borderRadius: '10px',
                    padding: '12px',
                    border: isScheduled ? `1px solid ${borderColor}` : 'none',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isScheduled && (
                          <span style={{
                            fontSize: '0.65rem',
                            background: '#f97316',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}>
                            予定
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.75rem',
                          color: isScheduled ? '#f97316' : '#3b82f6',
                          fontWeight: 600,
                        }}>
                          {formatDate(event.date)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleStartEdit(event)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            fontSize: '0.8rem',
                            padding: '2px',
                          }}
                          title="編集"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            fontSize: '0.8rem',
                            padding: '2px',
                          }}
                          title="削除"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: '#1f2937',
                    }}>
                      {event.title}
                    </div>
                    {event.description && (
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        marginTop: '4px',
                      }}>
                        {event.description}
                      </div>
                    )}
                    {event.participants && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#8b5cf6',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span>👥</span>
                        <span>{event.participants}</span>
                      </div>
                    )}
                    {event.imageUrl && (
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          onClick={() => setPreviewImage(event.imageUrl!)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '120px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: '1px solid #e5e7eb',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      {/* 画像プレビューモーダル */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <img
            src={previewImage}
            alt="プレビュー"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
