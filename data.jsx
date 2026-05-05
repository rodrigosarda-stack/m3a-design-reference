/* global React */
// All M3A-specific data lives here. One source of truth across screens.
// Médicos, runs, scripts, critics, history.

const MEDICS = [
  {
    id: "marina-aguiar",
    name: "Dra. Marina Aguiar",
    handle: "@drmarinaaguiar",
    specialty: "Dermatologia",
    initials: "MA",
    color: "neon",
    runs: 24,
    voice: "Acolhedora · pedagógica · referências a evidência",
    avatarTone: "Cumprimento curto, primeira pessoa do plural ('vamos olhar juntas')",
    procedures: ["Skinbooster", "Toxina aplicação suave", "Bioestimulador colágeno", "Microagulhamento"],
    forbidden: ["preço explícito", "antes/depois agressivo", "promessa de resultado"],
    posts: 184,
  },
  {
    id: "rafael-costa",
    name: "Dr. Rafael Costa",
    handle: "@drrafaelcosta",
    specialty: "Cirurgia Plástica",
    initials: "RC",
    color: "teal",
    runs: 41,
    voice: "Direto · técnico · prova social discreta",
    avatarTone: "Vocativo formal ('quem já passou por isso me conta')",
    procedures: ["Rinoplastia", "Mamoplastia", "Lipo HD", "Abdominoplastia"],
    forbidden: ["preço explícito", "menção a 'antes' chocante"],
    posts: 312,
  },
  {
    id: "joana-pires",
    name: "Dra. Joana Pires",
    handle: "@drajoanapires",
    specialty: "Ginecologia / Saúde da Mulher",
    initials: "JP",
    color: "indigo",
    runs: 17,
    voice: "Educativa · empoderadora · linguagem não-clínica",
    avatarTone: "Pergunta direta logo no hook",
    procedures: ["Reposição hormonal", "Saúde íntima a laser", "Anticoncepção"],
    forbidden: ["termos clínicos sem tradução", "tabu sobre menstruação"],
    posts: 96,
  },
];

// Shared 6-block script template (5 reels + 1 carrossel/feed)
const SAMPLE_SCRIPT = [
  {
    block: "hook",
    label: "Hook", time: "0–3s",
    text: "Você acordou e o seu rosto parece um pouco mais 'cansado' do que ontem? Calma — não é sua imaginação, e tem motivo.",
  },
  {
    block: "context",
    label: "Contexto", time: "3–12s",
    text: "Por volta dos 35 anos a produção de colágeno cai em torno de 1% ao ano. A pele perde sustentação e começa a refletir luz de um jeito diferente — daí a sensação de 'menos viço', mesmo dormindo bem e bebendo água.",
  },
  {
    block: "value",
    label: "Valor", time: "12–22s",
    text: "Isso não significa que você precisa partir para algo invasivo. Existe uma família de tratamentos chamados bioestimuladores: eles não 'preenchem', eles estimulam o seu próprio organismo a produzir colágeno de novo. O resultado aparece em semanas e é progressivo.",
  },
  {
    block: "value",
    label: "Como funciona", time: "22–32s",
    text: "A gente conversa antes, mapeia as áreas e o tipo de pele, e o protocolo é desenhado para você. Não existe um 'pacote padrão' — cada rosto tem uma história e uma anatomia.",
  },
  {
    block: "context",
    label: "Prova", time: "32–42s",
    text: "Em consultório eu vejo isso quase toda semana: pacientes que chegam achando que precisam de algo grande, e na verdade o que faltava era estímulo de colágeno bem indicado.",
  },
  {
    block: "cta",
    label: "CTA", time: "42–50s",
    text: "Se você quer entender se faz sentido para o seu momento, manda DIREITO no direct a palavra 'colágeno' que a gente conversa.",
  },
];

