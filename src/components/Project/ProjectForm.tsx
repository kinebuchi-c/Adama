import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project, ProjectStatus, DiplomacyPhase } from '../../types'
import { STATUS_LABELS, DIPLOMACY_PHASE_LABELS } from '../../types'

interface ProjectFormData {
  name: string
  status: ProjectStatus
  diplomacyPhase: DiplomacyPhase
  assignee: string
  notes: string
  referrer: string
  managementUrl: string
}

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => void
  initialData?: Project | null
  countryName: string
}

export function ProjectForm({ isOpen, onClose, onSubmit, initialData, countryName }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('not_started')
  const [diplomacyPhase, setDiplomacyPhase] = useState<DiplomacyPhase>(0)
  const [assignee, setAssignee] = useState('')
  const [notes, setNotes] = useState('')
  const [referrer, setReferrer] = useState('')
  const [managementUrl, setManagementUrl] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setStatus(initialData.status)
      setDiplomacyPhase(initialData.diplomacyPhase ?? 0)
      setAssignee(initialData.assignee || '')
      setNotes(initialData.notes || '')
      setReferrer(initialData.referrer || '')
      setManagementUrl(initialData.managementUrl || '')
    } else {
      setName('')
      setStatus('not_started')
      setDiplomacyPhase(0)
      setAssignee('')
      setNotes('')
      setReferrer('')
      setManagementUrl('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      status,
      diplomacyPhase,
      assignee: assignee.trim(),
      notes: notes.trim(),
      referrer: referrer.trim(),
      managementUrl: managementUrl.trim(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ + モーダルコンテナ */}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
          {/* モーダル */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: 'calc(100vh - 40px)',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'auto',
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

                {/* 2カラム: 外交フェーズ & 進行状況 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {/* 外交フェーズ */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      外交フェーズ
                    </label>
                    <select
                      value={diplomacyPhase}
                      onChange={(e) => setDiplomacyPhase(Number(e.target.value) as DiplomacyPhase)}
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
                      {([0, 1, 2, 3, 4] as DiplomacyPhase[]).map((phase) => (
                        <option key={phase} value={phase}>
                          {phase}: {DIPLOMACY_PHASE_LABELS[phase]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 進行状況 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      進行状況
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
                </div>

                {/* 担当者 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    担当者
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="例: 山田太郎"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 紹介者 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    紹介者（任意）
                  </label>
                  <input
                    type="text"
                    value={referrer}
                    onChange={(e) => setReferrer(e.target.value)}
                    placeholder="例: 田中さん"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* 管理ページURL */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    管理ページURL（任意）
                  </label>
                  <input
                    type="url"
                    value={managementUrl}
                    onChange={(e) => setManagementUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
