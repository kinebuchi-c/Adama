import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, Availability, PlaceStatus, MemberStatus, ViewMode } from '../types'
import { generateId, formatDateKey, DEFAULT_PLACES, DEFAULT_MEMBERS } from '../types'

interface ScheduleState {
  // Data
  members: Member[]
  availability: Availability[]

  // UI State
  selectedDate: Date
  viewMode: ViewMode
  editingMember: Member | null
  showMasterModal: boolean

  // Actions - Members (includes places)
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  reorderMember: (id: string, newOrder: number) => void

  // Actions - Availability
  setPlaceStatus: (memberId: string, date: Date, status: PlaceStatus | null) => void
  setMemberStatus: (memberId: string, date: Date, status: MemberStatus | null, note?: string) => void
  getAvailability: (memberId: string, date: Date) => Availability | undefined
  togglePlaceStatus: (memberId: string, date: Date) => void
  toggleMemberStatus: (memberId: string, date: Date) => void
  updateNote: (memberId: string, date: Date, note: string) => void

  // Actions - UI
  setSelectedDate: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
  goToToday: () => void
  goToNext: () => void
  goToPrev: () => void
  setEditingMember: (member: Member | null) => void
  setShowMasterModal: (show: boolean) => void

  // Getters
  getPlaces: () => Member[]
  getPersons: () => Member[]
}

