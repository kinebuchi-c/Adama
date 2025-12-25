import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNavigation } from './common'
import { useLanguageStore } from '../../../stores/languageStore'
import { useSuginamiUserStore } from '../../../stores/suginamiUserStore'
import '../../../i18n'

export function SuginamiLayout() {
  const navigate = useNavigate()
  const { loadLanguage } = useLanguageStore()
  const { loadProfile, hasCompletedOnboarding, isLoading } = useSuginamiUserStore()

  useEffect(() => {
    loadLanguage()
    loadProfile()
  }, [loadLanguage, loadProfile])

  useEffect(() => {
    if (!isLoading && !hasCompletedOnboarding) {
      navigate('/suginami/onboarding', { replace: true })
    }
  }, [isLoading, hasCompletedOnboarding, navigate])

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F9FAFB',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #E5E7EB',
              borderTopColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        paddingBottom: '80px',
      }}
    >
      <Outlet />
      <BottomNavigation />
    </div>
  )
}
