/* global React, UI, Icons, M3A */
const { createElement: h, useState, useMemo } = React;
const I = Icons;
const { Card, Btn, Pill, StatusPill, Score, ScriptView, CriticRow } = UI;

/* ============================================================
   SCREEN 1 — Runs list
   ============================================================ */
function RunsList({ medicId, onOpenRun, onNewRun }) {
  const [filter, setFilter] = useState("all");
  const [scope, setScope] = useState("mine");
  const runs = M3A.RUNS.filter(r => scope === "all" || r.medic === medicId);
  const filtered = runs.filter(r => filter === "all" ? true : r.status === filter);

  const counts = {
    all: runs.length,
    "needs-review": runs.filter(r => r.status === "needs-review").length,
    running: runs.filter(r => r.status === "running").length,
    approved: runs.filter(r => r.status === "approved").length,
    rework: runs.filter(r => r.status === "rework").length,
  };

  const medic = M3A.MEDICS.find(m => m.id === medicId);

  return h("div", { className: "page" },
    h("div", { className: "page-inner wide" },
      h("div", { className: "page-header" },
        h("div", { className: "page-header__title" },
          h("h1", null, "Runs"),
          h("div", { className: "page-header__sub" },
            "Conteúdo gerado para ", h("strong", null, medic.name), ". ",
            h("span", null, `${counts["needs-review"]} aguardam sua revisão.`))),
        h("div", { className: "row", style: { gap: 12 } },
          h("div", { className: "tabs" },
            h("button", {
              className: `tabs__item ${scope === "mine" ? "is-active" : ""}`,
              onClick: () => setScope("mine"),
            }, "Meus médicos"),
            h("button", {
              className: `tabs__item ${scope === "all" ? "is-active" : ""}`,
              onClick: () => setScope("all"),
            }, "Toda a equipe")),
          h(Btn, { variant: "primary", icon: h(I.Plus, { size: 14 }), onClick: onNewRun }, "Disparar run"))),

      // Filter bar
      h("div", {
        style: {
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          padding: "8px 12px", background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: "var(--r-pill)",
        },
      },
        h(I.Filter, { size: 14, style: { color: "var(--fg-subtle)", marginLeft: 4, marginRight: 4 } }),
        ["all", "needs-review", "running", "approved", "rework"].map(f =>
          h("button", {
            key: f,
            className: `pill ${filter === f ? (f === "all" ? "pill--indigo" : `pill--${{ "needs-review": "neon", running: "teal", approved: "default", rework: "rose" }[f]}`) : ""}`,
            onClick: () => setFilter(f),
            style: {
              cursor: "pointer", border: filter === f ? "" : "1px solid transparent",
              background: filter === f ? "" : "transparent", padding: "5px 12px",
            },
          },
            h("span", null, { all: "todas", "needs-review": "review", running: "rodando", approved: "aprovadas", rework: "retrabalho" }[f]),
            h("span", { style: { opacity: 0.55, marginLeft: 4 } }, counts[f])),
        ),
        h("div", { className: "spacer" }),
        h("div", { className: "t-meta" }, "ordenar: mais recentes")),

      // Table
      h(Card, { elevated: true },
        h("table", { className: "table" },
          h("thead", null,
            h("tr", null,
              h("th", null, "Tema"),
              h("th", null, "Médico"),
              h("th", null, "Modo"),
              h("th", null, "Status"),
              h("th", { style: { textAlign: "right" } }, "Score"),
              h("th", null, "Iter."),
              h("th", null, "Quando"),
              h("th", null))),
          h("tbody", null, filtered.map(r => {
            const med = M3A.MEDICS.find(m => m.id === r.medic);
            const isReview = r.status === "needs-review";
            return h("tr", {
              key: r.id, onClick: () => onOpenRun(r.id),
              className: isReview ? "row-needs-review" : "",
            },
              h("td", null,
                h("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 2 } }, r.title),
                h("div", { className: "t-meta" },
                  r.summary,
                  r.status === "running" && h("span", { style: { marginLeft: 6 } }, "· ", h("span", { style: { color: "var(--teal-500)" } }, "rodando")))),
              h("td", null,
                h("div", { className: "row", style: { gap: 8 } },
                  h("span", { className: `avatar size-sm is-${med.color}` }, med.initials),
                  h("span", null, med.name.split(" ").slice(-1)[0]))),
              h("td", null, h("span", { className: "t-meta" }, r.mode)),
              h("td", null, h(StatusPill, { status: r.status })),
              h("td", { style: { textAlign: "right" } },
                h("span", {
                  className: "col-num",
                  style: { fontSize: 16, fontWeight: 500, color: r.score == null ? "var(--fg-subtle)" : (r.score >= 8.5 ? "var(--neon-600)" : r.score >= 7 ? "var(--fg)" : r.score >= 5.5 ? "var(--amber-600)" : "var(--rose-500)") },
                }, r.score == null ? "—" : r.score.toFixed(1))),
              h("td", null, h("span", { className: "t-meta" }, "v", r.iterations)),
              h("td", null, h("span", { className: "t-meta" }, r.created)),
              h("td", { style: { width: 32, color: "var(--fg-subtle)" } }, h(I.CaretRight, { size: 14 })));
          }))))));
}

/* ============================================================
   SCREEN 2 — Run detail
   ============================================================ */
function RunDetail({ runId, onBack, onReview, onWorkspace }) {
  const run = M3A.RUNS.find(r => r.id === runId) || M3A.RUNS[0];
  const medic = M3A.MEDICS.find(m => m.id === run.medic);
  const isRunning = run.status === "running";
  const reviews = M3A.SAMPLE_CRITICS_REVIEW;
  const avgScore = run.score;
  // null = show script. "all" = show summary. otherwise show one critic.
  const [selectedCritic, setSelectedCritic] = useState(null);
  const { CriticDetailPanel, CriticsSummaryPanel } = window.CriticPanels;

  return h("div", { className: "page page--dual", style: { paddingTop: 0 } },
    // Top toolbar — metrics (left) + actions (right). Naturally fixed because page doesn't scroll.
    !isRunning && h("div", {
      style: {
        flex: "0 0 auto",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 0",
      },
    },
      h("div", { className: "page-inner wide", style: { display: "flex", alignItems: "center", gap: 12, padding: "0 var(--s-6)" } },
        h("button", {
          className: "icon-btn", onClick: onBack, title: "Voltar para runs",
          style: { background: "transparent", border: 0, padding: 4, cursor: "pointer", color: "var(--fg-muted)", display: "inline-flex" },
        }, h(I.ArrowLeft, { size: 16 })),
        h("span", { className: "t-meta" },
          "v", run.iterations,
          " · ", h("strong", { style: { color: "var(--fg)" } }, run.score?.toFixed?.(1) || "—"), "/10",
          " · ", run.blocks, " blocos · ", run.critics, "/6 críticos · ", run.duration,
          " · ", run.id),
        h("div", { className: "spacer" }),
        h(Btn, { variant: "ghost", size: "sm", iconRight: false, icon: h(I.GitBranch, { size: 12 }), title: "Bifurcar como rascunho — pegar este roteiro como ponto de partida pra outro." }, "Bifurcar"),
        h(Btn, { variant: "ghost", size: "sm", iconRight: false, icon: h(I.Refresh, { size: 12 }), title: "Refazer com mesmo briefing — outra variação do mesmo prompt original." }, "Refazer"),
        h(Btn, { variant: "secondary", size: "sm", iconRight: false, icon: h(I.Wand, { size: 12 }), onClick: onWorkspace, title: "Abrir workspace — editar o roteiro lado a lado com o agente de revisão." }, "Workspace"),
        run.status === "needs-review" && h(Btn, { variant: "primary", size: "sm", iconRight: h(I.ArrowRight, { size: 12 }), onClick: onReview, title: "Revisar com 1 clique — aceitar/rejeitar sugestões dos 6 críticos no modo guiado." }, "Revisar"),
        run.status === "approved" && h(Btn, { variant: "primary", size: "sm", iconRight: false, icon: h(I.Check, { size: 12 }), title: "Exportar roteiro aprovado." }, "Exportar"),
        run.status === "rework" && h(Btn, { variant: "warn", size: "sm", onClick: onWorkspace, title: "Abrir workspace para revisar o que precisa de ajuste." }, "Abrir workspace"))),

    h("div", { className: "page-inner wide", style: { paddingTop: 20 } },

      // Running state — top progress
      isRunning && h(Card, {
        title: "rodando agora",
        right: h("span", { className: "t-meta" }, "etapa 3 de 5 · críticos em paralelo"),
      },
        h("div", { className: "bar" }, h("div", { className: "bar__fill" })),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 18 } },
          [
            { label: "Briefing", done: true },
            { label: "Pesquisa de tendências", done: true },
            { label: "Geração do roteiro", done: true },
            { label: "Crítica multi-agente", done: false, active: true },
            { label: "Revisão final", done: false },
          ].map((s, i) => h("div", { key: i, style: { padding: 10, border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: s.active ? "color-mix(in oklab, var(--teal-500), transparent 92%)" : s.done ? "var(--surface-2)" : "var(--surface)" } },
            h("div", { className: "row", style: { gap: 6, marginBottom: 4 } },
              s.done ? h(I.Check, { size: 12, style: { color: "var(--neon-600)" } }) :
                s.active ? h("span", { className: "pill__dot", style: { background: "var(--teal-500)", animation: "pulse 1.4s ease-in-out infinite" } }) :
                  h("span", { className: "pill__dot" }),
              h("span", { className: "t-micro" }, "etapa ", i + 1)),
            h("div", { style: { fontSize: 12.5, fontWeight: 500, color: s.done ? "var(--fg-muted)" : "var(--fg)" } }, s.label))))),

      // Stat row — removed; metrics live in the sticky bottom bar

      // Two main blocks
      !isRunning && h("div", { className: "split" },
        // Main — script preview OR critic detail OR critics summary (left)
        h("div", { className: "col", style: { gap: 16 } },
          selectedCritic === "all" ? h(CriticsSummaryPanel, {
            run,
            onBack: () => setSelectedCritic(null),
            onPickCritic: (id) => setSelectedCritic(id),
          })
          : selectedCritic ? h(CriticDetailPanel, {
            criticId: selectedCritic,
            onBack: () => setSelectedCritic(null),
            onPickAll: () => setSelectedCritic("all"),
          })
          : h(Card, {
            title: h("span", { className: "row", style: { gap: 10, alignItems: "center" } },
              h(StatusPill, { status: run.status }),
              h("span", { style: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "var(--fg)", letterSpacing: 0, textTransform: "none", textWrap: "balance" } }, run.title)),
            right: h("div", { className: "row", style: { gap: 6 } },
              h(Btn, { variant: "ghost", size: "sm", iconRight: false, icon: h(I.Copy, { size: 12 }) }, "Copiar"),
              h(Btn, { variant: "ghost", size: "sm", iconRight: false, icon: h(I.Doc, { size: 12 }) }, "Exportar")),
          }, h(ScriptView, { blocks: M3A.SAMPLE_SCRIPT }))),

        // Sidebar (right) — agentes críticos + briefing
        h("aside", { className: "split__sidebar" },
          h(Card, {
            title: h("button", {
              type: "button",
              onClick: () => setSelectedCritic("all"),
              style: { background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "inherit", font: "inherit", letterSpacing: "inherit", textTransform: "inherit", display: "inline-flex", alignItems: "center", gap: 6 },
              title: "Ver resumo geral dos 6 agentes",
            }, "agentes ", h("strong", { style: { color: "var(--fg)" } }, "críticos"), h(I.CaretRight, { size: 11, style: { color: "var(--fg-subtle)", marginLeft: 2 } })),
            right: h(Pill, { tone: "amber", dot: false }, "1 alerta"),
          },
            // Score header
            h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: "1px dashed var(--border)" } },
              h("div", null,
                h("div", { className: "t-micro", style: { marginBottom: 6 } }, "score geral"),
                h("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } },
                  h("span", { style: { fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "var(--fg)", lineHeight: 1 } }, run.score?.toFixed(1) || "—"),
                  h("span", { className: "t-meta", style: { fontSize: 11 } }, "/10"))),
              h("div", null,
                h("div", { className: "t-micro", style: { marginBottom: 6 } }, "iterações"),
                h("div", { style: { fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "var(--fg)", lineHeight: 1 } }, "v", run.iterations))),
            h("div", null, reviews.map(r =>
              h(CriticRow, { key: r.id, id: r.id, alert: r.alert, onClick: () => setSelectedCritic(r.id) })
            ))),

          h(Card, {
            title: "briefing",
            collapsible: true, defaultOpen: false,
          },
            h("div", { className: "col", style: { gap: 10, fontSize: 13, lineHeight: 1.5 } },
              h("div", null, h("div", { className: "t-micro", style: { marginBottom: 4 } }, "modo"), h(Pill, { tone: "indigo", dot: false }, run.mode)),
              h("div", null, h("div", { className: "t-micro", style: { marginBottom: 4 } }, "objetivo"), "Educacional · captação para consulta de avaliação"),
              h("div", null, h("div", { className: "t-micro", style: { marginBottom: 4 } }, "persona"), "Mulher 35-50, classe AB, primeira intervenção estética"),
              h("div", null, h("div", { className: "t-micro", style: { marginBottom: 4 } }, "âncora"), "Bioestimulador · queda de colágeno após 35"))),
        ))),
    // Sticky bottom action bar — moved to top
    null);
}

