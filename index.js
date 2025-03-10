// import logWindow from "./src/logWindow.js";
import logWindow from "./src/main.js";
customElements.define("log-window", logWindow);
import { utils } from "./src/utils/utils.js";
import packageJson from "./package.json";
const LIBRARY_VERSION = packageJson.version ?? "debug";

// If logtohtml query param is present, create the log window and override console
if (new URLSearchParams(window.location.search).get("logtohtml") === "true") {
  utils.overrideConsole();
  utils.overrideFetchXHR();
  utils.overrideResourceMonitoring();

  console.log(`[LOGTOHTML] Library version: ${LIBRARY_VERSION}`);
  const logWindowElement = document.createElement("log-window");
  document.body.appendChild(logWindowElement);
}
