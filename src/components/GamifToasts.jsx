import { useEffect, useRef, useState } from 'react'

const SPRING = 'cubic-bezier(.34,1.56,.64,1)'
const ENTER_DUR = '0.48s'
const EXIT_DUR = '0.36s'

function toastMotion(phase) {
  const base = {
    position: 'fixed',
    left: '50%',
    zIndex: 9999,
    pointerEvents: 'none',
    maxWidth: 320,
    width: 'calc(100vw - 32px)',
    transition: `transform ${phase === 'out' ? EXIT_DUR : ENTER_DUR} ${SPRING}, opacity ${phase === 'out' ? EXIT_DUR : '0.32s'} ${SPRING}`,
  }
  if (phase === 'in') {
    return { ...base, transform: 'translateX(-50%) translateY(-26px) scale(0.85)', opacity: 0 }
  }
  if (phase === 'idle') {
    return { ...base, transform: 'translateX(-50%) translateY(0) scale(1)', opacity: 1 }
  }
  return { ...base, transform: 'translateX(-50%) translateY(-14px) scale(0.94)', opacity: 0 }
}

/**
 * Toast quando uma conquista (badge) é desbloqueada. Entrada com “spring” físico.
 */
export function BadgeToast({ badge, onClose, top = 'calc(var(--safe-top) + 16px)' }) {
  const [phase, setPhase] = useState('in')
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('idle'))
    })
    const hide = setTimeout(() => setPhase('out'), 4200)
    const unmount = setTimeout(() => closeRef.current?.(), 4200 + 380)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hide)
      clearTimeout(unmount)
    }
  }, [])

  return (
    <div style={{
      top,
      ...toastMotion(phase),
      background: 'var(--glass)',
      backdropFilter: 'blur(var(--glass-blur))',
      border: 'none',
      borderRadius: 0, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 0,
        background: 'rgba(255,255,255,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0,
        boxShadow: '0 18px 44px rgba(0,0,0,0.55)',
        animation: 'checkPop .5s cubic-bezier(0.16, 1, 0.3, 1)',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
      }}>
        {badge?.icone || '🏆'}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 2, fontFamily: 'var(--font-tech)' }}>
          Conquista!
        </p>
        <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: 1.2, textTransform: 'uppercase' }}>
          {badge?.titulo || 'Nova conquista'}
        </p>
      </div>
    </div>
  )
}

/**
 * Toast após finalizar treino. Mesma curva de entrada em spring.
 */
export function PontosToast({ texto, onClose, top = 'calc(var(--safe-top) + 16px)' }) {
  const [phase, setPhase] = useState('in')
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('idle'))
    })
    const hide = setTimeout(() => setPhase('out'), 4800)
    const unmount = setTimeout(() => closeRef.current?.(), 4800 + 380)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hide)
      clearTimeout(unmount)
    }
  }, [])

  return (
    <div style={{
      top,
      ...toastMotion(phase),
      zIndex: 9998,
      background: 'var(--glass)',
      backdropFilter: 'blur(var(--glass-blur))',
      border: 'none',
      borderRadius: 0, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 0,
        background: 'rgba(243, 255, 202, 0.12)',
        border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
      }}>
        ⚡
      </div>
      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.2, fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>{texto}</p>
    </div>
  )
}
