// ───────────────────────────────────────────────────────────────────
// MODULE:    replay
// COMPONENT: re-asserts every landed phase's result against today's tree
// ───────────────────────────────────────────────────────────────────
//
// No phase can know that a later stylesheet edit preserved its result. There is
// one serialised lane through a nineteen-thousand-line file that every phase
// holds in turn, and that file already contains eighty-seven duplicated
// selectors and a hundred and twenty-four silently overridden values. A phase
// that measures its surfaces green, releases the lane and watches three more
// phases edit the same file has proven something about a tree that no longer
// exists.
//
// So each claim below is held with the number the phase that made it recorded,
// and re-checked here. A reversal is reported as the specific claim it broke and
// the phase that owns it, rather than as a count of failures — because the
// person reading this needs to know whose work just came undone.
//
// Run it at every lane handoff, not only at release. A gate delivered after the
// work it guards is a report.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { SCENARIOS } from "../screenshots/scenarios.mjs";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].find(existsSync) || process.env.SCREENSHOT_CHROME;

// ───────────────────────────────────────────────────────────────────
// 3. THE CLAIMS
// ───────────────────────────────────────────────────────────────────

/**
 * Each entry is a result some phase measured and is entitled to keep.
 *
 * `recorded` is what that phase measured when it landed — not a threshold picked afterwards. Where
 * a claim is "zero of something", the number the defect stood at before the fix is kept in `was`,
 * so a reversal can be recognised by its own original value.
 */
