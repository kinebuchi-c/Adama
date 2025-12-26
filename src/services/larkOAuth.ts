/**
 * Lark OAuth Authentication Service
 * Handles user authentication via OAuth 2.0
 */

import { getLarkSettings, saveLarkSettings } from '../db/database'

// API URL - set in environment or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || ''

export interface LarkUserToken {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at: number // timestamp when token expires
  open_id: string
  union_id?: string
  user_id?: string
  name?: string
  email?: string
}

/**
 * Generate OAuth authorization URL
 */
export function getOAuthAuthorizationUrl(appId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    state: state || crypto.randomUUID(),
  })

  return `https://open.larksuite.com/open-apis/authen/v1/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for user access token
 */
export async function exchangeCodeForToken(
  appId: string,
  appSecret: string,
  code: string
): Promise<{ success: boolean; token?: LarkUserToken; error?: string }> {
  try {
    console.log('exchangeCodeForToken: calling', `${API_URL}/oauth/token`)
    const response = await fetch(`${API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
        code,
      }),
    })

    console.log('exchangeCodeForToken: response status', response.status)
    const data = await response.json()
    console.log('exchangeCodeForToken: response data', JSON.stringify(data))

    // Check for error response from Lambda
    if (data.error) {
      return { success: false, error: data.error }
    }

    if (data.code === 0 && data.data) {
      const tokenData = data.data
      const token: LarkUserToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in - 300) * 1000, // 5 min buffer
        open_id: tokenData.open_id,
        union_id: tokenData.union_id,
        name: tokenData.name,
        email: tokenData.email,
      }

      return { success: true, token }
    }

    return { success: false, error: data.msg || data.error || 'Failed to exchange code' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Refresh user access token
 */
export async function refreshUserToken(
  appId: string,
  appSecret: string,
  refreshToken: string
): Promise<{ success: boolean; token?: LarkUserToken; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/oauth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
        refresh_token: refreshToken,
      }),
    })

    const data = await response.json()

    if (data.code === 0 && data.data) {
      const tokenData = data.data
      const token: LarkUserToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in - 300) * 1000,
        open_id: tokenData.open_id,
        union_id: tokenData.union_id,
        name: tokenData.name,
        email: tokenData.email,
      }

      return { success: true, token }
    }

    return { success: false, error: data.msg || data.error || 'Failed to refresh token' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Get valid user access token (refresh if needed)
 */
export async function getValidUserToken(): Promise<string | null> {
  const settings = await getLarkSettings()

  if (!settings?.userAccessToken) {
    return null
  }

  // Check if token is still valid
  if (settings.userTokenExpiresAt && settings.userTokenExpiresAt > Date.now()) {
    return settings.userAccessToken
  }

  // Token expired, try to refresh
  if (settings.userRefreshToken && settings.appId && settings.appSecret) {
    const result = await refreshUserToken(
      settings.appId,
      settings.appSecret,
      settings.userRefreshToken
    )

    if (result.success && result.token) {
      // Save new token
      await saveLarkSettings({
        ...settings,
        userAccessToken: result.token.access_token,
        userRefreshToken: result.token.refresh_token,
        userTokenExpiresAt: result.token.expires_at,
      })

      return result.token.access_token
    }
  }

  // Could not get valid token
  return null
}

/**
 * Check if user is authenticated with Lark
 */
export async function isUserAuthenticated(): Promise<boolean> {
  const token = await getValidUserToken()
  return token !== null
}

/**
 * Clear user authentication
 */
export async function clearUserAuth(): Promise<void> {
  const settings = await getLarkSettings()
  if (settings) {
    await saveLarkSettings({
      ...settings,
      userAccessToken: undefined,
      userRefreshToken: undefined,
      userTokenExpiresAt: undefined,
      userOpenId: undefined,
      userName: undefined,
    })
  }
}

/**
 * Save user token after OAuth callback
 */
export async function saveUserToken(token: LarkUserToken): Promise<void> {
  const settings = await getLarkSettings()
  if (settings) {
    await saveLarkSettings({
      ...settings,
      userAccessToken: token.access_token,
      userRefreshToken: token.refresh_token,
      userTokenExpiresAt: token.expires_at,
      userOpenId: token.open_id,
      userName: token.name,
      useOAuth: true, // Enable OAuth mode when user logs in
    })
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<{ name?: string; openId?: string } | null> {
  const settings = await getLarkSettings()
  if (settings?.userOpenId) {
    return {
      name: settings.userName,
      openId: settings.userOpenId,
    }
  }
  return null
}
