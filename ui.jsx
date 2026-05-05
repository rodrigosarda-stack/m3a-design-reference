/* global React, Icons, M3A */
const { createElement: h, useState, useEffect, useRef } = React;
const I = Icons;

// ---------------- Header (global, sticky) ----------------
function GHeader({ route, onRoute, medicId, onMedicChange, onOpenTweaks }) {
  const medic = M3A.MEDICS.find(m => m.id === medicId) || M3A.MEDICS[0];
  const items = [
    { id: "runs", label: "Runs", icon: I.GitBranch },
    { id: "library", label: "Biblioteca", icon: I.Inbox },
    { id: "medics", label: "Médicos", icon: I.Stethoscope },
    { id: "settings", label: "Ajustes", icon: I.Settings },
  ];
  const [open, setOpen] = useState(false);
  return h("header", { className: "gheader" },
    h("div", { className: "gheader__inner" },
      h("a", { className: "wordmark", href: "#runs", onClick: e => { e.preventDefault(); onRoute("runs"); } },
        "m3a", h("span", { className: "wordmark__dot" }, ".")),
      h("nav", { className: "gnav" },
        items.map(it => h("button", {
          key: it.id,
          className: `gnav__item ${route === it.id || (route === "run-detail" && it.id === "runs") || (route === "review" && it.id === "runs") || (route === "workspace" && it.id === "runs") || (route === "new-run" && it.id === "runs") || (route === "medic-detail" && it.id === "medics") ? "is-active" : ""}`,
          onClick: () => onRoute(it.id),
        }, h(it.icon, { size: 14 }), it.label))),
      h("div", { className: "gheader__right" },
        h("button", { className: "icon-btn", title: "Buscar" }, h(I.Search, { size: 16 })),
        h("button", { className: "icon-btn", title: "Notificações" }, h(I.Bell, { size: 16 })),
        h("div", { style: { position: "relative" } },
          h("button", {
            className: "medic-switch",
            onClick: () => setOpen(!open),
          },
            h("span", { className: `avatar size-md is-${medic.color}` }, medic.initials),
            h("span", { className: "medic-switch__label" }, "Médico"),
            h("span", null, medic.name.replace("Dra. ", "Dra ").replace("Dr. ", "Dr ")),
            h("span", { className: "medic-switch__caret" }, h(I.Caret, { size: 14 })),
          ),
          open && h("div", {
            style: {
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              minWidth: 280, background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)",
              boxShadow: "var(--shadow-pop)", padding: 6, zIndex: 100,
            },
          }, M3A.MEDICS.map(m => h("button", {
            key: m.id,
            onClick: () => { onMedicChange(m.id); setOpen(false); },
            style: {
              display: "flex", gap: 10, alignItems: "center", width: "100%",
              padding: "8px 10px", background: m.id === medicId ? "var(--surface-2)" : "transparent",
              border: "none", borderRadius: "var(--r-sm)", textAlign: "left",
            },
          },
            h("span", { className: `avatar size-md is-${m.color}` }, m.initials),
            h("div", { style: { flex: 1, minWidth: 0 } },
              h("div", { style: { fontWeight: 600, fontSize: 13 } }, m.name),
              h("div", { className: "t-meta" }, m.specialty)),
            m.id === medicId && h(I.Check, { size: 14, style: { color: "var(--neon-600)" } })))),
        ),
        h("button", {
          className: "icon-btn", title: "Tweaks",
          onClick: onOpenTweaks,
        }, h(I.Sparkle, { size: 16 })),
      ))
  );
}

// ---------------- Pills, Buttons ----------------
function Pill({ tone = "default", pulse, children, dot = true }) {
  const toneClass = tone === "default" ? "" : `pill--${tone}`;
  return h("span", { className: `pill ${toneClass} ${pulse ? "pill--pulse" : ""}` },
    dot && h("span", { className: "pill__dot" }),
    children);
}

