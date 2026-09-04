// ───────────────────────────────────────────────────────────────────
// MODULE:    page-module-script
// COMPONENT: turns an import-free ESM module into an injectable classic <script>
// ───────────────────────────────────────────────────────────────────
//
// `page.evaluate(fn, arg)` only stringifies `fn` itself — a measurement function that calls a
// sibling pure helper by reference loses that reference the moment it is re-parsed in the page's
// global scope, because the helper's source never travelled with it. The constructed-renderer pass
// does not hit this: esbuild really imports the module into the bundle. The fixture pass, which
// calls `page.evaluate()` directly against a hand-set page, does.
//
// So for the fixture pass, the shared measurement module is injected as a real classic script via
// `page.addScriptTag({ content })` instead of passed by reference: its functions then exist for
// real in the page's global scope, in the same scope as each other, exactly as the constructed
// pass's bundle has them. This strips the `export` keyword the module needs to be importable —
// nothing else — so the measurement logic itself is never copied, only how it reaches the page.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";

// ───────────────────────────────────────────────────────────────────
// 2. TRANSFORM
// ───────────────────────────────────────────────────────────────────

/**
 * Reads an import-free ESM module (only `export function` / `export const` at the top level, no
 * `import` statements — every measurement module here qualifies) and returns its source with the
 * `export` keywords stripped, ready for `page.addScriptTag({ content })`.
 */
export function asPageScript(modulePath) {
  return readFileSync(modulePath, "utf8").replace(/^export (function|const)/gm, "$1");
}
