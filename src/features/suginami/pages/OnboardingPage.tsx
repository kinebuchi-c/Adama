import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ActionButton } from '../components/common'
import { useSuginamiUserStore, type OnboardingData } from '../../../stores/suginamiUserStore'
import { useLanguageStore } from '../../../stores/languageStore'
import { useSuginamiTaskStore } from '../../../stores/suginamiTaskStore'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS, type SupportedLanguage } from '../../../i18n'
import type { ResidenceStatusType, DurationType, UserNeed } from '../../../types/suginami'

const TOTAL_STEPS = 5

const RESIDENCE_STATUS_OPTIONS: ResidenceStatusType[] = [
  'permanent_resident',
  'spouse_japanese',
  'spouse_permanent',
  'long_term_resident',
  'student',
  'work_engineer',
  'work_skilled',
  'work_specified',
  'work_other',
  'dependent',
  'designated_activities',
  'other',
]

const DURATION_OPTIONS: DurationType[] = [
  'under_3months',
  '3months_to_1year',
  '1year_to_3years',
  '3years_to_5years',
  'over_5years',
  'permanent',
]

const NEED_OPTIONS: UserNeed[] = [
  'housing',
  'medical',
  'education',
  'childcare',
  'employment',
  'japanese_language',
  'daily_life',
  'legal_administrative',
]

