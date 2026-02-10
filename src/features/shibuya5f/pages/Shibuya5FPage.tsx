import { useState } from 'react'
import { AvailabilityGrid, MemberEditor } from '../components'
import { useScheduleStore } from '../stores/scheduleStore'

export function Shibuya5FPage() {
  const { getPlaces, getPersons, editingMember, setEditingMember } = useScheduleStore()
  const [addingType, setAddingType] = useState<'person' | 'place' | null>(null)

  const places = getPlaces()
  const persons = getPersons()

  const handleCloseEditor = () => {
    setEditingMember(null)
    setAddingType(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <header style={{ marginBottom: '24px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span>📅</span>
            <span>スケジュール共有</span>
          </h1>
        </header>

        {/* Places Section */}
        <div style={{ marginBottom: '24px' }}>
          <AvailabilityGrid
            members={places}
            title="🏢 作業場所"
            type="place"
            emptyMessage="場所を追加してください"
            onAddClick={() => setAddingType('place')}
            showNavigation={true}
          />
        </div>

        {/* Members Section */}
        <div>
          <AvailabilityGrid
            members={persons}
            title="👥 メンバー"
            type="person"
            emptyMessage="メンバーを追加してください"
            onAddClick={() => setAddingType('person')}
          />
        </div>
      </div>

      {/* Member/Place Editor Modal */}
      {(editingMember || addingType) && (
        <MemberEditor
          member={editingMember}
          type={editingMember?.type || addingType || 'person'}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