const SAMPLE_SCRIPT_V2 = [
  {
    block: "hook",
    label: "Hook", time: "0–3s",
    text: "Quase toda paciente que entra no meu consultório aos 38 me pergunta a mesma coisa: 'doutora, por que minha pele mudou tão rápido?'",
  },
  {
    block: "context",
    label: "Contexto", time: "3–12s",
    text: "A resposta tem nome: queda de colágeno. Depois dos 35, perdemos cerca de 1% ao ano — e isso muda como a luz reflete no rosto.",
  },
  {
    block: "value",
    label: "Valor", time: "12–22s",
    text: "Bioestimuladores resolvem essa raiz. Não preenchem nada — fazem o seu corpo produzir o colágeno de novo, no seu ritmo.",
  },
  {
    block: "value",
    label: "Como funciona", time: "22–32s",
    text: "O protocolo é individual. Mapeio a pele, ouço sua rotina, e a gente decide juntas o ritmo. Não tem fórmula pronta.",
  },
  {
    block: "context",
    label: "Prova", time: "32–42s",
    text: "É o tratamento que mais me chama atenção em 12 anos de consultório, justamente por ser progressivo e respeitar a anatomia de cada uma.",
  },
  {
    block: "cta",
    label: "CTA", time: "42–50s",
    text: "Se faz sentido para o seu momento, me chama no direct com a palavra 'colágeno' — eu mesma respondo.",
  },
];

const CRITICS = {
  // Each critic has signature, score, and reasoning. Same set evaluates every output.
  marketing: { name: "Marketing Lead", role: "Performance + funil", icon: "Briefcase", color: "indigo" },
  brand: { name: "Brand Voice", role: "Aderência à voz do médico", icon: "Volume", color: "teal" },
  compliance: { name: "Compliance CFM", role: "Resolução 1.974 / Conselho Federal", icon: "Lock", color: "rose" },
  retention: { name: "Retenção", role: "Predição de drop-off por bloco", icon: "Eye", color: "amber" },
  audience: { name: "Audiência-alvo", role: "Persona + dor + linguagem", icon: "Users", color: "neon" },
  hooklab: { name: "Hook Lab", role: "Força do gancho 0–3s", icon: "Bolt", color: "amber" },
};

