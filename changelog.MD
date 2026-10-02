### 0.3.0 02nd Oct 2026
- New panel: floating launcher (drag to any edge, shows error count) that opens a resizable bottom sheet; open state, tab, height and launcher position survive reloads
- Console: level chips with counts, text or /regex/ filter, repeated logs collapsed (×N), file:line for every log, errors show their stack with Copy error and Show related request, failed requests appear in the timeline, %s/%d/%o/%c format specifiers, lazy object inspector that never invokes getters
- Console: JavaScript input with history (↑/↓), evaluates in page scope and awaits promises
- Uncaught errors and unhandled promise rejections are captured from the moment logtohtml loads
- Network: Fetch/XHR, Assets and Failed filters; request detail with Headers, Payload, Response (JSON tree) and Timing; Copy cURL, Copy body, Replay
- New Storage tab: localStorage, sessionStorage and cookies, with filter, view, copy and delete
- New Device tab: page, browser, screen, network and hardware details, with Copy device info
- Panel styles are isolated from the host page
- Bundle targets browsers with ES modules (iOS/Safari 11+, Chrome 61+); 24.5 KB gzipped

### 0.2.0 02nd Oct 2026
- Nothing is patched unless `?logtohtml=true` is present (previously console, fetch and XHR were wrapped on every page that loaded the library)
- Fixed fetch calls with relative URLs or `Request` objects rejecting in the host app
- fetch now resolves immediately; response bodies are read in the background (streaming/SSE responses no longer hang)
- XHR: `instanceof XMLHttpRequest` works and non-text `responseType` no longer throws
- Fixed search crashing with a ReferenceError
- Log and request buffers are capped (1000 logs, 500 requests, 50 KB per body)
- Bundle is ASCII-only so it renders on pages without a UTF-8 charset
- Added Vitest test suite (`npm test`)
- Panel shows Console and Network only; unfinished Performance, Elements, Storage, Application and Security tabs removed
- `import "logtohtml"` now resolves to the built bundle (previously pointed at raw JSX source); npm package trimmed to dist only
- Removed unused fuse.js dependency; bundle 140 KB -> 91 KB (22 KB gzipped)

### 0.1.51 09th Mar 2024
- Added Repo Source to Package.json

### 0.1.5 09th Mar 2024
- Added Resource Monitoring

### 0.1.4 09th Mar 2024
- Updated Readme to use unpkg

### 0.1.3 09th Mar 2024
- Added npmignore file to reduce bundle size

### 0.1.2 09th Mar 2024
- Readme Update

### 0.1.1 04th Mar 2024
- Migrated to Preact for 
- Added support for Network Tracking 
- Added Support for fuzzy search 
 

### 0.0.11 04th Mar 2024
- Added Support for Network Tracing

### 0.0.10 04th Mar 2024
- Added Version details

### 0.0.9 04th Mar 2024
- Moved to Web Components

### 0.0.8 04th Mar 2024
- Updated readme

### 0.0.7 04th Mar 2024
- Updated readme

### 0.0.6 04th Mar 2024
- Added Version Logging

### 0.0.5 04th Mar 2024
- Added Search
- Improved UX

### 0.0.4 10th Jan 2024
- Optimize

### 0.0.3 10th Jan 2024
- Added Dist

### 0.0.2 10th Jan 2024  
- Added dist folder to git

### 0.0.1 9th Jan 2024  
- Initial commit
