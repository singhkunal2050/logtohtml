import { h } from "preact";
import { useState, useMemo, useRef, useLayoutEffect } from "preact/hooks";
import ObjectView from "./ObjectView.jsx";
import { Search, Close, Clear } from "./icons.jsx";
import { networkMonitor } from "../utils/networkMonitor.js";
import { makeMatcher, isFailedRequest } from "../utils/consoleView.js";
import { formatBytes, formatDuration, formatClock, shortUrl, statusTone, tryParseJson } from "../utils/format.js";
import { toCurl, replay, bodyToText } from "../utils/requestTools.js";
import { copyText } from "../utils/clipboard.js";

const KINDS = [
  { id: "api", label: "Fetch/XHR" },
  { id: "assets", label: "Assets" },
  { id: "failed", label: "Failed" },
  { id: "all", label: "All" },
];

// Static assets come from PerformanceObserver; shape them like requests
function assetToRow(res) {
  return {
    id: res.id,
    asset: true,
    url: res.name,
    method: "GET",
    status: res.success === false && res.size === 0 ? "" : 200,
    type: res.type,
    duration: res.duration,
    responseSize: res.size,
    startTimestamp: performance.timeOrigin ? performance.timeOrigin + res.startTime : res.timestamp,
  };
}

export default function NetworkTab({ requests, resources, selectedId, onSelect, notify }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("api");
  const listRef = useRef(null);

  const assets = useMemo(() => resources.filter((r) => r.type !== "fetch" && r.type !== "xmlhttprequest").map(assetToRow), [resources]);
  const failedCount = useMemo(() => requests.filter(isFailedRequest).length, [requests]);

  const rows = useMemo(() => {
    const base =
      kind === "api" ? requests
      : kind === "assets" ? assets
      : kind === "failed" ? requests.filter(isFailedRequest)
      : [...requests, ...assets].sort((a, b) => a.startTimestamp - b.startTimestamp);
    const match = makeMatcher(query);
    return base.filter((r) => match(`${r.method} ${r.url} ${r.status} ${r.statusText || ""}`));
  }, [requests, assets, kind, query]);

  const selected = selectedId != null ? requests.find((r) => r.id === selectedId) || assets.find((r) => r.id === selectedId) : null;

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && !selected) el.scrollTop = el.scrollHeight;
  }, [rows.length]);

  const counts = { api: requests.length, assets: assets.length, failed: failedCount, all: requests.length + assets.length };

  return (
    <div class="tab-body">
      <div class="toolbar">
        <div class="toolbar-row">
          <label class="search">
            <Search />
            <input aria-label="Filter requests" placeholder="Filter URL, method, status" value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
          </label>
          <button class="icon-btn" aria-label="Clear requests" onClick={() => { networkMonitor.clearRequests(); onSelect(null); }}><Clear /></button>
        </div>
        <div class="chips" role="group" aria-label="Request types">
          {KINDS.map((k) => (
            <button class={`chip${k.id === "failed" ? " chip-error" : ""}`} aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label} {counts[k.id] > 0 && <span class="chip-n">{counts[k.id]}</span>}
            </button>
          ))}
        </div>
      </div>

      <div class={`net-list mono${selected ? " net-list-short" : ""}`} ref={listRef}>
        <div class="net-head" aria-hidden="true">
          <span>Method</span><span>Path</span><span>Status</span><span class="num">Time</span>
        </div>
        {rows.length === 0 && (
          <div class="empty">{requests.length || assets.length ? "No requests match." : "Requests will appear here as the page makes them."}</div>
        )}
        {rows.map((r) => {
          const tone = r.asset ? "ok" : statusTone(r.status);
          return (
            <button
              key={r.id}
              class={`net-row tone-${tone}`}
              aria-current={selected && selected.id === r.id}
              onClick={() => onSelect(selected && selected.id === r.id ? null : r.id)}
            >
              <span class="net-method">{r.method}</span>
              <span class="net-path" title={r.url}>{shortUrl(r.url)}</span>
              <span class="net-status">{r.status === "pending" ? "…" : r.status || (r.asset ? "—" : "ERR")}</span>
              <span class="num">{r.status === "pending" ? "" : formatDuration(r.duration)}</span>
            </button>
          );
        })}
      </div>

      {selected && <RequestDetail req={selected} onClose={() => onSelect(null)} notify={notify} />}
    </div>
  );
}

