// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-teardown-harness
// COMPONENT: asserts every sheet producer leaves the body clean when its sheet closes
// ───────────────────────────────────────────────────────────────────
//
// Mounting a phone sheet is `applySheetChrome(el, true)` and taking it down is
// `applySheetChrome(el, false)`. That is a symmetric-call contract, and the "on"
// half looks complete on its own, so a producer that never makes the second call
// reads as correct at every call site and in every review.
//
// The consequence is not cosmetic. The backdrop is a SIBLING on the body, not a
// child of the sheet, so removing the panel alone leaves a full-screen element at
// `inset: 0` with `pointer-events: auto` over the entire app. Nothing else takes
// it down. A user cannot click anything and reports that the app froze.
//
// It compounds: the teardown refuses to remove the backdrop while any sheet is
// still on the body, so one producer that leaks its panel also blocks every later
// producer from cleaning up the backdrop. The first leak wins permanently.
//
// WHY A PARITY CHECK RATHER THAN A THRESHOLD. One producer does this correctly —
// the owned menu takes its chrome down before removing its node, and says so in
// its own comment. Comparing every other producer against that one cannot be
// satisfied by a harness supplying a convenient value: the same run has to report
// a pass for the reference and a failure for a leaker, from one code path. A
// harness faking that would have to give two different wrong answers at once.
//
// WHAT THIS DOES NOT PROVE: no Obsidian host is constructed, so this measures the
// chrome contract rather than any particular caller's lifecycle. A producer whose
// close path is never reached on a device would pass here and still leak there.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { applySheetChrome } from "../../src/views/mobile-bottom-sheet";
import { DbModal } from "../../src/views/modals/db-modal";
import { ViewConfigPanelRenderer } from "../../src/views/view-config-panel-renderer";
import { ColumnManagerRenderer } from "../../src/views/column-manager-renderer";
import { installPopoverAutoClose } from "../../src/views/popover-auto-close";
import { overlayStack } from "../../src/views/overlay-stack";

// ───────────────────────────────────────────────────────────────────
// 2. SHAPES
// ───────────────────────────────────────────────────────────────────

const SCRIM = ".db-mobile-sheet-scrim";
const SHEET = ".db-mobile-bottom-sheet";

export interface TeardownResult {
  producer: string;
  /** The close path this producer's callers actually run. */
  closeShape: string;
  scrimLeft: number;
  sheetsLeft: number;
  pass: boolean;
  detail: string;
}

/**
 * The producers, and the close each one's callers really perform.
 *
 * `chrome-then-remove` is the correct shape: take the chrome down first, because
 * the backdrop is a body sibling and removing the panel alone strands it.
 * `remove-only` is what a caller does when the producer hands back no teardown —
 * the panel goes and nothing else is told.
 */
export type CloseShape = "chrome-then-remove" | "remove-only";

// ───────────────────────────────────────────────────────────────────
// 3. THE PARITY RUN
// ───────────────────────────────────────────────────────────────────

function mountSheet(doc: Document, label: string): HTMLElement {
  const panel = doc.createElement("div");
  panel.className = "db-panel";
  panel.setAttribute("data-producer", label);
  doc.body.appendChild(panel);
  applySheetChrome(panel, true);
  return panel;
}

/** Reset between producers so one leak cannot be read as the next one's. */
function clearBody(doc: Document): void {
  for (const node of Array.from(doc.body.querySelectorAll(`${SHEET}, ${SCRIM}, [data-producer]`))) {
    node.remove();
  }
}

/**
 * Let the removal watcher run before reading the result.
 *
 * The backdrop comes down from a MutationObserver, which fires as a microtask after the removal
 * rather than inside it. Asserting synchronously would read the DOM one tick too early and call a
 * working teardown a leak. One microtask plus one frame is the whole budget: if the backdrop is
 * still there after a rendered frame, the user has seen it.
 */
