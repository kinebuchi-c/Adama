import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { NavigationHeader } from '../components/common'
import { useSuginamiDocumentStore } from '../../../stores/suginamiDocumentStore'
import { DOCUMENT_STATUS_COLORS } from '../../../types/suginami'

export function DocumentsPage() {
  const { t } = useTranslation('documents')
  const { documents, loadDocuments, getCompletionStats, updateDocumentStatus } = useSuginamiDocumentStore()

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const stats = getCompletionStats()

  const handleStatusToggle = async (docId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'obtained' ? 'not_obtained' : 'obtained'
    await updateDocumentStatus(docId, newStatus as any)
  }

  // Default document list if none exist
  const defaultDocuments = [
    { type: 'residence_card', required: true },
    { type: 'passport', required: true },
    { type: 'my_number', required: false },
    { type: 'health_insurance', required: true },
    { type: 'bank_card', required: false },
  ]

  const displayDocs = documents.length > 0 ? documents : defaultDocuments.map((d, i) => ({
    id: `default-${i}`,
    type: d.type,
    nameKey: `types.${d.type}.name`,
    descriptionKey: `types.${d.type}.description`,
    required: d.required,
    status: 'not_obtained' as const,
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return (
    <div>
      <NavigationHeader title={t('title')} />

      <main style={{ padding: '16px' }}>
        {/* Stats */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('subtitle')}</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {stats.obtained}/{stats.total}
            </span>
          </div>
          <div
            style={{
              height: '8px',
              backgroundColor: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              style={{
                height: '100%',
                backgroundColor: '#22C55E',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Document List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayDocs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                onClick={() => handleStatusToggle(doc.id, doc.status)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: `2px solid ${DOCUMENT_STATUS_COLORS[doc.status]}`,
                  backgroundColor: doc.status === 'obtained' ? DOCUMENT_STATUS_COLORS.obtained : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                {doc.status === 'obtained' && '✓'}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      margin: 0,
                      color: doc.status === 'obtained' ? '#9CA3AF' : '#1F2937',
                      textDecoration: doc.status === 'obtained' ? 'line-through' : 'none',
                    }}
                  >
                    {t(`types.${doc.type}.name`)}
                  </h3>
                  {doc.required && (
                    <span
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      必須
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    margin: '4px 0 0 0',
                  }}
                >
                  {t(`types.${doc.type}.description`)}
                </p>
              </div>

              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: `${DOCUMENT_STATUS_COLORS[doc.status]}20`,
                  color: DOCUMENT_STATUS_COLORS[doc.status],
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {t(`status.${doc.status}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
