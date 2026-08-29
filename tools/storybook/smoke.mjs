// ───────────────────────────────────────────────────────────────────
// MODULE:    storybook-smoke
// COMPONENT: renders every story in both themes and fails on any throw
// ───────────────────────────────────────────────────────────────────
//
// A catalogue that builds is not a catalogue that works. Rollup only proves
// the graph resolves; a story can still throw at render time because the DOM
// shim is missing a method, or because a component reached the vault stub.
//
// So every story is opened in isolation, in light and dark, and the run fails
// on a page error, a console error, or an empty root. That last check matters
// most: a story that renders nothing at all still passes a "no errors" test,
// which is precisely the false green this repo has been bitten by before.
//
// Usage: node tools/storybook/smoke.mjs [--only <story-id>]

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const STATIC = join(REPO, "storybook-static");
const THEMES = ["light", "dark"];

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".map": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2",
};

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error("No Chrome/Chromium found. Set SCREENSHOT_CHROME, or install Chrome.");
  }
  return found;
}

/** Serve the built catalogue: file:// would break module loading and fetches of index.json. */
function serve(root) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url || "/").split("?")[0]);
    let file = join(root, path === "/" ? "/index.html" : path);
    if (!existsSync(file) || !extname(file)) file = join(root, "index.html");
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(join(STATIC, "index.json"))) {
    console.error("smoke: no build found. Run `npm run build-storybook` first.");
    process.exit(2);
  }

  const index = JSON.parse(readFileSync(join(STATIC, "index.json"), "utf8"));
  const only = arg("--only", null);
  const stories = Object.values(index.entries)
    .filter((e) => e.type === "story")
    .filter((e) => !only || e.id === only);

  if (stories.length === 0) {
    console.error(only ? `smoke: no story matched ${only}` : "smoke: no stories found");
    process.exit(2);
  }

  const { server, port } = await serve(STATIC);
  const browser = await chromium.launch({ executablePath: findChrome() });
  const failures = [];
  let checks = 0;

  try {
    for (const story of stories) {
      for (const theme of THEMES) {
        checks += 1;
        const page = await browser.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(`throw: ${e.message}`));
        page.on("console", (m) => {
          if (m.type() === "error") errors.push(`console: ${m.text()}`);
        });

        const url = `http://127.0.0.1:${port}/iframe.html`
          + `?id=${encodeURIComponent(story.id)}&globals=theme:${theme}&viewMode=story`;
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForSelector("#storybook-root", { timeout: 10000 }).catch(() => {});

        // A story that renders nothing is the failure a "no errors" check would miss entirely,
        // and testing the root's innerHTML does NOT catch it: the preview decorator always wraps
        // output in a container, so the root is never literally empty. What distinguishes real
        // output is that it carries classed elements or text of its own.
        const rendered = await page.evaluate(() => {
          const root = document.querySelector("#storybook-root");
          if (!root) return { classed: 0, text: 0 };
          const classed = Array.from(root.querySelectorAll("*"))
            .filter((el) => el.getAttribute("class") && el.className !== "note-database-container")
            .length;
          return { classed, text: root.textContent?.trim().length || 0 };
        });
        if (rendered.classed === 0 && rendered.text === 0) {
          errors.push("rendered nothing (no classed elements or text inside the container)");
        }

        if (errors.length) failures.push({ id: story.id, theme, errors });
        else process.stdout.write(".");
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  process.stdout.write("\n");
  if (failures.length) {
    console.error(`\nsmoke: FAIL — ${failures.length} of ${checks} renders`);
    for (const f of failures) {
      console.error(`  ${f.id} [${f.theme}]`);
      for (const e of f.errors) console.error(`      ${e}`);
    }
    process.exit(1);
  }
  console.log(`smoke: PASS — ${stories.length} stories x ${THEMES.length} themes = ${checks} renders, 0 errors`);
}

main().catch((e) => { console.error("smoke:", e.message); process.exit(1); });
