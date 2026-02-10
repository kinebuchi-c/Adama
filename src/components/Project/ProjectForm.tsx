import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project, ProjectStatus, DiplomacyPhase, StaffMember, Organization, ExternalContact } from '../../types'
import { STATUS_LABELS, DIPLOMACY_PHASE_LABELS, ORGANIZATION_TYPE_LABELS } from '../../types'
import { getAllStaffMembers, getAllOrganizations, getAllExternalContacts } from '../../db/cloudDatabase'

// 日本語ソート用ヘルパー（ひらがな・カタカナ→アルファベット順）
const sortJapaneseFirst = <T,>(items: T[], getName: (item: T) => string): T[] => {
  return [...items].sort((a, b) => {
    const nameA = getName(a)
    const nameB = getName(b)

    // 先頭文字がひらがな・カタカナかどうかを判定
    const isJapaneseA = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(nameA)
    const isJapaneseB = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(nameB)

    // 日本語同士、または非日本語同士の場合はlocaleCompareでソート
    if (isJapaneseA === isJapaneseB) {
      return nameA.localeCompare(nameB, 'ja')
    }
    // 日本語を先に
    return isJapaneseA ? -1 : 1
  })
}

interface ProjectFormData {
  name: string
  status: ProjectStatus
  diplomacyPhase: DiplomacyPhase
  assignee: string
  assigneeStaffId?: string
  notes: string
  referrer: string
  referrerContactId?: string
  introducerOrgId?: string
  introducerOrgName?: string
  partnerOrgIds?: string[]
  managementUrl: string
}

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => void
  initialData?: Project | null
  countryName: string
}

