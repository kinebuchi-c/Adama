/**
 * Lark Calendar Integration Service
 *
 * Supports two authentication modes:
 * 1. Tenant Access Token (app-level) - events owned by app
 * 2. User Access Token (OAuth) - events owned by user (editable)
 */

import type { ProjectEvent, LarkTokenResponse, LarkEventResponse } from '../types'
import { getLarkSettings, updateEventLarkSync } from '../db/database'
import { getValidUserToken } from './larkOAuth'

// API URLs
// In development, use Vite proxy to avoid CORS issues
// In production, use AWS Lambda proxy
const isDev = import.meta.env.DEV
const API_URL = import.meta.env.VITE_API_URL || ''
const LARK_API_BASE = isDev ? '/lark-api' : `${API_URL}/calendar-proxy`

// Token cache for tenant access token
let tokenCache: {
  token: string
  expiresAt: number
} | null = null

/**
 * Get appropriate access token based on settings
 * Prefers user token if OAuth is enabled and available
 */
export async function getAccessToken(): Promise<{ token: string; isUserToken: boolean }> {
  const settings = await getLarkSettings()

  if (!settings?.appId || !settings?.appSecret) {
    throw new Error('Lark API credentials not configured')
  }

  console.log('getAccessToken: useOAuth=', settings.useOAuth)
  console.log('getAccessToken: userAccessToken exists=', !!settings.userAccessToken)

  // Try user token first if OAuth is enabled
  if (settings.useOAuth) {
    const userToken = await getValidUserToken()
    console.log('getAccessToken: userToken=', userToken ? userToken.substring(0, 20) + '...' : 'null')
    if (userToken) {
      return { token: userToken, isUserToken: true }
    }
  }

  // Fall back to tenant access token
  const tenantToken = await getTenantAccessToken(settings.appId, settings.appSecret)
  return { token: tenantToken, isUserToken: false }
}

/**
 * Get tenant access token from Lark
 * In production, this is handled by Lambda proxy, so we return a placeholder
 */
async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  // In production, Lambda handles token acquisition
  if (!isDev) {
    // Return a placeholder - Lambda will get the real token
    return 'LAMBDA_PROXY'
  }

  // Check cache (development only)
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

  if (!response.ok) {
    const text = await response.text()
    console.error('Token API error:', response.status, text)
    throw new Error(`Token API error: ${response.status}`)
  }

  const text = await response.text()
  let data: LarkTokenResponse
  try {
    data = JSON.parse(text)
  } catch (e) {
    console.error('Failed to parse token response:', text.substring(0, 200))
    throw new Error(`Invalid token response`)
  }

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
async function getPrimaryCalendarId(token: string, appId?: string, appSecret?: string): Promise<string | null> {
  const headers: Record<string, string> = {}

  if (token !== 'LAMBDA_PROXY') {
    headers['Authorization'] = `Bearer ${token}`
  }

  // In production, we need to pass credentials via POST body
  let url = `${LARK_API_BASE}/calendar/v4/calendars`
  let options: RequestInit = {
    method: 'GET',
    headers,
  }

  // For Lambda proxy, use POST with credentials in body
  if (!isDev && appId && appSecret) {
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
        _method: 'GET', // Tell Lambda this is actually a GET request
      }),
    }
  }

  const response = await fetch(url, options)

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
 * Get all calendars accessible by the app
 */
export interface LarkCalendar {
  calendar_id: string
  summary: string
  type: string
  role: string
}

