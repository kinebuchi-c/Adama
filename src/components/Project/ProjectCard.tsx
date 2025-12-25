import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Project, ProjectStatus, DiplomacyPhase } from '../../types'
import { STATUS_COLORS, STATUS_LABELS, DIPLOMACY_PHASE_LABELS, DIPLOMACY_PHASE_COLORS } from '../../types'
import { ProjectHistory } from './ProjectHistory'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ProjectStatus) => void
  onDiplomacyPhaseChange: (id: string, phase: DiplomacyPhase) => void
}

const statusOrder: ProjectStatus[] = [
  'not_started',
  'preparing',
  'in_progress',
  'completed',
]

export function ProjectCard({ project, onEdit, onDelete, onStatusChange, onDiplomacyPhaseChange }: ProjectCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const diplomacyPhase = project.diplomacyPhase ?? 0

  // 活動履歴からの自動更新ハンドラ
  const handleProjectUpdate = (updates: { diplomacyPhase?: DiplomacyPhase; status?: ProjectStatus }) => {
    if (updates.diplomacyPhase !== undefined) {
      onDiplomacyPhaseChange(project.id, updates.diplomacyPhase)
    }
    if (updates.status !== undefined) {
      onStatusChange(project.id, updates.status)
    }
  }

  return (
    <>
    <ProjectHistory
      projectId={project.id}
      projectName={project.name}
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      currentDiplomacyPhase={diplomacyPhase}
      currentStatus={project.status}
      onUpdateProject={handleProjectUpdate}
    />
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* ステータスバー */}
      <div
        style={{ height: '8px', backgroundColor: STATUS_COLORS[project.status] }}
      />

      <div style={{ padding: '16px' }}>
        {/* プロジェクト名 */}
        <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '12px' }}>
          {project.name}
        </h3>

        {/* 外交フェーズ & 進行状況 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}>
          {/* 外交フェーズバッジ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '16px',
            backgroundColor: `${DIPLOMACY_PHASE_COLORS[diplomacyPhase]}15`,
            border: `1px solid ${DIPLOMACY_PHASE_COLORS[diplomacyPhase]}40`,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: DIPLOMACY_PHASE_COLORS[diplomacyPhase],
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: DIPLOMACY_PHASE_COLORS[diplomacyPhase],
            }}>
              外交:{diplomacyPhase} {DIPLOMACY_PHASE_LABELS[diplomacyPhase]}
            </span>
          </div>

          {/* 進行状況バッジ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '16px',
            backgroundColor: `${STATUS_COLORS[project.status]}15`,
            border: `1px solid ${STATUS_COLORS[project.status]}40`,
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: STATUS_COLORS[project.status],
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: STATUS_COLORS[project.status],
            }}>
              進行:{STATUS_LABELS[project.status]}
            </span>
          </div>
        </div>

        {/* 担当者 */}
        {project.assignee && (
          <div style={{
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>👤</span>
            <span>担当: {project.assignee}</span>
          </div>
        )}

        {/* 紹介者 */}
        {project.referrer && (
          <div style={{
            fontSize: '13px',
            color: '#6b7280',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span>🤝</span>
            <span>紹介: {project.referrer}</span>
          </div>
        )}

        {/* 管理ページリンク */}
        {project.managementUrl && (
          <a
            href={project.managementUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '13px',
              color: '#3b82f6',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span>🔗</span>
            <span style={{ textDecoration: 'underline' }}>管理ページ</span>
          </a>
        )}

        {/* ノート */}
        {project.notes && (
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '12px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '8px',
          }}>
            {project.notes}
          </p>
        )}

        {/* 外交フェーズ選択 */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>外交フェーズ</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {([0, 1, 2, 3, 4] as DiplomacyPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => onDiplomacyPhaseChange(project.id, phase)}
                style={{
                  flex: 1,
                  padding: '6px 2px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: phase <= diplomacyPhase ? DIPLOMACY_PHASE_COLORS[phase] : '#f3f4f6',
                  color: phase <= diplomacyPhase ? 'white' : '#9ca3af',
                  fontWeight: phase <= diplomacyPhase ? '500' : '400',
                }}
                title={DIPLOMACY_PHASE_LABELS[phase]}
              >
                {phase === diplomacyPhase ? phase : ''}
              </button>
            ))}
          </div>
        </div>

        {/* ステータス選択 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>進行状況</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {statusOrder.map((status, index) => {
              const currentIndex = statusOrder.indexOf(project.status)
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(project.id, status)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: index <= currentIndex ? STATUS_COLORS[status] : '#f3f4f6',
                    color: index <= currentIndex ? 'white' : '#9ca3af',
                    fontWeight: index <= currentIndex ? '500' : '400',
                  }}
                  title={STATUS_LABELS[status]}
                >
                  {index === currentIndex && STATUS_LABELS[status]}
                </button>
              )
            })}
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsHistoryOpen(true)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            title="活動履歴"
          >
            📅
          </button>
          <button
            onClick={() => onEdit(project)}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            編集
          </button>
          <button
            onClick={() => onDelete(project.id)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            削除
          </button>
        </div>

        {/* 日付情報 */}
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
          作成: {new Date(project.createdAt).toLocaleDateString('ja-JP')}
        </div>
      </div>
    </motion.div>
    </>
  )
}
