import { useState, useMemo } from 'react'
import NoovoLogo from './NoovoLogo'

// ── Categorization ─────────────────────────────────────────────────────
export function categorize(c) {
  const local = (c.localitate || '').toLowerCase().trim()
  if (c.tara === 'România' && local === 'oradea') return 'oradea'
  if (c.tara === 'România')                        return 'romania'
  return 'world'
}

const CAT_LABEL = { oradea: 'Oradea', romania: 'România', world: 'World' }
const CAT_BADGE = {
  oradea:  { background: '#FEF3C7', color: '#92400E' },
  romania: { background: '#DBEAFE', color: '#1D4ED8' },
  world:   { background: '#D1FAE5', color: '#065F46' },
}

// ── Helpers ────────────────────────────────────────────────────────────
function fmtDate(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  )
}

function exportJSON(customers) {
  const blob = new Blob([JSON.stringify(customers, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `noovo-customers-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(customers) {
  const headers = ['Nume','Email','Telefon','Sex','Vârstă','Localitate','Țară','Categorie','Data înregistrării']
  const rows = customers.map(c => [
    c.nume, c.email, c.telefon, c.sex, c.varsta,
    c.localitate, c.tara, CAT_LABEL[categorize(c)], fmtDate(c._creationTime || c.createdAt),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `noovo-customers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Components ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',     label: 'All',     activeCls: 'tab-all'     },
  { key: 'oradea',  label: 'Oradea',  activeCls: 'tab-oradea'  },
  { key: 'romania', label: 'România', activeCls: 'tab-romania' },
  { key: 'world',   label: 'World',   activeCls: 'tab-world'   },
]

const STAT_CARDS = [
  { key: 'total',   label: 'Total',   icon: '👥', bg: '#374151' },
  { key: 'oradea',  label: 'Oradea',  icon: '🏠', bg: '#92400E' },
  { key: 'romania', label: 'România', icon: '🇷🇴', bg: '#1D4ED8' },
  { key: 'world',   label: 'World',   icon: '🌍', bg: '#065F46' },
]

// ── Customer detail modal ──────────────────────────────────────────────
function CustomerModal({ customer, onClose, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const cat = categorize(customer)

  const rows = [
    { lbl: 'Email',       val: customer.email },
    { lbl: 'Telefon',     val: customer.telefon },
    { lbl: 'Sex',         val: customer.sex },
    { lbl: 'Vârstă',      val: customer.varsta + ' ani' },
    { lbl: 'Localitate',  val: customer.localitate },
    { lbl: 'Țară',        val: customer.tara },
    { lbl: 'Înregistrat', val: fmtDate(customer._creationTime ?? customer.createdAt ?? Date.now()) },
    { lbl: 'Notif. 36h',  val: customer.notif36h  ? '✅ Trimisă' : '⏳ Pending' },
    { lbl: 'Notif. 72h',  val: customer.notif72h  ? '✅ Trimisă' : '⏳ Pending' },
    { lbl: 'Notif. 7 zile',val: customer.notif7d  ? '✅ Trimisă' : '⏳ Pending' },
    { lbl: 'Notif. 30 zile',val: customer.notif30d ? '✅ Trimisă' : '⏳ Pending' },
  ]

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) { onClose(); setConfirmDel(false) } }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center', zIndex: 50,
      }}
    >
      <div
        className="slide-up"
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88dvh',
          overflowY: 'auto',
          padding: '1.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '1.2rem', color: '#1C1C1C', margin: 0 }}>{customer.nume}</h3>
            <span
              style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '2px 10px',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: 600,
                ...CAT_BADGE[cat],
              }}
            >
              {CAT_LABEL[cat]}
            </span>
          </div>
          <button
            onClick={() => { onClose(); setConfirmDel(false) }}
            style={{ fontSize: '1.4rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Rows */}
        <div style={{ marginTop: '1rem' }}>
          {rows.map(r => (
            <div
              key={r.lbl}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #F3F0EC',
              }}
            >
              <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>{r.lbl}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', textAlign: 'right', marginLeft: '1rem' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* Signature */}
        {customer.signature && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '6px' }}>Semnătură GDPR</p>
            <img
              src={customer.signature}
              alt="Signature"
              style={{ width: '100%', border: '1px solid #F3F0EC', borderRadius: '12px', background: '#fafafa' }}
            />
          </div>
        )}

        {/* Delete */}
        {!confirmDel ? (
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              marginTop: '1.5rem', width: '100%', padding: '12px',
              border: '1.5px solid #FECACA', borderRadius: '12px',
              background: '#fff', color: '#EF4444', cursor: 'pointer',
              fontWeight: 500, fontFamily: 'inherit', fontSize: '0.9rem',
            }}
          >
            Delete Entry
          </button>
        ) : (
          <div
            style={{
              marginTop: '1.5rem', padding: '1rem',
              background: '#FFF7F7', border: '1.5px solid #FECACA', borderRadius: '16px',
            }}
          >
            <p style={{ textAlign: 'center', color: '#DC2626', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              Delete this customer permanently?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmDel(false)}
                style={{
                  flex: 1, padding: '10px', border: '1.5px solid #E5E7EB', borderRadius: '10px',
                  background: '#fff', color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(customer._id); onClose() }}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                  background: '#EF4444', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function Dashboard({ customers, onBack, onDelete }) {
  const [tab, setTab]           = useState('all')
  const [q, setQ]               = useState('')
  const [selected, setSelected] = useState(null)
  const [showExport, setShowExport] = useState(false)

  const stats = useMemo(() => ({
    total:   customers.length,
    oradea:  customers.filter(c => categorize(c) === 'oradea').length,
    romania: customers.filter(c => categorize(c) === 'romania').length,
    world:   customers.filter(c => categorize(c) === 'world').length,
  }), [customers])

  const filtered = useMemo(() => {
    let list = customers
    if (tab !== 'all') list = list.filter(c => categorize(c) === tab)
    if (q) {
      const ql = q.toLowerCase()
      list = list.filter(c =>
        c.nume.toLowerCase().includes(ql) ||
        c.email.toLowerCase().includes(ql) ||
        c.localitate.toLowerCase().includes(ql) ||
        (c.telefon || '').includes(ql)
      )
    }
    return [...list].sort((a, b) => (b._creationTime ?? b.createdAt ?? 0) - (a._creationTime ?? a.createdAt ?? 0))
  }, [customers, tab, q])

  return (
    <div style={{ minHeight: '100dvh', background: '#F3F4F6' }}>

      {/* ── Header ── */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: '#fff',
          boxShadow: '0 1px 0 #E5E7EB',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div
          style={{
            maxWidth: '720px', margin: '0 auto',
            padding: '0.75rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}
        >
          <button
            onClick={onBack}
            style={{
              padding: '8px', borderRadius: '10px',
              border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <NoovoLogo scale={0.75} />
          </div>

          {/* Export menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExport(v => !v)}
              style={{
                padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                background: '#fff', cursor: 'pointer', color: '#8B6420', fontSize: '0.8rem',
                fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Export ▾
            </button>
            {showExport && (
              <div
                className="fade-in"
                style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: '#fff', border: '1.5px solid #E5E7EB',
                  borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 30, minWidth: '140px', overflow: 'hidden',
                }}
              >
                {[
                  { label: '⬇ JSON', action: () => { exportJSON(customers); setShowExport(false) } },
                  { label: '⬇ CSV',  action: () => { exportCSV(customers); setShowExport(false) } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'block', width: '100%', padding: '12px 16px',
                      border: 'none', background: 'none', cursor: 'pointer',
                      textAlign: 'left', fontSize: '0.875rem', color: '#374151',
                      fontFamily: 'inherit', fontWeight: 500,
                    }}
                    onMouseEnter={e => e.target.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.25rem' }}>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '1.25rem' }}>
          {STAT_CARDS.map(s => (
            <div
              key={s.key}
              style={{
                background: s.bg, color: '#fff',
                borderRadius: '16px', padding: '14px 8px',
                textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ fontSize: '1.3rem', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{stats[s.key]}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '3px', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
          <svg
            style={{ position: 'absolute', left: '14px', top: '14px', width: '20px', height: '20px', color: '#9CA3AF', pointerEvents: 'none' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text" value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, email, city, phone..."
            style={{
              width: '100%', paddingLeft: '44px', paddingRight: q ? '40px' : '16px',
              paddingTop: '13px', paddingBottom: '13px',
              border: '1.5px solid #E5E7EB', borderRadius: '14px',
              background: '#fff', fontSize: '16px', color: '#1C1C1C',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{
                position: 'absolute', right: '12px', top: '12px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9CA3AF', fontSize: '1rem',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map(t => {
            const count = t.key === 'all' ? stats.total : stats[t.key]
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={active ? t.activeCls : ''}
                style={{
                  flexShrink: 0,
                  padding: '8px 14px',
                  borderRadius: '99px',
                  border: active ? 'none' : '1.5px solid #E5E7EB',
                  background: active ? undefined : '#fff',
                  color: active ? undefined : '#6B7280',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                {t.label}
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 7px',
                    borderRadius: '99px',
                    background: active ? 'rgba(255,255,255,0.22)' : '#F3F4F6',
                    color: active ? '#fff' : '#6B7280',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9CA3AF' }} className="fade-in">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
              {customers.length === 0 ? '📋' : '🔍'}
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>
              {customers.length === 0 ? 'No customers yet' : 'No results found'}
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {customers.length === 0 ? 'Entries will appear here after registration' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="fade-in">
            {filtered.map(c => {
              const cat = categorize(c)
              return (
                <div
                  key={c._id}
                  onClick={() => setSelected(c)}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1.5px solid #F3F0EC',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F3F0EC'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: '#FEF3C7', color: '#92400E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: '1rem', flexShrink: 0,
                      }}
                    >
                      {c.nume.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1C1C1C' }}>{c.nume}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '2px' }}>{c.email}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '1px' }}>{c.telefon}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                    <span
                      style={{
                        padding: '3px 10px', borderRadius: '99px',
                        fontSize: '0.72rem', fontWeight: 600, ...CAT_BADGE[cat],
                      }}
                    >
                      {CAT_LABEL[cat]}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{c.localitate}, {c.tara}</span>
                    <span style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>
                      {fmtDate(c._creationTime ?? c.createdAt ?? Date.now())}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#D1D5DB', marginTop: '1.5rem' }}>
          {filtered.length} of {customers.length} entries
        </p>
      </div>

      {/* ── Customer modal ── */}
      {selected && (
        <CustomerModal
          customer={selected}
          onClose={() => setSelected(null)}
          onDelete={async (id) => { await onDelete(id); setSelected(null) }}
        />
      )}

      {/* Close export menu on outside click */}
      {showExport && (
        <div
          onClick={() => setShowExport(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 25 }}
        />
      )}
    </div>
  )
}
