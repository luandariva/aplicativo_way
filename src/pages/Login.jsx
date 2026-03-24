import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg)',
    }}>
      <div style={{ animation: 'fadeUp .5s ease both', width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--green-muted)', border: '1px solid var(--border-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28
          }}>🥗</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            AlimentaAI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
            Seu treino e nutricao em um lugar
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: '14px 16px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              style={{ width: '100%', color: 'var(--text)', fontSize: 15, background: 'none' }}
            />
          </div>

          <div style={{
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: '14px 16px'
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Senha</div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: '100%', color: 'var(--text)', fontSize: 15, background: 'none' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
              borderRadius: 'var(--radius-xs)', padding: '10px 14px',
              fontSize: 13, color: '#F09595'
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, background: 'var(--green)', color: '#fff',
            borderRadius: 'var(--radius-sm)', padding: '16px',
            fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)',
            opacity: loading ? 0.7 : 1, transition: 'opacity .2s, transform .1s',
            letterSpacing: '0.02em',
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
