import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  filterRows,
  countByBucket,
  relatedRequest,
  makeMatcher,
} from "../src/utils/consoleView.js";
import { applyFormat, previewValue, frameLocation, prettyFrame, stackFrames, shortUrl } from "../src/utils/format.js";

const log = (message, level = "log", extra = {}) => ({
  type: "log",
  level,
  message,
  args: [message],
  ts: extra.ts ?? 1000,
  groupLevel: 0,
  ...extra,
});

describe("buildTimeline", () => {
  it("collapses consecutive identical primitive logs", () => {
    const rows = buildTimeline([log("a"), log("a"), log("a"), log("b"), log("a")]);
    expect(rows.map((r) => [r.entry.message, r.count])).toEqual([["a", 3], ["b", 1], ["a", 1]]);
  });

  it("does not collapse logs carrying objects", () => {
    const withObj = (m) => ({ ...log(m), args: [m, { x: 1 }] });
    expect(buildTimeline([withObj("a"), withObj("a")])).toHaveLength(2);
  });

  it("does not collapse across levels", () => {
    expect(buildTimeline([log("a"), log("a", "warn")])).toHaveLength(2);
  });

  it("merges failed requests in time order and skips successful ones", () => {
    const rows = buildTimeline(
      [log("before", "log", { ts: 100 }), log("after", "log", { ts: 300 })],
      [
        { id: 1, method: "POST", url: "/x", status: 500, startTimestamp: 150, endTimestamp: 200 },
        { id: 2, method: "GET", url: "/ok", status: 200, startTimestamp: 150, endTimestamp: 210 },
        { id: 3, method: "GET", url: "/p", status: "pending", startTimestamp: 150 },
      ]
    );
    expect(rows.map((r) => r.kind + ":" + (r.entry?.message || r.request.url))).toEqual([
      "log:before",
      "net:/x",
      "log:after",
    ]);
  });

  it("drops groupEnd and maps assert to error", () => {
    const rows = buildTimeline([{ type: "groupEnd" }, { type: "assert", message: "bad", ts: 1 }]);
    expect(rows).toHaveLength(1);
    expect(rows[0].level).toBe("error");
  });
});

describe("filterRows / countByBucket", () => {
  const rows = buildTimeline([
    log("boot"),
    log("fyi", "info"),
    log("careful", "warn"),
    log("broken", "error"),
    log("broken", "error"),
    log("trace me", "debug"),
  ]);

  it("counts by bucket, including collapsed repeats", () => {
    expect(countByBucket(rows)).toEqual({ error: 2, warn: 1, info: 2, debug: 1, all: 6 });
  });

  it("filters by level buckets", () => {
    const out = filterRows(rows, { levels: new Set(["error", "warn"]), query: "" });
    expect(out.map((r) => r.entry.message)).toEqual(["careful", "broken"]);
  });

  it("filters by substring and regex", () => {
    expect(filterRows(rows, { levels: new Set(), query: "BRO" })).toHaveLength(1);
    expect(filterRows(rows, { levels: new Set(), query: "/^b(oot|roken)$/" })).toHaveLength(2);
  });

  it("treats an invalid regex as plain text", () => {
    expect(makeMatcher("/(/")("a /(/ b")).toBe(true);
  });
});

describe("relatedRequest", () => {
  it("finds the latest failed request just before an error", () => {
    const reqs = [
      { id: 1, status: 500, endTimestamp: 1000 },
      { id: 2, status: 404, endTimestamp: 1900 },
      { id: 3, status: 200, endTimestamp: 1950 },
      { id: 4, status: 500, endTimestamp: 9000 },
    ];
    expect(relatedRequest(2000, reqs).id).toBe(2);
    expect(relatedRequest(20000, reqs)).toBeNull();
  });
});

describe("format helpers", () => {
  it("applies console format specifiers", () => {
    const obj = { a: 1 };
    expect(applyFormat(["%s is %d years", "Ann", "42.7"])).toEqual(["Ann is 42 years"]);
    expect(applyFormat(["%cstyled", "color: red"])).toEqual(["styled"]);
    expect(applyFormat(["obj: %o!", obj, "extra"])).toEqual(["obj: ", obj, "!", "extra"]);
    expect(applyFormat(["100%% done"])).toEqual(["100% done"]);
    expect(applyFormat(["no args %s"])).toEqual(["no args %s"]);
  });

  it("previews values without invoking getters", () => {
    let called = false;
    const o = { a: 1, get secret() { called = true; return 2; } };
    expect(previewValue(o)).toBe("{a: 1, secret: (…)}");
    expect(called).toBe(false);
    expect(previewValue([1, "x", { y: 1 }])).toBe('(3) [1, "x", {…}]');
    expect(previewValue(new Map([[1, 2]]))).toBe("Map(1)");
    const cyclic = {};
    cyclic.self = cyclic;
    expect(previewValue(cyclic)).toBe("{self: {…}}");
  });

  it("extracts file:line from Chrome, Firefox and Safari frames", () => {
    expect(frameLocation("at submit (https://x.com/js/checkout.js:142:18)")).toBe("checkout.js:142");
    expect(frameLocation("submit@https://x.com/js/checkout.js:142:18")).toBe("checkout.js:142");
    expect(stackFrames("Error: x\n    at a (f.js:1:2)\n    at b (g.js:3:4)")).toHaveLength(2);
    expect(frameLocation("at http://localhost:8765/app.html?logtohtml=true:22:61")).toBe("app.html:22");
  });

  it("shortens frame URLs for display", () => {
    expect(prettyFrame("at submit (https://x.com/js/checkout.js?v=2:142:18)")).toBe("at submit (checkout.js:142:18)");
    expect(prettyFrame("submit@https://x.com/js/checkout.js:142:18")).toBe("submit@checkout.js:142:18");
    expect(prettyFrame("at http://localhost:8765/app.html?logtohtml=true:22:61")).toBe("at app.html:22:61");
    expect(prettyFrame("at <anonymous>")).toBe("at <anonymous>");
  });

  it("shortens same-origin URLs to their path", () => {
    expect(shortUrl(`${window.location.origin}/api/x?y=1`)).toBe("/api/x?y=1");
    expect(shortUrl("https://api.example.com/v1")).toBe("api.example.com/v1");
  });
});
