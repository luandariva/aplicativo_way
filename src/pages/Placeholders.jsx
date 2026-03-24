import { useState } from 'react'

export function Nutricao() {
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
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Plano do dia</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color: 'var(--green)' }}>
          Dieta
        </h1>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'linear-gradient(145deg, #13161b, #0a0c0f)',
        padding: 14,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>Resumo de hoje</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Meta kcal', value: '2.100' },
            { label: 'Consumido', value: '1.340' },
            { label: 'Proteina', value: '98g' },
            { label: 'Saldo', value: '760 kcal' },
          ].map((item) => (
            <div key={item.label} style={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              padding: '10px 11px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)' }}>Macros</h2>
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Progresso</span>
        </div>
        {[
          { nome: 'Proteina', atual: 98, meta: 160, cor: 'var(--green)' },
          { nome: 'Carboidrato', atual: 156, meta: 240, cor: 'var(--blue)' },
          { nome: 'Gordura', atual: 42, meta: 70, cor: 'var(--amber)' },
        ].map((m) => {
          const pct = Math.min(100, Math.round((m.atual / m.meta) * 100))
          return (
            <div key={m.nome} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span>{m.nome}</span>
                <span style={{ color: 'var(--text-muted)' }}>{m.atual} / {m.meta}g</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: m.cor, borderRadius: 999 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: 14,
      }}>
        <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 10 }}>Refeicoes</h2>
        {[
          { nome: 'Cafe da manha', kcal: '380 kcal', status: 'Registrada' },
          { nome: 'Almoco', kcal: '620 kcal', status: 'Registrada' },
          { nome: 'Pre-treino', kcal: '340 kcal', status: 'Registrada' },
          { nome: 'Jantar', kcal: '760 kcal disponiveis', status: 'Pendente' },
        ].map((r, i) => (
          <div key={r.nome} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <p style={{ fontSize: 14 }}>{r.nome}</p>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{r.kcal}</p>
            </div>
            <span style={{
              fontSize: 11,
              borderRadius: 999,
              padding: '6px 9px',
              background: r.status === 'Registrada' ? 'rgba(201,242,77,0.14)' : 'rgba(255,255,255,0.05)',
              color: r.status === 'Registrada' ? 'var(--green)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Evolucao() {
  const [filtro, setFiltro] = useState('semanal')

  const opcoes = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensal', label: 'Mensal' },
    { id: 'metas', label: 'Metas' },
  ]

  const dados = {
    semanal: {
      titulo: 'Ultimos 7 dias',
      kpi: [
        { label: 'Treinos', valor: '5' },
        { label: 'Kcal medias', valor: '1.820' },
        { label: 'Proteina media', valor: '132g' },
        { label: 'Aderencia', valor: '84%' },
      ],
    },
    mensal: {
      titulo: 'Ultimos 30 dias',
      kpi: [
        { label: 'Treinos', valor: '19' },
        { label: 'Kcal medias', valor: '1.910' },
        { label: 'Proteina media', valor: '128g' },
        { label: 'Aderencia', valor: '79%' },
      ],
    },
    metas: {
      titulo: 'Progresso das metas',
      kpi: [
        { label: 'Peso', valor: '-2.1kg' },
        { label: 'Percentual gordura', valor: '-1.8%' },
        { label: 'Massa magra', valor: '+0.6kg' },
        { label: 'Constancia', valor: '22 dias' },
      ],
    },
  }

  const atual = dados[filtro]

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
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Acompanhamento</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color: 'var(--green)' }}>
          Evolucao
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {opcoes.map((op) => {
          const ativo = op.id === filtro
          return (
            <button
              key={op.id}
              onClick={() => setFiltro(op.id)}
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
              {op.label}
            </button>
          )
        })}
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'linear-gradient(145deg, #13161b, #0a0c0f)',
        padding: 14,
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{atual.titulo}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {atual.kpi.map((item) => (
            <div key={item.label} style={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              padding: '10px 11px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{item.valor}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: 14,
      }}>
        <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 10 }}>Resumo rapido</h2>
        {[
          'Seu ritmo de treinos esta acima da media da ultima quinzena.',
          'A proteina diaria esta consistente e próxima da meta.',
          'Mantenha a regularidade nos finais de semana para acelerar os resultados.',
        ].map((texto, i) => (
          <div key={i} style={{
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            lineHeight: 1.45,
          }}>
            {texto}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Perfil() {
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
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Conta</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 900, color: 'var(--green)' }}>
          Perfil
        </h1>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'linear-gradient(145deg, #13161b, #0a0c0f)',
        padding: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'var(--green)',
            color: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 20,
          }}>
            D
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)' }}>Dariva</p>
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Plano Performance</p>
          </div>
        </div>
      </div>

      <div style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: 14,
      }}>
        {[
          { label: 'Email', value: 'dariva@email.com' },
          { label: 'Objetivo', value: 'Ganho de massa' },
          { label: 'Nivel', value: 'Intermediario' },
        ].map((item, i) => (
          <div key={item.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{item.label}</span>
            <span style={{ fontSize: 13 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
