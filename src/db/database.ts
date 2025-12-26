import Dexie, { type Table } from 'dexie'
import type { Project, BaobabGrowth, ProjectEvent, CountryContact, LarkSettings, LarkUserMapping } from '../types'
import type {
  SuginamiUserProfile,
  SuginamiTask,
  SuginamiDocument,
  LanguagePreference,
} from '../types/suginami'

export class BaobabDatabase extends Dexie {
  projects!: Table<Project>
  projectEvents!: Table<ProjectEvent>
  baobabGrowth!: Table<BaobabGrowth>
  countryContacts!: Table<CountryContact>
  larkSettings!: Table<LarkSettings>
  larkUserMappings!: Table<LarkUserMapping>
  suginamiUserProfile!: Table<SuginamiUserProfile>
  suginamiTasks!: Table<SuginamiTask>
  suginamiDocuments!: Table<SuginamiDocument>
  languagePreference!: Table<LanguagePreference>

  constructor() {
    super('BaobabWorldMap')

    this.version(1).stores({
      projects: 'id, countryCode, status, createdAt, updatedAt',
      baobabGrowth: 'id',
    })

    this.version(2).stores({
      projects: 'id, countryCode, status, createdAt, updatedAt',
      baobabGrowth: 'id',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    })

    // v3: 外交フェーズと新ステータス追加
    this.version(3).stores({
      projects: 'id, countryCode, status, diplomacyPhase, createdAt, updatedAt',
      baobabGrowth: 'id',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    }).upgrade(tx => {
      // 既存プロジェクトのマイグレーション
      return tx.table('projects').toCollection().modify(project => {
        // 外交フェーズのデフォルト値を設定
        if (project.diplomacyPhase === undefined) {
          project.diplomacyPhase = 0
        }
        // 旧ステータスから新ステータスへの変換
        if (project.status === 'planning' || project.status === 'review') {
          project.status = 'preparing'
        }
      })
    })

    // v4: プロジェクトイベント（ヒストリー）追加
    this.version(4).stores({
      projects: 'id, countryCode, status, diplomacyPhase, createdAt, updatedAt',
      projectEvents: 'id, projectId, date, createdAt',
      baobabGrowth: 'id',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    })

    // v5: イベントにeventType（完了/予定）追加
    this.version(5).stores({
      projects: 'id, countryCode, status, diplomacyPhase, createdAt, updatedAt',
      projectEvents: 'id, projectId, date, eventType, createdAt',
      baobabGrowth: 'id',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    }).upgrade(tx => {
      // 既存イベントはすべてcompleted（完了済み）に設定
      return tx.table('projectEvents').toCollection().modify(event => {
        if (event.eventType === undefined) {
          event.eventType = 'completed'
        }
      })
    })

    // v6: 国の連絡先情報テーブル追加
    this.version(6).stores({
      projects: 'id, countryCode, status, diplomacyPhase, createdAt, updatedAt',
      projectEvents: 'id, projectId, date, eventType, createdAt',
      baobabGrowth: 'id',
      countryContacts: 'id, countryCode, updatedAt',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    })

    // v7: Lark連携テーブル追加
    this.version(7).stores({
      projects: 'id, countryCode, status, diplomacyPhase, createdAt, updatedAt',
      projectEvents: 'id, projectId, date, eventType, larkSyncStatus, createdAt',
      baobabGrowth: 'id',
      countryContacts: 'id, countryCode, updatedAt',
      larkSettings: 'id',
      larkUserMappings: 'id, displayName, larkEmail',
      suginamiUserProfile: 'id',
      suginamiTasks: 'id, templateId, category, status, priority, order',
      suginamiDocuments: 'id, type, status, linkedTaskId',
      languagePreference: 'id',
    })
  }
}

export const db = new BaobabDatabase()

// 初期データ投入（初回のみ）
export async function initializeDatabase() {
  const growthCount = await db.baobabGrowth.count()

  if (growthCount === 0) {
    await db.baobabGrowth.add({
      id: 'main',
      totalPoints: 0,
      level: 1,
      completedTrees: 0,
      lastActivity: new Date(),
    })
  } else {
    // 既存データにcompletedTreesがない場合は追加
    const growth = await db.baobabGrowth.get('main')
    if (growth && growth.completedTrees === undefined) {
      await db.baobabGrowth.update('main', { completedTrees: 0 })
    }
  }
}

// プロジェクトヘルパー関数
export async function getProjectsByCountry(countryCode: string): Promise<Project[]> {
  return db.projects.where('countryCode').equals(countryCode).toArray()
}

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.toArray()
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date()
  const id = crypto.randomUUID()

  await db.projects.add({
    ...project,
    diplomacyPhase: project.diplomacyPhase ?? 0,
    id,
    createdAt: now,
    updatedAt: now,
  })

  return id
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  await db.projects.update(id, {
    ...updates,
    updatedAt: new Date(),
  })
}