export async function getCalendarList(
  appId: string,
  appSecret: string
): Promise<{ success: boolean; calendars?: LarkCalendar[]; error?: string }> {
  try {
    const token = await getTenantAccessToken(appId, appSecret)

    const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()

    if (data.code !== 0) {
      return { success: false, error: data.msg || 'Failed to get calendars' }
    }

    const calendars: LarkCalendar[] = (data.data?.calendar_list || []).map((c: {
      calendar_id: string
      summary?: string
      type?: string
      role?: string
    }) => ({
      calendar_id: c.calendar_id,
      summary: c.summary || '(名前なし)',
      type: c.type || 'unknown',
      role: c.role || 'unknown',
    }))

    return { success: true, calendars }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Create calendar event in Lark
 *
 * Strategy: Always use tenant token to create events on app's calendar.
 * If user is logged in via OAuth, add them as an attendee so they receive
 * calendar invitations and can see/edit the event.
 */
export async function createLarkEvent(
  event: ProjectEvent,
  projectName: string,
  countryName?: string
): Promise<{ success: boolean; larkEventId?: string; error?: string }> {
  console.log('=== createLarkEvent START ===')
  console.log('isDev:', isDev)
  console.log('API_URL:', API_URL)
  console.log('LARK_API_BASE:', LARK_API_BASE)

  try {
    const settings = await getLarkSettings()
    console.log('settings.enabled:', settings?.enabled)
    console.log('settings.appId:', settings?.appId?.substring(0, 10) + '...')

    if (!settings?.enabled || !settings.appId || !settings.appSecret) {
      console.log('Lark not configured, returning early')
      return { success: false, error: 'Lark連携が設定されていません' }
    }

    // Always use tenant token for event creation
    // User token requires calendar permissions which may not be granted
    const token = isDev
      ? await getTenantAccessToken(settings.appId, settings.appSecret)
      : 'LAMBDA_PROXY'

    console.log('Creating event with tenant token')
    console.log('User logged in:', !!settings.userOpenId)

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

    // Get calendar ID - use shared calendar or app's primary calendar
    let calendarId = settings.defaultCalendarId
    if (!calendarId) {
      const primaryCalendarId = await getPrimaryCalendarId(token, settings.appId, settings.appSecret)
      if (!primaryCalendarId) {
        return { success: false, error: 'カレンダーが見つかりません。Lark設定で共有カレンダーIDを指定してください。' }
      }
      calendarId = primaryCalendarId
    }
    console.log('Using calendar:', calendarId)

    // Build event title with country name if available
    const titleParts: string[] = []
    if (countryName) titleParts.push(countryName)
    titleParts.push(projectName)
    titleParts.push(event.title)
    const eventSummary = titleParts.join(' / ')

    // Build request body (attendees will be added via separate API call)
    const requestBody: Record<string, unknown> = {
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
      // Allow attendees to fully modify event
      attendee_ability: 'can_modify_event',
      visibility: 'default',
    }

    // In production, include credentials for Lambda proxy
    if (!isDev) {
      requestBody.app_id = settings.appId
      requestBody.app_secret = settings.appSecret
    }

    // Create event
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (isDev) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const apiUrl = `${LARK_API_BASE}/calendar/v4/calendars/${calendarId}/events?user_id_type=open_id`
    console.log('Making request to:', apiUrl)
    console.log('Request body keys:', Object.keys(requestBody))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })
    console.log('Response status:', response.status)

    // Check if response is OK
    if (!response.ok) {
      const text = await response.text()
      console.error('Lark API error response:', response.status, text)
      throw new Error(`API error: ${response.status} - ${text.substring(0, 100)}`)
    }

    const text = await response.text()
    let data: LarkEventResponse
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse Lark response:', text.substring(0, 200))
      throw new Error(`Invalid JSON response: ${text.substring(0, 50)}`)
    }

    if (data.code !== 0 || !data.data?.event?.event_id) {
      throw new Error(data.msg || 'Failed to create event')
    }

    const larkEventId = data.data.event.event_id
    const larkCalendarId = data.data.event.organizer_calendar_id

    // Add attendee via separate API call if user is logged in
    if (settings.userOpenId) {
      console.log('Adding attendee via separate API call...')
      const attendeeBody: Record<string, unknown> = {
        attendees: [{
          type: 'user',
          user_id: settings.userOpenId,
          is_optional: false,
        }],
        need_notification: true,
      }

      if (!isDev) {
        attendeeBody.app_id = settings.appId
        attendeeBody.app_secret = settings.appSecret
      }

      const attendeeResponse = await fetch(
        `${LARK_API_BASE}/calendar/v4/calendars/${larkCalendarId}/events/${larkEventId}/attendees?user_id_type=open_id`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(attendeeBody),
        }
      )

      const attendeeText = await attendeeResponse.text()
      console.log('Attendee API response:', attendeeText)

      try {
        const attendeeData = JSON.parse(attendeeText)
        if (attendeeData.code !== 0) {
          console.error('Failed to add attendee:', attendeeData.msg)
        }
      } catch (e) {
        console.error('Failed to parse attendee response:', attendeeText)
      }
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
    // In production, use Lambda proxy with credentials in body
    if (!isDev) {
      const response = await fetch(`${LARK_API_BASE}/calendar/v4/calendars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
          _method: 'GET', // Tell Lambda this is actually a GET request
        }),
      })

      const data = await response.json()

      if (data.code !== 0) {
        throw new Error(data.msg || 'Failed to access calendar')
      }

      return { success: true }
    }

    // In development, get token directly and make request
    const token = await getTenantAccessToken(appId, appSecret)

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
