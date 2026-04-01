import { useEffect, useRef, useMemo } from 'react'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const DAY_NAMES = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function WeekCalendar({ selectedDate, onSelectDate }) {
  const containerRef = useRef(null)

  const days = useMemo(() => {
    const list = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = -15; i <= 15; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      list.push(d)
    }
    return list
  }, [])

  const headerText = useMemo(() => {
    if (!selectedDate) return ''
    const m = MONTH_NAMES[selectedDate.getMonth()]
    const y = selectedDate.getFullYear()
    return `${m} ${y}`
  }, [selectedDate])

  useEffect(() => {
    if (!containerRef.current || !selectedDate) return
    const activeEl = containerRef.current.querySelector('.cal-item-active')
    if (activeEl) {
      const parent = containerRef.current
      const offset = activeEl.offsetLeft - parent.offsetWidth / 2 + activeEl.offsetWidth / 2
      parent.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [selectedDate])

  function isSameDay(d1, d2) {
    if (!d1 || !d2) return false
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  }

  return (
    <div className="anim" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0, marginLeft: 2, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
        {headerText}
      </h2>

      <div 
        ref={containerRef}
        style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 14, msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        className="hide-scroll-cal"
      >
        <style dangerouslySetInnerHTML={{__html: `.hide-scroll-cal::-webkit-scrollbar { display: none; }`}} />

        {days.map((d) => {
          const active = isSameDay(d, selectedDate)
          return (
              <div 
              key={d.toISOString()}
              className={`cal-item ${active ? 'cal-item-active' : ''}`}
              onClick={() => onSelectDate(d)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minWidth: 52, height: 68, borderRadius: 0,
                background: active ? 'var(--hi-bg)' : 'var(--surface-2)',
                color: active ? 'var(--hi-fg)' : 'var(--text-2)',
                cursor: 'pointer', transition: 'all 0.2s', position: 'relative', flexShrink: 0,
                border: 'none',
                clipPath: active
                  ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                  : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: active ? 'rgba(0,0,0,0.62)' : 'var(--text-3)', letterSpacing: '0.14em', fontFamily: 'var(--font-tech)', textTransform: 'uppercase' }}>
                {DAY_NAMES[d.getDay()]}
              </span>
              <span style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.02em' }}>
                {d.getDate()}
              </span>

              {active && (
                <div style={{ position: 'absolute', bottom: -10, width: 16, height: 3, borderRadius: 0, background: 'var(--hi-bg)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