export async function deleteProject(id: string): Promise<void> {
  // プロジェクトとそのイベントを削除
  await db.projectEvents.where('projectId').equals(id).delete()
  await db.projects.delete(id)
}

// プロジェクトイベントヘルパー関数
export async function getProjectEvents(projectId: string): Promise<ProjectEvent[]> {
  return db.projectEvents.where('projectId').equals(projectId).sortBy('date')
}

export async function addProjectEvent(
  event: Omit<ProjectEvent, 'id' | 'createdAt'>
): Promise<ProjectEvent> {
  const now = new Date()
  const id = crypto.randomUUID()

  const newEvent: ProjectEvent = {
    ...event,
    id,
    createdAt: now,
  }

  await db.projectEvents.add(newEvent)

  return newEvent
}

export async function updateProjectEvent(
  id: string,
  updates: Partial<ProjectEvent>
): Promise<ProjectEvent | undefined> {
  await db.projectEvents.update(id, updates)
  return db.projectEvents.get(id)
}

export async function deleteProjectEvent(id: string): Promise<void> {
  await db.projectEvents.delete(id)
}

// ニーム成長ヘルパー関数 (旧バオバブ - データベース互換性のためbaobabGrowthテーブルを使用)
export async function getNeemGrowth(): Promise<BaobabGrowth | undefined> {
  return db.baobabGrowth.get('main')
}

// 後方互換性のためのエイリアス
export const getBaobabGrowth = getNeemGrowth

export async function addGrowthPoints(points: number): Promise<BaobabGrowth> {
  const growth = await getBaobabGrowth()

  if (!growth) {
    throw new Error('Baobab growth data not initialized')
  }

  const newTotalPoints = growth.totalPoints + points
  const newLevel = calculateLevel(newTotalPoints)

  await db.baobabGrowth.update('main', {
    totalPoints: newTotalPoints,
    level: newLevel,
    lastActivity: new Date(),
  })

  return {
    ...growth,
    totalPoints: newTotalPoints,
    level: newLevel,
    lastActivity: new Date(),
  }
}

function calculateLevel(points: number): number {
  const levels = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500]

  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i]) {
      return i + 1
    }
  }

  return 1
}

// 新しい木を植える（レベル10到達後）
export async function plantNewTree(): Promise<BaobabGrowth> {
  const growth = await getBaobabGrowth()

  if (!growth) {
    throw new Error('Baobab growth data not initialized')
  }

  if (growth.level < 10) {
    throw new Error('Tree has not reached max level yet')
  }

  const newCompletedTrees = (growth.completedTrees || 0) + 1

  await db.baobabGrowth.update('main', {
    totalPoints: 0,
    level: 1,
    completedTrees: newCompletedTrees,
    lastActivity: new Date(),
  })

  return {
    ...growth,
    totalPoints: 0,
    level: 1,
    completedTrees: newCompletedTrees,
    lastActivity: new Date(),
  }
}

// ===== Suginami Helper Functions =====

// User Profile
export async function getSuginamiUserProfile(): Promise<SuginamiUserProfile | undefined> {
  return db.suginamiUserProfile.get('main')
}

export async function saveSuginamiUserProfile(
  profile: Omit<SuginamiUserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const now = new Date()
  const existing = await getSuginamiUserProfile()

  if (existing) {
    await db.suginamiUserProfile.update('main', {
      ...profile,
      updatedAt: now,
    })
  } else {
    await db.suginamiUserProfile.add({
      ...profile,
      id: 'main',
      createdAt: now,
      updatedAt: now,
    })
  }
}

export async function updateSuginamiUserProfile(
  updates: Partial<SuginamiUserProfile>
): Promise<void> {
  await db.suginamiUserProfile.update('main', {
    ...updates,
    updatedAt: new Date(),
  })
}

// Tasks
export async function getAllSuginamiTasks(): Promise<SuginamiTask[]> {
  return db.suginamiTasks.orderBy('order').toArray()
}

export async function getSuginamiTasksByCategory(
  category: SuginamiTask['category']
): Promise<SuginamiTask[]> {
  return db.suginamiTasks.where('category').equals(category).toArray()
}

export async function getSuginamiTasksByStatus(
  status: SuginamiTask['status']
): Promise<SuginamiTask[]> {
  return db.suginamiTasks.where('status').equals(status).toArray()
}

