# START HERE — Regras de operação com Claude

> **Como usar este arquivo.** No início de qualquer conversa nova com qualquer Claude (Claude.ai web, Claude Code, etc) sobre este projeto, cole o link ou o conteúdo deste arquivo e diga: "leia isto antes de responder". O Claude entra no contexto certo e segue as regras corretas. Você não precisa explicar o projeto de novo.

---

## Quem é o usuário

**Rodrigo Sarda.** Operador único do M3A System. Trabalha sozinho integrando Claude (web), Claude Code e ferramentas externas (Vercel, GitHub, monday.com, Supabase) na sua stack pessoal. Comunicação em **português**, direto, sem enrolação. Não usa emojis sem motivo. Quando algo está ruim, ele fala com franqueza ("ficou uma bosta. kkkk") — Claude também deve ser franco quando errar e quando discordar.

## O que é o M3A System

Sistema de produção de roteiros para marketing médico baseado no **Método 3A**. Cada roteiro nasce de um briefing, é gerado por um time de subagents especializados (~24 em `.claude/agents/`), validado por um painel de críticos, e melhora a cada ciclo via aprendizado contínuo. Console em Next.js 15. Os usuários são **médicos que ensinam**, não influencers — o tom da UI tem que respeitar isso. Detalhes em `CLAUDE.md`, `PLAN.md` e `pillars/*/README.md`.

## Estado atual

**Fase**: Catalogação de funcionalidades antes da implementação v2 do redesign.

**O que aconteceu antes**: Tentativa anterior de redesign (Maio/2026, sessão Claude web) falhou visualmente. Branch `feat/console-redesign-from-prototype` foi deletada. Post-mortem em `docs/redesign-2026-05/LESSONS-LEARNED.md`.

**O que está acontecendo agora**: Catálogo de funcionalidades em `docs/redesign-2026-05/funcionalidades/` sendo construído com método loop-pequeno, **lendo o plano do produto antes de propor qualquer coisa**. Quando estiver fechado, vira insumo para Claude Code implementar v2 do main limpo.

**Última atualização deste arquivo**: 2026-05-05 — duas regras de ouro formalizadas (insumo+árbitro + definições base intocáveis).

## Repos relacionados

| Repo | Acesso | Conteúdo |
|---|---|---|
| `m3a-system` | privado | Next.js 15 do produto, código de produção, plano completo, docs operacionais |
| `m3a-design-reference` | público | Protótipo HTML+JSX do design retornado, fonte da verdade visual |

URLs:
- https://github.com/rodrigosarda-stack/m3a-system
- https://github.com/rodrigosarda-stack/m3a-design-reference
- Design online: https://rodrigosarda-stack.github.io/m3a-design-reference/

**Para Claude ler arquivos privados**: precisa do GitHub PAT do Rodrigo. Ele cola na conversa quando necessário, ou usa `gh auth login` no Claude Code. Nunca commitar tokens em lugar nenhum.

## Plano do produto (fonte da verdade primária)

Antes de tratar QUALQUER outro documento como verdade (incluindo este, incluindo o HANDOFF do redesign), leia o plano:

- **`CLAUDE.md`** — constituição operacional do projeto. Lê automaticamente em sessões de Claude Code.
- **`PLAN.md`** — plano-mestre, visão, fases, mapa de dependências.
- **`PLAN/phase-*.md`** — briefings detalhados de cada fase.
- **`ARCHITECTURE.md`** — ADRs (decisões arquiteturais numeradas). ADR-007 = aprendiz/ensinante. ADR-008 = schema-per-tenant. Etc.
- **`pillars/*/README.md`** — documentação dos 6 pilares (Identidade, Inteligência Externa, Produção, Execução, Aprendizado, Performance).
- **`.claude/agents/*.md`** — 24 subagents (briefer, roteirista, 14+ críticos, síntese, validador final, etc).
- **`docs/auditorias/*`** — auditorias formais de fim de fase (AUD01, AUD02, BRIEFING).

## Documentos do redesign

Em `docs/redesign-2026-05/`:

- **`HANDOFF.md`** — briefing técnico para Claude Code que vai implementar a v2.
- **`LESSONS-LEARNED.md`** — post-mortem da v1.
- **`funcionalidades/`** — catálogo em construção. Sufixo `.draft.md` enquanto há decisões pendentes; renomeado para `.md` quando definitivo.

Cópia pública do HANDOFF: https://github.com/rodrigosarda-stack/m3a-design-reference/blob/main/HANDOFF.md

---

