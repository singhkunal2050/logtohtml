export const logWindowConfig = {
    id: 'dynamic-log-window',
    contentId: 'logs-list',
    styles: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        width: '98vw',
        height: '40%',
        overflowY: 'scroll',
        backgroundColor: '#282828',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: '9999',
        display: 'none',
        wordBreak: 'break-all',
        scrollbarWidth: 'thin',
        scrollbarColor: '#6b6b6b #282828',
    },
    toggleButton: {
        textContent: 'Show Logs ▲',
        styles: {
            position: 'fixed',
            bottom: '0',
            right: '0',
            zIndex: '10000',
            backgroundColor: '#282828',
            color: 'rgb(175, 175, 175)',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            borderRadius: '16px 0 0 0',
        },
    },
};

export const logColors = {
    log: 'transparent',
    debug: '#264445',
    error: '#4e3434',
    warn: '#413c26',
};

// Filter options
export const logFilters = ["all", "log", "debug", "error", "warn"];