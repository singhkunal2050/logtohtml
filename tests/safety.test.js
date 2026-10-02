import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

function mockFetch(body = '{"ok":true}', init = { status: 200 }) {
  return vi.fn(async () => new Response(body, init));
}

async function freshModules() {
  vi.resetModules();
  const { consoleOverride } = await import("../src/utils/consoleOverride.js");
  const { networkMonitor } = await import("../src/utils/networkMonitor.js");
  return { consoleOverride, networkMonitor };
}

describe("loading the library", () => {
  it("does not patch console or fetch until activated", async () => {
    const fetchBefore = (window.fetch = mockFetch());
    const logBefore = console.log;
    const xhrBefore = window.XMLHttpRequest;

    await freshModules();

    expect(window.fetch).toBe(fetchBefore);
    expect(console.log).toBe(logBefore);
    expect(window.XMLHttpRequest).toBe(xhrBefore);
  });

  it("does not patch anything when index.js loads without the query param", async () => {
    const fetchBefore = (window.fetch = mockFetch());
    const logBefore = console.log;
    vi.resetModules();
    await import("../index.js");
    expect(window.fetch).toBe(fetchBefore);
    expect(console.log).toBe(logBefore);
    expect(document.querySelector("log-window")).toBeNull();
  });
});

describe("network monitor", () => {
  let networkMonitor;

  beforeEach(async () => {
    window.fetch = mockFetch();
    ({ networkMonitor } = await freshModules());
    networkMonitor.install();
  });

  afterEach(() => networkMonitor.destroy());

  it("lets relative-URL fetches through and records them", async () => {
    const res = await window.fetch("/api/cart");
    expect(res.status).toBe(200);
    await vi.waitFor(() =>
      expect(networkMonitor.getRequests()[0]).toMatchObject({ status: 200, method: "GET" })
    );
    expect(networkMonitor.getRequests()[0].url).toContain("/api/cart");
  });

  it("accepts Request objects", async () => {
    const res = await window.fetch(new Request("http://localhost/api/x", { method: "POST" }));
    expect(res.status).toBe(200);
    await vi.waitFor(() =>
      expect(networkMonitor.getRequests()[0]).toMatchObject({ method: "POST", url: "http://localhost/api/x" })
    );
  });

  it("resolves fetch without waiting for the response body (streams, SSE)", async () => {
    const neverEnds = new ReadableStream({ start() {} });
    networkMonitor.destroy();
    window.fetch = vi.fn(async () => new Response(neverEnds, { status: 200 }));
    networkMonitor.install();

    const result = await Promise.race([
      window.fetch("/stream").then(() => "resolved"),
      new Promise((r) => setTimeout(() => r("hung"), 200)),
    ]);
    expect(result).toBe("resolved");
  });

  it("still rejects when the real fetch rejects", async () => {
    networkMonitor.destroy();
    window.fetch = vi.fn(async () => { throw new TypeError("offline"); });
    networkMonitor.install();
    await expect(window.fetch("/x")).rejects.toThrow("offline");
    expect(networkMonitor.getRequests()[0]).toMatchObject({ error: true });
  });

  it("keeps XMLHttpRequest instanceof working", () => {
    expect(new XMLHttpRequest()).toBeInstanceOf(XMLHttpRequest);
  });

  it("is idempotent and restores originals on destroy", () => {
    const wrapped = window.fetch;
    networkMonitor.install();
    expect(window.fetch).toBe(wrapped);
    networkMonitor.destroy();
    expect(window.fetch).not.toBe(wrapped);
  });

  it("caps stored requests", async () => {
    networkMonitor.maxEntries = 5;
    for (let i = 0; i < 12; i++) await window.fetch(`/r/${i}`);
    expect(networkMonitor.getRequests()).toHaveLength(5);
  });
});

describe("console override", () => {
  it("captures logs once installed, caps the buffer, and restores on destroy", async () => {
    const realLog = console.log;
    const original = (console.log = vi.fn()); // keep test output quiet
    const { consoleOverride } = await freshModules();
    consoleOverride.install();
    expect(console.log).not.toBe(original);
    consoleOverride.maxEntries = 3;

    for (let i = 0; i < 5; i++) console.log("msg", i);
    const logs = consoleOverride.getLogs();
    expect(logs).toHaveLength(3);
    expect(logs[2].message).toBe("msg 4");

    consoleOverride.destroy();
    expect(console.log).toBe(original);
    console.log = realLog;
  });

  it("never throws into the caller when an argument can't be captured", async () => {
    const realLog = console.log;
    console.log = vi.fn();
    const { consoleOverride } = await freshModules();
    consoleOverride.install();
    const hostile = { get name() { throw new Error("boom"); } };
    Object.defineProperty(hostile, "constructor", { get() { throw new Error("boom"); } });
    expect(() => console.log(Object.create(null), hostile)).not.toThrow();
    consoleOverride.destroy();
    console.log = realLog;
  });
});

describe("error capture", () => {
  it("records uncaught errors and unhandled rejections", async () => {
    vi.resetModules();
    const { consoleOverride } = await import("../src/utils/consoleOverride.js");
    const { errorCapture } = await import("../src/utils/errorCapture.js");
    errorCapture.install();

    const err = new TypeError("boom");
    window.dispatchEvent(new ErrorEvent("error", { error: err, message: "boom", filename: "https://x.com/app.js", lineno: 9 }));
    const rejection = new Event("unhandledrejection");
    rejection.reason = "nope";
    window.dispatchEvent(rejection);

    const [a, b] = consoleOverride.getLogs();
    expect(a).toMatchObject({ level: "error", uncaught: "error", message: "Uncaught TypeError: boom" });
    expect(b).toMatchObject({ level: "error", uncaught: "rejection", message: "Uncaught (in promise) nope" });
    errorCapture.destroy();
  });

  it("records a source location for console calls", async () => {
    const realLog = console.log;
    console.log = vi.fn();
    vi.resetModules();
    const { consoleOverride } = await import("../src/utils/consoleOverride.js");
    consoleOverride.install();
    console.log("where am I");
    expect(consoleOverride.getLogs()[0].source).toMatch(/safety\.test\.js:\d+/);
    consoleOverride.destroy();
    console.log = realLog;
  });
});
