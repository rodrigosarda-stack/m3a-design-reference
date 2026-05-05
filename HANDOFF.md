# M3A System — Handoff para Claude Code

Você está pegando um projeto Next.js já em produção. **Sua tarefa é redesenhar a UI inteira do zero**, partindo do `main`. Houve uma tentativa anterior que falhou visualmente — a branch foi deletada, ela não existe mais.

---

## Regra de ouro (leia antes de qualquer coisa)

Você tem **duas fontes** que pesam **igual**: o **design hospedado** (protótipo HTML+JSX em `m3a-design-reference`) e o **plano original** (este documento, especialmente a seção 2). Nenhum dos dois sobrepõe o outro.

- O **design** é o plano evoluído em forma de tela. As decisões de fluxo, hierarquia, ações e terminologia que aparecem nele foram tomadas conscientemente pelo time de design ao processar o briefing original. **Trate como decisão de produto, não como skin.**
- O **plano original** (seção 2) lista pontos do briefing anterior que podem ter sido (a) preservados pelo design, (b) substituídos conscientemente por algo melhor, ou (c) omitidos por descuido. Você não tem como saber qual dessas três é o caso de cada ponto sem perguntar.

**Sempre que você encontrar uma inconsistência, contradição ou ambiguidade entre os dois, PARE e PERGUNTE ao Rodrigo antes de implementar.** Não escolha um lado por conta própria. Não "use bom senso". Não tente "reconciliar" sozinho. A chamada é dele.

Exemplos do que isso significa na prática:
- Você abre o design e vê que a tela de revisão usa "aceitar/rejeitar inline em sugestões", mas a seção 2 deste doc fala em "3 estados de aprovação com radio". → Pergunta: "no design vi X, no handoff vi Y, qual é a decisão?"
- O `MedicDetail` do design mostra voz/procedimentos/linhas-vermelhas/histórico, mas a seção 2 fala em 4 camadas (núcleo/identidade/operacional/tático). → Pergunta antes de implementar `/medicos/[slug]`.
- Aparece algo no design que não está no handoff de jeito nenhum (ex: Live Score, Action log com undo). → Pergunta se é pra preservar ou se foi mero exercício de design.

A pergunta é barata. Implementar errado e refazer é caro. **Quando em dúvida, pergunta.**

---

## 0. Acessos

- **Repo principal** (Next.js — onde você vai trabalhar):
  https://github.com/rodrigosarda-stack/m3a-system (privado)
- **PAT do GitHub** (pra clonar repo privado):
  Use `gh auth login` (se tiver `gh` CLI instalado) ou peça o PAT ao Rodrigo
  e exporte como variável de ambiente:
  ```bash
  export GITHUB_TOKEN="..."   # peça ao Rodrigo
  git clone https://${GITHUB_TOKEN}@github.com/rodrigosarda-stack/m3a-system
  ```
  Não commite o token em lugar nenhum — GitHub Push Protection bloqueia pushes
  com tokens expostos.
- **Design de referência** (sua fonte da verdade visual):
  https://rodrigosarda-stack.github.io/m3a-design-reference/
- **Repo do design** (caso precise ler `styles.css`, `screens-*.jsx`, `ui.jsx`):
  https://github.com/rodrigosarda-stack/m3a-design-reference (público)
- **Vercel**: project `prj_5BHi8FTgGomQgJVBVFbuhJkZq3Pi`, team `team_LFtGFGk7E9k8iuY9BoAg761P`
- **Produção atual**: https://m3a-system.vercel.app (estado pré-redesign)

---

## 1. Contexto do produto

O **M3A System** é um console de produção de conteúdo médico (Método 3A). Ajuda médicos a criar roteiros (reels, carrosséis, shorts) com pipeline de IA + revisão humana. Os usuários são **médicos que ensinam** (não influenciers) — o tom da UI tem que respeitar isso.

Quem usa: 1 operador (Rodrigo) + médicos. Cada médico tem identidade própria (voz, procedimentos, linhas vermelhas). Cada conteúdo é uma **run** que passa por **6 críticos de IA** (compliance, didática, antagonista, editor-chefe, voz do médico, produção) → **síntese** → **revisão humana**.

---

## 2. Pontos do plano original que podem ter sido alterados pelo design

Esses são 5 itens que estavam no briefing anterior do produto. **Antes de implementar a tela afetada por cada um, abra o design correspondente, compare, e pergunte ao Rodrigo o que prevalece.** Não decida sozinho.

A lista aqui não é exaustiva — você pode encontrar outros conflitos durante a implementação. A regra é a mesma: **viu inconsistência, pergunta.**

### #1 — Indicador "peso 1.0 · papel ensinante" (na revisão)
O briefing original previa um badge mostrando o peso da decisão do revisor:
- `medic` → 1.0 (papel ensinante — peso máximo)
- `team-editor` → 0.7
- `delegate` → 0.4

Verifique: o design mantém? Substitui? Omitiu por descuido?

### #2 — 3 estados de aprovação (na revisão)
O briefing original previa três opções mutuamente exclusivas: aprovar / aprovar com ressalva / rejeitar.

