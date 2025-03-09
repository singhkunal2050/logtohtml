// import logWindow from "./src/logWindow.js";
import logWindow from "./src/main.js";
import packageJson from "./package.json";   
const LIBRARY_VERSION = packageJson.version ?? 'debug';

customElements.define("log-window", logWindow);

// If logtohtml query param is present, create the log window and override console
if (new URLSearchParams(window.location.search).get('logtohtml') === 'true') {
    const logWindowElement = document.createElement("log-window");
    document.body.appendChild(logWindowElement);
    console.log(`[LOGTOHTML] Library version: ${LIBRARY_VERSION}`);
}
