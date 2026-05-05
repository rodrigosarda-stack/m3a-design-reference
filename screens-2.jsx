/* global React, UI, Icons, M3A */
const { createElement: h, useState, useRef, useEffect } = React;
const I = Icons;
const { Card, Btn, Pill, StatusPill, Score, ScriptView, CriticRow } = UI;

/* Shared review suggestions — used by ReviewPane AND Workspace.handleDecide */
const REVIEW_SUGGESTIONS = [
  {
    key: 0, blockIdx: 2, critic: "compliance", severity: "warn",
    from: "O resultado aparece em semanas e é progressivo.",
    to: "O resultado costuma aparecer em algumas semanas, dependendo do protocolo.",
    why: "CFM 1.974 — evitar promessa de resultado em prazo determinado.",
  },
  {
    key: 1, blockIdx: 3, critic: "retention", severity: "info",
    from: "A gente conversa antes, mapeia as áreas e o tipo de pele, e o protocolo é desenhado para você.",
    to: "A gente conversa antes, mapeia o que faz sentido pra você. Cada rosto tem uma história.",
    why: "Drop-off de 18% nesse bloco. Cortar 1 frase deve recuperar ~7 pts.",
  },
];

/* Seed action log — events that "happened" before the user opened the workspace */
function seedActionLog(run) {
  return [
    {
      kind: "chat", icon: "Volume", tone: "indigo",
      when: "há 3 min",
      title: "Conversou com Compliance + Brand",
      detail: "4 turnos · debate sobre \"rejuvenescer em semanas\" no bloco 'Valor'.",
      meta: "decisão: substituir frase",
      criticIds: ["compliance", "brand"],
    },
    {
      kind: "alert", icon: "AlertTriangle", tone: "rose",
      when: "há 5 min",
      title: "Compliance levantou alerta bloqueante",
      detail: "Bloco 'Valor' · CFM Res. 2.336/2018 art. 3º — promessa de resultado.",
      criticIds: ["compliance"],
    },
    {
      kind: "version", icon: "Sparkle", tone: "indigo",
      when: "há 14 min",
      title: "Roteiro regenerado para v2",
      detail: "Agente aplicou 3 sugestões automáticas de Brand Voice.",
      meta: "score 7.2 → 8.1",
    },
    {
      kind: "review", icon: "Users", tone: "indigo",
      when: "há 16 min",
      title: "6 críticos avaliaram v1",
      detail: "Marketing 8.4 · Brand 9.1 · Compliance 6.2 · Retenção 7.5 · Audiência 8.9 · Hook 8.0",
      meta: "duração total 4m 12s",
    },
    {
      kind: "version", icon: "Sparkle", tone: "indigo",
      when: "há 18 min",
      title: "Roteiro inicial gerado",
      detail: "Briefing automático a partir de 'Bioestimulador de colágeno · pós-35'.",
      meta: "modo Roteirista",
    },
  ];
}

/* ============================================================
   SCREEN 4 — Workspace (modo B — chat lado a lado com roteiro)
   ============================================================ */
