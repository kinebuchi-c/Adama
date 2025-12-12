import { useState, useMemo, useRef, useEffect } from 'react'
import { COUNTRY_DATA } from '../../utils/countryData'

interface CountrySearchProps {
  onSelect: (countryCode: string, countryName: string) => void
}

// COUNTRY_DATAからISO_A2コード→日本語名のマッピングを生成
const ALL_COUNTRIES: Record<string, string> = {
  'MOON': '月 🌙', // 月を先頭に追加
}
for (const [, data] of Object.entries(COUNTRY_DATA)) {
  if (data.iso_a2 && !ALL_COUNTRIES[data.iso_a2]) {
    ALL_COUNTRIES[data.iso_a2] = data.name_ja
  }
}

export function CountrySearch({ onSelect }: CountrySearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCountries = useMemo(() => {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    return Object.entries(ALL_COUNTRIES)
      .filter(([code, name]) =>
        name.toLowerCase().includes(lowerQuery) ||
        code.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8) // 最大8件表示
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (code: string, name: string) => {
    onSelect(code, name)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="国名で検索..."
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '16px',
            paddingTop: '10px',
            paddingBottom: '10px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            fontSize: '16px',
          }}
        >
          🔍
        </span>
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && filteredCountries.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            zIndex: 50,
            width: '100%',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            overflow: 'hidden',
          }}
        >
          {filteredCountries.map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleSelect(code, name)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ fontWeight: '500', color: '#1f2937' }}>{name}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{code}</span>
            </button>
          ))}
        </div>
      )}

      {/* 検索結果なし */}
      {isOpen && query.trim() && filteredCountries.length === 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            zIndex: 50,
            width: '100%',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '16px',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          「{query}」に一致する国が見つかりません
        </div>
      )}
    </div>
  )
}
