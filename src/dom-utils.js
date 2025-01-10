
import { logWindowConfig, logColors } from './configs.js';



// Step 1: Create a DOM window for the logs
export function createLogWindow() {
    const logWindow = document.createElement('div');
    logWindow.id = logWindowConfig.id;
    Object.assign(logWindow.style, logWindowConfig.styles);

    // Toggle button for showing/hiding logs
    const toggleButton = document.createElement('button');
    toggleButton.textContent = logWindowConfig.toggleButton.textContent;
    Object.assign(toggleButton.style, logWindowConfig.toggleButton.styles);

    toggleButton.addEventListener('click', () => {
        if (logWindow.style.display === 'none') {
            logWindow.style.display = 'block';
            toggleButton.textContent = 'Hide Logs';
        } else {
            logWindow.style.display = 'none';
            toggleButton.textContent = 'Show Logs';
        }
    });

    // Filter container
    const filterContainer = document.createElement('div');
    filterContainer.style.display = 'flex';
    filterContainer.style.justifyContent = 'flex-start';
    filterContainer.style.padding = '5px';
    filterContainer.style.backgroundColor = '#333';

    const filters = ['all', 'log', 'debug', 'error', 'warn'];
    filters.forEach(type => {
        const button = document.createElement('button');
        button.textContent = type.toUpperCase();
        button.style.marginRight = '5px';
        button.style.color = 'white';
        button.style.backgroundColor = 'black';
        button.style.border = '1px solid white';
        button.style.cursor = 'pointer';

        button.addEventListener('click', () => {
            const messages = logWindow.querySelectorAll('div.log-message');
            messages.forEach(message => {
                if (type === 'all' || message.dataset.type === type) {
                    message.style.display = 'block';
                } else {
                    message.style.display = 'none';
                }
            });
        });

        filterContainer.appendChild(button);
    });

    logWindow.appendChild(filterContainer);
    document.body.appendChild(logWindow);
    document.body.appendChild(toggleButton);
}

// Step 2: Override console functions
export function overrideConsole() {
    const originalConsole = {
        log: console.log,
        debug: console.debug,
        error: console.error,
        warn: console.warn
    };

    const logToWindow = (type, args) => {
        const logWindow = document.getElementById(logWindowConfig.id);
        if (logWindow) {
            const message = document.createElement('div');
            message.style.padding = '5px';
            message.style.marginBottom = '5px';
            message.style.borderBottom = '1px solid #444';
            message.style.color = logColors[type] || 'white';
            message.classList.add('log-message');
            message.dataset.type = type;

            // Add a timestamp
            const timestamp = new Date().toISOString();
            const formattedArgs = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
            ).join(' ');

            const logContent = document.createElement('div');
            logContent.textContent = `[${timestamp}] [${type.toUpperCase()}] ${formattedArgs}`;
            message.appendChild(logContent);

            // Expandable/collapsible log details for objects
            args.forEach(arg => {
                if (typeof arg === 'object') {
                    const details = document.createElement('details');
                    details.style.marginTop = '5px';

                    const summary = document.createElement('summary');
                    summary.textContent = `Details (${type})`;
                    summary.style.color = logColors[type];
                    details.appendChild(summary);

                    const pre = document.createElement('pre');
                    pre.style.whiteSpace = 'pre-wrap';
                    pre.style.color = '#ccc';
                    pre.textContent = JSON.stringify(arg, null, 2);
                    details.appendChild(pre);

                    message.appendChild(details);
                }
            });

            logWindow.appendChild(message);
            logWindow.scrollTop = logWindow.scrollHeight;
        }
    };

    // Override the console functions
    console.log = (...args) => {
        originalConsole.log(...args);
        logToWindow('log', args);
    };

    console.debug = (...args) => {
        originalConsole.debug(...args);
        logToWindow('debug', args);
    };

    console.error = (...args) => {
        originalConsole.error(...args);
        logToWindow('error', args);
    };

    console.warn = (...args) => {
        originalConsole.warn(...args);
        logToWindow('warn', args);
    };
}