const DETAIL_TABS = ["Headers", "Payload", "Response", "Timing"];

function RequestDetail({ req, onClose, notify }) {
  const [tab, setTab] = useState(req.asset ? "Timing" : "Response");
  const tabs = req.asset ? ["Timing"] : DETAIL_TABS;

  const copy = async (text, label) => notify((await copyText(text)) ? `${label} copied` : "Copy failed");
  const doReplay = async () => {
    try {
      await replay(req);
      notify("Replayed");
    } catch (e) {
      notify(`Replay failed: ${e.message}`);
    }
  };

  const status = req.status === "pending" ? "Pending" : `${req.status || "Failed"} ${req.statusText || ""}`.trim();

  return (
    <section class="detail" aria-label="Request detail">
      <div class="detail-head">
        <div class="detail-title">
          <div class="mono detail-url">{req.method} {shortUrl(req.url)}</div>
          <div class="detail-meta">
            {status} · {formatBytes(req.responseSize)} · {req.asset ? req.type : req.type || "fetch"}
          </div>
        </div>
        <button class="icon-btn" aria-label="Close request detail" onClick={onClose}><Close /></button>
      </div>

      <div class="subtabs" role="tablist">
        {tabs.map((t) => (
          <button role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div class="detail-body mono">
        {tab === "Headers" && <Headers req={req} />}
        {tab === "Payload" && <Body text={bodyToText(req.requestBody)} empty="No request body" />}
        {tab === "Response" && <Body text={req.responseBody} empty={req.status === "pending" ? "Waiting for response…" : "No response body"} />}
        {tab === "Timing" && <Timing req={req} />}
      </div>

      {!req.asset && (
        <div class="detail-actions">
          <button class="btn" onClick={() => copy(toCurl(req), "cURL")}>Copy cURL</button>
          <button class="btn" onClick={() => copy(req.responseBody || "", "Body")}>Copy body</button>
          <button class="btn-primary" onClick={doReplay}>Replay</button>
        </div>
      )}
    </section>
  );
}

function KeyValues({ title, data }) {
  const entries = Object.entries(data || {});
  return (
    <div class="kv-section">
      <div class="kv-title">{title}</div>
      {entries.length === 0 && <div class="v-null">None</div>}
      {entries.map(([k, v]) => (
        <div class="kv" key={k}>
          <span class="kv-k">{k}</span>
          <span class="kv-v">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Headers({ req }) {
  return (
    <div>
      <KeyValues title="General" data={{ URL: req.url, Method: req.method, Status: `${req.status} ${req.statusText || ""}`.trim(), Type: req.type }} />
      <KeyValues title="Response headers" data={req.responseHeaders} />
      <KeyValues title="Request headers" data={req.requestHeaders} />
    </div>
  );
}

function Body({ text, empty }) {
  if (text == null || text === "") return <div class="v-null">{empty}</div>;
  const json = tryParseJson(text);
  if (json !== undefined) return <ObjectView value={json} defaultOpen />;
  return <pre class="body-text">{text}</pre>;
}

function Timing({ req }) {
  return (
    <KeyValues
      title="Timing"
      data={{
        Started: req.startTimestamp ? formatClock(req.startTimestamp) : "n/a",
        Duration: req.status === "pending" ? "pending" : formatDuration(req.duration),
        Size: formatBytes(req.responseSize),
      }}
    />
  );
}
