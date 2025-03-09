import { h } from "preact";

export default function LogContent({ activeTab, logs, networkRequests }) {
  return (
    <div id="log-content">
      {activeTab === "console" && (
        <div id="log-list">
          {logs.map((log, index) => (
            <div key={index} class="log-message" data-type="log" style={{ backgroundColor: "transparent" }}>
              <div>[{log.timestamp}] [LOG] {log.message}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "network" && (
        <div id="network-list">
          {networkRequests.map((request, index) => (
            <div key={index} class="network-message">
              <div>
                <strong>{request.method} {request.url}</strong>
                <span style={{ color: request.status === 200 ? "green" : "red" }}>
                  {request.status} ({request.duration} ms)
                </span>
              </div>
              <details>
                <summary>Request Details</summary>
                <pre>{JSON.stringify(request, null, 2)}</pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