## Regras de ouro

### #1 — Definições base não se editam

As **definições base do projeto** são intocáveis pelo Claude. Lista (e o Claude deve assumir que esta lista é não-exaustiva — na dúvida, pergunta):

- `CLAUDE.md`
- `PLAN.md`, `PLAN/phase-*.md`
- `ARCHITECTURE.md` (incluindo ADRs)
- `pillars/*/` (todo o conteúdo dos 6 pilares)
- `.claude/agents/*` (todos os subagents)
- `docs/auditorias/*` (AUD01, AUD02, BRIEFING, README)
- `README.md` da raiz

**Claude lê esses arquivos. Não edita.** Se identificar inconsistência, contradição ou erro, **aponta para o Rodrigo e espera decisão**. Mudança em definição base exige PR explícito + aprovação explícita do Rodrigo. Nunca corrige sozinho.

Onde Claude **pode** editar livremente (com bom senso e pedindo OK quando relevante):
- `docs/redesign-2026-05/` (a pasta criada pelo próprio Claude)
- Outras pastas que o Rodrigo autorizar caso a caso

### #2 — Design e plano antigo são insumo + árbitro com peso igual

(específico do redesign atual, mas vale o princípio)

Quando o protótipo de design (`m3a-design-reference`) e o plano original (definições base + briefings) divergirem em alguma decisão de produto, **PARE e PERGUNTE ao Rodrigo** antes de implementar. Não decida sozinho. Não "use bom senso". A chamada é dele.

---

## Método de trabalho

### Loop pequeno

Trabalhe em ciclos pequenos:

1. Pega uma parte
2. Analisa completamente
3. Manda pro Rodrigo: "vi X, Y, Z. Tá batendo com o que você quer?"
4. Espera resposta. Anota.
5. Próxima parte.

Não acumule várias partes sem confirmação intermediária. A v1 falhou porque Claude fez tudo sem mostrar.

### O que é "uma parte"

Geralmente uma **funcionalidade** (não uma tela). Funcionalidade aparece em várias telas. "Aprovar roteiro" é uma; "Identidade do médico" é outra.

### Pergunta em batch, não em stream

Se acumular várias dúvidas pequenas durante a análise de uma parte, agrupe e mande tudo de uma vez no fim. Não dispare 10 perguntas em sequência.

### Comportamento quando o Rodrigo está offline

Espera. Não tenta adivinhar. Não trabalha em paralelo numa coisa que dependa da decisão pendente.

### Quando errar

Reconhece direto, sem auto-flagelação exagerada. Mostra o erro, propõe correção, segue. Rodrigo valoriza honestidade > polidez.

### Quando o plano antigo aparenta erro

Aponta. Não corrige.

## Convenções

- **Branches**: `feat/<escopo>` ou `fix/<escopo>`. Nunca trabalhar direto no main pra mudanças não-triviais.
- **Commits**: `<tipo>(<escopo>): <resumo curto>` na primeira linha; mensagem detalhada no corpo. Tipos: feat, fix, docs, chore, refactor.
- **Arquivos draft**: sufixo `.draft.md` enquanto há decisões pendentes. Renomear para `.md` quando definitivo.
- **Validação**: build limpo NÃO basta. Sempre `npm run dev` + `curl` em todas as rotas afetadas + comparação visual com a referência hospedada antes de afirmar "pronto".
- **Não commitar tokens, secrets, ou PATs** em lugar nenhum.

## Como me ajudar (instrução para Claude novo lendo este arquivo)

1. **Antes de qualquer ação técnica**, leia `CLAUDE.md`, `PLAN.md`, `ARCHITECTURE.md` e os `pillars/*/README.md` relevantes ao tema. Depois leia `HANDOFF.md` e `LESSONS-LEARNED.md` (do redesign).
2. Veja em `docs/redesign-2026-05/funcionalidades/` quais funcionalidades já foram catalogadas e quais ainda estão `.draft`.
3. Quando o Rodrigo te der uma tarefa, pergunte primeiro **a qual funcionalidade ela pertence** e **qual pilar/ADR é afetado**.
4. Antes de propor mudanças, **leia o último estado do código no main**. Não confie em memória de sessão anterior.
5. Quando em dúvida sobre design vs plano (regra de ouro #2), pergunta. Sempre.
6. Quando achar que precisa mexer em definição base (regra de ouro #1), **NÃO MEXA**. Aponta o achado e espera.
7. Resposta direta, em português, sem enrolação. Bullet points e headers só quando a estrutura ajuda.
