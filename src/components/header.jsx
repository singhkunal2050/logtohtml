import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { logFilters } from "../configs.js";
import { devtoolsStore } from "../store/devtoolsStore.js";
import { searchFilter } from "../utils/searchFilter.js";

export default function Header({
  activeTab,
  setActiveTab,
  clearLogs,
  filter,
  setFilter,
  search,
  setSearch,
}) {
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const debouncedSearch = searchFilter.debounce((searchTerm) => {
    setSearch(searchTerm);
  }, 300);

  // Get search suggestions
  useEffect(() => {
    if (search && search.length >= 2) {
      const logs = consoleOverride?.getLogs() || [];
      const suggestions = searchFilter.getSearchSuggestions(logs, search);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search]);
  return (
    <div id="log-window-header">
      <div id="log-window-sections">
        <div
          className="log-window-section-tab"
          data-tab="console"
          data-active={activeTab === "console"}
          onClick={() => {
            setActiveTab("console");
            devtoolsStore.setState({ activeTab: "console" });
          }}
        >
          Console
        </div>
        <div
          className="log-window-section-tab"
          data-tab="network"
          data-active={activeTab === "network"}
          onClick={() => {
            setActiveTab("network");
            devtoolsStore.setState({ activeTab: "network" });
          }}
        >
          Network
        </div>
        <div
          className="log-window-section-tab"
          data-tab="performance"
          data-active={activeTab === "performance"}
          onClick={() => {
            setActiveTab("performance");
            devtoolsStore.setState({ activeTab: "performance" });
          }}
        >
          Performance
        </div>
        <div
          className="log-window-section-tab"
          data-tab="elements"
          data-active={activeTab === "elements"}
          onClick={() => {
            setActiveTab("elements");
            devtoolsStore.setState({ activeTab: "elements" });
          }}
        >
          Elements
        </div>
        <div
          className="log-window-section-tab"
          data-tab="storage"
          data-active={activeTab === "storage"}
          onClick={() => {
            setActiveTab("storage");
            devtoolsStore.setState({ activeTab: "storage" });
          }}
        >
          Storage
        </div>
        <div
          className="log-window-section-tab"
          data-tab="application"
          data-active={activeTab === "application"}
          onClick={() => {
            setActiveTab("application");
            devtoolsStore.setState({ activeTab: "application" });
          }}
        >
          Application
        </div>
        <div
          className="log-window-section-tab"
          data-tab="security"
          data-active={activeTab === "security"}
          onClick={() => {
            setActiveTab("security");
            devtoolsStore.setState({ activeTab: "security" });
          }}
        >
          Security
        </div>
      </div>

      <div id="filter-section"  >
        <select
          id="log-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {logFilters.map((log) => {
            return <option value={log}>{log.toLocaleUpperCase()}</option>;
          })}
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

        <div class="search-container" style={{ position: 'relative', display: 'flex'}}>
          <input
            id="log-search"
            placeholder="Search..."
            value={search}
            onInput={(e) => debouncedSearch(e.target.value)}
            onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div class="search-suggestions" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#2a2a2a',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  class="suggestion-item"
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: '#cccccc'
                  }}
                  onClick={() => {
                    setSearch(suggestion);
                    setShowSuggestions(false);
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#3c3c3c'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
