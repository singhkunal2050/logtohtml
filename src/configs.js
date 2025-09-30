export const logWindowConfig = {
  id: "dynamic-log-window",
  contentId: "logs-list",

  toggleButton: {
    textContent: "Show Logs ▲",
  },
};

export const logColors = {
  log: "transparent",
  debug: "#264445",
  error: "#4e3434",
  warn: "#413c26",
};

export const tabs = {
  console: "console",
  network: "network",
  performance: "performance",
  elements: "elements",
  storage: "storage",
  application: "application",
  security: "security",
};

// Filter options
export const logFilters = ["all", "log", "info", "debug", "warn", "error", "table", "trace", "assert", "count", "time"];
