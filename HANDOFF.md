# M3A System — Handoff para Claude Code

Você está pegando um projeto Next.js já em produção. **Sua tarefa é redesenhar a UI inteira do zero** seguindo um protótipo visual hospedado, preservando 5 invariantes de produto que vou listar abaixo. Houve uma tentativa anterior que ficou ruim — **ignore a branch `feat/console-redesign-from-prototype`**, comece do `main`.

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

## 2. Os 5 invariantes que NÃO podem ser perdidos

Esses são decisões de produto. Se a UI não materializar todos, está incompleta.

### #1 — Indicador "peso 1.0 · papel ensinante"
Em `/runs/[id]/review`, deve aparecer um badge mostrando o peso da decisão do revisor:
- `medic` → 1.0 (papel ensinante — peso máximo)
- `team-editor` → 0.7
- `delegate` → 0.4

### #2 — 3 estados de aprovação
Na revisão, três opções mutuamente exclusivas (radio):
- **Aprovar** — pronto pra produção
- **Aprovar com ressalva** — vai, mas com observação
- **Rejeitar** — descartar

### #3 — Comentário humano opcional
Textarea livre, opcional. Subtitle deve dizer algo tipo "alimenta o aprendizado do sistema (Pilar 5)". Junto da decisão, é o que treina o sistema.

### #4 — 4 camadas de identidade do médico
Em `/medicos/[slug]` precisa mostrar 4 cards/seções:
- **Núcleo** (core) — não muda, mudança = revisão estratégica
- **Identidade** (brand) — voz, estética, tom. Pilar 5 sugere, humano aprova
- **Operacional** — cadência, formatos, plataformas
- **Tático** — janela atual; Pilar 5 escreve livremente

Cada camada tem um badge `humano` ou `Pilar 5` indicando quem editou por último, com versão (`v3`, etc).

### #5 — Sidebar de detalhe da run com 3 cards específicos
Em `/runs/[id]`, sidebar à direita deve ter, nesta ordem:
- **Síntese** — leitura agregada dos 6 críticos (texto serif + decision destacada)
- **Versões** — lista das iterações com link pra cada versão
- **Pipeline** — timeline collapsible (default fechado) mostrando os 6 críticos com score + alertas

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

### Etapa 1 — Estude o design
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
3. `/runs/[id]` ← **invariante #5**
4. `/runs/[id]/review` ← **invariantes #1, #2, #3**
5. `/medicos/[slug]` ← **invariante #4**
6. `/runs/[id]/workspace`
7. `/runs/new`
8. `/biblioteca`, `/ajustes` (placeholders aceitáveis)

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

# Os 5 invariantes presentes (greps simples)
curl -s http://localhost:3000/runs/<id>/review | grep -E "papel ensinante|Pilar 5|Aprovar com ressalva"
curl -s http://localhost:3000/medicos/<slug> | grep -E "Núcleo|Identidade|Operacional|Tático"
curl -s http://localhost:3000/runs/<id> | grep -E "síntese|versões|pipeline"
```

Faça também screenshots side-by-side (sua implementação local × design de referência) pra validar visual.

---

## 9. Quando entregar

Abra PR `feat/redesign-v2 → main`. No corpo do PR:
- Lista de rotas implementadas com link
- Confirmação dos 5 invariantes (com print de cada)
- Screenshots comparativos (design vs implementado) das 3 rotas principais
- Resultado do `npm run build` (sem erros) e dos `curl` por rota

---

## 10. Branch antiga (referência negativa apenas)

A branch `feat/console-redesign-from-prototype` tem código que **não bateu visualmente**. Útil só pra você ver:
- Como NÃO fazer (a UI ficou ruim segundo o Rodrigo)
- O shape dos tipos que eu cheguei a definir (`lib/types.ts` na branch) — mas reescreva, não confie cegamente

Não use como base. Comece do `main`.
