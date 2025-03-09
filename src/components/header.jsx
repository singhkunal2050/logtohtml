import { h } from "preact";

export default function Header({
  activeTab,
  setActiveTab,
  clearLogs,
  filter,
  setFilter,
  search,
  setSearch,
}) {
  return (
    <div id="log-window-header">
      <div id="log-window-sections">
        <div
          className="log-window-section-tab"
          data-tab="console"
          data-active={activeTab === "console"}
          onClick={() => setActiveTab("console")}
        >
          Console
        </div>
        <div
          className="log-window-section-tab"
          data-tab="network"
          data-active={activeTab === "network"}
          onClick={() => setActiveTab("network")}
        >
          Network
        </div>
      </div>

      <div id="filter-section">
        <select
          id="log-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">ALL</option>
          <option value="log">LOG</option>
          <option value="debug">DEBUG</option>
          <option value="error">ERROR</option>
          <option value="warn">WARN</option>
        </select>

        <div id="clear-logs" onClick={clearLogs}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="#6b6b6b"
              stroke-width="2"
              d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M5,5 L19,19"
            ></path>
          </svg>
        </div>

        <input
          id="log-search"
          placeholder="Search..."
          value={search}
          onInput={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
