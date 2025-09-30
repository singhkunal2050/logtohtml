// Robust Search and Filter Utilities
export class SearchFilter {
  constructor() {
    this.searchCache = new Map();
    this.filterCache = new Map();
  }

  // Escape special regex characters for safe search
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Normalize text for search (handle unicode, case-insensitive)
  normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Check if search term matches text (case-insensitive, unicode-safe)
  matchesSearch(searchTerm, text) {
    if (!searchTerm || !text) return false;
    
    const normalizedSearch = this.normalizeText(searchTerm);
    const normalizedText = this.normalizeText(text);
    
    return normalizedText.includes(normalizedSearch);
  }

  // Check if log matches filter criteria
  matchesFilter(log, filter) {
    if (filter === 'all') return true;
    
    // Handle different log types
    if (log.type === filter) return true;
    if (log.level === filter) return true;
    
    // Handle special log types
    if (filter === 'time' && (log.type === 'time' || log.type === 'timeEnd' || log.type === 'timeLog')) {
      return true;
    }
    
    return false;
  }

  // Check if log matches search criteria
  matchesSearchCriteria(log, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return true;
    
    const search = searchTerm.trim();
    
    // Check message
    if (this.matchesSearch(search, log.message)) return true;
    
    // Check args (only for objects/arrays/functions)
    if (log.args && log.args.length > 0) {
      for (const arg of log.args) {
        if (typeof arg === 'object' && arg !== null) {
          // Search in object properties
          if (this.searchInObject(arg, search)) return true;
        } else if (Array.isArray(arg)) {
          // Search in array elements
          if (this.searchInArray(arg, search)) return true;
        } else if (typeof arg === 'string') {
          // Search in string arguments
          if (this.matchesSearch(search, arg)) return true;
        }
      }
    }
    
    // Check special log data
    if (log.data && this.searchInObject(log.data, search)) return true;
    if (log.stack && this.searchInArray(log.stack, search)) return true;
    
    return false;
  }

  // Search within object properties
  searchInObject(obj, searchTerm, depth = 0) {
    if (depth > 3) return false; // Prevent infinite recursion
    
    for (const [key, value] of Object.entries(obj)) {
      // Search in key
      if (this.matchesSearch(searchTerm, key)) return true;
      
      // Search in value
      if (typeof value === 'string') {
        if (this.matchesSearch(searchTerm, value)) return true;
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (this.searchInArray(value, searchTerm)) return true;
        } else {
          if (this.searchInObject(value, searchTerm, depth + 1)) return true;
        }
      }
    }
    
    return false;
  }

  // Search within array elements
  searchInArray(arr, searchTerm) {
    for (const item of arr) {
      if (typeof item === 'string') {
        if (this.matchesSearch(searchTerm, item)) return true;
      } else if (typeof item === 'object' && item !== null) {
        if (this.searchInObject(item, searchTerm)) return true;
      }
    }
    return false;
  }

  // Apply filters and search to logs
  filterAndSearch(logs, filter, searchTerm) {
    const cacheKey = `${filter}-${searchTerm}-${logs.length}`;
    
    // Check cache first
    if (this.filterCache.has(cacheKey)) {
      return this.filterCache.get(cacheKey);
    }
    
    const filteredLogs = logs.filter(log => {
      // Apply filter
      if (!this.matchesFilter(log, filter)) return false;
      
      // Apply search
      if (!this.matchesSearchCriteria(log, searchTerm)) return false;
      
      return true;
    });
    
    // Cache result
    this.filterCache.set(cacheKey, filteredLogs);
    
    return filteredLogs;
  }

  // Clear cache (call when logs change significantly)
  clearCache() {
    this.searchCache.clear();
    this.filterCache.clear();
  }

  // Get search suggestions based on log content
  getSearchSuggestions(logs, partialSearch) {
    if (!partialSearch || partialSearch.length < 2) return [];
    
    const suggestions = new Set();
    const normalizedPartial = this.normalizeText(partialSearch);
    
    for (const log of logs) {
      // Extract words from messages
      const words = log.message.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.startsWith(normalizedPartial) && word.length > 2) {
          suggestions.add(word);
        }
      }
      
      // Extract words from object properties
      if (log.args) {
        for (const arg of log.args) {
          if (typeof arg === 'object' && arg !== null) {
            this.extractSuggestionsFromObject(arg, normalizedPartial, suggestions);
          }
        }
      }
    }
    
    return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
  }

  // Extract search suggestions from object
  extractSuggestionsFromObject(obj, partialSearch, suggestions, depth = 0) {
    if (depth > 2) return; // Prevent deep recursion
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === 'string' && key.toLowerCase().startsWith(partialSearch)) {
        suggestions.add(key);
      }
      
      if (typeof value === 'string') {
        const words = value.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (word.startsWith(partialSearch) && word.length > 2) {
            suggestions.add(word);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        this.extractSuggestionsFromObject(value, partialSearch, suggestions, depth + 1);
      }
    }
  }

  // Performance optimization for large log volumes
  optimizeForLargeVolumes(logs) {
    if (logs.length > 1000) {
      // Implement virtual scrolling or pagination
      return logs.slice(-500); // Show only last 500 logs
    }
    return logs;
  }

  // Debounced search function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Create singleton instance
export const searchFilter = new SearchFilter();
