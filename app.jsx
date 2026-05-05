/* global React, ReactDOM, UI, Icons, Screens, M3A, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider, TweakSelect, TweakButton */
const { createElement: h, useState, useEffect } = React;
const I = Icons;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "intensity": "balanced",
  "theme": "light",
  "density": "comfortable",
  "accent": "neon",
  "fontUI": "space-grotesk",
  "fontSerif": "fraunces",
  "fontMono": "jetbrains",
  "h1Size": 32,
  "h2Size": 22,
  "h3Size": 17,
  "bodySize": 15,
  "lineHeight": 150,
  "letterSpacing": 0,
  "zoom": 100
}/*EDITMODE-END*/;

const FONT_STACKS = {
  "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
  "inter": "'Inter', system-ui, sans-serif",
  "geist": "'Geist', system-ui, sans-serif",
  "ibm-plex": "'IBM Plex Sans', system-ui, sans-serif",
  "system": "system-ui, -apple-system, sans-serif",
  "fraunces": "'Fraunces', Georgia, serif",
  "source-serif": "'Source Serif 4', Georgia, serif",
  "newsreader": "'Newsreader', Georgia, serif",
  "lora": "'Lora', Georgia, serif",
  "georgia": "Georgia, serif",
  "jetbrains": "'JetBrains Mono', ui-monospace, monospace",
  "ibm-plex-mono": "'IBM Plex Mono', ui-monospace, monospace",
  "geist-mono": "'Geist Mono', ui-monospace, monospace",
  "system-mono": "ui-monospace, SFMono-Regular, monospace",
};

