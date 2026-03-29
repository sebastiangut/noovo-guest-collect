import { useState, useRef } from 'react'
import NoovoLogo    from './NoovoLogo'
import SignaturePad from './SignaturePad'

const DASHBOARD_PIN = import.meta.env.VITE_DASHBOARD_PIN ?? '1234'

const COUNTRIES = [
  'România',
  '──────────',
  'Albania','Austria','Belarus','Belgia','Bosnia','Bulgaria','Cipru','Croația','Cehia',
  'Danemarca','Estonia','Finlanda','Franța','Germania','Grecia','Irlanda','Italia',
  'Letonia','Lituania','Luxembourg','Malta','Moldova','Muntenegru','Norvegia','Olanda',
  'Polonia','Portugalia','Serbia','Slovacia','Slovenia','Spania','Suedia','Elveția',
  'Turcia','Ucraina','Ungaria','Marea Britanie',
  '──────────',
  'Australia','Canada','China','India','Israel','Japonia','Mexic','SUA','Africa de Sud',
  'Brazilia','Argentina','Altă țară',
]

// ── Input + label wrapper ──────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div style={{ marginBottom: '0' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#4A3F30',
          marginBottom: '6px',
        }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  )
}

const baseInput = (hasErr) => ({
  width: '100%',
  padding: '14px 16px',
  border: `1.5px solid ${hasErr ? '#f87171' : '#E5E0D8'}`,
  borderRadius: '12px',
  fontSize: '16px',     // prevents iOS auto-zoom
  color: '#1C1C1C',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
})

