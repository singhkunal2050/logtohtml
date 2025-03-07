export const utils = {

    getLogStatusColor(status) {
        const statusN = Number(status);
        if (statusN >= 200 && statusN < 300) {
            return 'green';
        } else if (statusN >= 300 && statusN < 400) {
            return 'orange';
        } else if (statusN >= 400 && statusN < 500) {
            return 'red';
        } else {
            return 'gray';
        }
    },
    
    async testRealFetch() {
        const urls = [
            { url: "https://jsonplaceholder.typicode.com/posts/1", label: "✅ 200 OK" }, // Successful GET
            { url: "https://jsonplaceholder.typicode.com/invalid-url", label: "❌ 404 Not Found" }, // Not Found
            { url: "https://httpstat.us/500", label: "🔥 500 Internal Server Error" }, // Server Error
            { url: "https://httpstat.us/302", label: "🔄 302 Redirect" }, // Redirect
            { url: "https://httpstat.us/401", label: "🚫 401 Unauthorized" }, // Unauthorized
            { url: "https://httpstat.us/403", label: "🚷 403 Forbidden" }, // Forbidden
            { url: "https://httpstat.us/418", label: "☕ 418 I'm a teapot" }, // Easter Egg
            { url: "https://httpstat.us/429", label: "⏳ 429 Too Many Requests" }, // Rate Limit
            { url: "https://httpstat.us/301", label: "➡️ 301 Moved Permanently" }, // Permanent Redirect
            { url: "https://jsonplaceholder.typicode.com/comments", label: "📝 JSON Response" } // JSON Data
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
    }
    
    

}