export function ProjectForm({ isOpen, onClose, onSubmit, initialData, countryName }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('not_started')
  const [diplomacyPhase, setDiplomacyPhase] = useState<DiplomacyPhase>(0)
  const [assignee, setAssignee] = useState('')
  const [assigneeStaffId, setAssigneeStaffId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [referrer, setReferrer] = useState('')
  const [referrerContactId, setReferrerContactId] = useState<string>('')
  const [introducerOrgId, setIntroducerOrgId] = useState<string>('')
  const [partnerOrgIds, setPartnerOrgIds] = useState<string[]>([])
  const [managementUrl, setManagementUrl] = useState('')

  // 検索用state
  const [staffSearch, setStaffSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [partnerOrgSearch, setPartnerOrgSearch] = useState('')
  const [contactSearch, setContactSearch] = useState('')

  // Cloud data state for master data
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [externalContacts, setExternalContacts] = useState<ExternalContact[]>([])

  // Load master data from cloud
  const loadMasterData = useCallback(async () => {
    try {
      const [staff, orgs, contacts] = await Promise.all([
        getAllStaffMembers(),
        getAllOrganizations(),
        getAllExternalContacts(),
      ])
      setStaffMembers(staff)
      setOrganizations(orgs)
      setExternalContacts(contacts)
    } catch (error) {
      console.error('Failed to load master data:', error)
    }
  }, [])

  // Load master data when form opens
  useEffect(() => {
    if (isOpen) {
      loadMasterData()
    }
  }, [isOpen, loadMasterData])

  // ソート＆フィルタ済みリスト
  const filteredStaff = useMemo(() => {
    const sorted = sortJapaneseFirst(staffMembers, s => s.name)
    if (!staffSearch.trim()) return sorted
    const search = staffSearch.toLowerCase()
    return sorted.filter(s =>
      s.name.toLowerCase().includes(search) ||
      (s.department && s.department.toLowerCase().includes(search))
    )
  }, [staffMembers, staffSearch])

  const filteredOrganizations = useMemo(() => {
    const sorted = sortJapaneseFirst(organizations, o => o.name)
    if (!orgSearch.trim()) return sorted
    const search = orgSearch.toLowerCase()
    return sorted.filter(o =>
      o.name.toLowerCase().includes(search)
    )
  }, [organizations, orgSearch])

  const filteredPartnerOrganizations = useMemo(() => {
    const sorted = sortJapaneseFirst(organizations, o => o.name)
    const available = sorted.filter(org => org.id !== introducerOrgId && !partnerOrgIds.includes(org.id))
    if (!partnerOrgSearch.trim()) return available
    const search = partnerOrgSearch.toLowerCase()
    return available.filter(o =>
      o.name.toLowerCase().includes(search)
    )
  }, [organizations, introducerOrgId, partnerOrgIds, partnerOrgSearch])

  const filteredContacts = useMemo(() => {
    const sorted = sortJapaneseFirst(externalContacts, c => c.name)
    if (!contactSearch.trim()) return sorted
    const search = contactSearch.toLowerCase()
    return sorted.filter(c =>
      c.name.toLowerCase().includes(search) ||
      (c.organizationName && c.organizationName.toLowerCase().includes(search))
    )
  }, [externalContacts, contactSearch])

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setStatus(initialData.status)
      setDiplomacyPhase(initialData.diplomacyPhase ?? 0)
      setAssignee(initialData.assignee || '')
      setAssigneeStaffId('')
      setNotes(initialData.notes || '')
      setReferrer(initialData.referrer || '')
      setReferrerContactId('')
      setIntroducerOrgId('')
      setPartnerOrgIds([])
      setManagementUrl(initialData.managementUrl || '')
    } else {
      setName('')
      setStatus('not_started')
      setDiplomacyPhase(0)
      setAssignee('')
      setAssigneeStaffId('')
      setNotes('')
      setReferrer('')
      setReferrerContactId('')
      setIntroducerOrgId('')
      setPartnerOrgIds([])
      setManagementUrl('')
    }
  }, [initialData, isOpen])

  // スタッフ選択時の処理
  const handleStaffSelect = (staffId: string) => {
    setAssigneeStaffId(staffId)
    if (staffId) {
      const staff = staffMembers.find(s => s.id === staffId)
      if (staff) {
        setAssignee(staff.name)
      }
    }
  }

  // 紹介者選択時の処理
  const handleContactSelect = (contactId: string) => {
    setReferrerContactId(contactId)
    if (contactId) {
      const contact = externalContacts.find(c => c.id === contactId)
      if (contact) {
        setReferrer(contact.name)
      }
    }
  }

  // 紹介機関選択時の処理
  const handleOrgSelect = (orgId: string) => {
    setIntroducerOrgId(orgId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedOrg = organizations.find(o => o.id === introducerOrgId)

    onSubmit({
      name: name.trim(),
      status,
      diplomacyPhase,
      assignee: assignee.trim(),
      assigneeStaffId: assigneeStaffId || undefined,
      notes: notes.trim(),
      referrer: referrer.trim(),
      referrerContactId: referrerContactId || undefined,
      introducerOrgId: introducerOrgId || undefined,
      introducerOrgName: selectedOrg?.name,
      partnerOrgIds: partnerOrgIds.length > 0 ? partnerOrgIds : undefined,
      managementUrl: managementUrl.trim(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ + モーダルコンテナ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
          {/* モーダル */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: 'calc(100vh - 40px)',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'auto',
            }}
          >
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                {initialData ? 'プロジェクトを編集' : '新しいプロジェクト'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{countryName}</p>

              <form onSubmit={handleSubmit}>
                {/* プロジェクト名 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    プロジェクト名 *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 新規マーケット調査"
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                {/* 2カラム: 外交フェーズ & 進行状況 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {/* 外交フェーズ */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      外交フェーズ
                    </label>
                    <select
                      value={diplomacyPhase}
                      onChange={(e) => setDiplomacyPhase(Number(e.target.value) as DiplomacyPhase)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    >
                      {([0, 1, 2, 3, 4] as DiplomacyPhase[]).map((phase) => (
                        <option key={phase} value={phase}>
                          {phase}: {DIPLOMACY_PHASE_LABELS[phase]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 進行状況 */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      進行状況
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 担当者 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    担当者
                  </label>
                  {staffMembers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="🔍 スタッフを検索..."
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          outline: 'none',
                          fontSize: '13px',
                          backgroundColor: '#f9fafb',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={assigneeStaffId}
                          onChange={(e) => handleStaffSelect(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- 選択してください --</option>
                          {filteredStaff.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name}{staff.department ? ` (${staff.department})` : ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={assignee}
                          onChange={(e) => {
                            setAssignee(e.target.value)
                            setAssigneeStaffId('')
                          }}
                          placeholder="または直接入力"
                          style={{
                            width: '120px',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="例: 山田太郎"
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  {staffMembers.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      ヒント: マスターデータ管理で社内スタッフを登録すると選択できます
                    </p>
                  )}
                </div>

                {/* 紹介機関 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    紹介機関（任意）
                  </label>
                  {organizations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={orgSearch}
                        onChange={(e) => setOrgSearch(e.target.value)}
                        placeholder="🔍 機関・企業を検索..."
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          outline: 'none',
                          fontSize: '13px',
                          backgroundColor: '#f9fafb',
                          boxSizing: 'border-box',
                        }}
                      />
                      <select
                        value={introducerOrgId}
                        onChange={(e) => handleOrgSelect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">-- なし --</option>
                        {filteredOrganizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name} ({ORGANIZATION_TYPE_LABELS[org.type]})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#9ca3af', padding: '8px 0' }}>
                      マスターデータ管理で機関を登録すると選択できます
                    </p>
                  )}
                </div>

                {/* 参画機関・企業 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    参画機関・企業（任意）
                  </label>
                  {organizations.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="text"
                          value={partnerOrgSearch}
                          onChange={(e) => setPartnerOrgSearch(e.target.value)}
                          placeholder="🔍 機関・企業を検索..."
                          style={{
                            width: '100%',
                            padding: '6px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            outline: 'none',
                            fontSize: '13px',
                            backgroundColor: '#f9fafb',
                            boxSizing: 'border-box',
                          }}
                        />
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value && !partnerOrgIds.includes(e.target.value)) {
                              setPartnerOrgIds([...partnerOrgIds, e.target.value])
                              setPartnerOrgSearch('')
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- 追加する機関を選択 --</option>
                          {filteredPartnerOrganizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name} ({ORGANIZATION_TYPE_LABELS[org.type]})
                            </option>
                          ))}
                        </select>
                      </div>
                      {partnerOrgIds.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '8px',
                        }}>
                          {partnerOrgIds.map(orgId => {
                            const org = organizations.find(o => o.id === orgId)
                            if (!org) return null
                            return (
                              <span
                                key={orgId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  backgroundColor: '#dbeafe',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  color: '#1e40af',
                                }}
                              >
                                {org.name}
                                <button
                                  type="button"
                                  onClick={() => setPartnerOrgIds(partnerOrgIds.filter(id => id !== orgId))}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0 2px',
                                    fontSize: '14px',
                                    color: '#1e40af',
                                    lineHeight: 1,
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#9ca3af', padding: '8px 0' }}>
                      マスターデータ管理で機関を登録すると選択できます
                    </p>
                  )}
                </div>

                {/* 紹介者 */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    紹介者（任意）
                  </label>
                  {externalContacts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="🔍 連絡先を検索..."
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          outline: 'none',
                          fontSize: '13px',
                          backgroundColor: '#f9fafb',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          value={referrerContactId}
                          onChange={(e) => handleContactSelect(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                          }}
                        >
                          <option value="">-- 選択してください --</option>
                          {filteredContacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                              {contact.name}{contact.organizationName ? ` (${contact.organizationName})` : ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={referrer}
                          onChange={(e) => {
                            setReferrer(e.target.value)
                            setReferrerContactId('')
                          }}
                          placeholder="または直接入力"
                          style={{
                            width: '120px',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={referrer}
                      onChange={(e) => setReferrer(e.target.value)}
                      placeholder="例: 田中さん"
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                </div>

                {/* 管理ページURL */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    管理ページURL（任意）
                  </label>
                  <input
                    type="url"
                    value={managementUrl}
                    onChange={(e) => setManagementUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* メモ */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    メモ（任意）
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="プロジェクトに関するメモ..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '14px',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* ボタン */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {initialData ? '更新' : '追加'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
