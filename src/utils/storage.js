// Reads and edits localStorage, sessionStorage and cookies.

// The panel keeps its own UI state under this prefix; don't show or clear it
const OWN_PREFIX = "logtohtml:";

function readStorage(storage) {
  const items = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key.startsWith(OWN_PREFIX)) continue;
      items.push({ key, value: storage.getItem(key) ?? "" });
    }
  } catch (e) {
    return { items, error: "Not available (blocked by browser settings)" };
  }
  items.sort((a, b) => a.key.localeCompare(b.key));
  return { items };
}

export function readCookies() {
  try {
    const raw = document.cookie;
    if (!raw) return { items: [] };
    const items = raw.split(/;\s*/).map((pair) => {
      const i = pair.indexOf("=");
      const key = i === -1 ? pair : pair.slice(0, i);
      let value = i === -1 ? "" : pair.slice(i + 1);
      try {
        value = decodeURIComponent(value);
      } catch (e) {}
      return { key, value };
    });
    items.sort((a, b) => a.key.localeCompare(b.key));
    return { items };
  } catch (e) {
    return { items: [], error: "Not available" };
  }
}

export function readAll() {
  return {
    local: safe(() => readStorage(window.localStorage)),
    session: safe(() => readStorage(window.sessionStorage)),
    cookies: readCookies(),
  };
}

function safe(fn) {
  try {
    return fn();
  } catch (e) {
    return { items: [], error: "Not available (blocked by browser settings)" };
  }
}

export function removeItem(area, key) {
  try {
    if (area === "local") window.localStorage.removeItem(key);
    else if (area === "session") window.sessionStorage.removeItem(key);
    else if (area === "cookies") expireCookie(key);
  } catch (e) {}
}

export function clearArea(area) {
  try {
    if (area === "local") readStorage(window.localStorage).items.forEach(({ key }) => window.localStorage.removeItem(key));
    else if (area === "session") readStorage(window.sessionStorage).items.forEach(({ key }) => window.sessionStorage.removeItem(key));
    else if (area === "cookies") readCookies().items.forEach(({ key }) => expireCookie(key));
  } catch (e) {}
}

// Cookies can only be removed for paths/domains we can name; try the common ones
function expireCookie(key) {
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";
  const host = window.location.hostname;
  const paths = ["/", window.location.pathname];
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const path of paths) {
    for (const domain of domains) {
      document.cookie = `${key}=; expires=${past}; path=${path}${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
