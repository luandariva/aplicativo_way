import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function TrocarSenhaInicial() {
  const { markPasswordUpdated } = useAuth()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setOk('')

    if (novaSenha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (novaSenha !== confirmacao) {
      setErro('As senhas nao conferem.')
      return
    }

    setLoading(true)
    const { error } = await markPasswordUpdated(novaSenha)
    if (error) {
      setErro(error.message || 'Falha ao trocar senha.')
      setLoading(false)
      return
    }
    setOk('Senha atualizada com sucesso.')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Trocar senha inicial
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
          Por seguranca, altere sua senha temporaria para continuar.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nova senha
            </div>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Minimo 8 caracteres"
              required
              style={{ width: '100%', color: 'var(--text)', fontSize: 15, background: 'none' }}
            />
          </div>

          <div style={{
            background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Confirmar senha
            </div>
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Repita a nova senha"
              required
              style={{ width: '100%', color: 'var(--text)', fontSize: 15, background: 'none' }}
            />
          </div>

          {erro && (
            <div style={{
              background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
              borderRadius: 'var(--radius-xs)', padding: '10px 14px', fontSize: 13, color: '#F09595',
            }}>
              {erro}
            </div>
          )}
          {ok && (
            <div style={{
              background: 'rgba(90,190,120,0.12)', border: '1px solid rgba(90,190,120,0.35)',
              borderRadius: 'var(--radius-xs)', padding: '10px 14px', fontSize: 13, color: '#b7f0c4',
            }}>
              {ok}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, background: 'var(--green)', color: '#fff',
            borderRadius: 'var(--radius-sm)', padding: '16px',
            fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-display)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Atualizando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
