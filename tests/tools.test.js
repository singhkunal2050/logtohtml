import { describe, it, expect, vi } from "vitest";
import { toCurl, bodyToText } from "../src/utils/requestTools.js";
import { evaluate } from "../src/utils/repl.js";
import { readAll, removeItem, clearArea } from "../src/utils/storage.js";

describe("toCurl", () => {
  it("builds a shell-safe command", () => {
    const cmd = toCurl({
      url: "https://x.com/api",
      method: "POST",
      requestHeaders: { "Content-Type": "application/json" },
      requestBody: `{"name":"O'Brien"}`,
    });
    expect(cmd).toBe(
      `curl 'https://x.com/api' \\\n  -X POST \\\n  -H 'Content-Type: application/json' \\\n  --data-raw '{"name":"O'\\''Brien"}'`
    );
  });

  it("omits -X for GET and serialises URLSearchParams", () => {
    expect(toCurl({ url: "https://x.com", method: "GET" })).toBe("curl 'https://x.com'");
    expect(bodyToText(new URLSearchParams({ a: "1", b: "2" }))).toBe("a=1&b=2");
  });
});

describe("evaluate", () => {
  it("evaluates expressions in global scope", async () => {
    window.__replTest = 41;
    expect(await evaluate("__replTest + 1")).toEqual({ value: 42 });
  });

  it("treats braces as an object literal", async () => {
    expect((await evaluate("{a: 1}")).value).toEqual({ a: 1 });
  });

  it("awaits promises", async () => {
    expect(await evaluate("Promise.resolve(7)")).toEqual({ value: 7, awaited: true });
  });

  it("returns thrown errors instead of throwing", async () => {
    const { error } = await evaluate("nope.nope");
    expect(error).toBeInstanceOf(ReferenceError);
  });
});

describe("storage", () => {
  it("reads, removes and clears items", () => {
    localStorage.setItem("b", "2");
    localStorage.setItem("a", "1");
    sessionStorage.setItem("s", "x");
    document.cookie = "c1=hello%20world";

    const all = readAll();
    expect(all.local.items).toEqual([{ key: "a", value: "1" }, { key: "b", value: "2" }]);
    expect(all.session.items).toEqual([{ key: "s", value: "x" }]);
    expect(all.cookies.items).toContainEqual({ key: "c1", value: "hello world" });

    removeItem("local", "a");
    expect(readAll().local.items.map((i) => i.key)).toEqual(["b"]);
    removeItem("cookies", "c1");
    expect(readAll().cookies.items.map((i) => i.key)).not.toContain("c1");
    sessionStorage.setItem("logtohtml:open", "true");
    expect(readAll().session.items.map((i) => i.key)).not.toContain("logtohtml:open");
    clearArea("session");
    expect(readAll().session.items).toEqual([]);
    expect(sessionStorage.getItem("logtohtml:open")).toBe("true");
  });
});