function Workspace({ runId, onBack, initialMode = "chat" }) {
  const run = M3A.RUNS.find(r => r.id === runId) || M3A.RUNS[0];
  const medic = M3A.MEDICS.find(m => m.id === run.medic);
  const [script, setScript] = useState(M3A.SAMPLE_SCRIPT_V2 || M3A.SAMPLE_SCRIPT);
  const [liveScore, setLiveScore] = useState(run.score || 8.1);
  const [liveIterations, setLiveIterations] = useState(run.iterations || 2);
  const [evaluating, setEvaluating] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(null); // { from, to } for animation
  const evalTimerRef = useRef(null);
  const [activeBlock, setActiveBlock] = useState(0);
  const [mode, setMode] = useState(initialMode); // chat | revisar | criticos | historico
  // Review state — accepted/rejected suggestions
  const [decisions, setDecisions] = useState({ 0: null, 1: null });
  // Inline reference: { kind: "block", idx, label } OR { kind: "text", quote, blockIdx, label }
  const [ref, setRef] = useState(null);
  // Floating selection bubble: {x, y, quote, blockIdx, label, kind}
  const [selBubble, setSelBubble] = useState(null);
  const composerRef = useRef(null);

  // Listen to selection inside the script column
  useEffect(() => {
    function onSel() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setSelBubble(null); return; }
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node.nodeType === 1 ? node : node.parentElement;
      const blockEl = el && el.closest && el.closest("[data-block-idx]");
      if (!blockEl) { setSelBubble(null); return; }
      const text = sel.toString().trim();
      if (text.length < 2) { setSelBubble(null); return; }
      const r = range.getBoundingClientRect();
      const idx = parseInt(blockEl.getAttribute("data-block-idx"), 10);
      setSelBubble({
        kind: "text",
        x: r.left + r.width / 2,
        y: r.top - 8,
        quote: text,
        blockIdx: idx,
        label: script[idx]?.label || "",
      });
    }
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [script]);

  function attachBlockRef(idx) {
    setRef({ kind: "block", idx, label: script[idx].label });
    setActiveBlock(idx);
    composerRef.current?.focus();
  }
  function attachTextRef(b) {
    setRef({ kind: "text", quote: b.quote, blockIdx: b.blockIdx, label: b.label });
    window.getSelection()?.removeAllRanges();
    setSelBubble(null);
    composerRef.current?.focus();
  }
  const [messages, setMessages] = useState([
    {
      role: "agent", agentId: "compliance",
      time: "14:02",
      body: [
        h("p", { key: 1 }, "Li o roteiro inteiro. Marquei ", h("strong", null, "1 risco de compliance"), " no bloco 3 (\"Valor\") e ", h("strong", null, "1 oportunidade de retenção"), " no bloco 4."),
        h("p", { key: 2 }, "Quer começar pelo compliance? É o que pode segurar a aprovação."),
      ],
    },
    {
      role: "user", time: "14:03",
      body: [h("p", { key: 1 }, "Sim, começa por aí. Mas mantém o tom acolhedor.")],
    },
    {
      role: "agent", agentId: "compliance", time: "14:03",
      body: [
        h("p", { key: 1 }, "Combinado. A frase em questão é: ", h("em", null, "\"O resultado aparece em semanas e é progressivo.\"")),
        h("p", { key: 2 }, "Promessa em prazo é o que aciona a ", h("strong", null, "CFM 1.974"), ". Sugiro 3 alternativas — todas mantêm o tom da Dra. Marina:"),
      ],
      suggest: {
        label: "escolha uma reescrita",
        chips: [
          "Em algumas semanas, dependendo do protocolo.",
          "O resultado vem aos poucos, no seu ritmo.",
          "É progressivo — você acompanha a evolução.",
        ],
      },
    },
  ]);
  const [draft, setDraft] = useState("");

  // ------ Cross-tab state: action log + chat sessions ------
  const [actionLog, setActionLog] = useState(() => seedActionLog(run));
  const [chatSessions, setChatSessions] = useState({}); // { criticId: messages[] }
  const [activeCriticId, setActiveCriticId] = useState(null);

  function pushEvent(ev) {
    setActionLog(prev => [{ ...ev, when: "agora" }, ...prev]);
  }

  // Trigger critic re-evaluation: brief delay, then push score change event
  function reevaluate(reason) {
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current);
    setEvaluating(true);
    evalTimerRef.current = setTimeout(() => {
      // Compute new score deterministically based on a delta hint
      const prev = liveScore;
      // Small random walk anchored on reason
      const delta = reason?.delta != null ? reason.delta : (Math.random() - 0.4) * 0.6;
      const next = Math.max(5.5, Math.min(9.7, +(prev + delta).toFixed(1)));
      setLiveScore(next);
      setLiveIterations(it => it + 1);
      setEvaluating(false);
      setScoreFlash({ from: prev, to: next });
      setTimeout(() => setScoreFlash(null), 2200);
      pushEvent({
        kind: "review", icon: "Users", tone: "indigo",
        title: `6 críticos reavaliaram · v${liveIterations + 1}`,
        detail: reason?.detail || "Roteiro mudou — críticos rodaram de novo.",
        meta: `score ${prev.toFixed(1)} → ${next.toFixed(1)}`,
      });
    }, 1400);
  }

  function handleDecide(key, value) {
    setDecisions(prev => ({ ...prev, [key]: value }));
    const sug = REVIEW_SUGGESTIONS.find(s => s.key === key);
    if (!sug) return;
    const meta = M3A.CRITICS[sug.critic];
    const blockLabel = script[sug.blockIdx]?.label || `#${sug.blockIdx + 1}`;
    const priorText = script[sug.blockIdx]?.text || "";

    if (value === "accepted") {
      // Apply suggestion to the script
      setScript(prev => prev.map((b, i) =>
        i === sug.blockIdx ? { ...b, text: b.text.includes(sug.from) ? b.text.replace(sug.from, sug.to) : sug.to } : b
      ));
      pushEvent({
        kind: "decision", icon: "Check", tone: "neon",
        title: `Você aceitou sugestão de ${meta.name}`,
        detail: `Bloco '${blockLabel}' — ${sug.why}`,
        metaText: "aplicada no roteiro",
        criticIds: [sug.critic],
        undo: { decisionKey: key, blockIdx: sug.blockIdx, priorText, kind: "accepted" },
      });
      reevaluate({
        delta: sug.critic === "compliance" ? 0.6 : sug.critic === "retention" ? 0.4 : 0.3,
        detail: `Aplicação da sugestão de ${meta.name} no bloco '${blockLabel}'.`,
      });
    } else if (value === "rejected") {
      pushEvent({
        kind: "decision", icon: "Close", tone: "amber",
        title: `Você rejeitou sugestão de ${meta.name}`,
        detail: `Bloco '${blockLabel}' — manteve o texto original.`,
        criticIds: [sug.critic],
        undo: { decisionKey: key, blockIdx: sug.blockIdx, priorText, kind: "rejected" },
      });
    }
  }

  function undoDecision(eventIdx) {
    const ev = actionLog[eventIdx];
    if (!ev || !ev.undo || ev.undone) return;
    const { decisionKey, blockIdx, priorText, kind } = ev.undo;

    // Revert decision
    setDecisions(prev => ({ ...prev, [decisionKey]: null }));

    // If accepted, restore prior text
    if (kind === "accepted") {
      setScript(prev => prev.map((b, i) => i === blockIdx ? { ...b, text: priorText } : b));
    }

    // Mark event as undone + add new event documenting the undo
    setActionLog(prev => {
      const updated = prev.map((e, i) => i === eventIdx ? { ...e, undone: true } : e);
      const sug = REVIEW_SUGGESTIONS.find(s => s.key === decisionKey);
      const m = sug ? M3A.CRITICS[sug.critic] : null;
      const blockLabel = script[blockIdx]?.label || `#${blockIdx + 1}`;
      return [{
        kind: "undo", icon: "RotateLeft", tone: "indigo",
        when: "agora",
        title: "Decisão desfeita",
        detail: kind === "accepted"
          ? `Bloco '${blockLabel}' voltou pro texto anterior${m ? ` (sugestão de ${m.name} reaberta)` : ""}.`
          : `Sugestão${m ? ` de ${m.name}` : ""} no bloco '${blockLabel}' voltou pra pendente.`,
        criticIds: m ? [sug.critic] : undefined,
      }, ...updated];
    });

    // Re-evaluate if text actually changed
    if (kind === "accepted") {
      const sug = REVIEW_SUGGESTIONS.find(s => s.key === decisionKey);
      const blockLabel = script[blockIdx]?.label || `#${blockIdx + 1}`;
      reevaluate({
        delta: -0.4,
        detail: `Reversão da sugestão${sug ? ` de ${M3A.CRITICS[sug.critic].name}` : ""} no bloco '${blockLabel}'.`,
      });
    }
  }

  // Clear chat transcript with one critic + push event
  function clearChatSession(criticId) {
    const m = M3A.CRITICS[criticId];
    if (!m) return;
    setChatSessions(prev => {
      const next = { ...prev };
      delete next[criticId];
      return next;
    });
    pushEvent({
      kind: "undo", icon: "RotateLeft", tone: "amber",
      title: `Conversa com ${m.name} apagada`,
      detail: "Transcrição removida — próxima abertura começa do zero.",
      criticIds: [criticId],
    });
  }

  // Restore an entire script version
  function restoreVersion(versionNum) {
    const target = versionNum === 1 ? M3A.SAMPLE_SCRIPT : (M3A.SAMPLE_SCRIPT_V2 || M3A.SAMPLE_SCRIPT);
    setScript(target);
    // Wipe pending decisions (since they targeted a different text)
    setDecisions({ 0: null, 1: null });
    pushEvent({
      kind: "version", icon: "RotateLeft", tone: "indigo",
      title: `Roteiro restaurado para v${versionNum}`,
      detail: versionNum === 1
        ? "Voltou pro roteiro inicial gerado a partir do briefing."
        : "Voltou pra v2 com revisões automáticas de Brand Voice.",
      metaText: `${REVIEW_SUGGESTIONS.length} decisões pendentes resetadas`,
    });
    reevaluate({
      delta: versionNum === 1 ? -0.9 : 0.2,
      detail: `Restaurado para v${versionNum}.`,
    });
  }

  function send() {
    if (!draft.trim() && !ref) return;
    const refDisplay = ref?.kind === "block"
      ? { type: "block", label: `bloco ${String(ref.idx + 1).padStart(2, "0")} · ${ref.label}` }
      : ref?.kind === "text"
        ? { type: "text", label: ref.label, quote: ref.quote }
        : null;
    setMessages([...messages, { role: "user", time: "agora", ref: refDisplay, body: [h("p", { key: 1 }, draft || "(referenciando seleção)")] }]);
    setDraft("");
    setRef(null);
    setTimeout(() => {
      setMessages(m => [...m, {
        role: "agent", agentId: "brand", time: "agora",
        body: [
          h("p", { key: 1 }, refDisplay?.type === "text"
            ? `Olhei o trecho "${refDisplay.quote.slice(0, 40)}${refDisplay.quote.length > 40 ? "…" : ""}". Vou propor 3 reescritas mantendo o tom da Dra. Marina.`
            : "Pegando — vou aplicar mantendo as expressões \"a gente\" e \"juntas\" que são marca registrada da Dra. Marina."),
        ],
      }]);
    }, 600);
  }

  return h("div", { className: "page", style: { padding: 0, height: "calc(100vh - var(--header-h))" } },
    h("div", { style: { height: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: 0 } },
      // LEFT — script as editable column
      h("div", { style: { borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" } },
        h("div", { style: { padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 } },
          h("button", { className: "icon-btn", onClick: onBack }, h(I.ArrowLeft, { size: 16 })),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { className: "t-meta" }, "workspace · ", run.id),
            h("div", { style: { fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, run.title))),
        h("div", { style: { flex: 1, overflow: "auto", padding: "28px 32px 80px" } },
          h("div", { className: "script", style: { maxWidth: 620 } },
            script.map((b, idx) => h("div", {
              key: idx, className: "script__block", "data-block": b.block, "data-block-idx": idx,
              onClick: e => {
                // Don't trigger if there's a text selection — let selectionchange handle it.
                if (window.getSelection()?.toString().trim().length > 1) return;
                setActiveBlock(idx);
                const r = e.currentTarget.getBoundingClientRect();
                setSelBubble({
                  kind: "block",
                  x: r.left + r.width / 2,
                  y: r.top - 8,
                  blockIdx: idx,
                  label: script[idx].label,
                });
              },
              style: {
                cursor: "pointer", padding: "8px 10px", margin: "-8px -10px",
                borderRadius: "var(--r-md)",
                background: activeBlock === idx ? "color-mix(in oklab, var(--neon-500), transparent 94%)" : "transparent",
                outline: activeBlock === idx ? "1px solid color-mix(in oklab, var(--neon-500), transparent 60%)" : "none",
                position: "relative",
              },
            },
              h("div", { className: "script__num" },
                h("span", null, String(idx + 1).padStart(2, "0")),
                h("strong", null, b.label)),
              h("div", { className: "script__body" }, h("p", null, b.text)))))),

        // Bottom action bar
        h("div", {
          style: {
            padding: "12px 24px", borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--surface)",
          },
        },
          h("span", { className: "t-meta" }, "bloco ativo: ", h("strong", { style: { color: "var(--fg)" } }, String(activeBlock + 1).padStart(2, "0"), " · ", script[activeBlock].label)),
          h("div", { className: "spacer" }),
          h(Btn, { variant: "ghost", size: "sm", iconRight: false, icon: h(I.Refresh, { size: 12 }) }, "Refazer bloco"),
          h(Btn, { variant: "primary", size: "sm" }, "Aprovar"))),

      // RIGHT — multi-mode pane (chat / revisar / críticos)
      h("div", { style: { display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface)" } },
        // Mode switcher
        h("div", {
          style: {
            padding: "10px 14px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8,
          },
        },
          h("div", { className: "tabs" },
            [
              { id: "revisar", label: "Revisar", badge: 2 - Object.values(decisions).filter(v => v).length },
              { id: "chat", label: "Chat" },
              { id: "criticos", label: "Críticos" },
              { id: "versoes", label: "Versões" },
              { id: "historico", label: "Histórico" },
            ].map(t => h("button", {
              key: t.id,
              className: `tabs__item ${mode === t.id ? "is-active" : ""}`,
              onClick: () => setMode(t.id),
            }, t.label, t.badge > 0 && h("span", {
              style: {
                marginLeft: 6,
                background: "var(--neon-500)", color: "var(--ink)",
                fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
                padding: "1px 5px", borderRadius: 999,
              },
            }, t.badge)))),
          h("div", { className: "spacer" }),
          h("button", { className: "icon-btn", title: "Configurações" }, h(I.Settings, { size: 14 }))),

        // Panes
        mode === "chat" && h(ChatPane, { messages, attachedRef: ref, setRef, draft, setDraft, send, composerRef }),
        mode === "revisar" && h(ReviewPane, { script, decisions, onDecide: handleDecide, onJumpToBlock: setActiveBlock, onAskAgent: (sug) => { setMode("chat"); setRef({ kind: "text", quote: sug.from, blockIdx: sug.blockIdx, label: script[sug.blockIdx].label }); setTimeout(() => composerRef.current?.focus(), 60); } }),
        mode === "criticos" && h(CriticsPane, { run, liveScore, liveIterations, evaluating, scoreFlash, activeCriticId, setActiveCriticId, chatSessions, setChatSessions, pushEvent }),
        mode === "versoes" && h(VersionsPane, { run, liveScore, liveIterations, currentScript: script, onRestore: restoreVersion }),
        mode === "historico" && h(ActionLogPane, { run, events: actionLog, onOpenCritic: (id) => { setActiveCriticId(id); setMode("criticos"); }, onUndo: undoDecision, onClearChat: clearChatSession })),

      // Floating selection bubble (text or block click)
      selBubble && h("div", {
        style: {
          position: "fixed",
          left: selBubble.x, top: selBubble.y,
          transform: "translate(-50%, -100%)",
          background: "var(--indigo-700)",
          color: "var(--paper-50)",
          padding: "6px 10px",
          borderRadius: 999,
          fontSize: 12, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          zIndex: 100,
        },
        onMouseDown: e => {
          e.preventDefault();
          if (selBubble.kind === "block") {
            attachBlockRef(selBubble.blockIdx);
            setSelBubble(null);
          } else {
            attachTextRef(selBubble);
          }
        },
      },
        h(I.AtSign, { size: 12 }),
        selBubble.kind === "block" ? "Referenciar bloco" : "Referenciar no chat")));
}

function MessageBubble({ msg }) {
  const refBlock = msg.ref && h("div", {
    style: {
      display: "flex", alignItems: "stretch",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-sm)",
      background: "var(--surface-2)",
      overflow: "hidden",
      marginBottom: 6,
      maxWidth: 460,
    },
  },
    h("span", { style: { width: 3, background: "var(--neon-500)" } }),
    h("div", { style: { padding: "6px 10px", minWidth: 0 } },
      h("div", { className: "t-micro", style: { marginBottom: 2 } },
        msg.ref.type === "block" ? "bloco" : "trecho · " + msg.ref.label),
      msg.ref.type === "block"
        ? h("div", { style: { fontSize: 12.5, fontWeight: 600 } }, msg.ref.label)
        : h("div", { style: { fontSize: 12.5, fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-muted)" } }, "“", msg.ref.quote, "”")));

  if (msg.role === "user") {
    return h("div", { className: "msg" },
      h("span", { className: "avatar size-md", style: { background: "var(--paper-300)", color: "var(--indigo-700)" } }, "RM"),
      h("div", null,
        h("div", { className: "msg__name" }, "Rodrigo", h("span", { className: "msg__time" }, msg.time)),
        refBlock,
        h("div", { className: "msg__body" }, msg.body)));
  }
  const m = M3A.CRITICS[msg.agentId];
  return h("div", { className: "msg" },
    h("span", { className: `avatar size-md is-${m.color}` }, h(I[m.icon], { size: 14 })),
    h("div", null,
      h("div", { className: "msg__name" },
        m.name,
        h(Pill, { tone: m.color === "rose" ? "rose" : m.color, dot: false }, "agente"),
        h("span", { className: "msg__time" }, msg.time)),
      refBlock,
      h("div", { className: "msg__body" }, msg.body),
      msg.suggest && h("div", { className: "suggest", style: { marginTop: 10 } },
        h("div", { className: "suggest__title" }, msg.suggest.label),
        h("div", { className: "suggest__chips" },
          msg.suggest.chips.map((c, i) => h("button", { key: i, className: "chip", style: { textAlign: "left", lineHeight: 1.4, fontFamily: "var(--font-serif)", fontSize: 13.5, padding: "8px 12px" } }, c))))));
}

/* ============================================================
   SCREEN 5 — Médicos list
   ============================================================ */
function MedicsList({ onOpenMedic }) {
  return h("div", { className: "page" },
    h("div", { className: "page-inner wide" },
      h("div", { className: "page-header" },
        h("div", { className: "page-header__title" },
          h("h1", null, "Médicos"),
          h("div", { className: "page-header__sub" }, "Cada perfil tem voz, procedimentos e linhas vermelhas próprias.")),
        h(Btn, { variant: "primary", icon: h(I.Plus, { size: 14 }) }, "Adicionar médico")),
      h("div", { className: "card card--elevated", style: { background: "var(--surface-elevated)" } },
        // Column header
        h("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1.6fr) minmax(0, 2fr) minmax(0, 1.4fr) 80px 80px 32px",
            gap: 16,
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
          },
        },
          h("span", { className: "t-micro" }, "médico"),
          h("span", { className: "t-micro" }, "voz"),
          h("span", { className: "t-micro" }, "procedimentos"),
          h("span", { className: "t-micro", style: { textAlign: "right" } }, "runs"),
          h("span", { className: "t-micro", style: { textAlign: "right" } }, "posts"),
          h("span", null)),
        // Rows
        M3A.MEDICS.map((m, idx) => h("button", {
          key: m.id, onClick: () => onOpenMedic(m.id),
          style: {
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1.6fr) minmax(0, 2fr) minmax(0, 1.4fr) 80px 80px 32px",
            gap: 16, alignItems: "center",
            padding: "16px 20px",
            background: "transparent",
            border: "none",
            borderTop: idx === 0 ? "none" : "1px solid var(--border)",
            width: "100%", textAlign: "left",
            cursor: "pointer",
            transition: "background 0.1s ease",
          },
          onMouseEnter: e => e.currentTarget.style.background = "var(--surface-2)",
          onMouseLeave: e => e.currentTarget.style.background = "transparent",
        },
          // Médico
          h("div", { className: "row", style: { gap: 12, minWidth: 0 } },
            h("span", { className: `avatar size-lg is-${m.color}` }, m.initials),
            h("div", { style: { minWidth: 0 } },
              h("div", { style: { fontWeight: 600, fontSize: 14.5, marginBottom: 2 } }, m.name),
              h("div", { className: "t-meta" }, m.specialty, " · ", m.handle))),
          // Voz
          h("div", {
            style: {
              fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.45,
              color: "var(--fg-muted)",
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            },
          }, m.voice),
          // Procedimentos
          h("div", { className: "row", style: { gap: 6, flexWrap: "wrap" } },
            m.procedures.slice(0, 2).map(p => h("span", {
              key: p, className: "pill",
              style: { textTransform: "none", letterSpacing: 0, fontSize: 11.5 },
            }, p)),
            m.procedures.length > 2 && h("span", { className: "t-meta" }, "+", m.procedures.length - 2)),
          // Runs
          h("span", {
            style: {
              fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500,
              fontVariantNumeric: "tabular-nums", textAlign: "right",
            },
          }, m.runs),
          // Posts
          h("span", {
            style: {
              fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500,
              fontVariantNumeric: "tabular-nums", textAlign: "right",
              color: "var(--fg-muted)",
            },
          }, m.posts),
          // Caret
          h("span", { style: { color: "var(--fg-subtle)", display: "flex", justifyContent: "flex-end" } },
            h(I.CaretRight, { size: 14 })))))));
}

/* ============================================================
   SCREEN 5b — Médico detail (identity)
   ============================================================ */
function MedicDetail({ medicId, onBack }) {
  const m = M3A.MEDICS.find(x => x.id === medicId) || M3A.MEDICS[0];
  const [tab, setTab] = useState("voz");

  return h("div", { className: "page" },
    h("div", { className: "page-inner editorial" },
      h("div", { className: "row", style: { marginBottom: 12, gap: 6, color: "var(--fg-subtle)", fontSize: 12 } },
        h("a", { href: "#medics", onClick: e => { e.preventDefault(); onBack(); }, className: "muted" }, "Médicos"),
        h(I.CaretRight, { size: 12 }),
        h("span", null, m.name)),

      // Hero
      h("div", { className: "fbleed-section", style: { marginBottom: 24 } },
        h("div", { style: { position: "relative", display: "flex", gap: 24, alignItems: "center" } },
          h("span", {
            className: `avatar size-lg is-${m.color}`,
            style: { width: 80, height: 80, fontSize: 26, border: "3px solid rgba(255,255,255,0.1)" },
          }, m.initials),
          h("div", null,
            h("div", { style: { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, marginBottom: 6 } },
              m.specialty, " · ", m.handle),
            h("h1", { style: { color: "white", marginBottom: 8 } }, m.name),
            h("div", { style: { color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-serif)", fontSize: 17, fontStyle: "italic" } }, "\"", m.voice, "\"")),
          h("div", { className: "spacer" }),
          h(Btn, { variant: "primary" }, "Disparar run com ", m.name.split(" ").pop()))),

      // Tabs
      h("div", { className: "tabs", style: { marginBottom: 20 } },
        ["voz", "procedimentos", "linhas-vermelhas", "histórico"].map(t =>
          h("button", {
            key: t, className: `tabs__item ${tab === t ? "is-active" : ""}`,
            onClick: () => setTab(t),
          }, t))),

      // Content per tab
      tab === "voz" && h("div", { className: "split" },
        h("div", { className: "col", style: { gap: 16 } },
          h(Card, { title: "voz", titleStrong: "do médico" },
            h("p", { style: { fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: 1.6, color: "var(--fg)", margin: 0 } }, m.voice, " ", m.avatarTone, ".")),
          h(Card, { title: "exemplo", titleStrong: "de hook" },
            h("p", { className: "script__body", style: { borderLeftColor: "var(--amber-500)", fontSize: 18, fontWeight: 500, fontFamily: "var(--font-serif)", padding: "0 0 0 20px", margin: 0 } }, M3A.SAMPLE_SCRIPT[0].text)),
          h(Card, { title: "expressões", titleStrong: "marca registrada" },
            h("div", { className: "row", style: { gap: 8, flexWrap: "wrap" } },
              ["a gente", "vamos olhar juntas", "no seu ritmo", "faz sentido pra você", "no consultório eu vejo"].map(p =>
                h("span", { key: p, className: "pill", style: { fontFamily: "var(--font-serif)", textTransform: "none", letterSpacing: 0, fontSize: 13, padding: "6px 12px" } }, "\"", p, "\""))))),
        h("aside", { className: "split__sidebar" },
          h(Card, { title: "calibração" },
            h("div", { className: "col", style: { gap: 12 } },
              [
                { label: "formalidade", level: 1 },
                { label: "densidade técnica", level: 1 },
                { label: "intimidade", level: 3 },
                { label: "humor", level: 1 },
                { label: "evidência citada", level: 2 },
              ].map(s => h("div", { key: s.label, className: "row", style: { justifyContent: "space-between" } },
                h("span", { className: "t-meta", style: { textTransform: "none", letterSpacing: 0, fontSize: 12.5 } }, s.label),
                h("span", { className: "dots" }, [0, 1, 2, 3].map(i => h("span", { key: i, className: `dots__dot ${i < s.level ? "is-filled" : ""}` })))))))
            )),

      tab === "procedimentos" && h("div", { className: "col", style: { gap: 12 } },
        m.procedures.map(p => h("div", { key: p, className: "card", style: { padding: 16, display: "flex", alignItems: "center", gap: 14 } },
          h("span", { className: `avatar size-md is-${m.color}` }, h(I.Syringe, { size: 14 })),
          h("div", { style: { flex: 1 } },
            h("div", { style: { fontWeight: 600 } }, p),
            h("div", { className: "t-meta" }, "ver pautas geradas (", Math.floor(Math.random() * 12 + 3), ") · histórico de runs")),
          h(I.ArrowRight, { size: 16, style: { color: "var(--fg-subtle)" } })))),

      tab === "linhas-vermelhas" && h("div", { className: "col", style: { gap: 12 } },
        h("div", { className: "card", style: { padding: 20, background: "color-mix(in oklab, var(--rose-500), transparent 95%)", borderColor: "color-mix(in oklab, var(--rose-500), transparent 70%)" } },
          h("div", { className: "row", style: { gap: 10, marginBottom: 12 } },
            h(I.Lock, { size: 14, style: { color: "var(--rose-500)" } }),
            h("span", { className: "t-micro", style: { color: "var(--rose-500)" } }, "nunca aparecer no roteiro")),
          h("div", { className: "col", style: { gap: 8 } },
            m.forbidden.map(f => h("div", { key: f, style: { fontFamily: "var(--font-serif)", fontSize: 15.5 } }, "— ", f))))),

      tab === "histórico" && h("div", { className: "card" },
        h("table", { className: "table" },
          h("thead", null, h("tr", null, h("th", null, "Tema"), h("th", null, "Status"), h("th", null, "Score"), h("th", null, "Quando"))),
          h("tbody", null, M3A.RUNS.filter(r => r.medic === m.id).map(r =>
            h("tr", { key: r.id },
              h("td", null, r.title),
              h("td", null, h(StatusPill, { status: r.status })),
              h("td", null, h("span", { className: "col-num" }, r.score == null ? "—" : r.score.toFixed(1))),
              h("td", null, h("span", { className: "t-meta" }, r.created)))))))
    ));
}

/* ============================================================
   Workspace right-panel modes — Chat / Review / Críticos / Histórico
   ============================================================ */
function ChatPane({ messages, attachedRef: anchorRef, setRef, draft, setDraft, send, composerRef }) {
  return h(React.Fragment, null,
    // Agents bar (compact)
    h("div", { style: { padding: "10px 16px", borderBottom: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: 10 } },
      h("div", { style: { display: "flex" } }, ["compliance", "brand", "retention", "marketing"].map((id, i) => {
        const m = M3A.CRITICS[id];
        return h("span", {
          key: id,
          className: `avatar size-sm is-${m.color}`,
          style: { marginLeft: i === 0 ? 0 : -6, border: "2px solid var(--surface)" },
        }, h(I[m.icon], { size: 11 }));
      })),
      h("div", { className: "t-meta" }, "4 agentes ativos · compliance · brand · retenção · marketing")),
    h("div", { style: { flex: 1, overflow: "auto", padding: "16px 20px" } },
      messages.map((m, i) => h(MessageBubble, { key: i, msg: m }))),
    // Composer
    h("div", { style: { padding: 14, borderTop: "1px solid var(--border)" } },
      h("div", { style: { border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)", background: "var(--surface-elevated)", overflow: "clip" } },
        anchorRef && h("div", {
          style: {
            display: "flex", alignItems: "stretch", gap: 0,
            margin: "10px 10px 0",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            background: "color-mix(in oklab, var(--neon-500), transparent 92%)",
            overflow: "hidden",
          },
        },
          h("span", { style: { width: 3, background: "var(--neon-500)" } }),
          h("div", { style: { flex: 1, padding: "8px 10px", minWidth: 0 } },
            h("div", { className: "t-micro", style: { marginBottom: 2, color: "var(--fg-muted)" } },
              anchorRef.kind === "block" ? "referenciando bloco" : "referenciando trecho"),
            anchorRef.kind === "block"
              ? h("div", { style: { fontSize: 12.5, fontWeight: 600 } },
                String(anchorRef.idx + 1).padStart(2, "0"), " · ", anchorRef.label)
              : h("div", { style: { fontSize: 12.5, fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                "“", anchorRef.quote, "”")),
          h("button", { className: "icon-btn", onClick: () => setRef(null), style: { alignSelf: "flex-start", margin: 4 }, title: "Remover referência" },
            h(I.Close, { size: 12 }))),
        h("textarea", {
          ref: composerRef,
          className: "textarea",
          value: draft, onChange: e => setDraft(e.target.value),
          placeholder: anchorRef ? "Adicione um pedido sobre essa seleção…" : "Pergunte ao agente, ou peça uma reescrita…",
          style: { border: "none", padding: 12, minHeight: 64, background: "transparent" },
          onKeyDown: e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); },
        }),
        h("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "6px 8px 8px", borderTop: "1px dashed var(--border)" } },
          h("button", { className: "icon-btn", title: "Anexar" }, h(I.Plus, { size: 14 })),
          h("button", { className: "chip" }, "@compliance"),
          h("button", { className: "chip" }, "@brand"),
          h("div", { className: "spacer" }),
          h("span", { className: "kbd" }, "⌘", h("span", { style: { marginLeft: 2 } }, "↵")),
          h(Btn, { variant: "primary", size: "sm", iconRight: h(I.Send, { size: 12 }), onClick: send }, "Enviar")))));
}

function ReviewPane({ script, decisions, onDecide, onJumpToBlock, onAskAgent }) {
  const suggestions = REVIEW_SUGGESTIONS;
  const decided = Object.values(decisions).filter(v => v).length;
  const total = suggestions.length;

  return h("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } },
    h("div", { style: { padding: "12px 16px", borderBottom: "1px dashed var(--border)", display: "flex", alignItems: "center", gap: 10 } },
      h(Pill, { tone: "neon", pulse: decided < total, dot: true }, decided, "/", total, " decididas"),
      h("span", { className: "t-meta" }, decided === total ? "Pronto pra aprovar." : "Sugestões pendentes nos blocos abaixo.")),
    h("div", { style: { flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 } },
      suggestions.map(sug => h(SuggestionCard, {
        key: sug.key,
        sug: { ...sug, decided: decisions[sug.key] },
        onDecide,
        onJump: () => onJumpToBlock(sug.blockIdx),
        onAsk: () => onAskAgent(sug),
      }))),
    h("div", { style: { padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 } },
      h("div", { className: "spacer" }),
      decided === total
        ? h(Btn, { variant: "primary", size: "sm", icon: h(I.Check, { size: 12 }) }, "Aprovar e exportar")
        : h(Btn, { variant: "ghost", size: "sm" }, "Pular pendentes")));
}

function SuggestionCard({ sug, onDecide, onJump, onAsk }) {
  const meta = M3A.CRITICS[sug.critic];
  const decided = sug.decided;
  return h("div", {
    style: {
      borderRadius: "var(--r-md)",
      border: `1px solid ${decided === "accepted" ? "color-mix(in oklab, var(--neon-500), transparent 50%)" : decided === "rejected" ? "var(--border)" : "color-mix(in oklab, var(--amber-500), transparent 60%)"}`,
      background: decided === "accepted" ? "color-mix(in oklab, var(--neon-500), transparent 95%)" : decided === "rejected" ? "var(--surface-elevated)" : "color-mix(in oklab, var(--amber-500), transparent 95%)",
      overflow: "clip", opacity: decided === "rejected" ? 0.65 : 1,
    },
  },
    h("div", { style: { padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" } },
      h("span", { className: `avatar size-sm is-${meta.color}` }, h(I[meta.icon], { size: 12 })),
      h("div", { style: { flex: 1 } },
        h("div", { style: { fontWeight: 600, fontSize: 12.5 } }, meta.name, " sugere"),
        h("button", { onClick: onJump, className: "muted", style: { fontSize: 10.5, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-mono)" } },
          "→ ir ao bloco ", String(sug.blockIdx + 1).padStart(2, "0"))),
      decided && h(Pill, { tone: decided === "accepted" ? "neon" : "default", dot: false },
        decided === "accepted" ? "aceita" : "mantida")),
    h("div", { className: "diff" },
      h("div", { className: "diff__row diff__row--del" }, sug.from),
      h("div", { className: "diff__row diff__row--add" }, sug.to),
      h("div", { className: "diff__rationale" }, h("strong", null, "Por quê: "), sug.why)),
    !decided && h("div", { style: { padding: 10, display: "flex", gap: 6, justifyContent: "flex-end", borderTop: "1px dashed var(--border)" } },
      h(Btn, { variant: "ghost", size: "sm", iconRight: false, onClick: onAsk }, "Perguntar"),
      h(Btn, { variant: "ghost", size: "sm", iconRight: false, onClick: () => onDecide(sug.key, "rejected") }, "Manter"),
      h(Btn, { variant: "primary", size: "sm", iconRight: false, icon: h(I.Check, { size: 12 }), onClick: () => onDecide(sug.key, "accepted") }, "Aplicar")));
}

function CriticsPane({ run, liveScore, liveIterations, evaluating, scoreFlash, activeCriticId, setActiveCriticId, chatSessions, setChatSessions, pushEvent }) {
  const reviews = M3A.SAMPLE_CRITICS_REVIEW || [];

  if (activeCriticId) {
    return h(CriticChat, {
      criticId: activeCriticId, run,
      onBack: () => setActiveCriticId(null),
      onSwitchCritic: setActiveCriticId,
      chatSessions, setChatSessions, pushEvent,
    });
  }

  const flashUp = scoreFlash && scoreFlash.to > scoreFlash.from;
  const flashDown = scoreFlash && scoreFlash.to < scoreFlash.from;

  return h("div", { style: { flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 } },
    h("div", { className: "row", style: { gap: 12, padding: "8px 4px 12px", borderBottom: "1px dashed var(--border)" } },
      h("div", null,
        h("div", { className: "t-micro" }, "score geral"),
        h("div", {
          style: {
            fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500,
            color: flashUp ? "var(--neon-600)" : flashDown ? "var(--rose-600)" : "var(--fg)",
            transition: "color 600ms ease",
            opacity: evaluating ? 0.4 : 1,
          },
        },
          evaluating ? "—" : (liveScore?.toFixed?.(1) || "—"),
          h("span", { className: "t-meta", style: { fontSize: 13, marginLeft: 4 } }, "/10"),
          scoreFlash && !evaluating && h("span", {
            style: {
              fontSize: 11, marginLeft: 6,
              color: flashUp ? "var(--neon-600)" : "var(--rose-600)",
              fontFamily: "var(--font-mono)",
            },
          }, flashUp ? "↑" : "↓", " ", Math.abs(scoreFlash.to - scoreFlash.from).toFixed(1)))),
      h("div", null,
        h("div", { className: "t-micro" }, "iterações"),
        h("div", { style: { fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500 } }, "v", liveIterations || 1)),
      h("div", { className: "spacer" }),
      evaluating
        ? h("div", { className: "row", style: { gap: 6, color: "var(--indigo-500)" } },
          h("span", { className: "loader-dot" }),
          h("span", { style: { fontSize: 11.5, fontFamily: "var(--font-mono)" } }, "reavaliando…"))
        : h("span", { className: "t-meta", style: { fontSize: 11.5 } }, "clique pra conversar")),
    reviews.length === 0
      ? h("div", { className: "empty", style: { padding: 20 } },
        h("p", null, "Os 6 críticos avaliam compliance, marca, retenção, marketing, clareza e veracidade."))
      : reviews.map((r, i) => {
        const had = chatSessions[r.id]?.length;
        return h("div", { key: i, style: { position: "relative" } },
          h(CriticRow, { ...r, onClick: () => setActiveCriticId(r.id) }),
          had ? h("span", {
            style: {
              position: "absolute", right: 56, top: "50%", transform: "translateY(-50%)",
              fontSize: 10, color: "var(--fg-subtle)", fontFamily: "var(--font-mono)",
              pointerEvents: "none",
            },
          }, "💬 ", had) : null);
      }));
}

/* ============================================================
   CriticChat — conversa com um crítico específico
   ============================================================ */
function CriticChat({ criticId, run, onBack, onSwitchCritic, chatSessions, setChatSessions, pushEvent }) {
  const review = M3A.SAMPLE_CRITICS_REVIEW.find(r => r.id === criticId);
  const meta = M3A.CRITICS[criticId];
  if (!meta || !review) return null;

  // Build initial messages from review data (only when no stored session exists)
  const initialMessages = useMemoMessages(criticId, review, meta);
  const stored = chatSessions[criticId];
  const [messages, setMessages] = useState(stored && stored.length ? stored : initialMessages);
  const [draft, setDraft] = useState("");
  const [mentionMenu, setMentionMenu] = useState(null);
  const [mentioned, setMentioned] = useState([]);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Reset on critic change
  useEffect(() => {
    const s = chatSessions[criticId];
    setMessages(s && s.length ? s : initialMessages);
    setMentioned([]);
    setDraft("");
  }, [criticId]);

  // Persist transcript to parent
  useEffect(() => {
    setChatSessions(prev => ({ ...prev, [criticId]: messages }));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function handleInput(e) {
    const v = e.target.value;
    setDraft(v);
    // Detect @ at end of text — open mention menu
    const last = v[v.length - 1];
    if (last === "@") {
      const rect = inputRef.current.getBoundingClientRect();
      setMentionMenu({ open: true });
    } else if (mentionMenu && !v.includes("@")) {
      setMentionMenu(null);
    }
  }

  function pickMention(id) {
    const m = M3A.CRITICS[id];
    // Replace trailing @ with @Name
    const newDraft = draft.replace(/@$/, `@${m.name.split(" ")[0]} `);
    setDraft(newDraft);
    setMentionMenu(null);
    if (!mentioned.includes(id) && id !== criticId) {
      setMentioned([...mentioned, id]);
    }
    inputRef.current?.focus();
  }

  function send() {
    if (!draft.trim()) return;
    const userMsg = { role: "user", time: "agora", body: draft };
    const newMentions = Object.keys(M3A.CRITICS).filter(id => {
      if (id === criticId) return false;
      const name = M3A.CRITICS[id].name.split(" ")[0];
      return draft.includes(`@${name}`);
    });
    setMessages(m => [...m, userMsg]);
    setDraft("");
    setMentionMenu(null);

    // Add new mentions to active set
    const allActive = [...new Set([criticId, ...mentioned, ...newMentions])];
    if (newMentions.length) setMentioned(prev => [...new Set([...prev, ...newMentions])]);

    // Record event in action log (one per send, summarizing convo so far)
    if (pushEvent) {
      const totalActive = [criticId, ...new Set([...mentioned, ...newMentions])];
      pushEvent({
        kind: "chat", icon: "Volume", tone: "indigo",
        title: totalActive.length > 1
          ? `Conversou com ${meta.name.split(" ")[0]} + ${totalActive.length - 1}`
          : `Conversou com ${meta.name}`,
        detail: draft.length > 80 ? draft.slice(0, 80) + "…" : draft,
        criticIds: totalActive,
      });
    }

    // Mock primary critic response
    setTimeout(() => {
      setMessages(m => [...m, {
        role: "agent", criticId, time: "agora",
        body: agentResponse(criticId, draft, run),
      }]);
    }, 700);

    // If new critics were mentioned, they reply too
    newMentions.forEach((mid, i) => {
      setTimeout(() => {
        setMessages(m => [...m, {
          role: "agent", criticId: mid, time: "agora",
          body: agentResponse(mid, draft, run, criticId),
        }]);
      }, 1400 + i * 600);
    });
  }

  const activeCritics = [criticId, ...mentioned];

  return h("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } },
    // Header with back + critic identity
    h("div", {
      style: {
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--surface)", flexShrink: 0,
      },
    },
      h("button", { className: "icon-btn", onClick: onBack, title: "Voltar à lista" },
        h(I.ArrowRight, { size: 14, style: { transform: "rotate(180deg)" } })),
      h("span", { className: `avatar size-md is-${meta.color}` }, h(I[meta.icon] || I.Users, { size: 14 })),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { style: { fontWeight: 600, fontSize: 14 } }, meta.name),
        h("div", { className: "t-meta", style: { fontSize: 11.5 } }, meta.role)),
      h("div", { style: { textAlign: "right" } },
        h("div", { style: { fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 500, color: review.score >= 8 ? "var(--neon-600)" : review.score >= 7 ? "var(--amber-600)" : "var(--rose-600)" } },
          review.score.toFixed(1)),
        h("div", { className: "t-micro", style: { fontSize: 10 } }, "/10"))),

    // Mentioned critics row (if any)
    mentioned.length > 0 && h("div", {
      style: {
        padding: "8px 16px", borderBottom: "1px dashed var(--border)",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        background: "color-mix(in oklab, var(--surface-elevated), transparent 30%)",
      },
    },
      h("span", { className: "t-micro" }, "também na conversa:"),
      mentioned.map(id => {
        const m = M3A.CRITICS[id];
        return h("button", {
          key: id, className: "pill", onClick: () => onSwitchCritic(id),
          style: { gap: 6, fontSize: 11, padding: "4px 8px", cursor: "pointer", textTransform: "none", letterSpacing: 0 },
        },
          h("span", { className: `avatar size-sm is-${m.color}`, style: { width: 16, height: 16 } }, h(I[m.icon] || I.Users, { size: 9 })),
          m.name);
      })),

    // Messages
    h("div", { ref: scrollRef, style: { flex: 1, overflow: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 } },
      messages.map((msg, i) => h(ChatMessage, { key: i, msg, currentCriticId: criticId }))),

    // Composer
    h("div", { style: { borderTop: "1px solid var(--border)", padding: 12, position: "relative", background: "var(--surface)", flexShrink: 0 } },
      mentionMenu && h(MentionMenu, {
        currentId: criticId,
        onPick: pickMention,
        onClose: () => setMentionMenu(null),
      }),
      h("div", { style: { display: "flex", alignItems: "flex-end", gap: 8 } },
        h("textarea", {
          ref: inputRef, value: draft, onChange: handleInput,
          onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } },
          placeholder: `conversar com ${meta.name.split(" ")[0]}…  (digite @ pra trazer outro crítico)`,
          rows: 2,
          style: {
            flex: 1, resize: "none", padding: "10px 12px",
            border: "1px solid var(--border)", borderRadius: 10,
            background: "var(--surface-elevated)", color: "var(--fg)",
            fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.5,
            outline: "none",
          },
        }),
        h(Btn, { variant: "primary", onClick: send, disabled: !draft.trim() }, "Enviar"))));
}

/* Chat message bubble */
function ChatMessage({ msg, currentCriticId }) {
  if (msg.role === "user") {
    return h("div", { style: { display: "flex", justifyContent: "flex-end" } },
      h("div", {
        style: {
          maxWidth: "78%", padding: "10px 14px",
          background: "var(--indigo-600)", color: "#F4F1EA",
          borderRadius: "14px 14px 4px 14px",
          fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.5,
        },
      }, msg.body));
  }

  // agent
  const m = M3A.CRITICS[msg.criticId];
  if (!m) return null;
  const isCurrent = msg.criticId === currentCriticId;

  return h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start" } },
    h("span", { className: `avatar size-md is-${m.color}`, style: { flexShrink: 0 } },
      h(I[m.icon] || I.Users, { size: 14 })),
    h("div", { style: { flex: 1, minWidth: 0 } },
      h("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 } },
        h("span", { style: { fontWeight: 600, fontSize: 12.5 } }, m.name),
        h("span", { className: "t-meta", style: { fontSize: 11 } }, msg.time || "agora")),
      h("div", {
        style: {
          padding: "10px 14px",
          background: isCurrent ? "var(--surface-elevated)" : "color-mix(in oklab, var(--surface-elevated), transparent 50%)",
          border: "1px solid var(--border)",
          borderRadius: "4px 14px 14px 14px",
          fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.55,
          color: "var(--fg)",
        },
      }, msg.body)));
}

/* @ mention menu */
function MentionMenu({ currentId, onPick, onClose }) {
  const others = Object.entries(M3A.CRITICS).filter(([id]) => id !== currentId);
  return h("div", {
    style: {
      position: "absolute", bottom: "100%", left: 12, marginBottom: 6,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: 6, minWidth: 240,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
    },
  },
    h("div", { className: "t-micro", style: { padding: "4px 8px 6px" } }, "trazer crítico pra conversa"),
    others.map(([id, m]) => h("button", {
      key: id,
      onClick: () => onPick(id),
      style: {
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", border: "none", borderRadius: 6,
        background: "transparent", cursor: "pointer", textAlign: "left",
        color: "var(--fg)",
      },
      onMouseEnter: (e) => e.currentTarget.style.background = "var(--surface-elevated)",
      onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
    },
      h("span", { className: `avatar size-sm is-${m.color}`, style: { width: 22, height: 22 } },
        h(I[m.icon] || I.Users, { size: 11 })),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { style: { fontSize: 13, fontWeight: 600 } }, m.name),
        h("div", { className: "t-meta", style: { fontSize: 11 } }, m.role)))));
}