// ── Main component ─────────────────────────────────────────────────────
export default function CustomerForm({ onSubmit, onDashboard }) {
  const [form, setForm] = useState({
    nume: '', email: '', telefon: '', sex: '', varsta: '', localitate: '', tara: 'România',
  })
  const [sig, setSig]       = useState(null)
  const [gdpr, setGdpr]     = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [pinOpen, setPinOpen] = useState(false)
  const [pin, setPin]         = useState('')
  const [pinErr, setPinErr]   = useState(false)
  const pinRef = useRef(null)

  const set = (f, v) => {
    setForm(p => ({ ...p, [f]: v }))
    setErrors(p => ({ ...p, [f]: null }))
  }

  // ── Validation ─────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.nume.trim())                             e.nume = 'Câmp obligatoriu'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email invalid'
    if (!form.telefon.trim())                          e.telefon = 'Câmp obligatoriu'
    if (!form.sex)                                     e.sex = 'Selectați sexul'
    const age = parseInt(form.varsta)
    if (!form.varsta || isNaN(age) || age < 18 || age > 120) e.varsta = 'Vârstă invalidă (min. 18)'
    if (!form.localitate.trim())                       e.localitate = 'Câmp obligatoriu'
    if (!form.tara || form.tara.startsWith('──'))      e.tara = 'Selectați țara'
    if (!sig)                                          e.sig = 'Semnătura este obligatorie'
    if (!gdpr)                                         e.gdpr = 'Acordul GDPR este obligatoriu'
    return e
  }

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await onSubmit({ ...form, varsta: form.varsta.toString(), signature: sig, gdprConsent: true })
      setDone(true)
      setTimeout(() => {
        setForm({ nume:'', email:'', telefon:'', sex:'', varsta:'', localitate:'', tara:'România' })
        setSig(null); setGdpr(false); setErrors({}); setDone(false)
      }, 3500)
    } catch (err) {
      console.error(err)
      alert('Eroare la salvare. Verificați conexiunea la internet.')
    } finally {
      setLoading(false)
    }
  }

  // ── PIN ────────────────────────────────────────────────────────────
  const openPin = () => {
    setPinOpen(true)
    setTimeout(() => pinRef.current?.focus(), 100)
  }
  const submitPin = () => {
    if (pin === DASHBOARD_PIN) {
      setPinOpen(false); setPin(''); setPinErr(false); onDashboard()
    } else {
      setPinErr(true); setPin('')
    }
  }

  // ── Success screen ─────────────────────────────────────────────────
  if (done) return (
    <div
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: '#F5F0E8',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🥂</div>
      <NoovoLogo />
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: '#8B6420', marginTop: '1.5rem' }}>
        Mulțumim!
      </h2>
      <p style={{ color: '#6B5B45', marginTop: '0.5rem' }}>Datele dvs. au fost înregistrate cu succes.</p>
      <p style={{ color: '#B0A090', fontSize: '0.875rem', marginTop: '0.25rem' }}>Ne bucurăm să vă avem alături.</p>
    </div>
  )

  const inp = (hasErr) => ({
    ...baseInput(hasErr),
    padding: '9px 12px',
  })

  return (
    <div style={{
      height: '100dvh',
      background: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 1px 0 #E8DFD0',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0.6rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <NoovoLogo scale={0.82} />
          <button onClick={openPin} aria-label="Staff dashboard" style={{
            padding: '8px', borderRadius: '50%', border: 'none',
            background: 'none', cursor: 'pointer', color: '#9CA3AF',
          }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Two-column form ── */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        gap: '1.25rem',
      }} className="fade-in">

        {/* ── Left column: input fields ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>

          <div style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#5E3A10', margin: 0 }}>
              Înregistrare Client
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '2px 0 0' }}>
              Câmpurile marcate cu * sunt obligatorii
            </p>
          </div>

          <Field label="Nume și Prenume" error={errors.nume} required>
            <input type="text" value={form.nume} onChange={e => set('nume', e.target.value)}
              placeholder="ex: Ion Popescu" style={inp(errors.nume)} />
          </Field>

          <Field label="Adresă Email" error={errors.email} required>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="adresa@email.ro" style={inp(errors.email)} />
          </Field>

          <Field label="Număr de Telefon" error={errors.telefon} required>
            <input type="tel" value={form.telefon} onChange={e => set('telefon', e.target.value)}
              placeholder="+40 7xx xxx xxx" style={inp(errors.telefon)} />
          </Field>

          <Field label="Sex" error={errors.sex} required>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Masculin', 'Feminin'].map(s => (
                <button key={s} type="button" onClick={() => set('sex', s)} style={{
                  flex: 1, padding: '9px 12px', borderRadius: '12px',
                  border: `1.5px solid ${form.sex === s ? '#8B6420' : '#E5E0D8'}`,
                  background: form.sex === s ? '#8B6420' : '#fff',
                  color: form.sex === s ? '#fff' : '#374151',
                  fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                  {s === 'Masculin' ? '♂ Masculin' : '♀ Feminin'}
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="Vârstă" error={errors.varsta} required>
              <input type="number" value={form.varsta} min={18} max={120}
                onChange={e => set('varsta', e.target.value)}
                placeholder="ex: 35" style={inp(errors.varsta)} />
            </Field>
            <Field label="Localitate" error={errors.localitate} required>
              <input type="text" value={form.localitate}
                onChange={e => set('localitate', e.target.value)}
                placeholder="ex: Oradea" style={inp(errors.localitate)} />
            </Field>
          </div>

          <Field label="Țară" error={errors.tara} required>
            <select value={form.tara} onChange={e => set('tara', e.target.value)}
              style={{ ...inp(errors.tara), appearance: 'auto' }}>
              {COUNTRIES.map((c, i) => (
                <option key={i} value={c} disabled={c.startsWith('──')}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* ── Right column: signature + GDPR + submit ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {/* Semnătură — flex: 1 to fill height */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: '#4A3F30', marginBottom: '6px' }}>
              Semnătură <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <SignaturePad
                fillHeight
                onChange={(data, cleared) => {
                  setSig(cleared ? null : data)
                  if (!cleared) setErrors(p => ({ ...p, sig: null }))
                }}
              />
            </div>
            {errors.sig && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.sig}</p>}
          </div>

          {/* GDPR */}
          <div style={{
            flexShrink: 0,
            padding: '0.6rem 0.75rem',
            borderRadius: '12px',
            border: `1.5px solid ${errors.gdpr ? '#fca5a5' : '#FDE68A'}`,
            background: errors.gdpr ? '#fef2f2' : '#FFFBEB',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={gdpr}
                onChange={e => { setGdpr(e.target.checked); setErrors(p => ({ ...p, gdpr: null })) }}
                style={{ width: '18px', height: '18px', marginTop: '2px', flexShrink: 0, accentColor: '#8B6420' }}
              />
              <span style={{ fontSize: '0.72rem', lineHeight: 1.5, color: '#4B5563' }}>
                Sunt de acord cu <strong>prelucrarea datelor cu caracter personal</strong> în conformitate cu
                Regulamentul (UE) 2016/679 (GDPR). Datele vor fi utilizate exclusiv pentru comunicări de
                marketing ale <strong>NOO'VO Resto Lounge</strong> și nu vor fi transmise terților.
                Îmi pot retrage acordul oricând contactând restaurantul.{' '}
                <span style={{ color: '#ef4444' }}>*</span>
              </span>
            </label>
            {errors.gdpr && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px', marginLeft: '28px' }}>{errors.gdpr}</p>}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            flexShrink: 0,
            width: '100%', padding: '14px',
            borderRadius: '14px', border: 'none',
            background: loading ? '#D1B896' : 'linear-gradient(135deg, #8B6420 0%, #C9A96E 100%)',
            color: '#fff', fontSize: '1rem', fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            transition: 'opacity 0.2s',
            fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(139,100,32,0.3)',
          }}>
            {loading ? 'Se salvează...' : 'Trimite înregistrarea'}
          </button>
        </div>
      </div>

      {/* ── PIN Modal ── */}
      {pinOpen && (
        <div
          className="fade-in"
          onClick={e => { if (e.target === e.currentTarget) { setPinOpen(false); setPin(''); setPinErr(false) } }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '280px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <NoovoLogo scale={0.7} />
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: 500 }}>
                Staff Dashboard Access
              </p>
            </div>
            <input
              ref={pinRef}
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinErr(false) }}
              onKeyDown={e => e.key === 'Enter' && submitPin()}
              placeholder="PIN"
              maxLength={6}
              style={{
                ...baseInput(pinErr),
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5em',
                marginBottom: '0.75rem',
              }}
            />
            {pinErr && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                PIN incorect. Încercați din nou.
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setPinOpen(false); setPin(''); setPinErr(false) }}
                style={{
                  flex: 1, padding: '12px', border: '1.5px solid #E5E0D8',
                  borderRadius: '12px', background: '#fff', color: '#6B7280',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                }}
              >
                Anulare
              </button>
              <button
                onClick={submitPin}
                style={{
                  flex: 1, padding: '12px', border: 'none',
                  borderRadius: '12px', background: '#8B6420', color: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                }}
              >
                Intră
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
