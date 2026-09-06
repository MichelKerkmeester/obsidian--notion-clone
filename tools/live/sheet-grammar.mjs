#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-grammar
// COMPONENT: gate check that every registered phone sheet surface satisfies all eight grammar columns
// ───────────────────────────────────────────────────────────────────
//
// The phone's sheets used to be aligned by hand and verified by eye, and the
// operator found three non-conforming surfaces in one evening. The grammar
// now lives as predicates in `src/views/sheet-grammar.ts`; this lane mounts
// every surface that must conform — through the same constructed seam the
// other renderer lanes use, on a phone page so the surfaces present as the
// sheets the operator sees — and reports one row per surface per element.
// A surface that loses an element fails here instead of on a device.
//
// Two facts no structural predicate can see are measured here instead: the
// close control's own hit box against the 44px floor, and whether anything
// the surface drew reaches past its own right edge — report 41's overflowing
// "Formula result storage" group, found by a fresh review at 07be64fe, is
// exactly a surface that could pass every structural predicate while still
// running 2px past its own edge.
//
// A check that has never been observed red is not evidence, so the lane also
// runs its own negative control: it removes one element from one conforming
// surface, requires the row for that surface and element to go red while
// every other row stays green, then re-mounts clean and requires green
// again. A control that fails to go red fails the lane.
//
// The registry is deliberate: only surfaces this phase guarantees. The two
// legs that re-dress the column-width adjuster and the settings sheet land
// their own surfaces here when they land; a surface is added when it
// conforms, not when it is hoped to.
//
// One check refuses that narrowing, and it is the sweep in section 4b. A phone
// is 390px wide and cannot pan, so a surface that draws past its own right edge
// has put content where no thumb can reach it whether or not that surface has
// earned a header. The sweep therefore runs over every sheet the plugin can
// present — the registry above plus the surfaces the sheet and stacked-surface
// inventories enumerate that it does not carry — on both engines, twice: once
// with the fixtures' own names, once with every vault-derived string replaced by
// a single unbreakable word, because a property name belongs to the user and no
// length can be assumed. It has its own negative control: a child wider than the
// phone, injected into a surface the sweep just called clean, which must register
// as overflow and must stop doing so when it is removed.
//
// Usage: node tools/live/sheet-grammar.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright-core";
import { buildRenderAssertionBundle } from "./render-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. THE REGISTRY
// ───────────────────────────────────────────────────────────────────