function Btn({ variant = "secondary", size = "md", icon, iconRight, children, onClick, disabled, type = "button", style, title }) {
  const arrow = iconRight === false ? null : (iconRight || (variant === "primary" ? h(I.ArrowRight, { size: 14 }) : null));
  return h("button", {
    type, onClick, disabled, title, style,
    className: `btn btn--${variant} ${size === "sm" ? "btn--sm" : ""} ${disabled ? "is-disabled" : ""}`,
  },
    icon && h("span", null, icon),
    h("span", null, children),
    arrow && h("span", { className: "btn__arrow" }, arrow));
}

// ---------------- Status pill ----------------
function StatusPill({ status }) {
  const map = {
    "needs-review": { tone: "neon", label: "pendente", pulse: true },
    "approved":     { tone: "default", label: "aprovado" },
    "running":      { tone: "teal", label: "rodando", pulse: true },
    "rework":       { tone: "rose", label: "retrabalho" },
    "draft":        { tone: "default", label: "rascunho" },
  };
  const cfg = map[status] || map.draft;
  return h(Pill, { tone: cfg.tone, pulse: cfg.pulse }, cfg.label);
}

// ---------------- Card ----------------
function Card({ title, titleStrong, right, footer, children, elevated, kicker, defaultOpen = true, collapsible = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return h("section", { className: `card ${elevated ? "card--elevated" : ""}` },
    title && h("div", {
      className: `card__header ${collapsible ? "collapsible" : ""}`,
      onClick: collapsible ? () => setOpen(!open) : undefined,
      "aria-expanded": collapsible ? String(open) : undefined,
    },
      h("div", { className: "card__title" },
        collapsible && h("span", { className: "card__caret" }, h(I.Caret, { size: 12 })),
        h("span", null, title),
        titleStrong && h("strong", null, titleStrong),
        kicker),
      right),
    (open || !collapsible) && h("div", { className: "card__body" }, children),
    footer && (open || !collapsible) && h("div", { className: "card__footer" }, footer));
}

// ---------------- Score number ----------------
function Score({ value }) {
  if (value == null) return h("span", { className: "score-num score-num--pending" }, "—");
  const tone = value >= 8.5 ? "high" : value >= 7 ? "pass" : value >= 5.5 ? "mid" : "low";
  return h("span", { className: `score-num score-num--${tone}` }, value.toFixed(1));
}

// ---------------- Script view (the roteiro) ----------------
function ScriptView({ blocks }) {
  return h("div", { className: "script" }, blocks.map((b, idx) => {
    return h("div", { key: idx, className: "script__block", "data-block": b.block },
      h("div", { className: "script__num" },
        h("strong", null, b.label),
        b.time && h("span", { className: "script__num-time" }, b.time),
        h("span", { className: "script__num-digit" }, String(idx + 1).padStart(2, "0"))),
      h("div", { className: "script__body" },
        h("p", null, b.text),
        h("div", { className: "script__actions" },
          h("button", { className: "script__action", title: "Comentar bloco" }, "comentar"),
          h("button", { className: "script__action", title: "Regerar bloco" }, "regerar"),
          h("button", { className: "script__action", title: "Ver críticos deste bloco" }, "críticos"))));
  }));
}

// ---------------- Critic row ----------------
function CriticRow({ id, score, alert, onClick }) {
  const meta = M3A.CRITICS[id];
  if (!meta) return null;
  const Icon = I[meta.icon];
  return h("button", {
    className: `critic-row ${alert ? "critic-row--alert" : ""}`,
    onClick, type: "button",
    title: alert ? `${meta.name} — sugere ajuste, clique pra revisar` : `${meta.name} — sem alertas`,
  },
    h("div", { className: "critic-row__name" },
      h("span", { className: `avatar size-sm is-${meta.color}` }, h(Icon, { size: 12 })),
      h("span", null, meta.name),
      alert && h("span", { className: "critic-row__alert", "aria-label": "alerta" }, h(I.AlertTriangle, { size: 11 }))),
    h("span", { className: "critic-row__score" }, score != null ? score.toFixed(1) : "—"),
    h(I.CaretRight, { size: 11, className: "critic-row__caret" }));
}

window.UI = { GHeader, Pill, Btn, StatusPill, Card, Score, ScriptView, CriticRow };
