// Shibuya 5F Schedule Types - Availability Tracker

export interface Member {
  id: string
  name: string
  type: 'person' | 'place'
  color: string
  icon: string
  mapUrl?: string // Google Map URL for places
  hours?: string // Operating hours for places (e.g., "7:00~16:00")
  isActive: boolean
  order: number
  createdAt: Date
}

// Place availability (simple)
export type PlaceStatus = 'available' | 'unavailable' | 'maybe'

// Member work status (detailed)
export type MemberStatus = 'office' | 'remote' | 'trip' | 'off'

export interface Availability {
  id: string
  memberId: string
  date: string // YYYY-MM-DD format
  placeStatus?: PlaceStatus // for places
  memberStatus?: MemberStatus // for members
  note?: string
  updatedAt: Date
}

// Helper functions
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2)
}

export function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = []
  const start = new Date(baseDate)
  start.setDate(start.getDate() - start.getDay()) // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  return dates
}

export function getMonthDates(baseDate: Date): Date[] {
  const dates: Date[] = []
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  // Get the first day of the month
  const firstDay = new Date(year, month, 1)
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0)

  // Start from Sunday of the first week
  const start = new Date(firstDay)
  start.setDate(start.getDate() - start.getDay())

  // End on Saturday of the last week
  const end = new Date(lastDay)
  end.setDate(end.getDate() + (6 - end.getDay()))

  // Generate all dates
  const current = new Date(start)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export type ViewMode = 'week' | 'month'

// Japanese holidays (2025-2026)
const JAPANESE_HOLIDAYS: Record<string, string> = {
  // 2025
  '2025-01-01': '元日',
  '2025-01-13': '成人の日',
  '2025-02-11': '建国記念の日',
  '2025-02-23': '天皇誕生日',
  '2025-02-24': '振替休日',
  '2025-03-20': '春分の日',
  '2025-04-29': '昭和の日',
  '2025-05-03': '憲法記念日',
  '2025-05-04': 'みどりの日',
  '2025-05-05': 'こどもの日',
  '2025-05-06': '振替休日',
  '2025-07-21': '海の日',
  '2025-08-11': '山の日',
  '2025-09-15': '敬老の日',
  '2025-09-23': '秋分の日',
  '2025-10-13': 'スポーツの日',
  '2025-11-03': '文化の日',
  '2025-11-23': '勤労感謝の日',
  '2025-11-24': '振替休日',
  // 2026
  '2026-01-01': '元日',
  '2026-01-12': '成人の日',
  '2026-02-11': '建国記念の日',
  '2026-02-23': '天皇誕生日',
  '2026-03-20': '春分の日',
  '2026-04-29': '昭和の日',
  '2026-05-03': '憲法記念日',
  '2026-05-04': 'みどりの日',
  '2026-05-05': 'こどもの日',
  '2026-05-06': '振替休日',
  '2026-07-20': '海の日',
  '2026-08-11': '山の日',
  '2026-09-21': '敬老の日',
  '2026-09-22': '国民の休日',
  '2026-09-23': '秋分の日',
  '2026-10-12': 'スポーツの日',
  '2026-11-03': '文化の日',
  '2026-11-23': '勤労感謝の日',
}

export function isHoliday(date: Date): boolean {
  const key = formatDateKey(date)
  return key in JAPANESE_HOLIDAYS
}

export function getHolidayName(date: Date): string | undefined {
  const key = formatDateKey(date)
  return JAPANESE_HOLIDAYS[key]
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Place status colors & labels
export const PLACE_STATUS_COLORS: Record<PlaceStatus, string> = {
  available: '#10B981',
  unavailable: '#EF4444',
  maybe: '#F59E0B',
}

export const PLACE_STATUS_LABELS: Record<PlaceStatus, string> = {
  available: '○',
  unavailable: '×',
  maybe: '△',
}

// Member status colors & labels
export const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  office: '#3B82F6',
  remote: '#10B981',
  trip: '#8B5CF6',
  off: '#EF4444',
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  office: '出社',
  remote: '在宅',
  trip: '出張',
  off: '休',
}

export const MEMBER_STATUS_ICONS: Record<MemberStatus, string> = {
  office: '🏢',
  remote: '🏠',
  trip: '✈️',
  off: '🌴',
}

export const EMPTY_COLOR = '#E5E7EB'

// Default data
export const DEFAULT_PLACES: Omit<Member, 'id' | 'createdAt'>[] = [
  { name: '渋谷5F', type: 'place', color: '#3B82F6', icon: '🏢', mapUrl: 'https://maps.google.com/?q=渋谷', hours: '7:00~16:00', isActive: true, order: 0 },
]

export const DEFAULT_MEMBERS: Omit<Member, 'id' | 'createdAt'>[] = [
  { name: 'サンプルさん', type: 'person', color: '#8B5CF6', icon: '👤', isActive: true, order: 0 },
]
