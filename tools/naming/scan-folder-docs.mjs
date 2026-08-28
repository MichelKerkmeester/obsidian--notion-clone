#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-folder-docs
// COMPONENT: sk-code-obsidian source-gate — folder documentation scanner
// ───────────────────────────────────────────────────────────────────
//
// Enforces both directions of the folder-doc threshold under src/ and
// tools/: a folder with three or more direct source files, or any child
// folder that itself carries source (directly or through its own
// children), owes both README.md and CODE.md. Below that threshold a
// folder owes README.md only, and a CODE.md sitting there anyway is a
// stray-doc error, not a harmless extra. Measured today
// (002-repo-convention-audit/audit.json): zero folder docs exist anywhere
// in the tree, so a clean run means the docs actually landed, not that
// this scanner never looked.
//
// Usage: node tools/naming/scan-folder-docs.mjs [--json]
// Exit:  0 when every scanned folder holds the docs its source count
//        requires and no stray CODE.md exists; 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCAN_ROOTS = ["src", "tools"];
const SOURCE_EXTENSIONS = new Set([".ts", ".mjs", ".js"]);
const SKIP_DIR_NAMES = new Set(["node_modules", ".git"]);
const THRESHOLD = 3;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

// One node per scanned folder: its direct source-file count and its
// immediate child folder paths. Built once, then read by the two
// bottom-up passes below (source-bearing, then owes-both).
function buildTree(dir, nodes) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const directSourceFiles = entries.filter(
    (e) => e.isFile() && SOURCE_EXTENSIONS.has(path.extname(e.name)),
  ).length;
  const childDirs = entries
    .filter((e) => e.isDirectory() && !SKIP_DIR_NAMES.has(e.name))
    .map((e) => path.join(dir, e.name));

  nodes.set(dir, { directSourceFiles, childDirs });
  for (const child of childDirs) buildTree(child, nodes);
  return nodes;
}

// A folder is source-bearing if it has a direct source file or any child
// folder is source-bearing — the recursive "child folder containing
// source" half of the threshold.
function isSourceBearing(dir, nodes, memo) {
  if (memo.has(dir)) return memo.get(dir);
  const node = nodes.get(dir);
  const result = node.directSourceFiles > 0 || node.childDirs.some((c) => isSourceBearing(c, nodes, memo));
  memo.set(dir, result);
  return result;
}

function owesReadmeAndCode(dir, nodes, memo) {
  const node = nodes.get(dir);
  if (node.directSourceFiles >= THRESHOLD) return true;
  return node.childDirs.some((c) => isSourceBearing(c, nodes, memo));
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN
// ───────────────────────────────────────────────────────────────────

function scan() {
  const nodes = new Map();
  for (const root of SCAN_ROOTS) {
    const abs = path.join(REPO_ROOT, root);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    buildTree(abs, nodes);
  }

  const sourceBearingMemo = new Map();
  const violations = [];
  const owesBothDirs = [];
  const owesReadmeOnlyDirs = [];

  for (const dir of nodes.keys()) {
    const owesBoth = owesReadmeAndCode(dir, nodes, sourceBearingMemo);
    const rel = path.relative(REPO_ROOT, dir) || ".";
    const hasReadme = existsSync(path.join(dir, "README.md"));
    const hasCode = existsSync(path.join(dir, "CODE.md"));

    if (owesBoth) owesBothDirs.push(rel);
    else owesReadmeOnlyDirs.push(rel);

    if (!hasReadme) {
      violations.push({ dir: rel, issue: "missing-readme" });
    }
    if (owesBoth && !hasCode) {
      violations.push({ dir: rel, issue: "missing-code" });
    }
    if (!owesBoth && hasCode) {
      violations.push({ dir: rel, issue: "stray-code" });
    }
  }

  return { scannedFolders: nodes.size, owesBothDirs, owesReadmeOnlyDirs, violations };
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

function main() {
  const asJson = process.argv.includes("--json");
  const result = scan();

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`scan-folder-docs: ${result.scannedFolders} folders scanned under ${SCAN_ROOTS.join(", ")}`);
    console.log(`scan-folder-docs: ${result.owesBothDirs.length} folder(s) owe README.md + CODE.md`);
    console.log(`scan-folder-docs: ${result.owesReadmeOnlyDirs.length} folder(s) owe README.md only`);
    if (result.violations.length === 0) {
      console.log("scan-folder-docs: PASS — every folder holds the docs its source count requires");
    } else {
      console.log(`scan-folder-docs: ${result.violations.length} violation(s):`);
      for (const v of result.violations) console.log(`  ${v.dir} — ${v.issue}`);
    }
  }

  process.exit(result.violations.length === 0 ? 0 : 1);
}

main();
