import { create } from 'zustand'
import type { SuginamiDocument, DocumentStatus, DocumentType, DocumentPhoto } from '../types/suginami'
import {
  getAllSuginamiDocuments,
  addSuginamiDocument,
  updateSuginamiDocument,
  deleteSuginamiDocument,
  clearAllSuginamiDocuments,
} from '../db/database'

interface SuginamiDocumentState {
  documents: SuginamiDocument[]
  isLoading: boolean
  error: string | null

  loadDocuments: () => Promise<void>
  addDocument: (document: Omit<SuginamiDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<void>
  updateDocument: (id: string, updates: Partial<SuginamiDocument>) => Promise<void>
  addPhoto: (documentId: string, photo: DocumentPhoto) => Promise<void>
  removePhoto: (documentId: string, photoId: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  clearAllDocuments: () => Promise<void>

  getDocumentsByStatus: (status: DocumentStatus) => SuginamiDocument[]
  getDocumentsByType: (type: DocumentType) => SuginamiDocument | undefined
  getCompletionStats: () => { total: number; obtained: number; percentage: number }
  getExpiringDocuments: (daysThreshold?: number) => SuginamiDocument[]
}

export const useSuginamiDocumentStore = create<SuginamiDocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      const documents = await getAllSuginamiDocuments()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addDocument: async (document) => {
    set({ isLoading: true, error: null })
    try {
      const id = await addSuginamiDocument(document)
      const documents = await getAllSuginamiDocuments()
      set({ documents, isLoading: false })
      return id
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateDocumentStatus: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      await updateSuginamiDocument(id, { status })
      const documents = await getAllSuginamiDocuments()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateDocument: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      await updateSuginamiDocument(id, updates)
      const documents = await getAllSuginamiDocuments()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  addPhoto: async (documentId, photo) => {
    const { documents } = get()
    const document = documents.find((d) => d.id === documentId)
    if (!document) return

    set({ isLoading: true, error: null })
    try {
      const updatedPhotos = [...document.photos, photo]
      await updateSuginamiDocument(documentId, { photos: updatedPhotos })
      const updatedDocuments = await getAllSuginamiDocuments()
      set({ documents: updatedDocuments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  removePhoto: async (documentId, photoId) => {
    const { documents } = get()
    const document = documents.find((d) => d.id === documentId)
    if (!document) return

    set({ isLoading: true, error: null })
    try {
      const updatedPhotos = document.photos.filter((p) => p.id !== photoId)
      await updateSuginamiDocument(documentId, { photos: updatedPhotos })
      const updatedDocuments = await getAllSuginamiDocuments()
      set({ documents: updatedDocuments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteDocument: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await deleteSuginamiDocument(id)
      const documents = await getAllSuginamiDocuments()
      set({ documents, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  clearAllDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      await clearAllSuginamiDocuments()
      set({ documents: [], isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  getDocumentsByStatus: (status) => {
    const { documents } = get()
    return documents.filter((doc) => doc.status === status)
  },

  getDocumentsByType: (type) => {
    const { documents } = get()
    return documents.find((doc) => doc.type === type)
  },

  getCompletionStats: () => {
    const { documents } = get()
    const total = documents.filter((doc) => doc.required).length
    const obtained = documents.filter((doc) => doc.required && doc.status === 'obtained').length
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0
    return { total, obtained, percentage }
  },

  getExpiringDocuments: (daysThreshold = 30) => {
    const { documents } = get()
    const now = new Date()
    const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000)

    return documents.filter((doc) => {
      if (!doc.expirationDate) return false
      const expDate = new Date(doc.expirationDate)
      return expDate <= threshold && expDate > now
    })
  },
}))