/* ============================================================
   SCREEN 3 — Review (modo A — guiado, aceitar/rejeitar)
   ============================================================ */
function ReviewScreen({ runId, onBack, onWorkspace }) {
  const run = M3A.RUNS.find(r => r.id === runId) || M3A.RUNS[0];
  const medic = M3A.MEDICS.find(m => m.id === run.medic);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState({ 0: null, 1: null });
  const [showMini, setShowMini] = useState(false);

  const totalSuggestions = 2;
  const decided = Object.values(acceptedSuggestions).filter(v => v !== null).length;

  function decide(idx, value) {
    setAcceptedSuggestions({ ...acceptedSuggestions, [idx]: value });
    if (decided + 1 >= totalSuggestions) setTimeout(() => setShowMini(true), 200);
  }

  return h("div", { className: "page", style: { paddingTop: 0 } },
    // Sub-header (sticky under main header)
    h("div", {
      style: {
        position: "sticky", top: "var(--header-h)", zIndex: 30,
        background: "color-mix(in oklab, var(--bg), transparent 8%)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 0", marginBottom: 24,
      },
    },
      h("div", { className: "page-inner editorial", style: { padding: "0 var(--s-6)", display: "flex", alignItems: "center", gap: 16 } },
        h("button", {
          className: "icon-btn", onClick: onBack, title: "Voltar",
        }, h(I.ArrowLeft, { size: 16 })),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { className: "t-meta" }, "review · ", run.id),
          h("div", { style: { fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, run.title)),
        h(Pill, { tone: "neon", pulse: decided < totalSuggestions, dot: true },
          decided, "/", totalSuggestions, " decididas"),
        h(Btn, { variant: "ghost", size: "sm", icon: h(I.Wand, { size: 14 }), onClick: onWorkspace }, "Abrir workspace"),
      )),

    h("div", { className: "page-inner editorial" },
      // Reading the script with inline diffs
      h("div", { className: "col", style: { gap: 28 } },
        // Each block, with inline suggestion attached if any
        M3A.SAMPLE_SCRIPT.map((b, idx) => {
          const sug = idx === 2 ? {
            critic: "compliance",
            severity: "warn",
            from: "O resultado aparece em semanas e é progressivo.",
            to: "O resultado costuma aparecer em algumas semanas, dependendo do protocolo.",
            why: "CFM 1.974 — evitar promessa de resultado em prazo determinado.",
            decided: acceptedSuggestions[0],
            decideKey: 0,
          } : idx === 3 ? {
            critic: "retention",
            severity: "info",
            from: "A gente conversa antes, mapeia as áreas e o tipo de pele, e o protocolo é desenhado para você. Não existe um 'pacote padrão' — cada rosto tem uma história e uma anatomia.",
            to: "A gente conversa antes, mapeia o que faz sentido pra você. Não existe pacote padrão — cada rosto tem uma história.",
            why: "Predição de drop-off de 18% nesse bloco. Cortar 1 frase deve recuperar ~7 pts.",
            decided: acceptedSuggestions[1],
            decideKey: 1,
          } : null;

          return h("div", { key: idx, className: "script__block", "data-block": b.block },
            h("div", { className: "script__num" },
              h("span", null, String(idx + 1).padStart(2, "0")),
              h("strong", null, b.label),
              sug && h("div", { style: { marginTop: 8 } }, h(Pill, {
                tone: sug.severity === "warn" ? "amber" : "teal",
                dot: false,
              }, M3A.CRITICS[sug.critic].name.split(" ")[0].toLowerCase()))),
            h("div", { className: "col", style: { gap: 12 } },
              h("div", { className: "script__body" }, h("p", null, b.text)),
              sug && h(SuggestionCard, { sug, onDecide: decide }))
          );
        }))),

    // Mini summary bar floating
    h("div", { className: `minibar ${(decided > 0) ? "is-visible" : ""}` },
      h("div", { className: "row", style: { gap: 12, padding: "0 12px 0 8px" } },
        h(Pill, { tone: "neon-solid", dot: false }, decided, "/", totalSuggestions),
        h("span", { style: { fontSize: 13, fontWeight: 500 } },
          decided === totalSuggestions ? "Pronto pra aprovar." : "Continue revisando."),
        decided === totalSuggestions
          ? h(Btn, { variant: "primary", size: "sm" }, "Aprovar e exportar")
          : h(Btn, { variant: "ghost", size: "sm", iconRight: false }, "Pular"),
      )),
  );
}