No design, a tela de revisão parece adotar um modelo de "sugestões inline com aceitar/rejeitar por bloco". Isso é uma evolução, uma substituição, ou perda? **Pergunta.**

### #3 — Comentário humano opcional (na revisão)
O briefing original previa um textarea livre, opcional, com legenda "alimenta o aprendizado do sistema (Pilar 5)" — junto da decisão, é o que treina o sistema.

Verifique se o design preserva isso ou se foi omitido.

### #4 — 4 camadas de identidade do médico
O briefing original previa que `/medicos/[slug]` mostre 4 cards/seções com badges `humano` ou `Pilar 5` indicando quem editou por último (com versão `v3` etc):
- **Núcleo** (core) — não muda, mudança = revisão estratégica
- **Identidade** (brand) — voz, estética, tom. Pilar 5 sugere, humano aprova
- **Operacional** — cadência, formatos, plataformas
- **Tático** — janela atual; Pilar 5 escreve livremente

No design, o `MedicDetail` parece ter virado voz/procedimentos/linhas-vermelhas/histórico — uma estrutura mais simples. **Pergunta antes de implementar.**

### #5 — Sidebar de detalhe da run
O briefing original previa, em `/runs/[id]`, sidebar à direita com 3 cards nesta ordem:
- **Síntese** — leitura agregada dos 6 críticos (texto serif + decision destacada)
- **Versões** — lista das iterações com link pra cada versão
- **Pipeline** — timeline collapsible (default fechado) mostrando os 6 críticos com score + alertas

No design, a sidebar parece ter sido reorganizada e alguns elementos podem ter migrado pra outras telas (ex: workspace unificado). **Pergunta.**

### Coisas que apareceram no design e não estavam no briefing original
Você provavelmente vai ver no design coisas como Live Score, Action log com undo, Selection bubble, Workspace unificado com 5 modos, Refazer/bifurcar, Wizard 4 steps numerados. Essas são adições do design. **Antes de implementar cada uma, confirme com o Rodrigo se ele quer preservar ou se foi exercício de design.**

---

## 3. Stack obrigatória

- **Next.js 15** App Router (typedRoutes:true)
- **Tailwind v4** (zero-config via `@import 'tailwindcss'`)
- **Radix UI** primitives pra Dropdown, RadioGroup, Collapsible, etc
- **TypeScript strict** com `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`
- **Server Components default**, `'use client'` só quando precisa de hook/event
- **Imports absolutos `@/`**
- **Fontes via next/font/google**: Space Grotesk (UI), Fraunces (display/serif), JetBrains Mono (mono)

---

## 4. Como começar

```bash
# 1. Clone e ramifique
git clone https://github.com/rodrigosarda-stack/m3a-system
cd m3a-system
git checkout main
git checkout -b feat/redesign-v2

# 2. Instale e rode
npm install
npm run dev   # http://localhost:3000

# 3. Em paralelo, abra a referência visual no seu navegador MCP
#    https://rodrigosarda-stack.github.io/m3a-design-reference/
```

---

## 5. Como abordar a tarefa

### Etapa 1 — Estude o design e reconcile com o handoff
1. Abra a URL de referência no seu navegador MCP
2. Tire screenshots das telas que conseguir alcançar (clique em runs, médicos, workspace, etc)
3. **Clone também o repo do design** e leia:
   - `styles.css` — paleta de cores em HEX, tokens semânticos, fontes, espaçamento
   - `ui.jsx` — primitives (Btn, Card, Pill, Score, Avatar)
   - `screens-1.jsx` — RunsList, RunDetail, ReviewScreen
   - `screens-2.jsx` — Workspace, MedicsList, MedicDetail (a maior, ~1450 linhas)
   - `screens-3.jsx` — NewRun (wizard)
   - `data.jsx` — shape dos mocks (te dá ideia dos tipos)
   - `critic-panels.jsx` — paineis de crítico/síntese
4. Compare com a estrutura do repo Next.js que você acabou de clonar (`app/`, `components/`)
5. **Antes de escrever uma linha de código**, monte um relatório de reconciliação e mande pro Rodrigo. Estrutura:

   ```
   ## Reconciliação design × handoff

   ### Pontos do handoff (seção 2) — status no design
   #1 peso 1.0/0.7/0.4: [preservado | substituído por X | omitido]
   #2 3 estados aprovação: [...]
   #3 comentário humano: [...]
   #4 4 camadas médico: [...]
   #5 sidebar 3 cards: [...]

   ### Adições do design fora do handoff
   - Live Score: [vi em tela X, faz Y]
   - Action log undo: [vi em tela X, faz Y]
   - ...

   ### Conflitos / dúvidas
   - [pergunta 1]
   - [pergunta 2]
   ```

   **Espera resposta dele antes de seguir.** Pode parecer perda de tempo, mas é o que separa a v2 de virar outra v1.

### Etapa 2 — Tokens primeiro
Antes de qualquer componente, monte `app/globals.css` com:
- Paleta HEX do design (lê de `styles.css`)
- Tokens semânticos no `@theme {}` pra Tailwind gerar classes (`bg-surface`, `text-fg`, etc)
- Overrides em `[data-theme=dark]` e `[data-intensity=immersive]` (o protótipo tem esses 3 modos)