/* Build the canned opening sequence for a critic */
function useMemoMessages(criticId, review, meta) {
  return React.useMemo(() => {
    const msgs = [];
    // Opening: verdict
    msgs.push({
      role: "agent", criticId, time: "há 2 min",
      body: h("div", { className: "col", style: { gap: 8 } },
        h("div", null, review.verdict),
        h("div", { className: "t-meta", style: { fontSize: 11.5 } },
          "analisei em ", review.duration, " · ", review.iterations, " iterações · confiança ", review.confidence)),
    });
    // Alerts (compliance)
    if (review.alerts && review.alerts.length) {
      review.alerts.forEach(a => {
        msgs.push({
          role: "agent", criticId, time: "há 2 min",
          body: h("div", { className: "col", style: { gap: 8 } },
            h("div", { className: "row", style: { gap: 6 } },
              h("span", {
                className: "pill",
                style: { background: "color-mix(in oklab, var(--rose-500), transparent 85%)", color: "var(--rose-600)", fontSize: 10.5, padding: "2px 8px" },
              }, a.severity)),
            h("div", null, "no bloco ", h("strong", null, a.blockLabel), ", a frase ",
              h("em", { style: { color: "var(--rose-600)" } }, "“", a.quote, "”"),
              " viola ", h("span", { style: { fontFamily: "var(--font-mono)", fontSize: 12.5 } }, a.rule.split("—")[0].trim()), "."),
            h("div", { className: "t-meta", style: { fontSize: 11.5 } }, a.rule)),
        });
      });
    }
    // Suggestions (one)
    if (review.suggestions && review.suggestions.length) {
      const s = review.suggestions[0];
      msgs.push({
        role: "agent", criticId, time: "há 1 min",
        body: h("div", { className: "col", style: { gap: 8 } },
          h("div", null, "no bloco ", h("strong", null, s.blockLabel || `#${s.block}`), " sugiro:"),
          h("div", {
            style: {
              padding: "8px 10px", borderRadius: 6,
              background: "color-mix(in oklab, var(--rose-500), transparent 92%)",
              borderLeft: "2px solid var(--rose-500)",
              fontSize: 13, color: "var(--fg-muted)", textDecoration: "line-through",
            },
          }, s.before),
          h("div", {
            style: {
              padding: "8px 10px", borderRadius: 6,
              background: "color-mix(in oklab, var(--neon-500), transparent 88%)",
              borderLeft: "2px solid var(--neon-500)",
              fontSize: 13.5,
            },
          }, s.after),
          h("div", { className: "t-meta", style: { fontSize: 11.5 } }, s.reason),
          h("div", { className: "row", style: { gap: 6, marginTop: 4 } },
            h(Btn, { variant: "primary", size: "sm" }, "Aplicar no roteiro"),
            h(Btn, { variant: "ghost", size: "sm" }, "Ver bloco"))),
      });
    }
    // Praise
    if ((!review.suggestions || !review.suggestions.length) && review.praises && review.praises.length) {
      const p = review.praises[0];
      msgs.push({
        role: "agent", criticId, time: "há 1 min",
        body: h("div", { className: "col", style: { gap: 6 } },
          h("div", null, "elogio no bloco ", h("strong", null, "#", p.block), ":"),
          h("div", {
            style: {
              padding: "8px 10px", borderRadius: 6,
              background: "color-mix(in oklab, var(--neon-500), transparent 88%)",
              borderLeft: "2px solid var(--neon-500)",
              fontSize: 13.5,
            },
          }, p.text)),
      });
    }
    return msgs;
  }, [criticId, review.id]);
}

