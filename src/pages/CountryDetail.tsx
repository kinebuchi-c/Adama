import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ProjectList } from '../components/Project'
import { useProjectStore } from '../stores/projectStore'
import { useBaobabStore } from '../stores/baobabStore'
import { useTerritoryStore } from '../stores/territoryStore'
import type { Project, ProjectStatus, DiplomacyPhase, ProjectEvent } from '../types'
import { COUNTRY_NAMES, COUNTRY_INFO } from '../types'
import { getCountryAsTerritory } from '../types/territory'
import { db } from '../db/database'

export function CountryDetail() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loadProjects, addProject, updateProject, deleteProject, updateStatus } = useProjectStore()
  const { refreshGrowth } = useBaobabStore()
  const { addCity, cities } = useTerritoryStore()

  const [countryProjects, setCountryProjects] = useState<Project[]>([])
  const [countryActivities, setCountryActivities] = useState<(ProjectEvent & { projectName: string })[]>([])

  // 国名の取得
  const countryName = (location.state as { countryName?: string })?.countryName
    || (countryCode && COUNTRY_NAMES[countryCode])
    || countryCode
    || '不明な国'

  // 国の基礎情報を取得
  const countryInfo = countryCode ? COUNTRY_INFO[countryCode] : null

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (countryCode) {
      const filtered = projects.filter(p => p.countryCode === countryCode)
      setCountryProjects(filtered)
    }
  }, [countryCode, projects])

  // 国別の活動履歴を読み込み
  useEffect(() => {
    const loadCountryActivities = async () => {
      if (!countryCode) return

      const countryProjectIds = projects
        .filter(p => p.countryCode === countryCode)
        .map(p => p.id)

      if (countryProjectIds.length === 0) {
        setCountryActivities([])
        return
      }

      const allEvents = await db.projectEvents.toArray()
      const projectMap = new Map(projects.map(p => [p.id, p]))

      const activities = allEvents
        .filter(e => countryProjectIds.includes(e.projectId))
        .map(e => ({
          ...e,
          projectName: projectMap.get(e.projectId)?.name || '',
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setCountryActivities(activities)
    }

    loadCountryActivities()
  }, [countryCode, projects])

  const handleAddProject = useCallback(async (data: { name: string; status: ProjectStatus; diplomacyPhase: DiplomacyPhase; assignee: string; notes: string; referrer: string; managementUrl: string }) => {
    if (!countryCode) return

    await addProject({
      countryCode,
      name: data.name,
      status: data.status,
      diplomacyPhase: data.diplomacyPhase,
      assignee: data.assignee || undefined,
      notes: data.notes || undefined,
      referrer: data.referrer || undefined,
      managementUrl: data.managementUrl || undefined,
    })

    // この国を領土に追加（まだ追加されていない場合）
    const existingCountryCodes = cities.map(c => c.nameEn)
    if (!existingCountryCodes.includes(countryCode)) {
      const countryTerritory = getCountryAsTerritory(countryCode, countryName)
      if (countryTerritory) {
        await addCity(countryTerritory)
      }
    }

    await refreshGrowth()
  }, [countryCode, countryName, addProject, refreshGrowth, addCity, cities])

  const handleUpdateProject = useCallback(async (id: string, data: { name: string; status: ProjectStatus; diplomacyPhase: DiplomacyPhase; assignee: string; notes: string; referrer: string; managementUrl: string }) => {
    await updateProject(id, {
      name: data.name,
      status: data.status,
      diplomacyPhase: data.diplomacyPhase,
      assignee: data.assignee || undefined,
      notes: data.notes || undefined,
      referrer: data.referrer || undefined,
      managementUrl: data.managementUrl || undefined,
    })
    await refreshGrowth()
  }, [updateProject, refreshGrowth])

  const handleDiplomacyPhaseChange = useCallback(async (id: string, phase: DiplomacyPhase) => {
    await updateProject(id, { diplomacyPhase: phase })
    await refreshGrowth()
  }, [updateProject, refreshGrowth])

  const handleDeleteProject = useCallback(async (id: string) => {
    await deleteProject(id)
  }, [deleteProject])

  const handleStatusChange = useCallback(async (id: string, status: ProjectStatus) => {
    await updateStatus(id, status)
    await refreshGrowth()
  }, [updateStatus, refreshGrowth])

  const formatDateForCSV = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-')
  }

  const handleDownloadHistory = useCallback(() => {
    if (countryActivities.length === 0) return

    // 時系列順（古い順）にソート
    const sortedActivities = [...countryActivities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // CSV形式で作成
    const csvHeader = '種別,日付,プロジェクト,イベント,参加者,メモ,写真有無\n'
    const csvContent = sortedActivities.map(activity => {
      const eventTypeLabel = activity.eventType === 'scheduled' ? '予定' : '完了'
      const date = formatDateForCSV(activity.date)
      const project = activity.projectName.replace(/"/g, '""')
      const title = activity.title.replace(/"/g, '""')
      const participants = (activity.participants || '').replace(/"/g, '""')
      const description = (activity.description || '').replace(/"/g, '""').replace(/\n/g, ' ')
      const hasImage = activity.imageUrl ? 'あり' : ''
      return `${eventTypeLabel},${date},"${project}","${title}","${participants}","${description}",${hasImage}`
    }).join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csvHeader + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${countryName}_活動履歴_${formatDateForCSV(new Date())}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [countryActivities, countryName])

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
      background: 'linear-gradient(135deg, #fef7ff 0%, #fdf4ff 50%, #faf5ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            ← マップに戻る
          </button>
          {countryActivities.length > 0 && (
            <button
              onClick={handleDownloadHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white',
                fontWeight: 500,
              }}
              title="この国の活動履歴をダウンロード"
            >
              <span>📥</span> 履歴CSV
            </button>
          )}
        </div>

        {/* 国の基礎情報 */}
        {countryInfo && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>🌍</span>
              <span>{countryInfo.name}の基礎情報</span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              <InfoItem icon="🏛️" label="首都" value={countryInfo.capital} />
              <InfoItem icon="👥" label="人口" value={countryInfo.population} />
              <InfoItem icon="🗣️" label="言語" value={countryInfo.language} />
              <InfoItem icon="💰" label="通貨" value={countryInfo.currency} />
              <InfoItem icon="🕐" label="時差" value={countryInfo.timezone} />
            </div>
          </div>
        )}

        {/* プロジェクト一覧 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <ProjectList
            projects={countryProjects}
            countryCode={countryCode}
            countryName={countryName}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onStatusChange={handleStatusChange}
            onDiplomacyPhaseChange={handleDiplomacyPhaseChange}
          />
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '10px',
      padding: '12px',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '4px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937' }}>
        {value}
      </div>
    </div>
  )
}
