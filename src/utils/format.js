// Pure formatting helpers shared by the panel UI.

export function formatClock(ts) {
  const d = new Date(ts);
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return "";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// "https://api.example.com/v1/cart?id=1" -> "/v1/cart?id=1" when same origin,
// otherwise "api.example.com/v1/cart?id=1"
export function shortUrl(url) {
  try {
    const u = new URL(url, window.location.href);
    const path = u.pathname + u.search;
    return u.origin === window.location.origin ? path : u.host + path;
  } catch (e) {
    return String(url);
  }
}

export function statusTone(status) {
  if (status === "pending") return "pending";
  const n = Number(status);
  if (!n) return "error";
  if (n >= 400) return "error";
  if (n >= 300) return "warn";
  return "ok";
}

// Split a stack frame into { head, url, line, col }. Handles Chrome
// ("at fn (url:1:2)", "at url:1:2") and Firefox/Safari ("fn@url:1:2").
export function parseFrame(frame) {
  const text = String(frame || "").trim();
  const m = text.match(/:(\d+)(?::(\d+))?\)?$/);
  if (!m) return null;
  const before = text.slice(0, m.index);
  const cut = Math.max(before.lastIndexOf("("), before.lastIndexOf("@"), before.lastIndexOf(" "));
  return {
    head: before.slice(0, cut + 1),
    url: before.slice(cut + 1),
    line: m[1],
    col: m[2],
    paren: text.endsWith(")"),
  };
}

// "https://x.com/js/app.js?v=3#x" -> "app.js"
export function fileName(url) {
  const clean = String(url).replace(/[?#].*$/, "");
  const last = clean.split("/").filter(Boolean).pop() || clean;
  return last;
}

// Pull "file.js:12" out of a stack frame line
export function frameLocation(frame) {
  const f = parseFrame(frame);
  return f && f.url ? `${fileName(f.url)}:${f.line}` : "";
}

// Frame with its URL shortened to the file name, for display
export function prettyFrame(frame) {
  const f = parseFrame(frame);
  if (!f || !f.url) return String(frame);
  return `${f.head}${fileName(f.url)}:${f.line}${f.col ? `:${f.col}` : ""}${f.paren ? ")" : ""}`;
}

// Stack frames without the "Error: message" header line
export function stackFrames(stack) {
  if (!stack) return [];
  return String(stack)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /:\d+(:\d+)?\)?$/.test(l));
}

export function tryParseJson(text) {
  if (typeof text !== "string") return undefined;
  const t = text.trim();
  if (!t || (t[0] !== "{" && t[0] !== "[")) return undefined;
  try {
    return JSON.parse(t);
  } catch (e) {
    return undefined;
  }
}

// Apply console format specifiers (%s %d %i %f %o %O %c) the way browsers do.
// Returns a list of parts: strings and { value } objects for %o/%O.
export function applyFormat(args) {
  if (!args.length || typeof args[0] !== "string" || !args[0].includes("%")) {
    return args;
  }
  const [fmt, ...rest] = args;
  const out = [];
  let text = "";
  let i = 0;
  const re = /%([sdifoOc%])/g;
  let last = 0;
  let m;
  while ((m = re.exec(fmt))) {
    text += fmt.slice(last, m.index);
    last = re.lastIndex;
    const spec = m[1];
    if (spec === "%") {
      text += "%";
      continue;
    }
    if (i >= rest.length) {
      text += m[0];
      continue;
    }
    const arg = rest[i++];
    if (spec === "c") continue; // styling is ignored
    if (spec === "s") text += typeof arg === "string" ? arg : previewValue(arg);
    else if (spec === "d" || spec === "i") text += String(parseInt(arg, 10));
    else if (spec === "f") text += String(parseFloat(arg));
    else {
      if (text) out.push(text);
      text = "";
      out.push({ value: arg });
    }
  }
  text += fmt.slice(last);
  if (text) out.push(text);
  return [...out.map((p) => (typeof p === "string" ? p : p.value)), ...rest.slice(i)];
}

// One-line preview of any value, safe against getters, proxies and cycles
export function previewValue(value, depth = 0) {
  try {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    const t = typeof value;
    if (t === "string") return depth ? JSON.stringify(value) : value;
    if (t === "number" || t === "boolean") return String(value);
    if (t === "bigint") return `${value}n`;
    if (t === "symbol") return value.toString();
    if (t === "function") return `ƒ ${value.name || "anonymous"}()`;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (value instanceof Date) return isNaN(value) ? "Invalid Date" : value.toISOString();
    if (value instanceof RegExp) return String(value);
    if (typeof Node !== "undefined" && value instanceof Node) return nodeLabel(value);
    if (Array.isArray(value)) {
      if (depth > 0) return `Array(${value.length})`;
      const items = value.slice(0, 5).map((v) => previewValue(v, depth + 1));
      return `(${value.length}) [${items.join(", ")}${value.length > 5 ? ", …" : ""}]`;
    }
    if (value instanceof Map) return `Map(${value.size})`;
    if (value instanceof Set) return `Set(${value.size})`;
    if (typeof Promise !== "undefined" && value instanceof Promise) return "Promise";
    const name = constructorName(value);
    if (depth > 0) return name === "Object" ? "{…}" : name;
    const keys = Object.keys(value);
    const shown = keys.slice(0, 4).map((k) => {
      const d = Object.getOwnPropertyDescriptor(value, k);
      const v = d && "value" in d ? previewValue(d.value, depth + 1) : "(…)";
      return `${k}: ${v}`;
    });
    const prefix = name === "Object" ? "" : `${name} `;
    return `${prefix}{${shown.join(", ")}${keys.length > 4 ? ", …" : ""}}`;
  } catch (e) {
    return "[Unpreviewable]";
  }
}

export function constructorName(value) {
  try {
    const proto = Object.getPrototypeOf(value);
    if (proto === null) return "Object";
    const name = proto.constructor && proto.constructor.name;
    return typeof name === "string" && name ? name : "Object";
  } catch (e) {
    return "Object";
  }
}

export function nodeLabel(node) {
  if (node.nodeType === 3) return `"${node.textContent}"`;
  if (node.nodeType === 9) return "#document";
  if (node.nodeType !== 1) return node.nodeName;
  let label = node.tagName.toLowerCase();
  if (node.id) label += `#${node.id}`;
  if (typeof node.className === "string" && node.className.trim()) {
    label += "." + node.className.trim().split(/\s+/).join(".");
  }
  return label;
}