// Each entry mounts through the harness's constructed seam on a phone page and must satisfy
// every grammar element. The specs are the same shapes the capture pipeline already constructs.
const REGISTERED_SURFACES = [
  { name: "sort-panel", spec: { renderer: "sort-panel", bag: "file-view", captureData: true } },
  { name: "filter-panel", spec: { renderer: "filter-panel", bag: "file-view", captureData: true } },
  { name: "add-view", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" } },
  { name: "record-detail", spec: { renderer: "record-detail", bag: "file-view", captureData: true } },
  // On a touch mount the peek hands off to the record sheet, so this row asserts the sheet a
  // phone actually gets rather than the rail a phone cannot use.
  { name: "record-peek", spec: { renderer: "record-peek", bag: "file-view", captureData: true } },
  // The column-width leg landed on main with its own header/close and conforms outright: all
  // seven elements measured green against the real `openColumnWidthAdjuster` module entry.
  { name: "column-width", spec: { renderer: "column-width-adjuster", bag: "file-view", captureData: true } },
  { name: "settings", spec: { renderer: "view-config", bag: "file-view", captureData: true } },
  // The properties panel. Its row carries a class the padded-rows predicate did not originally
  // recognise, even though the row already cleared the padding floor under its own pre-existing
  // rule — the gap was the predicate's vocabulary, not this panel's markup, so the predicate grew
  // one more accepted synonym rather than this panel's markup changing.
  { name: "column-manager", spec: { renderer: "column-manager", bag: "file-view", captureData: true } },
  // The board's own Properties section (`renderBoardCardProperties`), reached through the same
  // `view-config` sheet body as `settings` but with `viewConfigVariant: "board"` so the board
  // branch — cover/title fixed rows plus the reorderable field list — mounts instead of the
  // table branch. Measured 5/7 at `7b976e28` (rows/segmented red on the shared settings-body
  // markup this section does not own); the settings-body grammar landing carried both the fixed
  // rows (`asSheet`) and the shared body onto the grammar, so this row now measures the same
  // shared markup this section always depended on.
  { name: "board-card-properties", spec: { renderer: "view-config", bag: "file-view", captureData: true, viewConfigVariant: "board" } },
  // The four dropdown families that present as sheets on the phone, registered as a fresh review
  // found missing: none of the four owned a header, so all four measured 5/7 by this lane's own
  // predicates before the "header everywhere" decision. The owned menu's title names the row,
  // column or field it opened for, and falls back to the active view's name; the other three take
  // the field they edit. Same constructed specs `render-assertion-harness.ts` builds for the
  // field/chrome captures.
  { name: "owned-menu", spec: { renderer: "owned-menu", bag: "file-view" } },
  { name: "date-picker", spec: { renderer: "date-picker", bag: "file-view" } },
  { name: "icon-picker", spec: { renderer: "icon-picker", bag: "file-view" } },
  { name: "option-color-picker", spec: { renderer: "color-picker", bag: "file-view" } },
  // ConfirmModal itself can never mount here: it extends Obsidian's Modal, which the bundle's
  // stub throws on rather than fakes (obsidian-stub.mjs's own module comment — out of scope for
  // a vault-less bundle, same reason no lane anywhere mounts a real Modal subclass). The
  // "confirm" case in __sheetGrammar below is the same stand-in the stacked-pair registry's
  // openHostModalChild already uses for a modal child, kept in sync with confirm-modal.ts's own
  // markup by hand rather than by import: title, then the message as a .db-panel-row, then the
  // action row, wired through the real attachSheetChromeToModal/placeSheet/keepSheetPlaced so the
  // header, keyboard and safe-area columns measure the shared production mechanism rather than a
  // second, parallel one.
  { name: "confirm", spec: { renderer: "confirm" } },
];

// Each entry names a real parent shape from the render harness and the production opener family
// used by the child. The adapter below keeps the row contract identical for dropdowns, menus,
// pickers and host-modal chrome, while the parent and child still go through shipped modules.
const REGISTERED_STACKED_PAIRS = [
  { name: "filter property picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-filter-field-dropdown", overflow: true } },
  { name: "filter operator picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-filter-operator-dropdown" } },
  { name: "filter select value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-filter-value-dropdown" } },
  { name: "filter checkbox value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-filter-value-dropdown" } },
  { name: "filter conjunction picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-source-rule-logic" } },
  { name: "filter date value picker", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "date" } },
  { name: "sort field picker", parent: { renderer: "sort-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-sort-field-dropdown" } },
  { name: "sort direction picker", parent: { renderer: "sort-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-sort-direction-dropdown" } },
  { name: "properties create property", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "modal", title: "Create property" } },
  { name: "properties property type picker", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "dropdown", depth: 3, first: "modal", title: "Create property" } },
  { name: "properties column overflow menu", parent: { renderer: "column-manager", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-column-manager-file-property-dropdown" } },
  { name: "settings dropdown field", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-dropdown-field" } },
  { name: "settings ad hoc dropdown", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "dropdown", selector: ".db-dropdown-field" } },
  { name: "settings icon picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "icon" } },
  { name: "settings template file picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "fuzzy", title: "Choose template" } },
  { name: "settings cover image picker", parent: { renderer: "view-config", bag: "file-view", captureData: true }, child: { kind: "fuzzy", title: "Choose cover" } },
  { name: "record select value menu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "dropdown" } },
  { name: "record date editor", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "date" } },
  { name: "record relation editor", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "icon" } },
  { name: "record option colour picker", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "color" } },
  { name: "record column context menu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "menu", title: "Column" } },
  // Record sheet to owned menu to submenu. The submenu's second level is a dropdown, not a second
  // owned menu: the column menu builds its submenus as body-mounted listbox popovers through the
  // shared positioner, so modelling it as a menu would register a shape production never mounts.
  { name: "record column submenu", parent: { renderer: "record-detail", bag: "file-view", captureData: true }, child: { kind: "dropdown", depth: 3, first: "menu", title: "Column" } },
  { name: "add view property picker", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "add-view" }, child: { kind: "dropdown" } },
  { name: "all views overflow menu", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "menu", title: "View actions" } },
  { name: "confirm over a sheet", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "modal", title: "Confirm" } },
  { name: "import confirm dropdown chain", parent: { renderer: "filter-panel", bag: "file-view", captureData: true }, child: { kind: "dropdown", depth: 3, first: "modal", title: "Import" } },
  { name: "chart option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "calendar option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "timeline option dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "group by dropdown", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "dropdown" } },
  { name: "timeline event menu", parent: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" }, child: { kind: "menu", title: "Event" } },
];

// Two geometry facts the DOM predicates cannot see: the close control's own hit box, and whether
// anything the surface drew reaches past its own right edge. `hasSheetHeader` proves a `.db-sheet-
// close` node exists; it says nothing about whether that node clears the 44px floor `touch-
// targets.mjs` ratchets everywhere else, and no structural predicate can see a `.db-new-placement`
// group's long option text overflowing the surface — a settings sheet an operator screenshot once
// showed with the same option text mid-word-broken to stay inside its own button, still overflowing.
const CLOSE_TARGET_FLOOR_PX = 44;

// The element removed by the negative control: the grab handle, whose loss is exactly the
// "drag handler doesnt work" shape the operator reported.
const NEGATIVE_CONTROL = { surface: "sort-panel", element: "handle" };

// ───────────────────────────────────────────────────────────────────
// 2b. THE OVERFLOW SWEEP REGISTRY
// ───────────────────────────────────────────────────────────────────

// The registry above is deliberately narrow: a surface joins it when it conforms to all eight
// grammar columns. Horizontal overflow answers to no such gate. A phone is 390px wide and cannot
// pan, so a surface that draws past its own right edge has put content where a thumb cannot reach
// it whether or not that surface has earned a header — which is why the sweep below runs over
// every sheet the plugin can present, not only the ones the columns cover. The extra rows are the
// surfaces the sheet and stacked-surface inventories enumerate that the grammar registry does not
// carry: the toolbar's two other popovers, the single-rule editor the chip rail opens, both
// mobile inline cell editors, and the deeper filter and picker states. The Properties sheet
// (`column-manager`) moved to the registry above once its row synonym was accepted there.
const OVERFLOW_ONLY_SURFACES = [
  { name: "toolbar-utilities", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "utilities" } },
  { name: "toolbar-tab-menu", spec: { renderer: "toolbar", bag: "file-view", captureData: true, toolbarPopover: "tab-menu" } },
  { name: "filter-panel-nested", spec: { renderer: "filter-panel", bag: "file-view", captureData: true, filterDepth: "nested" } },
  { name: "sort-panel-calendar-hint", spec: { renderer: "sort-panel", bag: "file-view", captureData: true, calendarHint: true } },
  { name: "record-detail-docked", spec: { renderer: "record-detail", bag: "file-view", captureData: true, recordPlacement: "docked" } },
  { name: "active-rule-filter", spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "filter" } },
  { name: "active-rule-sort", spec: { renderer: "active-rule-popover", bag: "file-view", captureData: true, ruleKind: "sort" } },
  { name: "cell-editor-text", spec: { renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "text" } },
  { name: "cell-editor-select", spec: { renderer: "cell-editors", bag: "file-view", captureData: true, editorKind: "select" } },
  { name: "date-picker-datetime", spec: { renderer: "date-picker", bag: "file-view", includeTime: true } },
  { name: "dropdown", spec: { renderer: "dropdown", bag: "file-view" } },
];

// Every surface a phone can present, measured for overflow whether or not it owns a header.
// "confirm" is excluded: it has no `renderer` case in render-assertion-harness.ts (its stand-in
// bypasses that dispatcher entirely, in __sheetGrammar above), so running it through this sweep's
// generic runRenderAssertions call would silently fall through to the harness's own default
// (table) rather than measuring confirm's markup. Its overflow is already covered by the two
// "confirm over a sheet" / "import confirm dropdown chain" stacked-pair rows below, which mount it
// through the same real stand-in via openHostModalChild.
const OVERFLOW_SWEEP_SURFACES = [...REGISTERED_SURFACES.filter((surface) => surface.spec.renderer !== "confirm"), ...OVERFLOW_ONLY_SURFACES];

// The sweep measures each surface twice. The first pass is the surface as the fixtures build it.
// The second replaces every vault-derived string with one unbreakable word, because a property
// name, an option value and the field a picker was opened for all belong to the user: the plugin
// cannot bound their length, and a surface that fits only the short names the fixtures happen to
// carry has not been sized, it has been lucky. Nothing this touches is a string the plugin ships,
// so no shipped copy is being misrepresented as data.
const UNBREAKABLE_NAME = "QuarterlyReviewCheckpointTwentyTwentySixQThreeFinalApprovedByOperations";

// The negative control: a child wider than the phone, injected into a surface that measured clean.
// 600px against a 390px viewport is past any inset the sheets carry, so a control that fails to go
// red says the sweep is measuring nothing rather than that the tree is clean.
const OVERFLOW_CONTROL_WIDTH_PX = 600;

// Sub-pixel layout leaves a rect a hair past a parent it visually sits inside. The same tolerance
// the right-edge check above already uses, so one number governs both.
const OVERFLOW_TOLERANCE_PX = 0.5;

// ───────────────────────────────────────────────────────────────────
// 3. BUNDLE
// ───────────────────────────────────────────────────────────────────