const SAMPLE_CRITICS_REVIEW = [
  {
    id: "marketing", score: 8.4,
    verdict: "Funil claro · CTA acionável · pergunta segmenta bem.",
    confidence: "alta", duration: "32s", iterations: 3,
    subScores: [
      { label: "Clareza do funil", score: 9.0 },
      { label: "Força do CTA", score: 8.5 },
      { label: "Segmentação", score: 8.5 },
      { label: "Conversão estimada", score: 7.5 },
    ],
    suggestions: [
      { block: 5, blockLabel: "Prova", before: "Pacientes relatam diferença em poucas semanas.", after: "Em estudos clínicos com bioestimuladores de PLLA, 78% das pacientes relataram melhora visível em 4-6 meses.", reason: "Adicionar dado numérico aumenta credibilidade e taxa de conversão estimada em ~12%." },
    ],
    praises: [
      { block: 6, text: "CTA 'agendar avaliação gratuita' tem fricção baixa e expectativa clara." },
    ],
    history: "Padrão recorrente — 3 runs anteriores tiveram a mesma sugestão de adicionar prova social numérica.",
  },
  {
    id: "brand", score: 9.1,
    verdict: "Tom acolhedor preservado. Uso de 'a gente' e 'juntas' bate com a voz da Dra. Marina.",
    confidence: "alta", duration: "24s", iterations: 2,
    subScores: [
      { label: "Aderência à voz", score: 9.5 },
      { label: "Vocabulário-marca", score: 9.0 },
      { label: "Tom emocional", score: 9.0 },
      { label: "Coerência entre blocos", score: 8.8 },
    ],
    suggestions: [],
    praises: [
      { block: 1, text: "Abertura 'Você acordou e percebeu...' é assinatura da Dra. Marina — narrativa de espelho." },
      { block: 3, text: "'A gente entende' aproxima sem infantilizar — voz acolhedora característica." },
    ],
    history: "Voz consistente com últimas 12 runs deste médico.",
  },
  {
    id: "compliance", score: 6.2, alert: true, flagBlocks: [2, 3],
    verdict: "Roteiro tem 1 problema bloqueante de compliance e 1 ajuste recomendado.",
    confidence: "alta", duration: "48s", iterations: 4,
    subScores: [
      { label: "Promessa de resultado", score: 4.0 },
      { label: "Linguagem médica", score: 7.5 },
      { label: "Disclaimers", score: 6.0 },
      { label: "CFM Res. 2.336/2018", score: 7.0 },
    ],
    alerts: [
      { block: 3, blockLabel: "Valor", severity: "bloqueante", quote: "...rejuvenescer a pele em semanas...", rule: "CFM Res. 2.336/2018 art. 3º — vedação a promessa de resultado em comunicação médica.", source: "https://sistemas.cfm.org.br" },
    ],
    suggestions: [
      { block: 2, blockLabel: "Contexto", before: "...a produção de colágeno cai em torno de 1% ao ano.", after: "...estima-se que a produção de colágeno reduz aproximadamente 1% ao ano (Varani et al., 2006).", reason: "Dado deve vir acompanhado de fonte para conformidade com Cód. Ética Médica art. 113." },
      { block: 3, blockLabel: "Valor", before: "...rejuvenescer a pele em semanas...", after: "...estimular a produção natural de colágeno, com resultados que variam por protocolo e podem ser percebidos ao longo de meses.", reason: "Substituir 'rejuvenescer em semanas' (promessa de resultado) por descrição de mecanismo." },
    ],
    praises: [],
    history: "Compliance CFM apontou padrão similar de 'promessa de resultado' em 4 runs anteriores deste médico — considerar incluir guideline no briefing padrão.",
  },
  {
    id: "retention", score: 7.5,
    verdict: "Hook forte. Risco de drop no bloco 4 ('Como funciona') por densidade.",
    confidence: "média", duration: "29s", iterations: 2,
    subScores: [
      { label: "Força do hook", score: 9.0 },
      { label: "Densidade ideal", score: 6.5 },
      { label: "Ritmo entre blocos", score: 7.0 },
      { label: "Drop-off estimado", score: 7.5 },
    ],
    suggestions: [
      { block: 4, blockLabel: "Como funciona", before: "(parágrafo de 4 frases sobre PLLA, fibroblastos e neocolagênese)", after: "Cortar 1 frase técnica · mover detalhe pro bloco de Prova.", reason: "Densidade técnica no bloco 4 é o principal preditor de drop-off em conteúdo educacional médico (modelo treinado em 1.2k vídeos)." },
    ],
    praises: [
      { block: 1, text: "Hook sensorial ('rosto cansado') prende nos primeiros 3s — métrica crítica de retenção." },
    ],
    history: "Densidade no bloco 'Como funciona' aparece como ponto fraco em 6 runs deste médico.",
  },
  {
    id: "audience", score: 8.9,
    verdict: "Encaixa bem em mulher 35-50, classe AB, primeira intervenção estética.",
    confidence: "alta", duration: "21s", iterations: 2,
    subScores: [
      { label: "Match de persona", score: 9.5 },
      { label: "Linguagem da dor", score: 9.0 },
      { label: "Nível de leitura", score: 8.5 },
      { label: "Resonância emocional", score: 8.5 },
    ],
    suggestions: [],
    praises: [
      { block: 2, text: "Mencionar 'após 35' age como gatilho de identificação imediata pra persona-alvo." },
      { block: 3, text: "'Primeira intervenção' valida a hesitação — público novato se sente acolhido." },
    ],
    history: "Persona-fit recorrentemente alta — Dra. Marina tem voz natural pra esse público.",
  },
  {
    id: "hooklab", score: 8.0,
    verdict: "Pergunta sensorial funciona. Alternativa: começar pela emoção antes do diagnóstico.",
    confidence: "média", duration: "26s", iterations: 3,
    subScores: [
      { label: "Originalidade", score: 7.5 },
      { label: "Fricção emocional", score: 8.5 },
      { label: "Ganho de atenção", score: 8.5 },
      { label: "Alinhamento com bloco 2", score: 7.5 },
    ],
    suggestions: [
      { block: 1, blockLabel: "Hook", before: "Você acordou e o seu rosto parece um pouco mais 'cansado' do que ontem?", after: "Aquele olhar no espelho que parece pedir pausa — você reconhece esse cansaço?", reason: "Variação A/B testada — emoção primeiro converte 8% melhor em mulheres 35+ classe AB." },
    ],
    praises: [
      { block: 1, text: "Pergunta sensorial é técnica forte — engaja o sistema 1 antes do raciocínio." },
    ],
    history: "Hook Lab tem propensão a sugerir 'emoção antes de diagnóstico' — padrão consistente.",
  },
];

