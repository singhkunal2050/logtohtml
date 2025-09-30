import { h } from "preact";
import Fuse from "fuse.js";
import { logColors } from "../configs.js";
import PerformanceTab from "./performance.jsx";
import ElementsTab from "./elements.jsx";
import ConsoleTab from "./console.jsx";

export default function LogContent({
  activeTab,
  logs,
  networkRequests,
  resources,
  filter,
  search,
}) {
  // Apply filter
  let filteredLogs =
    filter !== "all" ? logs.filter((log) => log.type === filter) : logs;

  // Fuse.js options for fuzzy search
  const fuseOptions = {
    keys: ["message", "details"], // Search within these fields
    threshold: 0.4, // Adjust fuzzy matching sensitivity (lower = stricter)
    ignoreLocation: true, // Search anywhere in the string
    includeMatches: false, // We just need the results
  };

  if (search.trim() !== "") {
    const fuse = new Fuse(filteredLogs, fuseOptions);
    filteredLogs = fuse.search(search).map((result) => result.item);
  }

  return (
    <div id="log-content">
      {activeTab === "console" && <ConsoleTab filter={filter} search={search} />}

      {activeTab === "network" && (
        <div id="network-list">
          {networkRequests.map((request, index) => (
            <div key={index} class="network-message">
              <div>
                <strong>
                  {request.method} {request.url}
                </strong>
                <span
                  style={{
                    color: request.status === 200 ? "green" : "red",
                    marginLeft: "10px",
                  }}
                >
                  {request.status} ({request.duration} ms)
                </span>
              </div>
              <details>
                <summary style={{ cursor: "pointer", color: "#007bff" }}>
                  Request Details
                </summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "#ccc",
                    padding: "5px",
                  }}
                >
                  {JSON.stringify(request, null, 2)}
                </pre>
              </details>
            </div>
          ))}
          {resources.map((resource, index) => (
            <div key={index} class="resource-message">
              <div>
                Resource
              </div>
              <div style={{display:"flex", gap: "10px"}}>
                <strong>{resource.name}</strong>
                <span>{resource.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "performance" && <PerformanceTab />}

      {activeTab === "elements" && <ElementsTab />}

      {activeTab === "storage" && (
        <div id="storage-tab">
          <div class="storage-placeholder">
            <h3>Storage Inspector</h3>
            <p>LocalStorage, SessionStorage, and Cookie inspection coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === "application" && (
        <div id="application-tab">
          <div class="application-placeholder">
            <h3>Application Tab</h3>
            <p>Service Workers, Manifest, and Cache inspection coming soon...</p>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div id="security-tab">
          <div class="security-placeholder">
            <h3>Security Tab</h3>
            <p>HTTPS status, certificates, and security headers inspection coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
