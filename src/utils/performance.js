export const performanceUtils = {
  memoryInfo: null,
  performanceMetrics: [],
  observers: new Map(),

  init() {
    this.startMemoryMonitoring();
    this.startPerformanceMonitoring();
    this.startFrameRateMonitoring();
    this.startNavigationTiming();
  },

  startMemoryMonitoring() {
    if ('memory' in performance) {
      this.memoryInfo = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      // Update memory info every 5 seconds
      setInterval(() => {
        this.memoryInfo = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        window.dispatchEvent(new CustomEvent('memory-update', { 
          detail: this.memoryInfo 
        }));
      }, 5000);
    }
  },

  startPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const metric = {
            type: 'long-task',
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
          };
          
          this.performanceMetrics.push(metric);
          window.dispatchEvent(new CustomEvent('performance-metric', { 
            detail: metric 
          }));
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longTask', longTaskObserver);
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }
    }
  },

  startFrameRateMonitoring() {
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        const metric = {
          type: 'fps',
          value: fps,
          timestamp: Date.now()
        };
        
        this.performanceMetrics.push(metric);
        window.dispatchEvent(new CustomEvent('fps-update', { 
          detail: metric 
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  },

  startNavigationTiming() {
    // Get navigation timing data
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const timing = {
        type: 'navigation',
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.navigationStart,
        timestamp: Date.now()
      };
      
      this.performanceMetrics.push(timing);
      window.dispatchEvent(new CustomEvent('navigation-timing', { 
        detail: timing 
      }));
    }
  },

  getMemoryUsage() {
    if (this.memoryInfo) {
      return {
        used: this.formatBytes(this.memoryInfo.usedJSHeapSize),
        total: this.formatBytes(this.memoryInfo.totalJSHeapSize),
        limit: this.formatBytes(this.memoryInfo.jsHeapSizeLimit),
        percentage: Math.round((this.memoryInfo.usedJSHeapSize / this.memoryInfo.jsHeapSizeLimit) * 100)
      };
    }
    return null;
  },

  getPerformanceMetrics() {
    return this.performanceMetrics.slice(-50); // Last 50 metrics
  },

  getNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart
    };
  },

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatTime(ms) {
    if (ms < 1000) return ms.toFixed(2) + 'ms';
    return (ms / 1000).toFixed(2) + 's';
  },

  clearMetrics() {
    this.performanceMetrics = [];
    window.dispatchEvent(new CustomEvent('metrics-cleared'));
  },

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
};
