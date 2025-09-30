import { logWindowConfig, logColors, logFilters, tabs } from "../configs.js";
import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import Header from "./header.jsx";
import Content from "./content.jsx";
import { utils } from "../utils/utils.js";
import { performanceUtils } from "../utils/performance.js";
import { consoleOverride } from "../utils/consoleOverride.js";
import { networkMonitor } from "../utils/networkMonitor.js";
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
      networkMonitor.clearRequests();
      setNetworkRequests([]);
      setResources([]);
    }
  };

  useEffect(() => {
    // Initialize comprehensive console override
    consoleOverride.overrideAllMethods();
    
    // Initialize network monitoring
    networkMonitor.init();
    
    // Initialize performance monitoring
    performanceUtils.init();

    setLogs(consoleOverride.getLogs());
    setNetworkRequests(networkMonitor.getRequests());
    setResources(networkMonitor.getResources());

    // Listen for new logs
    const handleNewLog = (event) => {
      setLogs(consoleOverride.getLogs());
    };

    const handleNewNetworkRequest = (event) => {
      setNetworkRequests(networkMonitor.getRequests());
    };

    const handleNetworkRequestUpdated = (event) => {
      setNetworkRequests(networkMonitor.getRequests());
    };

    const handleNewResource = (event) => {
      setResources(networkMonitor.getResources());
    };

    window.addEventListener("new-log", handleNewLog);
    window.addEventListener("new-network-request", handleNewNetworkRequest);
    window.addEventListener("network-request-updated", handleNetworkRequestUpdated);
    window.addEventListener("new-resource", handleNewResource);

    return () => {
      window.removeEventListener("new-log", handleNewLog);
      window.removeEventListener("new-network-request", handleNewNetworkRequest);
      window.removeEventListener("network-request-updated", handleNetworkRequestUpdated);
      window.removeEventListener("new-resource", handleNewResource);
      performanceUtils.destroy();
      networkMonitor.destroy();
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
