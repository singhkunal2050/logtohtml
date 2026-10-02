import logWindow from "./src/main.jsx";
import { consoleOverride } from "./src/utils/consoleOverride.js";
import { networkMonitor } from "./src/utils/networkMonitor.js";
import { errorCapture } from "./src/utils/errorCapture.js";
import packageJson from "./package.json";
const LIBRARY_VERSION = packageJson.version ?? "debug";

if (!customElements.get("log-window")) {
  customElements.define("log-window", logWindow);
}

// Nothing is patched unless the page is opened with ?logtohtml=true
if (new URLSearchParams(window.location.search).get("logtohtml") === "true") {
  // Start capturing immediately so logs before the panel mounts are kept
  consoleOverride.install();
  networkMonitor.install();
  errorCapture.install();

  // Debug globals kept from earlier versions
  Object.defineProperty(window, "__logBuffer", { get: () => consoleOverride.getLogs(), configurable: true });
  Object.defineProperty(window, "__networkBuffer", { get: () => networkMonitor.getRequests(), configurable: true });
  Object.defineProperty(window, "__resourceBuffer", { get: () => networkMonitor.getResources(), configurable: true });

  console.log(`[LOGTOHTML] Library version: ${LIBRARY_VERSION}`);

  const mount = () => document.body.appendChild(document.createElement("log-window"));
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
}
