import { h } from "preact";
import { useState, useMemo } from "preact/hooks";
import ObjectView from "./ObjectView.jsx";
import { Search, Refresh, Trash } from "./icons.jsx";
import { useInterval } from "./hooks.js";
import { readAll, removeItem, clearArea } from "../utils/storage.js";
import { makeMatcher } from "../utils/consoleView.js";
import { tryParseJson } from "../utils/format.js";
import { copyText } from "../utils/clipboard.js";

const AREAS = [
  { id: "local", label: "Local" },
  { id: "session", label: "Session" },
  { id: "cookies", label: "Cookies" },
];

export default function StorageTab({ notify }) {
  const [data, setData] = useState(readAll);
  const [area, setArea] = useState("local");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState(null);

  const refresh = () => setData(readAll());
  // Same-page writes don't fire "storage" events, so poll while the tab is open
  useInterval(refresh, 2000);

  const current = data[area];
  const items = useMemo(() => {
    const match = makeMatcher(query);
    return current.items.filter((i) => match(`${i.key} ${i.value}`));
  }, [current, query]);

  const remove = (key) => {
    removeItem(area, key);
    refresh();
    notify(`Removed ${key}`);
  };

  const clearAll = () => {
    if (!window.confirm(`Clear all ${AREAS.find((a) => a.id === area).label.toLowerCase()} storage for this site?`)) return;
    clearArea(area);
    refresh();
  };

  return (
    <div class="tab-body">
      <div class="toolbar">
        <div class="toolbar-row">
          <label class="search">
            <Search />
            <input aria-label="Filter storage" placeholder="Filter keys and values" value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
          </label>
          <button class="icon-btn" aria-label="Refresh storage" onClick={refresh}><Refresh /></button>
          <button class="icon-btn" aria-label="Clear this storage area" onClick={clearAll} disabled={!current.items.length}><Trash /></button>
        </div>
        <div class="chips" role="tablist" aria-label="Storage area">
          {AREAS.map((a) => (
            <button role="tab" class="chip" aria-selected={area === a.id} aria-pressed={area === a.id} onClick={() => { setArea(a.id); setOpenKey(null); }}>
              {a.label} <span class="chip-n">{data[a.id].items.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div class="list mono">
        {current.error && <div class="empty">{current.error}</div>}
        {!current.error && items.length === 0 && <div class="empty">{current.items.length ? "No items match." : "Nothing stored."}</div>}
        {items.map((item) => {
          const open = openKey === item.key;
          const json = open ? tryParseJson(item.value) : undefined;
          return (
            <div class="store-item" key={item.key}>
              <button class="store-row" aria-expanded={open} onClick={() => setOpenKey(open ? null : item.key)}>
                <span class="store-key">{item.key}</span>
                <span class="store-val">{item.value}</span>
              </button>
              {open && (
                <div class="store-detail">
                  {json !== undefined ? <ObjectView value={json} defaultOpen /> : <pre class="body-text">{item.value || "(empty)"}</pre>}
                  <div class="row-actions">
                    <button class="btn-small" onClick={async () => notify((await copyText(item.value)) ? "Value copied" : "Copy failed")}>Copy value</button>
                    <button class="btn-small" onClick={() => remove(item.key)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {area === "cookies" && !current.error && (
          <div class="list-note">HttpOnly cookies are not visible to page scripts.</div>
        )}
      </div>
    </div>
  );
}
