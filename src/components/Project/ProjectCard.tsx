import { motion } from 'framer-motion'
import type { Project, ProjectStatus } from '../../types'
import { STATUS_COLORS, STATUS_LABELS } from '../../types'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ProjectStatus) => void
}

const statusOrder: ProjectStatus[] = [
  'not_started',
  'planning',
  'in_progress',
  'review',
  'completed',
]

export function ProjectCard({ project, onEdit, onDelete, onStatusChange }: ProjectCardProps) {
  const statusIndex = statusOrder.indexOf(project.status)

  return (
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
        <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '8px' }}>
          {project.name}
        </h3>

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
          }}>
            {project.notes}
          </p>
        )}

        {/* ステータス選択 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>ステータス</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {statusOrder.map((status, index) => (
              <button
                key={status}
                onClick={() => onStatusChange(project.id, status)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: index <= statusIndex ? STATUS_COLORS[status] : '#f3f4f6',
                  color: index <= statusIndex ? 'white' : '#9ca3af',
                  fontWeight: index <= statusIndex ? '500' : '400',
                }}
                title={STATUS_LABELS[status]}
              >
                {index === statusIndex && STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: '8px' }}>
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
  )
}