/* Mock agent reply — produces something context-aware */
function agentResponse(criticId, userMsg, run, contextCriticId) {
  const m = M3A.CRITICS[criticId];
  const lower = userMsg.toLowerCase();

  // If brought in by mention, give second opinion
  if (contextCriticId && contextCriticId !== criticId) {
    const otherName = M3A.CRITICS[contextCriticId].name.split(" ")[0];
    const responses = {
      brand: `entendo o ponto do ${otherName}, mas a Dra. Marina usa essa palavra como assinatura. dá pra preservar a ideia ajustando só o entorno — sugiro manter "rejuvenescer" e tirar o prazo "em semanas".`,
      compliance: `discordo do ${otherName}. CFM é peso regulatório, não estilístico. promessa de resultado é veto explícito — não tem como contornar mantendo a frase.`,
      marketing: `do meu lado, manter o termo da Dra. ajuda no CTR. mas se compliance veta, a saída é redirecionar pro mecanismo: "estimular renovação" funciona se vier com prova social no bloco 5.`,
      retention: `seja qual for o caminho, mantenham a frase curta. o bloco já tá denso e cada palavra extra aumenta drop-off em ~2%.`,
      audience: `pra mulher 35+ a palavra "rejuvenescer" tem peso emocional. se for trocar, "renovação" preserva 80% da carga. "estimular" é seco demais isolado.`,
      hooklab: `no hook não muda nada — meu ponto é só sobre a abertura. concordo com o que ${otherName} colocou.`,
    };
    return responses[criticId] || `do ponto de vista de ${m.role.toLowerCase()}, faz sentido o que o ${otherName} levantou.`;
  }

  // First-person continuation
  if (/sim|concordo|aplica|aceit/.test(lower)) {
    return "ok, marquei como aplicado. o roteiro vai ser regenerado e eu reavalio na próxima iteração.";
  }
  if (/n[aã]o|discord|recus/.test(lower)) {
    return "anotado. vou registrar a decisão no histórico — se isso virar padrão, sugiro ajustar o briefing-base do médico pra eu não levantar de novo.";
  }
  if (/por qu|porque|por que/.test(lower)) {
    if (criticId === "compliance") return `a Resolução CFM 2.336/2018 art. 3º veda promessa de resultado em comunicação médica. é regra dura, não diretriz — fiscalização tem multa. fonte: sistemas.cfm.org.br`;
    if (criticId === "marketing") return `dado numérico aumenta percepção de credibilidade em ~12% (benchmark interno de 1.2k vídeos do banco). sem número, o bloco "Prova" performa abaixo da média.`;
    if (criticId === "retention") return `densidade técnica é o principal preditor de drop-off em conteúdo educacional médico. modelo treinado em 1.2k vídeos do segmento.`;
    return `é uma combinação de heurística e padrão histórico. quer que eu detalhe o cálculo?`;
  }
  if (/manter|preserv/.test(lower)) {
    return `entendo. nesse caso registro como decisão consciente do médico — não vou levantar de novo nos próximos runs do mesmo tema.`;
  }
  // Default
  return `pode me explicar melhor o que tá te preocupando? assim eu reavalio considerando o contexto que você trouxer.`;
}