// Create initial members with IDs
const createInitialMembers = (): Member[] => {
  const places = DEFAULT_PLACES.map((p, i) => ({
    ...p,
    id: `place-${i}`,
    createdAt: new Date(),
  }))
  const members = DEFAULT_MEMBERS.map((m, i) => ({
    ...m,
    id: `member-${i}`,
    createdAt: new Date(),
  }))
  return [...places, ...members]
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      // Initial Data
      members: createInitialMembers(),
      availability: [],
      selectedDate: new Date(),
      viewMode: 'week',
      editingMember: null,
      showMasterModal: false,

      // Member Actions
      addMember: (memberData) => set((state) => ({
        members: [...state.members, {
          ...memberData,
          id: generateId(),
          order: state.members.filter(m => m.type === memberData.type).length,
          createdAt: new Date(),
        }]
      })),

      updateMember: (id, updates) => set((state) => ({
        members: state.members.map(m =>
          m.id === id ? { ...m, ...updates } : m
        )
      })),

      deleteMember: (id) => set((state) => ({
        members: state.members.filter(m => m.id !== id),
        availability: state.availability.filter(a => a.memberId !== id),
      })),

      reorderMember: (id, newOrder) => set((state) => {
        const member = state.members.find(m => m.id === id)
        if (!member) return state

        const oldOrder = member.order
        const updatedMembers = state.members.map(m => {
          if (m.id === id) return { ...m, order: newOrder }
          if (m.type !== member.type) return m

          if (newOrder > oldOrder) {
            if (m.order > oldOrder && m.order <= newOrder) {
              return { ...m, order: m.order - 1 }
            }
          } else {
            if (m.order >= newOrder && m.order < oldOrder) {
              return { ...m, order: m.order + 1 }
            }
          }
          return m
        })

        return { members: updatedMembers }
      }),

      // Availability Actions
      setPlaceStatus: (memberId, date, status) => set((state) => {
        const dateKey = formatDateKey(date)
        const existing = state.availability.find(
          a => a.memberId === memberId && a.date === dateKey
        )

        if (status === null) {
          return {
            availability: state.availability.filter(
              a => !(a.memberId === memberId && a.date === dateKey)
            )
          }
        }

        if (existing) {
          return {
            availability: state.availability.map(a =>
              a.memberId === memberId && a.date === dateKey
                ? { ...a, placeStatus: status, updatedAt: new Date() }
                : a
            )
          }
        }

        return {
          availability: [...state.availability, {
            id: generateId(),
            memberId,
            date: dateKey,
            placeStatus: status,
            updatedAt: new Date(),
          }]
        }
      }),

      setMemberStatus: (memberId, date, status, note) => set((state) => {
        const dateKey = formatDateKey(date)
        const existing = state.availability.find(
          a => a.memberId === memberId && a.date === dateKey
        )

        if (status === null && !note) {
          return {
            availability: state.availability.filter(
              a => !(a.memberId === memberId && a.date === dateKey)
            )
          }
        }

        if (existing) {
          return {
            availability: state.availability.map(a =>
              a.memberId === memberId && a.date === dateKey
                ? { ...a, memberStatus: status || undefined, note: note || a.note, updatedAt: new Date() }
                : a
            )
          }
        }

        return {
          availability: [...state.availability, {
            id: generateId(),
            memberId,
            date: dateKey,
            memberStatus: status || undefined,
            note,
            updatedAt: new Date(),
          }]
        }
      }),

      getAvailability: (memberId, date) => {
        const { availability } = get()
        const dateKey = formatDateKey(date)
        return availability.find(
          a => a.memberId === memberId && a.date === dateKey
        )
      },

      togglePlaceStatus: (memberId, date) => {
        const current = get().getAvailability(memberId, date)
        const statusCycle: Array<PlaceStatus | null> = ['available', 'unavailable', 'maybe', null]
        const currentIndex = current?.placeStatus ? statusCycle.indexOf(current.placeStatus) : -1
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
        get().setPlaceStatus(memberId, date, nextStatus)
      },

      toggleMemberStatus: (memberId, date) => {
        const current = get().getAvailability(memberId, date)
        const statusCycle: Array<MemberStatus | null> = ['office', 'remote', 'trip', 'off', null]
        const currentIndex = current?.memberStatus ? statusCycle.indexOf(current.memberStatus) : -1
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
        get().setMemberStatus(memberId, date, nextStatus)
      },

      updateNote: (memberId, date, note) => set((state) => {
        const dateKey = formatDateKey(date)
        const existing = state.availability.find(
          a => a.memberId === memberId && a.date === dateKey
        )

        if (existing) {
          return {
            availability: state.availability.map(a =>
              a.memberId === memberId && a.date === dateKey
                ? { ...a, note: note || undefined, updatedAt: new Date() }
                : a
            )
          }
        }

        if (note) {
          return {
            availability: [...state.availability, {
              id: generateId(),
              memberId,
              date: dateKey,
              note,
              updatedAt: new Date(),
            }]
          }
        }

        return state
      }),

      // UI Actions
      setSelectedDate: (date) => set({ selectedDate: date }),

      setViewMode: (mode) => set({ viewMode: mode }),

      goToToday: () => set({ selectedDate: new Date() }),

      goToNext: () => set((state) => {
        const next = new Date(state.selectedDate)
        if (state.viewMode === 'week') {
          next.setDate(next.getDate() + 7)
        } else {
          next.setMonth(next.getMonth() + 1)
        }
        return { selectedDate: next }
      }),

      goToPrev: () => set((state) => {
        const prev = new Date(state.selectedDate)
        if (state.viewMode === 'week') {
          prev.setDate(prev.getDate() - 7)
        } else {
          prev.setMonth(prev.getMonth() - 1)
        }
        return { selectedDate: prev }
      }),

      setEditingMember: (member) => set({ editingMember: member }),
      setShowMasterModal: (show) => set({ showMasterModal: show }),

      // Getters
      getPlaces: () => {
        return get().members
          .filter(m => m.type === 'place' && m.isActive)
          .sort((a, b) => a.order - b.order)
      },

      getPersons: () => {
        return get().members
          .filter(m => m.type === 'person' && m.isActive)
          .sort((a, b) => a.order - b.order)
      },
    }),
    {
      name: 'shibuya5f-schedule-v2',
      partialize: (state) => ({
        members: state.members,
        availability: state.availability,
      }),
    }
  )
)
