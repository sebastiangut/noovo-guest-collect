export default function NoovoLogo({ scale = 1 }) {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center top',
        display: 'inline-block',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2.4rem',
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: '#8B6420',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        NOO<span style={{ fontStyle: 'italic', letterSpacing: '0.06em' }}>'</span>VO
      </div>
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 400,
          letterSpacing: '0.5em',
          color: '#A07530',
          textAlign: 'center',
          marginTop: '2px',
          textTransform: 'uppercase',
        }}
      >
        RESTO LOUNGE
      </div>
    </div>
  )
}
