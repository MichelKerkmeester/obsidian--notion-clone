// ───────────────────────────────────────────────────────────────────
// MODULE:    build
// COMPONENT: bundles the catalogue and verifies it renders in Chrome
// ───────────────────────────────────────────────────────────────────
//
// Bundles the story entry with `obsidian` aliased to the stub, then loads the
// result in the same headless Chrome the capture harness drives and asserts
// that every story produced real DOM.
//
// The assertion matters more than the bundle. A catalogue that builds but
// renders nothing is the same failure mode as a screenshot that captures an
// empty box, which is how a blank popover survived a whole round of this
// programme. Building is not evidence; rendered nodes are.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const OUT = resolve(HERE, "dist");

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

/** Redirect every `obsidian` import to the stub, which is why real modules can be bundled at all. */
const obsidianStubPlugin = {
  name: "obsidian-stub",
  setup(build) {
    build.onResolve({ filter: /^obsidian$/ }, () => ({
      path: resolve(HERE, "obsidian-stub.mjs"),
    }));
  },
};

mkdirSync(OUT, { recursive: true });

const entry = resolve(OUT, "entry.ts");
writeFileSync(entry, `
import { installObsidianDomShim } from "../obsidian-dom-shim.mjs";
import { renderCatalogue } from "../stories";

installObsidianDomShim(window);
const root = document.getElementById("catalogue");
const count = renderCatalogue(root);
document.body.setAttribute("data-story-count", String(count));
`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  outfile: resolve(OUT, "catalogue.js"),
  plugins: [obsidianStubPlugin],
  logLevel: "warning",
  absWorkingDir: REPO,
});

const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Note Database — component catalogue</title>
<link rel="stylesheet" href="../../../styles.css">
<link rel="stylesheet" href="../catalogue.css">
</head><body class="theme-dark"><main id="catalogue"></main>
<script src="catalogue.js"></script></body></html>`;
writeFileSync(resolve(OUT, "index.html"), html);

// ───────────────────────────────────────────────────────────────────
// 3. VERIFY IT ACTUALLY RENDERS
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("No Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

const browser = await chromium.launch({ executablePath: findChrome() });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(`file://${resolve(OUT, "index.html")}`);

  const report = await page.evaluate(() => {
    const stage = (section) => section.querySelector(".db-story-stage");
    const sections = Array.from(document.querySelectorAll("[data-story]"));
    return sections.map((section) => ({
      id: section.getAttribute("data-story"),
      // Direct children alone would pass on an empty shell — a component that made its root and
      // nothing else. Count the whole subtree and the text, which is what a reviewer looks at.
      nodes: stage(section)?.querySelectorAll("*").length ?? 0,
      text: (stage(section)?.textContent ?? "").trim().length,
      classes: new Set(
        Array.from(stage(section)?.querySelectorAll("[class]") ?? [])
          .flatMap((el) => Array.from(el.classList))
          .filter((c) => c.startsWith("db-") && !c.startsWith("db-story")),
      ).size,
    }));
  });

  for (const err of errors) console.error(`  page error: ${err}`);
  // A story is only real if it produced a subtree, text, and plugin classes. Any one of those
  // alone can be true of a shell.
  const empty = report.filter((r) => r.nodes === 0 || r.text === 0 || r.classes === 0);
  for (const r of empty) {
    console.error(`  FAIL  story "${r.id}": ${r.nodes} nodes, ${r.text} chars, ${r.classes} db- classes`);
  }

  const total = report.reduce((sum, r) => sum + r.nodes, 0);
  console.log(`storybook: ${report.length} stories, ${total} rendered elements`);
  for (const r of report) {
    console.log(`  ${r.nodes.toString().padStart(3)} nodes  ${r.classes.toString().padStart(2)} db-classes  ${r.text.toString().padStart(3)} chars  ${r.id}`);
  }

  if (errors.length || empty.length || report.length === 0) {
    console.error("storybook: FAIL");
    process.exit(1);
  }
  console.log(`storybook: PASS — real modules rendered in Chrome, catalogue at ${resolve(OUT, "index.html")}`);
} finally {
  await browser.close();
}
