import { STATUS_COLORS, STATUS_LABELS, type ProjectStatus } from '../../types'

const statusOrder: ProjectStatus[] = [
  'not_started',
  'planning',
  'in_progress',
  'review',
  'completed',
]

export function MapLegend() {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(4px)',
      borderRadius: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            backgroundColor: '#E5E7EB',
          }}
        />
        <span style={{ fontSize: '12px', color: '#4b5563' }}>プロジェクトなし</span>
      </div>
      {statusOrder.map((status) => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: STATUS_COLORS[status],
            }}
          />
          <span style={{ fontSize: '12px', color: '#4b5563' }}>{STATUS_LABELS[status]}</span>
        </div>
      ))}
    </div>
  )
}
