import logWindow from "./src/logWindow.js";

customElements.define("log-window", logWindow);

function testConsoleMessages() {
    console.log('This is a log message', Math.random(), { key: 'value' });
    console.debug('This is a debug message', [Math.random(), Math.random(), Math.random()], new Date());
    console.error('This is an error message', new Error('Sample error' + Math.random()));
    console.warn('This is a warning message', true, null);
}


// If logtohtml query param is present, create the log window and override console
if (new URLSearchParams(window.location.search).get('logtohtml') === 'true') {
    const logWindowElement = document.createElement("log-window");
    document.body.appendChild(logWindowElement);
}

for (let i = 0; i < 10; i++) {
    setTimeout(() => {
        testConsoleMessages();
    }, 1000);
}