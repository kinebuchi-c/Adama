import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { StaffMember, Organization, ExternalContact, OrganizationType } from '../types'
import { ORGANIZATION_TYPE_LABELS, COUNTRY_NAMES } from '../types'
import {
  db,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  addExternalContact,
  updateExternalContact,
  deleteExternalContact,
} from '../db/database'

interface MasterDataModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'staff' | 'organizations' | 'contacts'

export function MasterDataModal({ isOpen, onClose }: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('staff')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Live queries
  const staffMembers = useLiveQuery(() => db.staffMembers.filter(s => s.isActive).toArray(), [])
  const organizations = useLiveQuery(() => db.organizations.filter(o => o.isActive).toArray(), [])
  const externalContacts = useLiveQuery(() => db.externalContacts.filter(c => c.isActive).toArray(), [])

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
    organizationId: '',
    title: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (!isOpen) {
      setEditingItem(null)
      setIsAdding(false)
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
      organizationId: '',
      title: '',
      email: '',
      phone: '',
      notes: '',
    })
  }

  // Staff handlers
  const handleAddStaff = async () => {
    if (!staffForm.name) return
    await addStaffMember({
      name: staffForm.name,
      email: staffForm.email || undefined,
      department: staffForm.department || undefined,
      notes: staffForm.notes || undefined,
      isActive: true,
    })
    resetForms()
    setIsAdding(false)
  }

  const handleUpdateStaff = async (id: string) => {
    await updateStaffMember(id, {
      name: staffForm.name,
      email: staffForm.email || undefined,
      department: staffForm.department || undefined,
      notes: staffForm.notes || undefined,
    })
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('このスタッフを削除しますか？')) return
    await deleteStaffMember(id)
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
    if (!orgForm.name) return
    await addOrganization({
      name: orgForm.name,
      type: orgForm.type,
      countryCodes: orgForm.countryCodes.length > 0 ? orgForm.countryCodes : undefined,
      contactPerson: orgForm.contactPerson || undefined,
      contactEmail: orgForm.contactEmail || undefined,
      website: orgForm.website || undefined,
      notes: orgForm.notes || undefined,
      isActive: true,
    })
    resetForms()
    setIsAdding(false)
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
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteOrg = async (id: string) => {
    if (!confirm('この機関を削除しますか？')) return
    await deleteOrganization(id)
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
    if (!contactForm.name) return
    const org = organizations?.find(o => o.id === contactForm.organizationId)
    await addExternalContact({
      name: contactForm.name,
      organizationId: contactForm.organizationId || undefined,
      organizationName: org?.name,
      title: contactForm.title || undefined,
      email: contactForm.email || undefined,
      phone: contactForm.phone || undefined,
      notes: contactForm.notes || undefined,
      isActive: true,
    })
    resetForms()
    setIsAdding(false)
  }

  const handleUpdateContact = async (id: string) => {
    const org = organizations?.find(o => o.id === contactForm.organizationId)
    await updateExternalContact(id, {
      name: contactForm.name,
      organizationId: contactForm.organizationId || undefined,
      organizationName: org?.name,
      title: contactForm.title || undefined,
      email: contactForm.email || undefined,
      phone: contactForm.phone || undefined,
      notes: contactForm.notes || undefined,
    })
    setEditingItem(null)
    resetForms()
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('この連絡先を削除しますか？')) return
    await deleteExternalContact(id)
  }

  const startEditContact = (contact: ExternalContact) => {
    setEditingItem(contact.id)
    setContactForm({
      name: contact.name,
      organizationId: contact.organizationId || '',
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      notes: contact.notes || '',
    })
  }

  if (!isOpen) return null

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'staff', label: '社内スタッフ', icon: '👤' },
    { key: 'organizations', label: '機関', icon: '🏢' },
    { key: 'contacts', label: '外部連絡先', icon: '📇' },
  ]

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
          {/* Add button */}
          {!isAdding && !editingItem && (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: '0.9rem',
              }}
            >
              + 新規追加
            </button>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <>
              {(isAdding || editingItem) && (
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
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        onClick={() => editingItem ? handleUpdateStaff(editingItem) : handleAddStaff()}
                        style={saveBtnStyle}
                      >
                        {editingItem ? '更新' : '追加'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {staffMembers?.map(staff => (
                <div key={staff.id} style={itemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{staff.name}</div>
                    {staff.department && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{staff.department}</div>
                    )}
                    {staff.email && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{staff.email}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEditStaff(staff)} style={editBtnStyle}>編集</button>
                    <button onClick={() => handleDeleteStaff(staff.id)} style={deleteBtnStyle}>削除</button>
                  </div>
                </div>
              ))}
              {(!staffMembers || staffMembers.length === 0) && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  スタッフが登録されていません
                </div>
              )}
            </>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <>
              {(isAdding || editingItem) && (
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        value={orgForm.contactPerson}
                        onChange={(e) => setOrgForm({ ...orgForm, contactPerson: e.target.value })}
                        placeholder="窓口担当者"
                        style={inputStyle}
                      />
                      <input
                        type="email"
                        value={orgForm.contactEmail}
                        onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                        placeholder="連絡先メール"
                        style={inputStyle}
                      />
                    </div>
                    <input
                      type="url"
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                      placeholder="Webサイト"
                      style={inputStyle}
                    />
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                        関連国（複数選択可）
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                        {Object.entries(COUNTRY_NAMES).slice(0, 50).map(([code, name]) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              const newCodes = orgForm.countryCodes.includes(code)
                                ? orgForm.countryCodes.filter(c => c !== code)
                                : [...orgForm.countryCodes, code]
                              setOrgForm({ ...orgForm, countryCodes: newCodes })
                            }}
                            style={{
                              padding: '2px 8px',
                              fontSize: '0.7rem',
                              border: orgForm.countryCodes.includes(code) ? '1px solid #10b981' : '1px solid #d1d5db',
                              background: orgForm.countryCodes.includes(code) ? '#d1fae5' : 'white',
                              borderRadius: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={orgForm.notes}
                      onChange={(e) => setOrgForm({ ...orgForm, notes: e.target.value })}
                      placeholder="備考"
                      style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        onClick={() => editingItem ? handleUpdateOrg(editingItem) : handleAddOrg()}
                        style={saveBtnStyle}
                      >
                        {editingItem ? '更新' : '追加'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {organizations?.map(org => (
                <div key={org.id} style={itemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    </div>
                    {org.contactPerson && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>窓口: {org.contactPerson}</div>
                    )}
                    {org.countryCodes && org.countryCodes.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        関連国: {org.countryCodes.map(c => COUNTRY_NAMES[c] || c).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEditOrg(org)} style={editBtnStyle}>編集</button>
                    <button onClick={() => handleDeleteOrg(org.id)} style={deleteBtnStyle}>削除</button>
                  </div>
                </div>
              ))}
              {(!organizations || organizations.length === 0) && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  機関が登録されていません
                </div>
              )}
            </>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <>
              {(isAdding || editingItem) && (
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <select
                        value={contactForm.organizationId}
                        onChange={(e) => setContactForm({ ...contactForm, organizationId: e.target.value })}
                        style={inputStyle}
                      >
                        <option value="">所属機関を選択</option>
                        {organizations?.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={contactForm.title}
                        onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                        placeholder="役職"
                        style={inputStyle}
                      />
                    </div>
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
                      <button onClick={() => { setIsAdding(false); setEditingItem(null); resetForms() }} style={cancelBtnStyle}>
                        キャンセル
                      </button>
                      <button
                        onClick={() => editingItem ? handleUpdateContact(editingItem) : handleAddContact()}
                        style={saveBtnStyle}
                      >
                        {editingItem ? '更新' : '追加'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {externalContacts?.map(contact => (
                <div key={contact.id} style={itemStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{contact.name}</div>
                    {(contact.organizationName || contact.title) && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {[contact.organizationName, contact.title].filter(Boolean).join(' / ')}
                      </div>
                    )}
                    {contact.email && (
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{contact.email}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEditContact(contact)} style={editBtnStyle}>編集</button>
                    <button onClick={() => handleDeleteContact(contact.id)} style={deleteBtnStyle}>削除</button>
                  </div>
                </div>
              ))}
              {(!externalContacts || externalContacts.length === 0) && !isAdding && (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  外部連絡先が登録されていません
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
