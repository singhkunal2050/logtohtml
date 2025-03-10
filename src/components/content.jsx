import { h } from "preact";
import Fuse from "fuse.js";
import { logColors } from "../configs.js";

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
      {activeTab === "console" && (
        <div id="log-list">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              class="log-message"
              data-type={log.type}
              style={{ backgroundColor: logColors[log.type] || "transparent" }}
            >
              <div>
                [{log.timestamp}] [{log.type.toUpperCase()}] {log.message}
              </div>

              {/* Expandable details for objects */}
              {log.details.some(
                (arg) => typeof arg === "object" && arg !== null
              ) && (
                <details style={{ opacity: 0.8, marginTop: "5px" }}>
                  <summary>View Details ({log.type})</summary>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      color: "#ccc",
                      padding: "5px",
                    }}
                  >
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
