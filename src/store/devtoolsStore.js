// Simple state management for devtools
class DevToolsStore {
  constructor() {
    this.state = {
      selectedElement: null,
      isInspecting: false,
      activeTab: 'console',
      logs: [],
      networkRequests: [],
      performanceMetrics: [],
      settings: {
        theme: 'dark',
        fontSize: '12px',
        autoScroll: true
      }
    };
    
    this.listeners = new Map();
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Update state and notify listeners
  setState(updates) {
    this.state = { ...this.state, ...updates };
    
    // Notify listeners for specific keys
    Object.keys(updates).forEach(key => {
      this.listeners.get(key)?.forEach(callback => {
        callback(this.state[key]);
      });
    });
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Get specific state value
  get(key) {
    return this.state[key];
  }
}

// Create singleton instance
export const devtoolsStore = new DevToolsStore();
