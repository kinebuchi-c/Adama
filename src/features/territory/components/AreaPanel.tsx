import { useState, useCallback, useEffect, useRef } from 'react'
import { useTerritoryStore, forwardGeocode, formatArea } from '../../../stores/territoryStore'
import { useBaobabStore } from '../../../stores/baobabStore'
import { getCityDisplayName } from '../../../types/territory'
import type { City } from '../../../types/territory'
import { BaobabTree } from '../../../components/Baobab/BaobabTree'

interface AreaPanelProps {
  onToast: (message: string, icon: string) => void
}

export function AreaPanel({ onToast }: AreaPanelProps) {
  const { cities, addCity, getTotalArea, searchCities } = useTerritoryStore()
  const { loadGrowth, refreshGrowth } = useBaobabStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Omit<City, 'id'>[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const totalArea = getTotalArea()

  // Load baobab on mount
  useEffect(() => {
    loadGrowth()
  }, [loadGrowth])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)

    if (!query || query.length < 1) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Search local cities first
    const localResults = searchCities(query)
    setSearchResults(localResults)
    setShowResults(true)

    // Debounce API search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (localResults.length < 3 && query.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        const apiResults = await forwardGeocode(query)

        // Combine and deduplicate
        const combined = [...localResults]
        apiResults.forEach(apiCity => {
          const isDuplicate = combined.some(local =>
            local.nameEn === apiCity.nameEn ||
            (Math.abs(local.lat - apiCity.lat) < 0.1 && Math.abs(local.lng - apiCity.lng) < 0.1)
          )
          if (!isDuplicate) {
            combined.push(apiCity)
          }
        })

        setSearchResults(combined.slice(0, 5))
      }, 500)
    }
  }, [searchCities])

  const handleCitySelect = useCallback(async (cityData: Omit<City, 'id'>) => {
    const success = await addCity(cityData)
    if (success) {
      onToast(`${getCityDisplayName(cityData)}を追加（${formatArea(cityData.metroArea)} km²）`, '🏙️')
      refreshGrowth()
    } else {
      onToast(`${getCityDisplayName(cityData)}は既に追加されています`, '⚠️')
    }
    setSearchQuery('')
    setShowResults(false)
  }, [addCity, onToast, refreshGrowth])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: '90px',
      right: '24px',
      zIndex: 999,
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '24px',
      padding: '24px',
      width: '300px',
      boxShadow: '0 16px 32px rgba(0, 0, 0, 0.12)',
      maxHeight: 'calc(100vh - 180px)',
      overflowY: 'auto',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#86868B',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
      }}>
        領土面積シミュレーション
      </div>

      {/* Search Box */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 都市を検索 (Tokyo, 東京...)"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E5EA',
            borderRadius: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '0.875rem',
            background: 'white',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {showResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #E5E5EA',
            borderRadius: '12px',
            marginTop: '4px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {searchResults.map((city, index) => (
              <div
                key={`${city.nameEn}-${index}`}
                onClick={() => handleCitySelect(city)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #F5F5F7' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F5F5F7'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                  {city.nameEn} / {city.nameJa} {city.isFromApi ? '🌐' : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#86868B' }}>
                  {city.countryJa} ({city.countryEn}) · {formatArea(city.metroArea)} km²
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Area Display */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #007AFF, #5856D6)',
        borderRadius: '16px',
        color: 'white',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px' }}>
          現在の領土面積
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {formatArea(totalArea)}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>km²</div>
      </div>

      {/* Baobab Tree */}
      <div style={{ marginBottom: '16px' }}>
        <BaobabTree />
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#F5F5F7',
          borderRadius: '8px',
          fontSize: '0.7rem',
          color: '#86868B',
          textAlign: 'center',
        }}>
          都市を追加すると +15pt 🌱
        </div>
      </div>

      {/* City List */}
      {cities.length > 0 && (
        <>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#86868B',
            marginBottom: '8px',
          }}>
            追加済み都市 ({cities.length})
          </div>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {cities.map(city => (
              <div key={city.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#F5F5F7',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '0.75rem',
              }}>
                <div>
                  <span style={{ fontWeight: 600, display: 'block' }}>🏙️ {city.nameEn}</span>
                  <span style={{ color: '#86868B', fontSize: '0.625rem' }}>{city.nameJa}</span>
                </div>
                <span style={{ color: '#86868B' }}>{formatArea(city.metroArea)} km²</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