const { work, missingSources } = await buildRenderAssertionBundle(`
import { t, setLocale } from "${fileURLToPath(new URL("../../src/i18n.ts", import.meta.url)).replace(/\\/g, "/")}";
import { describeSheetGrammar } from "${fileURLToPath(new URL("../../src/views/sheet-grammar.ts", import.meta.url)).replace(/\\/g, "/")}";
import { applySheetChrome, attachSheetChromeToModal, attachSheetDragToDismiss } from "${fileURLToPath(new URL("../../src/views/mobile-bottom-sheet.ts", import.meta.url)).replace(/\\/g, "/")}";
import { keepSheetPlaced, placeSheet } from "${fileURLToPath(new URL("../../src/views/popover-position.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openDropdownMenu } from "${fileURLToPath(new URL("../../src/views/dropdown-field.ts", import.meta.url)).replace(/\\/g, "/")}";
import { createOwnedMenu } from "${fileURLToPath(new URL("../../src/views/owned-menu.ts", import.meta.url)).replace(/\\/g, "/")}";
import { closeActiveDateValuePicker, renderDateValuePicker } from "${fileURLToPath(new URL("../../src/views/date-value-picker.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openIconPickerPopover } from "${fileURLToPath(new URL("../../src/views/icon-picker-popover.ts", import.meta.url)).replace(/\\/g, "/")}";
import { openOptionColorPicker } from "${fileURLToPath(new URL("../../src/views/option-color-picker.ts", import.meta.url)).replace(/\\/g, "/")}";

setLocale("en");

const mountedSheet = () => document.body.querySelector(".db-mobile-bottom-sheet");
const stackedPairRegistry = ${JSON.stringify(REGISTERED_STACKED_PAIRS)};

// Shared by the runRenderAssertions path below and the confirm stand-in, so the two ways this
// lane can end up with a mounted sheet in hand read it identically.
const measureMountedSheet = (sheet) => {
  let closeBox = null;
  let rightOverflow = null;
  if (sheet) {
    // The 44px floor: hasSheetHeader only proves a close node exists, never that it clears the
    // touch-target size every other close control on the phone is held to.
    const close = sheet.querySelector(".db-sheet-close, .db-cell-edit-close");
    if (close) {
      const rect = close.getBoundingClientRect();
      closeBox = { width: rect.width, height: rect.height };
    }
    // No structural predicate can see a group's content running past the surface's own edge —
    // that is a measured fact, and it is exactly report 41's "Automati/cally" mid-word break.
    const surfaceRight = sheet.getBoundingClientRect().right;
    const offenders = [];
    for (const el of sheet.querySelectorAll("*")) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > surfaceRight + 0.5) offenders.push(el.className || el.tagName);
    }
    rightOverflow = offenders;
  }
  return { closeBox, rightOverflow };
};

// ConfirmModal extends Obsidian's Modal, which this bundle's stub deliberately cannot fake (see
// the "confirm" registry entry's comment). This mirrors confirm-modal.ts's own onOpen markup by
// hand — title, then the message as a .db-panel-row, then the action row — and wires it through
// the real chrome/placement functions so every column but the markup mirror itself measures the
// production mechanism. Kept in sync with confirm-modal.ts by the same discipline the stacked-
// pair registry's openHostModalChild already carries for a modal child.
const mountConfirmStandIn = () => {
  const panel = document.createElement("div");
  panel.className = "modal-container";
  const content = document.createElement("div");
  content.className = "modal-content note-database-modal";
  const heading = document.createElement("h3");
  heading.textContent = "Delete this row?";
  content.appendChild(heading);
  const message = document.createElement("div");
  message.className = "db-modal-help db-panel-row";
  message.textContent = "This action cannot be undone.";
  content.appendChild(message);
  const actionsRow = document.createElement("div");
  actionsRow.className = "db-modal-actions";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  actionsRow.appendChild(cancelBtn);
  const confirmBtn = document.createElement("button");
  confirmBtn.type = "button";
  confirmBtn.className = "mod-warning";
  confirmBtn.textContent = "Delete";
  actionsRow.appendChild(confirmBtn);
  content.appendChild(actionsRow);
  panel.appendChild(content);
  document.body.appendChild(panel);
  let closed = false;
  let releasePlacement;
  const close = () => {
    if (closed) return;
    closed = true;
    releasePlacement?.();
    releaseChrome?.();
    if (panel.isConnected) panel.remove();
  };
  const releaseChrome = attachSheetChromeToModal(panel, true, close);
  placeSheet(panel);
  releasePlacement = keepSheetPlaced(panel);
  return { panel, close };
};

window.__sheetGrammar = (scenario) => {
  if (scenario.renderer === "confirm") {
    const { panel, close } = mountConfirmStandIn();
    const { closeBox, rightOverflow } = measureMountedSheet(panel);
    const report = {
      mounted: true,
      sheetFound: panel.classList.contains("db-mobile-bottom-sheet"),
      grammar: describeSheetGrammar(panel),
      listViewRow: null,
      closeBox,
      rightOverflow,
    };
    close();
    return report;
  }
  let report = { mounted: false, sheetFound: false, grammar: null, listViewRow: null, closeBox: null, rightOverflow: null };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    const { closeBox, rightOverflow } = measureMountedSheet(sheet);
    report = {
      mounted: true,
      sheetFound: Boolean(sheet),
      grammar: sheet ? describeSheetGrammar(sheet) : null,
      listViewRow: sheet ? Array.from(sheet.querySelectorAll(".db-menu-item-label"))
        .some((el) => el.textContent?.trim() === t("common.listView")) : null,
      closeBox,
      rightOverflow,
    };
  });
  return report;
};

window.__sheetGrammarNegativeControl = () => {
  const scenario = ${JSON.stringify(REGISTERED_SURFACES.find((s) => s.name === NEGATIVE_CONTROL.surface).spec)};
  let removed = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) { removed = { mounted: true, error: "no sheet mounted" }; return; }
    const before = describeSheetGrammar(sheet);
    sheet.querySelector(".db-mobile-bottom-sheet-handle")?.remove();
    removed = { mounted: true, before, after: describeSheetGrammar(sheet) };
  });
  let restored = null;
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    restored = sheet ? describeSheetGrammar(sheet) : null;
  });
  return { removed, restored };
};

const waitForStackSettle = () => new Promise((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});

// A sheet rises into place over the shared enter duration, so its box is still moving for several
// frames after it mounts. Snapshotting the parent before that finishes measures the tail of its own
// entrance and reports it as movement the child caused. Wait for two consecutive frames at the same
// offset instead of a fixed delay, so the check does not encode the duration as a second copy.
const IDENTITY_TRANSFORMS = new Set(["none", "matrix(1, 0, 0, 1, 0, 0)"]);

const settleSheetGeometry = async (panel) => {
  let previous = null;
  let stable = 0;
  for (let frame = 0; frame < 120; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Geometry alone is not enough: two frames before the entrance starts read the same offset as
    // two frames after it finishes, so a stability test on its own returns true at the moment the
    // sheet is still off screen. The entrance rises the panel from a translate to identity, so the
    // resolved transform is what says the animation is over; stability then says the layout is.
    const settledTransform = IDENTITY_TRANSFORMS.has(getComputedStyle(panel).transform);
    const top = panel.getBoundingClientRect().top;
    stable = previous !== null && Math.abs(top - previous) < 0.01 ? stable + 1 : 0;
    previous = top;
    if (settledTransform && stable >= 2) return true;
  }
  return false;
};

const rectSnapshot = (element) => {
  const rect = element.getBoundingClientRect();
  return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height };
};

const maxRectDelta = (before, after) => Math.max(
  Math.abs(before.top - after.top),
  Math.abs(before.right - after.right),
  Math.abs(before.bottom - after.bottom),
  Math.abs(before.left - after.left),
);

const newestSheet = () => Array.from(document.body.querySelectorAll(".db-mobile-bottom-sheet")).at(-1) || null;

// The anchor lives inside the parent because that is what the production opener resolves against —
// a dropdown asks its anchor which surface it belongs to. It is taken out of flow so that adding it
// does not change the parent's own height, which would otherwise read as the child having moved the
// parent: measured at a constant 21px of false movement on every row that needed one.
const makeStackAnchor = (parent, label) => {
  const anchor = document.createElement("button");
  anchor.className = "stacked-lane-anchor";
  anchor.type = "button";
  anchor.textContent = label;
  anchor.style.position = "absolute";
  anchor.style.left = "0";
  anchor.style.top = "0";
  anchor.style.width = "1px";
  anchor.style.height = "1px";
  anchor.style.opacity = "0";
  anchor.style.pointerEvents = "none";
  parent.appendChild(anchor);
  return anchor;
};

const makeDropdownOptions = (long) => Array.from({ length: long ? 26 : 7 }, (_, index) => ({
  value: "stacked-option-" + index,
  text: "Option " + (index + 1),
  section: index === 0 ? "Property" : undefined,
}));

const closeSheetNode = (panel) => {
  if (!panel) return;
  panel.querySelector(".db-sheet-close, .db-cell-edit-close")?.click();
  if (panel.isConnected) panel.remove();
};

const openDropdownChild = (parent, child) => {
  let anchor = child.selector ? parent.querySelector(child.selector) : null;
  let ownedAnchor = false;
  if (!(anchor instanceof HTMLElement)) {
    anchor = makeStackAnchor(parent, child.title || "Open picker");
    ownedAnchor = true;
  }
  let close;
  if (child.selector && anchor instanceof HTMLElement) anchor.click();
  let panel = newestSheet();
  if (panel === parent) panel = null;
  if (!panel) {
    close = openDropdownMenu({
      anchor,
      label: child.title || "Property",
      options: makeDropdownOptions(Boolean(child.overflow)),
      value: "stacked-option-0",
      searchable: Boolean(child.overflow),
      closeOnSelect: false,
    });
    panel = newestSheet();
  }
  return {
    panel,
    close: () => {
      close?.();
      if (!close) closeSheetNode(panel);
      if (ownedAnchor) anchor.remove();
    },
  };
};

const openMenuChild = (parent, child) => {
  const anchor = makeStackAnchor(parent, child.title || "Open menu");
  const menu = createOwnedMenu(document, { title: child.title || "Menu" });
  menu.addSection(child.title || "Menu");
  menu.addRow({ icon: "check", label: "Selected item", selected: true });
  menu.addRow({ icon: "settings-2", label: "More options", submenu: true });
  menu.addRow({ icon: "trash-2", label: "Remove", warning: true });
  menu.showAt({ anchor });
  return { panel: menu.el, close: () => { menu.close(); anchor.remove(); } };
};

const openPickerChild = (parent, child) => {
  const anchor = makeStackAnchor(parent, child.title || "Open picker");
  let close;
  if (child.kind === "date") {
    // Same reason as the anchor above: the date picker builds its own trigger into whatever parent
    // it is handed, so it is handed an out-of-flow host inside the sheet rather than the sheet.
    const host = parent.createDiv();
    host.style.position = "absolute";
    host.style.left = "0";
    host.style.top = "0";
    host.style.opacity = "0";
    const trigger = renderDateValuePicker({
      parent: host,
      value: "2026-08-21",
      fieldLabel: child.title || "Due date",
      onChange: () => undefined,
    });
    trigger.click();
    close = () => { closeActiveDateValuePicker(document, false); host.remove(); };
  } else if (child.kind === "icon") {
    close = openIconPickerPopover({
      anchor,
      current: "lucide:x@blue",
      label: child.title || "Icon",
      onSelect: async () => undefined,
      onConfigureField: () => undefined,
    });
  } else {
    close = openOptionColorPicker(anchor, "blue", () => undefined, child.title || "Colour");
  }
  return {
    panel: newestSheet(),
    close: () => { close?.(); if (anchor.isConnected) anchor.remove(); },
  };
};

const openHostModalChild = (parent, child) => {
  const panel = document.createElement("div");
  panel.className = "modal-container";
  const content = document.createElement("div");
  content.className = "modal-content note-database-modal";
  const heading = document.createElement("h3");
  heading.textContent = child.title || "Choose file";
  content.appendChild(heading);
  const body = document.createElement("div");
  body.className = "db-modal-help";
  body.textContent = child.kind === "fuzzy" ? "Search files" : "Confirm this change";
  content.appendChild(body);
  panel.appendChild(content);
  parent.appendChild(panel);
  let releaseChrome;
  let releasePlacement;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    releasePlacement?.();
    releaseChrome?.();
    if (panel.isConnected) panel.remove();
  };
  releaseChrome = attachSheetChromeToModal(panel, true, close, {
    title: child.title || "Choose file",
    getTitle: () => child.title || "Choose file",
  });
  placeSheet(panel);
  releasePlacement = keepSheetPlaced(panel);
  return { panel, close };
};

const openSingleChild = (parent, child) => {
  if (child.kind === "dropdown") return openDropdownChild(parent, child);
  if (child.kind === "menu") return openMenuChild(parent, child);
  if (child.kind === "date" || child.kind === "icon" || child.kind === "color") return openPickerChild(parent, child);
  return openHostModalChild(parent, child);
};

const openPairChild = (parent, child) => {
  if (!child.first) return openSingleChild(parent, child);
  const first = openSingleChild(parent, { kind: child.first, title: child.title });
  if (!first.panel) return first;
  const second = openSingleChild(first.panel, { kind: child.kind, title: child.title, overflow: child.overflow });
  return {
    panel: second.panel,
    close: () => { second.close(); first.close(); },
  };
};

// Measured from rendered style alone, never from the class that asks for it. A predicate that reads
// the is-stack-parent marking and a control that removes it would agree with each other whatever the
// stylesheet does, so the control below removes the class the shipped model applies and this reads
// what the browser actually painted.
const measureParentTreatment = (parent) => {
  if (!parent) return { dim: 1, transform: "none", treated: false };
  const content = Array.from(parent.children).find((child) => !child.classList.contains("db-mobile-bottom-sheet-handle"));
  const dim = Number.parseFloat(getComputedStyle(parent).opacity);
  const transform = content ? getComputedStyle(content).transform : "none";
  return { dim, transform, treated: dim < 0.99 && transform !== "none" };
};

const parentTreatment = (parent) => measureParentTreatment(parent).treated;

const measureStackedPair = async (pair) => {
  let parent = null;
  let parentBefore = null;
  let opened = null;
  let mountError = null;
  let parentSettled = false;
  try {
    runRenderAssertions(document.body, pair.parent, "", () => {
      parent = mountedSheet();
    });
  } catch (error) {
    mountError = String(error);
  }
  // The parent is portalled onto the body, so it outlives the harness container and the child can be
  // opened after the mount call returns — which is what lets the entrance settle first.
  if (parent && !mountError) {
    parentSettled = await settleSheetGeometry(parent);
    parentBefore = rectSnapshot(parent);
    try {
      opened = openPairChild(parent, pair.child);
    } catch (error) {
      mountError = String(error);
    }
  }
  await waitForStackSettle();
  if (!parent || !opened?.panel || !opened.panel.isConnected || mountError) {
    opened?.close();
    return { name: pair.name, error: mountError || "parent or child did not mount" };
  }

  const child = opened.panel;
  // The child animates in as well, and its close control is measured against a 44px floor. A rect
  // read while it is still rising is a rect of a partly-scaled surface, which is how a conforming
  // close target reports as too small on some runs and not others.
  const childSettled = await settleSheetGeometry(child);
  // The sheet module keeps its own body watcher so a bare node removal still tears the stack down.
  // That watcher calls back into the code that positions the scrim, so a reposition that runs
  // unconditionally re-wakes it and the pair never stops moving. Counting body child mutations
  // across two idle frames is what tells a settled stack from one still chasing itself.
  const settleRecords = await new Promise((resolve) => {
    let count = 0;
    const observer = new MutationObserver((records) => { count += records.length; });
    observer.observe(document.body, { childList: true });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      observer.disconnect();
      resolve(count);
    }));
  });
  document.documentElement.style.setProperty("--keyboard-height", "336px");
  // Both surfaces re-place. A keyboard on a device raises one visual-viewport event that reaches
  // every sheet holding a placement subscription, so a check that re-places only the child lets a
  // parent keep a stale inset and still read green — which is the defect the operator photographed.
  placeSheet(parent);
  placeSheet(child);
  await waitForStackSettle();

  const parentAfter = rectSnapshot(parent);
  const parentDelta = maxRectDelta(parentBefore, parentAfter);
  const sheets = Array.from(document.body.querySelectorAll(".db-mobile-bottom-sheet"));
  const top = sheets.at(-1) || child;
  const beneath = sheets.at(-2) || parent;
  const scrims = Array.from(document.body.querySelectorAll(".db-mobile-sheet-scrim"));
  const bodyChildren = Array.from(document.body.children);
  const topIndex = bodyChildren.indexOf(top);
  const beneathIndex = bodyChildren.indexOf(beneath);
  const scrimIndex = scrims.length === 1 ? bodyChildren.indexOf(scrims[0]) : -1;
  const header = top.querySelector(".db-panel-header, .db-record-detail-header");
  const title = header?.querySelector(".db-panel-title, .db-record-detail-title");
  const close = header?.querySelector(".db-sheet-close, .db-cell-edit-close");
  const closeRect = close ? rectSnapshot(close) : null;
  const headerStyle = header ? getComputedStyle(header) : null;
  const titleStyle = title ? getComputedStyle(title) : null;
  const scrollHost = top.querySelector(".db-dropdown-options, .db-icon-picker-scroll, .db-date-picker-body") || top;
  const scrollStyle = getComputedStyle(scrollHost);
  const hasOverflow = scrollHost.scrollHeight > scrollHost.clientHeight + 1;
  const hasFade = top.classList.contains("has-scroll-overflow")
    || scrollStyle.maskImage !== "none"
    || scrollStyle.webkitMaskImage !== "none";
  // Read every stack-derived fact before the gesture below. A drag past the flick threshold is
  // meant to dismiss the child, so a depth or inset sampled afterwards describes a stack that has
  // already come apart rather than the one under test.
  const depthAtRest = Number.parseInt(child.style.getPropertyValue("--db-sheet-depth"), 10);
  const childBottomAtRest = Number.parseFloat(child.style.getPropertyValue("--db-mobile-sheet-bottom"));
  const parentBottomAtRest = Number.parseFloat(parent.style.getPropertyValue("--db-mobile-sheet-bottom"));
  const parentDragBefore = rectSnapshot(parent);
  let dragParentUnchanged = false;
  const handle = top.querySelector(".db-mobile-bottom-sheet-handle");
  // Synthetic pointer events carry no active pointer, so the browser rejects the capture the drag
  // takes on a real finger. Standing it in keeps the gesture under test rather than the event
  // plumbing, the same way the harness stands in for the theme variables Obsidian supplies.
  const realCapture = Element.prototype.setPointerCapture;
  const realRelease = Element.prototype.releasePointerCapture;
  Element.prototype.setPointerCapture = function () {};
  Element.prototype.releasePointerCapture = function () {};
  try {
    if (handle) {
      const pointerId = 917;
      handle.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 200 }));
      top.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 212 }));
      const during = rectSnapshot(parent);
      top.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, button: 0, pointerId, pointerType: "touch", clientY: 212 }));
      const after = rectSnapshot(parent);
      dragParentUnchanged = maxRectDelta(parentDragBefore, during) <= 1 && maxRectDelta(parentDragBefore, after) <= 1;
    }
  } catch {
    dragParentUnchanged = false;
  } finally {
    Element.prototype.setPointerCapture = realCapture;
    Element.prototype.releasePointerCapture = realRelease;
  }
  const expectedDepth = pair.child.depth || 2;
  const childBottom = childBottomAtRest;
  const parentBottom = parentBottomAtRest;
  const report = {
    name: pair.name,
    parentDelta,
    parentBox: parentDelta <= 1,
    parentTreatment: parentTreatment(parent),
    oneScrim: scrims.length === 1,
    scrimBetween: scrims.length === 1 && scrimIndex > Math.min(topIndex, beneathIndex) && scrimIndex < Math.max(topIndex, beneathIndex),
    childHeader: Boolean(header && title?.textContent?.trim() && close),
    closeTarget: Boolean(closeRect && closeRect.width >= 44 && closeRect.height >= 44),
    headerInset: Boolean(headerStyle && Math.min(Number.parseFloat(headerStyle.paddingLeft), Number.parseFloat(headerStyle.paddingRight)) >= 16),
    titleSize: Boolean(titleStyle && Number.parseFloat(titleStyle.fontSize) >= 16),
    childKeyboard: childBottom === 336,
    parentKeyboard: parentBottom === 0,
    dragParentUnchanged,
    depth: depthAtRest,
    expectedDepth,
    overflow: hasOverflow && hasFade,
    overflowMeasured: { scrollHeight: scrollHost.scrollHeight, clientHeight: scrollHost.clientHeight, fade: hasFade },
    settleRecords,
    parentSettled,
    childSettled,
  };
  document.documentElement.style.removeProperty("--keyboard-height");
  opened.close();
  await Promise.resolve();
  return report;
};

window.__stackedSheetGrammar = (pair) => measureStackedPair(pair);

window.__stackedSheetGrammarNegativeControl = async () => {
  const pair = stackedPairRegistry[0];
  let parent = null;
  let opened = null;
  runRenderAssertions(document.body, pair.parent, "", () => {
    parent = mountedSheet();
    if (parent) opened = openPairChild(parent, pair.child);
  });
  await waitForStackSettle();
  if (!parent || !opened?.panel) return { error: "parent or child did not mount" };
  // The pre-fix shape is a parent carrying no stack marking at all — no sheet in the shipped tree
  // wore one before this model existed. Removing it reproduces that DOM, and the numbers below come
  // from the rendered result rather than from the marking, so the stylesheet is what is on trial.
  const before = measureParentTreatment(parent);
  parent.classList.remove("is-stack-parent");
  const oldWay = measureParentTreatment(parent);
  parent.classList.add("is-stack-parent");
  const restored = measureParentTreatment(parent);
  opened.close();
  await Promise.resolve();
  return { before, oldWay, restored };
};

// --- the all-sheets overflow sweep ---

const OVERFLOW_TOLERANCE = ${OVERFLOW_TOLERANCE_PX};
const CONTROL_WIDTH = ${OVERFLOW_CONTROL_WIDTH_PX};
const UNBREAKABLE = ${JSON.stringify(UNBREAKABLE_NAME)};

// Every shape a phone presents on top of the view: the bottom sheets, the two docked inline cell
// editors and the option list that are deliberately not sheets, and a host modal wearing sheet
// chrome. The editors are portalled onto the body; the option list stays inside the cell it edits,
// so both roots are searched rather than the body alone.
const SWEEP_SELECTOR = ".db-mobile-bottom-sheet, .db-cell-edit-popover, .db-cell-option-popover, .modal-container";
const sweptSurfaces = () => Array.from(document.querySelectorAll(SWEEP_SELECTOR));

const describeNode = (el) => {
  const name = el.tagName.toLowerCase();
  const classes = typeof el.className === "string" ? el.className.trim().split(/\\s+/).filter(Boolean) : [];
  return classes.length > 0 ? name + "." + classes.slice(0, 3).join(".") : name;
};

// The nodes that carry the user's words rather than the plugin's. A picker's header takes the field
// it was opened for and a menu's title takes the row, column or field it belongs to, so the title is
// vault text on exactly the surfaces whose titles are not fixed copy.
//
// Shipped copy is deliberately absent. A segmented option, a menu action and a button caption come
// from the translation table, where the longest run is bounded by a translator rather than by a
// vault; a stress that rewrites them measures a string the plugin will never be handed, and the
// segmented placement group in particular already carries an operator decision to break at word
// boundaries only, which such a word would report as a defect it is not.
const VAULT_TEXT_SELECTORS = [
  ".db-panel-title", ".db-record-detail-title", ".db-column-name-wrap", ".db-column-name-wrap *",
  ".db-column-manager-name", ".db-view-config-readonly-value", ".db-dropdown-field-value",
  ".db-dropdown-option", ".db-record-detail-field-label",
];

const lengthenVaultText = (surface) => {
  for (const selector of VAULT_TEXT_SELECTORS) {
    for (const el of surface.querySelectorAll(selector)) {
      if (el.children.length > 0) continue;
      if (!el.textContent || !el.textContent.trim()) continue;
      el.textContent = UNBREAKABLE;
    }
  }
};

const measureOverflow = (surface) => {
  const surfaceRight = surface.getBoundingClientRect().right;
  const past = [];
  for (const el of surface.querySelectorAll("*")) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > surfaceRight + OVERFLOW_TOLERANCE) {
      past.push(describeNode(el) + " +" + (rect.right - surfaceRight).toFixed(1) + "px");
    }
  }
  return {
    node: describeNode(surface),
    scrollWidth: surface.scrollWidth,
    clientWidth: surface.clientWidth,
    past: past.slice(0, 3),
    pastCount: past.length,
  };
};

// The document and the body are measured beside the surfaces because a sheet is portalled onto the
// body: a surface can stay inside its own box and still widen the page it was appended to, and a
// page that scrolls sideways is the defect an operator sees whichever node caused it.
const measureSweep = () => ({
  surfaces: sweptSurfaces().map(measureOverflow),
  documentScroll: { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth },
  bodyScroll: { scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth },
});

window.__sheetOverflow = (scenario, stress) => {
  let report = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    if (stress) for (const surface of sweptSurfaces()) lengthenVaultText(surface);
    report = { mounted: true, ...measureSweep() };
  });
  return report;
};

window.__stackedSheetOverflow = async (pair, stress) => {
  let parent = null;
  let opened = null;
  let mountError = null;
  try {
    runRenderAssertions(document.body, pair.parent, "", () => { parent = mountedSheet(); });
  } catch (error) {
    mountError = String(error);
  }
  if (parent && !mountError) {
    try { opened = openPairChild(parent, pair.child); } catch (error) { mountError = String(error); }
  }
  await waitForStackSettle();
  if (!parent || !opened?.panel || !opened.panel.isConnected || mountError) {
    opened?.close();
    return { error: mountError || "parent or child did not mount" };
  }
  if (stress) for (const surface of sweptSurfaces()) lengthenVaultText(surface);
  const report = measureSweep();
  opened.close();
  await Promise.resolve();
  return report;
};

// A sweep that has never been observed red is not evidence. This mounts a surface the sweep just
// called clean, hangs a child wider than the phone off it, requires the same measurement to report
// the overflow, then removes the child and requires the surface to come back clean.
window.__sheetOverflowNegativeControl = () => {
  const scenario = ${JSON.stringify(REGISTERED_SURFACES.find((s) => s.name === NEGATIVE_CONTROL.surface).spec)};
  let result = { mounted: false };
  runRenderAssertions(document.body, scenario, "", () => {
    const sheet = mountedSheet();
    if (!sheet) { result = { mounted: true, error: "no sheet mounted" }; return; }
    const before = measureOverflow(sheet);
    const wide = document.createElement("div");
    wide.style.width = CONTROL_WIDTH + "px";
    wide.style.height = "8px";
    wide.style.flex = "0 0 auto";
    sheet.appendChild(wide);
    const injected = measureOverflow(sheet);
    wide.remove();
    result = { mounted: true, before, injected, restored: measureOverflow(sheet) };
  });
  return result;
};
`);

