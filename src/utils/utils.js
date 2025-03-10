export const utils = {
  overrideConsole() {
    const logBuffer = [];

    const originalConsole = {
      log: console.log,
      debug: console.debug,
      error: console.error,
      warn: console.warn,
    };

    function logToBuffer(type, args) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        type,
        timestamp,
        details: args,
        message: args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
          .join(" "),
      };
      logBuffer.push(logEntry);
      window.dispatchEvent(new CustomEvent("new-log", { detail: logEntry })); // Emit event for live logs
    }

    console.log = (...args) => {
      originalConsole.log(...args);
      logToBuffer("log", args);
    };
    console.debug = (...args) => {
      originalConsole.debug(...args);
      logToBuffer("debug", args);
    };
    console.error = (...args) => {
      originalConsole.error(...args);
      logToBuffer("error", args);
    };
    console.warn = (...args) => {
      originalConsole.warn(...args);
      logToBuffer("warn", args);
    };

    window.__logBuffer = logBuffer; // Expose for debugging
  },

  overrideFetchXHR() {
    const networkBuffer = [];

    const originalFetch = window.fetch;

    function logNetworkRequest(entry) {
      networkBuffer.push(entry);
      window.dispatchEvent(
        new CustomEvent("new-network-log", { detail: entry })
      ); // Emit event for live updates
    }

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const method = config?.method || "GET";
      const body = config?.body || null;
      const headers = config?.headers || {};

      const startTime = performance.now();
      return originalFetch(...args)
        .then(async (response) => {
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          const clonedResponse = response.clone();
          const responseBody = await clonedResponse.text();

          const logEntry = {
            url: resource,
            method,
            requestBody: body,
            requestHeaders: headers,
            status: response.status,
            statusText: response.statusText,
            responseHeaders: Object.fromEntries(response.headers.entries()),
            responseBody,
            duration,
          };

          logNetworkRequest(logEntry);
          return response;
        })
        .catch((error) => {
          const logEntry = {
            url: resource,
            method,
            requestBody: body,
            requestHeaders: headers,
            status: "FAILED",
            responseBody: error.message,
          };

          logNetworkRequest(logEntry);
          throw error;
        });
    };

    const originalXHR = window.XMLHttpRequest;

    window.XMLHttpRequest = function () {
      const xhr = new originalXHR();
      const startTime = performance.now();
      let requestInfo = {};

      xhr.open = function (method, url) {
        requestInfo = { url, method };
        originalXHR.prototype.open.apply(this, arguments);
      };

      xhr.setRequestHeader = function (header, value) {
        if (!requestInfo.headers) requestInfo.headers = {};
        requestInfo.headers[header] = value;
        originalXHR.prototype.setRequestHeader.apply(this, arguments);
      };

      xhr.addEventListener("load", () => {
        const endTime = performance.now();
        requestInfo.duration = (endTime - startTime).toFixed(2);
        requestInfo.status = xhr.status;
        requestInfo.statusText = xhr.statusText;
        requestInfo.responseBody = xhr.responseText;

        logNetworkRequest(requestInfo);
      });

      return xhr;
    };

    window.__networkBuffer = networkBuffer; // Expose for debugging
  },

  overrideResourceMonitoring() {
    const resourceBuffer = [];
    console.log("Overriding resource monitoring");

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Ignore fetch & XHR (already logged separately)
        if (
          entry.entryType === "resource" &&
          entry.initiatorType !== "fetch" &&
          entry.initiatorType !== "xmlhttprequest"
        ) {
          const resourceEntry = {
            name: entry.name, // URL of the resource
            type: entry.initiatorType, // Type (script, img, css, etc.)
            duration: entry.duration.toFixed(2) + "ms", // Load time
            size:
              entry.transferSize > 0
                ? entry.transferSize + " bytes"
                : "unknown", // Response size
            startTime: entry.startTime.toFixed(2) + "ms", // Start time relative to page load
          };

          console.log("Resource Loaded:", resourceEntry);
          resourceBuffer.push(resourceEntry);
          window.dispatchEvent(
            new CustomEvent("new-resource", { detail: resourceEntry })
          ); // Emit event for UI updates
        }
      });
    });

    observer.observe({ type: "resource", buffered: true });

    window.__resourceBuffer = resourceBuffer; // Expose for debugging
  },

  getLogStatusColor(status) {
    const statusN = Number(status);
    if (statusN >= 200 && statusN < 300) {
      return "green";
    } else if (statusN >= 300 && statusN < 400) {
      return "orange";
    } else if (statusN >= 400 && statusN < 500) {
      return "red";
    } else {
      return "gray";
    }
  },

  async testRealFetch() {
    const urls = [
      {
        url: "https://jsonplaceholder.typicode.com/posts/1",
        label: "✅ 200 OK",
      }, // Successful GET
      {
        url: "https://jsonplaceholder.typicode.com/invalid-url",
        label: "❌ 404 Not Found",
      }, // Not Found
      { url: "https://httpstat.us/500", label: "🔥 500 Internal Server Error" }, // Server Error
      { url: "https://httpstat.us/302", label: "🔄 302 Redirect" }, // Redirect
      { url: "https://httpstat.us/401", label: "🚫 401 Unauthorized" }, // Unauthorized
      { url: "https://httpstat.us/403", label: "🚷 403 Forbidden" }, // Forbidden
      { url: "https://httpstat.us/418", label: "☕ 418 I'm a teapot" }, // Easter Egg
      { url: "https://httpstat.us/429", label: "⏳ 429 Too Many Requests" }, // Rate Limit
      { url: "https://httpstat.us/301", label: "➡️ 301 Moved Permanently" }, // Permanent Redirect
      {
        url: "https://jsonplaceholder.typicode.com/comments",
        label: "📝 JSON Response",
      }, // JSON Data
    ];

    for (let { url, label } of urls) {
      try {
        const startTime = performance.now();
        const response = await fetch(url);
        const duration = (performance.now() - startTime).toFixed(2);

        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        let body;
        try {
          body = await response.text();
        } catch (err) {
          body = "Unable to read body";
        }

        console.log(`\n${label}`);
        console.log(`URL: ${url}`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, headers);
        console.log(`Response Body:`, body.substring(0, 300)); // Trim long responses
        console.log(`Duration: ${duration} ms`);
      } catch (error) {
        console.error(`\n${label} - Error fetching ${url}:`, error.message);
      }
    }
  },
};
