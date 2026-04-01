import { useStreak } from '../hooks/useStreak'

const DIAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

function getMensagem(streak, hojeAtivo) {
  if (streak === 0 && !hojeAtivo) return 'Comece sua sequência hoje! 💪'
  if (streak <= 2) return 'Bom começo! Continue assim 💪'
  if (streak <= 6) return `${streak} dias seguidos! Não pare agora 🔥`
  if (streak <= 13) return `${streak} dias! Você está em chamas! 🔥🔥`
  if (streak <= 29) return `Incrível! ${streak} dias seguidos! 🏆`
  return `Lendário! ${streak} dias sem parar! 👑`
}

function FireIcon({ ativo, size = 32 }) {
  return (
    <div style={{
      fontSize: size,
      lineHeight: 1,
      animation: ativo ? 'fireFlicker 1.2s ease-in-out infinite' : 'none',
      filter: ativo ? 'drop-shadow(0 0 8px rgba(255, 140, 0, 0.6))' : 'grayscale(1) opacity(0.4)',
      transition: 'filter 0.4s ease',
    }}>
      🔥
    </div>
  )
}

export default function StreakWidget() {
  const { streak, recordeStreak, hojeAtivo, diasAtivosNaSemana, loading } = useStreak()

  if (loading) {
    return (
      <div style={{
        borderRadius: 0,
        background: 'var(--surface-2)',
        padding: '16px 18px',
        minHeight: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div className="spinner" />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Calculando sequência...</span>
      </div>
    )
  }

  const streakAtivo = streak > 0 || hojeAtivo
  const emRisco = streak > 0 && !hojeAtivo

  const corPrincipal = emRisco ? 'var(--amber)' : streakAtivo ? 'var(--text)' : 'var(--text-3)'
  const bgGlow = emRisco ? 'rgba(255, 177, 74, 0.08)' : streakAtivo ? 'rgba(243, 255, 202, 0.06)' : 'transparent'

  return (
    <div style={{
      borderRadius: 0,
      background: `linear-gradient(145deg, var(--surface-2), ${bgGlow})`,
      padding: '16px 18px',
      animation: 'floatIn .45s ease .06s both',
      boxShadow: streakAtivo ? `0 18px 42px rgba(0,0,0,0.55)` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56,
          borderRadius: 0,
          background: emRisco
            ? 'var(--surface-3)'
            : streakAtivo
              ? 'rgba(243, 255, 202, 0.12)'
              : 'rgba(255,255,255,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          animation: streakAtivo && !emRisco ? 'glowPulse 2.5s ease-in-out infinite' : 'none',
          clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        }}>
          <FireIcon ativo={streakAtivo} size={28} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)',
              color: corPrincipal, lineHeight: 1, letterSpacing: '-0.02em',
            }}>
              {streak}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: corPrincipal, opacity: 0.75, fontFamily: 'var(--font-tech)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {streak === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <p style={{
            fontSize: 12, color: emRisco ? 'var(--amber)' : 'var(--text-2)',
            marginTop: 3, lineHeight: 1.3, fontWeight: emRisco ? 600 : 400,
          }}>
            {emRisco ? '⚠️ Registre hoje para manter sua sequência!' : getMensagem(streak, hojeAtivo)}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 14, padding: '10px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 0,
      }}>
        {diasAtivosNaSemana.map((ativo, i) => {
          const ehHoje = (() => {
            const hoje = new Date()
            const diaSemana = hoje.getDay()
            const indiceSeg = diaSemana === 0 ? 6 : diaSemana - 1
            return i === indiceSeg
          })()

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: ehHoje ? 'var(--text)' : 'var(--text-3)' }}>
                {DIAS_SEMANA[i]}
              </span>
              <div style={{
                width: ehHoje ? 22 : 18, height: ehHoje ? 22 : 18, borderRadius: 0,
                background: ativo ? 'rgba(255,255,255,0.10)' : ehHoje ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
                boxShadow: ativo ? '0 0 16px rgba(255,255,255,0.06)' : 'none',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}>
                {ativo && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 18, height: 18, borderRadius: 0,
            background: hojeAtivo ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
            color: hojeAtivo ? 'var(--text)' : 'transparent',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}>
            {hojeAtivo ? '✓' : ''}
          </span>
          <span style={{ fontSize: 11, color: hojeAtivo ? 'var(--text)' : 'var(--text-3)', fontWeight: hojeAtivo ? 600 : 400 }}>
            {hojeAtivo ? 'Hoje registrado' : 'Hoje pendente'}
          </span>
        </div>

        {recordeStreak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Recorde:</span>
            <span style={{
              fontSize: 12, fontWeight: 800, color: streak >= recordeStreak ? 'var(--text)' : 'var(--text-2)',
              fontFamily: 'var(--font-display)',
            }}>
              {recordeStreak}
            </span>
            {streak >= recordeStreak && streak > 0 && <span style={{ fontSize: 11 }}>👑</span>}
          </div>
        )}
      </div>
    </div>
  )
}
