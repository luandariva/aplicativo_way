import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { resolveUsuarioDb } from '../lib/usuarioDb'

function toNum(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function inicioEFimDoDia() {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + 1)
  return { inicio, fim }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [treinoHoje, setTreinoHoje] = useState(null)
  const [treinoFoiConcluidoHoje, setTreinoFoiConcluidoHoje] = useState(false)
  const [refeicoesHoje, setRefeicoesHoje] = useState([])

  useEffect(() => {
    let alive = true

    async function carregarResumoRapido() {
      if (!user?.id) {
        if (alive) {
          setErro('Usuario nao autenticado.')
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setErro('')

      try {
        const { usuarioId } = await resolveUsuarioDb(user)
        if (!usuarioId) throw new Error('Usuario nao encontrado.')

        const { inicio, fim } = inicioEFimDoDia()
        const hojeIso = inicio.toISOString().slice(0, 10)

        const [treinoPlanoRes, treinoRealizadoRes, refeicoesRes] = await Promise.all([
          supabase
            .from('treinos_plano')
            .select('id, nome, categoria, exercicios, data_prevista')
            .eq('usuario_id', usuarioId)
            .eq('data_prevista', hojeIso)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('treinos_realizados')
            .select('id, nome, exercicios, concluido, data_hora')
            .eq('usuario_id', usuarioId)
            .gte('data_hora', inicio.toISOString())
            .lt('data_hora', fim.toISOString())
            .eq('concluido', true)
            .order('data_hora', { ascending: false })
            .limit(1),
          supabase
            .from('refeicoes')
            .select('*')
            .eq('usuario_id', usuarioId)
            .gte('data_hora', inicio.toISOString())
            .lt('data_hora', fim.toISOString())
            .order('data_hora', { ascending: true }),
        ])

        if (treinoPlanoRes.error) throw treinoPlanoRes.error
        if (treinoRealizadoRes.error) throw treinoRealizadoRes.error
        if (refeicoesRes.error) throw refeicoesRes.error

        if (!alive) return
        const treinoConcluidoHoje = treinoRealizadoRes.data?.[0] || null
        const treinoPlanejadoHoje = treinoPlanoRes.data?.[0] || null
        setTreinoFoiConcluidoHoje(Boolean(treinoConcluidoHoje))
        setTreinoHoje(treinoConcluidoHoje || treinoPlanejadoHoje || null)
        setRefeicoesHoje(refeicoesRes.data || [])
      } catch (err) {
        if (alive) setErro(err?.message || 'Falha ao carregar resumo do dia.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    carregarResumoRapido()
    return () => { alive = false }
  }, [user?.id, user?.email])

  const nomeSaudacao = useMemo(() => {
    const nomeEmail = String(user?.email || '').split('@')[0]
    return nomeEmail || 'Aluno'
  }, [user?.email])

  const resumoRefeicoes = useMemo(() => {
    const total = refeicoesHoje.length
    const pendentes = refeicoesHoje.filter((r) => String(r.status || '').toLowerCase().includes('pend')).length
    const kcal = refeicoesHoje.reduce((acc, r) => acc + toNum(r.kcal ?? r.calorias ?? r.calorias_kcal), 0)
    return { total, pendentes, kcal }
  }, [refeicoesHoje])

  const exerciciosTreinoHoje = Array.isArray(treinoHoje?.exercicios) ? treinoHoje.exercicios.length : 0

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '16px',
      paddingTop: 'calc(var(--safe-top) + 12px)',
      paddingBottom: 'calc(86px + var(--safe-bottom))',
    }}>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ola, {nomeSaudacao}</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          lineHeight: 1.05,
          fontWeight: 900,
          color: 'var(--green)',
        }}>
          Resumo rapido do dia
        </h1>
      </div>

      {loading && (
        <div style={{
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-muted)',
          padding: 14,
          fontSize: 13,
        }}>
          Carregando dados de treino e refeicoes...
        </div>
      )}

      {!loading && erro && (
        <div style={{
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: '#ff7676',
          padding: 14,
          fontSize: 13,
        }}>
          {erro}
        </div>
      )}

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'linear-gradient(145deg, #13161b, #0a0c0f)',
        padding: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Treino do dia</p>
            <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {treinoHoje?.nome || 'Sem treino planejado hoje'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/treino')}
            style={{
              borderRadius: 10,
              background: 'var(--green)',
              color: '#111',
              padding: '8px 10px',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            Abrir treinos
          </button>
        </div>

        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg-card)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Exercicios</p>
            <p style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>{exerciciosTreinoHoje}</p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg-card)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Status</p>
            <p style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>
              {treinoHoje ? (treinoFoiConcluidoHoje ? 'Concluido' : 'Pendente') : '--'}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Refeicoes de hoje</p>
            <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {resumoRefeicoes.total > 0 ? `${resumoRefeicoes.total} registradas` : 'Nenhuma refeicao registrada'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/nutricao')}
            style={{
              borderRadius: 10,
              background: 'var(--green)',
              color: '#111',
              padding: '8px 10px',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            Abrir dieta
          </button>
        </div>

        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Total</p>
            <p style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>{resumoRefeicoes.total}</p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Pendentes</p>
            <p style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>{resumoRefeicoes.pendentes}</p>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', background: 'var(--bg)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Kcal</p>
            <p style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 18 }}>{resumoRefeicoes.kcal}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
