import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { ProjectList } from '../components/Project'
import { useProjectStore } from '../stores/projectStore'
import { useBaobabStore } from '../stores/baobabStore'
import type { Project, ProjectStatus } from '../types'
import { COUNTRY_NAMES } from '../types'

export function CountryDetail() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const location = useLocation()
  const { projects, loadProjects, addProject, updateProject, deleteProject, updateStatus } = useProjectStore()
  const { refreshGrowth } = useBaobabStore()

  const [countryProjects, setCountryProjects] = useState<Project[]>([])

  // 国名の取得
  const countryName = (location.state as { countryName?: string })?.countryName
    || (countryCode && COUNTRY_NAMES[countryCode])
    || countryCode
    || '不明な国'

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (countryCode) {
      const filtered = projects.filter(p => p.countryCode === countryCode)
      setCountryProjects(filtered)
    }
  }, [countryCode, projects])

  const handleAddProject = useCallback(async (data: { name: string; status: ProjectStatus; notes: string }) => {
    if (!countryCode) return

    await addProject({
      countryCode,
      name: data.name,
      status: data.status,
      notes: data.notes || undefined,
    })
    await refreshGrowth()
  }, [countryCode, addProject, refreshGrowth])

  const handleUpdateProject = useCallback(async (id: string, data: { name: string; status: ProjectStatus; notes: string }) => {
    await updateProject(id, {
      name: data.name,
      status: data.status,
      notes: data.notes || undefined,
    })
    await refreshGrowth()
  }, [updateProject, refreshGrowth])

  const handleDeleteProject = useCallback(async (id: string) => {
    await deleteProject(id)
  }, [deleteProject])

  const handleStatusChange = useCallback(async (id: string, status: ProjectStatus) => {
    await updateStatus(id, status)
    await refreshGrowth()
  }, [updateStatus, refreshGrowth])

  if (!countryCode) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#6b7280' }}>国が指定されていません</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <ProjectList
          projects={countryProjects}
          countryCode={countryCode}
          countryName={countryName}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}
