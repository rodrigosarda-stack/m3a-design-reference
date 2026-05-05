# M3A Design Reference

Protótipo standalone do design system Método 3A — HTML + React via UMD + Babel standalone.
Usado como **fonte da verdade visual** para o redesign do M3A System.

## Acessar

URL pública: https://rodrigosarda-stack.github.io/m3a-design-reference/

## Telas implementadas no protótipo

- **Inbox / Lista de runs** — `screens-1.jsx` (RunsList)
- **Detalhe de run com revisão inline** — `screens-1.jsx` (RunDetail, ReviewScreen)
- **Workspace dual-pane** — `screens-2.jsx` (Workspace, MedicsList, MedicDetail)
- **Disparar nova run (wizard)** — `screens-3.jsx` (NewRun)

## Stack do protótipo

- React 18 via UMD
- Babel standalone (compila JSX no browser)
- CSS puro com tokens em `styles.css`
- Fontes: Space Grotesk (UI), Fraunces (serif/display), JetBrains Mono (mono)

Não é o código que vai pra produção — é a referência visual.
