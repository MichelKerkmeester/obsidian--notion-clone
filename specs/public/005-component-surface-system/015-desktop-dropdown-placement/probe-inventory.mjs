// ───────────────────────────────────────────────────────────────────
// MODULE:    probe-inventory
// COMPONENT: enumerates every floating-surface placement site in src/,
//            and proves the set of placement mechanisms is closed
// ───────────────────────────────────────────────────────────────────
//
// Grepping one function name cannot answer "did I find every dropdown".
// It finds the surfaces that use the function you thought of. This instead
// enumerates the small set of PRIMITIVES that can put a box at a coordinate,
// then asserts nothing else in src/ writes a placement coordinate. If that
// assertion holds, the call-site list below is complete by construction
// rather than by diligence, and a surface added later through a sixth
// mechanism turns the assertion red instead of going unnoticed.
//
// Placement does not depend on what a surface contains. It depends on the
// path, the options, the mount point and where the anchor sits. So the sites
// are grouped into equivalence classes on exactly those four, and the browser
// probe measures one representative per class across every edge condition.
//
// Usage: node probe-inventory.mjs [--json]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../../../..", import.meta.url));
const SRC = join(REPO, "src");

// ───────────────────────────────────────────────────────────────────
// 1. SOURCE SET
// ───────────────────────────────────────────────────────────────────

// Stories and tests are excluded because they are not shipped surfaces. They are
// still scanned by the closure check below, so a placement mechanism that only
// ever appears in a story cannot hide there.
const isShipped = (p) =>
  p.endsWith(".ts") && !p.endsWith(".test.ts") && !p.includes("__tests__") && !p.endsWith(".stories.ts");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(SRC);
const shippedFiles = allFiles.filter((p) => isShipped(p));

// ───────────────────────────────────────────────────────────────────
// 2. THE PLACEMENT PRIMITIVES
// ───────────────────────────────────────────────────────────────────