export async function addSuginamiTask(
  task: Omit<SuginamiTask, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date()
  const id = crypto.randomUUID()

  await db.suginamiTasks.add({
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
  })

  return id
}

export async function updateSuginamiTask(
  id: string,
  updates: Partial<SuginamiTask>
): Promise<void> {
  await db.suginamiTasks.update(id, {
    ...updates,
    updatedAt: new Date(),
  })
}

export async function deleteSuginamiTask(id: string): Promise<void> {
  await db.suginamiTasks.delete(id)
}

export async function clearAllSuginamiTasks(): Promise<void> {
  await db.suginamiTasks.clear()
}

// Documents
export async function getAllSuginamiDocuments(): Promise<SuginamiDocument[]> {
  return db.suginamiDocuments.toArray()
}

export async function getSuginamiDocumentsByStatus(
  status: SuginamiDocument['status']
): Promise<SuginamiDocument[]> {
  return db.suginamiDocuments.where('status').equals(status).toArray()
}

export async function addSuginamiDocument(
  document: Omit<SuginamiDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date()
  const id = crypto.randomUUID()

  await db.suginamiDocuments.add({
    ...document,
    id,
    createdAt: now,
    updatedAt: now,
  })

  return id
}

export async function updateSuginamiDocument(
  id: string,
  updates: Partial<SuginamiDocument>
): Promise<void> {
  await db.suginamiDocuments.update(id, {
    ...updates,
    updatedAt: new Date(),
  })
}

export async function deleteSuginamiDocument(id: string): Promise<void> {
  await db.suginamiDocuments.delete(id)
}

export async function clearAllSuginamiDocuments(): Promise<void> {
  await db.suginamiDocuments.clear()
}

// Language Preference
export async function getLanguagePreference(): Promise<LanguagePreference | undefined> {
  return db.languagePreference.get('main')
}

export async function saveLanguagePreference(
  language: LanguagePreference['language']
): Promise<void> {
  const now = new Date()
  const existing = await getLanguagePreference()

  if (existing) {
    await db.languagePreference.update('main', {
      language,
      updatedAt: now,
    })
  } else {
    await db.languagePreference.add({
      id: 'main',
      language,
      updatedAt: now,
    })
  }
}

// ===== Lark連携ヘルパー関数 =====

// Lark設定
export async function getLarkSettings(): Promise<LarkSettings | undefined> {
  return db.larkSettings.get('main')
}

export async function saveLarkSettings(
  settings: Omit<LarkSettings, 'id' | 'updatedAt'>
): Promise<void> {
  const now = new Date()
  const existing = await getLarkSettings()

  if (existing) {
    await db.larkSettings.update('main', {
      ...settings,
      updatedAt: now,
    })
  } else {
    await db.larkSettings.add({
      ...settings,
      id: 'main',
      updatedAt: now,
    })
  }
}

export async function initializeLarkSettings(): Promise<LarkSettings> {
  const existing = await getLarkSettings()
  if (existing) return existing

  const defaultSettings: LarkSettings = {
    id: 'main',
    enabled: false,
    autoSync: true,
    eventDurationMinutes: 60,
    reminderMinutes: 30,
    useOAuth: false,
    updatedAt: new Date(),
  }

  await db.larkSettings.add(defaultSettings)
  return defaultSettings
}

// Larkユーザーマッピング
export async function getAllLarkUserMappings(): Promise<LarkUserMapping[]> {
  return db.larkUserMappings.toArray()
}

export async function getLarkUserMappingByName(displayName: string): Promise<LarkUserMapping | undefined> {
  return db.larkUserMappings.where('displayName').equals(displayName).first()
}

export async function addLarkUserMapping(
  mapping: Omit<LarkUserMapping, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date()
  const id = crypto.randomUUID()

  await db.larkUserMappings.add({
    ...mapping,
    id,
    createdAt: now,
    updatedAt: now,
  })

  return id
}

export async function updateLarkUserMapping(
  id: string,
  updates: Partial<LarkUserMapping>
): Promise<void> {
  await db.larkUserMappings.update(id, {
    ...updates,
    updatedAt: new Date(),
  })
}

export async function deleteLarkUserMapping(id: string): Promise<void> {
  await db.larkUserMappings.delete(id)
}

// イベントのLark同期ステータス更新
export async function updateEventLarkSync(
  eventId: string,
  syncData: {
    larkEventId?: string
    larkCalendarId?: string
    larkSyncStatus: 'pending' | 'synced' | 'failed' | 'not_synced'
    larkSyncError?: string
  }
): Promise<void> {
  await db.projectEvents.update(eventId, {
    ...syncData,
    larkLastSyncAt: new Date(),
  })
}
