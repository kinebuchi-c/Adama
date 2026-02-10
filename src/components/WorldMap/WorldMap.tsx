import { memo, useCallback, useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps'
import { useProjectStore } from '../../stores/projectStore'
import { STATUS_COLORS, STATUS_LABELS } from '../../types'
import { getJapaneseName, getIsoA2, getJapaneseNameByCode } from '../../utils/countryData'
import { CAPITAL_COORDINATES } from '../../utils/capitalData'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldMapProps {
  onCountryClick: (countryCode: string, countryName: string) => void
}

interface TooltipInfo {
  name: string
  count: number
  status: string | null
  x: number
  y: number
  isCapital?: boolean
}

function WorldMapComponent({ onCountryClick }: WorldMapProps) {
  const { getCountryStatus, getProjectCounts } = useProjectStore()
  const projectCounts = getProjectCounts()
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)
  const [moonHovered, setMoonHovered] = useState(false)
  const [zoom, setZoom] = useState(1)

  // 月のプロジェクト情報
  const moonCount = projectCounts.get('MOON') || 0
  const moonStatus = getCountryStatus('MOON')

  const getCountryColor = useCallback((countryCode: string) => {
    const status = getCountryStatus(countryCode)
    if (!status) {
      return '#E5E7EB'
    }
    return STATUS_COLORS[status]
  }, [getCountryStatus])

  const handleCountryClick = useCallback((geo: { properties: { name?: string } }) => {
    const englishName = geo.properties.name || ''
    const countryCode = getIsoA2(englishName)
    const countryName = getJapaneseName(englishName)
    if (countryCode) {
      onCountryClick(countryCode, countryName)
    }
  }, [onCountryClick])

  const handleMoonClick = useCallback(() => {
    onCountryClick('MOON', '月')
  }, [onCountryClick])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [0, 30],
        }}
        width={800}
        height={450}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={[0, 30]}
          zoom={1}
          onMoveEnd={({ zoom: newZoom }) => setZoom(newZoom)}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const englishName = geo.properties.name || ''
                const countryCode = getIsoA2(englishName)
                const countryName = getJapaneseName(englishName)
                const count = projectCounts.get(countryCode) || 0
                const status = getCountryStatus(countryCode)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect()
                      if (rect) {
                        setTooltip({
                          name: countryName || englishName || '不明',
                          count,
                          status: status ? STATUS_LABELS[status] : null,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        })
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect()
                      if (rect && tooltip) {
                        setTooltip(prev => prev ? {
                          ...prev,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        } : null)
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: getCountryColor(countryCode),
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      hover: {
                        fill: count > 0 ? getCountryColor(countryCode) : '#CBD5E1',
                        stroke: '#1E40AF',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: getCountryColor(countryCode),
                        outline: 'none',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* 首都マーカー（ズーム時のみ表示） */}
          {zoom > 1.5 && Object.entries(CAPITAL_COORDINATES).map(([countryCode, capital]) => (
            <Marker key={countryCode} coordinates={capital.coordinates}>
              <circle
                r={3 / zoom}
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={1 / zoom}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const countryName = getJapaneseNameByCode(countryCode)
                  onCountryClick(countryCode, countryName)
                }}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect()
                  if (rect) {
                    setTooltip({
                      name: capital.name,
                      count: 0,
                      status: null,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      isCapital: true,
                    })
                  }
                }}
                onMouseMove={(e) => {
                  const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect()
                  if (rect) {
                    setTooltip(prev => prev ? {
                      ...prev,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    } : null)
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* 月 - 右上に配置 */}
      <div
        onClick={handleMoonClick}
        onMouseEnter={() => {
          setMoonHovered(true)
          setTooltip({
            name: '月',
            count: moonCount,
            status: moonStatus ? STATUS_LABELS[moonStatus] : null,
            x: -100, // 右上固定位置用（実際の描画位置で上書き）
            y: 60,
          })
        }}
        onMouseLeave={() => {
          setMoonHovered(false)
          setTooltip(null)
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: moonHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {/* 月の光 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="rgba(255, 255, 200, 0.3)"
            style={{ filter: 'blur(5px)' }}
          />
          {/* 月本体 */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill={moonStatus ? STATUS_COLORS[moonStatus] : '#F5F5DC'}
            stroke={moonHovered ? '#1E40AF' : '#D4D4AA'}
            strokeWidth={moonHovered ? 3 : 2}
          />
          {/* クレーター */}
          <circle cx="35" cy="40" r="8" fill="rgba(0,0,0,0.1)" />
          <circle cx="55" cy="55" r="6" fill="rgba(0,0,0,0.08)" />
          <circle cx="60" cy="35" r="5" fill="rgba(0,0,0,0.06)" />
          <circle cx="40" cy="60" r="4" fill="rgba(0,0,0,0.07)" />
          <circle cx="50" cy="45" r="3" fill="rgba(0,0,0,0.05)" />
        </svg>
        {/* プロジェクト数バッジ */}
        {moonCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: STATUS_COLORS[moonStatus || 'in_progress'],
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            {moonCount}
          </div>
        )}
      </div>

      {/* ツールチップ */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          ...(tooltip.name === '月' ? {
            right: '12px',
            top: '70px',
          } : {
            left: tooltip.x + 10,
            top: tooltip.y - 50,
          }),
          background: tooltip.isCapital ? 'rgba(59, 130, 246, 0.95)' : 'rgba(17, 24, 39, 0.95)',
          color: 'white',
          padding: tooltip.isCapital ? '6px 10px' : '8px 12px',
          borderRadius: '8px',
          fontSize: tooltip.isCapital ? '12px' : '14px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          {tooltip.isCapital ? (
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px' }}>🏛️</span>
              <span>{tooltip.name}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>（首都）</span>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 'bold' }}>{tooltip.name === '月' ? '🌙 月' : tooltip.name}</div>
              {tooltip.count > 0 ? (
                <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '4px' }}>
                  {tooltip.count} プロジェクト • {tooltip.status}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  クリックして追加
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export const WorldMap = memo(WorldMapComponent)
