import Dexie, { type Table } from 'dexie'
import type { Project, BaobabGrowth } from '../types'

export class BaobabDatabase extends Dexie {
  projects!: Table<Project>
  baobabGrowth!: Table<BaobabGrowth>

  constructor() {
    super('BaobabWorldMap')

    this.version(1).stores({
      projects: 'id, countryCode, status, createdAt, updatedAt',
      baobabGrowth: 'id',
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
      lastActivity: new Date(),
    })
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
  await db.projects.delete(id)
}

// バオバブヘルパー関数
export async function getBaobabGrowth(): Promise<BaobabGrowth | undefined> {
  return db.baobabGrowth.get('main')
}

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
