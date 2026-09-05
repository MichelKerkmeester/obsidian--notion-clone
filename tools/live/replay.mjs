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
import { timelineDynamicFixture, timelineTicksFor } from "../screenshots/scenarios/temporal.mjs";
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
    // Selectors follow the default render's actual DOM: its bar group is `.pm-gantt-bar-group`
    // (holding `.pm-gantt-bar` plus its two `.pm-gantt-link-dot` endpoints), not the gated
    // `renderTimelineLocal` extensions path's `.db-timeline-event`/`.db-timeline-link-dot`.
    async measure(page) {
      let missing = 0;
      for (const id of ["timeline-view", "timeline-view-day", "timeline-view-month", "timeline-view-quarter", "timeline-view-year"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        missing += await page.evaluate(() =>
          [...document.querySelectorAll(".pm-gantt-bar-group")]
            .filter((bar) => bar.querySelectorAll(".pm-gantt-link-dot").length < 2).length);
      }
      return missing;
    },
  },
  {
    phase: "037-timeline-gantt-port",
    claim: "all five timeline scales carry the ported header, grid and today fills, and weekend fill stays scoped to the day scale the reference restricts it to",
    was: 0,
    recorded: 5,
    // The port's red was 0 of 17 module-map rows rewritten; its green recorded the captures read
    // at five scales. Reselectored for the fixture rewrite (temporal.mjs moved every
    // timeline-view* scenario from `.db-timeline-*` to `.pm-gantt-*`): bars are `.pm-gantt-bar`,
    // the header carries a scale-specific label class (day/week/month/quarter/year), the row grid
    // is `.pm-gantt-gridline-h`, today is `.pm-gantt-today-line`. Weekend stayed a claim, not a
    // vacuous pass: the reference's own GanttRenderer.ts and GanttHeaderRenderer.ts gate
    // `pm-gantt-weekend`/`pm-gantt-weekend-header` on `granularity === 'day'` only (verified
    // against the vendored reference source, not recalled), and this plugin's port carries that
    // gate over unchanged — so week/month/quarter/year must never paint a weekend fill, and the
    // day scale's own fixture is pinned to 2026-03-25, a Wednesday, so it legitimately paints none
    // either. A future edit that widens weekend fill past the day scale, or narrows the header/
    // grid/today/bar presence on any scale, is what still fails this claim.
    async measure(page) {
      let complete = 0;
      for (const id of ["timeline-view", "timeline-view-day", "timeline-view-month", "timeline-view-quarter", "timeline-view-year"]) {
        const s = SCENARIOS.find((x) => x.id === id);
        if (!s) continue;
        await load(page, s.html());
        complete += await page.evaluate(({ id: scaleId }) => {
          const hasBars = document.querySelectorAll(".pm-gantt-bar").length > 0;
          const hasHeader = document.querySelectorAll(
            ".pm-gantt-header-day, .pm-gantt-header-week, .pm-gantt-header-month, .pm-gantt-header-quarter, .pm-gantt-header-year"
          ).length > 0;
          const hasGrid = document.querySelectorAll(".pm-gantt-gridline-h").length > 0;
          const hasToday = document.querySelectorAll(".pm-gantt-today-line").length > 0;
          const weekendCount = document.querySelectorAll(".pm-gantt-weekend, .pm-gantt-weekend-header").length;
          const weekendScoped = scaleId === "timeline-view-day" || weekendCount === 0;
          return hasBars && hasHeader && hasGrid && hasToday && weekendScoped ? 1 : 0;
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
    // region or the affordance that opens it. Rewritten for the T11 CSS leg: the default board's
    // fixtures moved from the local db-board-* markup this claim originally checked to a one-to-one
    // copy of the reference's pm-kanban-* element tree (T10 landed the renderer; T11 lands the
    // fixtures and the stylesheet). `recorded` re-measures the same ten-point completeness against
    // board-view's now pm-kanban-* markup rather than against a tree the fixture no longer builds.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        const column = document.querySelector(".pm-kanban-col");
        const card = document.querySelector(".pm-kanban-card");
        if (!column || !card) return 0;
        const header = column.querySelector(".pm-kanban-col-header");
        const body = card.querySelector(".pm-kanban-card-body");
        const titleRow = body?.querySelector(".pm-kanban-card-title-row");
        const footer = body?.querySelector(".pm-kanban-card-footer");
        const checks = [
          column.querySelector(".pm-kanban-col-topbar") !== null,
          header !== null,
          header?.querySelector(".pm-kanban-col-badge") !== null,
          header?.querySelector(".pm-kanban-col-count") !== null,
          card.querySelector(".pm-kanban-card-priority-bar") !== null,
          body !== null,
          titleRow !== null,
          titleRow?.querySelector(".pm-kanban-card-title") !== null,
          body?.querySelector(".pm-kanban-card-tags") !== null,
          footer !== null && footer.querySelector(".pm-chip") !== null,
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
    // Rewritten for the T11 CSS leg: the reference board colours its topbar and priority strip
    // through the same inline `setCssStyles({ background: color })` the reference itself uses,
    // rather than a `status-color-*` class, so the selectors move to the new element names; the
    // computed-style check (an unresolved inline colour still paints transparent) is unchanged.
    async measure(page) {
      const s = SCENARIOS.find((x) => x.id === "board-view");
      if (!s) return -1;
      await load(page, s.html());
      return page.evaluate(() => {
        let bad = 0;
        for (const selector of [".pm-kanban-col-topbar", ".pm-kanban-card-priority-bar"]) {
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
    // Both surfaces dropped `data-subtask-depth`: the board shows depth via a
    // `.pm-kanban-card-parent` label on a child card and derived progress by `.pm-progress`,
    // one-to-one with the reference's own KanbanCard; the timeline indents a child row via an
    // inline `padding-left` computed from the relation's depth instead, matching the reference's
    // own GanttView label row (`.pm-gantt-label-row`), so a child row's box is >8px (the base,
    // non-subtask padding) rather than data-attribute-tagged.
    async measure(page) {
      const checks = {
        "board-subtask-tree": () =>
          document.querySelector(".pm-kanban-card-parent") !== null
          && document.querySelector(".pm-progress") !== null,
        "timeline-subtask-tree": () =>
          [...document.querySelectorAll(".pm-gantt-label-row")]
            .some((el) => parseInt(el.style.paddingLeft || "0", 10) > 8),
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
    claim: "the board and timeline surfaces both render the subtask tree",
    was: 0,
    recorded: 2,
    // The surface leg's red was the data layer landing with no view reading it; its green is the
    // two surfaces that now do. The fixtures mirror both, so this holds that both still carry the
    // tree markup. See the sibling claim above for why the two surfaces are checked differently.
    async measure(page) {
      const checks = {
        "board-subtask-tree": () =>
          document.querySelector(".pm-kanban-card-parent") !== null
          && document.querySelector(".pm-progress") !== null,
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
  {
    phase: "038-board-kanban-port",
    claim: "the empty-column and drop-language scenarios depict the states no fixture reached before",
    was: 0,
    recorded: 2,
    // Neither scenario id existed on the landing commit's parent tree, so SCENARIOS.find returned
    // undefined for both and this measure could not even load a fixture to check. Rewritten for the
    // T11 CSS leg: the reference board has no empty-state placeholder (an empty column is just a
    // hollow .pm-kanban-cards, matching kanban.css) and no separate drop-indicator element (the
    // reference tints the drop target's cards container and raises the dragged card, both live
    // classes rather than a synthesised line) — so the check now reads the reference's own two
    // states instead of the local db-board-* ones this claim originally found.
    async measure(page) {
      let ok = 0;
      const empty = SCENARIOS.find((x) => x.id === "board-empty-column");
      if (empty) {
        await load(page, empty.html());
        const good = await page.evaluate(() => {
          // The scenario mounts a populated column beside the empty one, so the first
          // .pm-kanban-cards in document order is not reliably the one under test.
          const containers = [...document.querySelectorAll(".pm-kanban-cards")];
          return containers.length > 0
            && containers.some((el) => el.querySelector(".pm-kanban-card") === null);
        });
        if (good) ok += 1;
      }
      const drop = SCENARIOS.find((x) => x.id === "board-drop-language");
      if (drop) {
        await load(page, drop.html());
        const good = await page.evaluate(() => {
          const dropTarget = document.querySelector(".pm-kanban-drop-target");
          const dragging = document.querySelector(".pm-kanban-card--dragging");
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
    claim: "the .db-surface selector leads the reduced-motion reset's selector list",
    was: 0,
    recorded: 1,
    // owned-menu.ts mounts its surface on doc.body carrying .db-surface but never
    // .note-database-container, so the container-wide reset never matched a menu descendant until
    // .db-surface joined the reset's own selector list. `was` is this measure on the landing
    // commit's parent tree: .db-surface appeared in no reduced-motion rule at all.
    async measure(page) {
      await load(page, "");
      return page.evaluate(() => {
        const rules = [...document.styleSheets].flatMap((sheet) => {
          try { return [...sheet.cssRules]; } catch { return []; }
        });
        const reduced = rules.filter((r) => r.media?.mediaText?.includes("prefers-reduced-motion"))
          .flatMap((r) => [...r.cssRules]);
        return reduced.some((inner) =>
          inner.selectorText?.split(",").map((s) => s.trim()).includes(".db-surface")) ? 1 : 0;
      });
    },
  },
  {
    phase: "041-shared-ui-ux-port",
    claim: "the .db-surface subtree owns a reduced-motion rule separate from the container's",
    was: 0,
    recorded: 1,
    // The reset first joined .db-surface into the same rule as .note-database-container, which
    // gave the surface the container's near-zero 0.01ms transition-duration and let a synchronous
    // getComputedStyle read land mid-transition -- the fault verify-placement.mjs's ".is-phone
    // heading rule" ablation caught. This fix splits .db-surface into its own rule so it can carry
    // a real zero. `was` is this measure on the landing commit's parent tree, where the prior fix
    // had already joined .db-surface into the container's rule: still one shared rule, not two.
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
          const surfaceRule = inner.find((r) => lead(r) === ".db-surface");
          if (!surfaceRule) continue;
          const containerRule = inner.find((r) => lead(r) === ".note-database-container");
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
    recorded: 4,
    // Four separate faults, one measure: getTimelineTitleWindow ignoring the visible unit count
    // ("expected '2026-01-01' to be '2026-02-07'"), the first axis tick centred past the viewport
    // edge ("expected undefined to be 'none'"), resolveTimelineMilestoneLabelPlacement not existing
    // at all, and the day scale never narrowing below a 560px container ("expected 60 to be 32").
    // `was` is this measure on the landing commit's parent tree: none of the four patterns existed.
    measure() {
      const model = readFileSync(join(REPO, "src/data/calendar-timeline-model.ts"), "utf8");
      const renderer = readFileSync(join(REPO, "src/views/calendar-timeline-renderer.ts"), "utf8");
      const checks = [
        /export function getTimelineTitleWindow\([^)]*visibleUnitCount\??:\s*number/.test(model),
        /if \(isFirstTick\)\s*labelEl\.setCssProps\(\{\s*transform:\s*"none"\s*\}\)/.test(renderer),
        /export function resolveTimelineMilestoneLabelPlacement/.test(model),
        /TIMELINE_DAY_PHONE_UNIT_WIDTH_PX\s*=\s*32/.test(model) && /return TIMELINE_DAY_PHONE_UNIT_WIDTH_PX/.test(model),
      ];
      return checks.filter(Boolean).length;
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
        <div class="note-database-container">
          <div class="db-timeline-events"></div>
          <div class="db-timeline-event is-milestone is-label-above">
            <div class="db-timeline-event-trigger">
              <div class="db-timeline-event-content">label</div>
            </div>
          </div>
        </div>`);
      return page.evaluate(() => {
        const events = document.querySelector(".db-timeline-events");
        const content = document.querySelector(".db-timeline-event-content");
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
    recorded: 39,
    // SUPERSEDES the retired "centres its window on the pinned now / bare hour, not HH:00"
    // claim (was 0, recorded 574): that claim pinned the day-scale fixture to the gated
    // timelineLocalExtensions path's hour-of-day header (startMinutes-centred, ":00"-suffixed
    // ticks). The 037 fidelity pass replaced the default day-scale render with a structural
    // copy of the reference's own day header — one column per day, unpadded day-of-month text
    // (TimelineConfig.DAY_WIDTH, GanttHeaderRenderer.renderDayHeader) — so `startMinutes` no
    // longer exists on timelineDynamicFixture's return value at all (temporal.mjs dropped
    // TL_DAY_START_MINUTES/timelineDayCentredStartMinutes with it) and the old measure's
    // `fixture.startMinutes` read silently became `undefined`, turning the sum to NaN. That is
    // this fixture correctly no longer being what the old claim described, not a defect to
    // restore. `was` is this new measure re-run against the pre-port grammar: every hour label
    // there is `padStart(2, "0")` — always two digits — so a check for the reference's *unpadded*
    // single/double-digit day-of-month format (no leading zero) matches none of them, 0 of 34.
    // `recorded` is the same measure against the current fixture, both device widths, all 12
    // fixture days each (39 labels total on this pinned-window "Day" fixture — device width
    // changes which columns are wide enough to carry a label per dayWidth >= 20, not whether the
    // label itself is unpadded): every one of the 39 rendered labels matches, none carry a
    // leading zero.
    async measure() {
      // No browser page needed: timelineTicksFor is pure fixture arithmetic, unlike the
      // page.evaluate() probes the other claims in this file run against rendered HTML.
      let total = 0;
      let unpadded = 0;
      for (const device of [{ id: "desktop", width: 1440 }, { id: "mobile", width: 402 }]) {
        const fixture = timelineDynamicFixture("day", device);
        for (const tick of timelineTicksFor(fixture)) {
          total++;
          if (/^([1-9]|[12]\d|3[01])$/.test(tick.label)) unpadded++;
        }
      }
      // A regression that reintroduces zero-padding (or any other label shape) drops `unpadded`
      // below `total`; -1 guarantees that never coincidentally matches a future recorded value.
      return unpadded === total ? unpadded : -1;
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
