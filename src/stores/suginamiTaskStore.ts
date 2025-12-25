import { create } from 'zustand'
import type { SuginamiTask, TaskCategory, TaskStatus } from '../types/suginami'
import {
  getAllSuginamiTasks,
  addSuginamiTask,
  updateSuginamiTask,
  deleteSuginamiTask,
  clearAllSuginamiTasks,
} from '../db/database'

interface SuginamiTaskState {
  tasks: SuginamiTask[]
  isLoading: boolean
  error: string | null

  loadTasks: () => Promise<void>
  addTask: (task: Omit<SuginamiTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  updateTask: (id: string, updates: Partial<SuginamiTask>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  clearAllTasks: () => Promise<void>

  getTasksByCategory: (category: TaskCategory) => SuginamiTask[]
  getTasksByStatus: (status: TaskStatus) => SuginamiTask[]
  getHighPriorityTasks: () => SuginamiTask[]
  getCompletionStats: () => { total: number; completed: number; percentage: number }
}

export const useSuginamiTaskStore = create<SuginamiTaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  loadTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await getAllSuginamiTasks()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addTask: async (task) => {
    set({ isLoading: true, error: null })
    try {
      const id = await addSuginamiTask(task)
      const tasks = await getAllSuginamiTasks()
      set({ tasks, isLoading: false })
      return id
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateTaskStatus: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      const updates: Partial<SuginamiTask> = { status }
      if (status === 'completed') {
        updates.completedAt = new Date()
      }
      await updateSuginamiTask(id, updates)
      const tasks = await getAllSuginamiTasks()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      await updateSuginamiTask(id, updates)
      const tasks = await getAllSuginamiTasks()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteSuginamiTask(id)
      const tasks = await getAllSuginamiTasks()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  clearAllTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      await clearAllSuginamiTasks()
      set({ tasks: [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  getTasksByCategory: (category) => {
    const { tasks } = get()
    return tasks.filter((task) => task.category === category)
  },

  getTasksByStatus: (status) => {
    const { tasks } = get()
    return tasks.filter((task) => task.status === status)
  },

  getHighPriorityTasks: () => {
    const { tasks } = get()
    return tasks.filter(
      (task) => task.priority === 'high' && task.status !== 'completed' && task.status !== 'skipped'
    )
  },

  getCompletionStats: () => {
    const { tasks } = get()
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === 'completed').length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  },
}))
