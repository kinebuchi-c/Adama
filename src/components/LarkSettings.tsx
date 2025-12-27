import { useState, useEffect } from 'react'
import type { LarkSettings as LarkSettingsType, LarkUserMapping } from '../types'
import {
  getLarkSettings,
  saveLarkSettings,
  initializeLarkSettings,
  getAllLarkUserMappings,
  addLarkUserMapping,
  deleteLarkUserMapping,
} from '../db/database'
import { testLarkConnection } from '../services/larkService'
import { getOAuthAuthorizationUrl, getCurrentUser, clearUserAuth } from '../services/larkOAuth'

interface LarkSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function LarkSettingsModal({ isOpen, onClose }: LarkSettingsProps) {
  const [settings, setSettings] = useState<LarkSettingsType | null>(null)
  const [userMappings, setUserMappings] = useState<LarkUserMapping[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [newMapping, setNewMapping] = useState({ displayName: '', larkEmail: '' })
  const [oauthUser, setOauthUser] = useState<{ name?: string; openId?: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
      loadOAuthUser()
    }
  }, [isOpen])

  const loadOAuthUser = async () => {
    const user = await getCurrentUser()
    setOauthUser(user)
  }

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const loadedSettings = await getLarkSettings() || await initializeLarkSettings()
      setSettings(loadedSettings)

      const mappings = await getAllLarkUserMappings()
      setUserMappings(mappings)
    } catch (error) {
      console.error('Failed to load Lark settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = () => {
    if (!settings?.appId) {
      setTestResult({ success: false, message: 'App IDを入力してください' })
      return
    }

    const redirectUri = `${window.location.origin}/auth/lark/callback`
    const authUrl = getOAuthAuthorizationUrl(settings.appId, redirectUri)
    window.location.href = authUrl
  }

  const handleOAuthLogout = async () => {
    await clearUserAuth()
    setOauthUser(null)
    if (settings) {
      setSettings({ ...settings, useOAuth: false })
    }
    setTestResult({ success: true, message: 'Larkアカウントの連携を解除しました' })
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      await saveLarkSettings({
        enabled: settings.enabled,
        appId: settings.appId,
        appSecret: settings.appSecret,
        defaultCalendarId: settings.defaultCalendarId,
        autoSync: settings.autoSync,
        eventDurationMinutes: settings.eventDurationMinutes,
        reminderMinutes: settings.reminderMinutes,
        useOAuth: settings.useOAuth,
      })
      setTestResult({ success: true, message: '設定を保存しました' })
      setTimeout(() => setTestResult(null), 3000)
    } catch (error) {
      setTestResult({ success: false, message: '保存に失敗しました' })
    }
  }

  const handleTestConnection = async () => {
    if (!settings?.appId || !settings?.appSecret) {
      setTestResult({ success: false, message: 'App IDとApp Secretを入力してください' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await testLarkConnection(settings.appId, settings.appSecret)
      if (result.success) {
        setTestResult({ success: true, message: '接続成功！Larkと正常に通信できました' })
      } else {
        setTestResult({ success: false, message: `接続失敗: ${result.error}` })
      }
    } catch (error) {
      setTestResult({ success: false, message: '接続テストに失敗しました' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleAddMapping = async () => {
    if (!newMapping.displayName || !newMapping.larkEmail) return

    try {
      await addLarkUserMapping({
        displayName: newMapping.displayName,
        larkEmail: newMapping.larkEmail,
      })
      setNewMapping({ displayName: '', larkEmail: '' })
      const mappings = await getAllLarkUserMappings()
      setUserMappings(mappings)
    } catch (error) {
      console.error('Failed to add mapping:', error)
    }
  }

  const handleDeleteMapping = async (id: string) => {
    if (!confirm('このマッピングを削除しますか？')) return

    try {
      await deleteLarkUserMapping(id)
      const mappings = await getAllLarkUserMappings()
      setUserMappings(mappings)
    } catch (error) {
      console.error('Failed to delete mapping:', error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '85vh',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        zIndex: 51,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔗</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', margin: 0 }}>
              Lark連携設定
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              読み込み中...
            </div>
          ) : settings ? (
            <>
              {/* 連携ON/OFF */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: settings.enabled ? '#ecfdf5' : '#f3f4f6',
                borderRadius: '12px',
                marginBottom: '16px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: settings.enabled ? '#065f46' : '#374151' }}>
                    Larkカレンダー連携
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    予定作成時にLarkカレンダーに自動登録
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    background: settings.enabled ? '#10b981' : '#d1d5db',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: settings.enabled ? '24px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {/* API設定 */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                  API設定
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    App ID
                  </label>
                  <input
                    type="text"
                    value={settings.appId || ''}
                    onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                    placeholder="cli_xxxxxxxxxx"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    App Secret
                  </label>
                  <input
                    type="password"
                    value={settings.appSecret || ''}
                    onChange={(e) => setSettings({ ...settings, appSecret: e.target.value })}
                    placeholder="••••••••••••••••"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  style={{
                    padding: '8px 16px',
                    background: isTesting ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: isTesting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isTesting ? 'テスト中...' : '接続テスト'}
                </button>
              </div>

              {/* OAuth認証セクション */}
              <div style={{
                background: '#fef3c7',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #fcd34d',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
                  🔐 ユーザー認証（編集権限を取得）
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78716c', marginBottom: '12px' }}>
                  Larkアカウントでログインすると、作成した予定を直接編集できるようになります。
                </div>

                {oauthUser ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'white',
                    padding: '10px 12px',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.9rem',
                      }}>
                        ✓
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {oauthUser.name || 'Larkユーザー'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                          連携済み
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleOAuthLogout}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      連携解除
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleOAuthLogin}
                    disabled={!settings?.appId}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: !settings?.appId ? '#d1d5db' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: !settings?.appId ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🔗</span>
                    <span>Larkアカウントでログイン</span>
                  </button>
                )}

                {oauthUser && (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    fontSize: '0.8rem',
                    color: '#374151',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={settings?.useOAuth || false}
                      onChange={(e) => settings && setSettings({ ...settings, useOAuth: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    OAuth認証を使用（予定の編集権限を取得）
                  </label>
                )}
              </div>

              {/* テスト結果 */}
              {testResult && (
                <div style={{
                  padding: '12px 16px',
                  background: testResult.success ? '#ecfdf5' : '#fef2f2',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  color: testResult.success ? '#065f46' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span>{testResult.success ? '✓' : '✗'}</span>
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* イベント設定 */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                  イベント設定
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                      デフォルト所要時間
                    </label>
                    <select
                      value={settings.eventDurationMinutes}
                      onChange={(e) => setSettings({ ...settings, eventDurationMinutes: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    >
                      <option value={30}>30分</option>
                      <option value={60}>1時間</option>
                      <option value={90}>1時間30分</option>
                      <option value={120}>2時間</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                      リマインダー
                    </label>
                    <select
                      value={settings.reminderMinutes}
                      onChange={(e) => setSettings({ ...settings, reminderMinutes: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    >
                      <option value={0}>なし</option>
                      <option value={15}>15分前</option>
                      <option value={30}>30分前</option>
                      <option value={60}>1時間前</option>
                      <option value={1440}>1日前</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    color: '#374151',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={settings.autoSync}
                      onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                      style={{ width: '16px', height: '16px' }}
                    />
                    予定作成時に自動でLarkに同期
                  </label>
                </div>
              </div>

              {/* 担当者マッピング */}
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                  担当者マッピング
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '12px' }}>
                  アプリの担当者名とLarkメールアドレスを紐付けます
                </div>

                {/* 既存のマッピング */}
                {userMappings.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    {userMappings.map(mapping => (
                      <div key={mapping.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '8px',
                        marginBottom: '6px',
                        fontSize: '0.85rem',
                      }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{mapping.displayName}</span>
                          <span style={{ color: '#6b7280', margin: '0 8px' }}>→</span>
                          <span style={{ color: '#3b82f6' }}>{mapping.larkEmail}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMapping(mapping.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          削除
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 新規追加 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMapping.displayName}
                    onChange={(e) => setNewMapping({ ...newMapping, displayName: e.target.value })}
                    placeholder="表示名（例: 木下）"
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  />
                  <input
                    type="email"
                    value={newMapping.larkEmail}
                    onChange={(e) => setNewMapping({ ...newMapping, larkEmail: e.target.value })}
                    placeholder="Larkメール"
                    style={{
                      flex: 1.5,
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    onClick={handleAddMapping}
                    disabled={!newMapping.displayName || !newMapping.larkEmail}
                    style={{
                      padding: '8px 12px',
                      background: newMapping.displayName && newMapping.larkEmail ? '#10b981' : '#d1d5db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: newMapping.displayName && newMapping.larkEmail ? 'pointer' : 'not-allowed',
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </>
  )
}
