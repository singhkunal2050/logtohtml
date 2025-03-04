/* This logWindow component is resposible for rendering all the logs in the window */

import { logWindowConfig, logColors, logFilters } from "./configs.js";
import styles from "./styles/style.css";

export default class LogWindow extends HTMLElement {
  isVisible = true;
  logs = [];
  selectedFilter = "all";
  searchKey = '';

  constructor() {
    super();

    // Create Shadow DOM
    this.attachShadow({ mode: "open" });

    this.addContainerElements();
    this.addEventListeners();
    this.overrideConsole();
  }

  addContainerElements() {
    this.container = document.createElement("div");
    const header = document.createElement("div");
    header.id = "log-window-header";
    header.innerHTML = `
        <select id="log-filter">
            ${logFilters.map((log) => {
              return `<option value="${log}">${log.toLocaleUpperCase()}</option>`;
            })}
        </select>
        <div id="clear-logs">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="none" stroke="#6b6b6b" stroke-width="2" d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M5,5 L19,19"></path>
            </svg>
        </div>
        <input id="log-search" placeholder="Search...">
    `;

    const logsListWrapper = document.createElement("div");
    logsListWrapper.id = "logs-list";

    this.container.id = logWindowConfig.id;
    this.container.style.display = this.isVisible ? "block" : "none";
    this.toggleButton = document.createElement("button");
    this.toggleButton.id = "toggle-button";
    this.toggleButton.innerText = "Show Logs ▲";

    this.container.append(header, logsListWrapper);
    const style = document.createElement("style");
    console.log({ styles });
    style.textContent = styles; // Inject CSS into Shadow DOM

    // Append elements to shadow root
    this.shadowRoot.append(style, this.container, this.toggleButton);
  }

  addEventListeners() {
    this.shadowRoot.addEventListener("click", (e) => {
      if (
        e.target.id === "toggle-button" ||
        e.target.closest("#toggle-button")
      ) {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
          this.toggleButton.textContent = "Hide Logs ▼";
          this.container.style.display = "block";
        } else {
          this.toggleButton.textContent = "Show Logs ▲";
          this.container.style.display = "none";
        }
      } else if (
        e.target.id === "clear-logs" ||
        e.target.closest("#clear-logs")
      ) {
        this.shadowRoot.querySelector("#logs-list").innerHTML = ``;
      }
    });

    this.shadowRoot
      .querySelector("select#log-filter")
      .addEventListener("change", (e) => {
        this.selectedFilter = e.target.value;
        const messages = this.shadowRoot.querySelectorAll("div.log-message");
        messages.forEach((message) => {
          if (
            this.selectedFilter === "all" ||
            message.dataset.type === this.selectedFilter
          ) {
            message.style.display = "block";
          } else {
            message.style.display = "none";
          }
        });
      });

    /* Search Listener */

    this.shadowRoot
      .querySelector("#log-search")
      .addEventListener("input", (e) => {
        this.searchKey = e.target.value.toLowerCase();
        const messages = Array.from(this.shadowRoot
          .querySelector("#logs-list")
          .querySelectorAll("div.log-message"));

        messages
          .filter((message) => {
            if (this.selectedFilter === "all") {
              return true;
            } else if (message.dataset.type === this.selectedFilter) {
              return true;
            }
          })
          .forEach((message) => {
            const messageText = message.textContent.toLowerCase();
            if (messageText.includes(this.searchKey)) {
              message.style.display = "block";
            } else {
              message.style.display = "none";
            }
          });
      });
  }

  overrideConsole() {
    const originalConsole = {
      log: console.log,
      debug: console.debug,
      error: console.error,
      warn: console.warn,
    };

    const logToWindow = (type, args) => {
      this.logs.push({
        type,
        args,
      });
      const logWindow = this.container.querySelector("#logs-list");
      if (logWindow) {
        const message = document.createElement("div");
        message.classList.add("log-message");
        message.dataset.type = type;
        message.style.backgroundColor = logColors[type] || "white";
        // Add a timestamp
        const timestamp = new Date().toISOString();
        const formattedArgs = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg
          )
          .join(" ");

        const logContent = document.createElement("div");
        logContent.textContent = `[${timestamp}] [${type.toUpperCase()}] ${formattedArgs}`;
        message.appendChild(logContent);

        // Expandable/collapsible log details for objects
        args.forEach((arg) => {
          if (
            typeof arg === "object" &&
            arg !== null &&
            Object.keys(arg)?.length
          ) {
            const details = document.createElement("details");
            details.style.opacity = "0.4";
            details.style.marginTop = "5px";

            const summary = document.createElement("summary");
            summary.textContent = `Details (${type})`;
            summary.style.cursor = "pointer";
            details.appendChild(summary);

            const pre = document.createElement("pre");
            pre.style.whiteSpace = "pre-wrap";
            pre.style.color = "#ccc";
            pre.textContent = JSON.stringify(arg, null, 2);
            details.appendChild(pre);

            message.appendChild(details);
          }
        });

        logWindow.appendChild(message);
        logWindow.scrollTop = logWindow.scrollHeight;
      }
    };

    // Override the console functions
    console.log = (...args) => {
      originalConsole.log(...args);
      logToWindow("log", args);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      logToWindow("debug", args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      logToWindow("error", args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      logToWindow("warn", args);
    };
  }
}
