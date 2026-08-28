#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-naming
// COMPONENT: sk-code-obsidian source-gate — filename grammar scanner
// ───────────────────────────────────────────────────────────────────
//
// Reports every file under src/ and tools/ whose basename is not
// lowercase-kebab (letters, digits and hyphens only, dots allowed as a
// word separator for compound suffixes like `.test`). The tree was
// PascalCase-dominant with nothing enforcing a convention, so this scanner
// is what keeps a rename from silently regressing one file at a time.
//
// Usage: node tools/naming/scan-naming.mjs [--json]
// Exit:  0 when every scanned file is lowercase-kebab, 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCAN_ROOTS = ["src", "tools"];
const SOURCE_EXTENSIONS = new Set([".ts", ".mjs", ".js"]);
const SKIP_DIR_NAMES = new Set(["node_modules", ".git"]);

// A stem is lowercase-kebab when every dot- or hyphen-delimited word is
// lowercase letters/digits. The dot delimiter exists so a compound suffix
// like `computed-formulas.test` reads as two kebab words, not one violation.
const KEBAB_STEM = /^[a-z0-9]+([-.][a-z0-9]+)*$/;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function isKebabBasename(basename) {
  const ext = path.extname(basename);
  const stem = basename.slice(0, basename.length - ext.length);
  return stem.length > 0 && KEBAB_STEM.test(stem);
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN
// ───────────────────────────────────────────────────────────────────

function scan() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const abs = path.join(REPO_ROOT, root);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    walk(abs, files);
  }

  const violations = [];
  for (const file of files) {
    const basename = path.basename(file);
    if (!isKebabBasename(basename)) {
      violations.push(path.relative(REPO_ROOT, file));
    }
  }

  return { scanned: files.length, violations };
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

function main() {
  const asJson = process.argv.includes("--json");
  const { scanned, violations } = scan();

  if (asJson) {
    console.log(JSON.stringify({ scanned, violationCount: violations.length, violations }, null, 2));
  } else {
    console.log(`scan-naming: ${scanned} files scanned under ${SCAN_ROOTS.join(", ")}`);
    if (violations.length === 0) {
      console.log("scan-naming: PASS — every filename is lowercase-kebab");
    } else {
      console.log(`scan-naming: ${violations.length} non-kebab filename(s):`);
      for (const v of violations) console.log(`  ${v}`);
    }
  }

  process.exit(violations.length === 0 ? 0 : 1);
}

main();
