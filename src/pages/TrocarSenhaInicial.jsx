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
      setErro('As senhas não conferem.')
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
    <div className="page" style={{ justifyContent: 'center', paddingTop: 'calc(var(--safe-top) + 24px)' }}>
      <div className="anim" style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
        <p className="overline">Segurança</p>
        <h1 className="display" style={{ fontSize: 34, marginTop: 6 }}>
          Trocar senha inicial
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 10, marginBottom: 18, maxWidth: 460, lineHeight: 1.45 }}>
          Altere sua senha temporária para continuar usando o app.
        </p>

        <div className="plate plate-3 plate-pad-lg" style={{ background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="field">
            <label>Nova senha</label>
            <input
              type="password" className="input" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres" required
            />
          </div>

          <div className="field">
            <label>Confirmar senha</label>
            <input
              type="password" className="input" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Repita a nova senha" required
            />
          </div>

          {erro && (
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
            }}>
              {erro}
            </div>
          )}
          {ok && (
            <div style={{
              background: 'rgba(83,255,138,0.12)',
              border: 'none',
              borderRadius: 0,
              padding: '12px 14px',
              fontSize: 12,
              color: 'var(--green)',
              fontFamily: 'var(--font-tech)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {ok}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{
            marginTop: 8, padding: '18px', fontSize: 12,
          }}>
            {loading ? 'Atualizando...' : 'Salvar nova senha'}
          </button>
          </form>
        </div>
      </div>
    </div>
  )
}
