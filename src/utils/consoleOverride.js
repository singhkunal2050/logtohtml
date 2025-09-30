// Comprehensive Console Override to match Chrome DevTools exactly
export class ConsoleOverride {
  constructor() {
    this.logBuffer = [];
    this.groups = [];
    this.counters = new Map();
    this.timers = new Map();
    this.originalConsole = this.captureOriginalConsole();
    this.overrideAllMethods();
  }

  captureOriginalConsole() {
    return {
      log: console.log,
      info: console.info,
      debug: console.debug,
      warn: console.warn,
      error: console.error,
      group: console.group,
      groupCollapsed: console.groupCollapsed,
      groupEnd: console.groupEnd,
      table: console.table,
      trace: console.trace,
      assert: console.assert,
      count: console.count,
      countReset: console.countReset,
      time: console.time,
      timeEnd: console.timeEnd,
      timeLog: console.timeLog,
      clear: console.clear,
      dir: console.dir,
      dirxml: console.dirxml
    };
  }

  overrideAllMethods() {
    // Basic logging methods
    console.log = this.createLogMethod('log');
    console.info = this.createLogMethod('info');
    console.debug = this.createLogMethod('debug');
    console.warn = this.createLogMethod('warn');
    console.error = this.createLogMethod('error');

    // Grouping methods
    console.group = this.createGroupMethod('group');
    console.groupCollapsed = this.createGroupMethod('groupCollapsed');
    console.groupEnd = this.createGroupEndMethod();

    // Special methods
    console.table = this.createTableMethod();
    console.trace = this.createTraceMethod();
    console.assert = this.createAssertMethod();
    console.count = this.createCountMethod();
    console.countReset = this.createCountResetMethod();
    console.time = this.createTimeMethod();
    console.timeEnd = this.createTimeEndMethod();
    console.timeLog = this.createTimeLogMethod();
    console.clear = this.createClearMethod();
    console.dir = this.createDirMethod();
    console.dirxml = this.createDirxmlMethod();
  }

  createLogMethod(level) {
    return (...args) => {
      // Call original method
      this.originalConsole[level](...args);
      
      // Create log entry
      const logEntry = this.createLogEntry(level, args);
      this.addToBuffer(logEntry);
    };
  }

  createGroupMethod(type) {
    return (label = '') => {
      // Call original method
      this.originalConsole[type](label);
      
      const groupEntry = {
        type: 'group',
        level: type,
        label: label,
        timestamp: new Date().toISOString(),
        collapsed: type === 'groupCollapsed',
        children: []
      };
      
      this.groups.push(groupEntry);
      this.addToBuffer(groupEntry);
    };
  }

  createGroupEndMethod() {
    return () => {
      // Call original method
      this.originalConsole.groupEnd();
      
      if (this.groups.length > 0) {
        const groupEndEntry = {
          type: 'groupEnd',
          timestamp: new Date().toISOString()
        };
        
        this.groups.pop();
        this.addToBuffer(groupEndEntry);
      }
    };
  }

  createTableMethod() {
    return (data, columns) => {
      // Call original method
      this.originalConsole.table(data, columns);
      
      const tableEntry = {
        type: 'table',
        data: data,
        columns: columns,
        timestamp: new Date().toISOString(),
        message: 'Table data'
      };
      
      this.addToBuffer(tableEntry);
    };
  }

  createTraceMethod() {
    return (...args) => {
      // Call original method
      this.originalConsole.trace(...args);
      
      const stack = this.getStackTrace();
      const traceEntry = {
        type: 'trace',
        args: args,
        stack: stack,
        timestamp: new Date().toISOString(),
        message: args.length > 0 ? args.map(arg => this.formatArg(arg)).join(' ') : 'Trace'
      };
      
      this.addToBuffer(traceEntry);
    };
  }

  createAssertMethod() {
    return (condition, ...args) => {
      // Call original method
      this.originalConsole.assert(condition, ...args);
      
      if (!condition) {
        const assertEntry = {
          type: 'assert',
          args: args,
          timestamp: new Date().toISOString(),
          message: args.length > 0 ? args.map(arg => this.formatArg(arg)).join(' ') : 'Assertion failed',
          failed: true
        };
        
        this.addToBuffer(assertEntry);
      }
    };
  }

