import { useCallback, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTerritoryStore, reverseGeocode } from '../../../stores/territoryStore'
import type { City } from '../../../types/territory'
import { getCityDisplayName } from '../../../types/territory'
import { COUNTRY_NAMES } from '../../../types'

// Country code mapping from country names
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'Japan': 'JP', '日本': 'JP',
  'United States': 'US', 'United States of America': 'US', 'USA': 'US', 'アメリカ合衆国': 'US',
  'China': 'CN', '中国': 'CN', "People's Republic of China": 'CN',
  'United Kingdom': 'GB', 'UK': 'GB', 'イギリス': 'GB',
  'Germany': 'DE', 'Deutschland': 'DE', 'ドイツ': 'DE',
  'France': 'FR', 'フランス': 'FR',
  'Italy': 'IT', 'Italia': 'IT', 'イタリア': 'IT',
  'Spain': 'ES', 'España': 'ES', 'スペイン': 'ES',
  'Canada': 'CA', 'カナダ': 'CA',
  'Australia': 'AU', 'オーストラリア': 'AU',
  'South Korea': 'KR', 'Korea': 'KR', '韓国': 'KR', '대한민국': 'KR',
  'India': 'IN', 'インド': 'IN',
  'Brazil': 'BR', 'Brasil': 'BR', 'ブラジル': 'BR',
  'Mexico': 'MX', 'México': 'MX', 'メキシコ': 'MX',
  'Russia': 'RU', 'Russian Federation': 'RU', 'ロシア': 'RU', 'Россия': 'RU',
  'South Africa': 'ZA', '南アフリカ': 'ZA',
  'Egypt': 'EG', 'エジプト': 'EG', 'مصر': 'EG',
  'Nigeria': 'NG', 'ナイジェリア': 'NG',
  'Kenya': 'KE', 'ケニア': 'KE',
  'Thailand': 'TH', 'タイ': 'TH', 'ประเทศไทย': 'TH',
  'Vietnam': 'VN', 'Việt Nam': 'VN', 'ベトナム': 'VN',
  'Indonesia': 'ID', 'インドネシア': 'ID',
  'Philippines': 'PH', 'フィリピン': 'PH',
  'Singapore': 'SG', 'シンガポール': 'SG',
  'Malaysia': 'MY', 'マレーシア': 'MY',
  'New Zealand': 'NZ', 'ニュージーランド': 'NZ',
  'Argentina': 'AR', 'アルゼンチン': 'AR',
  'Chile': 'CL', 'チリ': 'CL',
  'Colombia': 'CO', 'コロンビア': 'CO',
  'Peru': 'PE', 'Perú': 'PE', 'ペルー': 'PE',
  'Sweden': 'SE', 'Sverige': 'SE', 'スウェーデン': 'SE',
  'Norway': 'NO', 'Norge': 'NO', 'ノルウェー': 'NO',
  'Finland': 'FI', 'Suomi': 'FI', 'フィンランド': 'FI',
  'Denmark': 'DK', 'Danmark': 'DK', 'デンマーク': 'DK',
  'Netherlands': 'NL', 'Nederland': 'NL', 'オランダ': 'NL',
  'Belgium': 'BE', 'België': 'BE', 'Belgique': 'BE', 'ベルギー': 'BE',
  'Switzerland': 'CH', 'Schweiz': 'CH', 'スイス': 'CH',
  'Austria': 'AT', 'Österreich': 'AT', 'オーストリア': 'AT',
  'Poland': 'PL', 'Polska': 'PL', 'ポーランド': 'PL',
  'Czech Republic': 'CZ', 'Czechia': 'CZ', 'チェコ': 'CZ',
  'Portugal': 'PT', 'ポルトガル': 'PT',
  'Greece': 'GR', 'Ελλάδα': 'GR', 'ギリシャ': 'GR',
  'Turkey': 'TR', 'Türkiye': 'TR', 'トルコ': 'TR',
  'Saudi Arabia': 'SA', 'サウジアラビア': 'SA',
  'United Arab Emirates': 'AE', 'UAE': 'AE', 'アラブ首長国連邦': 'AE',
  'Israel': 'IL', 'イスラエル': 'IL',
  'Pakistan': 'PK', 'パキスタン': 'PK',
  'Bangladesh': 'BD', 'バングラデシュ': 'BD',
  'Myanmar': 'MM', 'ミャンマー': 'MM',
  'Taiwan': 'TW', '台湾': 'TW',
  'Hong Kong': 'HK', '香港': 'HK',
  'Senegal': 'SN', 'セネガル': 'SN',
  'Mali': 'ML', 'マリ': 'ML',
  'Morocco': 'MA', 'Maroc': 'MA', 'モロッコ': 'MA',
  'Algeria': 'DZ', 'アルジェリア': 'DZ',
  'Tunisia': 'TN', 'チュニジア': 'TN',
  'Ghana': 'GH', 'ガーナ': 'GH',
  'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI', 'コートジボワール': 'CI',
}

