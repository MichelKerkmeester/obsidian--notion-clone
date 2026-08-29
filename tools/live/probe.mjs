// ───────────────────────────────────────────────────────────────────
// MODULE:    live-probe
// COMPONENT: asks the running Obsidian for measurements, from a shell
// ───────────────────────────────────────────────────────────────────
//
// Every other harness in this repository measures a reproduction: a fixture, a
// story, a headless page with a hand-built workspace. None of them measures the
// product the operator installs, with their theme and their other plugins
// loaded. That gap is why a release once passed every check and changed nothing
// anyone could see.
//
// Obsidian ships a command-line interface with a renderer `eval`, so the gap is
// closeable on a desktop: `getComputedStyle`, `getBoundingClientRect` and
// `elementFromPoint` can be asked of the real app and answered into a shell,
// with an exit code. This is the transport for that.
//
// It is a developer-loop and review instrument, not an unattended gate. The
// app has to be open, which is a real constraint and is why the exit codes
// separate "the thing under test is wrong" from "I could not ask".
//
// Exit codes, and the distinction matters more than it looks:
//   0  every assertion held
//   1  an assertion failed — the product is wrong
//   2  the question could not be asked — app closed, CLI missing, eval refused
//
// Conflating 1 and 2 is how a harness reports green because it never ran. A
// caller that treats "could not ask" as "nothing wrong" has rebuilt the exact
// blindness this phase exists to remove.
//
// Usage:
//   node tools/live/probe.mjs --check transport
//   node tools/live/probe.mjs --check navbar
//   node tools/live/probe.mjs --eval '<js returning a JSON-serialisable value>'

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

const run = promisify(execFile);

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const EXIT_PASS = 0;
export const EXIT_ASSERTION = 1;
export const EXIT_INFRASTRUCTURE = 2;

const CLI_CANDIDATES = [
  "/usr/local/bin/obsidian",
  "/Applications/Obsidian.app/Contents/MacOS/obsidian-cli",
];

/** The CLI prints this when no app is listening. It is an infrastructure state, never a failure. */
const NOT_RUNNING = /unable to find obsidian/i;

// ───────────────────────────────────────────────────────────────────
// 3. TRANSPORT
// ───────────────────────────────────────────────────────────────────

export function findCli() {
  const explicit = process.env.OBSIDIAN_CLI;
  if (explicit && existsSync(explicit)) return explicit;
  return CLI_CANDIDATES.find(existsSync) || null;
}

/**
 * Ask the running app to evaluate an expression and hand back its JSON.
 *
 * Never throws for an operational reason. A caller must be able to tell "the app said no" from
 * "the app said something wrong", so both arrive as a result object rather than an exception.
 */
