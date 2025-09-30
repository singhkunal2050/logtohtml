import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { performanceUtils } from "../utils/performance.js";

export default function PerformanceTab() {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [navigationTiming, setNavigationTiming] = useState(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    // Initialize performance monitoring
    performanceUtils.init();
    
    // Set initial data
    setMemoryInfo(performanceUtils.getMemoryUsage());
    setPerformanceMetrics(performanceUtils.getPerformanceMetrics());
    setNavigationTiming(performanceUtils.getNavigationTiming());

    // Listen for updates
    const handleMemoryUpdate = (event) => {
      setMemoryInfo(performanceUtils.getMemoryUsage());
    };

    const handlePerformanceMetric = (event) => {
      setPerformanceMetrics(performanceUtils.getPerformanceMetrics());
    };

    const handleFpsUpdate = (event) => {
      setFps(event.detail.value);
    };

    const handleNavigationTiming = (event) => {
      setNavigationTiming(event.detail);
    };

    window.addEventListener('memory-update', handleMemoryUpdate);
    window.addEventListener('performance-metric', handlePerformanceMetric);
    window.addEventListener('fps-update', handleFpsUpdate);
    window.addEventListener('navigation-timing', handleNavigationTiming);

    return () => {
      window.removeEventListener('memory-update', handleMemoryUpdate);
      window.removeEventListener('performance-metric', handlePerformanceMetric);
      window.removeEventListener('fps-update', handleFpsUpdate);
      window.removeEventListener('navigation-timing', handleNavigationTiming);
      performanceUtils.destroy();
    };
  }, []);

  const clearMetrics = () => {
    performanceUtils.clearMetrics();
    setPerformanceMetrics([]);
  };

  const getFpsColor = (fps) => {
    if (fps >= 55) return '#4CAF50'; // Green
    if (fps >= 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div id="performance-tab" class="performance-tab">
      <div class="performance-header">
        <h3>Performance Monitor</h3>
        <button onClick={clearMetrics} class="clear-button">
          Clear Metrics
        </button>
      </div>

      {/* Memory Usage */}
      {memoryInfo && (
        <div class="performance-section">
          <h4>Memory Usage</h4>
          <div class="memory-info">
            <div class="memory-item">
              <span class="label">Used:</span>
              <span class="value">{memoryInfo.used}</span>
            </div>
            <div class="memory-item">
              <span class="label">Total:</span>
              <span class="value">{memoryInfo.total}</span>
            </div>
            <div class="memory-item">
              <span class="label">Limit:</span>
              <span class="value">{memoryInfo.limit}</span>
            </div>
            <div class="memory-progress">
              <div 
                class="memory-bar" 
                style={{
                  width: `${memoryInfo.percentage}%`,
                  backgroundColor: memoryInfo.percentage > 80 ? '#F44336' : '#4CAF50'
                }}
              ></div>
              <span class="percentage">{memoryInfo.percentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* FPS Monitor */}
      <div class="performance-section">
        <h4>Frame Rate</h4>
        <div class="fps-display">
          <div 
            class="fps-value" 
            style={{ color: getFpsColor(fps) }}
          >
            {fps} FPS
          </div>
        </div>
      </div>

      {/* Navigation Timing */}
      {navigationTiming && (
        <div class="performance-section">
          <h4>Page Load Timing</h4>
          <div class="timing-info">
            <div class="timing-item">
              <span class="label">DNS Lookup:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.dns)}</span>
            </div>
            <div class="timing-item">
              <span class="label">TCP Connection:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.tcp)}</span>
            </div>
            <div class="timing-item">
              <span class="label">Request:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.request)}</span>
            </div>
            <div class="timing-item">
              <span class="label">Response:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.response)}</span>
            </div>
            <div class="timing-item">
              <span class="label">DOM Ready:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.dom)}</span>
            </div>
            <div class="timing-item">
              <span class="label">Load Complete:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.load)}</span>
            </div>
            <div class="timing-item total">
              <span class="label">Total:</span>
              <span class="value">{performanceUtils.formatTime(navigationTiming.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div class="performance-section">
        <h4>Recent Metrics</h4>
        <div class="metrics-list">
          {performanceMetrics.slice(-10).map((metric, index) => (
            <div key={index} class="metric-item">
              <span class="metric-type">{metric.type}</span>
              {metric.duration && (
                <span class="metric-duration">
                  {performanceUtils.formatTime(metric.duration)}
                </span>
              )}
              {metric.value && (
                <span class="metric-value">{metric.value}</span>
              )}
              <span class="metric-time">
                {new Date(metric.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {performanceMetrics.length === 0 && (
            <div class="no-metrics">No performance metrics recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
