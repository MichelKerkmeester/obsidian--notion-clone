// ───────────────────────────────────────────────────────────────────
// MODULE:    verify-coverage
// COMPONENT: proves the shim and stub still cover what the source uses
// ───────────────────────────────────────────────────────────────────
//
// The shim and the stub are both hand-written lists, and a hand-written list
// falls behind the code that needs it. Three real gaps were found this way
// only because a story happened to exercise them:
//
//   - `activeDocument`, a global Obsidian supplies, used 244 times
//   - `createSvg` and `appendText`, element extensions the shim never had
//   - SVGElement.prototype, never patched, so nested SVG construction threw
//
// Each was invisible until someone opened the one story that touched it. This
// derives both requirements from the source instead, so the next gap fails a
// check rather than waiting for a story to stumble into it.
//
// Usage: node tools/storybook/verify-coverage.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SRC = join(REPO, "src");
const SHIM = join(REPO, "tools", "storybook", "obsidian-dom-shim.mjs");
const STUB = join(REPO, "tools", "storybook", "obsidian-stub.mjs");

/** Obsidian's HTMLElement extensions. Only these are the shim's responsibility. */
const ELEMENT_EXTENSIONS = [
  "createDiv", "createEl", "createSpan", "createSvg", "setText", "addClass", "removeClass",
  "toggleClass", "hasClass", "setAttr", "setAttrs", "getAttr", "setCssProps", "setCssStyles",
  "empty", "detach", "insertAfter", "appendText", "addClasses", "removeClasses",
];

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".ts") && !p.endsWith(".test.ts") && !p.endsWith(".stories.ts")) out.push(p);
  }
  return out;
}

const sources = walk(SRC).map((p) => readFileSync(p, "utf8"));
const all = sources.join("\n");

// ───────────────────────────────────────────────────────────────────
// 4. CHECKS
// ───────────────────────────────────────────────────────────────────

const failures = [];

// 4.1 Element extensions the source calls must exist in the shim.
const shimSource = readFileSync(SHIM, "utf8");
const usedExtensions = ELEMENT_EXTENSIONS.filter((name) => new RegExp(`\\.${name}\\(`).test(all));
const missingExtensions = usedExtensions.filter((name) => !new RegExp(`(^|[\\s,{])${name}[(:]`, "m").test(shimSource));
if (missingExtensions.length) {
  failures.push(`shim is missing element extensions used by the source: ${missingExtensions.join(", ")}`);
}

// 4.2 Every named import from "obsidian" must be exported by the stub, or the bundle cannot
//     resolve — regardless of whether any story calls it.
const imported = new Set();
for (const m of all.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"obsidian"/gs)) {
  for (const raw of m[1].split(",")) {
    const name = raw.trim().replace(/^type\s+/, "").split(" as ")[0].trim();
    if (name) imported.add(name);
  }
}
const stubSource = readFileSync(STUB, "utf8");
const stubExports = new Set(
  [...stubSource.matchAll(/^export (?:const|function)\s+(\w+)/gm)].map((m) => m[1]),
);
const missingExports = [...imported].filter((n) => !stubExports.has(n)).sort();
if (missingExports.length) {
  failures.push(`stub is missing exports imported by the source: ${missingExports.join(", ")}`);
}

// 4.3 Globals Obsidian supplies that the source depends on.
if (/\bactiveDocument\b/.test(all) && !/activeDocument/.test(shimSource)) {
  failures.push("source uses `activeDocument` but the shim does not provide it");
}

// 4.4 SVG construction needs the SVG prototype patched, not only HTMLElement.
if (/\.createSvg\(/.test(all) && !/SVGElement/.test(shimSource)) {
  failures.push("source builds SVG but the shim does not patch SVGElement.prototype");
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

if (failures.length) {
  console.error("verify-coverage: FAIL");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `verify-coverage: PASS — shim covers ${usedExtensions.length} used extensions, `
  + `stub covers ${imported.size} imported names`,
);
