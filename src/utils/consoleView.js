// Turns raw console entries + network requests into the rows the Console tab shows.

const LEVEL_BY_TYPE = {
  assert: "error",
  trace: "log",
  table: "log",
  group: "log",
  count: "log",
  countReset: "log",
  time: "log",
  timeEnd: "log",
  timeLog: "log",
  dir: "log",
  dirxml: "log",
  "repl-input": "log",
  "repl-result": "log",
};

// Chip buckets shown in the toolbar
export const LEVEL_BUCKETS = ["error", "warn", "info", "debug"];

export function entryLevel(entry) {
  if (entry.type === "log") return entry.level || "log";
  if (entry.type === "repl-result" && entry.isError) return "error";
  return LEVEL_BY_TYPE[entry.type] || "log";
}

// log and info share the "Info" chip, like Chrome's default levels
export function levelBucket(level) {
  if (level === "error" || level === "warn" || level === "debug") return level;
  return "info";
}

export function isFailedRequest(req) {
  if (!req || req.status === "pending") return false;
  return req.error || req.status === 0 || Number(req.status) >= 400;
}

function entryTime(entry) {
  return entry.ts || Date.parse(entry.timestamp) || 0;
}

function isPrimitive(v) {
  return v === null || (typeof v !== "object" && typeof v !== "function");
}

function canCollapse(entry) {
  return entry.type === "log" && (entry.args || []).every(isPrimitive) && !entry.uncaught;
}

export function buildTimeline(logs, requests = []) {
  const rows = [];

  for (const entry of logs) {
    if (entry.type === "groupEnd") continue;
    const level = entryLevel(entry);
    const prev = rows[rows.length - 1];
    if (
      prev &&
      prev.kind === "log" &&
      prev.level === level &&
      canCollapse(entry) &&
      canCollapse(prev.entry) &&
      prev.entry.message === entry.message &&
      (prev.entry.groupLevel || 0) === (entry.groupLevel || 0)
    ) {
      prev.count += 1;
      prev.ts = entryTime(entry);
      continue;
    }
    rows.push({
      key: entry.id || `log-${rows.length}-${entryTime(entry)}`,
      kind: "log",
      level,
      ts: entryTime(entry),
      entry,
      count: 1,
      text: searchText(entry),
    });
  }

  const failed = requests.filter(isFailedRequest).map((req) => ({
    key: `net-${req.id}`,
    kind: "net",
    level: "error",
    ts: req.endTimestamp || req.startTimestamp || 0,
    request: req,
    count: 1,
    text: `${req.method} ${req.url} ${req.status} ${req.statusText || ""}`,
  }));

  if (!failed.length) return rows;
  return mergeByTime(rows, failed);
}

function mergeByTime(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && a[i].ts <= b[j].ts)) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out;
}

function searchText(entry) {
  const parts = [entry.message || "", entry.label || ""];
  if (entry.stack && Array.isArray(entry.stack)) parts.push(entry.stack.join("\n"));
  return parts.filter(Boolean).join(" ");
}

// "/regex/i" -> RegExp, anything else -> case-insensitive substring
export function makeMatcher(query) {
  const q = (query || "").trim();
  if (!q) return () => true;
  const re = q.match(/^\/(.+)\/([gimsuy]*)$/);
  if (re) {
    try {
      const rx = new RegExp(re[1], re[2].replace("g", ""));
      return (text) => rx.test(text);
    } catch (e) {
      // fall through to substring on invalid regex
    }
  }
  const needle = q.toLowerCase();
  return (text) => text.toLowerCase().includes(needle);
}

// levels: Set of enabled buckets; empty set means everything
export function filterRows(rows, { levels, query }) {
  const match = makeMatcher(query);
  return rows.filter(
    (row) => (!levels || levels.size === 0 || levels.has(levelBucket(row.level))) && match(row.text)
  );
}

export function countByBucket(rows) {
  const counts = { error: 0, warn: 0, info: 0, debug: 0, all: 0 };
  for (const row of rows) {
    counts[levelBucket(row.level)] += row.count;
    counts.all += row.count;
  }
  return counts;
}

// The most recent failed request that finished shortly before an error
export function relatedRequest(errorTs, requests, windowMs = 3000) {
  let best = null;
  for (const req of requests) {
    if (!isFailedRequest(req)) continue;
    const t = req.endTimestamp || req.startTimestamp;
    if (t <= errorTs + 50 && errorTs - t <= windowMs && (!best || t > (best.endTimestamp || best.startTimestamp))) {
      best = req;
    }
  }
  return best;
}
