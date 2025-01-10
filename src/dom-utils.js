import { logWindowConfig, logColors } from "./configs.js";

// Step 1: Create a DOM window for the logs
export function createLogWindow() {
  const logWindow = document.createElement("div");
  logWindow.id = logWindowConfig.id;
  const logsList = document.createElement("div");
  logsList.id = logWindowConfig.contentId;
  Object.assign(logWindow.style, logWindowConfig.styles);

  // Toggle button for showing/hiding logs
  const toggleButton = document.createElement("button");
  toggleButton.textContent = logWindowConfig.toggleButton.textContent;
  Object.assign(toggleButton.style, logWindowConfig.toggleButton.styles);

  toggleButton.addEventListener("click", () => {
    if (logWindow.style.display === "none") {
      logWindow.style.display = "block";
      toggleButton.textContent = "Hide Logs";
    } else {
      logWindow.style.display = "none";
      toggleButton.textContent = "Show Logs";
    }
  });

  // Filter container
  const filterContainer = document.createElement("div");
  Object.assign(filterContainer.style, {
    display : "flex",
    justifyContent : "flex-start",
    padding : "10px",
    backgroundColor : "#3330006b",
    backdropFilter : "blur(5px)",
    borderBottom : "1px solid #efefef",
    position : "sticky",
    top : "0",
    gap: "10px"
  })
  
  // Create dropdown for filters
  const filterDropdown = document.createElement("select");
  Object.assign(filterDropdown.style, {
    color : "white",
    backgroundColor : "black",
    border : "1px solid white",
    cursor : "pointer",
    padding : "5px"
  })

  // Filter options
  const filters = ["all", "log", "debug", "error", "warn"];
  filters.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.toUpperCase();
    filterDropdown.appendChild(option);
  });

  // Add event listener for filtering
  filterDropdown.addEventListener("change", () => {
    const selectedFilter = filterDropdown.value;
    const messages = logWindow.querySelectorAll("div.log-message");
    messages.forEach((message) => {
      if (selectedFilter === "all" || message.dataset.type === selectedFilter) {
        message.style.display = "block";
      } else {
        message.style.display = "none";
      }
    });
  });

  const clearConsoleButton = document.createElement("div");
  Object.assign(clearConsoleButton.style , {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5px'
  })
  clearConsoleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="none" stroke="white" stroke-width="2" d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M5,5 L19,19"/>
    </svg>`;
  clearConsoleButton.addEventListener("click", () => {
    document.getElementById(logWindowConfig.contentId).innerHTML = "";
  });


  const searchInput = document.createElement('input');



  // Append dropdown to filter container
  filterContainer.appendChild(filterDropdown);
  filterContainer.appendChild(clearConsoleButton);
  filterContainer.appendChild(searchInput);

  logWindow.appendChild(filterContainer);
  logWindow.appendChild(logsList);
  document.body.appendChild(logWindow);
  document.body.appendChild(toggleButton);
}

// Step 2: Override console functions
export function overrideConsole() {
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    error: console.error,
    warn: console.warn,
  };

  const logToWindow = (type, args) => {
    const logWindow = document.getElementById(logWindowConfig.contentId);
    if (logWindow) {
      const message = document.createElement("div");
      message.classList.add("log-message");
      message.dataset.type = type;

      Object.assign(message.style, {
        padding: "5px",
        marginBottom: "6px",
        borderBottom: "1px solid #444",
        color: logColors[type] || "white",
      })
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
          summary.style.color = logColors[type];
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
