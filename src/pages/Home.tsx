import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorldMap, MapLegend } from '../components/WorldMap'
import { BaobabTree } from '../components/Baobab'
import { CountrySearch } from '../components/CountrySearch'
import { ITNewsPanel } from '../components/ITNewsPanel'
import { DiplomacyTips } from '../components/DiplomacyTips'
import { RecentActivity } from '../components/RecentActivity'
import { useProjectStore } from '../stores/projectStore'
import { useBaobabStore } from '../stores/baobabStore'
import { useTerritoryStore, formatArea } from '../stores/territoryStore'

// 人口をフォーマット（億・万単位）
function formatPopulation(pop: number): string {
  if (pop >= 100000000) {
    return `${(pop / 100000000).toFixed(1)}億人`
  } else if (pop >= 10000) {
    return `${Math.round(pop / 10000)}万人`
  }
  return `${pop.toLocaleString()}人`
}

export function Home() {
  const navigate = useNavigate()
  const { loadProjects, projects } = useProjectStore()
  const { loadGrowth } = useBaobabStore()
  const { cities, getTotalArea, getTotalPopulation } = useTerritoryStore()
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)

  useEffect(() => {
    loadProjects()
    loadGrowth()
  }, [loadProjects, loadGrowth])

  const handleCountryClick = useCallback((countryCode: string, countryName: string) => {
    setSelectedCountry({ code: countryCode, name: countryName })
  }, [])

  const handleViewProjects = useCallback(() => {
    if (selectedCountry) {
      navigate(`/country/${selectedCountry.code}`, { state: { countryName: selectedCountry.name } })
    }
  }, [selectedCountry, navigate])

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const countriesWithProjects = new Set(projects.map(p => p.countryCode)).size
  const totalArea = getTotalArea()
  const totalPopulation = getTotalPopulation()
  const selectedCountryProjects = selectedCountry
    ? projects.filter(p => p.countryCode === selectedCountry.code)
    : []

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
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              Baobab World Map
            </h1>
          </div>
          <div style={{ width: '280px' }}>
            <CountrySearch onSelect={(code, name) => {
              setSelectedCountry({ code, name })
            }} />
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
            value={totalProjects}
            label="プロジェクト"
            icon="📋"
            gradient="linear-gradient(135deg, #fce7f3, #fbcfe8)"
            color="#db2777"
          />
          <StatCard
            value={completedProjects}
            label="完了"
            icon="✨"
            gradient="linear-gradient(135deg, #d1fae5, #a7f3d0)"
            color="#059669"
          />
          <StatCard
            value={countriesWithProjects}
            label="活動国"
            icon="🌏"
            gradient="linear-gradient(135deg, #dbeafe, #bfdbfe)"
            color="#2563eb"
          />
          <StatCard
            value={cities.length > 0 ? `${formatArea(totalArea)} km²` : '0 km²'}
            label="領土面積"
            icon="📐"
            gradient="linear-gradient(135deg, #fef3c7, #fde68a)"
            color="#d97706"
            isText
          />
          <StatCard
            value={totalPopulation > 0 ? formatPopulation(totalPopulation) : '0'}
            label="領土人口"
            icon="👥"
            gradient="linear-gradient(135deg, #e0e7ff, #c7d2fe)"
            color="#4f46e5"
            isText
          />
        </div>

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
            {/* 選択した国 */}
            {selectedCountry && (
              <div style={{
                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                borderRadius: '20px',
                padding: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#065f46' }}>
                    🌍 {selectedCountry.name}
                  </span>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: '#6b7280',
                      padding: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#047857',
                  marginBottom: '12px',
                }}>
                  {selectedCountryProjects.length} プロジェクト
                </div>
                <button
                  onClick={handleViewProjects}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  プロジェクト管理 →
                </button>
              </div>
            )}

            {/* 直近の活動履歴 */}
            <RecentActivity />

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
                  <span>プロジェクト完了でバオバブが成長</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🎨</span>
                  <span>国の色は進捗状況を表示</span>
                </li>
              </ul>
            </div>

            {/* バオバブの木 */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
            }}>
              <BaobabTree />
            </div>
          </div>
        </div>
      </div>

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
}

function StatCard({ value, label, icon, gradient, color, isText }: StatCardProps) {
  return (
    <div style={{
      background: gradient,
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      cursor: 'default',
    }}
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
