/**
 * Lark Calendar Integration Service
 *
 * NOTE: In production, API calls should be routed through a backend server
 * (AWS Lambda) to protect the App Secret. This client-side implementation
 * is for development/testing purposes.
 */

import type { ProjectEvent, LarkTokenResponse, LarkEventResponse } from '../types'
import { getLarkSettings, getAllLarkUserMappings, updateEventLarkSync } from '../db/database'

// Lark API Base URLs
// In development, use Vite proxy to avoid CORS issues
// In production, this should point to your AWS Lambda endpoint
const isDev = import.meta.env.DEV
const LARK_API_BASE = isDev ? '/lark-api' : 'https://open.larksuite.com/open-apis'

// Token cache
let tokenCache: {
  token: string
  expiresAt: number
} | null = null

/**
 * Get tenant access token from Lark
 */
async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  // Check cache
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  const response = await fetch(`${LARK_API_BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  })

  const data: LarkTokenResponse = await response.json()

  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Failed to get Lark token: ${data.msg}`)
  }

  // Cache token (expire 5 minutes before actual expiry)
  tokenCache = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + ((data.expire || 7200) - 300) * 1000,
  }

  return data.tenant_access_token
}

/**
 * Get primary calendar ID for the app
 */
async function getPrimaryCalendarId(token: string): Promise<string | null> {
  const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (data.code !== 0) {
    console.error('Failed to get calendars:', data.msg)
    return null
  }

  // Find the primary calendar or use the first one
  const calendars = data.data?.calendar_list || []
  const primaryCalendar = calendars.find((c: { type?: string }) => c.type === 'primary') || calendars[0]

  return primaryCalendar?.calendar_id || null
}

/**
 * Get user's primary calendar ID
 */
