// ───────────────────────────────────────────────────────────────────
// MODULE:    verify-shim
// COMPONENT: proves the Obsidian DOM shim in a real browser
// ───────────────────────────────────────────────────────────────────
//
// The shim only earns trust if a browser agrees with it. Asserting against a
// mock would prove the mock. This drives the same Chrome the capture harness
// uses, installs the shim onto the real prototypes, and checks each extension
// against the behaviour obsidian.d.ts specifies.
//
// The subtle ones are worth naming, because a lookalike implementation passes
// a careless test and then diverges in the catalogue:
//   - toggleClass takes a required value; it never means "flip"
//   - setAttr(name, null) removes rather than writing "null"
//   - createEl accepts a bare string as the class, not a tag
//   - DomElementInfo.prepend inserts first rather than appending
//
// Exit 0 means every check passed. Any failure prints the case and exits 1.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BROWSER RESOLUTION
// ───────────────────────────────────────────────────────────────────

/** Mirrors the capture harness: use the system browser, never download one. */
function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error("No Chrome/Chromium found. Set SCREENSHOT_CHROME to a browser executable.");
}

// ───────────────────────────────────────────────────────────────────
// 3. CHECKS
// ───────────────────────────────────────────────────────────────────

const checks = () => {
  const results = [];
  const check = (name, actual, expected) => {
    results.push({ name, pass: actual === expected, actual: String(actual), expected: String(expected) });
  };
  const host = document.body.createDiv({ cls: "host" });

  check("createDiv attaches to its parent", host.parentElement === document.body, true);
  check("createDiv applies cls", host.className, "host");

  const withString = host.createDiv("from-string");
  check("string info is treated as a class", withString.className, "from-string");

  const arrayCls = host.createDiv({ cls: ["a", "b"] });
  check("cls accepts an array", arrayCls.className, "a b");

  const withText = host.createSpan({ text: "hello" });
  check("createSpan sets text", withText.textContent, "hello");
  check("createSpan makes a span", withText.tagName, "SPAN");

  const withAttrs = host.createEl("button", { attr: { type: "button", "aria-hidden": null, tabindex: 0 } });
  check("attr writes a string", withAttrs.getAttribute("type"), "button");
  check("attr skips null", withAttrs.hasAttribute("aria-hidden"), false);
  check("attr stringifies a number", withAttrs.getAttribute("tabindex"), "0");
  check("createEl honours the tag", withAttrs.tagName, "BUTTON");

  const parentTarget = document.body.createDiv();
  const routed = host.createDiv({ parent: parentTarget });
  check("info.parent overrides the receiver", routed.parentElement === parentTarget, true);

  parentTarget.createDiv({ cls: "second" });
  const first = parentTarget.createDiv({ cls: "first", prepend: true });
  check("prepend inserts first", parentTarget.firstElementChild === first, true);

  let callbackSaw = null;
  host.createDiv({ cls: "cb" }, (el) => { callbackSaw = el.className; });
  check("callback receives the element", callbackSaw, "cb");

  const classes = host.createDiv();
  classes.addClass("x", "y");
  check("addClass takes rest args", classes.className, "x y");
  classes.removeClass("x");
  check("removeClass removes one", classes.className, "y");
  check("hasClass finds a class", classes.hasClass("y"), true);
  check("hasClass rejects a missing class", classes.hasClass("x"), false);

  // The value is required. A "flip" here would be a lookalike bug that only shows up in a
  // rendered catalogue, so assert the false case explicitly.
  classes.toggleClass("z", true);
  check("toggleClass(true) adds", classes.hasClass("z"), true);
  classes.toggleClass("z", false);
  check("toggleClass(false) removes", classes.hasClass("z"), false);
  classes.toggleClass("z", false);
  check("toggleClass(false) is idempotent, not a flip", classes.hasClass("z"), false);
  classes.toggleClass(["p", "q"], true);
  check("toggleClass accepts an array", classes.hasClass("p") && classes.hasClass("q"), true);

  const attrs = host.createDiv();
  attrs.setAttr("data-x", 5);
  check("setAttr stringifies", attrs.getAttribute("data-x"), "5");
  attrs.setAttr("data-x", null);
  check("setAttr(null) removes", attrs.hasAttribute("data-x"), false);

  const styled = host.createDiv();
  styled.setCssProps({ width: "10px", "--db-token": "7px" });
  check("setCssProps sets a property", styled.style.width, "10px");
  check("setCssProps sets a custom property", styled.style.getPropertyValue("--db-token"), "7px");

  const texted = host.createDiv();
  texted.setText("first");
  texted.setText("second");
  check("setText replaces rather than appends", texted.textContent, "second");

  const emptied = host.createDiv();
  emptied.createDiv();
  emptied.createDiv();
  check("children exist before empty", emptied.childElementCount, 2);
  emptied.empty();
  check("empty clears children", emptied.childElementCount, 0);

  const detached = host.createDiv();
  detached.detach();
  check("detach removes from the tree", detached.parentElement, null);

  return results;
};

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ executablePath: findChrome() });
try {
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({
    content: `${readFileSync(resolve(HERE, "obsidian-dom-shim.mjs"), "utf-8")
      .replace(/^export /gm, "")}\ninstallObsidianDomShim(window);`,
    type: "module",
  });

  const installed = await page.evaluate(() => typeof document.body.createDiv === "function");
  if (!installed) {
    console.error("verify-shim: FAIL — the shim did not install onto HTMLElement.prototype");
    process.exit(1);
  }

  const results = await page.evaluate(checks);
  const failed = results.filter((r) => !r.pass);
  for (const r of failed) {
    console.error(`  FAIL  ${r.name}\n        expected ${r.expected}, got ${r.actual}`);
  }
  console.log(`verify-shim: ${results.length - failed.length}/${results.length} checks passed in real Chrome`);
  if (failed.length) {
    console.error(`verify-shim: FAIL — ${failed.length} check(s) failed`);
    process.exit(1);
  }
  console.log("verify-shim: PASS — the shim matches Obsidian's documented behaviour");
} finally {
  await browser.close();
}