### Etapa 3 — Componentes do zero
Não copie cegamente do design — adapte pra Next.js + Tailwind v4 + Radix. Sugiro `components/m3a/` ou similar pra namespace claro. Valide visualmente cada componente abrindo a rota local + comparando com referência no MCP.

### Etapa 4 — Páginas, ordem sugerida (mais simples → mais complexa)
1. `/runs` (lista)
2. `/medicos` (grid)
3. `/runs/[id]` ← afetada pelo ponto #5 da seção 2
4. `/runs/[id]/review` ← afetada pelos pontos #1, #2, #3
5. `/medicos/[slug]` ← afetada pelo ponto #4
6. `/runs/[id]/workspace`
7. `/runs/new`
8. `/biblioteca`, `/ajustes` (placeholders aceitáveis)

**Lembrete**: antes de cada uma das telas marcadas, garanta que o ponto correspondente da seção 2 já foi reconciliado com o Rodrigo na Etapa 1. Se ainda tem dúvida pendente, **não implemente — pergunta primeiro**.

### Etapa 5 — Mocks e API
Monte `lib/types.ts`, `lib/mocks/` e `app/api/` do zero também. O design tem `data.jsx` com mocks que servem de inspiração pro shape, mas reescreva com tipos TS strict.

---

## 6. Pegadinhas que pegaram quem tentou antes (leia!)

### A. Build limpo ≠ runtime OK
Tive todas as rotas dando HTTP 500 com `npm run build` passando. **Sempre**:
```bash
npm run dev
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<rota>
```
Validate cada rota antes de dizer "pronto".

### B. Server Components não passam funções pra Client Components
Erro clássico que me pegou:
```
Functions cannot be passed directly to Client Components
```

```tsx
// ❌ vai quebrar em runtime
import { GitBranch } from 'lucide-react';
<ClientComp icon={GitBranch} />

// ✓ pré-renderize JSX e passe como ReactNode
<ClientComp icon={<GitBranch className="size-3.5" />} />
```

### C. Tailwind v4 + tokens dinâmicos
Pra gerar classes tipo `bg-surface-2`, declare no `@theme {}`. Pra override por tema, redeclare em seletor — Tailwind usa `var()` automaticamente:
```css
@theme {
  --color-surface-2: #F5F2EC;
}
[data-theme='dark'] {
  --color-surface-2: #211C47;  /* propaga pra todas as classes bg-surface-2 */
}
```

### D. `exactOptionalPropertyTypes`
Não passe `prop={maybeUndefined}`. Use spread condicional:
```tsx
<Comp {...(value !== undefined && { prop: value })} />
```

### E. `typedRoutes: true`
Rotas dinâmicas em template strings precisam de cast:
```tsx
import type { Route } from 'next';
<Link href={`/runs/${id}` as Route}>...</Link>
```

---

## 7. Convenções

- Commits: `feat(redesign): <escopo> — <resumo>` ou `fix(redesign): ...`
- Branch: `feat/redesign-v2` (não `feat/console-redesign-from-prototype` — essa é a ruim)
- Sem `console.log` esquecido. Sem `any` injustificado
- Mobile-first. Foco visível em todos os interativos. Alvos clicáveis ≥32px

---

## 8. Como validar antes de entregar

```bash
# Build limpo
npm run build

# Dev rodando, todas as rotas 200
npm run dev &
for r in /runs /runs/run-marina-7 /runs/run-marina-7/review \
         /runs/run-marina-7/workspace /runs/new \
         /medicos /medicos/marina-aguiar /biblioteca /ajustes; do
  echo "$r: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$r)"
done
```

Pra cada ponto da seção 2 que o Rodrigo confirmou que **deve ser preservado**, faça um grep do conteúdo esperado nas páginas. Pra cada ponto que ele confirmou **substituído ou descartado**, não force.

**Comparação visual side-by-side é obrigatória.** Tela por tela: screenshot da implementação local + screenshot do design hospedado, lado a lado. Se algo diverge sem você ter explicação ("é assim por causa de X que o Rodrigo confirmou"), não está pronto.

---

## 9. Quando entregar

Abra PR `feat/redesign-v2 → main`. No corpo do PR:
- Lista de rotas implementadas com link
- Link/cópia do relatório de reconciliação (Etapa 1) com as decisões do Rodrigo registradas
- Screenshots comparativos (design vs implementado) das 3 rotas principais
- Resultado do `npm run build` (sem erros) e dos `curl` por rota
- Checklist do que foi explicitamente preservado, substituído e descartado por decisão dele

---

## 10. Branch antiga (foi deletada)

Existiu uma branch `feat/console-redesign-from-prototype` com a tentativa anterior — ela foi deletada do GitHub porque visualmente não bateu. Não vá atrás dela. O post-mortem da tentativa está em `docs/redesign-2026-05/LESSONS-LEARNED.md` no main, com o bug crítico de RSC, fix exata, e as 4 pegadinhas técnicas. Vale a leitura.
