import { create } from 'zustand'
import type { NeemGrowth } from '../types'
import { NEEM_LEVELS } from '../types'
import { getNeemGrowth, initializeDatabase, plantNewTree as dbPlantNewTree } from '../db/database'

interface NeemState {
  growth: NeemGrowth | null
  isLoading: boolean
  error: string | null

  // Actions
  loadGrowth: () => Promise<void>
  refreshGrowth: () => Promise<void>
  plantNewTree: () => Promise<void>
  getCurrentLevel: () => typeof NEEM_LEVELS[0] | null
  getProgressToNextLevel: () => number
  getPointsToNextLevel: () => number
}

export const useNeemStore = create<NeemState>((set, get) => ({
  growth: null,
  isLoading: false,
  error: null,

  loadGrowth: async () => {
    set({ isLoading: true, error: null })
    try {
      await initializeDatabase()
      const growth = await getNeemGrowth()
      set({ growth: growth || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  refreshGrowth: async () => {
    try {
      const growth = await getNeemGrowth()
      set({ growth: growth || null })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  plantNewTree: async () => {
    try {
      const growth = await dbPlantNewTree()
      set({ growth })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  getCurrentLevel: () => {
    const { growth } = get()
    if (!growth) return null

    return NEEM_LEVELS[growth.level - 1] || NEEM_LEVELS[0]
  },

  getProgressToNextLevel: () => {
    const { growth } = get()
    if (!growth) return 0

    const currentLevelData = NEEM_LEVELS[growth.level - 1]
    const nextLevelData = NEEM_LEVELS[growth.level]

    if (!nextLevelData) return 100 // 最大レベル

    const currentLevelPoints = currentLevelData.points
    const nextLevelPoints = nextLevelData.points
    const pointsInCurrentLevel = growth.totalPoints - currentLevelPoints
    const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints

    return Math.min(100, Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100))
  },

  getPointsToNextLevel: () => {
    const { growth } = get()
    if (!growth) return 0

    const nextLevelData = NEEM_LEVELS[growth.level]

    if (!nextLevelData) return 0 // 最大レベル

    return nextLevelData.points - growth.totalPoints
  },
}))
