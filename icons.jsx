/* global React */
const { createElement: h } = React;

// All icons: outline 1.5px stroke — matches M3A site language.
function makeIcon(paths, viewBox = "0 0 24 24") {
  return function Icon({ size = 16, strokeWidth = 1.5, className = "", style }) {
    return h("svg", {
      width: size, height: size, viewBox,
      fill: "none",
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className,
      style,
      "aria-hidden": "true",
    }, paths.map((d, i) => h("path", { key: i, d })));
  };
}

window.Icons = {
  ArrowRight: makeIcon(["M5 12h14", "M13 6l6 6-6 6"]),
  ArrowLeft: makeIcon(["M19 12H5", "M11 18l-6-6 6-6"]),
  ArrowUpRight: makeIcon(["M7 17 17 7", "M9 7h8v8"]),
  Plus: makeIcon(["M12 5v14", "M5 12h14"]),
  Check: makeIcon(["M5 12.5l4.5 4.5L19 7.5"]),
  X: makeIcon(["M6 6l12 12", "M18 6 6 18"]),
  Search: makeIcon(["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"]),
  Filter: makeIcon(["M4 6h16", "M7 12h10", "M10 18h4"]),
  Caret: makeIcon(["m6 9 6 6 6-6"]),
  CaretRight: makeIcon(["m9 6 6 6-6 6"]),
  RotateLeft: makeIcon(["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"]),
  Sparkle: makeIcon([
    "M12 3v3", "M12 18v3", "M3 12h3", "M18 12h3",
    "m5.6 5.6 2.1 2.1", "m16.3 16.3 2.1 2.1",
    "m18.4 5.6-2.1 2.1", "m7.7 16.3-2.1 2.1",
  ]),
  Bolt: makeIcon(["M13 3 4 14h7l-1 7 9-11h-7l1-7Z"]),
  Doc: makeIcon([
    "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
    "M14 3v6h6", "M9 14h6", "M9 18h6", "M9 10h2",
  ]),
  Wand: makeIcon([
    "m4 20 12-12", "M16 4l4 4", "M14 6l4 4",
    "M3 8h2", "M19 14h2", "M8 3v2",
  ]),
  User: makeIcon([
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  ]),
  Users: makeIcon([
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ]),
  Play: makeIcon(["M6 4v16l14-8z"]),
  Pause: makeIcon(["M6 4h4v16H6z", "M14 4h4v16h-4z"]),
  Stop: makeIcon(["M6 6h12v12H6z"]),
  Clock: makeIcon(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 7v5l3 2"]),
  Calendar: makeIcon([
    "M3 5h18v16H3z", "M8 3v4", "M16 3v4", "M3 10h18",
  ]),
  Mic: makeIcon([
    "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",
    "M19 11a7 7 0 0 1-14 0", "M12 18v4", "M8 22h8",
  ]),
  Eye: makeIcon([
    "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z",
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ]),
  GitBranch: makeIcon([
    "M6 3v12", "M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M6 9a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3h3",
  ]),
  Settings: makeIcon([
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z",
  ]),
  Bell: makeIcon([
    "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9",
    "M10.3 21a1.94 1.94 0 0 0 3.4 0",
  ]),
  Inbox: makeIcon([
    "M22 12h-6l-2 3h-4l-2-3H2", "M5 4h14l3 8v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z",
  ]),
  Heart: makeIcon([
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z",
  ]),
  Chat: makeIcon(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"]),
  Stethoscope: makeIcon([
    "M11 2v6a4 4 0 0 1-8 0V2", "M7 12v3a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v0",
    "M17 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ]),
  Syringe: makeIcon([
    "m18 2 4 4", "m15 5 6 6", "m11 9 6 6", "m4 22 5-5 4 4 3-3-4-4-5 5",
  ]),
  Camera: makeIcon([
    "M3 8h3l2-3h8l2 3h3v12H3z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  ]),
  Refresh: makeIcon([
    "M3 12a9 9 0 0 1 15.9-5.7L21 8", "M21 3v5h-5",
    "M21 12a9 9 0 0 1-15.9 5.7L3 16", "M3 21v-5h5",
  ]),
  Trash: makeIcon([
    "M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  ]),
  Send: makeIcon(["m22 2-7 20-4-9-9-4Z", "M22 2 11 13"]),
  AtSign: makeIcon(["M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"]),
  Close: makeIcon(["M18 6 6 18", "M6 6l12 12"]),
  Copy: makeIcon([
    "M9 9h11v11H9z", "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  ]),
  Lock: makeIcon([
    "M5 11h14v10H5z", "M8 11V8a4 4 0 1 1 8 0v3",
  ]),
  Tag: makeIcon([
    "m20 13-7 7a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h6.6a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8Z",
    "M7 7h.01",
  ]),
  Volume: makeIcon([
    "M11 5 6 9H2v6h4l5 4Z", "M15 9a4 4 0 0 1 0 6", "M19 5a8 8 0 0 1 0 14",
  ]),
  Briefcase: makeIcon([
    "M3 7h18v13H3z", "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M3 13h18",
  ]),
  Layout: makeIcon([
    "M3 3h18v18H3z", "M3 9h18", "M9 21V9",
  ]),
  Paper: makeIcon([
    "M5 3h14v18l-3-2-3 2-2-2-2 2-3-2Z", "M9 8h6", "M9 12h6", "M9 16h4",
  ]),
  Spark: makeIcon(["M12 2v8M12 14v8M2 12h8M14 12h8"]),
  AlertTriangle: makeIcon(["M12 3 2 21h20L12 3Z", "M12 10v5", "M12 18h.01"]),
  Edit: makeIcon(["M12 20h9", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"]),
  ExternalLink: makeIcon(["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14 21 3"]),
};
