# Design System e decisões do app (Way)

Este documento descreve **como o app Way deve ser**: identidade visual, tokens, componentes e também decisões de produto/stack que afetam UI/UX (PWA, ícones, rotas).

## 1. Visão e norte criativo
O norte criativo é **“Industrial Editorial”**: visual cru, técnico e rápido, com **arestas vivas**, hierarquia tipográfica forte e separação por **camadas tonais** (não por linhas).

- **Sem estética “lifestyle” arredondada**: nada de “pílulas” e cards com cantos grandes.
- **Geometria**: ângulos retos e, quando fizer sentido, recortes (ex.: `clip-path`) para remeter à marca.
- **Assimetria intencional**: títulos grandes + micro-labels técnicos, com “dead space” para ritmo.

## 2. Paleta e regras de contraste (UI neutra)
Decisão: **não usar amarelo/verde em degradê** (nem como acento, nem em CTA, nem em progresso). O app é **preto + cinza + branco/off‑white**.

### 2.1. Camadas (no-line rule)
**Regra “No‑Line”**: evitar `border: 1px solid ...` como separador. Separação deve ser por **mudança de fundo** + **espaçamento**.

Camadas recomendadas:
- **Background (nível 0)**: `#0e0e0e`
- **Surface 1 (nível 1 / seções)**: `#131313`
- **Surface 2 (nível 2 / plates)**: `#1a1a1a`
- **Surface 3 (nível 3 / plates ativas)**: `#20201f`

### 2.2. Highlights (off‑white)
Decisão: **destaques e estados ativos** (tabs/chips/dia selecionado/BottomNav ativo) usam **off‑white**:
- **Highlight background**: `rgba(255,255,255,0.92)`
- **Highlight foreground**: `rgba(0,0,0,0.90)`
- **Highlight dim (hover/press)**: `rgba(255,255,255,0.10)`

### 2.3. Glass (neutro)
Glassmorphism é permitido (principalmente em modais/overlays):
- **Glass**: cinza neutro com ~70% de opacidade (sem “cor de acento”)
- **Blur**: `24px`

## 3. Tipografia (decisão)
Decisão de fontes:
- **Display / headlines**: **Lexend**
- **Labels / dados técnicos**: **Space Grotesk**
- **Body / textos longos**: **Inter**

Ritmo recomendado:
- **Headline grande** + **label pequena** (tracking maior) para contraste editorial.

## 4. Forma, raio e “cantinhos”
Decisão: **border-radius = 0px** como regra padrão.

- **Permitido**: recortes/ângulos (ex.: `clip-path`) para criar identidade.
- **Evitar**: chips/pills circulares e botões redondos.

## 5. Componentes (regras de UI)
### 5.1. Botões
Decisão: **botões primários (CTA)** são **off‑white** (sem gradiente):
- **Fundo**: `--hi-bg` (off‑white)
- **Texto/ícone**: `--hi-fg` (escuro)
- **Hover**: leve `brightness()` e sombra difusa neutra (sem glow colorido)

### 5.2. Inputs
Decisão: inputs são **bottom-line only**:
- **Sem caixa** (sem borda completa)
- **Linha** em estado normal: neutra
- **Focus**: linha mais forte (2px) e contraste neutro (sem amarelo)

### 5.3. Tabs / chips / filtros
Decisão:
- **Ativo**: off‑white (`--hi-bg`/`--hi-fg`)
- **Inativo**: plate neutro (camadas tonais)
- **Sem gradientes**

### 5.4. Navegação inferior (BottomNav)
Decisão:
- Sem `border-top` como separador
- Pode usar glass/plate para fundo
- **Ativo** em off‑white (inclui botão central quando aplicável)

## 6. Conteúdo e branding
Decisões de marca:
- **Nome do PWA/app**: **Way** (não “AlimentaAI”).
- **Login**: logo centralizada; remover textos promocionais (“Treino e nutrição...” e “Acesso”) quando solicitado.

## 7. PWA (ícones e nomes)
Decisões:
- **`apple-touch-icon.png`**: **180×180**
- **PWA icons**: **192×192** e **512×512**
- Manter o manifest e o `index.html` consistentes com **Way**.

Nomes de arquivos (padrão recomendado em `public/`):
- `apple-touch-icon.png` (180×180)
- `pwa-192x192.png` (192×192)
- `pwa-512x512.png` (512×512)

## 8. SPA + deploy (Vercel) e rotas
Decisões técnicas que afetam UX:
- O app é uma **SPA (React Router)**. Abrir rotas “direto” (ex.: via WhatsApp) **não pode dar 404**.
- Na Vercel, usar **rewrites de SPA** para servir `index.html` nas rotas do app **sem reescrever arquivos estáticos** (ex.: `manifest.webmanifest`, SW, assets), para evitar problemas de cache/instalação do PWA exibindo nome antigo.