if (missingSources.length > 0) {
  console.error(`sheet-grammar: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the shipped renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${REPO}styles.css"></head>
<body class="is-phone theme-dark"><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 4. RUN
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
  throw new Error("sheet-grammar: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

const failures = [];

// ───────────────────────────────────────────────────────────────────
// 4b. THE OVERFLOW SWEEP
// ───────────────────────────────────────────────────────────────────

// One row per surface per pass. A phone cannot pan sideways, so anything the surface put past its
// own right edge is unreachable, and a page that scrolls sideways is the same defect one level out.
const reportSweep = (engineName, label, report) => {
  if (report.error) {
    failures.push(`overflow sweep ${engineName} ${label}: ${report.error}`);
    console.log(`  FAIL  ${engineName} ${label} — ${report.error}`);
    return;
  }
  if (report.mounted === false) {
    failures.push(`overflow sweep ${engineName} ${label}: did not mount`);
    console.log(`  FAIL  ${engineName} ${label} — did not mount`);
    return;
  }
  if (report.surfaces.length === 0) {
    failures.push(`overflow sweep ${engineName} ${label}: mounted no surface to measure`);
    console.log(`  FAIL  ${engineName} ${label} — mounted no surface to measure`);
    return;
  }
  for (const surface of report.surfaces) {
    const scrolls = surface.scrollWidth > surface.clientWidth;
    if (scrolls) failures.push(`overflow sweep ${engineName} ${label}: ${surface.node} scrolls horizontally (${surface.scrollWidth} > ${surface.clientWidth})`);
    console.log(`  ${scrolls ? "FAIL" : "PASS"}  ${engineName} ${label} — ${surface.node} scrollWidth ${surface.scrollWidth} ≤ clientWidth ${surface.clientWidth}`);
    const clean = surface.pastCount === 0;
    if (!clean) failures.push(`overflow sweep ${engineName} ${label}: ${surface.pastCount} descendant(s) past ${surface.node}'s right edge (${surface.past.join(", ")})`);
    console.log(`  ${clean ? "PASS" : "FAIL"}  ${engineName} ${label} — nothing past ${surface.node}'s right edge${clean ? "" : `: ${surface.past.join(", ")}`}`);
  }
  for (const [name, measured] of [["document", report.documentScroll], ["body", report.bodyScroll]]) {
    const scrolls = measured.scrollWidth > measured.clientWidth;
    if (scrolls) failures.push(`overflow sweep ${engineName} ${label}: the ${name} scrolls horizontally (${measured.scrollWidth} > ${measured.clientWidth})`);
    console.log(`  ${scrolls ? "FAIL" : "PASS"}  ${engineName} ${label} — ${name} scrollWidth ${measured.scrollWidth} ≤ clientWidth ${measured.clientWidth}`);
  }
};

