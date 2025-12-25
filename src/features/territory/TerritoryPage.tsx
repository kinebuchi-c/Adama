import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTerritoryStore, formatArea } from '../../stores/territoryStore'
import { useProjectStore } from '../../stores/projectStore'
import { useBaobabStore } from '../../stores/baobabStore'
import { TerritoryMap } from './components/TerritoryMap'
import { BaobabTree } from '../../components/Baobab/BaobabTree'

export function TerritoryPage() {
  const navigate = useNavigate()
  const { cities, deleteMode, toggleDeleteMode, resetAll, getTotalArea } = useTerritoryStore()
  const { projects, loadProjects } = useProjectStore()
  const { loadGrowth } = useBaobabStore()
  const [toast, setToast] = useState<{ message: string; icon: string; show: boolean }>({
    message: '',
    icon: '✅',
    show: false,
  })
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)

  // Load data on mount
  useEffect(() => {
    loadProjects()
    loadGrowth()
  }, [loadProjects, loadGrowth])

  const showToast = useCallback((message: string, icon: string = '✅') => {
    setToast({ message, icon, show: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }, [])

  const handleCountryClick = useCallback((countryCode: string, countryName: string) => {
    setSelectedCountry({ code: countryCode, name: countryName })
  }, [])

  const handleViewProjects = useCallback(() => {
    if (selectedCountry) {
      navigate(`/country/${selectedCountry.code}`, { state: { countryName: selectedCountry.name } })
    }
  }, [selectedCountry, navigate])

  const handleSave = useCallback(() => {
    showToast('データを保存しました', '💾')
  }, [showToast])

  const handleExport = useCallback(() => {
    const data = {
      cities: cities,
      exportDate: new Date().toISOString(),
      version: '1.0',
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `world-territory-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    showToast('データをエクスポートしました', '📤')
  }, [cities, showToast])

  const handleReset = useCallback(() => {
    if (!confirm('すべてのデータをリセットしますか？')) return
    resetAll()
    showToast('マップをリセットしました', '🔄')
  }, [resetAll, showToast])

  const handleToggleMode = useCallback(() => {
    toggleDeleteMode()
    showToast(
      deleteMode ? 'ピン配置モードに切り替えました' : '削除モードに切り替えました',
      deleteMode ? '📍' : '🗑️'
    )
  }, [deleteMode, toggleDeleteMode, showToast])

  // Stats
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const countriesWithProjects = new Set(projects.map(p => p.countryCode)).size
  const selectedCountryProjects = selectedCountry
    ? projects.filter(p => p.countryCode === selectedCountry.code)
    : []

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
      background: '#FAFAFA',
      color: '#1D1D1F',
      WebkitFontSmoothing: 'antialiased',
      overflow: 'hidden',
      height: '100vh',
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        padding: '12px 24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🗺️</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              World Territory Vision
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleToggleMode} style={buttonStyle('secondary')}>
              {deleteMode ? '🗑️ 削除' : '📍 配置'}
            </button>
            <button onClick={handleSave} style={buttonStyle('primary')}>💾 保存</button>
            <button onClick={handleExport} style={buttonStyle('secondary')}>📤</button>
            <button onClick={handleReset} style={buttonStyle('danger')}>🔄</button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div style={{
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        bottom: '50px',
        zIndex: 1,
      }}>
        <TerritoryMap onToast={showToast} onCountryClick={handleCountryClick} />
      </div>

      {/* Right Panel */}
      <div style={{
        position: 'absolute',
        top: '75px',
        right: '16px',
        zIndex: 999,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '20px',
        padding: '16px',
        width: '280px',
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
        maxHeight: 'calc(100vh - 150px)',
        overflowY: 'auto',
      }}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1, background: '#F5F5F7', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalProjects}</div>
            <div style={{ fontSize: '0.65rem', color: '#86868B' }}>プロジェクト</div>
          </div>
          <div style={{ flex: 1, background: '#F5F5F7', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34C759' }}>{completedProjects}</div>
            <div style={{ fontSize: '0.65rem', color: '#86868B' }}>完了</div>
          </div>
          <div style={{ flex: 1, background: '#F5F5F7', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#007AFF' }}>{countriesWithProjects}</div>
            <div style={{ fontSize: '0.65rem', color: '#86868B' }}>活動国</div>
          </div>
        </div>

        {/* Territory Area */}
        <div style={{
          textAlign: 'center',
          padding: '14px',
          background: 'linear-gradient(135deg, #007AFF, #5856D6)',
          borderRadius: '14px',
          color: 'white',
          marginBottom: '12px',
        }}>
          <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>領土面積</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatArea(getTotalArea())}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>km²</div>
        </div>

        {/* Selected Country */}
        {selectedCountry && (
          <div style={{
            background: '#E8F5E9',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>🌍 {selectedCountry.name}</span>
              <button
                onClick={() => setSelectedCountry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#86868B' }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4A5568', marginBottom: '8px' }}>
              {selectedCountryProjects.length} プロジェクト
            </div>
            <button
              onClick={handleViewProjects}
              style={{
                width: '100%',
                padding: '8px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              プロジェクト管理 →
            </button>
          </div>
        )}

        {/* Baobab Tree */}
        <div style={{ marginBottom: '12px' }}>
          <BaobabTree />
        </div>

        {/* City List */}
        {cities.length > 0 && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#86868B', marginBottom: '6px' }}>
              追加済み都市 ({cities.length})
            </div>
            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
              {cities.map(city => (
                <div key={city.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: '#F5F5F7',
                  borderRadius: '6px',
                  marginBottom: '3px',
                  fontSize: '0.7rem',
                }}>
                  <span style={{ fontWeight: 600 }}>🏙️ {city.nameEn}</span>
                  <span style={{ color: '#86868B' }}>{formatArea(city.metroArea)} km²</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Hint */}
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: '#FFF9E6',
          borderRadius: '10px',
          fontSize: '0.65rem',
          color: '#8B7355',
        }}>
          💡 地図をクリックして国を選択、またはピンを追加
        </div>
      </div>

      {/* Status Bar */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.18)',
        padding: '10px 24px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>📍 {cities.length} 都市</span>
            <span>📏 {formatArea(getTotalArea())} km²</span>
          </div>
          <div style={{
            padding: '4px 12px',
            background: deleteMode ? '#FFE5E5' : '#E8F5E9',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            {deleteMode ? '🗑️ 削除モード' : '📍 配置モード'}
          </div>
        </div>
      </footer>

      {/* Toast */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: toast.show ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100px)',
        zIndex: 2000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(40px)',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        opacity: toast.show ? 1 : 0,
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }}>
        <span style={{ marginRight: '8px' }}>{toast.icon}</span>
        <span style={{ fontWeight: 600 }}>{toast.message}</span>
      </div>
    </div>
  )
}

function buttonStyle(variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '8px 14px',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  }

  if (variant === 'primary') return { ...base, background: '#007AFF', color: 'white' }
  if (variant === 'danger') return { ...base, background: '#FF3B30', color: 'white' }
  return { ...base, background: 'white', color: '#1D1D1F', border: '1px solid #E5E5EA' }
}
