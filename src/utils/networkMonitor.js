// Comprehensive Network Monitoring - Chrome DevTools Style
export class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.resources = [];
    this.isRecording = true;
    this.installed = false;
    this.maxEntries = 500;
    this.maxBodySize = 50 * 1024;
    this.originalFetch = null;
    this.originalXHR = null;
    this.performanceObserver = null;
  }

  // Patch fetch/XHR and start observing resources. Safe to call more than once.
  install() {
    if (this.installed) return;
    this.originalFetch = window.fetch;
    this.originalXHR = window.XMLHttpRequest;
    this.captureExistingEntries();
    if (this.originalFetch) this.overrideFetch();
    if (this.originalXHR) this.overrideXHR();
    this.setupPerformanceObserver();
    this.installed = true;
  }

  init() {
    this.install();
  }

  captureExistingEntries() {
    // Get all existing performance entries
    if (performance.getEntriesByType) {
      const resourceEntries = performance.getEntriesByType('resource');
      
      resourceEntries.forEach(entry => {
        const resource = {
          id: `existing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: entry.name,
          type: entry.initiatorType,
          duration: Math.round(entry.duration),
          size: entry.transferSize || 0,
          startTime: Math.round(entry.startTime),
          endTime: Math.round(entry.startTime + entry.duration),
          timestamp: Date.now(),
          success: entry.transferSize > 0,
          isExisting: true
        };
        
        this.pushCapped(this.resources, resource);
      });
    }
  }

  // Normalise fetch() arguments: input may be a string, URL or Request
  describeFetch(input, init) {
    const isRequest = typeof Request !== 'undefined' && input instanceof Request;
    const url = this.resolveUrl(isRequest ? input.url : input);
    const method = (init?.method || (isRequest ? input.method : null) || 'GET').toUpperCase();
    const headers = init?.headers || (isRequest ? input.headers : null) || {};
    return {
      url,
      method,
      requestHeaders: this.headersToObject(headers),
      requestBody: init?.body ?? null
    };
  }

  resolveUrl(url) {
    try {
      return new URL(String(url), window.location.href).href;
    } catch (e) {
      return String(url);
    }
  }

  headersToObject(headers) {
    try {
      if (typeof headers.forEach === 'function' && !Array.isArray(headers)) {
        const out = {};
        headers.forEach((value, key) => { out[key] = value; });
        return out;
      }
      if (Array.isArray(headers)) return Object.fromEntries(headers);
      return { ...headers };
    } catch (e) {
      return {};
    }
  }

  // Only buffer bodies we can show as text; never read event streams or binary
  shouldReadBody(contentType) {
    if (!contentType) return true;
    if (contentType.includes('text/event-stream')) return false;
    return /^(text\/|application\/(json|xml|javascript|x-www-form-urlencoded)|[^;]*\+(json|xml))/.test(contentType);
  }

  truncateBody(body) {
    if (typeof body !== 'string' || body.length <= this.maxBodySize) return body;
    return body.slice(0, this.maxBodySize) + `\n… [truncated, ${body.length} chars total]`;
  }

  overrideFetch() {
    const self = this;
    const originalFetch = this.originalFetch;

    const fetchWrapper = function(...args) {
      if (!self.isRecording) return originalFetch.apply(this, args);

      // Recording must never break the page's own request
      let request = null;
      try {
        request = {
          id: self.generateRequestId(),
          ...self.describeFetch(args[0], args[1]),
          startTime: performance.now(),
          startTimestamp: Date.now(),
          type: 'fetch',
          status: 'pending'
        };
        self.addRequest(request);
      } catch (e) {
        request = null;
      }

      const result = originalFetch.apply(this, args);
      if (!request) return result;

      return result.then(
        (response) => {
          try {
            self.recordFetchResponse(request, response);
          } catch (e) {}
          return response;
        },
        (error) => {
          try {
            self.updateRequest({
              ...request,
              status: 0,
              statusText: 'Failed',
              responseBody: error?.message ?? String(error),
              duration: Math.round(performance.now() - request.startTime),
              endTimestamp: Date.now(),
              success: false,
              error: true,
              type: self.getRequestType(request.url, {})
            });
          } catch (e) {}
          throw error;
        }
      );
    };

    Object.setPrototypeOf(fetchWrapper, originalFetch);
    Object.defineProperty(fetchWrapper, 'name', { value: 'fetch', configurable: true });

    window.fetch = fetchWrapper;
  }

  // Record status immediately; read the body in the background so the page
  // gets its Response without waiting (streams and SSE would never finish)
  recordFetchResponse(request, response) {
    const endTime = performance.now();
    const responseHeaders = this.headersToObject(response.headers);
    const contentType = responseHeaders['content-type'] || '';
    const completed = {
      ...request,
      status: response.status,
      statusText: response.statusText,
      responseHeaders,
      responseBody: '',
      responseSize: Number(responseHeaders['content-length']) || 0,
      duration: Math.round(endTime - request.startTime),
      endTime,
      endTimestamp: Date.now(),
      success: response.ok,
      type: this.getRequestType(request.url, responseHeaders)
    };
    this.updateRequest(completed);

    if (!this.shouldReadBody(contentType)) {
      this.updateRequest({ ...completed, responseBody: `[${contentType} body not captured]` });
      return;
    }

    response.clone().text().then(
      (body) => this.updateRequest({
        ...completed,
        responseBody: this.truncateBody(body),
        responseSize: completed.responseSize || body.length
      }),
      () => this.updateRequest({ ...completed, responseBody: '[Unable to read response body]' })
    );
  }

  overrideXHR() {
    const self = this;
    const originalXHR = this.originalXHR;
    
    // Create a proper constructor function
    function XHRWrapper() {
      const xhr = new originalXHR();
      const requestId = self.generateRequestId();
      let request = {
        id: requestId,
        url: '',
        method: 'GET',
        requestHeaders: {},
        requestBody: null,
        startTime: 0,
        startTimestamp: 0,
        type: 'xhr',
        status: 'pending'
      };
      
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      const originalSetRequestHeader = xhr.setRequestHeader;
      
      xhr.open = function(method, url) {
        request.url = self.resolveUrl(url);
        request.method = String(method).toUpperCase();
        return originalOpen.apply(this, arguments);
      };
      
      xhr.setRequestHeader = function(header, value) {
        request.requestHeaders[header] = value;
        return originalSetRequestHeader.apply(this, arguments);
      };
      
      xhr.send = function(data) {
        if (self.isRecording) {
          try {
            request.requestBody = data ?? null;
            request.startTime = performance.now();
            request.startTimestamp = Date.now();
            self.addRequest(request);
          } catch (e) {}
        }
        
        xhr.addEventListener('load', function() {
          if (!self.isRecording) return;
          try {
            const endTime = performance.now();
            // responseText throws unless responseType is '' or 'text'
            const isText = xhr.responseType === '' || xhr.responseType === 'text';
            const body = isText ? xhr.responseText : `[${xhr.responseType} response]`;
            const responseHeaders = self.parseXHRHeaders(xhr.getAllResponseHeaders());

            self.updateRequest({
              ...request,
              status: xhr.status,
              statusText: xhr.statusText,
              responseHeaders,
              responseBody: self.truncateBody(body),
              responseSize: isText ? body.length : 0,
              duration: Math.round(endTime - request.startTime),
              endTime,
              endTimestamp: Date.now(),
              success: xhr.status >= 200 && xhr.status < 300,
              type: self.getRequestType(request.url, responseHeaders)
            });
          } catch (e) {}
        });
        
        xhr.addEventListener('error', function() {
          if (!self.isRecording) return;
          try {
            const endTime = performance.now();
            self.updateRequest({
              ...request,
              status: 0,
              statusText: 'Failed',
              responseBody: 'Network error',
              duration: Math.round(endTime - request.startTime),
              endTime,
              endTimestamp: Date.now(),
              success: false,
              error: true,
              type: self.getRequestType(request.url, {})
            });
          } catch (e) {}
        });
        
        return originalSend.apply(this, arguments);
      };
      
      return xhr;
    }
    
    // Keep `instanceof XMLHttpRequest` and static constants working
    XHRWrapper.prototype = originalXHR.prototype;
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
    
    this.pushCapped(this.resources, resource);
    this.dispatchEvent('new-resource', resource);
  }

  getRequestType(url, headers) {
    let pathname = '';
    try {
      pathname = new URL(String(url), window.location.href).pathname.toLowerCase();
    } catch (e) {}
    const contentType = headers?.['content-type'] || headers?.['Content-Type'] || '';
    
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

  pushCapped(list, item) {
    list.push(item);
    if (list.length > this.maxEntries) list.splice(0, list.length - this.maxEntries);
  }

  addRequest(request) {
    this.pushCapped(this.requests, request);
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
    if (!this.installed) return;
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    // Restore original methods
    if (this.originalFetch) window.fetch = this.originalFetch;
    if (this.originalXHR) window.XMLHttpRequest = this.originalXHR;
    this.installed = false;
  }
}

// Singleton instance; nothing is patched until install() is called
export const networkMonitor = new NetworkMonitor();