function SuggestionCard({ sug, onDecide }) {
  const meta = M3A.CRITICS[sug.critic];
  const decided = sug.decided;
  return h("div", {
    style: {
      borderRadius: "var(--r-md)",
      border: `1px solid ${decided === "accepted" ? "color-mix(in oklab, var(--neon-500), transparent 50%)" : decided === "rejected" ? "var(--border)" : "color-mix(in oklab, var(--amber-500), transparent 60%)"}`,
      background: decided === "accepted" ? "color-mix(in oklab, var(--neon-500), transparent 95%)" : decided === "rejected" ? "var(--surface)" : "color-mix(in oklab, var(--amber-500), transparent 95%)",
      overflow: "clip", opacity: decided === "rejected" ? 0.6 : 1,
    },
  },
    h("div", { style: { padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border)" } },
      h("span", { className: `avatar size-sm is-${meta.color}` }, h(I[meta.icon], { size: 12 })),
      h("div", { className: "col", style: { flex: 1 } },
        h("div", { style: { fontWeight: 600, fontSize: 12.5 } }, meta.name, " sugere"),
        h("div", { className: "t-meta", style: { fontSize: 10.5 } }, meta.role)),
      decided && h(Pill, { tone: decided === "accepted" ? "neon" : "default", dot: false },
        decided === "accepted" ? "aceita" : "mantida")),
    h("div", { className: "diff" },
      h("div", { className: "diff__row diff__row--del" }, sug.from),
      h("div", { className: "diff__row diff__row--add" }, sug.to),
      h("div", { className: "diff__rationale" }, h("strong", null, "Por quê: "), sug.why)),
    !decided && h("div", { style: { padding: 10, display: "flex", gap: 8, justifyContent: "flex-end" } },
      h(Btn, { variant: "ghost", size: "sm", iconRight: false, onClick: () => onDecide(sug.decideKey, "rejected") }, "Manter original"),
      h(Btn, { variant: "primary", size: "sm", iconRight: false, icon: h(I.Check, { size: 12 }), onClick: () => onDecide(sug.decideKey, "accepted") }, "Aplicar")),
  );
}

window.Screens = window.Screens || {};
Object.assign(window.Screens, { RunsList, RunDetail, ReviewScreen });
