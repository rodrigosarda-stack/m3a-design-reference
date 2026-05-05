/* ============================================================
   Critic panels — Summary (all 6 agents) + Detail (one agent)
   Replaces the script card in RunDetail when a critic / "all" is selected.
   ============================================================ */
const { createElement: ch } = React;
const cI = Icons;
const { Card: cCard, Btn: cBtn, Pill: cPill } = UI;

// Score color helper
function cScoreColor(score) {
  if (score == null) return "var(--fg-subtle)";
  if (score >= 8.5) return "var(--neon-600)";
  if (score >= 7) return "var(--fg)";
  if (score >= 5.5) return "var(--amber-600)";
  return "var(--rose-500)";
}

// Bar showing a 0-10 score
function CScoreBar({ value, color, max = 10 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = color || cScoreColor(value);
  return ch("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
    ch("div", { style: { flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" } },
      ch("div", { style: { height: "100%", width: `${pct}%`, background: c, transition: "width 0.4s ease" } })),
    ch("span", { style: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: c, minWidth: 32, textAlign: "right" } },
      value != null ? value.toFixed(1) : "—"));
}

function CSection({ title, kicker, children, accent }) {
  return ch("section", { style: { marginBottom: 28 } },
    ch("header", { style: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--border)" } },
      accent && ch("span", { style: { width: 4, height: 14, background: accent, borderRadius: 2 } }),
      ch("h3", { style: { margin: 0, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)" } }, title),
      kicker && ch("span", { style: { fontSize: 12, color: "var(--fg-subtle)" } }, kicker)),
    children);
}

/* ------------------------------------------------------------
   CriticDetailPanel — opens when user clicks a single critic
   ------------------------------------------------------------ */
function CriticDetailPanel({ criticId, onBack, onPickAll }) {
  const review = M3A.SAMPLE_CRITICS_REVIEW.find(r => r.id === criticId);
  if (!review) return null;
  const meta = M3A.CRITICS[criticId];
  const Icon = cI[meta.icon];
  const conflictsForThis = (M3A.SAMPLE_CRITICS_CONFLICTS || []).filter(c => c.sides.some(s => s.criticId === criticId));

  return ch("div", { className: "card", style: { display: "flex", flexDirection: "column", height: "100%" } },
    // Sticky header inside the card
    ch("div", { className: "card__header", style: { gap: 12, alignItems: "flex-start" } },
      ch("button", {
        onClick: onBack, type: "button",
        style: { background: "transparent", border: 0, padding: 4, cursor: "pointer", color: "var(--fg-muted)", display: "inline-flex", marginRight: 4 },
        title: "Voltar ao roteiro",
      }, ch(cI.ArrowLeft, { size: 16 })),
      ch("span", { className: `avatar size-md is-${meta.color}` }, ch(Icon, { size: 16 })),
      ch("div", { style: { flex: 1, minWidth: 0 } },
        ch("div", { style: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--fg)", letterSpacing: 0, textTransform: "none" } }, meta.name),
        ch("div", { className: "t-meta", style: { textTransform: "none", letterSpacing: 0, marginTop: 2 } }, meta.role)),
      ch("div", { style: { textAlign: "right" } },
        ch("div", { style: { fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: cScoreColor(review.score), lineHeight: 1 } }, review.score.toFixed(1)),
        ch("div", { className: "t-meta" }, "/10"))),

    // Body — scrolls
    ch("div", { className: "card__body", style: { overflowY: "auto", flex: 1, minHeight: 0 } },
      // Verdict
      ch("p", { style: { fontSize: 16, lineHeight: 1.55, marginTop: 0, marginBottom: 24, color: "var(--fg)", textWrap: "pretty" } }, review.verdict),

      // Status row
      ch("div", { className: "row", style: { gap: 16, marginBottom: 28, flexWrap: "wrap" } },
        ch("span", { className: "t-meta" },
          ch(cI.Eye, { size: 12, style: { marginRight: 4, verticalAlign: "-1px" } }),
          " confiança ", ch("strong", { style: { color: "var(--fg)" } }, review.confidence)),
        ch("span", { className: "t-meta" }, review.iterations, " iterações · ", review.duration),
        review.alerts?.length ? ch(cPill, { tone: "rose", dot: true }, review.alerts.length, " alerta", review.alerts.length > 1 ? "s" : "") : null,
        review.suggestions?.length ? ch(cPill, { tone: "amber", dot: false }, review.suggestions.length, " sugest", review.suggestions.length > 1 ? "ões" : "ão") : null,
        conflictsForThis.length ? ch(cPill, { tone: "indigo", dot: false }, conflictsForThis.length, " conflito", conflictsForThis.length > 1 ? "s" : "") : null,
        review.praises?.length ? ch(cPill, { tone: "neon", dot: false }, review.praises.length, " elogio", review.praises.length > 1 ? "s" : "") : null),

      // Sub-scores
      review.subScores?.length ? CSection({
        title: "métricas avaliadas",
        kicker: `compõem o score de ${review.score.toFixed(1)}/10`,
        accent: "var(--fg-subtle)",
        children: ch("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 32px" } },
          review.subScores.map((s, i) =>
            ch("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 4 } },
              ch("span", { style: { fontSize: 13, color: "var(--fg-muted)" } }, s.label),
              ch(CScoreBar, { value: s.score })))),
      }) : null,

      // Alerts (blocking)
      review.alerts?.length ? CSection({
        title: "alertas bloqueantes",
        accent: "var(--rose-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          review.alerts.map((a, i) =>
            ch("div", { key: i, style: { padding: 16, background: "color-mix(in oklab, var(--rose-500), transparent 94%)", border: "1px solid color-mix(in oklab, var(--rose-500), transparent 70%)", borderRadius: "var(--r-md)" } },
              ch("div", { className: "row", style: { gap: 8, marginBottom: 8 } },
                ch(cI.AlertTriangle, { size: 14, style: { color: "var(--rose-500)" } }),
                ch("span", { style: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--rose-500)" } }, a.severity),
                ch("span", { className: "t-meta" }, "Bloco ", a.block, " · ", a.blockLabel)),
              ch("blockquote", { style: { margin: "0 0 10px", paddingLeft: 12, borderLeft: "2px solid var(--rose-500)", fontStyle: "italic", color: "var(--fg)" } }, "" , a.quote, ""),
              ch("div", { style: { fontSize: 13, color: "var(--fg-muted)", marginBottom: 6 } }, ch("strong", { style: { color: "var(--fg)" } }, "Regra: "), a.rule),
              a.source ? ch("a", { href: a.source, target: "_blank", rel: "noreferrer", className: "muted", style: { fontSize: 12 } },
                ch(cI.ExternalLink, { size: 11, style: { verticalAlign: "-1px", marginRight: 4 } }), "Ver fonte") : null))),
      }) : null,

      // Suggestions
      review.suggestions?.length ? CSection({
        title: "sugestões de melhoria",
        kicker: review.suggestions.length === 1 ? "1 sugestão" : `${review.suggestions.length} sugestões`,
        accent: "var(--amber-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          review.suggestions.map((s, i) =>
            ch("div", { key: i, style: { padding: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" } },
              ch("div", { className: "row", style: { gap: 8, marginBottom: 12 } },
                ch("span", { className: "t-meta" }, "Bloco ", s.block, s.blockLabel ? " · " + s.blockLabel : "")),
              ch("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 } },
                ch("div", null,
                  ch("div", { className: "t-micro", style: { marginBottom: 6 } }, "antes"),
                  ch("div", { style: { padding: 10, background: "color-mix(in oklab, var(--rose-500), transparent 96%)", border: "1px solid color-mix(in oklab, var(--rose-500), transparent 85%)", borderRadius: 6, fontSize: 13, lineHeight: 1.5, color: "var(--fg-muted)" } }, s.before)),
                ch("div", null,
                  ch("div", { className: "t-micro", style: { marginBottom: 6, color: "var(--neon-600)" } }, "depois"),
                  ch("div", { style: { padding: 10, background: "color-mix(in oklab, var(--neon-500), transparent 94%)", border: "1px solid color-mix(in oklab, var(--neon-500), transparent 80%)", borderRadius: 6, fontSize: 13, lineHeight: 1.5, color: "var(--fg)" } }, s.after))),
              ch("div", { style: { fontSize: 12.5, color: "var(--fg-muted)", marginBottom: 12, lineHeight: 1.5 } },
                ch("strong", { style: { color: "var(--fg)" } }, "Por quê: "), s.reason),
              ch("div", { className: "row", style: { gap: 6 } },
                ch(cBtn, { variant: "primary", size: "sm", iconRight: false, icon: ch(cI.Check, { size: 12 }) }, "Aceitar"),
                ch(cBtn, { variant: "ghost", size: "sm", iconRight: false, icon: ch(cI.Edit, { size: 12 }) }, "Editar"),
                ch(cBtn, { variant: "ghost", size: "sm", iconRight: false }, "Rejeitar"))))),
      }) : null,

      // Conflicts
      conflictsForThis.length ? CSection({
        title: "conflitos com outros agentes",
        accent: "var(--indigo-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          conflictsForThis.map((c, i) => {
            return ch("div", { key: i, style: { padding: 16, border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)" } },
              ch("div", { className: "row", style: { gap: 8, marginBottom: 10 } },
                ch("span", { className: "t-meta" }, "Bloco ", c.block, " · ", c.blockLabel),
                ch("span", { style: { fontSize: 13, fontStyle: "italic", color: "var(--fg-muted)" } }, "" , c.quote, "")),
              ch("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 } },
                c.sides.map((side, j) => {
                  const m = M3A.CRITICS[side.criticId];
                  const SI = cI[m.icon];
                  const isThis = side.criticId === criticId;
                  return ch("div", { key: j, style: { display: "flex", gap: 10, padding: 10, borderRadius: 6, background: isThis ? "color-mix(in oklab, var(--surface-2), transparent 30%)" : "transparent", border: isThis ? "1px solid var(--border)" : "1px solid transparent" } },
                    ch("span", { className: `avatar size-sm is-${m.color}`, style: { flexShrink: 0 } }, ch(SI, { size: 12 })),
                    ch("div", { style: { flex: 1 } },
                      ch("div", { style: { fontSize: 12.5, fontWeight: 500, marginBottom: 2 } }, m.name, isThis ? ch("span", { className: "t-meta", style: { marginLeft: 6 } }, "(este agente)") : null),
                      ch("div", { style: { fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5 } }, side.position)),
                    ch("span", { className: "t-meta", style: { flexShrink: 0 } }, "peso ", side.weight));
                })),
              ch("div", { style: { padding: 10, background: "color-mix(in oklab, var(--indigo-500), transparent 94%)", border: "1px solid color-mix(in oklab, var(--indigo-500), transparent 82%)", borderRadius: 6, fontSize: 13, lineHeight: 1.5 } },
                ch("strong", null, "Recomendação: "), c.recommendation));
          })),
      }) : null,

      // Praises
      review.praises?.length ? CSection({
        title: "trechos elogiados",
        accent: "var(--neon-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          review.praises.map((p, i) =>
            ch("div", { key: i, style: { display: "flex", gap: 10, padding: 10, background: "color-mix(in oklab, var(--neon-500), transparent 95%)", borderRadius: 6, border: "1px solid color-mix(in oklab, var(--neon-500), transparent 85%)" } },
              ch(cI.Check, { size: 14, style: { color: "var(--neon-600)", flexShrink: 0, marginTop: 2 } }),
              ch("div", null,
                ch("span", { className: "t-meta" }, "Bloco ", p.block),
                ch("div", { style: { fontSize: 13, color: "var(--fg)", lineHeight: 1.5, marginTop: 2 } }, p.text))))),
      }) : null,

      // History (collapsed)
      review.history ? CSection({
        title: "histórico deste agente neste médico",
        accent: "var(--fg-subtle)",
        children: ch("div", { style: { padding: 12, background: "var(--surface-2)", borderRadius: 6, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 } }, review.history),
      }) : null,

      // How this critic thinks
      CSection({
        title: "como este agente pensa",
        accent: "var(--fg-subtle)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.55 } },
          ch("div", null, ch("strong", { style: { color: "var(--fg)" } }, meta.name), " — ", meta.role, "."),
          ch("div", null, "Treinado com base em diretrizes públicas, padrões editoriais e histórico do médico."),
          ch("div", null, "Última atualização do modelo: out/2025."),
          ch("div", { style: { marginTop: 6 } },
            ch("a", { href: "#", className: "muted", onClick: e => { e.preventDefault(); onPickAll(); } },
              "Ver resumo geral dos 6 agentes →")),
      ),
      })));
}