async function settle(doc: Document): Promise<void> {
  await Promise.resolve();
  await new Promise<void>((done) => {
    const view = doc.defaultView;
    if (view) view.requestAnimationFrame(() => done());
    else done();
  });
}

async function runProducer(doc: Document, producer: string, closeShape: CloseShape): Promise<TeardownResult> {
  clearBody(doc);
  const panel = mountSheet(doc, producer);

  // Mounting must actually have produced a backdrop, or the teardown assertion below
  // would pass on a surface that never had one — an empty-set pass proving nothing.
  const mountedScrim = doc.body.querySelectorAll(SCRIM).length;

  if (closeShape === "chrome-then-remove") {
    applySheetChrome(panel, false);
    panel.remove();
  } else {
    panel.remove();
  }
  await settle(doc);

  const scrimLeft = doc.body.querySelectorAll(SCRIM).length;
  const sheetsLeft = doc.body.querySelectorAll(SHEET).length;
  const pass = mountedScrim === 1 && scrimLeft === 0 && sheetsLeft === 0;

  return {
    producer,
    closeShape,
    scrimLeft,
    sheetsLeft,
    pass,
    detail: mountedScrim !== 1
      ? `mount produced ${mountedScrim} backdrops, expected 1 — this run proves nothing about teardown`
      : pass
        ? "backdrop and sheet both gone"
        : `${scrimLeft} backdrop(s) and ${sheetsLeft} sheet(s) left on the body`
          + " — a full-screen element at inset 0 with pointer-events auto, over the whole app",
  };
}

/**
 * Two sheets open, one leaks, the other closes properly.
 *
 * This is the case that made a single leak permanent rather than transient. The old teardown asked
 * the DOM whether any sheet class was present, so a panel detached without taking its chrome down
 * still counted, and the backdrop could never come down again — one producer's leak disabled
 * cleanup for every producer after it, for the life of the session.
 *
 * The leaked panel here is genuinely detached, which is what `.remove()` does. A panel still ON the
 * body is an OPEN sheet, and the backdrop staying up for it is correct rather than a leak — an
 * earlier version of this case re-attached the node and so asserted the opposite of the truth.
 */
async function runCompoundingCase(doc: Document): Promise<TeardownResult> {
  clearBody(doc);
  const leaked = mountSheet(doc, "leaked");
  const wellBehaved = mountSheet(doc, "well-behaved");

  // The leak: detached without ever taking its chrome down.
  leaked.remove();
  // The correct close, while the leaked panel is still unaccounted for.
  applySheetChrome(wellBehaved, false);
  wellBehaved.remove();
  await settle(doc);

  const scrimLeft = doc.body.querySelectorAll(SCRIM).length;
  return {
    producer: "a correct teardown after another producer leaked",
    closeShape: "chrome-then-remove",
    scrimLeft,
    sheetsLeft: doc.body.querySelectorAll(SHEET).length,
    pass: scrimLeft === 0,
    detail: scrimLeft === 0
      ? "the backdrop came down despite the earlier leak"
      : "the backdrop survived a correct teardown, because a detached sheet still counted"
        + " — one producer's leak would disable cleanup for every producer after it",
  };
}

/**
 * Model a host that detaches a wrapper other than the node we registered as a sheet.
 *
 * Every other producer here removes the registered panel itself, so the watcher sees it go. A modal
 * does not: the chrome is applied to the modal element, the host owns the container above it, and
 * closing detaches that container. The registered node is left on the body, reads as connected
 * forever, and pins the backdrop over the whole app for the rest of the session.
 *
 * Obsidian's Modal cannot be constructed in the catalogue, so the shape is built directly and the
 * shared base close hook is invoked on a prepared instance. The guard on that call is the point of
 * the producer rather than defensiveness: a base that never takes its chrome down has no hook to
 * invoke, and this must report that as a leak instead of failing to run.
 */
