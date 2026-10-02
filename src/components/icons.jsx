import { h } from "preact";

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
};

export const ChevronDown = () => (
  <svg {...base}><path d="M6 9l6 6 6-6" /></svg>
);

export const Close = () => (
  <svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export const Clear = () => (
  <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>
);

export const Search = () => (
  <svg {...base} width="14" height="14"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

export const Refresh = () => (
  <svg {...base}><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></svg>
);

export const Copy = () => (
  <svg {...base}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
);

export const Trash = () => (
  <svg {...base}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);

export const Prompt = () => (
  <svg {...base}><path d="M5 7l5 5-5 5M12 17h7" /></svg>
);
