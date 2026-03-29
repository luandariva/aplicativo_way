import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { resolveUsuarioDb } from '../lib/usuarioDb'
import './Historico.css'

function toNum(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function pick(obj, keys, fallback = null) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return fallback
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return String(dateStr)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)
  const dia = new Date(d)
  dia.setHours(0, 0, 0, 0)

  if (dia.getTime() === hoje.getTime()) return 'Hoje'
  if (dia.getTime() === ontem.getTime()) return 'Ontem'

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d)
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function dayKey(dateStr) {
  const d = new Date(dateStr)
  return d.toISOString().slice(0, 10)
}

/* ─── Icons ─── */
function DumbbellIcon({ size = 18, color = 'var(--lime)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14.4 14.4 5.6 5.6" /><path d="M22 14.8v3.4c0 .8-.5 1.5-1.2 1.7l-1.3.4c-.6.2-1.3-.2-1.5-.8L18 19" />
      <path d="M10.8 19.2l-5.6-5.6" /><path d="M2.8 5.6 2 4.2c-.2-.6.2-1.3.8-1.5l1.3-.4c.8-.2 1.5.3 1.7 1.1L6 4.6" />
      <path d="m13.8 13.8 2-2" /><path d="m10.2 10.2-2 2" /><path d="m6.6 6.6-2 2" /><path d="m17.4 17.4-2 2" />
      <path d="M13 13 5 5" /><path d="m19 19-8-8" />
      <path d="M7.4 7.4 6 6c-.8-.8-.8-2 0-2.8s2-.8 2.8 0l1.4 1.4" />
      <path d="m16.6 16.6 1.4 1.4c.8.8.8 2 0 2.8s-2 .8-2.8 0l-1.4-1.4" />
    </svg>
  )
}

