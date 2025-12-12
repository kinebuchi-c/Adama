import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorldMap, MapLegend } from '../components/WorldMap'
import { BaobabTree } from '../components/Baobab'
import { CountrySearch } from '../components/CountrySearch'
import { useProjectStore } from '../stores/projectStore'
import { useBaobabStore } from '../stores/baobabStore'

export function Home() {
  const navigate = useNavigate()
  const { loadProjects, projects } = useProjectStore()
  const { loadGrowth } = useBaobabStore()

  useEffect(() => {
    loadProjects()
    loadGrowth()
  }, [loadProjects, loadGrowth])

  const handleCountryClick = useCallback((countryCode: string, countryName: string) => {
    navigate(`/country/${countryCode}`, { state: { countryName } })
  }, [navigate])

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const countriesWithProjects = new Set(projects.map(p => p.countryCode)).size

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {/* 検索 + 統計 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div>
            <CountrySearch onSelect={handleCountryClick} />
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{totalProjects}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>総プロジェクト</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{completedProjects}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>完了</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{countriesWithProjects}</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>活動国</div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
          {/* 世界地図 */}
          <div>
            <div style={{ aspectRatio: '16/10' }}>
              <WorldMap onCountryClick={handleCountryClick} />
            </div>
            <div style={{ marginTop: '16px' }}>
              <MapLegend />
            </div>
          </div>

          {/* バオバブの木 */}
          <div>
            <BaobabTree />
            <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>使い方</h3>
              <ul style={{ fontSize: '14px', color: '#4b5563' }}>
                <li style={{ marginBottom: '8px' }}>🔍 国名を検索または地図をクリック</li>
                <li style={{ marginBottom: '8px' }}>🌳 プロジェクト完了でバオバブが成長</li>
                <li>🎨 国の色は進捗状況を表示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
