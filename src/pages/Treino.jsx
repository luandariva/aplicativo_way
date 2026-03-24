import { useRef, useState } from 'react'

const CATEGORIAS = [
  { id: 'all', label: 'Todos os treinos' },
  { id: 'chest', label: 'Peito' },
  { id: 'upper', label: 'Membros superiores' },
  { id: 'legs', label: 'Pernas' },
]

const MOCK_TREINOS_DISPONIVEIS = [
  {
    id: 't1',
    nome: 'Peito + Triceps',
    categoria: 'chest',
    thumb: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=60',
    personal: 'Eduardo P.',
    exercicios: [
      { id: 1, nome: 'Supino reto', series: 4, repeticoes: 10, carga: 80, met: 5.0, video_url: null },
      { id: 2, nome: 'Crucifixo inclinado', series: 3, repeticoes: 12, carga: 20, met: 4.5, video_url: null },
      { id: 3, nome: 'Triceps corda', series: 3, repeticoes: 15, carga: 35, met: 4.0, video_url: null },
      { id: 4, nome: 'Mergulho no banco', series: 3, repeticoes: 0, carga: 0, met: 4.0, video_url: null },
    ]
  },
  {
    id: 't2',
    nome: 'Costas + Biceps',
    categoria: 'upper',
    thumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=60',
    personal: 'Eduardo P.',
    exercicios: [
      { id: 5, nome: 'Puxada alta', series: 4, repeticoes: 12, carga: 55, met: 4.7, video_url: null },
      { id: 6, nome: 'Remada curvada', series: 4, repeticoes: 10, carga: 60, met: 5.2, video_url: null },
      { id: 7, nome: 'Rosca direta', series: 3, repeticoes: 12, carga: 25, met: 4.1, video_url: null },
    ]
  },
  {
    id: 't3',
    nome: 'Pernas',
    categoria: 'legs',
    thumb: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=900&q=60',
    personal: 'Eduardo P.',
    exercicios: [
      { id: 8, nome: 'Agachamento livre', series: 4, repeticoes: 8, carga: 90, met: 6.0, video_url: null },
      { id: 9, nome: 'Leg press', series: 4, repeticoes: 12, carga: 180, met: 5.6, video_url: null },
      { id: 10, nome: 'Extensora', series: 3, repeticoes: 15, carga: 40, met: 4.2, video_url: null },
      { id: 11, nome: 'Panturrilha em pe', series: 4, repeticoes: 20, carga: 50, met: 3.8, video_url: null },
    ]
  }
]

function treinoIcone(categoria) {
  if (categoria === 'chest') return '💪'
  if (categoria === 'upper') return '🏋️'
  if (categoria === 'legs') return '🦵'
  return '🔥'
}

function labelCategoria(categoria) {
  if (categoria === 'chest') return 'Peito'
  if (categoria === 'upper') return 'Membros superiores'
  if (categoria === 'legs') return 'Pernas'
  return 'Treino'
}

function resetExercicios(exercicios) {
  return exercicios.map(ex => ({ ...ex, concluido: false, series_feitas: [] }))
}

function SerieButton({ numero, feita, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 40, height: 40, borderRadius: '50%',
      background: feita ? 'var(--green)' : 'var(--bg-input)',
      border: `1px solid ${feita ? 'transparent' : 'var(--border)'}`,
      color: feita ? '#121212' : 'var(--text-muted)',
      fontSize: 13, fontWeight: 700, display: 'flex',
      alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
    }}>
      {feita ? '✓' : numero}
    </button>
  )
}