async function runDbModalDetachedHostCase(doc: Document): Promise<TeardownResult> {
  clearBody(doc);
  const container = doc.createElement("div");
  const modal = container.appendChild(doc.createElement("div"));
  applySheetChrome(modal, true);
  doc.body.appendChild(container);
  const mountedScrim = doc.body.querySelectorAll(SCRIM).length;

  const takeChromeDown = (DbModal.prototype as Partial<DbModal>).onClose;
  takeChromeDown?.call({ modalEl: modal } as unknown as DbModal);
  container.remove();
  await settle(doc);

  const scrimLeft = doc.body.querySelectorAll(SCRIM).length;
  const sheetsLeft = doc.body.querySelectorAll(SHEET).length;
  const pass = mountedScrim === 1 && scrimLeft === 0 && sheetsLeft === 0;
  return {
    producer: "DbModal with a detached host wrapper",
    closeShape: "base onClose before wrapper removal",
    scrimLeft,
    sheetsLeft,
    pass,
    detail: mountedScrim !== 1
      ? `mount produced ${mountedScrim} backdrops, expected 1 — this run proves nothing about teardown`
      : pass
        ? "base close restored the panel before the host wrapper was removed"
        : `${scrimLeft} backdrop(s) and ${sheetsLeft} sheet(s) left after the host wrapper was removed`,
  };
}

// ───────────────────────────────────────────────────────────────────
// 3a. THE REAL HEADER PANELS
// ───────────────────────────────────────────────────────────────────

/**
 * Open, reopen and close a real header panel, and require the body to be clean at the end.
 *
 * Everything above models a close SHAPE with a plain div, which is honest about the chrome
 * contract and blind to what any caller actually does. These two cases close that gap for the
 * surfaces where it mattered most.
 *
 * Both renderers used to find their own panel with a container-scoped `querySelector`, and on a
 * phone the panel is portalled onto the body — so the lookup matched nothing from the moment it
 * became a sheet. Measured before the fix: reopening left TWO panels on the body and closing
 * removed NEITHER, with the backdrop still up over the whole app. On desktop the same sequence was
 * clean, because there the panel never leaves the container, which is why no desktop pass could
 * see it. The reopen step is in here deliberately: a check that only opened and closed once would
 * have passed on the duplicate-leaking code.
 */
async function runHeaderPanel(
  doc: Document,
  producer: string,
  selector: string,
  open: (container: HTMLElement, visible: boolean, anchor: HTMLElement) => void,
): Promise<TeardownResult> {
  clearBody(doc);
  const container = doc.createElement("div");
  container.className = "note-database-container";
  doc.body.appendChild(container);
  // A connected anchor, because the positioner returns without doing anything when it has none —
  // and a panel that never became a sheet would measure nothing about sheet teardown.
  const anchor = doc.createElement("button");
  container.appendChild(anchor);

  open(container, true, anchor);
  const mountedScrim = doc.body.querySelectorAll(SCRIM).length;
  const mountedPanels = doc.body.querySelectorAll(selector).length;

  // Reopening without closing: the step that exposed the duplicate.
  open(container, true, anchor);
  const panelsAfterReopen = doc.body.querySelectorAll(selector).length;

  open(container, false, anchor);
  await settle(doc);

  const scrimLeft = doc.body.querySelectorAll(SCRIM).length;
  const panelsLeft = doc.body.querySelectorAll(selector).length;
  container.remove();

  const mountedCleanly = mountedScrim === 1 && mountedPanels === 1;
  const pass = mountedCleanly && panelsAfterReopen === 1 && scrimLeft === 0 && panelsLeft === 0;

  return {
    producer,
    closeShape: "open / reopen / close",
    scrimLeft,
    sheetsLeft: panelsLeft,
    pass,
    detail: !mountedCleanly
      ? `opening produced ${mountedPanels} panel(s) and ${mountedScrim} backdrop(s), expected 1 of each`
        + " — this run proves nothing about teardown"
      : panelsAfterReopen !== 1
        ? `reopening left ${panelsAfterReopen} panels on the body — the old one was never found to remove`
        : pass
          ? "one panel throughout, and the body is clean after close"
          : `${panelsLeft} panel(s) and ${scrimLeft} backdrop(s) left on the body after close`,
  };
}

