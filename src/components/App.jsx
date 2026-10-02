import { h } from "preact";
import { useState, useMemo, useRef, useEffect } from "preact/hooks";
import ConsoleTab from "./ConsoleTab.jsx";
import NetworkTab from "./NetworkTab.jsx";
import StorageTab from "./StorageTab.jsx";
import DeviceTab from "./DeviceTab.jsx";
import { ChevronDown } from "./icons.jsx";
import { useSource, usePersistentState, useViewport } from "./hooks.js";
import { consoleOverride } from "../utils/consoleOverride.js";
import { networkMonitor } from "../utils/networkMonitor.js";
import { buildTimeline, countByBucket, isFailedRequest } from "../utils/consoleView.js";
import packageJson from "../../package.json";

const VERSION = packageJson.version;
const TABS = [
  { id: "console", label: "Console" },
  { id: "network", label: "Network" },
  { id: "storage", label: "Storage" },
  { id: "device", label: "Device" },
];

export default function App() {
  const [open, setOpen] = usePersistentState("open", false);
  const [tab, setTab] = usePersistentState("tab", "console");
  const [heightFrac, setHeightFrac] = usePersistentState("height", 0.6);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState(null);
  const viewport = useViewport();

  const logs = useSource(() => consoleOverride.getLogs(), ["new-log", "console-cleared"]);
  const requests = useSource(() => networkMonitor.getRequests(), ["new-network-request", "network-request-updated", "network-cleared"]);
  const resources = useSource(() => networkMonitor.getResources(), ["new-resource", "network-cleared"]);

  const timeline = useMemo(() => buildTimeline(logs, requests), [logs, requests]);
  const errorCount = useMemo(() => countByBucket(timeline).error, [timeline]);
  const failedCount = useMemo(() => requests.filter(isFailedRequest).length, [requests]);

  const toastTimer = useRef(0);
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const openRequest = (id) => {
    setSelectedRequest(id);
    setTab("network");
  };

  const height = Math.round(viewport.h * heightFrac);

  return (
    <div class="root">
      {!open && <Launcher errors={errorCount} onOpen={() => setOpen(true)} />}

      {open && (
        <section class="sheet" style={{ height: `${height}px` }} aria-label="logtohtml panel">
          <ResizeHandle onResize={(frac) => setHeightFrac(frac)} />

          <header class="sheet-head">
            <div class="tabs" role="tablist">
              {TABS.map((t) => {
                const badge = t.id === "console" ? errorCount : t.id === "network" ? failedCount : 0;
                return (
                  <button role="tab" class="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                    {t.label}
                    {badge > 0 && <span class="badge" aria-label={`${badge} errors`}>{badge}</span>}
                  </button>
                );
              })}
            </div>
            <div class="head-actions">
              <button class="icon-btn" aria-label="Minimize panel" onClick={() => setOpen(false)}><ChevronDown /></button>
            </div>
          </header>

          {tab === "console" && (
            <ConsoleTab rows={timeline} requests={requests} onOpenRequest={openRequest} notify={notify} />
          )}
          {tab === "network" && (
            <NetworkTab requests={requests} resources={resources} selectedId={selectedRequest} onSelect={setSelectedRequest} notify={notify} />
          )}
          {tab === "storage" && <StorageTab notify={notify} />}
          {tab === "device" && <DeviceTab version={VERSION} notify={notify} />}

          {toast && <div class="toast" role="status">{toast}</div>}
        </section>
      )}
    </div>
  );
}

function ResizeHandle({ onResize }) {
  const onPointerDown = (e) => {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const frac = (window.innerHeight - ev.clientY) / window.innerHeight;
      onResize(Math.min(0.95, Math.max(0.25, frac)));
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };
  return (
    <div class="handle" onPointerDown={onPointerDown} aria-hidden="true">
      <span class="handle-bar" />
    </div>
  );
}

// Floating button; drag to move, snaps to the nearest side edge.
// Opens on click (not pointerup) so the tap's click can't land on the sheet underneath.
function Launcher({ errors, onOpen }) {
  const [pos, setPos] = usePersistentState("launcher", { side: "right", top: 0.7 });
  const [drag, setDrag] = useState(null);
  const ref = useRef(null);
  const draggedRef = useRef(false);

  const onPointerDown = (e) => {
    const el = ref.current;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    let moved = false;
    draggedRef.current = false;

    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return;
      moved = true;
      setDrag({ left: ev.clientX - start.dx, top: ev.clientY - start.dy });
    };
    const up = (ev) => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setDrag(null);
      if (!moved) return;
      draggedRef.current = true;
      const top = Math.min(0.92, Math.max(0.04, (ev.clientY - start.dy) / window.innerHeight));
      setPos({ side: ev.clientX < window.innerWidth / 2 ? "left" : "right", top });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  const style = drag
    ? { left: `${drag.left}px`, top: `${drag.top}px` }
    : { [pos.side]: "12px", top: `${Math.round(pos.top * 100)}%` };

  return (
    <button
      ref={ref}
      class={`launcher${drag ? " dragging" : ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onClick={() => {
        if (draggedRef.current) draggedRef.current = false;
        else onOpen();
      }}
      aria-label={errors ? `Open logtohtml, ${errors} errors` : "Open logtohtml"}
    >
      <span class="launcher-mark" aria-hidden="true">›_</span>
      {errors > 0 && <span class="badge">{errors > 99 ? "99+" : errors}</span>}
    </button>
  );
}
