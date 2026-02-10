/**
 * Cloud Database Module
 * Provides the same interface as local database but uses cloud API
 */

import type { Project, ProjectEvent, StaffMember, Organization, ExternalContact, ProjectLink, LarkSettings } from '../types'
import * as api from '../services/dataApi'

// ===== Projects =====

export async function getAllProjects(): Promise<Project[]> {
  const items = await api.getAll<Project>('projects')
  // Convert date strings to Date objects
  return items.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }))
}

export async function getProjectsByCountry(countryCode: string): Promise<Project[]> {
  const projects = await getAllProjects()
  return projects.filter(p => p.countryCode === countryCode)
}

export async function addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const result = await api.create<Project>('projects', {
    ...project,
    diplomacyPhase: project.diplomacyPhase ?? 0,
  })
  return result.id
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  await api.update('projects', id, updates)
}

export async function deleteProject(id: string): Promise<void> {
  // Delete all project links and events first
  await deleteAllProjectLinks(id)
  const events = await getProjectEvents(id)
  for (const event of events) {
    await deleteProjectEvent(event.id)
  }
  await api.remove('projects', id)
}

// ===== Project Events =====

export async function getAllProjectEvents(): Promise<ProjectEvent[]> {
  const items = await api.getAll<ProjectEvent>('projectEvents')
  return items.map(e => ({
    ...e,
    date: new Date(e.date),
    createdAt: new Date(e.createdAt),
    larkLastSyncAt: e.larkLastSyncAt ? new Date(e.larkLastSyncAt) : undefined,
  }))
}

export async function getProjectEvents(projectId: string): Promise<ProjectEvent[]> {
  const events = await getAllProjectEvents()
  return events
    .filter(e => e.projectId === projectId)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export async function addProjectEvent(
  event: Omit<ProjectEvent, 'id' | 'createdAt'>
): Promise<ProjectEvent> {
  const result = await api.create<ProjectEvent>('projectEvents', event)
  return {
    ...result,
    date: new Date(result.date),
    createdAt: new Date(result.createdAt),
  }
}

export async function updateProjectEvent(
  id: string,
  updates: Partial<ProjectEvent>
): Promise<ProjectEvent | undefined> {
  const result = await api.update<ProjectEvent>('projectEvents', id, updates)
  return {
    ...result,
    date: new Date(result.date),
    createdAt: new Date(result.createdAt),
  }
}

export async function deleteProjectEvent(id: string): Promise<void> {
  await api.remove('projectEvents', id)
}

export async function updateEventLarkSync(
  eventId: string,
  syncData: {
    larkEventId?: string
    larkCalendarId?: string
    larkSyncStatus: 'pending' | 'synced' | 'failed' | 'not_synced'
    larkSyncError?: string
  }
): Promise<void> {
  await api.update('projectEvents', eventId, {
    ...syncData,
    larkLastSyncAt: new Date().toISOString(),
  })
}

// ===== Staff Members =====

export async function getAllStaffMembers(): Promise<StaffMember[]> {
  const items = await api.getAll<StaffMember>('staffMembers')
  return items
    .filter(s => s.isActive !== false)
    .map(s => ({
      ...s,
      createdAt: new Date(s.createdAt),
    }))
}

export async function getAllStaffMembersIncludeInactive(): Promise<StaffMember[]> {
  const items = await api.getAll<StaffMember>('staffMembers')
  return items.map(s => ({
    ...s,
    createdAt: new Date(s.createdAt),
  }))
}

export async function getStaffMember(id: string): Promise<StaffMember | undefined> {
  try {
    const item = await api.getOne<StaffMember>('staffMembers', id)
    return {
      ...item,
      createdAt: new Date(item.createdAt),
    }
  } catch {
    return undefined
  }
}

export async function addStaffMember(
  staff: Omit<StaffMember, 'id' | 'createdAt'>
): Promise<string> {
  const result = await api.create<StaffMember>('staffMembers', staff)
  return result.id
}

export async function updateStaffMember(
  id: string,
  updates: Partial<StaffMember>
): Promise<void> {
  await api.update('staffMembers', id, updates)
}

export async function deleteStaffMember(id: string): Promise<void> {
  await api.update('staffMembers', id, { isActive: false })
}

// ===== Organizations =====

export async function getAllOrganizations(): Promise<Organization[]> {
  const items = await api.getAll<Organization>('organizations')
  return items
    .filter(o => o.isActive !== false)
    .map(o => ({
      ...o,
      createdAt: new Date(o.createdAt),
    }))
}

export async function getAllOrganizationsIncludeInactive(): Promise<Organization[]> {
  const items = await api.getAll<Organization>('organizations')
  return items.map(o => ({
    ...o,
    createdAt: new Date(o.createdAt),
  }))
}

export async function getOrganization(id: string): Promise<Organization | undefined> {
  try {
    const item = await api.getOne<Organization>('organizations', id)
    return {
      ...item,
      createdAt: new Date(item.createdAt),
    }
  } catch {
    return undefined
  }
}

export async function getOrganizationsByType(type: Organization['type']): Promise<Organization[]> {
  const orgs = await getAllOrganizations()
  return orgs.filter(o => o.type === type)
}

export async function addOrganization(
  org: Omit<Organization, 'id' | 'createdAt'>
): Promise<string> {
  const result = await api.create<Organization>('organizations', org)
  return result.id
}

export async function updateOrganization(
  id: string,
  updates: Partial<Organization>
): Promise<void> {
  await api.update('organizations', id, updates)
}

export async function deleteOrganization(id: string): Promise<void> {
  await api.update('organizations', id, { isActive: false })
}

// ===== External Contacts =====

export async function getAllExternalContacts(): Promise<ExternalContact[]> {
  const items = await api.getAll<ExternalContact>('externalContacts')
  return items
    .filter(c => c.isActive !== false)
    .map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }))
}

