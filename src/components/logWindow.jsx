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
  const [resources, setResources] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs.console);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const clearLogs = () => {
    if (activeTab === tabs.console) {
      setLogs([]);
    } else if(activeTab === tabs.network) {
      setNetworkRequests([]);
    }
  };

  useEffect(() => {
    setLogs([...window.__logBuffer]);
    setNetworkRequests([...window.__networkBuffer]);

    // Listen for new logs without overriding console again
    const handleNewLog = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.detail]);
    };

    const handleNewNetworkLog = (event) => {
      setNetworkRequests((prevNetworkRequests) => [
        ...prevNetworkRequests,
        event.detail,
      ]);
    };

    const handleNewResource = (event) => {
      setResources((prevResources) => [
        ...prevResources,
        event.detail,
      ]);
    };

    window.addEventListener("new-log", handleNewLog);
    window.addEventListener("new-network-log", handleNewNetworkLog);
    window.addEventListener("new-resource", handleNewResource);

    return () => {
      window.removeEventListener("new-log", handleNewLog);
      window.removeEventListener("new-network-log", handleNewNetworkLog);
    };
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
            setSearch={setSearch}
            clearLogs={clearLogs}
          />
          <Content
            activeTab={activeTab}
            filter={filter}
            search={search}
            logs={logs}
            networkRequests={networkRequests}
            resources={resources}
          />
        </div>
      )}
    </>
  );
}