function ExercicioCard({ ex, index, onToggleSerie, onToggleConcluido, expandido, onExpand }) {
  const totalFeitas = ex.series_feitas.length
  const progresso = ex.series > 0 ? (totalFeitas / ex.series) * 100 : 0

  return (
    <div style={{
      background: ex.concluido ? 'rgba(201,242,77,0.09)' : 'var(--bg-card)',
      border: `1px solid ${ex.concluido ? 'var(--border-strong)' : 'var(--border)'}`,
      borderRadius: 16, overflow: 'hidden', transition: 'all .25s',
      animation: `fadeUp .3s ease ${index * 0.06}s both`,
    }}>
      <button
        onClick={() => onExpand(ex.id)}
        style={{
          width: '100%', background: 'none', color: 'inherit', border: 'none',
          padding: 14, display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: ex.concluido ? 'var(--green)' : 'var(--bg-input)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ex.concluido ? '#111' : 'var(--text-muted)', fontWeight: 700,
        }}>
          {ex.concluido ? '✓' : index + 1}
        </div>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            color: ex.concluido ? 'var(--text-muted)' : 'var(--text)',
            textDecoration: ex.concluido ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {ex.nome}
          </p>
          <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>
            {ex.series}x{ex.repeticoes > 0 ? ex.repeticoes : 'falha'} {ex.carga > 0 ? `• ${ex.carga}kg` : ''} • {totalFeitas}/{ex.series}
          </p>
        </div>
        <span style={{ color: 'var(--text-dim)' }}>{expandido ? '▴' : '▾'}</span>
      </button>

      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', margin: '0 14px' }}>
        <div style={{ height: '100%', width: `${progresso}%`, background: 'var(--green)', transition: 'width .3s ease' }} />
      </div>

      {expandido && (
        <div style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>Series</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {Array.from({ length: ex.series }).map((_, i) => (
              <SerieButton
                key={i}
                numero={i + 1}
                feita={ex.series_feitas.includes(i)}
                onClick={() => onToggleSerie(ex.id, i)}
              />
            ))}
          </div>
          <button
            onClick={() => onToggleConcluido(ex.id)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontWeight: 700,
              background: ex.concluido ? 'var(--bg-input)' : 'var(--green)',
              color: ex.concluido ? 'var(--text-muted)' : '#111',
              border: `1px solid ${ex.concluido ? 'var(--border)' : 'transparent'}`,
            }}
          >
            {ex.concluido ? 'Desmarcar' : 'Marcar como feito'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Treino() {
  const [treinoSelecionadoId, setTreinoSelecionadoId] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('all')
  const [filtroPersonal, setFiltroPersonal] = useState('todos')
  const [busca, setBusca] = useState('')
  const [treino, setTreino] = useState({ id: null, nome: '', categoria: '', personal: '', exercicios: [] })
  const [expandido, setExpandido] = useState(null)
  const [concluindo, setConcluindo] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const scrollRef = useRef(null)
  const personais = ['todos', ...Array.from(new Set(MOCK_TREINOS_DISPONIVEIS.map((t) => t.personal)))]

  const treinosFiltrados = MOCK_TREINOS_DISPONIVEIS.filter((t) => {
    const termo = busca.trim().toLowerCase()
    const passouBusca = !termo ||
      t.nome.toLowerCase().includes(termo) ||
      labelCategoria(t.categoria).toLowerCase().includes(termo) ||
      t.personal.toLowerCase().includes(termo) ||
      t.exercicios.some((ex) => ex.nome.toLowerCase().includes(termo))
    const passouCategoria = filtroCategoria === 'all' || t.categoria === filtroCategoria
    const passouPersonal = filtroPersonal === 'todos' || t.personal === filtroPersonal
    return passouBusca && passouCategoria && passouPersonal
  })

  const totalExercicios = treino.exercicios.length
  const concluidos = treino.exercicios.filter(e => e.concluido).length
  const progresso = totalExercicios > 0 ? (concluidos / totalExercicios) * 100 : 0

  function selecionarTreino(t) {
    setTreinoSelecionadoId(t.id)
    setConcluido(false)
    setExpandido(null)
    setTreino({
      id: t.id,
      nome: t.nome,
      categoria: t.categoria,
      personal: t.personal,
      exercicios: resetExercicios(t.exercicios),
    })
  }

  function toggleSerie(exId, serieIdx) {
    setTreino(prev => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) => {
        if (ex.id !== exId) return ex
        const jaFeita = ex.series_feitas.includes(serieIdx)
        const novas = jaFeita ? ex.series_feitas.filter(i => i !== serieIdx) : [...ex.series_feitas, serieIdx]
        return { ...ex, series_feitas: novas, concluido: novas.length >= ex.series }
      })
    }))
  }

  function toggleConcluido(exId) {
    setTreino(prev => ({
      ...prev,
      exercicios: prev.exercicios.map((ex) => {
        if (ex.id !== exId) return ex
        const novo = !ex.concluido
        return { ...ex, concluido: novo, series_feitas: novo ? Array.from({ length: ex.series }, (_, i) => i) : [] }
      })
    }))
  }

  async function finalizarTreino() {
    setConcluindo(true)
    await new Promise((r) => setTimeout(r, 1200))
    setConcluido(true)
    setConcluindo(false)
  }

  if (!treinoSelecionadoId) {
    return (
      <div style={{
        minHeight: '100dvh', padding: '16px', paddingTop: 'calc(var(--safe-top) + 12px)',
        paddingBottom: 'calc(86px + var(--safe-bottom))', display: 'flex',
        flexDirection: 'column', gap: 12, overflowY: 'auto',
      }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900 }}>Treinos</h1>

        <div style={{ position: 'relative' }}>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar treino..."
            style={{
              width: '100%', height: 44, borderRadius: 12, background: 'var(--bg-input)',
              border: '1px solid var(--border)', padding: '0 44px 0 12px', fontSize: 14,
            }}
          />
          <span style={{ position: 'absolute', right: 14, top: 12, color: 'var(--green)' }}>⌕</span>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIAS.map((cat) => {
            const ativo = cat.id === filtroCategoria
            return (
              <button
                key={cat.id}
                onClick={() => setFiltroCategoria(cat.id)}
                style={{
                  whiteSpace: 'nowrap', borderRadius: 12, padding: '8px 12px',
                  fontSize: 12, fontWeight: 700, border: '1px solid var(--border)',
                  background: ativo ? 'var(--green)' : 'var(--bg-card)',
                  color: ativo ? '#111' : 'var(--text-muted)',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {personais.map((personal) => {
            const ativo = personal === filtroPersonal
            return (
              <button
                key={personal}
                onClick={() => setFiltroPersonal(personal)}
                style={{
                  whiteSpace: 'nowrap',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  border: '1px solid var(--border)',
                  background: ativo ? 'var(--green)' : 'var(--bg-card)',
                  color: ativo ? '#111' : 'var(--text-muted)',
                }}
              >
                {personal === 'todos' ? 'Todos os personais' : personal}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {treinosFiltrados.map((t, i) => (
            <button
              key={t.id}
              onClick={() => selecionarTreino(t)}
              style={{
                textAlign: 'left', borderRadius: 16, border: '1px solid var(--border)',
                background: 'var(--bg-card)', overflow: 'hidden', animation: `floatIn .25s ease ${i * 0.05}s both`,
                color: 'var(--text)',
              }}
            >
              <div style={{
                minHeight: 145,
                backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.72), rgba(0,0,0,0.25)), url(${t.thumb})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                padding: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: 'rgba(0,0,0,0.42)',
                    border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20,
                  }}>
                    {treinoIcone(t.categoria)}
                  </div>
                  <span style={{
                    padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 700,
                    color: '#f5f7fa',
                  }}>
                    {labelCategoria(t.categoria)}
                  </span>
                  <span style={{
                    padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 700,
                    color: '#f5f7fa',
                  }}>
                    {t.exercicios.length} exercicios
                  </span>
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'var(--green)',
                  color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                }}>
                  ▶
                </div>
              </div>
            </button>
          ))}

          {treinosFiltrados.length === 0 && (
            <div style={{
              borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-dim)', textAlign: 'center', padding: 18,
            }}>
              Nenhum treino encontrado para os filtros selecionados.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (concluido) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: 28, textAlign: 'center',
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%', background: 'var(--green)',
          color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 16, boxShadow: 'var(--shadow-glow)',
        }}>
          ✓
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 8 }}>Treino concluido!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Saldo atualizado e envio para WhatsApp em andamento.</p>
        <button
          onClick={() => { setConcluido(false); setTreinoSelecionadoId(null) }}
          style={{
            background: 'var(--green)', color: '#111', borderRadius: 12,
            fontWeight: 800, padding: '12px 18px',
          }}
        >
          Voltar para catalogo
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', paddingTop: 'var(--safe-top)' }}>
      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
        <div style={{
          borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', minHeight: 150,
          backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.25)), url(${MOCK_TREINOS_DISPONIVEIS.find(t => t.id === treinoSelecionadoId)?.thumb})`,
          backgroundSize: 'cover', backgroundPosition: 'center', padding: 12, display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setTreinoSelecionadoId(null)}
              style={{
                width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
              }}
            >
              ←
            </button>
            <span style={{
              padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.45)',
              border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 700,
            }}>
              {concluidos}/{totalExercicios} feitos
            </span>
          </div>
          <div>
            <p style={{ fontSize: 28 }}>{treinoIcone(treino.categoria)}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Personal: {treino.personal}</p>
          </div>
        </div>

        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progresso}%`, background: 'var(--green)', transition: 'width .4s ease' }} />
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '12px 16px',
          paddingBottom: 'calc(88px + var(--safe-bottom))', display: 'flex',
          flexDirection: 'column', gap: 10,
        }}
      >
        {treino.exercicios.map((ex, i) => (
          <ExercicioCard
            key={ex.id}
            ex={ex}
            index={i}
            expandido={expandido === ex.id}
            onExpand={(id) => setExpandido((prev) => prev === id ? null : id)}
            onToggleSerie={toggleSerie}
            onToggleConcluido={toggleConcluido}
          />
        ))}

        {totalExercicios > 0 && (
          <button
            onClick={finalizarTreino}
            disabled={concluindo || concluidos !== totalExercicios}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              background: concluidos === totalExercicios ? 'var(--green)' : 'var(--bg-input)',
              color: concluidos === totalExercicios ? '#111' : 'var(--text-muted)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginTop: 4,
              border: `1px solid ${concluidos === totalExercicios ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {concluindo
              ? 'Enviando para WhatsApp...'
              : concluidos === totalExercicios
                ? 'Finalizar treino'
                : 'Conclua todos os exercicios para finalizar'}
          </button>
        )}
      </div>
    </div>
  )
}