/**
 * Thunks, not promises. These cases share one body and each resets it, so building them as started
 * promises would let the second one clear the body out from under the first before it read its
 * result — the harness racing itself, which is exactly the kind of fault that reports a green.
 */
function headerPanelCases(doc: Document): (() => Promise<TeardownResult>)[] {
  const config = {
    viewType: "table",
    schema: { columns: [{ key: "name", label: "Name", type: "text" }] },
  } as never;
  const columns = [{ key: "name", label: "Name", type: "text" }] as never;

  const viewConfig = new ViewConfigPanelRenderer();
  const columnManager = new ColumnManagerRenderer();
  const noop = (): void => undefined;

  return [
    () => runHeaderPanel(doc, "view config panel (real renderer)", ".db-view-config-panel", (container, visible, anchor) => {
      viewConfig.render(container, visible, config, { app: {} as never, onChange: noop } as never, anchor);
    }),
    () => runHeaderPanel(doc, "column manager (real renderer)", ".db-column-manager", (container, visible, anchor) => {
      // `hiddenColumns` is a real Set here, not a stub: the header reads it to count visible
      // columns, so an empty object would throw rather than render.
      columnManager.render(container, visible, config, { groupByField: "", hiddenColumns: new Set<string>() } as never, columns, {
        close: noop,
        setColumnVisible: noop,
        setAllColumnsVisible: noop,
        moveColumn: noop,
        moveColumnTo: noop,
        toggleColumnWrap: noop,
        editColumn: noop,
        addColumn: noop,
        deleteColumn: noop,
      } as never, anchor);
    }),
  ];
}

/**
 * The two lookups, run against the same open sheet, in the same breath.
 *
 * A phone sheet is portalled onto the body, so the container-scoped `querySelector` this used to
 * register with matches NOTHING — it returned early and the overlay stack never learned the sheet
 * existed, which is why the backdrop and Escape dismiss these panels on desktop while a drag does
 * nothing on a phone. Dismissal is the stack's to perform, and it can only dismiss what it knows.
 *
 * Both lookups are run here rather than only the new one, because "the retained reference works"
 * is only half the claim; the half that explains the bug is that the selector does not. A run
 * where BOTH found the panel would mean the sheet never portalled and the case proves nothing.
 */
async function runRegistrationCase(doc: Document): Promise<TeardownResult> {
  clearBody(doc);
  const container = doc.createElement("div");
  container.className = "note-database-container";
  doc.body.appendChild(container);
  const anchor = doc.createElement("button");
  container.appendChild(anchor);

  const renderer = new ViewConfigPanelRenderer();
  const config = {
    viewType: "table",
    schema: { columns: [{ key: "name", label: "Name", type: "text" }] },
  } as never;
  renderer.render(container, true, config, { app: {} as never, onChange: () => undefined } as never, anchor);

  const foundBySelector = container.querySelector<HTMLElement>(".db-view-config-panel");
  const foundByReference = renderer.getPanel();

  let dismissed = false;
  if (foundByReference) {
    installPopoverAutoClose({ panel: foundByReference, anchorEl: anchor, close: () => foundByReference.remove() });
    dismissed = overlayStack.dismissPanel(foundByReference, "programmatic");
  }
  await settle(doc);

  renderer.render(container, false, config, { app: {} as never, onChange: () => undefined } as never, anchor);
  await settle(doc);
  container.remove();

  const pass = foundBySelector === null && foundByReference !== null && dismissed;
  return {
    producer: "overlay-stack registration of a portalled sheet",
    closeShape: "selector vs retained reference",
    scrimLeft: doc.body.querySelectorAll(SCRIM).length,
    sheetsLeft: doc.body.querySelectorAll(SHEET).length,
    pass,
    detail: foundBySelector !== null
      ? "the container selector still found the panel, so it never portalled — this run proves nothing"
      : !foundByReference
        ? "the retained reference did not find the panel either"
        : dismissed
          ? "the selector finds nothing, the retained reference finds the sheet, and the stack dismisses it"
          : "the stack would not dismiss the sheet, so it was never registered",
  };
}

