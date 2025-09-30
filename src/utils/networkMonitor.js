// Comprehensive Network Monitoring - Chrome DevTools Style
export class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.resources = [];
    this.isRecording = true;
    this.originalFetch = window.fetch;
    this.originalXHR = window.XMLHttpRequest;
    this.performanceObserver = null;
    
    this.init();
  }

  init() {
    this.overrideFetch();
    this.overrideXHR();
    this.setupPerformanceObserver();
  }

  overrideFetch() {
    const self = this;
    const originalFetch = this.originalFetch;
    
    // Create a proper function that preserves the this context
    const fetchWrapper = async function(...args) {
      if (!self.isRecording) return originalFetch.apply(this, args);
      
      const [resource, config] = args;
      const requestId = self.generateRequestId();
      const startTime = performance.now();
      const startTimestamp = Date.now();
      
      const request = {
        id: requestId,
        url: resource,
        method: config?.method || 'GET',
        requestHeaders: config?.headers || {},
        requestBody: config?.body || null,
        startTime,
        startTimestamp,
        type: 'fetch',
        status: 'pending'
      };
      
      self.addRequest(request);
      
      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Clone response to read body
        const clonedResponse = response.clone();
        let responseBody = '';
        let responseSize = 0;
        
        try {
          responseBody = await clonedResponse.text();
          responseSize = new Blob([responseBody]).size;
        } catch (e) {
          responseBody = '[Unable to read response body]';
        }
        
        const updatedRequest = {
          ...request,
          status: response.status,
          statusText: response.statusText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody,
          responseSize,
          duration: Math.round(duration),
          endTime,
          endTimestamp: Date.now(),
          success: response.ok,
          type: self.getRequestType(resource, response.headers)
        };
        
        self.updateRequest(updatedRequest);
        return response;
        
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const failedRequest = {
          ...request,
          status: 0,
          statusText: 'Failed',
          responseBody: error.message,
          duration: Math.round(duration),
          endTime,
          endTimestamp: Date.now(),
          success: false,
          error: true,
          type: self.getRequestType(resource, {})
        };
        
        self.updateRequest(failedRequest);
        throw error;
      }
    };
    
    // Preserve the original fetch properties
    Object.setPrototypeOf(fetchWrapper, originalFetch);
    Object.defineProperty(fetchWrapper, 'name', { value: 'fetch', configurable: true });
    
    window.fetch = fetchWrapper;
  }

  overrideXHR() {
    const self = this;
    const originalXHR = window.XMLHttpRequest;
    
    // Create a proper constructor function
    function XHRWrapper() {
      const xhr = new originalXHR();
      const requestId = self.generateRequestId();
      const startTime = performance.now();
      const startTimestamp = Date.now();
      
      let request = {
        id: requestId,
        url: '',
        method: 'GET',
        requestHeaders: {},
        requestBody: null,
        startTime,
        startTimestamp,
        type: 'xhr',
        status: 'pending'
      };
      
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      const originalSetRequestHeader = xhr.setRequestHeader;
      
      xhr.open = function(method, url, async, user, password) {
        request.url = url;
        request.method = method;
        return originalOpen.apply(this, arguments);
      };
      
      xhr.setRequestHeader = function(header, value) {
        request.requestHeaders[header] = value;
        return originalSetRequestHeader.apply(this, arguments);
      };
      
      xhr.send = function(data) {
        if (self.isRecording) {
          request.requestBody = data;
          self.addRequest(request);
        }
        
        xhr.addEventListener('load', function() {
          if (!self.isRecording) return;
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          const updatedRequest = {
            ...request,
            status: xhr.status,
            statusText: xhr.statusText,
            responseHeaders: self.parseXHRHeaders(xhr.getAllResponseHeaders()),
            responseBody: xhr.responseText,
            responseSize: xhr.responseText.length,
            duration: Math.round(duration),
            endTime,
            endTimestamp: Date.now(),
            success: xhr.status >= 200 && xhr.status < 300,
            type: self.getRequestType(request.url, {})
          };
          
          self.updateRequest(updatedRequest);
        });
        
        xhr.addEventListener('error', function() {
          if (!self.isRecording) return;
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          const failedRequest = {
            ...request,
            status: 0,
            statusText: 'Failed',
            responseBody: 'Network error',
            duration: Math.round(duration),
            endTime,
            endTimestamp: Date.now(),
            success: false,
            error: true,
            type: self.getRequestType(request.url, {})
          };
          
          self.updateRequest(failedRequest);
        });
        
        return originalSend.apply(this, arguments);
      };
      
      return xhr;
    }
    
    // Preserve the original XMLHttpRequest properties
    Object.setPrototypeOf(XHRWrapper, originalXHR);
    Object.defineProperty(XHRWrapper, 'name', { value: 'XMLHttpRequest', configurable: true });
    
    // Copy static properties
    Object.getOwnPropertyNames(originalXHR).forEach(prop => {
      if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
        try {
          Object.defineProperty(XHRWrapper, prop, Object.getOwnPropertyDescriptor(originalXHR, prop));
        } catch (e) {
          // Ignore properties that can't be copied
        }
      }
    });
    
    window.XMLHttpRequest = XHRWrapper;
  }

  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.addResourceEntry(entry);
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('PerformanceObserver not supported');
    }
  }

  addResourceEntry(entry) {
    if (!this.isRecording) return;
    
    const resource = {
      id: this.generateRequestId(),
      name: entry.name,
      type: entry.initiatorType,
      duration: Math.round(entry.duration),
      size: entry.transferSize || 0,
      startTime: Math.round(entry.startTime),
      endTime: Math.round(entry.startTime + entry.duration),
      timestamp: Date.now(),
      success: entry.transferSize > 0
    };
    
    this.resources.push(resource);
    this.dispatchEvent('new-resource', resource);
  }

  getRequestType(url, headers) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const contentType = headers['content-type'] || headers['Content-Type'] || '';
    
    if (pathname.endsWith('.js') || contentType.includes('javascript')) return 'script';
    if (pathname.endsWith('.css') || contentType.includes('text/css')) return 'stylesheet';
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) return 'image';
    if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (contentType.includes('application/json')) return 'xhr';
    if (contentType.includes('text/html')) return 'document';
    if (contentType.includes('video/')) return 'media';
    
    return 'other';
  }

  parseXHRHeaders(headersString) {
    const headers = {};
    if (!headersString) return headers;
    
    headersString.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0]] = parts[1];
      }
    });
    
    return headers;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addRequest(request) {
    this.requests.push(request);
    this.dispatchEvent('new-network-request', request);
  }

  updateRequest(updatedRequest) {
    const index = this.requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
      this.requests[index] = updatedRequest;
      this.dispatchEvent('network-request-updated', updatedRequest);
    }
  }

  dispatchEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  getRequests() {
    return [...this.requests];
  }

  getResources() {
    return [...this.resources];
  }

  clearRequests() {
    this.requests = [];
    this.resources = [];
    this.dispatchEvent('network-cleared');
  }

  setRecording(recording) {
    this.isRecording = recording;
  }

  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // Restore original methods
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXHR;
  }
}

// Create singleton instance
export const networkMonitor = new NetworkMonitor();
