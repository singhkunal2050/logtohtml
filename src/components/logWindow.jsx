import { logWindowConfig, logColors, logFilters, tabs } from "../configs.js";
import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Header from "./header.jsx";
import Content from "./content.jsx";
import { utils } from "../utils/utils.js";
import { performanceUtils } from "../utils/performance.js";
import { consoleOverride } from "../utils/consoleOverride.js";
import { devtoolsStore } from "../store/devtoolsStore.js";
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

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribeActiveTab = devtoolsStore.subscribe('activeTab', setActiveTab);
    return () => unsubscribeActiveTab();
  }, []);

  const clearLogs = () => {
    if (activeTab === tabs.console) {
      consoleOverride.clearLogs();
      setLogs([]);
    } else if(activeTab === tabs.network) {
      setNetworkRequests([]);
    }
  };

  useEffect(() => {
    // Initialize comprehensive console override
    consoleOverride.overrideAllMethods();
    
    // Initialize network monitoring
    utils.overrideFetchXHR();
    utils.overrideResourceMonitoring();
    
    // Initialize performance monitoring
    performanceUtils.init();

    setLogs(consoleOverride.getLogs());
    setNetworkRequests([...window.__networkBuffer]);

    // Listen for new logs
    const handleNewLog = (event) => {
      setLogs(consoleOverride.getLogs());
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
      performanceUtils.destroy();
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