async function runOverflowSweep(engineName, engine, launchOptions) {
  let sweepBrowser;
  try {
    sweepBrowser = await engine.launch(launchOptions);
    const page = await sweepBrowser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`file://${join(work, "index.html")}`);

    // The fixtures' own names first, then the same surfaces again with every vault-derived string
    // replaced by one unbreakable word. A surface that only fits the short names a fixture happens
    // to carry is not a surface that has been sized.
    for (const stress of [false, true]) {
      const pass = stress ? "long name" : "as built";
      console.log(`sheet-grammar: overflow sweep — ${engineName}, ${pass}\n`);
      for (const { name, spec } of OVERFLOW_SWEEP_SURFACES) {
        const report = await page.evaluate(([scenario, withStress]) => window.__sheetOverflow(scenario, withStress), [spec, stress]);
        reportSweep(engineName, `${name} (${pass})`, report);
      }
      for (const pair of REGISTERED_STACKED_PAIRS) {
        const report = await page.evaluate(([shape, withStress]) => window.__stackedSheetOverflow(shape, withStress), [pair, stress]);
        reportSweep(engineName, `stacked ${pair.name} (${pass})`, report);
      }
      console.log("");
    }

    const control = await page.evaluate(() => window.__sheetOverflowNegativeControl());
    console.log(`sheet-grammar: overflow negative control — ${engineName}, a ${OVERFLOW_CONTROL_WIDTH_PX}px child injected into ${NEGATIVE_CONTROL.surface}\n`);
    if (!control.mounted || control.error) {
      failures.push(`overflow negative control ${engineName}: ${control.error || "did not mount"}`);
      console.log(`  FAIL  ${engineName} — ${control.error || "did not mount"}`);
    } else {
      const cleanBefore = control.before.pastCount === 0 && control.before.scrollWidth <= control.before.clientWidth;
      const wentRed = control.injected.scrollWidth > control.injected.clientWidth;
      const cleanAfter = control.restored.pastCount === 0 && control.restored.scrollWidth <= control.restored.clientWidth;
      if (!cleanBefore) failures.push(`overflow negative control ${engineName}: the control surface already overflowed before the injection`);
      if (!wentRed) failures.push(`overflow negative control ${engineName}: the injected ${OVERFLOW_CONTROL_WIDTH_PX}px child did not register as overflow`);
      if (!cleanAfter) failures.push(`overflow negative control ${engineName}: the surface did not come back clean after the child was removed`);
      console.log(`  ${cleanBefore ? "PASS" : "FAIL"}  ${engineName} — clean before the injection (${control.before.scrollWidth}/${control.before.clientWidth})`);
      console.log(`  ${wentRed ? "PASS" : "FAIL"}  ${engineName} — red with the injection (${control.injected.scrollWidth}/${control.injected.clientWidth})`);
      console.log(`  ${cleanAfter ? "PASS" : "FAIL"}  ${engineName} — clean again once removed (${control.restored.scrollWidth}/${control.restored.clientWidth})`);
    }
    console.log("");

    await page.close();
    for (const error of pageErrors) failures.push(`overflow sweep ${engineName} page error: ${error}`);
  } catch (error) {
    failures.push(`overflow sweep ${engineName} failed to run: ${error.message}`);
  } finally {
    if (sweepBrowser) await sweepBrowser.close();
  }
}

