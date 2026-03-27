# Especificação: Portal Academia + Personal (MVP)

Documento de produto para o painel web (`portal-academia/` neste repositório). O app do aluno (PWA AlimentaAI) deve usar o **mesmo projeto Supabase** para reutilizar `usuarios`, `treinos_plano`, `treinos_realizados` e gamificação.

---

## 1. Objetivo e perfis

| Perfil | O que faz no MVP |
|--------|------------------|
| **Gestor da academia** | Gerencia a unidade: alunos, convites/vínculo com o app, visão agregada de progresso e pontos. |
| **Personal** | Gerencia alunos atribuídos: cadastro assistido, prescrição de treinos, acompanhamento de execução e pontuação. |

**Fora de escopo:** cobranças, planos pagos, NF, gateways de pagamento, folha.

---

## 2. Stack (decisão)

- **Frontend:** Vite + React + TypeScript (SPA) + React Router.
- **Dados:** Supabase (Postgres + Auth).
- **Auth do portal:** contas **staff** (`gestor` / `personal`), separadas do login do aluno.
- **Acesso a dados sensíveis:** Edge Functions com **service role** após validar `membros_portal`, evitando depender de RLS em `treinos_plano` / `treinos_realizados` (o PWA pode operar independentemente).

---

## 3. Integração com o app

- Aluno = `auth.users` + `public.usuarios` (com `auth_user_id` ou `id` alinhado ao Auth).
- **Vincular:** convite por e-mail (API cria utilizador + perfil + `alunos_academia`) ou fluxo com código (`convites_aluno`).
- Prescrições gravam em `treinos_plano` com `criado_pelo_aluno = false` e `personal_id` do `personais` ligado ao membro.

---

## 4. Modelo de dados

### Tabelas existentes (app)

- `usuarios`, `personais`, `treinos_plano`, `treinos_realizados`, tabelas `gamificacao_*` (leitura de pontos).

### Tabelas novas (migration `scripts/migrations/portal_academia_mvp.sql`)

- `academias` — unidade.
- `membros_portal` — login staff (`user_id` → `auth.users`, `papel`, `academia_id`).
- `alunos_academia` — vínculo aluno ↔ academia; `personal_principal_id` → `personais.id`.
- `convites_aluno` — e-mail, token, expiração, consumo.
- `personais.membro_portal_id` — liga o registro CREF ao login do personal.

RLS ativa nas tabelas do portal; políticas permitem leitura/escrita conforme papel e `academia_id`.

---

## 5. Telas (MVP)

1. Login (staff).
2. Layout com academia, papel e logout.
3. Sem permissão — membro inexistente ou inativo.
4. **Gestor:** dashboard (KPIs), lista de alunos, detalhe do aluno, convites.
5. **Personal:** dashboard, lista de alunos, detalhe, prescrever treino (formulário + duplicar).
6. Partilhado: histórico de treinos realizados; pontos/resumo (gamificação ou contagem simples).

---

## 6. Critérios de aceite

- Gestor e personal veem só a sua academia; personal só alunos com o seu `personais` como principal.
- Cadastro de aluno + vínculo (API + convite).
- Treino prescrito aparece no PWA.
- Progresso e pontos visíveis no detalhe/dashboard.

---

## 7. Variáveis de ambiente (`portal-academia/.env.local`)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_FUNCTIONS_URL=
```

A secret `SUPABASE_SERVICE_ROLE_KEY` deve existir **no Supabase (server-side)**, usada nas Edge Functions (não vai no `.env.local` do client).

---

## 8. Bootstrap manual (primeira academia)

1. Aplicar `scripts/migrations/portal_academia_mvp.sql` no SQL Editor do Supabase.
2. Criar utilizador Auth para o gestor (Dashboard Supabase).
3. Inserir `academias` e `membros_portal` (`user_id` = UUID do Auth, `papel` = `gestor`).
4. Opcional: criar `personais` + `membros_portal` com `papel` = `personal` e associar `membro_portal_id`.
