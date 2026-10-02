// Runs before `npm publish` (prepublishOnly). Refuses to publish a build that
// doesn't match this checkout: wrong branch, uncommitted changes, stale
// version string, ES5 runtime, or an oversized bundle.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";

const MAX_GZIP_BYTES = 30 * 1024;
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
const bundle = readFileSync(new URL("../dist/bundle.js", import.meta.url), "utf8");
const git = (cmd) => execSync(`git ${cmd}`, { encoding: "utf8" }).trim();

const problems = [];

const branch = git("rev-parse --abbrev-ref HEAD");
if (branch !== "main") problems.push(`on branch "${branch}"; publish from main`);

const dirty = git("status --porcelain");
if (dirty) problems.push(`uncommitted changes:\n${dirty}`);

// webpack inlines package.json's version as a string constant
if (!bundle.includes(`"${pkg.version}"`)) {
  problems.push(`dist/bundle.js does not embed version ${pkg.version} (stale build?)`);
}

if (bundle.includes("Generator is already running")) {
  problems.push("dist/bundle.js contains the ES5 regenerator runtime; check Babel targets and run npm install");
}

const gz = gzipSync(bundle).length;
if (gz > MAX_GZIP_BYTES) problems.push(`bundle is ${gz} bytes gzipped (limit ${MAX_GZIP_BYTES})`);

if (problems.length) {
  console.error(`\nRefusing to publish logtohtml@${pkg.version}:\n- ${problems.join("\n- ")}\n`);
  process.exit(1);
}
console.log(`Release check passed: logtohtml@${pkg.version} from ${git("rev-parse --short HEAD")}, ${(gz / 1024).toFixed(1)} KB gzipped`);