/* ------------------------------------------------------------
   CriticsSummaryPanel — opens when user clicks "AGENTES CRÍTICOS"
   ------------------------------------------------------------ */
function CriticsSummaryPanel({ run, onBack, onPickCritic }) {
  const reviews = M3A.SAMPLE_CRITICS_REVIEW;
  const conflicts = M3A.SAMPLE_CRITICS_CONFLICTS || [];
  const consensus = M3A.SAMPLE_CRITICS_CONSENSUS || [];
  const blocking = reviews.flatMap(r => (r.alerts || []).filter(a => a.severity === "bloqueante")).length;
  const totalSuggestions = reviews.reduce((n, r) => n + (r.suggestions?.length || 0), 0);
  const sorted = [...reviews].sort((a, b) => b.score - a.score);

  return ch("div", { className: "card", style: { display: "flex", flexDirection: "column", height: "100%" } },
    // Sticky header
    ch("div", { className: "card__header", style: { gap: 12, alignItems: "flex-start" } },
      ch("button", {
        onClick: onBack, type: "button",
        style: { background: "transparent", border: 0, padding: 4, cursor: "pointer", color: "var(--fg-muted)", display: "inline-flex", marginRight: 4 },
        title: "Voltar ao roteiro",
      }, ch(cI.ArrowLeft, { size: 16 })),
      ch("div", { style: { flex: 1, minWidth: 0 } },
        ch("div", { style: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: "var(--fg)", letterSpacing: 0, textTransform: "none" } }, "Resumo da revisão"),
        ch("div", { className: "t-meta", style: { textTransform: "none", letterSpacing: 0, marginTop: 2 } }, "6 agentes críticos · ", run.duration, " · ", reviews.reduce((n, r) => n + r.iterations, 0), " iterações")),
      ch("div", { style: { textAlign: "right" } },
        ch("div", { style: { fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: cScoreColor(run.score), lineHeight: 1 } }, run.score.toFixed(1)),
        ch("div", { className: "t-meta" }, "/10 médio"))),

    // Body
    ch("div", { className: "card__body", style: { overflowY: "auto", flex: 1, minHeight: 0 } },

      // Verdict
      CSection({
        title: "veredito do conselho",
        accent: "var(--fg)",
        children: ch("p", { style: { fontSize: 15, lineHeight: 1.6, margin: 0, color: "var(--fg)", textWrap: "pretty" } },
          "Roteiro forte em narrativa e voz de marca, com ", ch("strong", { style: { color: "var(--rose-500)" } }, "1 risco bloqueante de compliance no Bloco 3"), ". ",
          "Recomendação do conselho: ajustar promessa de resultado antes de aprovar. ",
          "Demais agentes alinhados — ", conflicts.length, " conflito", conflicts.length === 1 ? "" : "s", " a decidir."),
      }),

      // Pendência summary cards
      ch("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 } },
        [
          { label: "alertas bloqueantes", value: blocking, color: "var(--rose-500)" },
          { label: "conflitos a decidir", value: conflicts.length, color: "var(--indigo-500)" },
          { label: "sugestões opcionais", value: totalSuggestions, color: "var(--amber-500)" },
          { label: "pontos de consenso", value: consensus.length, color: "var(--neon-600)" },
        ].map((s, i) =>
          ch("div", { key: i, style: { padding: 12, border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)" } },
            ch("div", { style: { fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500, color: s.color, lineHeight: 1, marginBottom: 4 } }, s.value),
            ch("div", { className: "t-micro" }, s.label)))),

      // Distribuição de notas
      CSection({
        title: "distribuição das notas",
        kicker: "clique em um agente para ver o detalhe",
        accent: "var(--fg-subtle)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
          sorted.map(r => {
            const m = M3A.CRITICS[r.id];
            const SI = cI[m.icon];
            return ch("button", {
              key: r.id, type: "button", onClick: () => onPickCritic(r.id),
              style: { display: "grid", gridTemplateColumns: "200px 1fr 60px 16px", gap: 12, alignItems: "center", padding: "10px 12px", border: "1px solid transparent", borderRadius: 8, background: "transparent", cursor: "pointer", textAlign: "left", color: "inherit", transition: "all 0.15s ease" },
              onMouseEnter: e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--border)"; },
              onMouseLeave: e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; },
            },
              ch("div", { className: "row", style: { gap: 8 } },
                ch("span", { className: `avatar size-sm is-${m.color}` }, ch(SI, { size: 12 })),
                ch("span", { style: { fontSize: 13, fontWeight: 500 } }, m.name),
                r.alert ? ch(cI.AlertTriangle, { size: 12, style: { color: "var(--rose-500)" } }) : null),
              ch(CScoreBar, { value: r.score }),
              ch("span", { className: "t-meta", style: { textAlign: "right" } },
                (r.suggestions?.length || 0) > 0 ? `${r.suggestions.length} sug.` : "—"),
              ch(cI.CaretRight, { size: 11, style: { color: "var(--fg-subtle)" } }));
          })),
      }),

      // Pontos de consenso
      consensus.length ? CSection({
        title: "pontos de consenso",
        kicker: "onde 3+ agentes concordam",
        accent: "var(--neon-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          consensus.map((c, i) =>
            ch("div", { key: i, style: { display: "flex", gap: 10, padding: 10, background: "color-mix(in oklab, var(--neon-500), transparent 95%)", borderRadius: 6, border: "1px solid color-mix(in oklab, var(--neon-500), transparent 85%)" } },
              ch(cI.Check, { size: 14, style: { color: "var(--neon-600)", flexShrink: 0, marginTop: 2 } }),
              ch("div", { style: { flex: 1 } },
                ch("div", { style: { fontSize: 13.5, fontWeight: 500, color: "var(--fg)", marginBottom: 4 } }, c.text),
                ch("div", { className: "row", style: { gap: 4, flexWrap: "wrap" } },
                  c.agents.map(a => {
                    const m = M3A.CRITICS[a];
                    if (!m) return null;
                    const SI = cI[m.icon];
                    return ch("span", {
                      key: a, title: m.name,
                      className: `avatar size-sm is-${m.color}`,
                      style: { width: 18, height: 18 },
                    }, ch(SI, { size: 10 }));
                  })))))),
      }) : null,

      // Conflitos / divergências
      conflicts.length ? CSection({
        title: "conflitos a decidir",
        kicker: "onde agentes discordaram",
        accent: "var(--indigo-500)",
        children: ch("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
          conflicts.map((c, i) =>
            ch("div", { key: i, style: { padding: 14, border: "1px solid var(--border)", borderRadius: "var(--r-md)" } },
              ch("div", { className: "row", style: { gap: 8, marginBottom: 8 } },
                ch("span", { className: "t-meta" }, "Bloco ", c.block, " · ", c.blockLabel),
                ch("span", { style: { fontSize: 13, fontStyle: "italic", color: "var(--fg-muted)" } }, "" , c.quote, "")),
              ch("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 } },
                c.sides.map((side, j) => {
                  const m = M3A.CRITICS[side.criticId];
                  const SI = cI[m.icon];
                  return ch("div", { key: j, className: "row", style: { gap: 8, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5 } },
                    ch("span", { className: `avatar size-sm is-${m.color}`, style: { width: 18, height: 18, flexShrink: 0 } }, ch(SI, { size: 10 })),
                    ch("span", { style: { fontWeight: 500, color: "var(--fg)" } }, m.name, ":"),
                    ch("span", null, side.position));
                })),
              ch("div", { style: { padding: 10, background: "color-mix(in oklab, var(--indigo-500), transparent 94%)", border: "1px solid color-mix(in oklab, var(--indigo-500), transparent 82%)", borderRadius: 6, fontSize: 13, lineHeight: 1.5 } },
                ch("strong", null, "Recomendação: "), c.recommendation)))),
      }) : null,

      // CTA
      ch("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--border)" } },
        ch(cBtn, { variant: "ghost", size: "sm" }, "Exportar parecer (PDF)"),
        ch(cBtn, { variant: "primary", size: "sm", iconRight: ch(cI.ArrowRight, { size: 12 }) }, "Resolver pendências"))));
}

window.CriticPanels = { CriticDetailPanel, CriticsSummaryPanel };
