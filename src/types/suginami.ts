import type { SupportedLanguage } from '../i18n'

// ===== User Profile Types =====

export type ResidenceStatusType =
  | 'permanent_resident'
  | 'spouse_japanese'
  | 'spouse_permanent'
  | 'long_term_resident'
  | 'student'
  | 'work_engineer'
  | 'work_skilled'
  | 'work_specified'
  | 'work_other'
  | 'dependent'
  | 'designated_activities'
  | 'other'

export type DurationType =
  | 'under_3months'
  | '3months_to_1year'
  | '1year_to_3years'
  | '3years_to_5years'
  | 'over_5years'
  | 'permanent'

export type UserNeed =
  | 'housing'
  | 'medical'
  | 'education'
  | 'childcare'
  | 'employment'
  | 'japanese_language'
  | 'daily_life'
  | 'legal_administrative'

export interface SuginamiUserProfile {
  id: string
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
  completedOnboarding: boolean
  createdAt: Date
  updatedAt: Date
}

// ===== Task Types =====

export type TaskCategory =
  | 'residence'
  | 'municipal'
  | 'insurance'
  | 'daily_life'
  | 'work'
  | 'education'

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'waiting'
  | 'completed'
  | 'skipped'

export type TaskPriority = 'high' | 'medium' | 'low'

export interface ExternalLink {
  titleKey: string
  url: string
  isOfficial: boolean
}

export interface SuginamiTask {
  id: string
  templateId: string
  titleKey: string
  descriptionKey: string
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  dueDate?: Date
  completedAt?: Date
  linkedDocuments: string[]
  externalLinks: ExternalLink[]
  notes?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// ===== Document Types =====

export type DocumentType =
  | 'residence_card'
  | 'passport'
  | 'my_number'
  | 'health_insurance'
  | 'pension_book'
  | 'bank_card'
  | 'employment_contract'
  | 'certificate_eligibility'
  | 'juminhyo'
  | 'seal_registration'
  | 'other'

export type DocumentStatus =
  | 'not_obtained'
  | 'in_process'
  | 'obtained'
  | 'expired'

export interface DocumentPhoto {
  id: string
  blob: Blob
  thumbnail: Blob
  capturedAt: Date
  label?: string
}

export interface SuginamiDocument {
  id: string
  type: DocumentType
  nameKey: string
  descriptionKey: string
  required: boolean
  status: DocumentStatus
  expirationDate?: Date
  photos: DocumentPhoto[]
  notes?: string
  linkedTaskId?: string
  createdAt: Date
  updatedAt: Date
}

// ===== Language Preference =====

export interface LanguagePreference {
  id: string
  language: SupportedLanguage
  updatedAt: Date
}

// ===== Task Templates =====

export interface TaskTemplate {
  id: string
  titleKey: string
  descriptionKey: string
  category: TaskCategory
  priority: TaskPriority
  linkedDocumentTypes: DocumentType[]
  externalLinks: ExternalLink[]
  conditions: TaskCondition[]
}

export interface TaskCondition {
  type: 'residence_status' | 'has_completed' | 'needs' | 'duration'
  value: string | string[]
  negate?: boolean
}

// ===== Status Colors & Labels =====

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: '#D1D5DB',
  in_progress: '#3B82F6',
  waiting: '#F59E0B',
  completed: '#22C55E',
  skipped: '#9CA3AF',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
}

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  not_obtained: '#D1D5DB',
  in_process: '#3B82F6',
  obtained: '#22C55E',
  expired: '#EF4444',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  residence: '#8B5CF6',
  municipal: '#3B82F6',
  insurance: '#10B981',
  daily_life: '#F59E0B',
  work: '#EF4444',
  education: '#EC4899',
}

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  residence: 'passport',
  municipal: 'building',
  insurance: 'shield',
  daily_life: 'home',
  work: 'briefcase',
  education: 'book',
}