export async function evaluate(expression) {
  const cli = findCli();
  if (!cli) {
    return { ok: false, kind: "infrastructure", reason: "no Obsidian CLI found", value: null };
  }

  let stdout = "";
  try {
    ({ stdout } = await run(cli, ["eval", expression], { timeout: 30_000, maxBuffer: 8 << 20 }));
  } catch (error) {
    const text = `${error.stdout || ""}${error.stderr || ""}${error.message || ""}`;
    if (NOT_RUNNING.test(text)) {
      return { ok: false, kind: "infrastructure", reason: "Obsidian is not running", value: null };
    }
    return { ok: false, kind: "infrastructure", reason: text.trim().split("\n")[0], value: null };
  }

  // The CLI prefixes advisory lines; the payload is the last non-empty line.
  const payload = stdout.trim().split("\n").filter((l) => l.trim()).pop() ?? "";
  if (NOT_RUNNING.test(payload)) {
    return { ok: false, kind: "infrastructure", reason: "Obsidian is not running", value: null };
  }
  try {
    return { ok: true, kind: "value", reason: null, value: JSON.parse(payload) };
  } catch {
    // A non-JSON answer is still an answer; the caller decides whether it is usable.
    return { ok: true, kind: "text", reason: null, value: payload };
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. CHECKS
// ───────────────────────────────────────────────────────────────────

/**
 * Prove the transport round-trips, using a value the app alone can produce.
 *
 * Deliberately asks for something no fixture could fabricate — the app's own vault name and the
 * plugin's loaded state — so a pass cannot be produced by anything but the real app.
 */
async function checkTransport() {
  const result = await evaluate(
    "JSON.stringify({"
    + " vault: app.vault.getName(),"
    + " plugin: !!app.plugins.plugins['note-database'],"
    + " version: app.plugins.plugins['note-database']?.manifest?.version ?? null,"
    + " theme: document.body.classList.contains('theme-dark') ? 'dark' : 'light',"
    + " navbar: !!document.querySelector('.mobile-navbar')"
    + " })",
  );

  if (!result.ok) {
    console.error(`probe: cannot ask — ${result.reason}`);
    console.error("probe: open Obsidian and retry; this is not an assertion failure.");
    return EXIT_INFRASTRUCTURE;
  }

  const data = typeof result.value === "string" ? JSON.parse(result.value) : result.value;
  console.log(`  vault        ${data.vault}`);
  console.log(`  plugin       ${data.plugin ? "loaded" : "NOT LOADED"}`);
  console.log(`  version      ${data.version ?? "(none)"}`);
  console.log(`  theme        ${data.theme}`);
  console.log(`  navbar       ${data.navbar ? "present" : "absent (desktop)"}`);

  if (!data.plugin) {
    console.error("probe: FAIL — the plugin is not loaded in the running app");
    return EXIT_ASSERTION;
  }
  console.log("probe: PASS — the real app answered");
  return EXIT_PASS;
}

// ───────────────────────────────────────────────────────────────────
// 5. MAIN
// ───────────────────────────────────────────────────────────────────

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : null;
};

/**
 * Read the host navigation bar's stacking order from the running app.
 *
 * A phone sheet has to cover this bar, and covering it is settled by two things: the sheet must be
 * a child of the body, and it must then declare a layer above the bar's. The first is structural
 * and testable anywhere. The second needs a number that only the real app has — a headless fixture
 * can invent any value and prove nothing about the one that ships.
 *
 * Measured in a fixture, the sheet wins at a navbar z-index of 100 and 1000 and loses at 5000. This
 * is what turns that range into a fact.
 */
async function checkNavbar() {
  const result = await evaluate(`(() => {
    const nav = document.querySelector(".mobile-navbar");
    if (!nav) return { present: false };
    const s = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();
    return {
      present: true,
      zIndex: s.zIndex,
      position: s.position,
      height: Math.round(r.height),
      top: Math.round(r.top),
      parent: nav.parentElement ? nav.parentElement.className : null,
      safeAreaInset: getComputedStyle(document.body).getPropertyValue("--safe-area-inset-bottom").trim(),
    };
  })()`);

  if (!result.ok) {
    console.error(`probe: ${result.reason}`);
    return EXIT_INFRASTRUCTURE;
  }
  const nav = result.value;
  if (!nav.present) {
    console.log("probe: no .mobile-navbar in the running app — this is not a phone layout.");
    console.log("       Run this from Obsidian on a phone, or with the phone emulation enabled.");
    return EXIT_INFRASTRUCTURE;
  }

  console.log(`navbar z-index   ${nav.zIndex}`);
  console.log(`navbar position  ${nav.position}  height ${nav.height}px  top ${nav.top}px`);
  console.log(`navbar parent    .${nav.parent}`);
  console.log(`safe-area inset  ${nav.safeAreaInset || "(unset)"}`);

  const sheetLayer = 1000;
  const navLayer = nav.zIndex === "auto" ? 0 : Number(nav.zIndex);
  if (Number.isNaN(navLayer)) {
    console.error(`\nprobe: could not read the navbar's z-index as a number (${nav.zIndex}).`);
    return EXIT_ASSERTION;
  }
  if (navLayer > sheetLayer) {
    console.error(`\nprobe: FAIL — the navbar sits at ${navLayer}, above the sheet's ${sheetLayer}.`);
    console.error("A sheet portalled to the body would still be painted under it. Raise the sheet's");
    console.error("layer to clear this value, and record the number that made it necessary.");
    return EXIT_ASSERTION;
  }
  console.log(`\nprobe: PASS — the sheet's layer (${sheetLayer}) clears the navbar's (${navLayer}).`);
  return EXIT_PASS;
}

async function main() {
  const check = arg("--check");
  const expression = arg("--eval");

  if (expression) {
    const result = await evaluate(expression);
    if (!result.ok) {
      console.error(`probe: ${result.reason}`);
      return EXIT_INFRASTRUCTURE;
    }
    console.log(typeof result.value === "string" ? result.value : JSON.stringify(result.value, null, 2));
    return EXIT_PASS;
  }

  if (check === "transport") return checkTransport();
  if (check === "navbar") return checkNavbar();

  console.error("usage: node tools/live/probe.mjs --check transport | --eval '<expression>'");
  return EXIT_INFRASTRUCTURE;
}

main().then((code) => process.exit(code)).catch((error) => {
  console.error("probe:", error.message);
  process.exit(EXIT_INFRASTRUCTURE);
});