function VersionsPane({ run, liveScore, liveIterations, currentScript, onRestore }) {
  const [comparing, setComparing] = useState(false);
  const versions = [
    { v: 2, when: "há 14 min", who: "Agente · brand", note: "Substituiu \"a paciente\" por \"a gente\" em 3 ocorrências.", score: liveScore || 8.1, current: true },
    { v: 1, when: "há 18 min", who: "Geração inicial", note: "Briefing automático a partir de 'Bioestimulador de colágeno'.", score: 7.2 },
  ];

  if (comparing) return h(VersionCompareView, { onBack: () => setComparing(false), versions });

  return h("div", { style: { flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 } },
    h("div", { className: "row", style: { gap: 8, padding: "4px 4px 12px", borderBottom: "1px dashed var(--border)" } },
      h("div", null,
        h("div", { className: "t-micro" }, "versão atual"),
        h("div", { style: { fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500 } }, "v", liveIterations || 1)),
      h("div", { className: "spacer" }),
      h(Btn, { variant: "ghost", size: "sm", onClick: () => setComparing(true) }, "Comparar v1 ↔ v2")),
    versions.map((v, i) => h("div", {
      key: i,
      className: "card card--elevated",
      style: {
        background: "var(--surface-elevated)", padding: "12px 14px",
        borderColor: v.current ? "var(--neon-500)" : "var(--border)",
        borderWidth: v.current ? 1.5 : 1,
      },
    },
      h("div", { className: "row", style: { gap: 8, marginBottom: 4 } },
        h("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 } }, "v", v.v),
        v.current && h("span", { className: "pill", style: { background: "var(--neon-500)", color: "var(--ink)", fontSize: 10, padding: "1px 6px" } }, "atual"),
        h("span", { className: "t-meta" }, v.when, " · ", v.who),
        h("div", { className: "spacer" }),
        h("span", { style: { fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "var(--neon-600)" } }, v.score.toFixed(1))),
      h("div", { style: { fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.45 } }, v.note),
      h("div", { className: "row", style: { gap: 6, marginTop: 8 } },
        h(Btn, { variant: "ghost", size: "sm", onClick: () => setComparing(true) }, "Ver diff"),
        !v.current && onRestore && h(Btn, {
          variant: "ghost", size: "sm",
          onClick: () => {
            if (window.confirm(`Restaurar para v${v.v}? Decisões pendentes serão resetadas.`)) onRestore(v.v);
          },
        }, "Restaurar")))));
}

/* Side-by-side comparison of v1 vs v2 with word-level diff highlights */
function VersionCompareView({ onBack, versions }) {
  const v1 = M3A.SAMPLE_SCRIPT;
  const v2 = M3A.SAMPLE_SCRIPT_V2 || M3A.SAMPLE_SCRIPT;
  const blocks = Math.max(v1.length, v2.length);

  return h("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } },
    h("div", {
      style: {
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      },
    },
      h("button", { className: "icon-btn", onClick: onBack, title: "Voltar" },
        h(I.ArrowRight, { size: 14, style: { transform: "rotate(180deg)" } })),
      h("div", { style: { fontWeight: 600, fontSize: 14 } }, "Comparar v1 ↔ v2"),
      h("div", { className: "spacer" }),
      h("span", { className: "t-meta", style: { fontSize: 11.5 } },
        "vermelho = removido · verde = adicionado")),

    h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, flex: 1, overflow: "hidden" } },
      // v1 column
      h("div", { style: { borderRight: "1px solid var(--border)", overflow: "auto", padding: 16 } },
        h("div", { className: "row", style: { gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed var(--border)" } },
          h("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 } }, "v1"),
          h("span", { className: "t-meta" }, versions[1].when, " · ", versions[1].who),
          h("div", { className: "spacer" }),
          h("span", { style: { fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg-muted)" } }, versions[1].score.toFixed(1))),
        Array.from({ length: blocks }).map((_, i) => h(DiffBlock, { key: i, side: "left", a: v1[i], b: v2[i] }))),
      // v2 column
      h("div", { style: { overflow: "auto", padding: 16, background: "color-mix(in oklab, var(--neon-500), transparent 96%)" } },
        h("div", { className: "row", style: { gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed var(--border)" } },
          h("span", { style: { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 } }, "v2"),
          h("span", { className: "pill", style: { background: "var(--neon-500)", color: "var(--ink)", fontSize: 10, padding: "1px 6px" } }, "atual"),
          h("span", { className: "t-meta" }, versions[0].when, " · ", versions[0].who),
          h("div", { className: "spacer" }),
          h("span", { style: { fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--neon-600)", fontWeight: 500 } }, versions[0].score.toFixed(1))),
        Array.from({ length: blocks }).map((_, i) => h(DiffBlock, { key: i, side: "right", a: v1[i], b: v2[i] })))));
}

function DiffBlock({ side, a, b }) {
  const block = side === "left" ? a : b;
  const other = side === "left" ? b : a;
  if (!block) {
    return h("div", { style: { padding: "12px 0", opacity: 0.4 } },
      h("div", { className: "t-meta", style: { fontStyle: "italic", fontSize: 12 } },
        side === "left" ? "(novo na v2)" : "(removido)"));
  }

  // Word-level diff between block.text and other?.text
  const myText = block.text || "";
  const otherText = other?.text || "";
  const tokens = wordDiff(side === "left" ? myText : otherText, side === "left" ? otherText : myText);

  return h("div", {
    style: {
      padding: "12px 0", borderBottom: "1px dashed var(--border)",
    },
  },
    h("div", { className: "row", style: { gap: 6, marginBottom: 6 } },
      h("span", { className: "t-micro", style: { fontFamily: "var(--font-mono)" } }, block.label),
      h("span", { className: "t-meta", style: { fontSize: 10.5 } }, block.time)),
    h("div", { style: { fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.6, color: "var(--fg)" } },
      tokens.map((t, i) => {
        if (t.kind === "same") return h("span", { key: i }, t.text);
        const isAdd = side === "right" && t.kind === "add";
        const isDel = side === "left" && t.kind === "del";
        if (isAdd) {
          return h("span", {
            key: i,
            style: {
              background: "color-mix(in oklab, var(--neon-500), transparent 75%)",
              padding: "1px 3px", borderRadius: 3,
            },
          }, t.text);
        }
        if (isDel) {
          return h("span", {
            key: i,
            style: {
              background: "color-mix(in oklab, var(--rose-500), transparent 80%)",
              textDecoration: "line-through", textDecorationColor: "var(--rose-500)",
              padding: "1px 3px", borderRadius: 3, color: "var(--fg-muted)",
            },
          }, t.text);
        }
        return null;
      })));
}

/* Tiny LCS-based word diff. Returns tokens [{kind: "same"|"add"|"del", text}] from POV of `mine`. */
function wordDiff(mine, theirs) {
  const a = (mine || "").split(/(\s+)/);
  const b = (theirs || "").split(/(\s+)/);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ kind: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ kind: "del", text: a[i] }); i++; }
    else { out.push({ kind: "add", text: b[j] }); j++; }
  }
  while (i < n) { out.push({ kind: "del", text: a[i++] }); }
  while (j < m) { out.push({ kind: "add", text: b[j++] }); }
  return out;
}

/* ============================================================
   ActionLogPane — diário de ações e decisões do run
   ============================================================ */
function ActionLogPane({ run, events, onOpenCritic, onUndo }) {

  const toneColor = {
    neon: "var(--neon-500)",
    rose: "var(--rose-500)",
    amber: "var(--amber-500)",
    indigo: "var(--indigo-500)",
  };

  return h("div", { style: { flex: 1, overflow: "auto", padding: 16 } },
    h("div", { style: { padding: "4px 4px 12px", borderBottom: "1px dashed var(--border)", marginBottom: 4 } },
      h("div", { className: "t-micro" }, "diário do run"),
      h("div", { style: { fontSize: 13, color: "var(--fg-muted)", marginTop: 2 } },
        events.length, " eventos · ações, decisões e alertas em ordem cronológica reversa")),

    h("div", { style: { position: "relative", paddingLeft: 22, marginTop: 8 } },
      // vertical timeline line
      h("div", {
        style: {
          position: "absolute", left: 11, top: 12, bottom: 12,
          width: 1, background: "var(--border)",
        },
      }),
      events.map((e, i) => {
        const Icon = I[e.icon] || I.Clock;
        const color = toneColor[e.tone] || "var(--indigo-500)";
        return h("div", { key: i, style: { position: "relative", marginBottom: 16 } },
          // dot
          h("div", {
            style: {
              position: "absolute", left: -22, top: 4,
              width: 22, height: 22, borderRadius: "50%",
              background: "var(--surface)", border: `1.5px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color,
            },
          }, h(Icon, { size: 11 })),

          h("div", {
            className: e.criticIds ? "card" : "",
            style: {
              padding: e.criticIds ? "10px 12px" : "0 0 0 8px",
              background: e.criticIds ? "var(--surface-elevated)" : "transparent",
              cursor: e.criticIds ? "pointer" : "default",
              opacity: e.undone ? 0.5 : 1,
            },
            onClick: e.criticIds ? () => onOpenCritic(e.criticIds[0]) : undefined,
          },
            h("div", { className: "row", style: { gap: 8, marginBottom: 2 } },
              h("span", { style: { fontWeight: 600, fontSize: 13, textDecoration: e.undone ? "line-through" : "none" } }, e.title),
              e.undone && h("span", { className: "pill", style: { fontSize: 10, padding: "1px 6px", background: "var(--border)", color: "var(--fg-muted)" } }, "desfeita"),
              h("div", { className: "spacer" }),
              h("span", { className: "t-meta", style: { fontSize: 11.5, fontFamily: "var(--font-mono)" } }, e.when)),
            h("div", { style: { fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.5, fontFamily: "var(--font-serif)" } }, e.detail),
            (e.meta || e.metaText) && h("div", { className: "t-meta", style: { fontSize: 11, marginTop: 4, color } }, "↳ ", e.meta || e.metaText),
            e.criticIds && h("div", { className: "row", style: { gap: 6, marginTop: 8 } },
              e.criticIds.map(id => {
                const m = M3A.CRITICS[id]; if (!m) return null;
                return h("span", {
                  key: id, className: "pill",
                  style: { gap: 5, fontSize: 10.5, padding: "2px 7px", textTransform: "none", letterSpacing: 0 },
                },
                  h("span", { className: `avatar size-sm is-${m.color}`, style: { width: 14, height: 14 } },
                    h(I[m.icon] || I.Users, { size: 8 })),
                  m.name);
              }),
              h("span", { className: "t-meta", style: { fontSize: 11 } }, "↳ reabrir conversa")),
            e.undo && !e.undone && onUndo && h("div", {
              style: { marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "flex-end" },
              onClick: (ev) => ev.stopPropagation(),
            },
              h("button", {
                onClick: (ev) => { ev.stopPropagation(); onUndo(i); },
                style: {
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 999,
                  background: "var(--surface)", color: "var(--fg-muted)", cursor: "pointer",
                  fontSize: 11.5, fontFamily: "var(--font-sans)",
                },
              },
                h(I.RotateLeft, { size: 11 }),
                "desfazer"))));
      })));
}

window.Screens = window.Screens || {};
Object.assign(window.Screens, { Workspace, MedicsList, MedicDetail });