async function getUserPrimaryCalendarId(token: string, userId: string): Promise<string | null> {
  const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars/primary?user_id_type=open_id`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId,
    },
  })

  const data = await response.json()

  if (data.code !== 0) {
    console.error('Failed to get user primary calendar:', data.msg)
    return null
  }

  return data.data?.calendars?.[0]?.calendar?.calendar_id || null
}

/**
 * Get user ID from email address
 */
async function getUserIdByEmail(token: string, email: string): Promise<string | null> {
  const response = await fetch(`${LARK_API_BASE}/contact/v3/users/batch_get_id?user_id_type=open_id`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emails: [email],
    }),
  })

  const data = await response.json()

  if (data.code !== 0) {
    console.error('Failed to get user ID:', data.msg)
    return null
  }

  const userList = data.data?.user_list
  if (userList && userList.length > 0 && userList[0].user_id) {
    return userList[0].user_id
  }

  return null
}

/**
 * Create calendar event in Lark
 */
export async function createLarkEvent(
  event: ProjectEvent,
  projectName: string,
  countryName?: string
): Promise<{ success: boolean; larkEventId?: string; error?: string }> {
  try {
    const settings = await getLarkSettings()

    if (!settings?.enabled || !settings.appId || !settings.appSecret) {
      return { success: false, error: 'Lark連携が設定されていません' }
    }

    const token = await getTenantAccessToken(settings.appId, settings.appSecret)

    // Build event time
    const eventDate = new Date(event.date)
    const startTime = event.startTime || '10:00'
    const [startHour, startMin] = startTime.split(':').map(Number)
    eventDate.setHours(startHour, startMin, 0, 0)

    const endDate = new Date(eventDate)
    if (event.endTime) {
      const [endHour, endMin] = event.endTime.split(':').map(Number)
      endDate.setHours(endHour, endMin, 0, 0)
    } else {
      endDate.setMinutes(endDate.getMinutes() + settings.eventDurationMinutes)
    }

    // Get attendee user IDs
    const attendees: { type: string; user_id: string }[] = []
    if (event.participants) {
      const participantNames = event.participants.split(/[,、]/).map(p => p.trim()).filter(p => p)
      const mappings = await getAllLarkUserMappings()

      for (const name of participantNames) {
        const mapping = mappings.find(m => m.displayName === name)
        if (mapping) {
          let userId = mapping.larkUserId
          if (!userId && mapping.larkEmail) {
            userId = await getUserIdByEmail(token, mapping.larkEmail) || undefined
          }
          if (userId) {
            attendees.push({ type: 'user', user_id: userId })
          }
        }
      }
    }

    // Get calendar ID - try to use the owner's calendar first
    let calendarId: string | undefined = settings.defaultCalendarId
    const ownerEmail = 'kinebuchi@customercloud.ai'
    const ownerUserId = await getUserIdByEmail(token, ownerEmail)

    if (!calendarId && ownerUserId) {
      // Try to get owner's primary calendar
      const ownerCalendarId = await getUserPrimaryCalendarId(token, ownerUserId)
      if (ownerCalendarId) {
        calendarId = ownerCalendarId
        console.log('Using owner calendar:', calendarId)
      }
    }

    if (!calendarId) {
      // Fallback to app's primary calendar
      const primaryCalendarId = await getPrimaryCalendarId(token)
      if (!primaryCalendarId) {
        return { success: false, error: 'カレンダーが見つかりません。Lark設定でカレンダーIDを指定してください。' }
      }
      calendarId = primaryCalendarId
    }

    // Build event title with country name if available
    const titleParts: string[] = []
    if (countryName) titleParts.push(countryName)
    titleParts.push(projectName)
    titleParts.push(event.title)
    const eventSummary = titleParts.join(' / ')

    // Create event
    const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars/${calendarId}/events?user_id_type=open_id`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventSummary,
        description: event.description || '',
        start_time: {
          timestamp: Math.floor(eventDate.getTime() / 1000).toString(),
        },
        end_time: {
          timestamp: Math.floor(endDate.getTime() / 1000).toString(),
        },
        reminders: settings.reminderMinutes > 0 ? [{
          minutes: settings.reminderMinutes,
        }] : [],
      }),
    })

    const data: LarkEventResponse = await response.json()

    if (data.code !== 0 || !data.data?.event?.event_id) {
      throw new Error(data.msg || 'Failed to create event')
    }

    const larkEventId = data.data.event.event_id
    const larkCalendarId = data.data.event.organizer_calendar_id

    // Add attendees if any (owner is already the organizer, no need to add)
    if (attendees.length > 0) {
      await fetch(`${LARK_API_BASE}/calendar/v4/calendars/${calendarId}/events/${larkEventId}/attendees?user_id_type=open_id`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees,
          need_notification: true,
        }),
      })
    }

    // Update local event with Lark info
    await updateEventLarkSync(event.id, {
      larkEventId,
      larkCalendarId,
      larkSyncStatus: 'synced',
    })

    return { success: true, larkEventId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update local event with error
    await updateEventLarkSync(event.id, {
      larkSyncStatus: 'failed',
      larkSyncError: errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Update calendar event in Lark
 */
export async function updateLarkEvent(
  event: ProjectEvent,
  projectName: string,
  countryName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!event.larkEventId || !event.larkCalendarId) {
      return { success: false, error: 'Larkイベント情報がありません' }
    }

    const settings = await getLarkSettings()

    if (!settings?.enabled || !settings.appId || !settings.appSecret) {
      return { success: false, error: 'Lark連携が設定されていません' }
    }

    const token = await getTenantAccessToken(settings.appId, settings.appSecret)

    // Build event time
    const eventDate = new Date(event.date)
    const startTime = event.startTime || '10:00'
    const [startHour, startMin] = startTime.split(':').map(Number)
    eventDate.setHours(startHour, startMin, 0, 0)

    const endDate = new Date(eventDate)
    if (event.endTime) {
      const [endHour, endMin] = event.endTime.split(':').map(Number)
      endDate.setHours(endHour, endMin, 0, 0)
    } else {
      endDate.setMinutes(endDate.getMinutes() + settings.eventDurationMinutes)
    }

    // Build event title with country name if available
    const titleParts: string[] = []
    if (countryName) titleParts.push(countryName)
    titleParts.push(projectName)
    titleParts.push(event.title)
    const eventSummary = titleParts.join(' / ')

    const response = await fetch(
      `${LARK_API_BASE}/calendar/v4/calendars/${event.larkCalendarId}/events/${event.larkEventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: eventSummary,
          description: event.description || '',
          start_time: {
            timestamp: Math.floor(eventDate.getTime() / 1000).toString(),
          },
          end_time: {
            timestamp: Math.floor(endDate.getTime() / 1000).toString(),
          },
        }),
      }
    )

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to update event')
    }

    await updateEventLarkSync(event.id, {
      larkSyncStatus: 'synced',
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await updateEventLarkSync(event.id, {
      larkSyncStatus: 'failed',
      larkSyncError: errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Delete calendar event from Lark
 */
export async function deleteLarkEvent(
  event: ProjectEvent
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!event.larkEventId || !event.larkCalendarId) {
      return { success: true } // No Lark event to delete
    }

    const settings = await getLarkSettings()

    if (!settings?.enabled || !settings.appId || !settings.appSecret) {
      return { success: true } // Lark not enabled, nothing to delete
    }

    const token = await getTenantAccessToken(settings.appId, settings.appSecret)

    const response = await fetch(
      `${LARK_API_BASE}/calendar/v4/calendars/${event.larkCalendarId}/events/${event.larkEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (data.code !== 0 && data.code !== 81001) { // 81001 = event not found (already deleted)
      throw new Error(data.msg || 'Failed to delete event')
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Test Lark connection
 */
export async function testLarkConnection(
  appId: string,
  appSecret: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getTenantAccessToken(appId, appSecret)

    // Try to get calendar list to verify connection
    const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(data.msg || 'Failed to access calendar')
    }

    // Clear token cache to force refresh on next real call
    tokenCache = null

    return { success: true }
  } catch (error) {
    tokenCache = null
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Check if Lark sync is enabled
 */
export async function isLarkSyncEnabled(): Promise<boolean> {
  const settings = await getLarkSettings()
  return !!(settings?.enabled && settings.appId && settings.appSecret)
}