const CLAIMS = [
  {
    phase: "004-checkbox-ownership",
    claim: "no checkbox falls back to the platform box",
    was: 23,
    recorded: 0,
    async measure(page) {
      let platform = 0;
      for (const s of SCENARIOS.filter((x) => typeof x.html === "function")) {
        let html;
        try { html = s.html(); } catch { continue; }
        await load(page, html);
        platform += await page.evaluate(() =>
          [...document.querySelectorAll('input[type="checkbox"]')]
            .filter((el) => getComputedStyle(el).appearance !== "none").length);
      }
      return platform;
    },
  },
  {
    phase: "004-checkbox-ownership",
    claim: "no checkbox or switch borrows its appearance from an ancestor",
    was: 10,
    recorded: 0,
    async measure(page) {
      let borrowed = 0;
      for (const s of SCENARIOS.filter((x) => typeof x.html === "function")) {
        let html;
        try { html = s.html(); } catch { continue; }
        await load(page, html);
        // Strip each ancestor's classes in turn and re-read. A box whose `appearance` moves is one
        // an ancestor was styling, which is the same box that reverts to the platform control the
        // moment the surface is portalled to the body.
        borrowed += await page.evaluate(() =>
          [...document.querySelectorAll('input[type="checkbox"]')].filter((el) => {
            const before = getComputedStyle(el).appearance;
            for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
              const saved = n.className;
              if (!saved) continue;
              n.className = "";
              const after = getComputedStyle(el).appearance;
              n.className = saved;
              if (after !== before) return true;
            }
            return false;
          }).length);
      }
      return borrowed;
    },
  },
  {
    phase: "001-overlay-width-and-chrome",
    claim: "every surface marker grants a focus ring to a control mounted outside the container",
    was: 1,
    recorded: 0,
    async measure(page) {
      // `.db-surface` is the marker the surface contract puts on anything mounted on the body, and
      // it was the one marker the focus-indicator list did not name — so the architecture's own
      // escape hatch handed over tokens and radius and dropped the one thing a keyboard user needs.
      const MARKERS = [
        "db-surface",
        "db-column-menu-subpopover",
        "db-icon-picker-popover",
        "db-color-picker-popup",
        "db-mobile-column-width-panel",
        "db-cell-edit-popover",
      ];
      await load(page, "");
      return page.evaluate((markers) => {
        let missing = 0;
        for (const marker of markers) {
          const host = document.body.appendChild(document.createElement("div"));
          host.className = marker;
          const button = host.appendChild(document.createElement("button"));
          button.textContent = "x";
          // :focus-visible needs a keyboard-shaped focus; a scripted .focus() does not always set it,
          // so the ring is read from the rule that matches rather than from the focused element.
          const ring = [...document.styleSheets].flatMap((sheet) => {
            try { return [...sheet.cssRules]; } catch { return []; }
          }).some((rule) => rule.selectorText?.includes(`.${marker} :is(`)
            && rule.selectorText.includes(":focus-visible")
            && rule.style?.boxShadow);
          if (!ring) missing += 1;
          host.remove();
        }
        return missing;
      }, MARKERS);
    },
  },
  {
    phase: "005-content-row-rhythm",
    claim: "no list row paints outside its container",
    was: 26,
    recorded: 0,
    async measure(page) {
      let worst = 0;
      for (const id of ["list-view", "list-mobile"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        worst = Math.max(worst, await page.evaluate(() => {
          const rows = [...document.querySelectorAll(".db-list-row")];
          if (!rows.length) return 0;
          const parent = rows[0].parentElement.getBoundingClientRect().width;
          return Math.round(Math.max(...rows.map((r) => r.getBoundingClientRect().width - parent)));
        }));
      }
      return worst;
    },
  },
  {
    phase: "005-content-row-rhythm",
    claim: "no list column holds more than one property",
    was: 3,
    recorded: 0,
    async measure(page) {
      // The renderer omits a field whose value is empty, so this only shows up on rows with gaps.
      // Every other list fixture gives every row every field and reports zero however broken it is.
      const sparse = SCENARIOS.find((x) => x.id === "list-sparse-fields");
      if (!sparse) return -1;
      await load(page, sparse.html());
      return page.evaluate(() => {
        const byColumn = new Map();
        for (const meta of document.querySelectorAll(".db-list-row-meta")) {
          for (const field of meta.querySelectorAll(".db-list-field")) {
            const x = Math.round(field.getBoundingClientRect().left);
            const label = field.querySelector(".db-list-field-label")?.textContent ?? "";
            // A reserved box carries no label, because the renderer builds it with no children at
            // all. Counting its empty string as a property name put a second "name" in every column
            // that held one, so the claim reported a collision wherever a card had a gap — a
            // statement about the fixture's markup rather than about the columns. This read 0 only
            // while the fixture gave its placeholders a label the renderer never gives them.
            if (!label) continue;
            if (!byColumn.has(x)) byColumn.set(x, new Set());
            byColumn.get(x).add(label);
          }
        }
        return [...byColumn.values()].filter((labels) => labels.size > 1).length;
      });
    },
  },
  {
    phase: "002-properties-panel",
    claim: "the properties row stays on one line",
    was: 2,
    recorded: 1,
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "panel-column-manager");
      if (!s) return 1;
      await load(page, s.html());
      return page.evaluate(() => {
        const row = document.querySelector(".db-column-manager-row");
        return getComputedStyle(row).gridTemplateRows.split(/\s+/).filter(Boolean).length;
      });
    },
  },
  {
    phase: "002-properties-panel",
    claim: "the property name takes the flexible track, not the type icon",
    was: 0,
    recorded: 1,
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "panel-column-manager");
      if (!s) return 0;
      await load(page, s.html());
      return page.evaluate(() => {
        const row = document.querySelector(".db-column-manager-row");
        const name = row.querySelector(".db-column-name-wrap").getBoundingClientRect().width;
        const type = row.querySelector(".db-column-type").getBoundingClientRect().width;
        return name > type * 3 ? 1 : 0;
      });
    },
  },
  {
    phase: "000-surface-contract-and-truthful-harness",
    claim: "a body-mounted surface marked db-surface resolves the plugin tokens",
    was: 0,
    recorded: 1,
    async measure(page) {
      await load(page, '<div class="db-surface" id="probe"></div>');
      return page.evaluate(() => {
        const el = document.getElementById("probe");
        return getComputedStyle(el).getPropertyValue("--db-radius-sm").trim() ? 1 : 0;
      });
    },
  },
  {
    phase: "031-sheet-lifecycle-ownership",
    claim: "a closed sheet removes its body-mounted chrome",
    was: 0,
    recorded: 0,
    runtime: {
      artifact: "tools/live/sheet-teardown.json",
      redLivesIn: "the sheet-teardown lane",
      cases: [{
        name: "DbModal with a detached host wrapper",
        preFixFailure: "1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed",
      }],
    },
    measure() {
      return readRuntimeChecks(this.runtime);
    },
  },
  {
    phase: "031-sheet-lifecycle-ownership",
    claim: "one finger runs one action after a sheet rebuild",
    was: 0,
    recorded: 0,
    runtime: {
      artifact: "tools/live/sheet-rebuild.json",
      redLivesIn: "the sheet-rebuild lane",
      cases: [{
        name: "a tap that never moves",
        preFixFailure: "dismissed the sheet — the press is not reaching the bar, and every gesture above is passing for that reason rather than its own",
      }],
    },
    measure() {
      return readRuntimeChecks(this.runtime);
    },
  },
  {
    phase: "031-sheet-lifecycle-ownership",
    claim: "a rebuilt sheet keeps an inside tap inside its panel",
    was: 0,
    recorded: 0,
    runtime: {
      artifact: "tools/live/sheet-rebuild.json",
      redLivesIn: "the sheet-rebuild lane",
      cases: [
        "sort sheet (real SortPanelRenderer, add-sort)",
        "filter sheet (real FilterPanelRenderer, add-condition)",
        "embedded filter sheet (real FilterPanelRenderer, portalled on phone)",
      ].map((name) => ({
        name,
        preFixFailure: "a tap inside the panel the rebuild just created read as OUTSIDE",
      })),
    },
    measure() {
      return readRuntimeChecks(this.runtime);
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "the timeline bars carry the dependency-link affordance the seam gates",
    was: 5,
    recorded: 0,
    // A bar without both endpoint dots cannot expose the dependency interaction. `was` is this
    // measure run on the landing commit's parent tree, where only the one timeline fixture existed
    // and all five of its bars were dotless; the four extra scale fixtures arrived with the fix.
    async measure(page) {
      let missing = 0;
      for (const id of ["timeline-view", "timeline-view-day", "timeline-view-month", "timeline-view-quarter", "timeline-view-year"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        missing += await page.evaluate(() =>
          [...document.querySelectorAll(".db-timeline-event")]
            .filter((bar) => bar.querySelectorAll(".db-timeline-link-dot").length < 2).length);
      }
      return missing;
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "all five timeline scales carry the ported header, grid, weekend and today fills",
    was: 0,
    recorded: 5,
    // The port's red was 0 of 17 module-map rows rewritten; its green recorded the captures read
    // at five scales. A day window is one weekday, so the day fixture carries no weekend tick by
    // construction — the weekend requirement applies to the four multi-day scales.
    async measure(page) {
      let complete = 0;
      for (const id of ["timeline-view", "timeline-view-day", "timeline-view-month", "timeline-view-quarter", "timeline-view-year"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        complete += await page.evaluate(({ id: scaleId }) => {
          const hasBars = document.querySelectorAll(".db-timeline-event").length > 0;
          const hasTicks = document.querySelectorAll(".db-timeline-tick").length > 0;
          const hasToday = document.querySelectorAll(".db-timeline-today-line").length > 0;
          const hasWeekend = document.querySelectorAll(".db-timeline-tick.is-weekend").length > 0;
          return hasBars && hasTicks && hasToday && (scaleId === "timeline-view-day" || hasWeekend) ? 1 : 0;
        }, { id });
      }
      return complete;
    },
  },
  {
    phase: "038-board-kanban-port",
    claim: "the board card carries the ported kanban hierarchy",
    was: 1,
    recorded: 10,
    // The complete hierarchy is required so a card cannot look present while omitting its content
    // region or the affordance that opens it.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        const column = document.querySelector(".db-board-column");
        const card = document.querySelector(".db-board-card");
        if (!column || !card) return 0;
        const checks = [
          column.querySelector(".db-board-column-topbar") !== null,
          card.querySelector(".db-board-card-controls") !== null,
          card.querySelector(".db-board-card-priority-strip") !== null,
          card.querySelector(".db-board-card-body") !== null,
          card.querySelector(".db-board-card-body > .db-board-card-parent") !== null,
          card.querySelector(".db-board-card-body > .db-record-title-line") !== null,
          card.querySelector(".db-record-title-line .db-board-card-title") !== null,
          card.querySelector(".db-record-title-line .db-board-card-chips") !== null,
          card.querySelector(".db-board-card-meta") !== null,
          card.querySelectorAll(".db-board-card-meta .db-board-card-field").length >= 2,
        ];
        return checks.filter(Boolean).length;
      });
    },
  },
  {
    phase: "038-board-kanban-port",
    claim: "the board topbar and priority strip resolve their status colours from the token ladder",
    was: 2,
    recorded: 0,
    // Both status-colour surfaces must exist before their computed paint can be meaningful.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        let bad = 0;
        for (const selector of [".db-board-column-topbar", ".db-board-card-priority-strip"]) {
          const elements = [...document.querySelectorAll(selector)];
          if (elements.length === 0) {
            bad += 1;
            continue;
          }
          for (const el of elements) {
            const bg = getComputedStyle(el).backgroundColor;
            if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") bad += 1;
          }
        }
        return bad;
      });
    },
  },
  {
    phase: "039-calendar-parity-port",
    claim: "the calendar parity surface carries completion, weekend and calm-empty markers",
    was: 4,
    recorded: 0,
    // Each probe represents a separate surface contract, and a missing fixture must count as a
    // failure rather than making an empty query look green.
    async measure(page) {
      const probes = [
        { id: "calendar-month-view", check: () =>
          [...document.querySelectorAll(".db-calendar-month-segment")].some((el) => el.classList.contains("is-completed")) ? 0 : 1 },
        { id: "calendar-week-time-grid", check: () =>
          document.querySelectorAll(".db-calendar-time-header-day.is-weekend").length > 0 ? 0 : 1 },
        { id: "calendar-month-view", check: () =>
          document.querySelectorAll(".db-calendar-backlog-empty").length > 0 ? 0 : 1 },
        { id: "calendar-empty-state", check: () => {
          const title = document.querySelector(".db-empty-card-title");
          return title && title.textContent.trim() === "No date property" ? 0 : 1;
        } },
      ];
      let missing = 0;
      for (const probe of probes) {
        const s = SCENARIOS.find((x) => x.id === probe.id);
        if (!s) { missing += 1; continue; }
        await load(page, s.html());
        missing += await page.evaluate(probe.check);
      }
      return missing;
    },
  },
  {
    phase: "039-calendar-parity-port",
    claim: "a completed event dims to 0.82 and strikes its title through in the done accent",
    was: 1,
    recorded: 0,
    // A missing completed marker is a failed treatment, even when no descendant exists to style.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "calendar-month-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        let bad = 0;
        const segments = [...document.querySelectorAll(".db-calendar-month-segment.is-completed")];
        if (segments.length === 0) return 1;
        for (const seg of segments) {
          if (getComputedStyle(seg).opacity !== "0.82") bad += 1;
          const title = seg.querySelector(".db-calendar-month-title");
          if (!title || !getComputedStyle(title).textDecorationLine.includes("line-through")) bad += 1;
        }
        return bad;
      });
    },
  },
  {
    phase: "040-subtask-tree-port",
    claim: "the subtask tree fixtures carry the depth and progress markers the relation derives",
    was: 2,
    recorded: 0,
    // Both rendered surfaces need their depth marker; a missing fixture must count as a failure.
    async measure(page) {
      let missing = 0;
      for (const id of ["board-subtask-tree", "timeline-subtask-tree"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) { missing += 1; continue; }
        await load(page, s.html());
        missing += await page.evaluate(() => document.querySelectorAll("[data-subtask-depth]").length > 0 ? 0 : 1);
      }
      return missing;
    },
  },
  {
    phase: "040-subtask-tree-port",
    claim: "the board and timeline surfaces both render the subtask tree",
    was: 0,
    recorded: 2,
    // The surface leg's red was the data layer landing with no view reading it; its green is the
    // two surfaces that now do. The fixtures mirror both, so this holds that both still carry the
    // tree markup.
    async measure(page) {
      let surfaces = 0;
      for (const id of ["board-subtask-tree", "timeline-subtask-tree"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        surfaces += await page.evaluate(() => document.querySelectorAll("[data-subtask-depth]").length > 0 ? 1 : 0);
      }
      return surfaces;
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the empty-card message is a paragraph in the renderer",
    was: 1,
    recorded: 0,
    // The element type is the product change; a stylesheet rule can exist while the renderer still emits a div.
    measure() {
      const source = readFileSync(join(REPO, "src/views/empty-state-renderer.ts"), "utf8");
      return /content\.createEl\("p",\s*\{[\s\S]*?cls: "db-empty-card-message"/.test(source) ? 0 : 1;
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the timeline event bar is a group holding a native trigger that clears the 28px floor",
    was: 10,
    recorded: 0,
    // The event container must remain a group while its native trigger owns the interaction and
    // clears the minimum target size. `was` is this measure on the landing commit's parent tree:
    // five bars, each a bare button with no trigger inside it, which is two faults per bar.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "timeline-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        let bad = 0;
        for (const bar of document.querySelectorAll(".db-timeline-event")) {
          if (bar.tagName === "BUTTON") bad += 1;
          const trigger = bar.querySelector(".db-timeline-event-trigger");
          if (!trigger) bad += 1;
          else if (trigger.getBoundingClientRect().height < 28) bad += 1;
        }
        return bad;
      });
    },
  },
];

// ───────────────────────────────────────────────────────────────────
// 4. RUN
// ───────────────────────────────────────────────────────────────────

const css = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

// Runtime lifecycle claims are valid only when their lane has recorded the named passing case
// and the failure text that made the case worth keeping.
function readRuntimeChecks(definition) {
  if (!definition || !Array.isArray(definition.cases)) return 1;
  const path = join(REPO, definition.artifact);
  if (!existsSync(path)) return 1;
  let record;
  try {
    record = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return 1;
  }
  const checks = Array.isArray(record.checks) ? record.checks : [];
  return definition.cases.every(({ name, preFixFailure }) => {
    const check = checks.find((candidate) => candidate.name === name);
    return check?.pass === true && check.preFixFailure === preFixFailure;
  }) ? 0 : 1;
}

async function load(page, html) {
  await page.setContent(`<body><div id="shot">${html}</div></body>`);
  await page.addStyleTag({ content: css });
  await page.addStyleTag({ content: theme });
  await page.addStyleTag({ content: runtime });
  await page.evaluate(() => document.fonts.ready);
}

if (!CHROME) {
  console.error("replay: no Chrome found. Set SCREENSHOT_CHROME.");
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

const reversed = [];
const results = [];
console.log(`replay: re-asserting ${CLAIMS.length} landed results against today's tree\n`);
for (const c of CLAIMS) {
  const actual = await c.measure(page);
  const held = actual === c.recorded;
  results.push({ phase: c.phase, claim: c.claim, was: c.was, recorded: c.recorded, actual, held });
  if (!held) reversed.push({ ...c, actual });
  console.log(`  ${held ? "held " : "BROKE"}  ${c.phase}`);
  console.log(`         ${c.claim}`);
  console.log(`         recorded ${c.recorded}, now ${actual}${held ? "" : `  (the defect stood at ${c.was})`}`);
}
await browser.close();

// The claim set is itself a ratchet, the same shape as the renderer-coverage stamp: an entry
// removed by a later phase must red this lane rather than silently shrinking the re-asserted set.
// The stamped count is the published one, so the first run after a removal compares against the
// last run that still carried the entry.
let published = 0;
if (existsSync(join(REPO, "tools/live/replay.json"))) {
  const record = JSON.parse(readFileSync(join(REPO, "tools/live/replay.json"), "utf8"));
  published = Array.isArray(record.claims) ? record.claims.length : 0;
}
if (CLAIMS.length < published) {
  console.error(`replay: FAIL — ${published - CLAIMS.length} required claim(s) are missing: `
    + `${published} published, this run carries ${CLAIMS.length}`);
  console.error("  removing an entry is how a gate stops covering what its wording claims; restore it");
  process.exit(1);
}

// Dated so the freshness lane can see it. Every claim above is measured by loading a fixture and
// reading computed style, so the files that decide the answer are enumerable -- which is the whole
// reason this may be stamped at all. A result whose inputs cannot be listed does not belong in an
// artefact that claims to be current, and one of those had already sat here recording a gate as
// failing for a session after it went green.
//
// Written whether or not the claims held. Stamping only a passing run would leave the last green
// record in place while the lane was red, which is the same lie in the other direction.
stamp("tools/live/replay.json", {
  claims: results,
  reversed: reversed.length,
}, [
  "styles.css",
  "tools/screenshots/theme.css",
  "tools/screenshots/runtime-vars.css",
  "tools/screenshots/scenarios.mjs",
  "tools/live/replay.mjs",
]);

console.log("");
if (reversed.length === 0) {
  console.log(`replay: PASS — all ${CLAIMS.length} results still hold`);
  process.exit(0);
}
console.error(`replay: FAIL — ${reversed.length} result(s) reversed since the phase that measured them`);
for (const r of reversed) {
  console.error(`  ${r.phase} measured ${r.recorded} and now gets ${r.actual}.`);
}
console.error("\nA later edit undid earlier work. Find which, rather than re-recording the new number:");
console.error("the recorded value is the claim, and moving it to match is how a gate stops being one.");
process.exit(1);
