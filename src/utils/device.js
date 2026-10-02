// Snapshot of the environment, for the Device tab and exported reports.
export function deviceInfo(version) {
  const nav = window.navigator;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  const nt = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);

  const rows = [
    ["Page", [
      ["URL", window.location.href],
      ["Title", document.title || "(none)"],
      ["Referrer", document.referrer || "(none)"],
      ["Load time", nt ? `${Math.round(nt.duration || nt.loadEventEnd)}ms` : "n/a"],
    ]],
    ["Browser", [
      ["User agent", nav.userAgent],
      ["Platform", (nav.userAgentData && nav.userAgentData.platform) || nav.platform || "n/a"],
      ["Language", (nav.languages && nav.languages.join(", ")) || nav.language],
      ["Time zone", safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone)],
      ["Cookies enabled", String(nav.cookieEnabled)],
    ]],
    ["Screen", [
      ["Viewport", `${window.innerWidth}×${window.innerHeight}`],
      ["Screen", `${window.screen.width}×${window.screen.height}`],
      ["Pixel ratio", String(window.devicePixelRatio)],
      ["Orientation", (window.screen.orientation && window.screen.orientation.type) || (mq("(orientation: portrait)") ? "portrait" : "landscape")],
      ["Touch points", String(nav.maxTouchPoints || 0)],
      ["Color scheme", mq("(prefers-color-scheme: dark)") ? "dark" : "light"],
      ["Reduced motion", String(mq("(prefers-reduced-motion: reduce)"))],
    ]],
    ["Network", [
      ["Online", String(nav.onLine)],
      ["Connection", conn ? `${conn.effectiveType || "?"}${conn.downlink ? ` · ${conn.downlink} Mbps` : ""}${conn.rtt ? ` · ${conn.rtt}ms RTT` : ""}` : "n/a"],
      ["Save data", conn && conn.saveData != null ? String(conn.saveData) : "n/a"],
    ]],
    ["Hardware", [
      ["CPU cores", nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "n/a"],
      ["Memory", nav.deviceMemory ? `${nav.deviceMemory} GB` : "n/a"],
    ]],
    ["logtohtml", [["Version", version]]],
  ];
  return rows;
}

function safe(fn) {
  try {
    return fn() || "n/a";
  } catch (e) {
    return "n/a";
  }
}

export function deviceInfoText(version) {
  return deviceInfo(version)
    .map(([section, items]) => `## ${section}\n` + items.map(([k, v]) => `${k}: ${v}`).join("\n"))
    .join("\n\n");
}
