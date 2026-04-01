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
    <div className="page" style={{ justifyContent: 'center', paddingTop: 'calc(var(--safe-top) + 24px)' }}>
      <div className="anim" style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <p className="overline">Acesso</p>
          <div style={{ marginTop: 8 }}>
            <img
              src="/logo_way_512.svg"
              alt="Way"
              style={{
                height: 110,
                width: 'auto',
                maxWidth: '100%',
                display: 'block',
                objectFit: 'contain',
              }}
            />
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 8, maxWidth: 320, lineHeight: 1.45 }}>
            Treino e nutrição com precisão. Sem distrações.
          </p>
        </div>

        <div className="plate plate-3 plate-pad-lg" style={{
          background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>Email</label>
            <input
              type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              type="password" className="input" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,90,95,0.12)',
              border: 'none',
              borderRadius: 0,
              padding: '12px 14px',
              fontSize: 12,
              color: 'var(--red)',
              fontFamily: 'var(--font-tech)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{
            marginTop: 8, padding: '18px', fontSize: 12,
          }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          </form>
        </div>
      </div>
    </div>
  )
}
