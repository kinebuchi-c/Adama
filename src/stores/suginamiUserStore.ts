import { create } from 'zustand'
import type { SuginamiUserProfile, UserNeed, ResidenceStatusType, DurationType } from '../types/suginami'
import type { SupportedLanguage } from '../i18n'
import { getSuginamiUserProfile, saveSuginamiUserProfile, updateSuginamiUserProfile } from '../db/database'

interface SuginamiUserState {
  profile: SuginamiUserProfile | null
  isLoading: boolean
  error: string | null
  hasCompletedOnboarding: boolean

  loadProfile: () => Promise<void>
  completeOnboarding: (data: OnboardingData) => Promise<void>
  updateProfile: (updates: Partial<SuginamiUserProfile>) => Promise<void>
  resetProfile: () => Promise<void>
}

export interface OnboardingData {
  residenceStatus: ResidenceStatusType
  arrivalDate?: Date
  plannedDuration?: DurationType
  residenceCard: boolean
  myNumber: boolean
  healthInsurance: boolean
  pension: boolean
  bankAccount: boolean
  needs: UserNeed[]
  language: SupportedLanguage
}

export const useSuginamiUserStore = create<SuginamiUserState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,

  loadProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await getSuginamiUserProfile()
      set({
        profile: profile || null,
        hasCompletedOnboarding: profile?.completedOnboarding || false,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  completeOnboarding: async (data: OnboardingData) => {
    set({ isLoading: true, error: null })
    try {
      await saveSuginamiUserProfile({
        ...data,
        completedOnboarding: true,
      })

      const profile = await getSuginamiUserProfile()
      set({
        profile: profile || null,
        hasCompletedOnboarding: true,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateProfile: async (updates: Partial<SuginamiUserProfile>) => {
    set({ isLoading: true, error: null })
    try {
      await updateSuginamiUserProfile(updates)
      const profile = await getSuginamiUserProfile()
      set({ profile: profile || null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  resetProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      await updateSuginamiUserProfile({
        completedOnboarding: false,
      })
      set({
        profile: null,
        hasCompletedOnboarding: false,
        isLoading: false,
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
