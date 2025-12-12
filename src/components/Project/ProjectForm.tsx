import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project, ProjectStatus } from '../../types'
import { STATUS_LABELS } from '../../types'

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; status: ProjectStatus; notes: string }) => void
  initialData?: Project | null
  countryName: string
}

export function ProjectForm({ isOpen, onClose, onSubmit, initialData, countryName }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('not_started')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setStatus(initialData.status)
      setNotes(initialData.notes || '')
    } else {
      setName('')
      setStatus('not_started')
      setNotes('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({ name: name.trim(), status, notes: notes.trim() })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
          />

          {/* モーダル */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '448px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {initialData ? 'プロジェクトを編集' : '新しいプロジェクト'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{countryName}</p>

              <form onSubmit={handleSubmit}>
                {/* プロジェクト名 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    プロジェクト名 *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 新規マーケット調査"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                {/* ステータス */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    ステータス
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                    }}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* メモ */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    メモ（任意）
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="プロジェクトに関するメモ..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* ボタン */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {initialData ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