// Custom city icon
const createCityIcon = () => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #5856D6;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  ">🏙️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Map click handler component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface TerritoryMapProps {
  onToast: (message: string, icon: string) => void
  onCountryClick?: (countryCode: string, countryName: string) => void
}

export function TerritoryMap({ onToast, onCountryClick }: TerritoryMapProps) {
  const { cities, deleteMode, addCity, removeCity, findNearestCity } = useTerritoryStore()
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (isGeocoding) return

    setIsGeocoding(true)

    try {
      // Always try to detect the country first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en,ja',
            'User-Agent': 'AdamaWorldTerritoryVision/1.0',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const countryName = data?.address?.country

        if (countryName && onCountryClick) {
          const countryCode = COUNTRY_NAME_TO_CODE[countryName]
          if (countryCode) {
            const japaneseName = COUNTRY_NAMES[countryCode] || countryName
            onCountryClick(countryCode, japaneseName)
            onToast(`${japaneseName}を選択しました`, '🌍')
          } else {
            onToast(`${countryName}を選択しました`, '🌍')
            onCountryClick(countryName.substring(0, 2).toUpperCase(), countryName)
          }
        }
      }

      // If in delete mode, don't add city pins
      if (deleteMode) {
        setIsGeocoding(false)
        return
      }

      // Try to find nearest known city
      let cityData = findNearestCity(lat, lng)

      // If not found, use geocoding API for city
      if (!cityData) {
        cityData = await reverseGeocode(lat, lng)
      }

      if (cityData) {
        const success = await addCity(cityData)
        if (success) {
          onToast(`${getCityDisplayName(cityData)}を追加（${cityData.metroArea.toLocaleString()} km²）`, '🏙️')
        }
      }
    } catch (error) {
      console.error('Map click error:', error)
    }

    setIsGeocoding(false)
  }, [deleteMode, isGeocoding, addCity, findNearestCity, onToast, onCountryClick])

  const handleCityClick = useCallback((city: City) => {
    if (deleteMode) {
      removeCity(city.id)
      onToast(`${getCityDisplayName(city)}を削除しました`, '🗑️')
    }
  }, [deleteMode, removeCity, onToast])

  // Calculate circle radius from area (km² to meters)
  const getCircleRadius = (area: number) => Math.sqrt(area * 1000000 / Math.PI)

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ width: '100%', height: '100%' }}
      minZoom={2}
      maxZoom={18}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      <MapClickHandler onMapClick={handleMapClick} />

      {/* Draw connections between cities */}
      {cities.length >= 2 && (
        <Polyline
          positions={cities.map(c => [c.lat, c.lng] as [number, number])}
          color="#5856D6"
          weight={3}
          opacity={0.8}
        />
      )}

      {/* Draw cities with economic zones */}
      {cities.map(city => (
        <div key={city.id}>
          <Circle
            center={[city.lat, city.lng]}
            radius={getCircleRadius(city.metroArea)}
            pathOptions={{
              color: '#007AFF',
              fillColor: '#007AFF',
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
          <Marker
            position={[city.lat, city.lng]}
            icon={createCityIcon()}
            eventHandlers={{
              click: () => handleCityClick(city),
            }}
          >
            <Popup>
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                  🏙️ {city.nameEn}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1D1D1F', marginBottom: '8px' }}>
                  {city.nameJa}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#86868B', marginBottom: '12px' }}>
                  {city.countryJa} ({city.countryEn})<br />
                  経済圏: {city.metroArea.toLocaleString()} km²
                </div>
                <button
                  onClick={() => {
                    removeCity(city.id)
                    onToast(`${getCityDisplayName(city)}を削除しました`, '🗑️')
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#FF2D55',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🗑️ 削除
                </button>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  )
}
