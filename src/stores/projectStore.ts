import { create } from 'zustand'
import type { Project, ProjectStatus } from '../types'
import { GROWTH_POINTS } from '../types'
import {
  getAllProjects,
  getProjectsByCountry,
  addProject as dbAddProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  addGrowthPoints,
} from '../db/database'

interface ProjectState {
  projects: Project[]
  selectedCountry: string | null
  isLoading: boolean
  error: string | null

  // Actions
  loadProjects: () => Promise<void>
  loadProjectsByCountry: (countryCode: string) => Promise<Project[]>
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  updateStatus: (id: string, status: ProjectStatus) => Promise<void>
  setSelectedCountry: (countryCode: string | null) => void
  getCountryStatus: (countryCode: string) => ProjectStatus | null
  getProjectCounts: () => Map<string, number>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedCountry: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await getAllProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadProjectsByCountry: async (countryCode: string) => {
    const projects = await getProjectsByCountry(countryCode)
    return projects
  },

  addProject: async (project) => {
    set({ isLoading: true, error: null })
    try {
      const id = await dbAddProject(project)
      await addGrowthPoints(GROWTH_POINTS.project_added)

      // Reload projects
      const projects = await getAllProjects()
      set({ projects, isLoading: false })

      return id
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateProject: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      await dbUpdateProject(id, updates)

      // Reload projects
      const projects = await getAllProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await dbDeleteProject(id)

      // Reload projects
      const projects = await getAllProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateStatus: async (id, status) => {
    const { projects } = get()
    const project = projects.find(p => p.id === id)

    if (!project) return

    const wasCompleted = project.status === 'completed'
    const isNowCompleted = status === 'completed'

    await dbUpdateProject(id, { status })

    // 成長ポイント付与
    if (isNowCompleted && !wasCompleted) {
      await addGrowthPoints(GROWTH_POINTS.project_completed)
    } else {
      await addGrowthPoints(GROWTH_POINTS.status_updated)
    }

    // Reload projects
    const updatedProjects = await getAllProjects()
    set({ projects: updatedProjects })
  },

  setSelectedCountry: (countryCode) => {
    set({ selectedCountry: countryCode })
  },

  getCountryStatus: (countryCode) => {
    const { projects } = get()
    const countryProjects = projects.filter(p => p.countryCode === countryCode)

    if (countryProjects.length === 0) return null

    // ステータスの優先度: completed < not_started < preparing < in_progress
    const statusPriority: Record<ProjectStatus, number> = {
      completed: 1,
      not_started: 2,
      preparing: 3,
      in_progress: 4,
    }

    // 最も優先度の高いステータスを返す
    return countryProjects.reduce((highest, project) => {
      if (statusPriority[project.status] > statusPriority[highest]) {
        return project.status
      }
      return highest
    }, countryProjects[0].status)
  },

  getProjectCounts: () => {
    const { projects } = get()
    const counts = new Map<string, number>()

    projects.forEach(project => {
      const current = counts.get(project.countryCode) || 0
      counts.set(project.countryCode, current + 1)
    })

    return counts
  },
}))
