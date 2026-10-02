// Copy-as-cURL and replay for captured requests.

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export function bodyToText(body) {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return body.toString();
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const parts = [];
    body.forEach((v, k) => parts.push(`${k}=${typeof v === "string" ? v : `[File ${v.name || "blob"}]`}`));
    return parts.join("&");
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) return `[Blob ${body.size} bytes]`;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return `[Binary ${body.byteLength} bytes]`;
  try {
    return JSON.stringify(body);
  } catch (e) {
    return String(body);
  }
}

export function toCurl(req) {
  const parts = [`curl ${shellQuote(req.url)}`];
  const method = (req.method || "GET").toUpperCase();
  if (method !== "GET") parts.push(`-X ${method}`);
  for (const [k, v] of Object.entries(req.requestHeaders || {})) {
    parts.push(`-H ${shellQuote(`${k}: ${v}`)}`);
  }
  const body = req.requestBody;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    body.forEach((v, k) => parts.push(`-F ${shellQuote(`${k}=${typeof v === "string" ? v : "@" + (v.name || "file")}`)}`));
  } else if (body != null && body !== "") {
    parts.push(`--data-raw ${shellQuote(bodyToText(body))}`);
  }
  return parts.join(" \\\n  ");
}

// Re-send a captured request with fetch; the replay is captured like any other request
export function replay(req) {
  const init = { method: req.method || "GET", headers: req.requestHeaders || {} };
  if (req.requestBody != null && !/^(GET|HEAD)$/i.test(init.method)) init.body = req.requestBody;
  return fetch(req.url, init);
}
