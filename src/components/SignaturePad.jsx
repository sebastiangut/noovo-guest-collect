import { useRef, useState, useCallback, useEffect } from 'react'

export default function SignaturePad({ onChange, fillHeight = false }) {
  const canvasRef    = useRef(null)
  const wrapperRef   = useRef(null)
  const drawing      = useRef(false)
  const lastPt       = useRef(null)
  const [empty, setEmpty] = useState(true)
  const dpr = window.devicePixelRatio || 1

  // ── Init / resize canvas ────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.parentElement.getBoundingClientRect()
    const w = rect.width
    const h = fillHeight ? rect.height : 130
    canvas.style.width  = w + 'px'
    canvas.style.height = h + 'px'
    canvas.width  = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.lineCap    = 'round'
    ctx.lineJoin   = 'round'
    ctx.lineWidth  = 2.2
    ctx.strokeStyle = '#1C1C1C'
  }, [dpr, fillHeight])

  useEffect(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
    return () => window.removeEventListener('resize', initCanvas)
  }, [initCanvas])

  // ── Coordinate helper ───────────────────────────────────────────────
  const getXY = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  // ── Draw handlers ───────────────────────────────────────────────────
  const onStart = useCallback(e => {
    e.preventDefault()
    drawing.current = true
    const pt = getXY(e, canvasRef.current)
    lastPt.current = pt
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 1.1, 0, Math.PI * 2)
    ctx.fillStyle = '#1C1C1C'
    ctx.fill()
  }, [])

  const onMove = useCallback(e => {
    if (!drawing.current) return
    e.preventDefault()
    const pt = getXY(e, canvasRef.current)
    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(lastPt.current.x, lastPt.current.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    lastPt.current = pt
    setEmpty(false)
  }, [])

  const onStop = useCallback(() => {
    if (!drawing.current) return
    drawing.current = false
    onChange(canvasRef.current.toDataURL('image/png'), false)
  }, [onChange])

  // ── Event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    const c = canvasRef.current
    c.addEventListener('touchstart', onStart, { passive: false })
    c.addEventListener('touchmove',  onMove,  { passive: false })
    c.addEventListener('touchend',   onStop)
    c.addEventListener('mousedown',  onStart)
    c.addEventListener('mousemove',  onMove)
    c.addEventListener('mouseup',    onStop)
    c.addEventListener('mouseleave', onStop)
    return () => {
      c.removeEventListener('touchstart', onStart)
      c.removeEventListener('touchmove',  onMove)
      c.removeEventListener('touchend',   onStop)
      c.removeEventListener('mousedown',  onStart)
      c.removeEventListener('mousemove',  onMove)
      c.removeEventListener('mouseup',    onStop)
      c.removeEventListener('mouseleave', onStop)
    }
  }, [onStart, onMove, onStop])

  // ── Clear ───────────────────────────────────────────────────────────
  const clear = () => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setEmpty(true)
    onChange(null, true)
  }

  return (
    <div ref={wrapperRef} style={fillHeight ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
      <div
        style={{
          position: 'relative',
          border: '2px dashed #FCD34D',
          borderRadius: '12px',
          background: '#fff',
          overflow: 'hidden',
          ...(fillHeight ? { flex: 1 } : { minHeight: '130px' }),
        }}
      >
        <canvas ref={canvasRef} className="sig-canvas" />
        {empty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              color: '#B0A090',
              fontStyle: 'italic',
              fontSize: '0.9rem',
            }}
          >
            Semnați aici...
          </div>
        )}
      </div>
      {!empty && (
        <button
          onClick={clear}
          type="button"
          style={{
            marginTop: '8px',
            fontSize: '0.85rem',
            color: '#92400E',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          ✕ Șterge semnătura
        </button>
      )}
    </div>
  )
}