// Conflicts between critics — when 2+ disagree on same edit
const SAMPLE_CRITICS_CONFLICTS = [
  {
    block: 3, blockLabel: "Valor",
    quote: "rejuvenescer a pele em semanas",
    sides: [
      { criticId: "compliance", position: "Remover — promessa de resultado vedada pelo CFM.", weight: 9 },
      { criticId: "brand", position: "Manter 'rejuvenescer' — palavra-marca da Dra. Marina; ajustar contexto sem perder a palavra.", weight: 7 },
    ],
    recommendation: "Compliance prevalece (peso regulatório). Sugestão: substituir 'rejuvenescer em semanas' por 'estimular renovação ao longo de meses' — preserva ideia, retira promessa.",
  },
  {
    block: 5, blockLabel: "Prova",
    quote: "(estatística numérica vs. linguagem qualitativa)",
    sides: [
      { criticId: "marketing", position: "Adicionar dado numérico (78% melhora) para aumentar conversão.", weight: 8 },
      { criticId: "compliance", position: "Veto a dados sem fonte CFM-aprovada; se for usar, citar fonte primária.", weight: 9 },
    ],
    recommendation: "Combinar — usar dado numérico COM citação de estudo (Varani et al., 2006). Atende os dois.",
  },
];

const SAMPLE_CRITICS_CONSENSUS = [
  { kind: "praise", text: "Hook funciona", agents: ["brand", "marketing", "audience", "retention", "hooklab"] },
  { kind: "praise", text: "Linguagem acessível, nível de leitura adequado", agents: ["brand", "audience", "compliance", "marketing", "retention", "hooklab"] },
  { kind: "praise", text: "Persona-fit alto pra mulher 35-50 classe AB", agents: ["audience", "brand", "marketing"] },
];

