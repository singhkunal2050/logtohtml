import { createLogWindow, overrideConsole } from './src/dom-utils.js';

// If logtohtml query param is present, create the log window and override console
if (new URLSearchParams(window.location.search).get('logtohtml') === 'true') {
    createLogWindow();
    overrideConsole();
}

export function testConsoleMessages() {
    console.log('This is a log message', 42, { key: 'value' });
    console.debug('This is a debug message', [1, 2, 3], new Date());
    console.error('This is an error message', new Error('Sample error'));
    console.warn('This is a warning message', true, null);
}

for (let i = 0; i < 10; i++) {
    setTimeout(() => {
        testConsoleMessages();
    }, 1000);
}