/**
 * The backdrop takes the tap by default, and lets it through only when a producer asks.
 *
 * Both directions in one case, because only the pair is evidence. "The backdrop is modal" passes on
 * a build where the option is ignored entirely and every backdrop is modal — the opt-out is what
 * proves the default is a decision rather than the only behaviour available.
 *
 * This is the control the phase recorded as observed once and never carried in a run: without it,
 * a regression that made every backdrop permeable would leave the modal assertion the only witness,
 * and that assertion would fail loudly — but a regression that made the opt-out inert would pass
 * silently, and that is the direction users lose presses to.
 */
async function runScrimPointerContract(doc: Document): Promise<TeardownResult> {
  clearBody(doc);
  const modal = doc.createElement("div");
  modal.className = "db-panel";
  modal.setAttribute("data-producer", "scrim-default");
  doc.body.appendChild(modal);
  applySheetChrome(modal, true);
  const defaultPointer = doc.body.querySelector<HTMLElement>(SCRIM)?.style.pointerEvents ?? "(none present)";
  applySheetChrome(modal, false);
  modal.remove();
  await settle(doc);

  const permeable = doc.createElement("div");
  permeable.className = "db-panel";
  permeable.setAttribute("data-producer", "scrim-optout");
  doc.body.appendChild(permeable);
  applySheetChrome(permeable, true, { scrimCapturesPointer: false });
  const optOutPointer = doc.body.querySelector<HTMLElement>(SCRIM)?.style.pointerEvents ?? "(none present)";
  applySheetChrome(permeable, false);
  permeable.remove();
  await settle(doc);

  // "" means the stylesheet's own value stands, which is the modal one.
  const defaultIsModal = defaultPointer === "";
  const optOutIsPermeable = optOutPointer === "none";

  return {
    producer: "the backdrop's pointer contract, both directions",
    closeShape: "default vs opt-out",
    scrimLeft: doc.body.querySelectorAll(SCRIM).length,
    sheetsLeft: doc.body.querySelectorAll(SHEET).length,
    pass: defaultIsModal && optOutIsPermeable,
    detail: !defaultIsModal
      ? `the default backdrop set pointer-events to "${defaultPointer}" — a sheet is leaking presses to the view behind it`
      : !optOutIsPermeable
        ? `the opt-out produced "${optOutPointer}", not "none" — a producer that asked for a permeable backdrop did not get one`
        : 'default is modal (stylesheet value stands) and the opt-out reads "none"',
  };
}

export async function runSheetTeardownParity(doc: Document = document): Promise<TeardownResult[]> {
  const results: TeardownResult[] = [
    // The reference. Its own comment says it takes the chrome down before the node goes,
    // because the backdrop is a body sibling rather than a child.
    await runProducer(doc, "owned menu (reference)", "chrome-then-remove"),
    await runProducer(doc, "record detail panel", "chrome-then-remove"),
    // These mount through the shared positioner, which hands back no chrome teardown,
    // so their callers remove the panel and nothing takes the backdrop down.
    await runProducer(doc, "filter / sort / column / view panels", "remove-only"),
    await runProducer(doc, "group popover", "remove-only"),
    await runProducer(doc, "add-view sheet", "remove-only"),
    await runCompoundingCase(doc),
    await runDbModalDetachedHostCase(doc),
  ];
  // Real renderers, started one at a time: each resets the body, so they must not overlap.
  for (const runCase of headerPanelCases(doc)) results.push(await runCase());
  results.push(await runRegistrationCase(doc));
  results.push(await runScrimPointerContract(doc));
  clearBody(doc);
  return results;
}
