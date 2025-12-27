import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorldMap, MapLegend } from '../components/WorldMap'
import { NeemTree } from '../components/Neem'
import { CountrySearch } from '../components/CountrySearch'
import { ITNewsPanel } from '../components/ITNewsPanel'
import { DiplomacyTips } from '../components/DiplomacyTips'
import { RecentActivity } from '../components/RecentActivity'
import { PersonSchedule } from '../components/PersonSchedule'
import { LarkSettingsModal } from '../components/LarkSettings'
import { useProjectStore } from '../stores/projectStore'
import { useNeemStore } from '../stores/neemStore'
import { useTerritoryStore } from '../stores/territoryStore'
import { COUNTRY_NAMES } from '../types'

type FilterType = 'preparing' | 'in_progress' | 'completed' | 'countries' | null

export function Home() {
  const navigate = useNavigate()
  const { loadProjects, projects } = useProjectStore()
  const { loadGrowth } = useNeemStore()
  const { getTotalArea } = useTerritoryStore()
  const [showLarkSettings, setShowLarkSettings] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(null)

  useEffect(() => {
    loadProjects()
    loadGrowth()
  }, [loadProjects, loadGrowth])

  const handleCountryClick = useCallback((countryCode: string, countryName: string) => {
    navigate(`/country/${countryCode}`, { state: { countryName } })
  }, [navigate])

  const preparingProjectsList = projects.filter(p => p.status === 'preparing' || p.status === 'not_started')
  const inProgressProjectsList = projects.filter(p => p.status === 'in_progress')
  const completedProjectsList = projects.filter(p => p.status === 'completed')
  const countriesWithProjectsList = Array.from(new Set(projects.map(p => p.countryCode)))
  const totalArea = getTotalArea()

  const getFilteredData = () => {
    switch (selectedFilter) {
      case 'preparing':
        return { title: '準備中のプロジェクト', items: preparingProjectsList, type: 'projects' as const }
      case 'in_progress':
        return { title: '進行中のプロジェクト', items: inProgressProjectsList, type: 'projects' as const }
      case 'completed':
        return { title: '完了したプロジェクト', items: completedProjectsList, type: 'projects' as const }
      case 'countries':
        return { title: '活動国一覧', items: countriesWithProjectsList, type: 'countries' as const }
      default:
        return null
    }
  }
  const filteredData = getFilteredData()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ff 0%, #fdf4ff 50%, #faf5ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🌍</span>
            <h1 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              Customer Cloud International Project Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '280px' }}>
              <CountrySearch onSelect={(code, name) => {
                navigate(`/country/${code}`, { state: { countryName: name } })
              }} />
            </div>
            <button
              onClick={() => setShowLarkSettings(true)}
              style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Lark連携設定"
            >
              🔗
            </button>
          </div>
        </div>

        {/* 統計カード */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <StatCard
            value={preparingProjectsList.length}
            label="準備中"
            icon="📋"
            gradient="linear-gradient(135deg, #fce7f3, #fbcfe8)"
            color="#db2777"
            onClick={() => setSelectedFilter(selectedFilter === 'preparing' ? null : 'preparing')}
            isActive={selectedFilter === 'preparing'}
          />
          <StatCard
            value={inProgressProjectsList.length}
            label="進行中"
            icon="🚀"
            gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)"
            color="#2563eb"
            onClick={() => setSelectedFilter(selectedFilter === 'in_progress' ? null : 'in_progress')}
            isActive={selectedFilter === 'in_progress'}
          />
          <StatCard
            value={completedProjectsList.length}
            label="完了"
            icon="✨"
            gradient="linear-gradient(135deg, #d1fae5, #a7f3d0)"
            color="#059669"
            onClick={() => setSelectedFilter(selectedFilter === 'completed' ? null : 'completed')}
            isActive={selectedFilter === 'completed'}
          />
          <StatCard
            value={countriesWithProjectsList.length}
            label="活動国"
            icon="🌏"
            gradient="linear-gradient(135deg, #fef3c7, #fde68a)"
            color="#d97706"
            onClick={() => setSelectedFilter(selectedFilter === 'countries' ? null : 'countries')}
            isActive={selectedFilter === 'countries'}
          />
          <StatCard
            value={totalArea > 0 ? `${(totalArea / 150000000 * 100).toFixed(2)}%` : '0%'}
            label="世界進出"
            icon="🌍"
            gradient="linear-gradient(135deg, #e0e7ff, #c7d2fe)"
            color="#4f46e5"
            isText
          />
        </div>

        {/* フィルター結果パネル */}
        {filteredData && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#374151',
              }}>
                {filteredData.title} ({filteredData.items.length})
              </h3>
              <button
                onClick={() => setSelectedFilter(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#9ca3af',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>
            {filteredData.items.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px', fontSize: '0.9rem' }}>
                該当するデータがありません
              </div>
            ) : filteredData.type === 'countries' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(filteredData.items as string[]).map(code => (
                  <button
                    key={code}
                    onClick={() => navigate(`/country/${code}`, { state: { countryName: COUNTRY_NAMES[code] || code } })}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#92400e',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {COUNTRY_NAMES[code] || code}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(filteredData.items as typeof projects).map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/country/${project.countryCode}`, { state: { countryName: COUNTRY_NAMES[project.countryCode] || project.countryCode } })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: selectedFilter === 'preparing' ? '#fce7f3' :
                                  selectedFilter === 'in_progress' ? '#dbeafe' : '#d1fae5',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {COUNTRY_NAMES[project.countryCode] || project.countryCode}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      background: selectedFilter === 'preparing' ? '#db2777' :
                                  selectedFilter === 'in_progress' ? '#2563eb' : '#059669',
                      color: 'white',
                      fontWeight: 500,
                    }}>
                      {selectedFilter === 'preparing' ? '準備中' :
                       selectedFilter === 'in_progress' ? '進行中' : '完了'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* メインコンテンツ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* 左：地図 */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
            }}>
              <div style={{ aspectRatio: '16/10', borderRadius: '16px', overflow: 'hidden' }}>
                <WorldMap onCountryClick={handleCountryClick} />
              </div>
            </div>
            {/* 地図下のパネル */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
              {/* 左側: 凡例 + 外交マナー */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '280px' }}>
                <MapLegend />
                <DiplomacyTips />
              </div>
              {/* 右側: Tech News */}
              <div style={{ flex: 1 }}>
                <ITNewsPanel />
              </div>
            </div>
          </div>

          {/* 右：サイドパネル */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 直近の活動履歴 */}
            <RecentActivity />

            {/* 担当者別予定 */}
            <PersonSchedule />

            {/* 使い方 */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(251, 191, 36, 0.2)',
            }}>
              <h3 style={{
                fontWeight: 600,
                color: '#b45309',
                marginBottom: '10px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>💡</span>
                <span>使い方</span>
              </h3>
              <ul style={{
                fontSize: '0.8rem',
                color: '#92400e',
                margin: 0,
                paddingLeft: '0',
                listStyle: 'none',
              }}>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🔍</span>
                  <span>国名を検索または地図をクリック</span>
                </li>
                <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🌳</span>
                  <span>プロジェクト完了でニームが成長</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🎨</span>
                  <span>国の色は進捗状況を表示</span>
                </li>
              </ul>
            </div>

            {/* ニームの木 */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
            }}>
              <NeemTree />
            </div>
          </div>
        </div>
      </div>

      {/* Lark設定モーダル */}
      <LarkSettingsModal isOpen={showLarkSettings} onClose={() => setShowLarkSettings(false)} />
    </div>
  )
}

interface StatCardProps {
  value: number | string
  label: string
  icon: string
  gradient: string
  color: string
  isText?: boolean
  onClick?: () => void
  isActive?: boolean
}

function StatCard({ value, label, icon, gradient, color, isText, onClick, isActive }: StatCardProps) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: '16px',
        padding: '16px',
        boxShadow: isActive ? `0 4px 16px ${color}40` : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        border: isActive ? `2px solid ${color}` : '2px solid transparent',
      }}
      onClick={onClick}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{
          fontSize: isText ? '1rem' : '1.5rem',
          fontWeight: 700,
          color,
        }}>
          {value}
        </span>
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
