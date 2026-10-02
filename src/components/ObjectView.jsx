import { h } from "preact";
import { useState } from "preact/hooks";
import { previewValue, constructorName, stackFrames, prettyFrame } from "../utils/format.js";

const MAX_CHILDREN = 100;

function isExpandable(value) {
  return value !== null && (typeof value === "object" || typeof value === "function");
}

function primitiveClass(value) {
  if (value === null || value === undefined) return "v-null";
  return `v-${typeof value}`;
}

// Children are read lazily on expand; accessors are shown as (…) and never invoked
function childEntries(value) {
  const out = [];
  try {
    if (value instanceof Map) {
      let i = 0;
      for (const [k, v] of value) {
        if (i++ >= MAX_CHILDREN) break;
        out.push({ key: `${previewValue(k, 1)} =>`, value: v });
      }
      return { entries: out, total: value.size };
    }
    if (value instanceof Set) {
      let i = 0;
      for (const v of value) {
        if (i >= MAX_CHILDREN) break;
        out.push({ key: String(i++), value: v });
      }
      return { entries: out, total: value.size };
    }
    const keys = Object.getOwnPropertyNames(value).filter((k) => !(Array.isArray(value) && k === "length"));
    for (const key of keys.slice(0, MAX_CHILDREN)) {
      const d = Object.getOwnPropertyDescriptor(value, key);
      if (!d) continue;
      if ("value" in d) out.push({ key, value: d.value });
      else out.push({ key, accessor: true });
    }
    const proto = Object.getPrototypeOf(value);
    if (proto && proto !== Object.prototype && proto !== Array.prototype && proto !== Function.prototype) {
      out.push({ key: "[[Prototype]]", value: proto, dim: true });
    }
    return { entries: out, total: keys.length };
  } catch (e) {
    return { entries: [], total: 0, error: true };
  }
}

export default function ObjectView({ value, name, topLevel = false, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  if (!isExpandable(value)) {
    const text = topLevel && typeof value === "string" ? value : previewValue(value, topLevel ? 0 : 1);
    return (
      <span class="ov">
        {name != null && <span class="ov-key">{name}: </span>}
        <span class={topLevel && typeof value === "string" ? "v-text" : primitiveClass(value)}>{text}</span>
      </span>
    );
  }

  if (value instanceof Error) {
    return <ErrorView error={value} name={name} />;
  }

  const label = previewValue(value, name != null ? 1 : 0);
  return (
    <span class="ov">
      <button class="ov-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span class="ov-caret">{open ? "▾" : "▸"}</span>
        {name != null && <span class="ov-key">{name}: </span>}
        <span class="ov-preview">{name != null && !open ? label : previewValue(value)}</span>
      </button>
      {open && <Children value={value} />}
    </span>
  );
}

function Children({ value }) {
  const { entries, total, error } = childEntries(value);
  if (error) return <div class="ov-children"><span class="v-null">[Cannot inspect]</span></div>;
  return (
    <div class="ov-children">
      {entries.map((e) =>
        e.accessor ? (
          <div class="ov-row" key={e.key}>
            <span class="ov-key">{e.key}: </span>
            <span class="v-null">(…)</span>
          </div>
        ) : (
          <div class={`ov-row${e.dim ? " ov-dim" : ""}`} key={e.key}>
            <ObjectView value={e.value} name={e.key} />
          </div>
        )
      )}
      {total > MAX_CHILDREN && <div class="ov-row v-null">… {total - MAX_CHILDREN} more</div>}
      {entries.length === 0 && <div class="ov-row v-null">{constructorName(value)} (empty)</div>}
    </div>
  );
}

export function ErrorView({ error, name }) {
  const [open, setOpen] = useState(false);
  const frames = stackFrames(error.stack);
  return (
    <span class="ov">
      <button class="ov-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span class="ov-caret">{open ? "▾" : "▸"}</span>
        {name != null && <span class="ov-key">{name}: </span>}
        <span class="v-error">{error.name}: {error.message}</span>
      </button>
      {open && (
        <div class="ov-children">
          {frames.map((f, i) => (
            <div class="stack-frame" key={i}>{prettyFrame(f)}</div>
          ))}
          {error.cause !== undefined && (
            <div class="ov-row">
              <ObjectView value={error.cause} name="cause" />
            </div>
          )}
        </div>
      )}
    </span>
  );
}
