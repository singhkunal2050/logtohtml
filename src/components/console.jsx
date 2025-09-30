import { h } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import { consoleOverride } from "../utils/consoleOverride.js";
import { searchFilter } from "../utils/searchFilter.js";

export default function ConsoleTab({ filter, search }) {
  const [logs, setLogs] = useState([]);
  const [expandedObjects, setExpandedObjects] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    // Initialize console override
    consoleOverride.overrideAllMethods();
    
    // Set initial logs
    setLogs(consoleOverride.getLogs());

    // Listen for new logs
    const handleNewLog = (event) => {
      setLogs(consoleOverride.getLogs());
    };

    const handleConsoleCleared = () => {
      setLogs([]);
    };

    window.addEventListener('new-log', handleNewLog);
    window.addEventListener('console-cleared', handleConsoleCleared);

    return () => {
      window.removeEventListener('new-log', handleNewLog);
      window.removeEventListener('console-cleared', handleConsoleCleared);
    };
  }, []);

  // Apply robust filters and search with memoization
  const filteredLogs = useMemo(() => {
    if (logs.length === 0) return [];
    
    // Optimize for large volumes
    const optimizedLogs = searchFilter.optimizeForLargeVolumes(logs);
    
    // Apply filters and search
    return searchFilter.filterAndSearch(optimizedLogs, filter, search);
  }, [logs, filter, search]);

  const toggleObjectExpansion = (index) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedObjects(newExpanded);
  };

  const toggleGroupExpansion = (groupIndex) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  const getLogIcon = (type, level) => {
    const iconMap = {
      log: '📝',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
      group: '📁',
      groupCollapsed: '📁',
      groupEnd: '📁',
      table: '📊',
      trace: '🔍',
      assert: '🚫',
      count: '🔢',
      time: '⏱️',
      timeEnd: '⏱️',
      timeLog: '⏱️',
      dir: '📂',
      dirxml: '🌐'
    };
    
    return iconMap[type] || iconMap[level] || '📝';
  };

  const getLogColor = (type, level) => {
    const colorMap = {
      log: '#ffffff',
      info: '#4fc3f7',
      warn: '#ffb74d',
      error: '#f44336',
      debug: '#9c27b0',
      group: '#81c784',
      table: '#64b5f6',
      trace: '#ff9800',
      assert: '#e91e63',
      count: '#9c27b0',
      time: '#4caf50',
      timeEnd: '#4caf50',
      timeLog: '#4caf50',
      dir: '#607d8b',
      dirxml: '#795548'
    };
    
    return colorMap[type] || colorMap[level] || '#ffffff';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const renderObject = (obj, depth = 0) => {
    if (depth > 3) return '...';
    
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return `"${obj}"`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (typeof obj === 'function') return `function ${obj.name || 'anonymous'}()`;
    if (obj instanceof Error) return obj.toString();
    
    if (Array.isArray(obj)) {
      return `Array(${obj.length}) [${obj.slice(0, 5).map(item => renderObject(item, depth + 1)).join(', ')}${obj.length > 5 ? '...' : ''}]`;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      return `Object {${keys.slice(0, 5).map(key => `${key}: ${renderObject(obj[key], depth + 1)}`).join(', ')}${keys.length > 5 ? '...' : ''}}`;
    }
    
    return String(obj);
  };

  const renderTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div class="table-empty">Empty table</div>;
    }

    const columns = Object.keys(data[0] || {});
    
    return (
      <div class="console-table">
        <table>
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((row, index) => (
              <tr key={index}>
                {columns.map(col => (
                  <td key={col}>{renderObject(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 10 && (
          <div class="table-more">... and {data.length - 10} more rows</div>
        )}
      </div>
    );
  };

  const renderStackTrace = (stack) => {
    if (!stack || stack.length === 0) return null;
    
    return (
      <div class="stack-trace">
        <div class="stack-header">Stack trace:</div>
        {stack.map((frame, index) => (
          <div key={index} class="stack-frame">
            {frame}
          </div>
        ))}
      </div>
    );
  };

  const renderLogEntry = (log, index) => {
    const isExpanded = expandedObjects.has(index);
    const icon = getLogIcon(log.type, log.level);
    
    return (
      <div 
        key={index} 
        class="console-entry"
        style={{ 
          marginLeft: `${(log.groupLevel || 0) * 20}px`
        }}
        data-level={log.level}
      >
        <div class="console-entry-header">
          <span class="console-icon">{icon}</span>
          <span class="console-timestamp">{formatTimestamp(log.timestamp)}</span>
          <span class="console-level">{log.level?.toUpperCase() || log.type?.toUpperCase()}</span>
          <span class="console-message">
            {log.message}
          </span>
        </div>

        {/* Object details - only show for objects and complex types */}
        {log.args && log.args.length > 0 && log.args.some(arg => 
          (typeof arg === 'object' && arg !== null) || 
          Array.isArray(arg) || 
          typeof arg === 'function'
        ) && (
          <div class="console-args">
            {log.args.map((arg, argIndex) => (
              <div key={argIndex} class="console-arg">
                {typeof arg === 'object' && arg !== null ? (
                  <div>
                    <button 
                      class="expand-button"
                      onClick={() => toggleObjectExpansion(`${index}-${argIndex}`)}
                    >
                      {expandedObjects.has(`${index}-${argIndex}`) ? '▼' : '▶'}
                    </button>
                    <span class="object-preview">{renderObject(arg)}</span>
                    {expandedObjects.has(`${index}-${argIndex}`) && (
                      <pre class="object-details">
                        {JSON.stringify(arg, null, 2)}
                      </pre>
                    )}
                  </div>
                ) : (
                  <span>{renderObject(arg)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Table rendering */}
        {log.type === 'table' && renderTable(log.data)}

        {/* Stack trace */}
        {log.type === 'trace' && renderStackTrace(log.stack)}

        {/* Assertion failure */}
        {log.type === 'assert' && log.failed && (
          <div class="assert-failure">
            <strong>Assertion failed:</strong> {log.message}
          </div>
        )}

        {/* Count display */}
        {log.type === 'count' && (
          <div class="count-display">
            <strong>{log.label}:</strong> {log.count}
          </div>
        )}

        {/* Timer display */}
        {(log.type === 'timeEnd' || log.type === 'timeLog') && (
          <div class="timer-display">
            <strong>{log.label}:</strong> {log.duration?.toFixed(2)}ms
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="console-tab" class="console-tab">
      <div class="console-logs">
        {filteredLogs.map((log, index) => renderLogEntry(log, index))}
      </div>
    </div>
  );
}