function MealIcon({ size = 18, color = 'var(--amber)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}

function CalendarIcon({ size = 18, color = 'var(--text-3)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronIcon({ direction = 'down', size = 16, color = 'var(--text-3)' }) {
  const rotation = direction === 'up' ? 180 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform .2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function EmptyIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  )
}

const ITEMS_PER_PAGE = 20

export default function Historico() {
  const { user } = useAuth()
  const [filtro, setFiltro] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [treinos, setTreinos] = useState([])
  const [refeicoes, setRefeicoes] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!user?.id) {
        if (alive) { setErro('Usuário não autenticado.'); setLoading(false) }
        return
      }
      setLoading(true)
      setErro('')

      try {
        const { usuarioId } = await resolveUsuarioDb(user)
        if (!usuarioId) throw new Error('Usuário não encontrado.')

        const [trRes, refRes] = await Promise.all([
          supabase
            .from('treinos_realizados')
            .select('id, nome, exercicios, concluido, data_hora')
            .eq('usuario_id', usuarioId)
            .order('data_hora', { ascending: false })
            .limit(100),
          supabase
            .from('refeicoes')
            .select('*')
            .eq('usuario_id', usuarioId)
            .order('data_hora', { ascending: false })
            .limit(100),
        ])

        if (trRes.error) throw trRes.error
        if (refRes.error) throw refRes.error

        if (alive) {
          setTreinos(trRes.data || [])
          setRefeicoes(refRes.data || [])
        }
      } catch (err) {
        if (alive) setErro(err?.message || 'Falha ao carregar histórico.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => { alive = false }
  }, [user?.id, user?.email])

  // Reset page when filter changes
  useEffect(() => { setPage(1) }, [filtro])

  const items = useMemo(() => {
    const treinoItems = treinos.map((t) => ({
      id: `treino-${t.id}`,
      type: 'treino',
      nome: t.nome || 'Treino',
      data: t.data_hora,
      concluido: t.concluido,
      categoria: t.categoria || '',
      duracao: t.duracao_min || null,
      exercicios: Array.isArray(t.exercicios) ? t.exercicios : [],
    }))

    const refeicaoItems = refeicoes.map((r) => ({
      id: `refeicao-${r.id}`,
      type: 'refeicao',
      nome: pick(r, ['nome', 'refeicao', 'tipo_refeicao'], 'Refeição'),
      data: pick(r, ['data_hora', 'horario', 'created_at']),
      kcal: toNum(pick(r, ['kcal', 'calorias', 'calorias_kcal'])),
      proteina: toNum(pick(r, ['proteina_g', 'proteina', 'proteinas_g'])),
      carboidrato: toNum(pick(r, ['carboidrato_g', 'carboidrato', 'carbo_g'])),
      gordura: toNum(pick(r, ['gordura_g', 'gordura', 'lipideos_g'])),
      status: String(pick(r, ['status', 'situacao'], 'registrada')).toLowerCase().includes('pend') ? 'Pendente' : 'Registrada',
      observacoes: pick(r, ['observacoes', 'observacao', 'descricao'], ''),
    }))

    let all = []
    if (filtro === 'todos') all = [...treinoItems, ...refeicaoItems]
    else if (filtro === 'treino') all = treinoItems
    else all = refeicaoItems

    all.sort((a, b) => new Date(b.data) - new Date(a.data))
    return all
  }, [treinos, refeicoes, filtro])

  const paginatedItems = useMemo(() => items.slice(0, page * ITEMS_PER_PAGE), [items, page])
  const hasMore = paginatedItems.length < items.length

  const grouped = useMemo(() => {
    const map = new Map()
    for (const item of paginatedItems) {
      const key = item.data ? dayKey(item.data) : 'sem-data'
      if (!map.has(key)) map.set(key, { dateLabel: formatDate(item.data), items: [] })
      map.get(key).items.push(item)
    }
    return [...map.entries()]
  }, [paginatedItems])

  // Stats
  const stats = useMemo(() => {
    const trTotal = treinos.length
    const refTotal = refeicoes.length
    const kcalTotal = refeicoes.reduce((acc, r) => acc + toNum(pick(r, ['kcal', 'calorias', 'calorias_kcal'])), 0)
    const uniqueDays = new Set([
      ...treinos.map(t => dayKey(t.data_hora || '')),
      ...refeicoes.map(r => dayKey(pick(r, ['data_hora', 'horario', 'created_at']) || '')),
    ].filter(Boolean))
    return { trTotal, refTotal, kcalTotal, diasAtivos: uniqueDays.size }
  }, [treinos, refeicoes])

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const tabs = [
    { id: 'todos', label: 'Todos', icon: '📋' },
    { id: 'treino', label: 'Treinos', icon: '💪' },
    { id: 'refeicao', label: 'Refeições', icon: '🍽️' },
  ]

  return (
    <div className="hist-container">
      {/* ─── Header ─── */}
      <div className="hist-header">
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>Acompanhamento</p>
        <h1 className="hist-title">Histórico</h1>
      </div>

      {/* ─── Stats Overview ─── */}
      <div className="resumo-card anim" style={{ padding: 16 }}>
        <div className="stats-grid">
          {[
            { label: 'Treinos', value: stats.trTotal, color: 'var(--lime)' },
            { label: 'Refeições', value: stats.refTotal, color: 'var(--amber)' },
            { label: 'Kcal', value: stats.kcalTotal > 9999 ? `${(stats.kcalTotal / 1000).toFixed(1)}k` : stats.kcalTotal, color: 'var(--red)' },
            { label: 'Dias', value: stats.diasAtivos, color: 'var(--blue)' },
          ].map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="tab-group">
        {tabs.map((tab) => {
          const ativo = tab.id === filtro
          return (
            <button
              key={tab.id}
              onClick={() => setFiltro(tab.id)}
              className={`tab-btn ${ativo ? 'active' : ''}`}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="dash-loading anim">
          <div className="spinner" />
          <span>Carregando histórico...</span>
        </div>
      )}

      {/* ─── Error ─── */}
      {!loading && erro && (
        <div className="dash-warning anim">
          {erro}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && !erro && items.length === 0 && (
        <div className="dash-warning anim" style={{ padding: '40px 20px', flexDirection: 'column', gap: 12 }}>
          <EmptyIcon />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)' }}>Nenhum registro encontrado</p>
        </div>
      )}

      {/* ─── Timeline ─── */}
      {!loading && !erro && grouped.map(([key, group], groupIdx) => (
        <div key={key} className="timeline-group anim" style={{ animationDelay: `${0.1 + groupIdx * 0.05}s` }}>
          <div className="day-header">
            <span className="day-label">{group.dateLabel}</span>
            <div className="day-line" />
            <span className="day-count">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
          </div>

          <div className="hist-list">
            {group.items.map((item, idx) => {
              const isExpanded = expandedId === item.id
              const isTreino = item.type === 'treino'
              const accentColor = isTreino ? 'var(--lime)' : 'var(--amber)'
              const bgAccent = isTreino ? 'var(--lime-dim)' : 'rgba(255, 145, 77, 0.08)'

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className={`hist-item-btn ${isExpanded ? 'expanded' : ''}`}
                  >
                    <div className="icon-box" style={{ background: isTreino ? 'var(--lime-dim)' : 'rgba(255,145,77,0.1)', borderColor: isTreino ? 'var(--lime-border)' : 'rgba(255,145,77,0.2)' }}>
                      {isTreino ? <DumbbellIcon size={20} color={accentColor} /> : <MealIcon size={20} color={accentColor} />}
                    </div>

                    <div className="hist-item-info">
                      <div className="hist-item-title">{item.nome}</div>
                      <div className="hist-item-meta">
                        <span>{formatTime(item.data)}</span>
                        {isTreino ? (
                          <span className={`badge-status ${item.concluido ? 'concluido' : 'pendente'}`}>
                            {item.concluido ? '✓ OK' : '○ PENDENTE'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{item.kcal} kcal</span>
                        )}
                      </div>
                    </div>

                    <ChevronIcon direction={isExpanded ? 'up' : 'down'} color={isExpanded ? accentColor : 'var(--text-3)'} />
                  </button>

                  {isExpanded && (
                    <div className="details-box">
                      {isTreino ? (
                        <div className="anim">
                          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            {item.categoria && <span className="tag" style={{ background: 'var(--lime-dim)', color: 'var(--lime)', border: '1px solid var(--lime-border)' }}>{item.categoria}</span>}
                            {item.duracao && <span className="tag">{item.duracao} min</span>}
                            <span className="tag">{item.exercicios.length} exs</span>
                          </div>

                          {item.exercicios.length > 0 && (
                            <div className="ex-list-mini">
                              {item.exercicios.slice(0, 10).map((ex, ei) => {
                                const exNome = typeof ex === 'string' ? ex : (ex?.nome || ex?.exercicio || `Exercício ${ei + 1}`)
                                const series = ex?.series || ex?.sets || null
                                const reps = ex?.repeticoes || ex?.reps || null
                                return (
                                  <div key={ei} className="ex-item-mini">
                                    <span style={{ color: 'var(--text-2)' }}>{exNome}</span>
                                    {(series || reps) && <span style={{ color: 'var(--text-3)', fontWeight: 800 }}>{series && `${series}x`}{reps}</span>}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="anim">
                          <div className="macro-grid">
                            {[
                              { label: 'KCAL', val: item.kcal, color: 'var(--red)' },
                              { label: 'PROT', val: item.proteina, color: 'var(--blue)' },
                              { label: 'CARB', val: item.carboidrato, color: 'var(--amber)' },
                              { label: 'GORD', val: item.gordura, color: 'var(--purple)' },
                            ].map((m) => (
                              <div key={m.label} className="macro-item">
                                <div className="macro-val" style={{ color: m.color }}>{m.val}</div>
                                <div className="macro-lab">{m.label}</div>
                              </div>
                            ))}
                          </div>

                          {item.observacoes && (
                            <div className="input-field" style={{ padding: 12, borderRadius: 12, background: 'var(--bg-3)', opacity: 0.8 }}>
                              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, fontWeight: 700 }}>OBSERVAÇÕES</p>
                              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{item.observacoes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ─── Load More ─── */}
      {hasMore && !loading && (
        <button
          type="button"
          onClick={() => setPage(p => p + 1)}
          className="btn anim"
          style={{ width: '100%', marginTop: 8 }}
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
