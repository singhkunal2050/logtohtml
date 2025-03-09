import { logWindowConfig, logColors, logFilters, tabs } from "../configs.js";
import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Header from "./header.jsx";
import Content from "./content.jsx";

export default function LogWindow() {
  const [logs, setLogs] = useState([]);
  const [networkRequests, setNetworkRequests] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs.console);

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      setLogs((prevLogs) => [...prevLogs, { type: "log", args }]);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <>
      <button id="toggle-button" onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Hide Logs ▼" : "Show Logs ▲"}
      </button>
      {isVisible && (
        <div id="dynamic-log-window" class="dynamic-log-window">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          <Content
            activeTab={activeTab}
            logs={logs}
            networkRequests={networkRequests}
          />
        </div>
      )}
    </>
  );
}
