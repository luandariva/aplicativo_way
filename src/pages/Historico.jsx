import { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { resolveUsuarioDb } from '../lib/usuarioDb'

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
function DumbbellIcon({ size = 18, color = '#34d399' }) {
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

function MealIcon({ size = 18, color = '#ff914d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}

function CalendarIcon({ size = 18, color = 'var(--text-dim)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function ChevronIcon({ direction = 'down', size = 16, color = 'var(--text-dim)' }) {
  const rotation = direction === 'up' ? 180 : 0
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform .2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function EmptyIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
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
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '16px',
      paddingTop: 'calc(var(--safe-top) + 12px)',
      paddingBottom: 'calc(86px + var(--safe-bottom))',
    }}>
      {/* ─── Header ─── */}
      <div style={{ animation: 'floatIn .4s ease-out' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Acompanhamento</p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900,
          background: 'linear-gradient(135deg, var(--green) 0%, #a8d83a 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -0.5,
        }}>
          Histórico
        </h1>
      </div>

      {/* ─── Stats Overview ─── */}
      <div style={{
        borderRadius: 22,
        background: 'linear-gradient(145deg, rgba(15,16,18,0.95), rgba(23,25,29,0.85))',
        padding: '18px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        animation: 'floatIn .45s ease-out .05s both',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 100, height: 100, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,242,77,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Treinos', value: stats.trTotal, color: '#34d399' },
            { label: 'Refeições', value: stats.refTotal, color: '#ff914d' },
            { label: 'Kcal total', value: stats.kcalTotal > 9999 ? `${(stats.kcalTotal / 1000).toFixed(1)}k` : stats.kcalTotal, color: '#ff5e5e' },
            { label: 'Dias ativos', value: stats.diasAtivos, color: '#5f9dff' },
          ].map((s) => (
            <div key={s.label} style={{
              textAlign: 'center',
              padding: '8px 4px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800,
                color: s.color, lineHeight: 1.1,
              }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, fontWeight: 600, letterSpacing: 0.2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div style={{
        display: 'flex', gap: 8,
        animation: 'floatIn .45s ease-out .1s both',
      }}>
        {tabs.map((tab) => {
          const ativo = tab.id === filtro
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltro(tab.id)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                whiteSpace: 'nowrap',
                borderRadius: 14,
                padding: '10px 12px',
                fontSize: 12,
                fontWeight: 700,
                border: ativo ? '1px solid rgba(201,242,77,0.3)' : '1px solid rgba(255,255,255,0.07)',
                background: ativo
                  ? 'linear-gradient(135deg, rgba(201,242,77,0.15), rgba(201,242,77,0.05))'
                  : 'rgba(255,255,255,0.025)',
                color: ativo ? 'var(--green)' : 'var(--text-dim)',
                transition: 'all .2s ease',
                letterSpacing: 0.3,
              }}
            >
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div style={{
          borderRadius: 16,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '24px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          animation: 'floatIn .4s ease-out',
        }}>
          <div style={{
            width: 20, height: 20, border: '2px solid var(--border)',
            borderTopColor: 'var(--green)', borderRadius: '50%',
            animation: 'spin .7s linear infinite',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando histórico...</span>
        </div>
      )}

      {/* ─── Error ─── */}
      {!loading && erro && (
        <div style={{
          borderRadius: 16,
          border: '1px solid rgba(225,95,95,0.2)',
          background: 'rgba(225,95,95,0.06)',
          padding: '14px 16px',
          color: '#ff7676',
          fontSize: 13,
          animation: 'floatIn .4s ease-out',
        }}>
          {erro}
        </div>
      )}

      {/* ─── Empty State ─── */}
      {!loading && !erro && items.length === 0 && (
        <div style={{
          borderRadius: 22,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          padding: '40px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          animation: 'floatIn .5s ease-out',
        }}>
          <EmptyIcon />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)' }}>
            Nenhum registro encontrado
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
            {filtro === 'treino'
              ? 'Seus treinos concluídos aparecerão aqui.'
              : filtro === 'refeicao'
                ? 'Suas refeições registradas aparecerão aqui.'
                : 'Registre treinos e refeições para ver seu histórico.'}
          </p>
        </div>
      )}

      {/* ─── Timeline ─── */}
      {!loading && !erro && grouped.map(([key, group], groupIdx) => (
        <div key={key} style={{ animation: `floatIn .45s ease-out ${0.1 + groupIdx * 0.04}s both` }}>
          {/* Day header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 10,
          }}>
            <CalendarIcon size={14} color="var(--green-dim)" />
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--green)',
              fontFamily: 'var(--font-display)',
              letterSpacing: 0.2,
              textTransform: 'capitalize',
            }}>
              {group.dateLabel}
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
              {group.items.length} {group.items.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* Items */}
          <div style={{
            borderRadius: 18,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {group.items.map((item, idx) => {
              const isExpanded = expandedId === item.id
              const isTreino = item.type === 'treino'
              const accentColor = isTreino ? '#34d399' : '#ff914d'
              const bgAccent = isTreino ? 'rgba(52,211,153,0.08)' : 'rgba(255,145,77,0.08)'

              return (
                <div key={item.id}>
                  {/* Main row */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: isExpanded ? bgAccent : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 14px',
                      borderBottom: idx < group.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background .2s ease',
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                      background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${accentColor}15`,
                    }}>
                      {isTreino ? <DumbbellIcon size={18} color={accentColor} /> : <MealIcon size={18} color={accentColor} />}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: '#fff',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.nome}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          {formatTime(item.data)}
                        </span>
                        {isTreino && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                            color: item.concluido ? '#34d399' : '#efb144',
                            background: item.concluido ? 'rgba(52,211,153,0.12)' : 'rgba(239,177,68,0.12)',
                            padding: '2px 7px', borderRadius: 6,
                          }}>
                            {item.concluido ? 'Concluído' : 'Pendente'}
                          </span>
                        )}
                        {!isTreino && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                            color: '#ff914d',
                          }}>
                            {item.kcal} kcal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronIcon direction={isExpanded ? 'up' : 'down'} color={isExpanded ? accentColor : 'var(--text-dim)'} />
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 14px 14px',
                      background: bgAccent,
                      animation: 'floatIn .25s ease-out',
                    }}>
                      {isTreino ? (
                        <div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                            {item.categoria && (
                              <span style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                                color: accentColor, background: `${accentColor}15`,
                                padding: '4px 10px', borderRadius: 8,
                                border: `1px solid ${accentColor}20`,
                              }}>
                                {item.categoria}
                              </span>
                            )}
                            {item.duracao && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px 10px', borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}>
                                ⏱ {item.duracao} min
                              </span>
                            )}
                            <span style={{
                              fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                              background: 'rgba(255,255,255,0.05)',
                              padding: '4px 10px', borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                              {item.exercicios.length} exercícios
                            </span>
                          </div>

                          {item.exercicios.length > 0 && (
                            <div style={{
                              borderRadius: 12, background: 'rgba(0,0,0,0.2)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              padding: '8px 0', maxHeight: 200, overflowY: 'auto',
                            }}>
                              {item.exercicios.slice(0, 10).map((ex, ei) => {
                                const exNome = typeof ex === 'string' ? ex : (ex?.nome || ex?.exercicio || `Exercício ${ei + 1}`)
                                const series = ex?.series || ex?.sets || null
                                const reps = ex?.repeticoes || ex?.reps || null
                                return (
                                  <div key={ei} style={{
                                    padding: '7px 12px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderBottom: ei < Math.min(item.exercicios.length, 10) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                  }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                      {exNome}
                                    </span>
                                    {(series || reps) && (
                                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
                                        {series && `${series}x`}{reps && `${reps}`}
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                              {item.exercicios.length > 10 && (
                                <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-dim)' }}>
                                  +{item.exercicios.length - 10} mais...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6,
                            marginBottom: item.observacoes ? 10 : 0,
                          }}>
                            {[
                              { label: 'Calorias', value: `${item.kcal}`, unit: 'kcal', color: '#ff5e5e' },
                              { label: 'Proteína', value: `${item.proteina}`, unit: 'g', color: '#5f9dff' },
                              { label: 'Carbo', value: `${item.carboidrato}`, unit: 'g', color: '#efb144' },
                              { label: 'Gordura', value: `${item.gordura}`, unit: 'g', color: '#a78bfa' },
                            ].map((m) => (
                              <div key={m.label} style={{
                                textAlign: 'center',
                                borderRadius: 10,
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                padding: '8px 4px',
                              }}>
                                <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 800, color: m.color, lineHeight: 1 }}>
                                  {m.value}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, fontWeight: 600 }}>
                                  {m.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          {item.observacoes && (
                            <div style={{
                              borderRadius: 10, background: 'rgba(0,0,0,0.15)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              padding: '8px 12px',
                            }}>
                              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 3 }}>Observações</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {item.observacoes}
                              </p>
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
          style={{
            width: '100%',
            borderRadius: 14,
            padding: '12px',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--green)',
            background: 'rgba(201,242,77,0.06)',
            border: '1px solid rgba(201,242,77,0.15)',
            cursor: 'pointer',
            transition: 'all .2s ease',
            letterSpacing: 0.3,
            animation: 'floatIn .4s ease-out',
          }}
        >
          Carregar mais
        </button>
      )}
    </div>
  )
}