// Lazy-load Google Fonts only once per family
const GOOGLE_FONTS = {
  "inter": "Inter:wght@400;500;600;700",
  "geist": "Geist:wght@400;500;600;700",
  "ibm-plex": "IBM+Plex+Sans:wght@400;500;600;700",
  "source-serif": "Source+Serif+4:opsz,wght@8..60,300..600",
  "newsreader": "Newsreader:opsz,wght@6..72,300..600",
  "lora": "Lora:wght@400;500;600",
  "ibm-plex-mono": "IBM+Plex+Mono:wght@400;500",
  "geist-mono": "Geist+Mono:wght@400;500",
};
const loadedFonts = new Set();
function ensureFont(key) {
  if (!GOOGLE_FONTS[key] || loadedFonts.has(key)) return;
  loadedFonts.add(key);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS[key]}&display=swap`;
  document.head.appendChild(link);
}

function App() {
  const [route, setRoute] = useState("runs");
  const [runId, setRunId] = useState("run-2087");
  const [medicId, setMedicId] = useState("marina-aguiar");
  const [libScope, setLibScope] = useState("medic");
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", tweaks.theme === "dark" ? "dark" : "");
    root.setAttribute("data-intensity", tweaks.intensity === "immersive" ? "immersive" : "");
    if (tweaks.density === "compact") {
      root.style.setProperty("--s-7", "24px");
      root.style.setProperty("--s-6", "18px");
      root.style.setProperty("--t-body", "13.5px");
    } else if (tweaks.density === "spacious") {
      root.style.setProperty("--s-7", "40px");
      root.style.setProperty("--s-6", "28px");
      root.style.setProperty("--t-body", "15.5px");
    } else {
      root.style.removeProperty("--s-7");
      root.style.removeProperty("--s-6");
      root.style.removeProperty("--t-body");
    }
    root.style.setProperty("--action", tweaks.accent === "teal" ? "var(--teal-500)" : "var(--neon-500)");

    // Typography
    ensureFont(tweaks.fontUI);
    ensureFont(tweaks.fontSerif);
    ensureFont(tweaks.fontMono);
    root.style.setProperty("--font-ui", FONT_STACKS[tweaks.fontUI] || FONT_STACKS["space-grotesk"]);
    root.style.setProperty("--font-display", FONT_STACKS[tweaks.fontUI] || FONT_STACKS["space-grotesk"]);
    root.style.setProperty("--font-serif", FONT_STACKS[tweaks.fontSerif] || FONT_STACKS["fraunces"]);
    root.style.setProperty("--font-mono", FONT_STACKS[tweaks.fontMono] || FONT_STACKS["jetbrains"]);
    root.style.setProperty("--t-h1", `${tweaks.h1Size}px`);
    root.style.setProperty("--t-h2", `${tweaks.h2Size}px`);
    root.style.setProperty("--t-h3", `${tweaks.h3Size}px`);
    if (tweaks.density === "comfortable") root.style.setProperty("--t-body", `${tweaks.bodySize}px`);
    document.body.style.lineHeight = (tweaks.lineHeight / 100).toString();
    document.body.style.letterSpacing = `${tweaks.letterSpacing / 1000}em`;

    // Zoom — apply via CSS zoom (Webkit/Blink) with transform fallback for Firefox
    const z = (tweaks.zoom || 100) / 100;
    document.body.style.zoom = z;
  }, [tweaks]);

  function openTweaks() {
    // Trigger panel open via host protocol
    window.postMessage({ type: "__activate_edit_mode" }, "*");
  }

  const navigate = {
    toRuns: () => setRoute("runs"),
    toRunDetail: id => { setRunId(id); setRoute("run-detail"); },
    toReview: () => setRoute("review"),
    toWorkspace: () => setRoute("workspace"),
    toMedicDetail: id => { setMedicId(id); setRoute("medic-detail"); },
    toNewRun: () => setRoute("new-run"),
    toMedics: () => setRoute("medics"),
  };

  const screenLabels = {
    runs: "01 Runs list",
    "run-detail": "02 Run detail",
    review: "03 Review (modo A)",
    workspace: "04 Workspace (modo B)",
    medics: "05 Medics list",
    "medic-detail": "06 Medic detail",
    "new-run": "07 New run",
    library: "Biblioteca (placeholder)",
    settings: "Ajustes (placeholder)",
  };

  function renderRoute() {
    switch (route) {
      case "runs":
        return h(Screens.RunsList, { medicId, onOpenRun: navigate.toRunDetail, onNewRun: navigate.toNewRun });
      case "run-detail":
        return h(Screens.RunDetail, { runId, onBack: navigate.toRuns, onReview: () => { setRoute("workspace-review"); }, onWorkspace: navigate.toWorkspace });
      case "review":
      case "workspace-review":
        return h(Screens.Workspace, { runId, onBack: () => navigate.toRunDetail(runId), initialMode: "revisar" });
      case "workspace":
        return h(Screens.Workspace, { runId, onBack: () => navigate.toRunDetail(runId), initialMode: "chat" });
      case "medics":
        return h(Screens.MedicsList, { onOpenMedic: navigate.toMedicDetail });
      case "medic-detail":
        return h(Screens.MedicDetail, { medicId, onBack: navigate.toMedics });
      case "new-run":
        return h(Screens.NewRun, { medicId, onMedicChange: setMedicId, onCancel: navigate.toRuns, onLaunch: () => { setRunId("run-2087"); setRoute("run-detail"); } });
      case "library":
        return h(PlaceholderPage, { kind: "library", title: "Biblioteca", desc: "Roteiros aprovados, prontos para gravação.", medicId, onMedicChange: setMedicId, libScope, onLibScope: setLibScope });
      case "settings":
        return h(PlaceholderPage, { kind: "settings", title: "Ajustes", desc: "Equipe, integrações, compliance e faturamento." });
      default:
        return null;
    }
  }

  return h("div", { className: "app-shell", "data-screen-label": screenLabels[route] },
    h(UI.GHeader, { route, onRoute: setRoute, medicId, onMedicChange: setMedicId, onOpenTweaks: openTweaks }),
    renderRoute(),
    h(TweaksPanel, { title: "Tweaks · M3A" },
      h(TweakSection, { label: "Tema" }),
      h(TweakRadio, {
        label: "Modo",
        value: tweaks.theme,
        options: ["light", "dark"],
        onChange: v => setTweak("theme", v),
      }),
      h(TweakRadio, {
        label: "Intensidade",
        value: tweaks.intensity,
        options: ["balanced", "immersive"],
        onChange: v => setTweak("intensity", v),
      }),
      h(TweakRadio, {
        label: "Cor de ação",
        value: tweaks.accent,
        options: ["neon", "teal"],
        onChange: v => setTweak("accent", v),
      }),
      h(TweakSection, { label: "Densidade" }),
      h(TweakSlider, {
        label: "Zoom",
        value: tweaks.zoom, min: 75, max: 150, step: 5, unit: "%",
        onChange: v => setTweak("zoom", v),
      }),
      h(TweakRadio, {
        label: "Espaçamento",
        value: tweaks.density,
        options: ["compact", "comfortable", "spacious"],
        onChange: v => setTweak("density", v),
      }),
      h(TweakSection, { label: "Tipografia · famílias" }),
      h(TweakSelect, {
        label: "UI / títulos",
        value: tweaks.fontUI,
        options: [
          { value: "space-grotesk", label: "Space Grotesk (atual)" },
          { value: "inter", label: "Inter" },
          { value: "geist", label: "Geist" },
          { value: "ibm-plex", label: "IBM Plex Sans" },
          { value: "system", label: "System UI" },
        ],
        onChange: v => setTweak("fontUI", v),
      }),
      h(TweakSelect, {
        label: "Roteiro / serifa",
        value: tweaks.fontSerif,
        options: [
          { value: "fraunces", label: "Fraunces (atual)" },
          { value: "source-serif", label: "Source Serif 4" },
          { value: "newsreader", label: "Newsreader" },
          { value: "lora", label: "Lora" },
          { value: "georgia", label: "Georgia" },
        ],
        onChange: v => setTweak("fontSerif", v),
      }),
      h(TweakSelect, {
        label: "Mono / dados",
        value: tweaks.fontMono,
        options: [
          { value: "jetbrains", label: "JetBrains Mono (atual)" },
          { value: "ibm-plex-mono", label: "IBM Plex Mono" },
          { value: "geist-mono", label: "Geist Mono" },
          { value: "system-mono", label: "System Mono" },
        ],
        onChange: v => setTweak("fontMono", v),
      }),
      h(TweakSection, { label: "Tipografia · escala" }),
      h(TweakSlider, {
        label: "H1 (page title)",
        value: tweaks.h1Size, min: 24, max: 48, step: 1, unit: "px",
        onChange: v => setTweak("h1Size", v),
      }),
      h(TweakSlider, {
        label: "H2 (card title)",
        value: tweaks.h2Size, min: 16, max: 32, step: 1, unit: "px",
        onChange: v => setTweak("h2Size", v),
      }),
      h(TweakSlider, {
        label: "H3 (sub)",
        value: tweaks.h3Size, min: 14, max: 22, step: 1, unit: "px",
        onChange: v => setTweak("h3Size", v),
      }),
      h(TweakSlider, {
        label: "Body",
        value: tweaks.bodySize, min: 12, max: 18, step: 1, unit: "px",
        onChange: v => setTweak("bodySize", v),
      }),
      h(TweakSlider, {
        label: "Line height",
        value: tweaks.lineHeight, min: 120, max: 180, step: 5, unit: "%",
        onChange: v => setTweak("lineHeight", v),
      }),
      h(TweakSlider, {
        label: "Letter spacing",
        value: tweaks.letterSpacing, min: -20, max: 30, step: 1, unit: "/1000em",
        onChange: v => setTweak("letterSpacing", v),
      }),
      h(TweakSection, { label: " " }),
      h(TweakButton, {
        label: "Restaurar padrões",
        secondary: true,
        onClick: () => setTweak({ ...TWEAK_DEFAULTS }),
      }),
    ));
}

function PlaceholderPage(props) {
  const { title, desc, kind } = props;
  if (kind === "library") {
    const all = M3A.RUNS.filter(r => r.status === "approved");
    const scope = props.medicId || "all";
    const approved = (props.libScope === "all") ? all : all.filter(r => r.medic === scope);
    return h("div", { className: "page" },
      h("div", { className: "page-inner wide" },
        h("div", { className: "page-header" },
          h("div", { className: "page-header__title" },
            h("h1", null, title),
            h("div", { className: "page-header__sub" }, desc)),
          h("div", { className: "tabs" },
            h("button", {
              className: `tabs__item ${props.libScope !== "all" ? "is-active" : ""}`,
              onClick: () => props.onLibScope("medic"),
            }, M3A.MEDICS.find(m => m.id === scope)?.name.split(" ").slice(-1)[0] || "Médico"),
            h("button", {
              className: `tabs__item ${props.libScope === "all" ? "is-active" : ""}`,
              onClick: () => props.onLibScope("all"),
            }, "Todos"))),
        h("div", { className: "card card--elevated", style: { background: "var(--surface-elevated)" } },
          h("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "minmax(260px, 2fr) minmax(0, 1fr) minmax(0, 1fr) 80px 110px 32px",
              gap: 16, padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
            },
          },
            h("span", { className: "t-micro" }, "roteiro"),
            h("span", { className: "t-micro" }, "médico"),
            h("span", { className: "t-micro" }, "autor"),
            h("span", { className: "t-micro", style: { textAlign: "right" } }, "score"),
            h("span", { className: "t-micro" }, "publicação"),
            h("span", null)),
          approved.length === 0
            ? h("div", { style: { padding: 40, textAlign: "center", color: "var(--fg-muted)" } }, "Nenhum roteiro aprovado para este médico ainda.")
            : approved.map((r, i) => {
              const med = M3A.MEDICS.find(m => m.id === r.medic);
              return h("div", {
                key: r.id,
                style: {
                  display: "grid",
                  gridTemplateColumns: "minmax(260px, 2fr) minmax(0, 1fr) minmax(0, 1fr) 80px 110px 32px",
                  gap: 16, alignItems: "center",
                  padding: "16px 20px",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  cursor: "pointer",
                },
              },
                h("div", null,
                  h("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 2 } }, r.title),
                  h("div", { className: "t-meta" }, r.summary)),
                h("div", { className: "row", style: { gap: 8 } },
                  h("span", { className: `avatar size-sm is-${med.color}` }, med.initials),
                  h("span", { style: { fontSize: 13 } }, med.name.split(" ").slice(-1)[0])),
                h("div", { style: { fontSize: 13, color: "var(--fg-muted)" } }, r.author || "—"),
                h("span", {
                  style: {
                    fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500,
                    textAlign: "right", color: "var(--neon-600)",
                  },
                }, r.score.toFixed(1)),
                r.published
                  ? h("div", { className: "col", style: { gap: 2 } },
                    h("span", { className: "pill pill--neon", style: { width: "fit-content" } },
                      h("span", { className: "pill__dot" }), "publicado"),
                    h("span", { className: "t-meta", style: { fontSize: 10.5 } }, r.publishedWhen))
                  : h("span", { className: "pill", style: { width: "fit-content" } },
                    h("span", { className: "pill__dot" }), "agendar"),
                h("span", { style: { color: "var(--fg-subtle)", display: "flex", justifyContent: "flex-end" } },
                  h(I.CaretRight, { size: 14 })));
            }))));
  }
  if (kind === "settings") {
    return h("div", { className: "page" },
      h("div", { className: "page-inner editorial" },
        h("div", { className: "page-header" },
          h("div", { className: "page-header__title" },
            h("h1", null, title),
            h("div", { className: "page-header__sub" }, desc))),
        h("div", { className: "col", style: { gap: 16 } },
          [
            { title: "Equipe", desc: "Membros, papéis e permissões.", count: "4 membros" },
            { title: "Integrações", desc: "Instagram, Calendly, CRM, WhatsApp Business.", count: "2 conectadas" },
            { title: "Compliance", desc: "Resoluções CFM ativas e linhas vermelhas globais.", count: "CFM 1.974" },
            { title: "Notificações", desc: "Quando avisar você sobre runs, alertas e aprovações.", count: "email + push" },
            { title: "Faturamento", desc: "Plano, uso e limite de runs no mês.", count: "Pro · 87/200" },
          ].map((s, i) => h("div", {
            key: i,
            className: "card card--elevated",
            style: {
              background: "var(--surface-elevated)",
              padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer",
            },
          },
            h("div", { style: { flex: 1 } },
              h("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 2 } }, s.title),
              h("div", { className: "t-meta", style: { textTransform: "none", letterSpacing: 0 } }, s.desc)),
            h("span", { className: "pill" }, s.count),
            h(I.CaretRight, { size: 16, style: { color: "var(--fg-subtle)" } }))))));
  }
  return h("div", { className: "page" },
    h("div", { className: "page-inner editorial" },
      h("div", { className: "page-header" },
        h("div", { className: "page-header__title" },
          h("h1", null, title),
          h("div", { className: "page-header__sub" }, desc))),
      h("div", { className: "empty" },
        h(I.Sparkle, { size: 28, className: "empty__sparkle" }),
        h("h2", null, "Em construção"))));
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
