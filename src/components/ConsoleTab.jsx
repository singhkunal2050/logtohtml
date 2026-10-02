import { h } from "preact";
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "preact/hooks";
import ObjectView from "./ObjectView.jsx";
import { Search, Clear } from "./icons.jsx";
import { consoleOverride } from "../utils/consoleOverride.js";
import { filterRows, countByBucket, relatedRequest } from "../utils/consoleView.js";
import { applyFormat, formatClock, formatDuration, shortUrl, stackFrames, prettyFrame, previewValue } from "../utils/format.js";
import { evaluate } from "../utils/repl.js";
import { copyText } from "../utils/clipboard.js";

const RENDER_LIMIT = 500;

const CHIPS = [
  { id: "error", label: "Errors" },
  { id: "warn", label: "Warn" },
  { id: "info", label: "Info" },
  { id: "debug", label: "Debug" },
];

export default function ConsoleTab({ rows, requests, onOpenRequest, notify }) {
  const [query, setQuery] = useState("");
  const [levels, setLevels] = useState(() => new Set());
  const listRef = useRef(null);
  const stickRef = useRef(true);

  const counts = useMemo(() => countByBucket(rows), [rows]);
  const visible = useMemo(() => filterRows(rows, { levels, query }), [rows, levels, query]);
  const hidden = Math.max(0, visible.length - RENDER_LIMIT);
  const shown = hidden ? visible.slice(hidden) : visible;

  const toggleLevel = (id) => {
    const next = new Set(levels);
    next.has(id) ? next.delete(id) : next.add(id);
    setLevels(next);
  };

  // Keep the newest entry in view unless the user has scrolled up
  const onScroll = () => {
    const el = listRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [shown.length, rows]);

  return (
    <div class="tab-body">
      <div class="toolbar">
        <div class="toolbar-row">
          <label class="search">
            <Search />
            <input
              aria-label="Filter logs"
              placeholder="Filter (text or /regex/)"
              value={query}
              onInput={(e) => setQuery(e.currentTarget.value)}
            />
          </label>
          <button class="icon-btn" aria-label="Clear console" onClick={() => consoleOverride.clearLogs()}><Clear /></button>
        </div>
        <div class="chips" role="group" aria-label="Log levels">
          <button class="chip" aria-pressed={levels.size === 0} onClick={() => setLevels(new Set())}>
            All <span class="chip-n">{counts.all}</span>
          </button>
          {CHIPS.map((c) => (
            <button
              class={`chip chip-${c.id}`}
              aria-pressed={levels.has(c.id)}
              onClick={() => toggleLevel(c.id)}
            >
              {c.label} {counts[c.id] > 0 && <span class="chip-n">{counts[c.id]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div class="list mono" ref={listRef} onScroll={onScroll}>
        {hidden > 0 && <div class="list-note">{hidden} earlier entries hidden. Filter to narrow down.</div>}
        {shown.length === 0 && (
          <div class="empty">{rows.length ? "No entries match this filter." : "Console output will appear here."}</div>
        )}
        {shown.map((row) =>
          row.kind === "net" ? (
            <NetRow key={row.key} row={row} onOpen={() => onOpenRequest(row.request.id)} />
          ) : (
            <LogRow key={row.key} row={row} requests={requests} onOpenRequest={onOpenRequest} notify={notify} />
          )
        )}
      </div>

      <Repl />
    </div>
  );
}

function NetRow({ row, onOpen }) {
  const r = row.request;
  return (
    <button class="row row-error row-net" onClick={onOpen}>
      <div class="row-line">
        <span class="row-msg">
          <span class="tag">NET</span>{r.method} {shortUrl(r.url)}
        </span>
        <span class="row-status">
          {r.status || "failed"}
          {r.duration != null && ` · ${formatDuration(r.duration)}`}
        </span>
      </div>
      <div class="row-meta">{formatClock(row.ts)} · tap to inspect</div>
    </button>
  );
}

function LogRow({ row, requests, onOpenRequest, notify }) {
  const { entry, level, count } = row;
  const indent = Math.min(entry.groupLevel || 0, 8);
  const cls = `row row-${level}${entry.type === "repl-input" ? " row-repl" : ""}`;

  return (
    <div class={cls} style={indent ? { paddingLeft: `${12 + indent * 14}px` } : null}>
      <div class="row-line">
        <div class="row-msg">
          {level === "error" && <span class="glyph" aria-hidden="true">✕</span>}
          {level === "warn" && <span class="glyph" aria-hidden="true">▲</span>}
          <EntryBody entry={entry} />
        </div>
        {count > 1 && <span class="repeat" aria-label={`repeated ${count} times`}>×{count}</span>}
      </div>
      <div class="row-meta">
        {formatClock(row.ts)}
        {entry.source && ` · ${entry.source}`}
      </div>
      {level === "error" && (
        <ErrorDetails entry={entry} ts={row.ts} requests={requests} onOpenRequest={onOpenRequest} notify={notify} />
      )}
    </div>
  );
}

function Args({ args }) {
  return applyFormat(args || []).map((arg, i) => (
    <span class="arg" key={i}>
      <ObjectView value={arg} topLevel />
    </span>
  ));
}

function EntryBody({ entry }) {
  switch (entry.type) {
    case "log":
      return entry.uncaught ? <span>{entry.message}</span> : <Args args={entry.args} />;
    case "group":
      return <span class="group-label">▾ {entry.label || "console.group"}</span>;
    case "table":
      return <Table data={entry.data} columns={entry.columns} />;
    case "trace":
      return (
        <span>
          <span>console.trace {entry.message !== "Trace" ? entry.message : ""}</span>
          <Frames frames={entry.stack} />
        </span>
      );
    case "assert":
      return <span>Assertion failed: {entry.message}</span>;
    case "dir":
      return <ObjectView value={entry.object} defaultOpen />;
    case "dirxml":
      return <ObjectView value={entry.node} />;
    case "repl-input":
      return <span class="repl-echo">› {entry.code}</span>;
    case "repl-result":
      return (
        <span class="repl-result">
          ‹ {entry.awaited && <span class="v-null">Promise → </span>}
          <ObjectView value={entry.isError ? entry.error : entry.value} />
        </span>
      );
    default:
      return <span>{entry.message}</span>;
  }
}

function Frames({ frames, limit }) {
  const [all, setAll] = useState(false);
  if (!frames || !frames.length) return null;
  const visible = all || !limit ? frames : frames.slice(0, limit);
  return (
    <div class="stack">
      {visible.map((f, i) => (
        <div class="stack-frame" key={i}>{prettyFrame(f)}</div>
      ))}
      {!all && limit && frames.length > limit && (
        <button class="link" onClick={() => setAll(true)}>
          {frames.length - limit} more frames
        </button>
      )}
    </div>
  );
}

function errorFrames(entry) {
  if (entry.stack && entry.stack.length) return entry.stack;
  const err = (entry.args || []).find((a) => a instanceof Error);
  if (err) return stackFrames(err.stack);
  return entry.callStack || [];
}

function ErrorDetails({ entry, ts, requests, onOpenRequest, notify }) {
  if (entry.type !== "log") return null;
  const frames = errorFrames(entry);
  const related = relatedRequest(ts, requests);
  const copy = async () => {
    const text = [entry.message, ...frames.map((f) => `    ${f}`)].join("\n");
    notify((await copyText(text)) ? "Error copied" : "Copy failed");
  };
  return (
    <div class="error-details">
      <Frames frames={frames} limit={2} />
      <div class="row-actions">
        <button class="btn-small" onClick={copy}>Copy error</button>
        {related && (
          <button class="btn-small" onClick={() => onOpenRequest(related.id)}>
            Show related request
          </button>
        )}
      </div>
    </div>
  );
}

function Table({ data, columns }) {
  if (data == null || typeof data !== "object") return <ObjectView value={data} topLevel />;
  const rows = Object.entries(data).slice(0, 50);
  const cols = columns && columns.length
    ? columns
    : [...new Set(rows.flatMap(([, v]) => (v && typeof v === "object" ? Object.keys(v) : ["Value"])))].slice(0, 12);
  return (
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>(index)</th>
            {cols.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              {cols.map((c) => (
                <td key={c}>
                  {v && typeof v === "object" ? (c in v ? previewValue(v[c], 1) : "") : c === "Value" ? previewValue(v, 1) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Repl() {
  const [code, setCode] = useState("");
  const history = useRef([]);
  const cursor = useRef(-1);

  const run = async () => {
    const src = code.trim();
    if (!src) return;
    history.current.push(src);
    cursor.current = -1;
    setCode("");
    consoleOverride.recordRepl("repl-input", { code: src, message: src });
    const { value, error, awaited } = await evaluate(src);
    consoleOverride.recordRepl("repl-result", error
      ? { isError: true, error, message: String(error) }
      : { value, awaited, message: previewValue(value) });
  };

  const onKeyDown = (e) => {
    const h = history.current;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run();
    } else if (e.key === "ArrowUp" && h.length && !code.includes("\n")) {
      e.preventDefault();
      cursor.current = cursor.current === -1 ? h.length - 1 : Math.max(0, cursor.current - 1);
      setCode(h[cursor.current]);
    } else if (e.key === "ArrowDown" && cursor.current !== -1) {
      e.preventDefault();
      cursor.current = cursor.current + 1 >= h.length ? -1 : cursor.current + 1;
      setCode(cursor.current === -1 ? "" : h[cursor.current]);
    }
  };

  return (
    <form class="repl" onSubmit={(e) => { e.preventDefault(); run(); }}>
      <span class="repl-prompt" aria-hidden="true">›</span>
      <input
        aria-label="Evaluate JavaScript"
        placeholder="Evaluate JS in page…"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        value={code}
        onInput={(e) => setCode(e.currentTarget.value)}
        onKeyDown={onKeyDown}
      />
      <button class="btn-primary" type="submit">Run</button>
    </form>
  );
}
