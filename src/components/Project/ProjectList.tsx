import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Project, ProjectStatus } from '../../types'
import { ProjectCard } from './ProjectCard'
import { ProjectForm } from './ProjectForm'
import { STATUS_LABELS } from '../../types'

interface ProjectListProps {
  projects: Project[]
  countryCode: string
  countryName: string
  onAddProject: (data: { name: string; status: ProjectStatus; notes: string }) => void
  onUpdateProject: (id: string, data: { name: string; status: ProjectStatus; notes: string }) => void
  onDeleteProject: (id: string) => void
  onStatusChange: (id: string, status: ProjectStatus) => void
}

export function ProjectList({
  projects,
  countryCode: _countryCode,
  countryName,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onStatusChange,
}: ProjectListProps) {
  void _countryCode // 将来の拡張用
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredProjects = projects.filter(
    (p) => filter === 'all' || p.status === filter
  )

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteProject(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleFormSubmit = (data: { name: string; status: ProjectStatus; notes: string }) => {
    if (editingProject) {
      onUpdateProject(editingProject.id, data)
    } else {
      onAddProject(data)
    }
    setEditingProject(null)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProject(null)
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{countryName}</h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{projects.length} プロジェクト</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '12px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(59,130,246,0.25)',
          }}
        >
          + 追加
        </button>
      </div>

      {/* フィルター */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: filter === 'all' ? '#1f2937' : '#f3f4f6',
            color: filter === 'all' ? 'white' : '#4b5563',
          }}
        >
          すべて ({projects.length})
        </button>
        {(Object.entries(STATUS_LABELS) as [ProjectStatus, string][]).map(([status, label]) => {
          const count = projects.filter((p) => p.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === status ? '#1f2937' : '#f3f4f6',
                color: filter === status ? 'white' : '#4b5563',
              }}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* プロジェクト一覧 */}
      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: '#6b7280' }}>
            {filter === 'all'
              ? 'プロジェクトがありません'
              : `${STATUS_LABELS[filter]}のプロジェクトがありません`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                marginTop: '16px',
                color: '#3b82f6',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              最初のプロジェクトを追加
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 追加/編集フォーム */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editingProject}
        countryName={countryName}
      />

      {/* 削除確認ダイアログ */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 40,
              }}
              onClick={() => setDeleteConfirm(null)}
            />
            <div style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '384px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              zIndex: 50,
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                プロジェクトを削除しますか？
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                この操作は取り消せません。
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
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
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
