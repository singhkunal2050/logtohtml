export const logWindowConfig = {
    id: 'dynamic-log-window',
    styles: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        width: '100%',
        height: '40%',
        overflowY: 'scroll',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        padding: '10px',
        zIndex: '9999',
        display: 'none',
    },
    toggleButton: {
        textContent: 'Show Logs',
        styles: {
            position: 'fixed',
            bottom: '0',
            right: '0',
            zIndex: '10000',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
        },
    },
};

export const logColors = {
    log: 'white',
    debug: 'cyan',
    error: 'red',
    warn: 'yellow',
};