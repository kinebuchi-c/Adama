/**
 * Data API Service
 * Handles CRUD operations with the cloud DynamoDB backend
 */

const API_BASE = 'https://i3udh8bl2l.execute-api.ap-northeast-1.amazonaws.com/prod/data'

type ResourceType =
  | 'projects'
  | 'projectEvents'
  | 'staffMembers'
  | 'organizations'
  | 'externalContacts'
  | 'projectLinks'
  | 'settings'

async function apiRequest<T>(
  resource: ResourceType,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  id?: string,
  body?: unknown
): Promise<T> {
  const url = id ? `${API_BASE}/${resource}/${id}` : `${API_BASE}/${resource}`

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API error: ${response.status}`)
  }

  // DELETE returns empty body or simple success
  if (method === 'DELETE') {
    return {} as T
  }

  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text)
}

// Generic CRUD operations
export async function getAll<T>(resource: ResourceType): Promise<T[]> {
  return apiRequest<T[]>(resource, 'GET')
}

export async function getOne<T>(resource: ResourceType, id: string): Promise<T> {
  return apiRequest<T>(resource, 'GET', id)
}

export async function create<T>(resource: ResourceType, data: Partial<T>): Promise<T> {
  return apiRequest<T>(resource, 'POST', undefined, data)
}

export async function update<T>(resource: ResourceType, id: string, data: Partial<T>): Promise<T> {
  return apiRequest<T>(resource, 'PUT', id, data)
}

export async function remove(resource: ResourceType, id: string): Promise<void> {
  await apiRequest(resource, 'DELETE', id)
}

