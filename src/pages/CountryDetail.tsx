import { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ProjectList } from '../components/Project'
import { useProjectStore } from '../stores/projectStore'
import { useNeemStore } from '../stores/neemStore'
import { useTerritoryStore } from '../stores/territoryStore'
import type { Project, ProjectStatus, DiplomacyPhase, ProjectEvent, CountryContact, ContactPerson } from '../types'
import { COUNTRY_NAMES, COUNTRY_INFO } from '../types'
import { getCountryAsTerritory } from '../types/territory'
import { db } from '../db/database'
import { addProjectLink, deleteAllProjectLinks, getOrganization, updateOrganization, getAllProjectEvents } from '../db/cloudDatabase'

interface ProjectFormData {
  name: string
  status: ProjectStatus
  diplomacyPhase: DiplomacyPhase
  assignee: string
  assigneeStaffId?: string
  notes: string
  referrer: string
  referrerContactId?: string
  introducerOrgId?: string
  introducerOrgName?: string
  partnerOrgIds?: string[]
  managementUrl: string
}

export function CountryDetail() {
  const { countryCode } = useParams<{ countryCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loadProjects, addProject, updateProject, deleteProject, updateStatus } = useProjectStore()
  const { refreshGrowth } = useNeemStore()
  const { addCity, cities } = useTerritoryStore()

  const [countryProjects, setCountryProjects] = useState<Project[]>([])
  const [countryActivities, setCountryActivities] = useState<(ProjectEvent & { projectName: string })[]>([])
  const [contacts, setContacts] = useState<CountryContact | null>(null)
  const [isEditingContacts, setIsEditingContacts] = useState(false)
  const [showHistory, setShowHistory] = useState<string | null>(null) // 履歴表示中のキー
  const [editContacts, setEditContacts] = useState({
    president: { name: '', notes: '' } as ContactPerson,
    japanAmbassador: { name: '', notes: '' } as ContactPerson,
    additionalContacts: [] as Array<{ role: string; name: string; notes?: string }>,
  })
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)

  // 国名の取得
  const locationState = location.state as { countryName?: string; projectId?: string; eventId?: string } | null
  const countryName = locationState?.countryName
    || (countryCode && COUNTRY_NAMES[countryCode])
    || countryCode
    || '不明な国'
  const selectedProjectId = locationState?.projectId

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

      const allEvents = await getAllProjectEvents()
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

  // 連絡先を読み込み
  useEffect(() => {
    const loadContacts = async () => {
      if (!countryCode) return
      const existing = await db.countryContacts.where('countryCode').equals(countryCode).first()
      if (existing) {
        setContacts(existing)
        setEditContacts({
          president: existing.president || { name: '', notes: '' },
          japanAmbassador: existing.japanAmbassador || { name: '', notes: '' },
          additionalContacts: existing.additionalContacts || [],
        })
      }
    }
    loadContacts()
  }, [countryCode])

  // 連絡先を保存
  const handleSaveContacts = useCallback(async () => {
    if (!countryCode) return
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]

    // 大統領の履歴処理
    let presidentHistory = contacts?.presidentHistory || []
    if (contacts?.president?.name && contacts.president.name !== editContacts.president.name) {
      presidentHistory = [...presidentHistory, { ...contacts.president, endDate: dateStr }]
    }

    // 在日大使の履歴処理
    let japanAmbassadorHistory = contacts?.japanAmbassadorHistory || []
    if (contacts?.japanAmbassador?.name && contacts.japanAmbassador.name !== editContacts.japanAmbassador.name) {
      japanAmbassadorHistory = [...japanAmbassadorHistory, { ...contacts.japanAmbassador, endDate: dateStr }]
    }

    const contactData: CountryContact = {
      id: contacts?.id || `contact-${countryCode}`,
      countryCode,
      president: editContacts.president.name ? { ...editContacts.president, startDate: editContacts.president.startDate || dateStr } : undefined,
      presidentHistory: presidentHistory.length > 0 ? presidentHistory : undefined,
      japanAmbassador: editContacts.japanAmbassador.name ? { ...editContacts.japanAmbassador, startDate: editContacts.japanAmbassador.startDate || dateStr } : undefined,
      japanAmbassadorHistory: japanAmbassadorHistory.length > 0 ? japanAmbassadorHistory : undefined,
      additionalContacts: editContacts.additionalContacts.filter(c => c.role && c.name),
      updatedAt: now,
    }
    await db.countryContacts.put(contactData)
    setContacts(contactData)
    setIsEditingContacts(false)
  }, [countryCode, contacts, editContacts])

  // 追加連絡先を追加
  const handleAddContact = () => {
    setEditContacts(prev => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, { role: '', name: '' }],
    }))
  }

  // 追加連絡先を削除
  const handleRemoveContact = (index: number) => {
    setEditContacts(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index),
    }))
  }

  const handleAddProject = useCallback(async (data: ProjectFormData) => {
    if (!countryCode) return

    const projectId = await addProject({
      countryCode,
      name: data.name,
      status: data.status,
      diplomacyPhase: data.diplomacyPhase,
      assignee: data.assignee || undefined,
      notes: data.notes || undefined,
      referrer: data.referrer || undefined,
      managementUrl: data.managementUrl || undefined,
    })

    // プロジェクトリンクを作成
    if (projectId) {
      // 担当者リンク
      if (data.assigneeStaffId) {
        await addProjectLink({
          projectId,
          relationType: 'assignee',
          staffId: data.assigneeStaffId,
        })
      }
      // 紹介機関リンク
      if (data.introducerOrgId) {
        await addProjectLink({
          projectId,
          relationType: 'introducer_org',
          organizationId: data.introducerOrgId,
        })
        // 紹介機関の関連国に自動追加
        const org = await getOrganization(data.introducerOrgId)
        if (org) {
          const existingCountries = org.countryCodes || []
          if (!existingCountries.includes(countryCode)) {
            await updateOrganization(data.introducerOrgId, {
              countryCodes: [...existingCountries, countryCode],
            })
          }
        }
      }
      // 紹介者リンク
      if (data.referrerContactId) {
        await addProjectLink({
          projectId,
          relationType: 'introducer',
          contactId: data.referrerContactId,
        })
      }
      // 参画機関リンク
      if (data.partnerOrgIds && data.partnerOrgIds.length > 0) {
        for (const orgId of data.partnerOrgIds) {
          await addProjectLink({
            projectId,
            relationType: 'partner_org',
            organizationId: orgId,
          })
        }
      }
    }

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

  const handleUpdateProject = useCallback(async (id: string, data: ProjectFormData) => {
    await updateProject(id, {
      name: data.name,
      status: data.status,
      diplomacyPhase: data.diplomacyPhase,
      assignee: data.assignee || undefined,
      notes: data.notes || undefined,
      referrer: data.referrer || undefined,
      managementUrl: data.managementUrl || undefined,
    })

    // プロジェクトリンクを更新（既存を削除して新規作成）
    await deleteAllProjectLinks(id)

    // 担当者リンク
    if (data.assigneeStaffId) {
      await addProjectLink({
        projectId: id,
        relationType: 'assignee',
        staffId: data.assigneeStaffId,
      })
    }
    // 紹介機関リンク
    if (data.introducerOrgId) {
      await addProjectLink({
        projectId: id,
        relationType: 'introducer_org',
        organizationId: data.introducerOrgId,
      })
      // 紹介機関の関連国に自動追加
      if (countryCode) {
        const org = await getOrganization(data.introducerOrgId)
        if (org) {
          const existingCountries = org.countryCodes || []
          if (!existingCountries.includes(countryCode)) {
            await updateOrganization(data.introducerOrgId, {
              countryCodes: [...existingCountries, countryCode],
            })
          }
        }
      }
    }
    // 紹介者リンク
    if (data.referrerContactId) {
      await addProjectLink({
        projectId: id,
        relationType: 'introducer',
        contactId: data.referrerContactId,
      })
    }
    // 参画機関リンク
    if (data.partnerOrgIds && data.partnerOrgIds.length > 0) {
      for (const orgId of data.partnerOrgIds) {
        await addProjectLink({
          projectId: id,
          relationType: 'partner_org',
          organizationId: orgId,
        })
      }
    }

    await refreshGrowth()
  }, [updateProject, refreshGrowth, countryCode])

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
            {(countryInfo.religions || countryInfo.ethnicities || countryInfo.industries || countryInfo.ageStructure || countryInfo.populationGrowth) && (
              <>
                <button
                  onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: showDetailedInfo ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: showDetailedInfo ? 'white' : '#4b5563',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    transform: showDetailedInfo ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>▶</span>
                  詳細情報（宗教・民族・産業・人口構成）
                </button>
                {showDetailedInfo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}>
                    {(countryInfo.religions || countryInfo.ethnicities || countryInfo.industries) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '12px',
                        marginBottom: (countryInfo.ageStructure || countryInfo.populationGrowth) ? '12px' : '0',
                      }}>
                        {countryInfo.religions && (
                          <InfoListItem icon="🛐" label="宗教" items={countryInfo.religions} />
                        )}
                        {countryInfo.ethnicities && (
                          <InfoListItem icon="👨‍👩‍👧‍👦" label="民族" items={countryInfo.ethnicities} />
                        )}
                        {countryInfo.industries && (
                          <InfoListItem icon="🏭" label="主要産業" items={countryInfo.industries} />
                        )}
                      </div>
                    )}
                    {(countryInfo.ageStructure || countryInfo.populationGrowth) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px',
                      }}>
                        {countryInfo.ageStructure && (
                          <InfoItem icon="📊" label="年齢構成" value={countryInfo.ageStructure} />
                        )}
                        {countryInfo.populationGrowth && (
                          <InfoItem icon="📈" label="人口増加率" value={countryInfo.populationGrowth} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 連絡先情報 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>📇</span>
              <span>連絡先</span>
            </h2>
            {!isEditingContacts ? (
              <button
                onClick={() => setIsEditingContacts(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                編集
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setIsEditingContacts(false)
                    setEditContacts({
                      president: contacts?.president || { name: '', notes: '' },
                      japanAmbassador: contacts?.japanAmbassador || { name: '', notes: '' },
                      additionalContacts: contacts?.additionalContacts || [],
                    })
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveContacts}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  保存
                </button>
              </div>
            )}
          </div>

          {isEditingContacts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 大統領/首相 */}
              <div style={{ padding: '12px', background: '#fefce8', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#854d0e', fontWeight: 600 }}>
                    👑 大統領/首相
                  </label>
                  {editContacts.president.name && (
                    <button
                      onClick={() => {
                        const dateStr = new Date().toISOString().split('T')[0]
                        setEditContacts(prev => ({
                          ...prev,
                          president: { name: '', notes: '', startDate: dateStr },
                        }))
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fcd34d',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 情報更新
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={editContacts.president.name}
                  onChange={(e) => setEditContacts(prev => ({ ...prev, president: { ...prev.president, name: e.target.value } }))}
                  placeholder="名前を入力"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    border: '1px solid #fde047',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                  }}
                />
                <textarea
                  value={editContacts.president.notes || ''}
                  onChange={(e) => setEditContacts(prev => ({ ...prev, president: { ...prev.president, notes: e.target.value } }))}
                  placeholder="備考（経歴、連絡先など）"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #fde047',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
              {/* 在日大使 */}
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600 }}>
                    🏛️ 在日大使
                  </label>
                  {editContacts.japanAmbassador.name && (
                    <button
                      onClick={() => {
                        const dateStr = new Date().toISOString().split('T')[0]
                        setEditContacts(prev => ({
                          ...prev,
                          japanAmbassador: { name: '', notes: '', startDate: dateStr },
                        }))
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        border: '1px solid #93c5fd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 情報更新
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={editContacts.japanAmbassador.name}
                  onChange={(e) => setEditContacts(prev => ({ ...prev, japanAmbassador: { ...prev.japanAmbassador, name: e.target.value } }))}
                  placeholder="名前を入力"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                  }}
                />
                <textarea
                  value={editContacts.japanAmbassador.notes || ''}
                  onChange={(e) => setEditContacts(prev => ({ ...prev, japanAmbassador: { ...prev.japanAmbassador, notes: e.target.value } }))}
                  placeholder="備考（経歴、連絡先など）"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>
              {/* その他連絡先 */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                  📋 その他連絡先
                </label>
                {editContacts.additionalContacts.map((contact, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    marginBottom: '10px',
                  }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => {
                          const updated = [...editContacts.additionalContacts]
                          updated[index] = { ...updated[index], role: e.target.value }
                          setEditContacts(prev => ({ ...prev, additionalContacts: updated }))
                        }}
                        placeholder="役職"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...editContacts.additionalContacts]
                          updated[index] = { ...updated[index], name: e.target.value }
                          setEditContacts(prev => ({ ...prev, additionalContacts: updated }))
                        }}
                        placeholder="名前"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <button
                        onClick={() => handleRemoveContact(index)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={contact.notes || ''}
                      onChange={(e) => {
                        const updated = [...editContacts.additionalContacts]
                        updated[index] = { ...updated[index], notes: e.target.value }
                        setEditContacts(prev => ({ ...prev, additionalContacts: updated }))
                      }}
                      placeholder="備考（経歴、連絡先など）"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddContact}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + 連絡先を追加
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 大統領/首相 */}
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>👑</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#92400e' }}>大統領/首相</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#78350f' }}>
                      {contacts?.president?.name || '未登録'}
                    </div>
                  </div>
                  {contacts?.presidentHistory && contacts.presidentHistory.length > 0 && (
                    <button
                      onClick={() => setShowHistory(showHistory === 'president' ? null : 'president')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        backgroundColor: showHistory === 'president' ? '#92400e' : 'rgba(146, 64, 14, 0.2)',
                        color: showHistory === 'president' ? 'white' : '#92400e',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      履歴 ({contacts.presidentHistory.length})
                    </button>
                  )}
                </div>
                {contacts?.president?.notes && (
                  <div style={{
                    marginTop: '8px',
                    marginLeft: '32px',
                    fontSize: '0.8rem',
                    color: '#a16207',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {contacts.president.notes}
                  </div>
                )}
                {showHistory === 'president' && contacts?.presidentHistory && (
                  <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#92400e', marginBottom: '6px', fontWeight: 600 }}>過去の大統領/首相</div>
                    {contacts.presidentHistory.map((person, idx) => (
                      <div key={idx} style={{
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: '6px',
                        marginBottom: '6px',
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#78350f' }}>{person.name}</div>
                        {person.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                            {person.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* 在日大使 */}
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>🏛️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#1e40af' }}>在日大使</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e3a8a' }}>
                      {contacts?.japanAmbassador?.name || '未登録'}
                    </div>
                  </div>
                  {contacts?.japanAmbassadorHistory && contacts.japanAmbassadorHistory.length > 0 && (
                    <button
                      onClick={() => setShowHistory(showHistory === 'japanAmbassador' ? null : 'japanAmbassador')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        backgroundColor: showHistory === 'japanAmbassador' ? '#1e40af' : 'rgba(30, 64, 175, 0.2)',
                        color: showHistory === 'japanAmbassador' ? 'white' : '#1e40af',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      履歴 ({contacts.japanAmbassadorHistory.length})
                    </button>
                  )}
                </div>
                {contacts?.japanAmbassador?.notes && (
                  <div style={{
                    marginTop: '8px',
                    marginLeft: '32px',
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.5)',
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {contacts.japanAmbassador.notes}
                  </div>
                )}
                {showHistory === 'japanAmbassador' && contacts?.japanAmbassadorHistory && (
                  <div style={{ marginTop: '12px', marginLeft: '32px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#1e40af', marginBottom: '6px', fontWeight: 600 }}>過去の在日大使</div>
                    {contacts.japanAmbassadorHistory.map((person, idx) => (
                      <div key={idx} style={{
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.5)',
                        borderRadius: '6px',
                        marginBottom: '6px',
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e3a8a' }}>{person.name}</div>
                        {person.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                            {person.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* その他連絡先 */}
              {contacts?.additionalContacts && contacts.additionalContacts.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>その他連絡先</div>
                  {contacts.additionalContacts.map((contact, index) => (
                    <div key={index} style={{
                      padding: '10px 12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '6px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>👤</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{contact.role}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1f2937' }}>{contact.name}</div>
                        </div>
                      </div>
                      {contact.notes && (
                        <div style={{
                          marginTop: '6px',
                          marginLeft: '32px',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          padding: '6px 8px',
                          background: 'rgba(0,0,0,0.03)',
                          borderRadius: '6px',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {contact.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
            selectedProjectId={selectedProjectId}
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

function InfoListItem({ icon, label, items }: { icon: string; label: string; items: string[] }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '10px',
      padding: '12px',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '6px' }}>
        {icon} {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, index) => (
          <div key={index} style={{
            fontSize: '0.8rem',
            fontWeight: index === 0 ? 600 : 500,
            color: index === 0 ? '#1f2937' : '#4b5563',
          }}>
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </div>
  )
}
