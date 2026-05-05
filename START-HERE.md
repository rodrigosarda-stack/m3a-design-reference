# START HERE — Regras de operação com Claude

> **Como usar este arquivo.** No início de qualquer conversa nova com qualquer Claude (Claude.ai web, Claude Code, etc) sobre este projeto, cole o link ou o conteúdo deste arquivo e diga: "leia isto antes de responder". O Claude entra no contexto certo e segue as regras corretas. Você não precisa explicar o projeto de novo.

---

## Quem é o usuário

**Rodrigo Sarda.** Operador único do M3A System. Trabalha sozinho integrando Claude (web), Claude Code e ferramentas externas (Vercel, GitHub, monday.com, Supabase) na sua stack pessoal. Comunicação em **português**, direto, sem enrolação. Não usa emojis sem motivo. Quando algo está ruim, ele fala com franqueza ("ficou uma bosta. kkkk") — Claude também deve ser franco quando errar e quando discordar.

## O que é o M3A System

Console em Next.js 15 que ajuda médicos a produzirem roteiros de conteúdo (reels, carrosséis, shorts) com pipeline de IA + revisão humana. Cada peça é uma **run** que passa por **6 críticos automáticos** (compliance, didática, antagonista, editor-chefe, voz, produção) → síntese → revisão. Cada médico tem identidade própria (voz, procedimentos, linhas vermelhas). Os usuários são **médicos que ensinam**, não influencers — o tom da UI tem que respeitar isso.

## Estado atual

**Fase**: Catalogação de funcionalidades antes da implementação v2 do redesign.

**O que aconteceu antes**: Tentativa anterior de redesign (Maio/2026, sessão Claude web) falhou visualmente. Branch `feat/console-redesign-from-prototype` foi deletada. Post-mortem em `docs/redesign-2026-05/LESSONS-LEARNED.md`.

**O que está acontecendo agora**: Catálogo de funcionalidades em `docs/redesign-2026-05/funcionalidades/` sendo construído com método loop-pequeno. Quando estiver fechado, vira insumo para Claude Code implementar v2 do main limpo.

**Última atualização deste arquivo**: 2026-05-05 — funcionalidade #01 (aprovação de roteiro) commitada como `.draft.md` com 5 perguntas em aberto.

## Repos relacionados

| Repo | Acesso | Conteúdo |
|---|---|---|
| `m3a-system` | privado | Next.js 15 do produto, código de produção, docs operacionais |
| `m3a-design-reference` | público | Protótipo HTML+JSX do design retornado, fonte da verdade visual |

URLs:
- https://github.com/rodrigosarda-stack/m3a-system
- https://github.com/rodrigosarda-stack/m3a-design-reference
- Design online: https://rodrigosarda-stack.github.io/m3a-design-reference/

**Para Claude ler arquivos privados**: precisa do GitHub PAT do Rodrigo. Ele cola na conversa quando necessário, ou usa `gh auth login` no Claude Code. Nunca commitar tokens em lugar nenhum (GitHub Push Protection bloqueia).

## Documentos chave

Em `m3a-system/docs/redesign-2026-05/`:

- **HANDOFF.md** — briefing técnico completo para Claude Code. Tem regra de ouro, 5 pontos de reconciliação, etapas 0-5, pegadinhas técnicas (RSC, Tailwind v4, exactOptionalPropertyTypes, typedRoutes), critérios de PR.
- **LESSONS-LEARNED.md** — post-mortem da v1. Bug crítico de RSC com fix exata. 4 pegadinhas técnicas. Por que falhou.
- **funcionalidades/** — catálogo em construção. Um arquivo por funcionalidade. Sufixo `.draft.md` enquanto há perguntas pendentes; renomeado para `.md` quando definitivo.

Cópia pública do HANDOFF (sem PAT): https://github.com/rodrigosarda-stack/m3a-design-reference/blob/main/HANDOFF.md

## Método de trabalho (regras do jogo)

### Regra de ouro
**Design e plano antigo são insumo + árbitro com peso igual.** Quando houver inconsistência, contradição ou ambiguidade entre os dois, PARE e PERGUNTE ao Rodrigo. Não decida sozinho. Não "use bom senso". A chamada é dele.

### Loop pequeno
Trabalhe em ciclos pequenos:
1. Pega uma parte
2. Analisa completamente
3. Manda pro Rodrigo: "vi X, Y, Z. Tá batendo com o que você quer?"
4. Espera resposta. Anota.
5. Próxima parte.

Não acumule várias partes sem confirmação intermediária. A v1 falhou porque Claude fez tudo sem mostrar.

### O que é "uma parte"
Geralmente uma **funcionalidade** (não uma tela). Funcionalidade aparece em várias telas. "Aprovar roteiro" é uma; "Identidade do médico" é outra. Trate por funcionalidade pra evitar que a mesma coisa fique inconsistente em telas diferentes.

### Pergunta em batch, não em stream
Se acumular várias dúvidas pequenas durante a análise de uma parte, agrupe e mande tudo de uma vez no fim. Não dispare 10 perguntas em sequência.

### Comportamento quando o Rodrigo está offline
Espera. Não tenta adivinhar. Não trabalha em paralelo numa coisa que dependa da decisão pendente.

### Quando errar
Reconhece direto, sem auto-flagelação exagerada. Mostra o erro, propõe correção, segue. Rodrigo valoriza honestidade > polidez.

## Convenções

- **Branches**: `feat/<escopo>` ou `fix/<escopo>`. Nunca trabalhar direto no main pra mudanças não-triviais.
- **Commits**: `<tipo>(<escopo>): <resumo curto>` na primeira linha; mensagem detalhada no corpo. Tipos: feat, fix, docs, chore, refactor.
- **Arquivos draft**: sufixo `.draft.md` enquanto há decisões pendentes. Renomear para `.md` quando definitivo.
- **Validação**: build limpo NÃO basta. Sempre `npm run dev` + `curl` em todas as rotas afetadas + comparação visual com a referência hospedada antes de afirmar "pronto".
- **Não commitar tokens, secrets, ou PATs** em lugar nenhum.

## Como me ajudar (instrução para Claude novo lendo este arquivo)

1. **Antes de qualquer ação técnica**, leia também `HANDOFF.md` e `LESSONS-LEARNED.md`. As pegadinhas técnicas que travaram a v1 estão lá com fix exata.
2. Veja em `funcionalidades/` quais já foram catalogadas e quais ainda estão `.draft`. Use o template das existentes pra novas.
3. Quando o Rodrigo te der uma tarefa, pergunte primeiro **a qual funcionalidade ela pertence**. Se for nova, sugira catalogar primeiro e implementar depois.
4. Antes de propor mudanças, **leia o último estado do código no main**. Não confie em memória de sessão anterior — pode ter mudado.
5. Quando em dúvida sobre design vs briefing, pergunta. Sempre.
6. Resposta direta, em português, sem enrolação. Sem emoji a menos que ele use primeiro. Bullet points e headers só quando a estrutura ajuda; em conversa casual, prosa.
