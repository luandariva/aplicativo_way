# PRD — AlimentaAI PWA

**Documento:** Product Requirements Document  
**Produto:** AlimentaAI (PWA para alunos de academia)  
**Versão do app:** 1.0.0  
**Última atualização:** março/2026  

---

## 1. Visão e contexto

### 1.1 Resumo executivo

O **AlimentaAI PWA** é um aplicativo web progressivo voltado a **alunos** que acompanham **treino** e **nutrição** prescritos pela academia ou pelo profissional. O produto prioriza uso em **smartphone**, pode ser **instalado na tela inicial** e funciona com **autenticação** e dados persistidos no **Supabase**, com integração opcional a **n8n** para pós-processamento ao concluir treinos (ex.: cálculo de gasto calórico, notificações).

### 1.2 Problema que resolve

- Centralizar no celular o **plano do dia** (treino + refeições) sem depender de planilhas ou mensagens soltas.
- Permitir **execução guiada do treino** (séries, exercícios, vídeos) e **registro de conclusão** com persistência no backend.
- Oferecer **visão de dieta** (macros, refeições, status) e **histórico** para acompanhamento de adesão.
- Reforçar engajamento com **gamificação** (pontos, badges, streak) quando o backend expõe as funções/tabelas necessárias.

### 1.3 Objetivos de produto

| Objetivo | Métrica sugerida |
|----------|------------------|
| Adesão ao plano de treino | % de dias com treino concluído vs. planejado |
| Retorno ao app | Sessões semanais por usuário ativo |
| Uso da PWA instalada | % de usuários com `display-mode: standalone` (analytics) |
| Confiabilidade | Taxa de erro em salvamento de treino / login |

### 1.4 Fora de escopo (implícito no código atual)

- Cadastro self-service público (fluxo depende de usuário criado no ecossistema Supabase/academia).
- Portal do personal ou da academia (outro produto).
- Edição completa de planilha de treino/dieta pelo aluno no app (dados vêm principalmente do backend; há fluxos de treino criado pelo aluno conforme modelo de dados).

---

## 2. Personas e stakeholders

| Persona | Necessidade principal |
|---------|------------------------|
| **Aluno** | Ver o dia, treinar, marcar progresso, consultar dieta e histórico. |
| **Academia / operação** | Dados consistentes no Supabase, integração com automações (n8n). |
| **Nutricionista / personal (indireto)** | Planos refletidos em `treinos_plano`, `refeicoes`, `metas_macros`. |

---

## 3. Stack técnica (implementação atual)

| Camada | Tecnologia |
|--------|------------|
| UI | React 18, React Router v6 |
| Build | Vite 5 |
| Auth / DB | Supabase (Auth email/senha + PostgREST) |
| PWA | `vite-plugin-pwa` (manifest, Workbox, `standalone`, orientação retrato) |
| Automação | Webhook HTTP (`VITE_N8N_WEBHOOK_TREINO`) ao finalizar treino |

