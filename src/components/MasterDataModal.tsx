import { useState, useEffect, useCallback } from 'react'
import type { StaffMember, Organization, ExternalContact, OrganizationType } from '../types'
import { ORGANIZATION_TYPE_LABELS, COUNTRY_NAMES } from '../types'
import {
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  addExternalContact,
  updateExternalContact,
  deleteExternalContact,
  getAllStaffMembers,
  getAllOrganizations,
  getAllExternalContacts,
} from '../db/cloudDatabase'

interface MasterDataModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'staff' | 'organizations' | 'contacts'

export function MasterDataModal({ isOpen, onClose }: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('staff')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  // Cloud data state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [externalContacts, setExternalContacts] = useState<ExternalContact[]>([])
  // Load data from cloud
  const loadData = useCallback(async () => {
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

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, loadData])

  // Form states
  const [staffForm, setStaffForm] = useState({ name: '', email: '', department: '', notes: '' })
  const [orgForm, setOrgForm] = useState<{
    name: string
    type: OrganizationType
    countryCodes: string[]
    contactPerson: string
    contactEmail: string
    website: string
    notes: string
  }>({
    name: '',
    type: 'introducer',
    countryCodes: [],
    contactPerson: '',
    contactEmail: '',
    website: '',
    notes: '',
  })
  const [contactForm, setContactForm] = useState({
    name: '',
    organizationIds: [] as string[],
    title: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (!isOpen) {
      setEditingItem(null)
      setIsAdding(false)
      setSearchQuery('')
      setExpandedItemId(null)
      resetForms()
    }
  }, [isOpen])

  const resetForms = () => {
    setStaffForm({ name: '', email: '', department: '', notes: '' })
    setOrgForm({
      name: '',
      type: 'introducer',
      countryCodes: [],
      contactPerson: '',
      contactEmail: '',
      website: '',
      notes: '',
    })
    setContactForm({
      name: '',
      organizationIds: [],
      title: '',
      email: '',
      phone: '',
      notes: '',
    })
  }

  // Staff handlers
  const handleAddStaff = async () => {
    if (!staffForm.name.trim()) {
      alert('名前を入力してください')
      return
    }
    try {
      await addStaffMember({
        name: staffForm.name.trim(),
        email: staffForm.email?.trim() || undefined,
        department: staffForm.department?.trim() || undefined,
        notes: staffForm.notes?.trim() || undefined,
        isActive: true,
      })
      await loadData()
      resetForms()
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add staff:', error)
      alert('追加に失敗しました')
    }
  }

  const handleUpdateStaff = async (id: string) => {
    await updateStaffMember(id, {
      name: staffForm.name,
      email: staffForm.email || undefined,
      department: staffForm.department || undefined,
      notes: staffForm.notes || undefined,
    })
    await loadData()
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('このスタッフを削除しますか？')) return
    await deleteStaffMember(id)
    await loadData()
  }

  const startEditStaff = (staff: StaffMember) => {
    setEditingItem(staff.id)
    setStaffForm({
      name: staff.name,
      email: staff.email || '',
      department: staff.department || '',
      notes: staff.notes || '',
    })
  }

  // Organization handlers
  const handleAddOrg = async () => {
    if (!orgForm.name.trim()) {
      alert('機関名を入力してください')
      return
    }
    try {
      await addOrganization({
        name: orgForm.name.trim(),
        type: orgForm.type,
        countryCodes: orgForm.countryCodes.length > 0 ? orgForm.countryCodes : undefined,
        contactPerson: orgForm.contactPerson?.trim() || undefined,
        contactEmail: orgForm.contactEmail?.trim() || undefined,
        website: orgForm.website?.trim() || undefined,
        notes: orgForm.notes?.trim() || undefined,
        isActive: true,
      })
      await loadData()
      resetForms()
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add organization:', error)
      alert('追加に失敗しました')
    }
  }

  const handleUpdateOrg = async (id: string) => {
    await updateOrganization(id, {
      name: orgForm.name,
      type: orgForm.type,
      countryCodes: orgForm.countryCodes.length > 0 ? orgForm.countryCodes : undefined,
      contactPerson: orgForm.contactPerson || undefined,
      contactEmail: orgForm.contactEmail || undefined,
      website: orgForm.website || undefined,
      notes: orgForm.notes || undefined,
    })
    await loadData()
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('この機関を削除しますか？')) return
    await deleteOrganization(id)
    await loadData()
  }

  const startEditOrg = (org: Organization) => {
    setEditingItem(org.id)
    setOrgForm({
      name: org.name,
      type: org.type,
      countryCodes: org.countryCodes || [],
      contactPerson: org.contactPerson || '',
      contactEmail: org.contactEmail || '',
      website: org.website || '',
      notes: org.notes || '',
    })
  }

  // Contact handlers
  const handleAddContact = async () => {
    if (!contactForm.name.trim()) {
      alert('名前を入力してください')
      return
    }
    try {
      // 最初の所属（後方互換性のため）
      const primaryOrgId = contactForm.organizationIds[0]
      const primaryOrg = organizations?.find(o => o.id === primaryOrgId)
      await addExternalContact({
        name: contactForm.name.trim(),
        organizationId: primaryOrgId || undefined,
        organizationIds: contactForm.organizationIds.length > 0 ? contactForm.organizationIds : undefined,
        organizationName: primaryOrg?.name,
        title: contactForm.title?.trim() || undefined,
        email: contactForm.email?.trim() || undefined,
        phone: contactForm.phone?.trim() || undefined,
        notes: contactForm.notes?.trim() || undefined,
        isActive: true,
      })
      await loadData()
      resetForms()
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('追加に失敗しました')
    }
  }

  const handleUpdateContact = async (id: string) => {
    const primaryOrgId = contactForm.organizationIds[0]
    const primaryOrg = organizations?.find(o => o.id === primaryOrgId)
    await updateExternalContact(id, {
      name: contactForm.name,
      organizationId: primaryOrgId || undefined,
      organizationIds: contactForm.organizationIds.length > 0 ? contactForm.organizationIds : undefined,
      organizationName: primaryOrg?.name,
      title: contactForm.title || undefined,
      email: contactForm.email || undefined,
      phone: contactForm.phone || undefined,
      notes: contactForm.notes || undefined,
    })
    await loadData()
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('この連絡先を削除しますか？')) return
    await deleteExternalContact(id)
    await loadData()
  }

  const startEditContact = (contact: ExternalContact) => {
    setEditingItem(contact.id)
    // 後方互換性: organizationIds があればそれを使用、なければ organizationId から配列を作成
    const orgIds = contact.organizationIds || (contact.organizationId ? [contact.organizationId] : [])
    setContactForm({
      name: contact.name,
      organizationIds: orgIds,
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      notes: contact.notes || '',
    })
  }

  if (!isOpen) return null

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'staff', label: '社内スタッフ', icon: '👤' },
    { key: 'organizations', label: '機関／企業', icon: '🏢' },
    { key: 'contacts', label: '外部連絡先', icon: '📇' },
  ]

  // Filter functions
  const query = searchQuery.toLowerCase()
  const filteredStaff = staffMembers?.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.email?.toLowerCase().includes(query) ||
    s.department?.toLowerCase().includes(query) ||
    s.notes?.toLowerCase().includes(query)
  ) || []

  const filteredOrgs = organizations?.filter(o =>
    o.name.toLowerCase().includes(query) ||
    o.contactPerson?.toLowerCase().includes(query) ||
    o.contactEmail?.toLowerCase().includes(query) ||
    o.website?.toLowerCase().includes(query) ||
    o.notes?.toLowerCase().includes(query) ||
    ORGANIZATION_TYPE_LABELS[o.type].includes(query)
  ) || []

  const filteredContacts = externalContacts?.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.organizationName?.toLowerCase().includes(query) ||
    c.title?.toLowerCase().includes(query) ||
    c.email?.toLowerCase().includes(query) ||
    c.phone?.toLowerCase().includes(query) ||
    c.notes?.toLowerCase().includes(query)
  ) || []

  const toggleExpand = (id: string) => {
    setExpandedItemId(expandedItemId === id ? null : id)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
        }}
        onClick={onClose}
      />

      <div style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '700px',
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
          background: 'linear-gradient(135deg, #10b981, #059669)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', margin: 0 }}>
              マスターデータ管理
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setEditingItem(null)
                setIsAdding(false)
                setSearchQuery('')
                setExpandedItemId(null)
                resetForms()
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === tab.key ? 'white' : 'transparent',
                borderBottom: activeTab === tab.key ? '2px solid #10b981' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#10b981' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* Add button & Search */}
          {!isAdding && !editingItem && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="検索..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                }}>🔍</span>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                + 追加
              </button>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <>
              {isAdding && (
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="text"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      placeholder="名前 *"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        placeholder="メールアドレス"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={staffForm.department}
                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                        placeholder="部署"
                        style={inputStyle}
                      />
                    </div>
                    <textarea
                      value={staffForm.notes}
                      onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                      placeholder="備考"
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setIsAdding(false); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStaff}
                        style={saveBtnStyle}
                      >
                        追加
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredStaff.map(staff => {
                const isExpanded = expandedItemId === staff.id
                const isEditing = editingItem === staff.id
                const hasDetails = staff.email || staff.notes
                return (
                  <div key={staff.id}>
                    <div
                      style={{
                        ...itemStyle,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: hasDetails && !isEditing ? 'pointer' : 'default',
                        marginBottom: isEditing ? '0' : '8px',
                        borderBottomLeftRadius: isEditing ? '0' : '10px',
                        borderBottomRightRadius: isEditing ? '0' : '10px',
                      }}
                      onClick={() => !isEditing && hasDetails && toggleExpand(staff.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{staff.name}</span>
                            {staff.department && (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{staff.department}</span>
                            )}
                            {hasDetails && !isEditing && (
                              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{isExpanded ? '▼' : '▶'}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { if (isEditing) { setEditingItem(null); resetForms() } else { startEditStaff(staff) } }} style={editBtnStyle}>
                            {isEditing ? '閉じる' : '編集'}
                          </button>
                          <button onClick={() => handleDeleteStaff(staff.id)} style={deleteBtnStyle}>削除</button>
                        </div>
                      </div>
                      {isExpanded && !isEditing && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          {staff.email && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📧</span>
                              <a href={`mailto:${staff.email}`} style={{ color: '#3b82f6' }} onClick={(e) => e.stopPropagation()}>{staff.email}</a>
                            </div>
                          )}
                          {staff.notes && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px', background: '#f9fafb', padding: '6px 8px', borderRadius: '4px' }}>
                              {staff.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div style={{
                        background: '#f0fdf4',
                        borderRadius: '0 0 12px 12px',
                        padding: '16px',
                        marginBottom: '8px',
                        borderTop: '2px solid #10b981',
                      }}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          <input
                            type="text"
                            value={staffForm.name}
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                            placeholder="名前 *"
                            style={inputStyle}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input
                              type="email"
                              value={staffForm.email}
                              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                              placeholder="メールアドレス"
                              style={inputStyle}
                            />
                            <input
                              type="text"
                              value={staffForm.department}
                              onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                              placeholder="部署"
                              style={inputStyle}
                            />
                          </div>
                          <textarea
                            value={staffForm.notes}
                            onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                            placeholder="備考"
                            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                              キャンセル
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStaff(staff.id)}
                              style={saveBtnStyle}
                            >
                              更新
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredStaff.length === 0 && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  {searchQuery ? '検索結果がありません' : 'スタッフが登録されていません'}
                </div>
              )}
            </>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <>
              {isAdding && (
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      placeholder="機関名 *"
                      style={inputStyle}
                    />
                    <select
                      value={orgForm.type}
                      onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value as OrganizationType })}
                      style={inputStyle}
                    >
                      {Object.entries(ORGANIZATION_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                      placeholder="Webサイト"
                      style={inputStyle}
                    />
                    <textarea
                      value={orgForm.notes}
                      onChange={(e) => setOrgForm({ ...orgForm, notes: e.target.value })}
                      placeholder="備考"
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setIsAdding(false); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleAddOrg}
                        style={saveBtnStyle}
                      >
                        追加
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredOrgs.map(org => {
                const isExpanded = expandedItemId === org.id
                const isEditing = editingItem === org.id
                // この機関に紐づく外部連絡先（organizationIds または organizationId で検索）
                const linkedContacts = externalContacts?.filter(c =>
                  c.organizationIds?.includes(org.id) || c.organizationId === org.id
                ) || []
                const hasDetails = linkedContacts.length > 0 || org.website || org.notes || (org.countryCodes && org.countryCodes.length > 0)
                return (
                  <div key={org.id}>
                    <div
                      style={{
                        ...itemStyle,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: hasDetails && !isEditing ? 'pointer' : 'default',
                        marginBottom: isEditing ? '0' : '8px',
                        borderBottomLeftRadius: isEditing ? '0' : '10px',
                        borderBottomRightRadius: isEditing ? '0' : '10px',
                      }}
                      onClick={() => !isEditing && hasDetails && toggleExpand(org.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{org.name}</span>
                            <span style={{
                              fontSize: '0.65rem',
                              padding: '2px 6px',
                              background: '#e0e7ff',
                              color: '#4338ca',
                              borderRadius: '8px',
                            }}>
                              {ORGANIZATION_TYPE_LABELS[org.type]}
                            </span>
                            {linkedContacts.length > 0 && (
                              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                ({linkedContacts.length}名)
                              </span>
                            )}
                            {hasDetails && !isEditing && (
                              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{isExpanded ? '▼' : '▶'}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { if (isEditing) { setEditingItem(null); resetForms() } else { startEditOrg(org) } }} style={editBtnStyle}>
                            {isEditing ? '閉じる' : '編集'}
                          </button>
                          <button onClick={() => handleDeleteOrg(org.id)} style={deleteBtnStyle}>削除</button>
                        </div>
                      </div>
                      {isExpanded && !isEditing && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          {/* 紐づいている連絡先を表示 */}
                          {linkedContacts.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>
                                👤 連絡先
                              </div>
                              {linkedContacts.map(contact => (
                                <div key={contact.id} style={{
                                  fontSize: '0.8rem',
                                  padding: '4px 8px',
                                  background: '#f0fdf4',
                                  borderRadius: '4px',
                                  marginBottom: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}>
                                  <span style={{ fontWeight: 500 }}>{contact.name}</span>
                                  {contact.title && (
                                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{contact.title}</span>
                                  )}
                                  {contact.email && (
                                    <a href={`mailto:${contact.email}`} style={{ fontSize: '0.7rem', color: '#3b82f6', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                                      📧 {contact.email}
                                    </a>
                                  )}
                                  {contact.phone && (
                                    <a href={`tel:${contact.phone}`} style={{ fontSize: '0.7rem', color: '#3b82f6', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                                      📞 {contact.phone}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {org.website && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span>🌐</span>
                              <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{org.website}</a>
                            </div>
                          )}
                          {org.notes && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                              {org.notes}
                            </div>
                          )}
                          {org.countryCodes && org.countryCodes.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <span>🌍</span>
                              <span>紹介実績: {org.countryCodes.map(c => COUNTRY_NAMES[c] || c).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div style={{
                        background: '#f0fdf4',
                        borderRadius: '0 0 12px 12px',
                        padding: '16px',
                        marginBottom: '8px',
                        borderTop: '2px solid #10b981',
                      }}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          <input
                            type="text"
                            value={orgForm.name}
                            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                            placeholder="機関名 *"
                            style={inputStyle}
                          />
                          <select
                            value={orgForm.type}
                            onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value as OrganizationType })}
                            style={inputStyle}
                          >
                            {Object.entries(ORGANIZATION_TYPE_LABELS).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <input
                            type="url"
                            value={orgForm.website}
                            onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                            placeholder="Webサイト"
                            style={inputStyle}
                          />
                          <textarea
                            value={orgForm.notes}
                            onChange={(e) => setOrgForm({ ...orgForm, notes: e.target.value })}
                            placeholder="備考"
                            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                              キャンセル
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrg(org.id)}
                              style={saveBtnStyle}
                            >
                              更新
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredOrgs.length === 0 && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  {searchQuery ? '検索結果がありません' : '機関が登録されていません'}
                </div>
              )}
            </>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <>
              {isAdding && (
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="名前 *"
                      style={inputStyle}
                    />
                    {/* 所属機関（最大3つ） */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                        所属機関（最大3つ）
                      </label>
                      {contactForm.organizationIds.map((orgId, index) => {
                        const org = organizations?.find(o => o.id === orgId)
                        return (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <select
                              value={orgId}
                              onChange={(e) => {
                                const newIds = [...contactForm.organizationIds]
                                newIds[index] = e.target.value
                                setContactForm({ ...contactForm, organizationIds: newIds.filter(id => id) })
                              }}
                              style={{ ...inputStyle, flex: 1 }}
                            >
                              <option value="">選択してください</option>
                              {organizations?.map(o => (
                                <option key={o.id} value={o.id} disabled={contactForm.organizationIds.includes(o.id) && o.id !== orgId}>
                                  {o.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const newIds = contactForm.organizationIds.filter((_, i) => i !== index)
                                setContactForm({ ...contactForm, organizationIds: newIds })
                              }}
                              style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              ×
                            </button>
                            {org && (
                              <span style={{ fontSize: '0.7rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {ORGANIZATION_TYPE_LABELS[org.type]}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      {contactForm.organizationIds.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setContactForm({ ...contactForm, organizationIds: [...contactForm.organizationIds, ''] })}
                          style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          + 所属を追加
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={contactForm.title}
                      onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                      placeholder="役職"
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="メールアドレス"
                        style={inputStyle}
                      />
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="電話番号"
                        style={inputStyle}
                      />
                    </div>
                    <textarea
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      placeholder="備考"
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setIsAdding(false); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleAddContact}
                        style={saveBtnStyle}
                      >
                        追加
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {filteredContacts.map(contact => {
                const isExpanded = expandedItemId === contact.id
                const isEditing = editingItem === contact.id
                const hasDetails = contact.email || contact.phone || contact.notes
                // 複数所属対応: organizationIds があれば使用、なければ organizationId/organizationName を使用
                const contactOrgIds = contact.organizationIds || (contact.organizationId ? [contact.organizationId] : [])
                const contactOrgNames = contactOrgIds.map(id => organizations?.find(o => o.id === id)?.name).filter(Boolean)
                const displayOrgName = contactOrgNames.length > 0 ? contactOrgNames.join(' / ') : contact.organizationName
                return (
                  <div key={contact.id}>
                    <div
                      style={{
                        ...itemStyle,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        cursor: hasDetails && !isEditing ? 'pointer' : 'default',
                        marginBottom: isEditing ? '0' : '8px',
                        borderBottomLeftRadius: isEditing ? '0' : '10px',
                        borderBottomRightRadius: isEditing ? '0' : '10px',
                      }}
                      onClick={() => !isEditing && hasDetails && toggleExpand(contact.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contact.name}</span>
                            {displayOrgName && (
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{displayOrgName}</span>
                            )}
                            {contact.title && (
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{contact.title}</span>
                            )}
                            {hasDetails && !isEditing && (
                              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{isExpanded ? '▼' : '▶'}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { if (isEditing) { setEditingItem(null); resetForms() } else { startEditContact(contact) } }} style={editBtnStyle}>
                            {isEditing ? '閉じる' : '編集'}
                          </button>
                          <button onClick={() => handleDeleteContact(contact.id)} style={deleteBtnStyle}>削除</button>
                        </div>
                      </div>
                      {isExpanded && !isEditing && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                          {contact.email && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>📧</span>
                              <a href={`mailto:${contact.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{contact.email}</a>
                            </div>
                          )}
                          {contact.phone && (
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span>📞</span>
                              <a href={`tel:${contact.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>{contact.phone}</a>
                            </div>
                          )}
                          {contact.notes && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                              {contact.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div style={{
                        background: '#f0fdf4',
                        borderRadius: '0 0 12px 12px',
                        padding: '16px',
                        marginBottom: '8px',
                        borderTop: '2px solid #10b981',
                      }}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          <input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="名前 *"
                            style={inputStyle}
                          />
                          {/* 所属機関（最大3つ） */}
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                              所属機関（最大3つ）
                            </label>
                            {contactForm.organizationIds.map((orgId, index) => {
                              const org = organizations?.find(o => o.id === orgId)
                              return (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <select
                                    value={orgId}
                                    onChange={(e) => {
                                      const newIds = [...contactForm.organizationIds]
                                      newIds[index] = e.target.value
                                      setContactForm({ ...contactForm, organizationIds: newIds.filter(id => id) })
                                    }}
                                    style={{ ...inputStyle, flex: 1 }}
                                  >
                                    <option value="">選択してください</option>
                                    {organizations?.map(o => (
                                      <option key={o.id} value={o.id} disabled={contactForm.organizationIds.includes(o.id) && o.id !== orgId}>
                                        {o.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newIds = contactForm.organizationIds.filter((_, i) => i !== index)
                                      setContactForm({ ...contactForm, organizationIds: newIds })
                                    }}
                                    style={{ padding: '8px 12px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                  >
                                    ×
                                  </button>
                                  {org && (
                                    <span style={{ fontSize: '0.7rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                      {ORGANIZATION_TYPE_LABELS[org.type]}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                            {contactForm.organizationIds.length < 3 && (
                              <button
                                type="button"
                                onClick={() => setContactForm({ ...contactForm, organizationIds: [...contactForm.organizationIds, ''] })}
                                style={{ padding: '6px 12px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                + 所属を追加
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={contactForm.title}
                            onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                            placeholder="役職"
                            style={inputStyle}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <input
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="メールアドレス"
                              style={inputStyle}
                            />
                            <input
                              type="tel"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                              placeholder="電話番号"
                              style={inputStyle}
                            />
                          </div>
                          <textarea
                            value={contactForm.notes}
                            onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                            placeholder="備考"
                            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                              キャンセル
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateContact(contact.id)}
                              style={saveBtnStyle}
                            >
                              更新
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredContacts.length === 0 && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  {searchQuery ? '検索結果がありません' : '外部連絡先が登録されていません'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

// Styles
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px',
  background: '#f9fafb',
  borderRadius: '10px',
  marginBottom: '8px',
}

const editBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#e0e7ff',
  color: '#4338ca',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
}

const deleteBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#fee2e2',
  color: '#991b1b',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.75rem',
  cursor: 'pointer',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.85rem',
  cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #10b981, #059669)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
}
