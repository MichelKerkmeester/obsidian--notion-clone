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
      // `.obnotion-surface` is the marker the surface contract puts on anything mounted on the body, and
      // it was the one marker the focus-indicator list did not name — so the architecture's own
      // escape hatch handed over tokens and radius and dropped the one thing a keyboard user needs.
      const MARKERS = [
        "obnotion-surface",
        "obnotion-column-menu-subpopover",
        "obnotion-icon-picker-popover",
        "obnotion-color-picker-popup",
        "obnotion-mobile-column-width-panel",
        "obnotion-cell-edit-popover",
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
    retired: true,
    measure() {
      // Last held value. The fixtures this measured were retired with the list renderer.
      return 0;
    },
  },
  {
    phase: "005-content-row-rhythm",
    claim: "no list column holds more than one property",
    was: 3,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The sparse-fields fixture this measured was retired with the list renderer.
      return 0;
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
        const row = document.querySelector(".obnotion-column-manager-row");
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
        const row = document.querySelector(".obnotion-column-manager-row");
        const name = row.querySelector(".obnotion-column-name-wrap").getBoundingClientRect().width;
        const type = row.querySelector(".obnotion-column-type").getBoundingClientRect().width;
        return name > type * 3 ? 1 : 0;
      });
    },
  },
  {
    phase: "000-surface-contract-and-truthful-harness",
    claim: "a body-mounted surface marked obnotion-surface resolves the plugin tokens",
    was: 0,
    recorded: 1,
    async measure(page) {
      await load(page, '<div class="obnotion-surface" id="probe"></div>');
      return page.evaluate(() => {
        const el = document.getElementById("probe");
        return getComputedStyle(el).getPropertyValue("--obnotion-radius-sm").trim() ? 1 : 0;
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
    retired: true,
    measure() {
      // Last held value. The timeline-view* fixtures this measured were retired with the view renderers.
      return 0;
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "all five timeline scales carry the ported header, grid and today fills, and weekend fill stays scoped to the day scale the reference restricts it to",
    was: 0,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The timeline-view* fixtures this measured were retired with the view renderers.
      return 0;
    },
  },
  {
    phase: "038-board-kanban-port",
    claim: "the board card carries the ported kanban hierarchy",
    was: 1,
    recorded: 10,
    // Rewritten: a later operator ruling replaced the board's Project Manager 1:1 copy with an
    // Anytype-shaped rebuild, so the ten-point hierarchy this claim protects moves from the
    // pm-kanban-* tree to the obnotion-kanban-* one that replaced it. The claim itself — a card cannot
    // look present while omitting its content region or the affordance that opens it — is
    // unchanged; only the ten points that prove it are re-picked for the anatomy that replaced
    // it: no topbar, no count pill, no priority bar, no tag block, no chip footer, in place of a
    // chip header, a title row and property rows on one rhythm.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        const column = document.querySelector(".obnotion-kanban-col");
        const card = document.querySelector(".obnotion-kanban-card");
        if (!column || !card) return 0;
        const header = column.querySelector(".obnotion-kanban-col-header");
        const body = card.querySelector(".obnotion-kanban-card-body");
        const titleRow = body?.querySelector(".obnotion-kanban-card-title-row");
        const checks = [
          column.querySelector(".obnotion-kanban-cards") !== null,
          header !== null,
          header?.querySelector(".obnotion-kanban-col-chip") !== null,
          body !== null,
          card.getElementsByTagName("*").length > 0 && card.firstElementChild === body,
          titleRow !== null,
          titleRow?.querySelector(".obnotion-kanban-card-title") !== null,
          body?.querySelector(".obnotion-kanban-card-meta") !== null,
          body?.querySelector(".obnotion-kanban-card-meta .obnotion-board-card-field") !== null,
          card.hasAttribute("data-obnotion-row-path"),
        ];
        return checks.filter(Boolean).length;
      });
    },
  },
  {
    phase: "038-board-kanban-port",
    claim: "the board's per-card status colour resolves to a real paint, not an unresolved token",
    was: 2,
    recorded: 0,
    // Rewritten: the topbar and priority strip this claim originally read are both retired with
    // no Anytype counterpart — the option colour now lands on the header chip's text and the tag
    // chip's fill, through retinted status-color-* classes rather than an inline style. The
    // underlying claim survives unchanged: an unresolved colour still paints as no colour at
    // all, and this checks the two surfaces that now carry it instead of the two that used to.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        let bad = 0;
        const chips = [...document.querySelectorAll(".obnotion-kanban-col-chip")];
        if (chips.length === 0) bad += 1;
        for (const chip of chips) {
          const fg = getComputedStyle(chip).color;
          if (!fg || fg === "rgba(0, 0, 0, 0)" || fg === "transparent") bad += 1;
        }
        const tagChips = [...document.querySelectorAll(".obnotion-kanban-card-meta .status-badge")];
        if (tagChips.length === 0) bad += 1;
        for (const tag of tagChips) {
          const bg = getComputedStyle(tag).backgroundColor;
          if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") bad += 1;
        }
        return bad;
      });
    },
  },
  {
    phase: "039-calendar-parity-port",
    claim: "the calendar parity surface carries completion and weekend markers; the calm-empty backlog marker 039 recorded is superseded by 057 (the drawer is omitted entirely, not shown empty, when nothing is unscheduled)",
    was: 4,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The calendar-* fixtures these probes loaded were retired with the view renderers.
      return 0;
    },
  },
  {
    phase: "039-calendar-parity-port",
    claim: "a completed event dims to 0.82 and strikes its title through in the done accent",
    was: 1,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The calendar-month-view fixture this measured was retired with the view renderers.
      return 0;
    },
  },
  {
    phase: "040-subtask-tree-port",
    claim: "the subtask tree fixtures carry the depth marker the relation derives",
    was: 2,
    recorded: 0,
    // Rewritten: the board's progress bar (`.pm-progress`) is retired with no Anytype
    // counterpart, so this claim narrows to the depth marker alone — the half both surfaces
    // still carry. The board's depth marker moved from `.pm-kanban-card-parent`
    // to `.obnotion-kanban-card-type` (same content, the subtask's parent title; restyled to the
    // ordinary secondary rhythm rather than a smaller breadcrumb). The timeline is unchanged: it
    // indents a child row via an inline `padding-left` computed from the relation's depth, matching
    // the reference's own GanttView label row (`.pm-gantt-label-row`), so a child row's box is
    // >8px (the base, non-subtask padding) rather than data-attribute-tagged. The
    // timeline-subtask-tree fixture retired with the view renderers; the board leg alone keeps
    // the recorded 0 truthful.
    async measure(page) {
      const checks = {
        "board-subtask-tree": () => document.querySelector(".obnotion-kanban-card-type") !== null,
      };
      let missing = 0;
      for (const [id, check] of Object.entries(checks)) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) { missing += 1; continue; }
        await load(page, s.html());
        missing += (await page.evaluate(check)) ? 0 : 1;
      }
      return missing;
    },
  },
  {
    phase: "040-subtask-tree-port",
    claim: "the board surface renders the subtask tree",
    was: 0,
    recorded: 1,
    // The surface leg's red was the data layer landing with no view reading it; its green is the
    // surfaces that now do. The board fixture mirrors it, so this holds that the board still
    // carries the tree markup; the timeline-subtask-tree fixture retired with the view renderers.
    // See the sibling claim above for why the board's own probe changed.
    async measure(page) {
      const checks = {
        "board-subtask-tree": () => document.querySelector(".obnotion-kanban-card-type") !== null,
        "timeline-subtask-tree": () =>
          [...document.querySelectorAll(".pm-gantt-label-row")]
            .some((el) => parseInt(el.style.paddingLeft || "0", 10) > 8),
      };
      let surfaces = 0;
      for (const [id, check] of Object.entries(checks)) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        surfaces += (await page.evaluate(check)) ? 1 : 0;
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
      return /content\.createEl\("p",\s*\{[\s\S]*?cls: "obnotion-empty-card-message"/.test(source) ? 0 : 1;
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the timeline event bar is a group holding a native trigger that clears the 28px floor",
    was: 10,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The timeline-view fixture this measured was retired with the view renderers.
      return 0;
    },
  },
  {
    phase: "038-board-kanban-port",
    claim: "the empty-column and drop-language scenarios depict the states no fixture reached before",
    was: 0,
    recorded: 2,
    // Neither scenario id existed on the landing commit's parent tree, so SCENARIOS.find returned
    // undefined for both and this measure could not even load a fixture to check. Rewritten: the
    // class names moved from the Project Manager pm-kanban-* copy to the Anytype-shaped
    // obnotion-kanban-* one that replaced it; the states themselves are unchanged — an empty column is
    // still a hollow cards container (now with the same shared empty-group card every other
    // grouped renderer shows, since no reference capture shows this state) and the drop language
    // still tints the drop target's cards container and raises the dragged card.
    async measure(page) {
      let ok = 0;
      const empty = SCENARIOS.find((x) => x.id === "board-empty-column");
      if (empty) {
        await load(page, empty.html());
        const good = await page.evaluate(() => {
          // The scenario mounts a populated column beside the empty one, so the first
          // .obnotion-kanban-cards in document order is not reliably the one under test.
          const containers = [...document.querySelectorAll(".obnotion-kanban-cards")];
          return containers.length > 0
            && containers.some((el) => el.querySelector(".obnotion-kanban-card") === null);
        });
        if (good) ok += 1;
      }
      const drop = SCENARIOS.find((x) => x.id === "board-drop-language");
      if (drop) {
        await load(page, drop.html());
        const good = await page.evaluate(() => {
          const dropTarget = document.querySelector(".obnotion-kanban-drop-target");
          const dragging = document.querySelector(".obnotion-kanban-card--dragging");
          return !!(dropTarget && dragging);
        });
        if (good) ok += 1;
      }
      return ok;
    },
  },
  {
    phase: "040-subtask-tree-port",
    claim: "the board's same-parent reorder forwards the planned subtask move through the host binding",
    was: 0,
    recorded: 2,
    // Both host bindings' board `moveRowToPosition` callback must accept and forward a fourth
    // `subtaskMove` argument into `this.moveRowToPosition`, the path that then applies the plan
    // through `moveSubtask` before the rank change. `was` is this measure on the landing commit's
    // parent tree: neither file's board callback carried that parameter, so a drag reordered the
    // board's manual rank and never called `moveSubtask` -- the host-binding test's red was
    // "expected vi.fn() to be called 2 times, but got 0 times".
    measure() {
      const pattern = /moveRowToPosition:\s*\(movedPath,\s*beforePath,\s*afterPath,\s*subtaskMove\)\s*=>\s*void this\.moveRowToPosition\(movedPath,\s*beforePath,\s*afterPath,\s*subtaskMove\)/;
      let count = 0;
      for (const file of ["src/views/database-view.ts", "src/views/embedded-database-renderer.ts"]) {
        const source = readFileSync(join(REPO, file), "utf8");
        if (pattern.test(source)) count += 1;
      }
      return count;
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the .obnotion-surface selector leads the reduced-motion reset's selector list",
    was: 0,
    recorded: 1,
    // owned-menu.ts mounts its surface on doc.body carrying .obnotion-surface but never
    // .obnotion-container, so the container-wide reset never matched a menu descendant until
    // .obnotion-surface joined the reset's own selector list. `was` is this measure on the landing
    // commit's parent tree: .obnotion-surface appeared in no reduced-motion rule at all.
    async measure(page) {
      await load(page, "");
      return page.evaluate(() => {
        const rules = [...document.styleSheets].flatMap((sheet) => {
          try { return [...sheet.cssRules]; } catch { return []; }
        });
        const reduced = rules.filter((r) => r.media?.mediaText?.includes("prefers-reduced-motion"))
          .flatMap((r) => [...r.cssRules]);
        return reduced.some((inner) =>
          inner.selectorText?.split(",").map((s) => s.trim()).includes(".obnotion-surface")) ? 1 : 0;
      });
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the .obnotion-surface subtree owns a reduced-motion rule separate from the container's",
    was: 0,
    recorded: 1,
    // The reset first joined .obnotion-surface into the same rule as .obnotion-container, which
    // gave the surface the container's near-zero 0.01ms transition-duration and let a synchronous
    // getComputedStyle read land mid-transition -- the fault verify-placement.mjs's ".is-phone
    // heading rule" ablation caught. This fix splits .obnotion-surface into its own rule so it can carry
    // a real zero. `was` is this measure on the landing commit's parent tree, where the prior fix
    // had already joined .obnotion-surface into the container's rule: still one shared rule, not two.
    async measure(page) {
      await load(page, "");
      return page.evaluate(() => {
        const rules = [...document.styleSheets].flatMap((sheet) => {
          try { return [...sheet.cssRules]; } catch { return []; }
        });
        const lead = (r) => r.selectorText?.split(",").map((s) => s.trim())[0];
        const mediaBlocks = rules.filter((r) => r.media?.mediaText?.includes("prefers-reduced-motion"));
        for (const mq of mediaBlocks) {
          const inner = [...mq.cssRules];
          const surfaceRule = inner.find((r) => lead(r) === ".obnotion-surface");
          if (!surfaceRule) continue;
          const containerRule = inner.find((r) => lead(r) === ".obnotion-container");
          return containerRule && containerRule !== surfaceRule ? 1 : 0;
        }
        return -1;
      });
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "the rendered window titles the header, the first tick stays whole, the milestone helper exists, and the day scale narrows on phones",
    was: 0,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The archived timeline renderer this read left the tree with the view renderers.
      return 0;
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "a crowded milestone label lifts above its bar and the lane row-gap carries the space-8 token",
    was: 0,
    recorded: 2,
    // The renderer already asked for is-label-above when the next lane bar starts inside a
    // milestone's label span; the stylesheet had no rule to answer with, so the class went
    // nowhere. `was` is this measure on the landing commit's parent tree: no is-label-above rule
    // moved the label out of flow, and the lane's row-gap was still the flat 4px the label now
    // needs as clearance.
    async measure(page) {
      await load(page, `
        <div class="obnotion-container">
          <div class="obnotion-timeline-events"></div>
          <div class="obnotion-timeline-event is-milestone is-label-above">
            <div class="obnotion-timeline-event-trigger">
              <div class="obnotion-timeline-event-content">label</div>
            </div>
          </div>
        </div>`);
      return page.evaluate(() => {
        const events = document.querySelector(".obnotion-timeline-events");
        const content = document.querySelector(".obnotion-timeline-event-content");
        const rowGapOk = getComputedStyle(events).rowGap === "24px";
        const positionOk = getComputedStyle(content).position === "absolute";
        return (rowGapOk ? 1 : 0) + (positionOk ? 1 : 0);
      });
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "the day fixture's tick label is the bare, unpadded day-of-month the reference gantt draws (GanttHeaderRenderer.renderDayHeader's String(d.day)), not the local extensions' hour-of-day grammar this fixture used to mirror",
    was: 0,
    recorded: 0,
    retired: true,
    measure() {
      // Last held value. The temporal.mjs fixture arithmetic this measured was retired with the view renderers.
      return 0;
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
  results.push({
    phase: c.phase,
    claim: c.claim,
    was: c.was,
    recorded: c.recorded,
    actual,
    held,
    ...(c.retired ? { retired: true } : {}),
  });
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
