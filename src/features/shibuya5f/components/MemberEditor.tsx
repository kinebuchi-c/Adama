import { useState, useEffect } from 'react'
import { useScheduleStore } from '../stores/scheduleStore'
import type { Member } from '../types'

const ICONS = ['👤', '👩', '👨', '🧑', '👩‍💼', '👨‍💼', '🏢', '🏠', '📍', '🏪', '☕', '🎯', '💼', '🖥️']
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16']

interface MemberEditorProps {
  member?: Member | null
  type: 'person' | 'place'
  onClose: () => void
}

export function MemberEditor({ member, type, onClose }: MemberEditorProps) {
  const { addMember, updateMember, deleteMember } = useScheduleStore()
  const isEditing = !!member

  const [name, setName] = useState(member?.name || '')
  const [icon, setIcon] = useState(member?.icon || (type === 'place' ? '🏢' : '👤'))
  const [color, setColor] = useState(member?.color || COLORS[0])
  const [mapUrl, setMapUrl] = useState(member?.mapUrl || '')
  const [hours, setHours] = useState(member?.hours || '')

  useEffect(() => {
    if (member) {
      setName(member.name)
      setIcon(member.icon)
      setColor(member.color)
      setMapUrl(member.mapUrl || '')
      setHours(member.hours || '')
    }
  }, [member])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing && member) {
      updateMember(member.id, {
        name: name.trim(),
        icon,
        color,
        mapUrl: type === 'place' ? mapUrl.trim() || undefined : undefined,
        hours: type === 'place' ? hours.trim() || undefined : undefined,
      })
    } else {
      addMember({
        name: name.trim(),
        type,
        icon,
        color,
        mapUrl: type === 'place' ? mapUrl.trim() || undefined : undefined,
        hours: type === 'place' ? hours.trim() || undefined : undefined,
        isActive: true,
        order: 0,
      })
    }

    onClose()
  }

  const handleDelete = () => {
    if (member && confirm(`「${member.name}」を削除しますか？`)) {
      deleteMember(member.id)
      onClose()
    }
  }

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #f3f4f6',
          background: '#fafafa',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>
            {isEditing ? (type === 'place' ? '場所を編集' : 'メンバーを編集') : (type === 'place' ? '場所を追加' : 'メンバーを追加')}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}>
              名前 *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'place' ? '例: 渋谷オフィス' : '例: 山田太郎'}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}>
              アイコン
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: icon === i ? `2px solid ${color}` : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: icon === i ? `${color}10` : 'white',
                    cursor: 'pointer',
                    fontSize: '20px',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}>
              カラー
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #1f2937' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {type === 'place' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}>
                  利用時間
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                  placeholder="例: 7:00~16:00"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}>
                  地図URL（Google Maps等）
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={e => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '12px',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#EF4444',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                削除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#6b7280',
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: color,
                color: 'white',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {isEditing ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