// Run list — sorted by created desc, multiple statuses
const RUNS = [
  {
    id: "run-2087",
    title: "Bioestimulador de colágeno · pós-35",
    medic: "marina-aguiar",
    mode: "Roteirista",
    status: "needs-review",
    score: 8.1,
    duration: "4m 12s",
    blocks: 6,
    critics: 6,
    iterations: 2,
    created: "há 14 minutos",
    summary: "6 blocos prontos · 1 alerta de compliance no bloco 'Valor'",
  },
  {
    id: "run-2086",
    title: "Skinbooster vs hidratante · qual escolher",
    medic: "marina-aguiar",
    mode: "Diretor de Conteúdo",
    status: "approved",
    score: 9.0,
    duration: "3m 02s",
    blocks: 5,
    critics: 6,
    iterations: 1,
    created: "há 2 horas",
    summary: "Aprovado direto · enviado pra agendamento de gravação",
    author: "Rodrigo M.",
    published: true,
    publishedWhen: "ter, 21:00",
  },
  {
    id: "run-2085",
    title: "Rinoplastia funcional · não é só estética",
    medic: "rafael-costa",
    mode: "Roteirista",
    status: "running",
    score: null,
    duration: "rodando",
    blocks: 6,
    critics: 6,
    iterations: 0,
    created: "rodando agora",
    summary: "Críticos avaliando · ETA 40s",
    progress: 0.62,
  },
  {
    id: "run-2084",
    title: "Lipo HD · expectativas reais",
    medic: "rafael-costa",
    mode: "Roteirista",
    status: "rework",
    score: 5.4,
    duration: "5m 48s",
    blocks: 6,
    critics: 6,
    iterations: 3,
    created: "há 3 horas",
    summary: "Reprovado por compliance · roteiro original com 'antes/depois'",
  },
  {
    id: "run-2083",
    title: "Toxina · primeira aplicação após os 30",
    medic: "marina-aguiar",
    mode: "Avatar Editorial",
    status: "approved",
    score: 8.7,
    duration: "2m 45s",
    blocks: 5,
    critics: 6,
    iterations: 1,
    created: "ontem · 18:42",
    summary: "Aprovado · boa retenção predita",
    author: "Equipe M3A",
    published: true,
    publishedWhen: "qua, 19:00",
  },
  {
    id: "run-2082",
    title: "Reposição hormonal · mitos da menopausa",
    medic: "joana-pires",
    mode: "Roteirista",
    status: "needs-review",
    score: 7.6,
    duration: "4m 30s",
    blocks: 6,
    critics: 6,
    iterations: 2,
    created: "ontem · 14:11",
    summary: "Revisão pendente · 1 sugestão de tom",
  },
  {
    id: "run-2081",
    title: "Saúde íntima a laser · o que é e o que NÃO é",
    medic: "joana-pires",
    mode: "Diretor de Conteúdo",
    status: "approved",
    score: 8.9,
    duration: "3m 22s",
    blocks: 5,
    critics: 6,
    iterations: 1,
    created: "ontem · 11:08",
    summary: "Aprovado · postar terça",
    author: "Rodrigo M.",
    published: false,
    publishedWhen: null,
  },
  {
    id: "run-2080",
    title: "Microagulhamento · cicatriz de acne",
    medic: "marina-aguiar",
    mode: "Roteirista",
    status: "approved",
    score: 8.3,
    duration: "3m 58s",
    blocks: 6,
    critics: 6,
    iterations: 2,
    created: "anteontem",
    summary: "Aprovado · ajuste menor de hook",
    author: "Carla N.",
    published: true,
    publishedWhen: "seg, 12:00",
  },
];

const MODES = [
  {
    id: "roteirista",
    name: "Roteirista",
    desc: "6 blocos prontos para gravar (hook, contexto, valor, prova, CTA). Saída editável.",
    durationLabel: "~4 min",
    bestFor: "Reels semanais, conteúdo recorrente, pauta da semana.",
    icon: "Doc",
  },
  {
    id: "diretor",
    name: "Diretor de Conteúdo",
    desc: "Decide o tema da semana com base em estoque, tendências e gap de tema do médico.",
    durationLabel: "~6 min",
    bestFor: "Quando o médico não sabe sobre o que falar.",
    icon: "Layout",
  },
  {
    id: "editorial",
    name: "Avatar Editorial",
    desc: "Carrossel ou post de feed com 7–10 slides. Saída em texto + briefing visual.",
    durationLabel: "~3 min",
    bestFor: "Educacional pesado, ideal para feed.",
    icon: "Paper",
  },
  {
    id: "stories",
    name: "Stories conversado",
    desc: "Sequência de 4–6 stories com perguntas e enquetes — feito pra interação.",
    durationLabel: "~2 min",
    bestFor: "Aquecer audiência, mapear dúvidas reais.",
    icon: "Chat",
  },
];

window.M3A = { MEDICS, SAMPLE_SCRIPT, SAMPLE_SCRIPT_V2, CRITICS, SAMPLE_CRITICS_REVIEW, SAMPLE_CRITICS_CONFLICTS, SAMPLE_CRITICS_CONSENSUS, RUNS, MODES };
