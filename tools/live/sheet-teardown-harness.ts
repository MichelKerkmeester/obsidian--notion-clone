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
  ];
  clearBody(doc);
  return results;
}
