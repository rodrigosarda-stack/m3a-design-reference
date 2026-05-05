/* global React, UI, Icons, M3A */
const { createElement: h, useState } = React;
const I = Icons;
const { Card, Btn, Pill } = UI;

/* ============================================================
   SCREEN 6 — New run (disparar)
   ============================================================ */
function NewRun({ medicId, onMedicChange, onCancel, onLaunch }) {
  const [mode, setMode] = useState("roteirista");
  const [theme, setTheme] = useState("Bioestimulador de colágeno · pós-35");
  const [angle, setAngle] = useState("educativo");
  const [stockSuggest, setStockSuggest] = useState(true);
  const [pillars, setPillars] = useState(["educacional"]);
  const medic = M3A.MEDICS.find(m => m.id === medicId);

  function togglePillar(p) {
    setPillars(pillars.includes(p) ? pillars.filter(x => x !== p) : [...pillars, p]);
  }

  return h("div", { className: "page" },
    h("div", { className: "page-inner editorial" },
      h("div", { className: "row", style: { marginBottom: 12, gap: 6, color: "var(--fg-subtle)", fontSize: 12 } },
        h("a", { href: "#runs", onClick: e => { e.preventDefault(); onCancel(); }, className: "muted" }, "Runs"),
        h(I.CaretRight, { size: 12 }),
        h("span", null, "nova run")),

      h("div", { className: "page-header" },
        h("div", { className: "page-header__title" },
          h("h1", null, "Disparar uma nova run"),
          h("div", { className: "page-header__sub" }, "Escolha o modo, descreva o tema, defina os críticos. O resto a gente faz por você."))),

      // Step 1 — Mode
      h(Card, { title: "01 ·", titleStrong: "modo de geração", elevated: true },
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 } },
          M3A.MODES.map(opt => h("button", {
            key: opt.id,
            className: `mode-card ${mode === opt.id ? "is-selected" : ""}`,
            onClick: () => setMode(opt.id),
          },
            h("div", { className: "row", style: { gap: 10 } },
              h("span", {
                className: "avatar size-md",
                style: { background: mode === opt.id ? "var(--neon-500)" : "var(--surface-2)", color: "var(--indigo-700)" },
              }, h(I[opt.icon], { size: 14 })),
              h("span", { className: "mode-card__name" }, opt.name),
              h("div", { className: "spacer" }),
              mode === opt.id && h(I.Check, { size: 16, style: { color: "var(--neon-600)" } })),
            h("div", { className: "mode-card__desc" }, opt.desc),
            h("div", { className: "mode-card__meta" },
              h("span", null, h(I.Clock, { size: 11 }), " ", opt.durationLabel),
              h("span", null, "·"),
              h("span", null, opt.bestFor)))))),

      h("div", { style: { height: 16 } }),

      // Step 2 — Médico
      h(Card, { title: "02 ·", titleStrong: "médico", elevated: true },
        h("div", { className: "row", style: { gap: 10, flexWrap: "wrap" } },
          M3A.MEDICS.map(m => h("button", {
            key: m.id, onClick: () => onMedicChange(m.id),
            style: {
              display: "flex", gap: 10, alignItems: "center",
              padding: "8px 14px 8px 8px",
              border: m.id === medicId ? "2px solid var(--indigo-700)" : "1px solid var(--border)",
              borderRadius: "var(--r-pill)", background: m.id === medicId ? "var(--surface-elevated)" : "var(--surface)",
              cursor: "pointer",
            },
          },
            h("span", { className: `avatar size-md is-${m.color}` }, m.initials),
            h("div", { style: { textAlign: "left" } },
              h("div", { style: { fontWeight: 600, fontSize: 13.5 } }, m.name),
              h("div", { className: "t-meta" }, m.specialty)))))),

      h("div", { style: { height: 16 } }),

      // Step 3 — Brief
      h(Card, { title: "03 ·", titleStrong: "briefing", elevated: true },
        h("div", { className: "col", style: { gap: 16 } },
          h("div", null,
            h("label", { className: "label" }, "tema · âncora"),
            h("input", {
              className: "input",
              style: { fontSize: 16, fontFamily: "var(--font-serif)", padding: "14px 16px" },
              value: theme, onChange: e => setTheme(e.target.value),
              placeholder: "Ex: bioestimulador de colágeno · pós-35",
            })),
          stockSuggest && h("div", { className: "suggest" },
            h("div", { className: "row", style: { justifyContent: "space-between" } },
              h("div", { className: "suggest__title" }, "diretor de conteúdo sugere"),
              h("button", { className: "icon-btn", onClick: () => setStockSuggest(false) }, h(I.X, { size: 12 }))),
            h("div", { style: { fontSize: 13.5, color: "var(--fg-muted)" } },
              "Baseado no estoque de pautas da Dra. Marina e na sazonalidade desta semana, esses 4 temas estão pegando. Clique para usar:"),
            h("div", { className: "suggest__chips" }, [
              "Skinbooster: o que é (e o que NÃO é)",
              "Por que minha pele mudou aos 38?",
              "Toxina pra quem nunca fez",
              "Microagulhamento × Laser",
            ].map(t => h("button", { key: t, className: "chip", onClick: () => setTheme(t) }, t)))),

          h("div", null,
            h("label", { className: "label" }, "ângulo"),
            h("div", { className: "seg", style: { display: "inline-flex" } },
              ["educativo", "mito × verdade", "história de paciente", "polêmico"].map(a =>
                h("button", { key: a, className: angle === a ? "is-on" : "", onClick: () => setAngle(a) }, a)))),

          h("div", null,
            h("label", { className: "label" }, "pilares de conteúdo"),
            h("div", { className: "row", style: { gap: 6, flexWrap: "wrap" } },
              ["educacional", "social proof", "captação", "engajamento", "autoridade"].map(p =>
                h("button", { key: p, className: `chip ${pillars.includes(p) ? "is-on" : ""}`, onClick: () => togglePillar(p) }, p)))),

          h("div", null,
            h("label", { className: "label" }, "contexto adicional (opcional)"),
            h("textarea", {
              className: "textarea",
              placeholder: "Notícia recente, dúvida que apareceu no consultório, audiência específica…",
              rows: 3,
            })))),

      h("div", { style: { height: 16 } }),

      // Step 4 — Críticos
      h(Card, { title: "04 ·", titleStrong: "críticos que vão avaliar", elevated: true },
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 } },
          Object.entries(M3A.CRITICS).map(([id, c]) => h("label", {
            key: id,
            style: {
              display: "flex", alignItems: "center", gap: 10,
              padding: 12, border: "1px solid var(--border)", borderRadius: "var(--r-md)",
              background: "var(--surface)", cursor: "pointer",
            },
          },
            h("input", { type: "checkbox", defaultChecked: true, style: { accentColor: "var(--indigo-700)" } }),
            h("span", { className: `avatar size-sm is-${c.color}` }, h(I[c.icon], { size: 12 })),
            h("div", null,
              h("div", { style: { fontSize: 13, fontWeight: 600 } }, c.name),
              h("div", { className: "t-meta" }, c.role)))))),

      // Footer
      h("div", { style: { display: "flex", alignItems: "center", gap: 12, marginTop: 24, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" } },
        h("div", { style: { flex: 1 } },
          h("div", { className: "t-micro" }, "estimativa"),
          h("div", { style: { fontWeight: 600 } },
            "~", M3A.MODES.find(m => m.id === mode).durationLabel.replace("~", ""), " · ",
            "6 críticos · saída editável")),
        h(Btn, { variant: "ghost", onClick: onCancel }, "Cancelar"),
        h(Btn, { variant: "primary", onClick: onLaunch }, "Disparar run"))));
}

window.Screens = window.Screens || {};
Object.assign(window.Screens, { NewRun });