export async function getAllExternalContactsIncludeInactive(): Promise<ExternalContact[]> {
  const items = await api.getAll<ExternalContact>('externalContacts')
  return items.map(c => ({
    ...c,
    createdAt: new Date(c.createdAt),
  }))
}

export async function getExternalContact(id: string): Promise<ExternalContact | undefined> {
  try {
    const item = await api.getOne<ExternalContact>('externalContacts', id)
    return {
      ...item,
      createdAt: new Date(item.createdAt),
    }
  } catch {
    return undefined
  }
}

export async function getExternalContactsByOrganization(orgId: string): Promise<ExternalContact[]> {
  const contacts = await getAllExternalContacts()
  return contacts.filter(c => c.organizationId === orgId)
}

export async function addExternalContact(
  contact: Omit<ExternalContact, 'id' | 'createdAt'>
): Promise<string> {
  const result = await api.create<ExternalContact>('externalContacts', contact)
  return result.id
}

export async function updateExternalContact(
  id: string,
  updates: Partial<ExternalContact>
): Promise<void> {
  await api.update('externalContacts', id, updates)
}

export async function deleteExternalContact(id: string): Promise<void> {
  await api.update('externalContacts', id, { isActive: false })
}

// ===== Project Links =====

export async function getAllProjectLinks(): Promise<ProjectLink[]> {
  const items = await api.getAll<ProjectLink>('projectLinks')
  return items.map(l => ({
    ...l,
    createdAt: new Date(l.createdAt),
  }))
}

export async function getProjectLinks(projectId: string): Promise<ProjectLink[]> {
  const links = await getAllProjectLinks()
  return links.filter(l => l.projectId === projectId)
}

export async function addProjectLink(
  link: Omit<ProjectLink, 'id' | 'createdAt'>
): Promise<string> {
  const result = await api.create<ProjectLink>('projectLinks', link)
  return result.id
}

export async function updateProjectLink(
  id: string,
  updates: Partial<ProjectLink>
): Promise<void> {
  await api.update('projectLinks', id, updates)
}

export async function deleteProjectLink(id: string): Promise<void> {
  await api.remove('projectLinks', id)
}

export async function deleteAllProjectLinks(projectId: string): Promise<void> {
  const links = await getProjectLinks(projectId)
  for (const link of links) {
    await deleteProjectLink(link.id)
  }
}

// ===== Lark Settings (Cloud Sync) =====

export async function getLarkSettings(): Promise<LarkSettings | undefined> {
  try {
    const items = await api.getAll<LarkSettings>('settings')
    const settings = items.find(s => s.id === 'main' || s.id === 'lark')
    if (settings) {
      return {
        ...settings,
        updatedAt: new Date(settings.updatedAt),
      }
    }
    return undefined
  } catch {
    return undefined
  }
}

export async function saveLarkSettings(
  settings: Omit<LarkSettings, 'id' | 'updatedAt'>
): Promise<void> {
  const existing = await getLarkSettings()
  if (existing) {
    await api.update('settings', existing.id, settings)
  } else {
    await api.create('settings', {
      ...settings,
      id: 'main',
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

  await api.create('settings', defaultSettings)
  return defaultSettings
}