**Variáveis de ambiente:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_N8N_WEBHOOK_TREINO` (opcional).

---

## 4. Jornadas principais

### 4.1 Onboarding e segurança

1. Aluno acessa o app → se não autenticado, **Login** (email/senha).
2. Se `usuarios.must_change_password` estiver ativo → fluxo **Trocar senha inicial** antes do restante do app.
3. Sessão mantida via Supabase; logout disponível no contexto de auth.

### 4.2 Dia a dia — Início (Dashboard `/`)

- Saudação com identificação derivada do email (ou nome quando disponível).
- **Calendário semanal** para escolher o dia.
- Resumo do dia selecionado:
  - Treino planejado **ou** último treino **concluído** naquele dia.
  - Lista/resumo de **refeições** do dia (kcal, proteína, pendentes).
- Atalhos para treino e componentes de **streak** / gamificação quando aplicável.

### 4.3 Treino (`/treino`)

- Listagem/filtragem de treinos por **categoria** (ex.: peito, membros superiores, pernas).
- Detalhe do treino: exercícios com execução **série a série**, suporte a **vídeo** (YouTube, Vimeo, arquivo direto ou link).
- Persistência em `treinos_plano` / `treinos_realizados` conforme implementação.
- Ao **concluir**: gravação no Supabase e **POST** para webhook n8n** com payload incluindo `usuario_id`, exercícios (séries, MET, duração), `duracao_total_min` (para cálculos e notificações downstream).
- **Gamificação:** toasts de pontos/badges e RPCs de resumo quando disponíveis.

### 4.4 Nutrição (`/nutricao`)

- Seleção de **dia** (navegação anterior/próximo; não ultrapassa “hoje”).
- Leitura de **metas** (`metas_macros`) e **refeições** (`refeicoes`) do Supabase.
- UI: resumo kcal/meta/saldo, macros com barras de progresso, lista de refeições com status (pendente/registrada), **modal** de detalhe da refeição.

### 4.5 Histórico (`/historico`)

- Visualização agregada de atividade (treinos/refeições) por **dia**, **semana** ou **mês**, com navegação temporal.
- Foco em leitura e insights de adesão (detalhes conforme queries implementadas).

### 4.6 Perfil (`/perfil`)

- Dados do usuário (`display_name`, email).
- Incorpora **Conquistas** (badges / gamificação) quando `embeddedInPerfil`.

---

## 5. Requisitos funcionais

### 5.1 Autenticação e perfil

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-A1 | Login com email e senha via Supabase Auth | P0 |
| RF-A2 | Rotas privadas redirecionam não autenticados para `/login` | P0 |
| RF-A3 | Obrigar troca de senha quando `must_change_password` no registro `usuarios` | P0 |
| RF-A4 | Resolver `usuario` de negócio a partir de `auth_user_id` (tabela `usuarios`) | P0 |

### 5.2 Treino

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-T1 | Exibir plano do treino com exercícios e metadados (nome, séries, etc.) | P0 |
| RF-T2 | Registrar treino realizado e marcar como concluído | P0 |
| RF-T3 | Enviar payload de conclusão ao webhook n8n quando URL configurada | P1 |
| RF-T4 | Exibir mídia de demonstração segura (URLs http/https validadas) | P1 |
| RF-T5 | Filtrar treinos por categoria quando o dado existir | P1 |

### 5.3 Nutrição

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-N1 | Carregar meta de macros mais recente por usuário | P0 |
| RF-N2 | Listar refeições do dia com totais e status | P0 |
| RF-N3 | Detalhar refeição em modal (macros, horário, observações) | P1 |

### 5.4 Histórico e início

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-H1 | Dashboard com treino e refeições do dia (ou dia selecionado) | P0 |
| RF-H2 | Histórico com agrupamento por período | P0 |

### 5.5 PWA

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-P1 | Manifest com nome, ícones, tema, `start_url`, `display: standalone` | P0 |
| RF-P2 | Service worker / cache de assets para uso offline parcial | P1 |

### 5.6 Gamificação (quando backend habilitado)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-G1 | RPC `rpc_gamificacao_resumo` e badges em `gamificacao_*` | P2 |
| RF-G2 | Opt-in de ranking e nome de exibição via RPCs dedicadas | P2 |

---

## 6. Requisitos não funcionais

| ID | Categoria | Descrição |
|----|-----------|-----------|
| RNF-1 | Performance | First load aceitável em 4G; telas com estados de loading explícitos |
| RNF-2 | Segurança | Chave anon apenas no front; RLS e políticas no Supabase são mandatórias em produção |
| RNF-3 | UX mobile | `100dvh`, navegação inferior fixa, áreas seguras (safe area) |
| RNF-4 | i18n | Interface em **pt-BR** (formatação de datas/números) |
| RNF-5 | Acessibilidade | Contraste e alvos tocáveis coerentes com UI escura existente (evoluir conforme guideline) |

---

## 7. Modelo de dados (referência)

Descrito no `README.md` do repositório; tabelas centrais incluem:

- `usuarios` (vínculo com Auth, `must_change_password`, `display_name`)
- `treinos_plano`, `treinos_realizados`
- `refeicoes`, `metas_macros`
- Gamificação: `gamificacao_badges`, `gamificacao_usuario_badges` + RPCs

Migrações sugeridas em `scripts/migrations/`.

---

## 8. Integrações

| Sistema | Direção | Uso |
|---------|---------|-----|
| Supabase Auth | App → Supabase | Sessão e credenciais |
| Supabase DB | App ↔ Supabase | CRUD leitura/gravação conforme RLS |
| n8n (webhook) | App → n8n | Pós-processamento ao concluir treino |

**Contrato ilustrativo do webhook** (documentado no README):

```json
{
  "usuario_id": "uuid",
  "exercicios": [
    { "nome": "Supino reto", "series_feitas": 4, "met": 5.0, "duracao_min": 15 }
  ],
  "duracao_total_min": 45
}
```

---

## 9. Roadmap sugerido (produto)

| Fase | Entregas |
|------|----------|
| **Atual (MVP+)** | Login, troca de senha obrigatória, dashboard, treino com vídeo, nutrição leitura, histórico, perfil, PWA, webhook treino |
| **Curto prazo** | README alinhado às rotas reais (`/historico` vs `/evolucao`), registro de refeição pelo aluno (se desejado pelo negócio), tratamento offline fila de sync |
| **Médio prazo** | Notificações push (PWA), metas personalizadas no app, relatório semanal para o aluno |
| **Longo prazo** | Integração wearables, comunidade/ranking com moderação |

---

## 10. Riscos e dependências

- **RLS mal configurado:** vazamento ou bloqueio de dados — mitigação: revisão de políticas por `usuario_id`.
- **Webhook indisponível:** treino deve continuar salvo no Supabase; n8n é complementar.
- **RPCs de gamificação ausentes:** UI deve degradar sem erro fatal (comportamento a validar em QA).
- **Schema flexível:** campos alternativos em macros/refeições (`pick` com várias chaves) — documentar schema canônico para reduzir ambiguidade.

---

## 11. Glossário

| Termo | Significado |
|-------|-------------|
| PWA | Progressive Web App — instalável, com service worker |
| MET | Metabolic equivalent — usado em estimativas de gasto energético |
| RLS | Row Level Security (Supabase/Postgres) |

---

## 12. Aprovações (template)

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | |
| Tech Lead | | | |
| Representante academia | | | |

---

*Este PRD reflete o estado do repositório **alimentaai-pwa** na data indicada; revisar após mudanças relevantes de escopo ou schema.*
