import { h } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
import { networkMonitor } from "../utils/networkMonitor.js";
import { searchFilter } from "../utils/searchFilter.js";

export default function NetworkTab({ filter, search }) {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedRequests, setExpandedRequests] = useState(new Set());
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Initialize network monitoring
    networkMonitor.init();
    
    // Set initial data
    setRequests(networkMonitor.getRequests());
    setResources(networkMonitor.getResources());

    // Listen for network events
    const handleNewRequest = (event) => {
      setRequests(networkMonitor.getRequests());
    };

    const handleRequestUpdate = (event) => {
      setRequests(networkMonitor.getRequests());
    };

    const handleNewResource = (event) => {
      setResources(networkMonitor.getResources());
    };

    const handleNetworkCleared = () => {
      setRequests([]);
      setResources([]);
    };

    window.addEventListener('new-network-request', handleNewRequest);
    window.addEventListener('network-request-updated', handleRequestUpdate);
    window.addEventListener('new-resource', handleNewResource);
    window.addEventListener('network-cleared', handleNetworkCleared);

    return () => {
      window.removeEventListener('new-network-request', handleNewRequest);
      window.removeEventListener('network-request-updated', handleRequestUpdate);
      window.removeEventListener('new-resource', handleNewResource);
      window.removeEventListener('network-cleared', handleNetworkCleared);
    };
  }, []);

  // Apply filters and search
  const filteredRequests = useMemo(() => {
    if (requests.length === 0) return [];
    
    let filtered = requests;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(req => req.type === filter);
    }
    
    // Apply search
    if (search && search.trim() !== '') {
      filtered = filtered.filter(req => 
        req.url.toLowerCase().includes(search.toLowerCase()) ||
        req.method.toLowerCase().includes(search.toLowerCase()) ||
        (req.statusText && req.statusText.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sort requests
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'startTime') {
        aValue = a.startTimestamp || 0;
        bValue = b.startTimestamp || 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [requests, filter, search, sortBy, sortOrder]);

  const toggleRequestExpansion = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return '#4caf50'; // Green
    if (status >= 300 && status < 400) return '#ff9800'; // Orange
    if (status >= 400 && status < 500) return '#f44336'; // Red
    if (status >= 500) return '#e91e63'; // Dark red
    if (status === 0) return '#9e9e9e'; // Gray
    return '#9e9e9e';
  };

  const getTypeIcon = (type) => {
    const icons = {
      document: '📄',
      script: '📜',
      stylesheet: '🎨',
      image: '🖼️',
      font: '🔤',
      xhr: '📡',
      fetch: '📡',
      websocket: '🔌',
      media: '🎬',
      other: '📦'
    };
    return icons[type] || icons.other;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
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

  const renderRequestDetails = (request) => {
    if (!expandedRequests.has(request.id)) return null;

    return (
      <div class="network-request-details">
        <div class="network-detail-section">
          <h4>Request Headers</h4>
          <div class="headers-list">
            {Object.entries(request.requestHeaders || {}).map(([key, value]) => (
              <div key={key} class="header-item">
                <span class="header-name">{key}:</span>
                <span class="header-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div class="network-detail-section">
          <h4>Response Headers</h4>
          <div class="headers-list">
            {Object.entries(request.responseHeaders || {}).map(([key, value]) => (
              <div key={key} class="header-item">
                <span class="header-name">{key}:</span>
                <span class="header-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {request.requestBody && (
          <div class="network-detail-section">
            <h4>Request Payload</h4>
            <pre class="payload-content">{request.requestBody}</pre>
          </div>
        )}

        {request.responseBody && (
          <div class="network-detail-section">
            <h4>Response</h4>
            <pre class="payload-content">{request.responseBody}</pre>
          </div>
        )}

        <div class="network-detail-section">
          <h4>Timing</h4>
          <div class="timing-info">
            <div class="timing-item">
              <span class="timing-label">Duration:</span>
              <span class="timing-value">{formatDuration(request.duration)}</span>
            </div>
            <div class="timing-item">
              <span class="timing-label">Start Time:</span>
              <span class="timing-value">{formatTimestamp(request.startTimestamp)}</span>
            </div>
            <div class="timing-item">
              <span class="timing-label">End Time:</span>
              <span class="timing-value">{formatTimestamp(request.endTimestamp)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRequestRow = (item) => {
    const isExpanded = expandedRequests.has(item.id);
    const statusColor = getStatusColor(item.status);
    const typeIcon = getTypeIcon(item.type);

    // Handle both requests and resources
    const displayUrl = item.url || item.name;
    const displayMethod = item.method || (item.itemType === 'resource' ? 'GET' : '');
    const displayStatus = item.status || (item.success ? 200 : 0);
    const displayStatusText = item.statusText || (item.success ? 'OK' : 'Failed');
    const displayDuration = item.duration || 0;
    const displaySize = item.responseSize || item.size || 0;

    return (
      <div 
        key={item.id} 
        class={`network-request-row ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setSelectedRequest(item)}
      >
        <div class="network-request-main">
          <div class="network-request-info">
            <span class="request-type-icon">{typeIcon}</span>
            <span class="request-method">{displayMethod}</span>
            <span class="request-url">{displayUrl}</span>
            <span class="request-status" style={{ color: statusColor }}>
              {displayStatus} {displayStatusText}
            </span>
          </div>
          <div class="network-request-meta">
            <span class="request-duration">{formatDuration(displayDuration)}</span>
            <span class="request-size">{formatSize(displaySize)}</span>
            <button 
              class="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleRequestExpansion(item.id);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        {renderRequestDetails(item)}
      </div>
    );
  };

  // Combine requests and resources for display
  const allNetworkItems = useMemo(() => {
    const combined = [
      ...requests.map(req => ({ ...req, itemType: 'request' })),
      ...resources.map(res => ({ ...res, itemType: 'resource' }))
    ];
    
    // Sort combined items
    return combined.sort((a, b) => {
      let aValue = a[sortBy] || a.startTime || 0;
      let bValue = b[sortBy] || b.startTime || 0;
      
      if (sortBy === 'startTime') {
        aValue = a.startTimestamp || a.startTime || 0;
        bValue = b.startTimestamp || b.startTime || 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [requests, resources, sortBy, sortOrder]);

  // Apply filters to combined items
  const filteredItems = useMemo(() => {
    if (allNetworkItems.length === 0) return [];
    
    let filtered = allNetworkItems;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.type === filter);
    }
    
    // Apply search
    if (search && search.trim() !== '') {
      filtered = filtered.filter(item => 
        item.url?.toLowerCase().includes(search.toLowerCase()) ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.method?.toLowerCase().includes(search.toLowerCase()) ||
        (item.statusText && item.statusText.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    return filtered;
  }, [allNetworkItems, filter, search]);

  return (
    <div id="network-tab" class="network-tab">
      <div class="network-header">
        <div class="network-controls">
          <div class="network-filters">
            <select 
              value={filter} 
              onChange={(e) => {/* Handle filter change */}}
              class="network-filter-select"
            >
              <option value="all">All</option>
              <option value="document">Document</option>
              <option value="script">Script</option>
              <option value="stylesheet">Stylesheet</option>
              <option value="image">Image</option>
              <option value="font">Font</option>
              <option value="xhr">XHR</option>
              <option value="fetch">Fetch</option>
              <option value="websocket">WebSocket</option>
              <option value="media">Media</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="network-sort">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              class="network-sort-select"
            >
              <option value="startTime">Start Time</option>
              <option value="duration">Duration</option>
              <option value="method">Method</option>
              <option value="status">Status</option>
              <option value="type">Type</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              class="sort-order-button"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div class="network-requests">
        {filteredItems.length === 0 ? (
          <div class="network-empty">
            No network requests recorded. Make some requests to see them here.
          </div>
        ) : (
          <div class="network-requests-list">
            {filteredItems.map(item => renderRequestRow(item))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div class="network-sidebar">
          <div class="network-sidebar-header">
            <h3>Request Details</h3>
            <button onClick={() => setSelectedRequest(null)}>×</button>
          </div>
          <div class="network-sidebar-content">
            <div class="sidebar-section">
              <h4>General</h4>
              <div class="sidebar-item">
                <span class="sidebar-label">URL:</span>
                <span class="sidebar-value">{selectedRequest.url}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Method:</span>
                <span class="sidebar-value">{selectedRequest.method}</span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Status:</span>
                <span class="sidebar-value" style={{ color: getStatusColor(selectedRequest.status) }}>
                  {selectedRequest.status} {selectedRequest.statusText}
                </span>
              </div>
              <div class="sidebar-item">
                <span class="sidebar-label">Type:</span>
                <span class="sidebar-value">{selectedRequest.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