export function OnboardingPage() {
  const { t } = useTranslation('onboarding')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const { completeOnboarding } = useSuginamiUserStore()
  const { setLanguage, language } = useLanguageStore()
  const { clearAllTasks, addTask } = useSuginamiTaskStore()

  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<OnboardingData>>({
    residenceStatus: undefined,
    plannedDuration: undefined,
    residenceCard: false,
    myNumber: false,
    healthInsurance: false,
    pension: false,
    bankAccount: false,
    needs: [],
    language: language,
  })

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = async () => {
    if (!data.residenceStatus || !data.language) return

    try {
      await completeOnboarding({
        residenceStatus: data.residenceStatus,
        arrivalDate: data.arrivalDate,
        plannedDuration: data.plannedDuration,
        residenceCard: data.residenceCard || false,
        myNumber: data.myNumber || false,
        healthInsurance: data.healthInsurance || false,
        pension: data.pension || false,
        bankAccount: data.bankAccount || false,
        needs: data.needs || [],
        language: data.language,
      })

      await clearAllTasks()
      await generateTasks(data)

      navigate('/suginami', { replace: true })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const generateTasks = async (profileData: Partial<OnboardingData>) => {
    const tasks = []
    let order = 0

    if (!profileData.residenceCard) {
      tasks.push({
        templateId: 'residence_card',
        titleKey: 'templates.residence_card.title',
        descriptionKey: 'templates.residence_card.description',
        category: 'residence' as const,
        priority: 'high' as const,
        status: 'not_started' as const,
        linkedDocuments: [],
        externalLinks: [],
        order: order++,
      })
    }

    tasks.push({
      templateId: 'residence_registration',
      titleKey: 'templates.residence_registration.title',
      descriptionKey: 'templates.residence_registration.description',
      category: 'municipal' as const,
      priority: 'high' as const,
      status: 'not_started' as const,
      linkedDocuments: [],
      externalLinks: [],
      order: order++,
    })

    if (!profileData.myNumber) {
      tasks.push({
        templateId: 'my_number',
        titleKey: 'templates.my_number.title',
        descriptionKey: 'templates.my_number.description',
        category: 'municipal' as const,
        priority: 'medium' as const,
        status: 'not_started' as const,
        linkedDocuments: [],
        externalLinks: [],
        order: order++,
      })
    }

    if (!profileData.healthInsurance) {
      tasks.push({
        templateId: 'health_insurance',
        titleKey: 'templates.health_insurance.title',
        descriptionKey: 'templates.health_insurance.description',
        category: 'insurance' as const,
        priority: 'high' as const,
        status: 'not_started' as const,
        linkedDocuments: [],
        externalLinks: [],
        order: order++,
      })
    }

    if (!profileData.pension) {
      tasks.push({
        templateId: 'pension',
        titleKey: 'templates.pension.title',
        descriptionKey: 'templates.pension.description',
        category: 'insurance' as const,
        priority: 'medium' as const,
        status: 'not_started' as const,
        linkedDocuments: [],
        externalLinks: [],
        order: order++,
      })
    }

    if (!profileData.bankAccount) {
      tasks.push({
        templateId: 'bank_account',
        titleKey: 'templates.bank_account.title',
        descriptionKey: 'templates.bank_account.description',
        category: 'daily_life' as const,
        priority: 'medium' as const,
        status: 'not_started' as const,
        linkedDocuments: [],
        externalLinks: [],
        order: order++,
      })
    }

    tasks.push({
      templateId: 'garbage_rules',
      titleKey: 'templates.garbage_rules.title',
      descriptionKey: 'templates.garbage_rules.description',
      category: 'daily_life' as const,
      priority: 'low' as const,
      status: 'not_started' as const,
      linkedDocuments: [],
      externalLinks: [],
      order: order++,
    })

    tasks.push({
      templateId: 'emergency_contact',
      titleKey: 'templates.emergency_contact.title',
      descriptionKey: 'templates.emergency_contact.description',
      category: 'daily_life' as const,
      priority: 'low' as const,
      status: 'not_started' as const,
      linkedDocuments: [],
      externalLinks: [],
      order: order++,
    })

    for (const task of tasks) {
      await addTask(task)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.language
      case 2:
        return !!data.residenceStatus
      case 3:
        return !!data.plannedDuration
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Progress */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{t('title')}</h1>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            {t('progress', { current: step, total: TOTAL_STEPS })}
          </span>
        </div>
        <div
          style={{
            height: '4px',
            backgroundColor: '#E5E7EB',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            style={{
              height: '100%',
              backgroundColor: '#3B82F6',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{ flex: 1 }}
        >
          {/* Step 1: Language Selection (FIRST - so users can understand) */}
          {step === 1 && (
            <LanguageStep
              value={data.language || 'ja'}
              onChange={async (v) => {
                setData({ ...data, language: v })
                await setLanguage(v)
              }}
            />
          )}
          {step === 2 && (
            <Step1
              value={data.residenceStatus}
              onChange={(v) => setData({ ...data, residenceStatus: v })}
              t={t}
            />
          )}
          {step === 3 && (
            <Step2
              value={data.plannedDuration}
              onChange={(v) => setData({ ...data, plannedDuration: v })}
              t={t}
            />
          )}
          {step === 4 && (
            <Step3
              data={data}
              onChange={(updates) => setData({ ...data, ...updates })}
              t={t}
            />
          )}
          {step === 5 && (
            <Step4
              value={data.needs || []}
              onChange={(v) => setData({ ...data, needs: v })}
              t={t}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
        }}
      >
        {step > 1 && (
          <ActionButton variant="secondary" onClick={handleBack} fullWidth>
            {tCommon('actions.back')}
          </ActionButton>
        )}
        {step < TOTAL_STEPS ? (
          <ActionButton onClick={handleNext} disabled={!canProceed()} fullWidth>
            {tCommon('actions.next')}
          </ActionButton>
        ) : (
          <ActionButton onClick={handleComplete} disabled={!canProceed()} fullWidth>
            {tCommon('actions.start')}
          </ActionButton>
        )}
      </div>
    </div>
  )
}

function Step1({
  value,
  onChange,
  t,
}: {
  value?: ResidenceStatusType
  onChange: (v: ResidenceStatusType) => void
  t: (key: string) => string
}) {
  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        {t('step1.title')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
        {t('step1.question')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {RESIDENCE_STATUS_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              padding: '16px',
              backgroundColor: value === option ? '#EFF6FF' : 'white',
              border: `2px solid ${value === option ? '#3B82F6' : '#E5E7EB'}`,
              borderRadius: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1F2937',
            }}
          >
            {t(`step1.options.${option}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step2({
  value,
  onChange,
  t,
}: {
  value?: DurationType
  onChange: (v: DurationType) => void
  t: (key: string) => string
}) {
  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        {t('step2.title')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
        {t('step2.questionDuration')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {DURATION_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              padding: '16px',
              backgroundColor: value === option ? '#EFF6FF' : 'white',
              border: `2px solid ${value === option ? '#3B82F6' : '#E5E7EB'}`,
              borderRadius: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1F2937',
            }}
          >
            {t(`step2.options.${option}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step3({
  data,
  onChange,
  t,
}: {
  data: Partial<OnboardingData>
  onChange: (updates: Partial<OnboardingData>) => void
  t: (key: string) => string
}) {
  const items = [
    { key: 'residenceCard', label: t('step3.items.residenceCard') },
    { key: 'myNumber', label: t('step3.items.myNumber') },
    { key: 'healthInsurance', label: t('step3.items.healthInsurance') },
    { key: 'pension', label: t('step3.items.pension') },
    { key: 'bankAccount', label: t('step3.items.bankAccount') },
  ] as const

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        {t('step3.title')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
        {t('step3.question')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange({ [item.key]: !data[item.key] })}
            style={{
              padding: '16px',
              backgroundColor: data[item.key] ? '#ECFDF5' : 'white',
              border: `2px solid ${data[item.key] ? '#10B981' : '#E5E7EB'}`,
              borderRadius: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: data[item.key] ? '#10B981' : '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
              }}
            >
              {data[item.key] ? '✓' : ''}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Step4({
  value,
  onChange,
  t,
}: {
  value: UserNeed[]
  onChange: (v: UserNeed[]) => void
  t: (key: string) => string
}) {
  const toggle = (need: UserNeed) => {
    if (value.includes(need)) {
      onChange(value.filter((n) => n !== need))
    } else {
      onChange([...value, need])
    }
  }

  const icons: Record<UserNeed, string> = {
    housing: '🏠',
    medical: '🏥',
    education: '📚',
    childcare: '👶',
    employment: '💼',
    japanese_language: '🗾',
    daily_life: '🛒',
    legal_administrative: '📋',
  }

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
        {t('step4.title')}
      </h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
        {t('step4.question')}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        {NEED_OPTIONS.map((need) => (
          <button
            key={need}
            onClick={() => toggle(need)}
            style={{
              padding: '16px',
              backgroundColor: value.includes(need) ? '#EFF6FF' : 'white',
              border: `2px solid ${value.includes(need) ? '#3B82F6' : '#E5E7EB'}`,
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#1F2937',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icons[need]}</div>
            {t(`step4.options.${need}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

// Language selection step - shows multilingual headers so everyone can understand
function LanguageStep({
  value,
  onChange,
}: {
  value: SupportedLanguage
  onChange: (v: SupportedLanguage) => void
}) {
  return (
    <div>
      {/* Show title in multiple languages so everyone can understand */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
          🌐 Language / 言語
        </h2>
        <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
          <span>Choose your language</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>言語を選んでください</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>选择语言</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onChange(lang)}
            style={{
              padding: '16px',
              backgroundColor: value === lang ? '#EFF6FF' : 'white',
              border: `2px solid ${value === lang ? '#3B82F6' : '#E5E7EB'}`,
              borderRadius: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '28px' }}>{LANGUAGE_FLAGS[lang]}</span>
            <span style={{ fontWeight: 500 }}>{LANGUAGE_LABELS[lang]}</span>
            {value === lang && (
              <span style={{ marginLeft: 'auto', color: '#3B82F6', fontSize: '20px' }}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
