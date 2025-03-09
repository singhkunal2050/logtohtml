import { logWindowConfig, logColors, logFilters, tabs } from "../configs.js";
import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Header from "./header.jsx";
import Content from "./content.jsx";
import packageJson from "../../package.json";
const LIBRARY_VERSION = packageJson.version ?? "debug";

export default function LogWindow() {
  const [logs, setLogs] = useState([]);
  const [networkRequests, setNetworkRequests] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs.console);
  const [filter, setFilter] = useState("all");

  const clearLogs = () => {
    if(activeTab === tabs.console) {
      setLogs([]);
    }
  };

  useEffect(() => {
    setLogs([...window.__logBuffer]);

    // Listen for new logs without overriding console again
    const handleNewLog = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.detail]);
    };

    window.addEventListener("new-log", handleNewLog);
    return () => window.removeEventListener("new-log", handleNewLog);
  }, []);

  return (
    <>
      <button id="toggle-button" onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Hide Logs ▼" : "Show Logs ▲"}
      </button>
      {isVisible && (
        <div id="dynamic-log-window" class="dynamic-log-window">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setFilter={setFilter}
            clearLogs={clearLogs}
          />
          <Content
            activeTab={activeTab}
            filter={filter}
            logs={logs}
            networkRequests={networkRequests}
          />
        </div>
      )}
    </>
  );
}