  createCountMethod() {
    return (label = 'default') => {
      // Call original method
      this.originalConsole.count(label);
      
      const currentCount = this.counters.get(label) || 0;
      const newCount = currentCount + 1;
      this.counters.set(label, newCount);
      
      const countEntry = {
        type: 'count',
        label: label,
        count: newCount,
        timestamp: new Date().toISOString(),
        message: `${label}: ${newCount}`
      };
      
      this.addToBuffer(countEntry);
    };
  }

  createCountResetMethod() {
    return (label = 'default') => {
      // Call original method
      this.originalConsole.countReset(label);
      
      this.counters.delete(label);
      
      const countResetEntry = {
        type: 'countReset',
        label: label,
        timestamp: new Date().toISOString(),
        message: `${label}: 0`
      };
      
      this.addToBuffer(countResetEntry);
    };
  }

  createTimeMethod() {
    return (label = 'default') => {
      // Call original method
      this.originalConsole.time(label);
      
      this.timers.set(label, performance.now());
      
      const timeEntry = {
        type: 'time',
        label: label,
        timestamp: new Date().toISOString(),
        message: `Timer '${label}' started`
      };
      
      this.addToBuffer(timeEntry);
    };
  }

  createTimeEndMethod() {
    return (label = 'default') => {
      // Call original method
      this.originalConsole.timeEnd(label);
      
      const startTime = this.timers.get(label);
      if (startTime !== undefined) {
        const duration = performance.now() - startTime;
        this.timers.delete(label);
        
        const timeEndEntry = {
          type: 'timeEnd',
          label: label,
          duration: duration,
          timestamp: new Date().toISOString(),
          message: `${label}: ${duration.toFixed(2)}ms`
        };
        
        this.addToBuffer(timeEndEntry);
      }
    };
  }

  createTimeLogMethod() {
    return (label = 'default', ...args) => {
      // Call original method
      this.originalConsole.timeLog(label, ...args);
      
      const startTime = this.timers.get(label);
      if (startTime !== undefined) {
        const duration = performance.now() - startTime;
        
        const timeLogEntry = {
          type: 'timeLog',
          label: label,
          duration: duration,
          args: args,
          timestamp: new Date().toISOString(),
          message: `${label}: ${duration.toFixed(2)}ms ${args.length > 0 ? args.map(arg => this.formatArg(arg)).join(' ') : ''}`
        };
        
        this.addToBuffer(timeLogEntry);
      }
    };
  }

  createClearMethod() {
    return () => {
      // Call original method
      this.originalConsole.clear();
      
      this.logBuffer = [];
      this.groups = [];
      this.counters.clear();
      this.timers.clear();
      
      // Dispatch clear event
      window.dispatchEvent(new CustomEvent('console-cleared'));
    };
  }

  createDirMethod() {
    return (object) => {
      // Call original method
      this.originalConsole.dir(object);
      
      const dirEntry = {
        type: 'dir',
        object: object,
        timestamp: new Date().toISOString(),
        message: 'Object inspection'
      };
      
      this.addToBuffer(dirEntry);
    };
  }

  createDirxmlMethod() {
    return (node) => {
      // Call original method
      this.originalConsole.dirxml(node);
      
      const dirxmlEntry = {
        type: 'dirxml',
        node: node,
        timestamp: new Date().toISOString(),
        message: 'XML/HTML Node'
      };
      
      this.addToBuffer(dirxmlEntry);
    };
  }

  createLogEntry(level, args) {
    return {
      type: 'log',
      level: level,
      args: args,
      timestamp: new Date().toISOString(),
      message: args.map(arg => this.formatArg(arg)).join(' '),
      details: args,
      groupLevel: this.groups.length
    };
  }

  formatArg(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    if (typeof arg === 'function') return `function ${arg.name || 'anonymous'}()`;
    if (arg instanceof Error) return arg.toString();
    if (Array.isArray(arg)) return `Array(${arg.length})`;
    if (typeof arg === 'object') return `Object`;
    return String(arg);
  }

  getStackTrace() {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2) : [];
  }

  addToBuffer(entry) {
    this.logBuffer.push(entry);
    window.dispatchEvent(new CustomEvent('new-log', { detail: entry }));
  }

  getLogs() {
    return [...this.logBuffer];
  }

  clearLogs() {
    this.logBuffer = [];
    this.groups = [];
    this.counters.clear();
    this.timers.clear();
    window.dispatchEvent(new CustomEvent('console-cleared'));
  }

  destroy() {
    // Restore original console methods
    Object.keys(this.originalConsole).forEach(method => {
      console[method] = this.originalConsole[method];
    });
  }
}

// Create singleton instance
export const consoleOverride = new ConsoleOverride();
