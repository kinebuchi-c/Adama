/**
 * Lark OAuth Callback Page
 * Handles the redirect from Lark OAuth authorization
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getLarkSettings } from '../db/database'
import { exchangeCodeForToken, saveUserToken } from '../services/larkOAuth'

export function LarkCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('認証処理中...')

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(`認証エラー: ${error}`)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('認証コードがありません')
      return
    }

    try {
      // Get app credentials from settings
      const settings = await getLarkSettings()

      if (!settings?.appId || !settings?.appSecret) {
        setStatus('error')
        setMessage('Larkアプリ設定が見つかりません')
        return
      }

      // Exchange code for token
      setMessage('トークンを取得中...')
      console.log('Exchanging code with appId:', settings.appId?.substring(0, 8) + '...')
      const result = await exchangeCodeForToken(settings.appId, settings.appSecret, code)
      console.log('Exchange result:', JSON.stringify(result))

      if (result.success && result.token) {
        // Save token
        await saveUserToken(result.token)

        setStatus('success')
        setMessage(`認証成功！ようこそ ${result.token.name || 'ユーザー'} さん`)

        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2000)
      } else {
        setStatus('error')
        setMessage(`認証失敗: ${result.error}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxWidth: '400px',
        width: '90%',
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}

        {status === 'success' && (
          <div style={{
            width: '60px',
            height: '60px',
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '30px',
          }}>
            ✓
          </div>
        )}

        {status === 'error' && (
          <div style={{
            width: '60px',
            height: '60px',
            background: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '30px',
          }}>
            ✗
          </div>
        )}

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: status === 'error' ? '#991b1b' : '#1f2937',
          marginBottom: '8px',
        }}>
          {status === 'processing' ? 'Lark認証' :
           status === 'success' ? '認証完了' : '認証エラー'}
        </h2>

        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem',
        }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/', { replace: true })}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ホームに戻る
          </button>
        )}
      </div>
    </div>
  )
}
