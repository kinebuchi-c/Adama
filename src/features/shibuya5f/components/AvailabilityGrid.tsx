import { useMemo, useState } from 'react'
import { useScheduleStore } from '../stores/scheduleStore'
import {
  getWeekDates,
  getMonthDates,
  formatDateKey,
  isHoliday,
  getHolidayName,
  PLACE_STATUS_COLORS,
  PLACE_STATUS_LABELS,
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_ICONS,
  EMPTY_COLOR,
} from '../types'
import type { Member, MemberStatus, PlaceStatus } from '../types'

interface AvailabilityGridProps {
  members: Member[]
  title: string
  type: 'place' | 'person'
  emptyMessage: string
  onAddClick: () => void
  showNavigation?: boolean
}

export function AvailabilityGrid({
  members,
  title,
  type,
  emptyMessage,
  onAddClick,
  showNavigation = false,
}: AvailabilityGridProps) {
  const {
    selectedDate,
    viewMode,
    availability,
    togglePlaceStatus,
    toggleMemberStatus,
    setPlaceStatus,
    setMemberStatus,
    updateNote,
    setEditingMember,
    setViewMode,
    goToPrev,
    goToNext,
    goToToday,
  } = useScheduleStore()

  const [editingNote, setEditingNote] = useState<{ memberId: string; date: Date } | null>(null)
  const [noteText, setNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [bulkInputMember, setBulkInputMember] = useState<Member | null>(null)

  const dates = useMemo(() => {
    return viewMode === 'week' ? getWeekDates(selectedDate) : getMonthDates(selectedDate)
  }, [selectedDate, viewMode])

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const query = searchQuery.toLowerCase()
    return members.filter(m => m.name.toLowerCase().includes(query))
  }, [members, searchQuery])

  const today = new Date()
  const todayKey = formatDateKey(today)
  const currentMonth = selectedDate.getMonth()

  const getRecord = (memberId: string, date: Date) => {
    const dateKey = formatDateKey(date)
    return availability.find(a => a.memberId === memberId && a.date === dateKey)
  }

  const handleCellClick = (memberId: string, date: Date) => {
    if (type === 'place') {
      togglePlaceStatus(memberId, date)
    } else {
      toggleMemberStatus(memberId, date)
    }
  }

  const handleNoteClick = (e: React.MouseEvent, memberId: string, date: Date) => {
    e.stopPropagation()
    const record = getRecord(memberId, date)
    setNoteText(record?.note || '')
    setEditingNote({ memberId, date })
  }

  const handleNoteSave = () => {
    if (editingNote) {
      updateNote(editingNote.memberId, editingNote.date, noteText)
      setEditingNote(null)
    }
  }

  const handleBulkInput = (status: PlaceStatus | MemberStatus | 'clear') => {
    if (!bulkInputMember) return

    // Only apply to dates in current month (for month view) or all visible dates (for week view)
    const targetDates = viewMode === 'week'
      ? dates
      : dates.filter(d => d.getMonth() === currentMonth)

    targetDates.forEach(date => {
      if (type === 'place') {
        setPlaceStatus(bulkInputMember.id, date, status === 'clear' ? null : status as PlaceStatus)
      } else {
        setMemberStatus(bulkInputMember.id, date, status === 'clear' ? null : status as MemberStatus)
      }
    })

    setBulkInputMember(null)
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fafafa',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
          {title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search input */}
          {members.length > 3 && (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="検索..."
                style={{
                  padding: '6px 10px 6px 30px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  width: '140px',
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '13px',
                color: '#9ca3af',
              }}>🔍</span>
            </div>
          )}
          <button
            onClick={onAddClick}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '6px',
              background: '#3B82F6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            + 追加
          </button>
        </div>
      </div>

      {/* Navigation */}
      {showNavigation && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #f3f4f6',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <button
            onClick={goToPrev}
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            ← {viewMode === 'week' ? '前週' : '前月'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View mode toggle */}
            <div style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: '6px',
              padding: '2px',
            }}>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '4px 10px',
                  background: viewMode === 'week' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: viewMode === 'week' ? 600 : 400,
                  color: viewMode === 'week' ? '#3B82F6' : '#6b7280',
                  boxShadow: viewMode === 'week' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                週
              </button>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '4px 10px',
                  background: viewMode === 'month' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: viewMode === 'month' ? 600 : 400,
                  color: viewMode === 'month' ? '#3B82F6' : '#6b7280',
                  boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                月
              </button>
            </div>

            <span style={{ fontWeight: 600, fontSize: '15px' }}>
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
            </span>
            <button
              onClick={goToToday}
              style={{
                padding: '4px 10px',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              今日
            </button>
          </div>

          <button
            onClick={goToNext}
            style={{
              padding: '6px 12px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {viewMode === 'week' ? '次週' : '次月'} →
          </button>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          {searchQuery ? `「${searchQuery}」に一致するメンバーが見つかりません` : emptyMessage}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: viewMode === 'week' ? '700px' : '900px' }}>
            <thead>
              <tr>
                <th style={{
                  padding: viewMode === 'week' ? '12px 16px' : '8px 12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  minWidth: viewMode === 'week' ? '140px' : '100px',
                }}>
                  名前
                </th>
                {dates.map((date, i) => {
                  const isToday = formatDateKey(date) === todayKey
                  const isCurrentMonth = date.getMonth() === currentMonth
                  const dayOfWeek = date.getDay()
                  const isSunday = dayOfWeek === 0
                  const isSaturday = dayOfWeek === 6
                  const holiday = isHoliday(date)
                  const holidayName = getHolidayName(date)
                  const isRedDay = isSunday || holiday
                  return (
                    <th
                      key={i}
                      style={{
                        padding: viewMode === 'week' ? '12px 8px' : '6px 2px',
                        textAlign: 'center',
                        borderBottom: '2px solid #e5e7eb',
                        background: isToday ? '#EFF6FF' : isRedDay && isCurrentMonth ? '#FEF2F2' : !isCurrentMonth ? '#f3f4f6' : '#f9fafb',
                        minWidth: viewMode === 'week' ? '80px' : '28px',
                        opacity: isCurrentMonth ? 1 : 0.5,
                      }}
                      title={holidayName}
                    >
                      <div style={{
                        fontSize: viewMode === 'week' ? '12px' : '10px',
                        color: isToday ? '#3B82F6' : isRedDay ? '#EF4444' : isSaturday ? '#3B82F6' : '#6b7280',
                        fontWeight: isToday || holiday ? 600 : 400,
                      }}>
                        {viewMode === 'week' ? (
                          <>
                            {`${date.getMonth() + 1}/${date.getDate()}(${['日','月','火','水','木','金','土'][dayOfWeek]})`}
                            {holiday && <div style={{ fontSize: '9px', color: '#EF4444' }}>{holidayName}</div>}
                          </>
                        ) : (
                          date.getDate()
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td style={{
                    padding: viewMode === 'week' ? '10px 16px' : '6px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    background: 'white',
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{ cursor: 'pointer', flex: 1 }}
                        onClick={() => setEditingMember(member)}
                      >
                        <div style={{ fontWeight: 500, color: '#1f2937', fontSize: viewMode === 'week' ? '14px' : '12px' }}>
                          {member.name}
                        </div>
                        {viewMode === 'week' && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {member.hours && (
                              <span style={{ fontSize: '10px', color: '#6b7280' }}>
                                🕐 {member.hours}
                              </span>
                            )}
                            {member.mapUrl && (
                              <a
                                href={member.mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '10px', color: '#3B82F6', textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                📍 地図
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Bulk input button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setBulkInputMember(member)
                        }}
                        title={`${viewMode === 'week' ? '週' : '月'}一括入力`}
                        style={{
                          padding: '4px 6px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          background: '#f9fafb',
                          cursor: 'pointer',
                          fontSize: '10px',
                          color: '#6b7280',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        一括
                      </button>
                    </div>
                  </td>
                  {dates.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentMonth
                    const record = getRecord(member.id, date)
                    const isToday = formatDateKey(date) === todayKey

                    if (type === 'place') {
                      const status = record?.placeStatus
                      const note = record?.note
                      const cellSize = viewMode === 'week' ? 36 : 22
                      return (
                        <td
                          key={i}
                          style={{
                            padding: viewMode === 'week' ? '4px' : '3px',
                            textAlign: 'center',
                            borderBottom: '1px solid #f3f4f6',
                            background: isToday ? '#FAFBFF' : !isCurrentMonth ? '#fafafa' : 'white',
                            position: 'relative',
                            opacity: isCurrentMonth ? 1 : 0.4,
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                            {/* Status cell */}
                            <div
                              onClick={() => handleCellClick(member.id, date)}
                              style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                borderRadius: viewMode === 'week' ? '8px' : '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: status ? `${PLACE_STATUS_COLORS[status]}20` : EMPTY_COLOR,
                                color: status ? PLACE_STATUS_COLORS[status] : '#9ca3af',
                                fontWeight: 700,
                                fontSize: viewMode === 'week' ? '18px' : '12px',
                                border: status ? `2px solid ${PLACE_STATUS_COLORS[status]}` : '2px solid transparent',
                                cursor: 'pointer',
                              }}
                            >
                              {status ? PLACE_STATUS_LABELS[status] : ''}
                            </div>

                            {/* Note button - always visible in week view */}
                            {viewMode === 'week' && (
                              <div
                                onClick={(e) => handleNoteClick(e, member.id, date)}
                                style={{
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  background: note ? '#FEF3C7' : '#f3f4f6',
                                  color: note ? '#92400E' : '#9ca3af',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minHeight: '16px',
                                  minWidth: `${cellSize}px`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={note || 'メモを追加'}
                              >
                                {note || '📝'}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    } else {
                      // Member view with status + note
                      const status = record?.memberStatus
                      const note = record?.note
                      const cellHeight = viewMode === 'week' ? 44 : 22
                      return (
                        <td
                          key={i}
                          style={{
                            padding: viewMode === 'week' ? '4px' : '3px',
                            textAlign: 'center',
                            borderBottom: '1px solid #f3f4f6',
                            background: isToday ? '#FAFBFF' : !isCurrentMonth ? '#fafafa' : 'white',
                            verticalAlign: 'middle',
                            position: 'relative',
                            opacity: isCurrentMonth ? 1 : 0.4,
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {/* Status cell */}
                            <div
                              onClick={() => handleCellClick(member.id, date)}
                              style={{
                                height: `${cellHeight}px`,
                                borderRadius: viewMode === 'week' ? '8px' : '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: viewMode === 'week' ? '4px' : '2px',
                                background: status ? `${MEMBER_STATUS_COLORS[status]}15` : EMPTY_COLOR,
                                border: status ? `2px solid ${MEMBER_STATUS_COLORS[status]}` : '2px solid transparent',
                                cursor: 'pointer',
                                gap: '1px',
                              }}
                            >
                              {status && (
                                viewMode === 'week' ? (
                                  <>
                                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{MEMBER_STATUS_ICONS[status]}</span>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      color: MEMBER_STATUS_COLORS[status],
                                      lineHeight: 1,
                                    }}>
                                      {MEMBER_STATUS_LABELS[status]}
                                    </span>
                                  </>
                                ) : (
                                  <span style={{ fontSize: '12px' }}>{MEMBER_STATUS_ICONS[status]}</span>
                                )
                              )}
                            </div>

                            {/* Note button - always visible in week view */}
                            {viewMode === 'week' && (
                              <div
                                onClick={(e) => handleNoteClick(e, member.id, date)}
                                style={{
                                  padding: '2px 4px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  background: note ? '#FEF3C7' : '#f3f4f6',
                                  color: note ? '#92400E' : '#9ca3af',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minHeight: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={note || 'メモを追加'}
                              >
                                {note || '📝'}
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        fontSize: '11px',
        color: '#6b7280',
        flexWrap: 'wrap',
      }}>
        {type === 'place' ? (
          <>
            <span>クリックで切替:</span>
            <span style={{ color: PLACE_STATUS_COLORS.available }}>○ 利用可</span>
            <span style={{ color: PLACE_STATUS_COLORS.unavailable }}>× 利用不可</span>
            <span style={{ color: PLACE_STATUS_COLORS.maybe }}>△ 未定</span>
          </>
        ) : (
          <>
            <span>クリックで切替:</span>
            {(Object.keys(MEMBER_STATUS_LABELS) as MemberStatus[]).map(s => (
              <span key={s} style={{ color: MEMBER_STATUS_COLORS[s] }}>
                {MEMBER_STATUS_ICONS[s]} {MEMBER_STATUS_LABELS[s]}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Note Editor Modal */}
      {editingNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setEditingNote(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              maxWidth: '320px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '15px' }}>メモを編集</h3>
            <input
              type="text"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="例: 午後から出社、大阪出張"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleNoteSave()
                if (e.key === 'Escape') setEditingNote(null)
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => setEditingNote(null)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleNoteSave}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#3B82F6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Input Modal */}
      {bulkInputMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setBulkInputMember(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              maxWidth: '320px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>
              {viewMode === 'week' ? '週' : '月'}一括入力
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6b7280' }}>
              {bulkInputMember.name}の{viewMode === 'week' ? '今週' : '今月'}全ての日に適用
            </p>

            {type === 'place' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(['available', 'unavailable', 'maybe'] as PlaceStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleBulkInput(status)}
                    style={{
                      padding: '12px',
                      border: `2px solid ${PLACE_STATUS_COLORS[status]}`,
                      borderRadius: '8px',
                      background: `${PLACE_STATUS_COLORS[status]}15`,
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: PLACE_STATUS_COLORS[status],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{PLACE_STATUS_LABELS[status]}</span>
                    <span>
                      {status === 'available' ? '利用可' : status === 'unavailable' ? '利用不可' : '未定'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['office', 'remote', 'trip', 'off'] as MemberStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => handleBulkInput(status)}
                    style={{
                      padding: '12px 8px',
                      border: `2px solid ${MEMBER_STATUS_COLORS[status]}`,
                      borderRadius: '8px',
                      background: `${MEMBER_STATUS_COLORS[status]}15`,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: MEMBER_STATUS_COLORS[status],
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{MEMBER_STATUS_ICONS[status]}</span>
                    <span>{MEMBER_STATUS_LABELS[status]}</span>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => handleBulkInput('clear')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #EF4444',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#EF4444',
                  fontSize: '13px',
                }}
              >
                クリア
              </button>
              <button
                onClick={() => setBulkInputMember(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