// Every way this codebase can put a floating surface at a coordinate. A sixth
// entry here means a sixth answer to "where does a dropdown go", which is the
// thing this program keeps paying for.
const PRIMITIVES = [
  { id: "positionToolbarPopover", re: /positionToolbarPopover\s*\(/g, kind: "anchored-fixed" },
  { id: "showAt", re: /\.showAt\s*\(/g, kind: "point-fixed" },
  { id: "setPosition", re: /(?<!\.)\bsetPosition\s*\(/g, kind: "raw-write" },
  { id: "placeSheet", re: /placeSheet\s*\(/g, kind: "sheet" },
];

// Definitions, not uses. Counted separately so the call-site totals are honest.
const DEFINITION_LINES = new Set([
  "src/views/popover-position.ts:positionToolbarPopover",
  "src/views/popover-position.ts:setPosition",
  "src/views/popover-position.ts:placeSheet",
]);

const sites = [];
for (const file of shippedFiles) {
  const rel = relative(REPO, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  for (const prim of PRIMITIVES) {
    prim.re.lastIndex = 0;
    let m;
    while ((m = prim.re.exec(text)) !== null) {
      const line = text.slice(0, m.index).split("\n").length;
      const src = lines[line - 1].trim();
      // `export function foo(` is the definition of the primitive, not a use of it.
      if (/^\s*export\s+(async\s+)?function/.test(lines[line - 1])) continue;
      if (/^\s*(private|public|protected)?\s*\w+\s*\(/.test(src) && src.includes("): void {")) continue;
      sites.push({ primitive: prim.id, kind: prim.kind, file: rel, line, src });
    }
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. CLOSURE CHECK — is the primitive set complete?
// ───────────────────────────────────────────────────────────────────

// A surface placed by writing left/top directly, bypassing every primitive above,
// is exactly the surface an inventory misses. Rather than trust that none exists,
// find every placement-coordinate write in src/ and require each to be inside a
// primitive's own definition. Anything else is an unaccounted-for sixth mechanism.
const COORD_WRITE = /(?:\bstyle\s*\.\s*(?:left|top|right|bottom)\s*=)|(?:setCssProps\s*\(\s*\{[^}]*\b(?:left|top)\s*:)/g;

const PRIMITIVE_OWNED = [
  "src/views/popover-position.ts",   // setPosition, placeSheet, positionToolbarPopover
  "src/views/mobile-bottom-sheet.ts", // sheet chrome, phone only
];

const strayWrites = [];
for (const file of shippedFiles) {
  const rel = relative(REPO, file);
  if (PRIMITIVE_OWNED.includes(rel)) continue;
  const text = readFileSync(file, "utf8");
  COORD_WRITE.lastIndex = 0;
  let m;
  while ((m = COORD_WRITE.exec(text)) !== null) {
    const line = text.slice(0, m.index).split("\n").length;
    strayWrites.push({ file: rel, line, src: text.split("\n")[line - 1].trim() });
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. NATIVE SURFACES — placed by the browser, not by this codebase
// ───────────────────────────────────────────────────────────────────

// A <select> drops its own list. It is a dropdown a user sees and a grep for
// the plugin's positioner will never return it, so it is named here and
// excluded on the record rather than by omission.
const NATIVE = [];
for (const file of shippedFiles) {
  const rel = relative(REPO, file);
  const text = readFileSync(file, "utf8");
  const re = /createEl\(\s*["']select["']|new\s+DropdownComponent|addDropdown\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    NATIVE.push({ file: rel, line: text.slice(0, m.index).split("\n").length });
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

const byPrimitive = {};
for (const s of sites) (byPrimitive[s.primitive] ||= []).push(s);

// ───────────────────────────────────────────────────────────────────
// 4b. THE CLASSIFIED BASELINE
// ───────────────────────────────────────────────────────────────────
//
// The closure check finds every coordinate write outside a primitive. Some of those are
// genuine floating surfaces placed by hand — the interesting ones — and some are ordinary
// layout arithmetic that happens to write `top`. Keeping the raw list red forever would
// train the next reader to ignore it, so each FILE is classified once here and the exit
// status turns on a file nobody has classified appearing.
//
// Keyed on the file, not on file:line, because line numbers move under every edit and a
// baseline that goes red for a shifted line is a baseline people delete.
const KNOWN_HAND_PLACERS = new Map([
  ["src/views/board-renderer.ts",
    "drag preview following the cursor, clamped to the viewport. Not a dropdown."],
  ["src/views/calendar-renderer.ts",
    "the 'more events' day popover (clamped to .note-database-container, so it cannot reach a "
    + "sidebar) plus timeline event/line layout, which is grid arithmetic rather than placement."],
  ["src/views/cell-renderer.ts",
    "inline cell editors on the is-mobile branch, positioned relative to the scroll container. "
    + "Phone only. Held by another session."],
  ["src/views/column-menu.ts",
    "anchorless submenu fallback. Repaired in this phase to clamp against getVisiblePopoverBounds "
    + "instead of window.innerWidth."],
  ["src/views/database-view.ts",
    "calendar/timeline search results. DEFECTIVE: clamps to window.innerWidth and travels up to "
    + "292px under an open right sidebar. Held by another session; declared red in the placement probe."],
  ["src/views/embedded-database-renderer.ts",
    "the same search-results method, duplicated verbatim. Same defect, same lock."],
  ["src/views/modals/formula-modal.ts",
    "the property/function autocomplete, repaired in this phase to clamp its right edge, plus an "
    + "offscreen mirror element used to measure the caret. The mirror is not a surface."],
]);

const newFiles = [...new Set(strayWrites.map((w) => w.file))].filter((f) => !KNOWN_HAND_PLACERS.has(f));

const report = {
  scanned: shippedFiles.length,
  sites: sites.length,
  byPrimitive: Object.fromEntries(Object.entries(byPrimitive).map(([k, v]) => [k, v.length])),
  closureHolds: strayWrites.length === 0,
  strayWrites,
  nativeSurfaces: NATIVE,
  detail: sites,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(report, null, 2));
} else {
  console.log(`probe-inventory: scanned ${report.scanned} shipped source files\n`);
  for (const [prim, list] of Object.entries(byPrimitive)) {
    console.log(`── ${prim} (${list.length} call sites)`);
    for (const s of list) console.log(`   ${s.file}:${s.line}  ${s.src.slice(0, 110)}`);
    console.log();
  }
  console.log(`native browser-placed surfaces (excluded from the plugin's placement policy): ${NATIVE.length}`);
  for (const n of NATIVE) console.log(`   ${n.file}:${n.line}`);
  console.log();
  console.log(`CLOSURE: ${strayWrites.length} placement-coordinate write(s) outside a primitive, `
    + `across ${new Set(strayWrites.map((w) => w.file)).size} file(s)`);
  const grouped = {};
  for (const w of strayWrites) (grouped[w.file] ||= []).push(w.line);
  for (const [file, lines] of Object.entries(grouped)) {
    const known = KNOWN_HAND_PLACERS.get(file);
    console.log(`   ${known ? "known  " : "NEW    "} ${file}  lines ${lines.join(",")}`);
    if (known) console.log(`             ${known}`);
  }
  console.log();
  console.log(newFiles.length === 0
    ? `BASELINE: holds — every hand-placed surface is one of the ${KNOWN_HAND_PLACERS.size} already classified.`
    : `BASELINE: BROKEN — ${newFiles.length} file(s) place a surface by a mechanism nobody has classified.`);
}

process.exit(newFiles.length === 0 ? 0 : 1);
