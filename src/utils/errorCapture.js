import { consoleOverride } from "./consoleOverride.js";

// Records uncaught errors and unhandled promise rejections in the console buffer.
let installed = false;

function onError(event) {
  try {
    // Resource load failures (img/script 404s) bubble here without an ErrorEvent message
    if (!(event instanceof ErrorEvent)) return;
    const source = event.filename
      ? `${event.filename.split("/").pop() || event.filename}:${event.lineno}`
      : "";
    consoleOverride.recordUncaught({
      error: event.error,
      message: event.message || "Script error.",
      source,
      kind: "error",
    });
  } catch (e) {}
}

function onRejection(event) {
  try {
    const reason = event.reason;
    consoleOverride.recordUncaught({
      error: reason,
      message: reason instanceof Error ? undefined : safeString(reason),
      kind: "rejection",
    });
  } catch (e) {}
}

function safeString(value) {
  try {
    return typeof value === "string" ? value : JSON.stringify(value) ?? String(value);
  } catch (e) {
    return String(value);
  }
}

export const errorCapture = {
  install() {
    if (installed) return;
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection);
    installed = true;
  },
  destroy() {
    if (!installed) return;
    window.removeEventListener("error", onError, true);
    window.removeEventListener("unhandledrejection", onRejection);
    installed = false;
  },
};