let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { name, spec } of REGISTERED_SURFACES) {
    const report = await page.evaluate((scenario) => window.__sheetGrammar(scenario), spec);
    console.log(`sheet-grammar: ${name}\n`);
    if (!report.mounted) {
      failures.push(`${name}: did not mount`);
      console.log(`  FAIL  ${name} — did not mount`);
      continue;
    }
    if (!report.sheetFound) {
      failures.push(`${name}: mounted without a sheet surface on the body`);
      console.log(`  FAIL  ${name} — mounted without a sheet surface on the body`);
      continue;
    }
    // The report is keyed by the contract's element keys, in the contract's order, so the rows
    // printed here are the grammar's own list rather than a copy that could drift from it.
    for (const key of Object.keys(report.grammar)) {
      const ok = report.grammar[key] === true;
      if (!ok) failures.push(`${name}: ${key} was ${report.grammar[key]}, wanted true`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — ${key}: ${report.grammar[key]}`);
    }
    if (name === "add-view") {
      const ok = report.listViewRow === false;
      if (!ok) failures.push(`add-view: offered a List view row, wanted none`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  add-view — no List view row: ${report.listViewRow === false}`);
    }
    // Geometry the structural predicates cannot see: the close control's own hit box, and whether
    // anything the surface drew reaches past its own right edge.
    if (report.closeBox) {
      const { width, height } = report.closeBox;
      const ok = width >= CLOSE_TARGET_FLOOR_PX && height >= CLOSE_TARGET_FLOOR_PX;
      if (!ok) failures.push(`${name}: close target ${width.toFixed(1)}x${height.toFixed(1)}, wanted >= ${CLOSE_TARGET_FLOOR_PX}x${CLOSE_TARGET_FLOOR_PX}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — close target: ${width.toFixed(1)}x${height.toFixed(1)}`);
    } else {
      failures.push(`${name}: no close control to measure`);
      console.log(`  FAIL  ${name} — no close control to measure`);
    }
    if (Array.isArray(report.rightOverflow)) {
      const ok = report.rightOverflow.length === 0;
      if (!ok) failures.push(`${name}: ${report.rightOverflow.length} descendant(s) overflow the surface's right edge (${report.rightOverflow.slice(0, 3).join(", ")})`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${name} — no descendant overflows the right edge${ok ? "" : `: ${report.rightOverflow.slice(0, 3).join(", ")}`}`);
    }
    console.log("");
  }

  // Negative control: one element removed from one conforming surface must go red there alone.
  const control = await page.evaluate(() => window.__sheetGrammarNegativeControl());
  const { surface, element } = NEGATIVE_CONTROL;
  console.log(`sheet-grammar: negative control — ${element} removed from ${surface}\n`);
  if (!control.removed?.mounted || control.removed.error) {
    failures.push(`negative control: ${control.removed?.error || "did not mount"}`);
    console.log(`  FAIL  negative control — ${control.removed?.error || "did not mount"}`);
  } else {
    const before = control.removed.before;
    const after = control.removed.after;
    const wentRed = before[element] === true && after[element] === false;
    const othersStayedGreen = Object.keys(after)
      .filter((key) => key !== element)
      .every((key) => after[key] === true);
    const allGreenBefore = Object.values(before).every(Boolean);
    if (!allGreenBefore) failures.push(`negative control: the control surface was not fully green before the removal`);
    if (!wentRed) failures.push(`negative control: ${element} did not go red on ${surface} when removed`);
    if (!othersStayedGreen) failures.push(`negative control: a second surface/element went red with the removal`);
    console.log(`  ${allGreenBefore ? "PASS" : "FAIL"}  ${surface} green before the removal`);
    console.log(`  ${wentRed ? "PASS" : "FAIL"}  ${element} red on ${surface} after the removal`);
    console.log(`  ${othersStayedGreen ? "PASS" : "FAIL"}  every other row still green`);
    if (!control.restored) {
      failures.push(`negative control: the clean re-mount produced no sheet`);
      console.log(`  FAIL  re-mount clean — no sheet`);
    } else {
      const restoredGreen = Object.values(control.restored).every(Boolean);
      if (!restoredGreen) failures.push(`negative control: the clean re-mount did not restore green`);
      console.log(`  ${restoredGreen ? "PASS" : "FAIL"}  re-mount clean — ${element} green again`);
    }
  }
  console.log("");

  for (const pair of REGISTERED_STACKED_PAIRS) {
    const report = await page.evaluate((shape) => window.__stackedSheetGrammar(shape), pair);
    console.log(`sheet-grammar: stacked pair — ${pair.name}\n`);
    if (report.error) {
      failures.push(`${pair.name}: ${report.error}`);
      console.log(`  FAIL  ${pair.name} — ${report.error}`);
      continue;
    }
    const checks = [
      [`parent bounding box Δ≤1px (max ${report.parentDelta.toFixed(2)}px)`, report.parentBox],
      ["parent dims and scales back", report.parentTreatment],
      ["exactly one scrim", report.oneScrim],
      ["scrim between the top two sheets", report.scrimBetween],
      ["child header has title and close", report.childHeader],
      ["child close target ≥44×44", report.closeTarget],
      ["child header inset ≥16px", report.headerInset],
      ["child title ≥16px", report.titleSize],
      ["keyboard inset belongs to child", report.childKeyboard && report.parentKeyboard],
      [`child depth ${report.depth} (want ${report.expectedDepth})`, report.depth === report.expectedDepth],
      ["child drag leaves parent in place", report.dragParentUnchanged],
      [`stack settles (${report.settleRecords} body mutations while idle)`, report.settleRecords === 0],
      ["parent entrance settled before measurement", report.parentSettled],
      ["child entrance settled before measurement", report.childSettled],
    ];
    if (pair.child.overflow) checks.push([
      `long list scrolls with a visible fade (${report.overflowMeasured.scrollHeight}>${report.overflowMeasured.clientHeight})`,
      report.overflow,
    ]);
    for (const [label, ok] of checks) {
      if (!ok) failures.push(`${pair.name}: ${label}`);
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${pair.name} — ${label}`);
    }
    console.log("");
  }

  const stackingControl = await page.evaluate(() => window.__stackedSheetGrammarNegativeControl());
  console.log("sheet-grammar: stacking negative control — child mounted without parent treatment\n");
  if (stackingControl.error) {
    failures.push(`stacking negative control: ${stackingControl.error}`);
    console.log(`  FAIL  stacking negative control — ${stackingControl.error}`);
  } else {
    const { before, oldWay, restored } = stackingControl;
    const controlBeforeGreen = before.treated === true;
    const oldWayRed = oldWay.treated === false;
    const controlRestoredGreen = restored.treated === true;
    if (!controlBeforeGreen) failures.push("stacking negative control: parent treatment was not green before the old-way mount");
    if (!oldWayRed) failures.push("stacking negative control: the old-way mount stayed green");
    if (!controlRestoredGreen) failures.push("stacking negative control: parent treatment did not return green");
    console.log(`  ${controlBeforeGreen ? "PASS" : "FAIL"}  parent treatment green before the old-way mount (opacity ${before.dim}, content transform ${before.transform})`);
    console.log(`  ${oldWayRed ? "PASS" : "FAIL"}  parent treatment red for the old-way mount (opacity ${oldWay.dim}, content transform ${oldWay.transform})`);
    console.log(`  ${controlRestoredGreen ? "PASS" : "FAIL"}  parent treatment green after restoration (opacity ${restored.dim}, content transform ${restored.transform})`);
  }
  console.log("");

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);

  // Both engines, because a phone runs the app in a WebKit web view and the desktop and the rest of
  // this lane run it in Chrome. Flex minimum sizing and intrinsic text measurement differ enough
  // between the two that a surface can fit in one and overflow in the other.
  for (const [engineName, engine, launchOptions] of [
    ["Chrome", chromium, { executablePath: findChrome() }],
    ["WebKit", webkit, {}],
  ]) {
    await runOverflowSweep(engineName, engine, launchOptions);
  }
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 5. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nsheet-grammar: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nsheet-grammar: PASS — every registered surface satisfies all eight grammar columns,");
console.log("  every close target clears 44x44 with no descendant past the surface's right edge,");
console.log("  every registered parent-to-child row keeps one scrim, top-only keyboard ownership and");
console.log("  an unmigrated parent treatment went red before the stacking control returned green;");
console.log("  and on both engines every sheet the plugin can present — with the fixtures' own names");
console.log("  and again with an unbreakable one — kept its scroll width inside its client width,");
console.log("  drew nothing past its right edge and left the document unscrolled sideways, after a");
console.log(`  ${OVERFLOW_CONTROL_WIDTH_PX}px child injected into a clean surface proved the sweep can go red.`);
process.exit(0);
