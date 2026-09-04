// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-trace
// COMPONENT: an opt-in lifecycle log for phone sheets, readable off the device
// ───────────────────────────────────────────────────────────────────
//
// Three fixes for the phone sheets have now been proven under browser emulation and reported still
// broken from the device. Each time the gap was the same one: the harness can drive a real touch
// but it cannot produce what the device produces around it — a click delivered hundreds of
// milliseconds after the finger left, a viewport that resizes when the keyboard arrives, a host
// re-render behind the surface. When the operator says "the button does nothing", every remaining
// candidate is indistinguishable from the outside, and the only party that can tell them apart is
// the device.
//
// So this records what the device sees and hands it back as text the operator can paste. The
// question it exists to settle is one fork: did the tap never reach the control, or did it reach
// the control and something moved the surface afterwards. Every entry carries a generation, and a
// generation begins when a sheet mounts — so a trace reads as one surface's whole life rather than
// as a stream to be correlated by timestamp.
//
// OFF BY DEFAULT AND INERT WHEN OFF. Nothing here is wired until the setting is turned on: no
// listeners, no allocation, and the producer hooks are behind a boolean read. A diagnostic that
// costs something when unused is a diagnostic that gets removed before it is needed.
//
// NO CONTENT. Targets are recorded as tag, id and class — never text, value or path. The operator
// is asked to paste this into a conversation, and a trace that carried note content would make that
// an unreasonable thing to ask.

// ───────────────────────────────────────────────────────────────────
// 1. STATE
// ───────────────────────────────────────────────────────────────────

/** Enough to hold a whole interaction with room to spare, and small enough to paste. */
const CAPACITY = 400;

interface TraceEntry {
  at: number;
  generation: number;
  kind: string;
  detail: string;
}

let enabled = false;
let generation = 0;
let entries: TraceEntry[] = [];
let detach: (() => void) | null = null;
let startedAt = 0;

// ───────────────────────────────────────────────────────────────────
// 2. RECORDING
// ───────────────────────────────────────────────────────────────────

export function isSheetTraceEnabled(): boolean {
  return enabled;
}

/**
 * Describe an event target without describing its contents.
 *
 * Also reports whether the node is still in the document, because that is the single fact the
 * delayed-click theory turns on: a click whose target has already been removed is retargeted, and
 * a press that began inside the sheet can arrive outside it.
 */
function describe(target: EventTarget | null): string {
  if (!target || !(target instanceof Element)) return "none";
  const id = target.id ? `#${target.id}` : "";
  const cls = target.className && typeof target.className === "string"
    ? `.${target.className.trim().split(/\s+/).slice(0, 4).join(".")}`
    : "";
  const sheet = target.closest?.(".db-mobile-bottom-sheet") ? " in-sheet" : " outside-sheet";
  return `${target.tagName.toLowerCase()}${id}${cls}${target.isConnected ? "" : " DETACHED"}${sheet}`;
}

export function traceSheet(kind: string, detail = ""): void {
  if (!enabled) return;
  entries.push({ at: Math.round(performance.now() - startedAt), generation, kind, detail });
  // Drop from the front rather than refusing at the back: the end of a trace is the part that
  // explains what just happened, and a buffer that fills up and then stops recording keeps only
  // the part nobody asked about.
  if (entries.length > CAPACITY) entries = entries.slice(entries.length - CAPACITY);
}

/** A sheet has mounted, so a new surface's life begins. Returns the generation it was given. */
export function beginSheetGeneration(detail: string): number {
  if (!enabled) return generation;
  generation += 1;
  traceSheet("sheet-open", detail);
  return generation;
}

// ───────────────────────────────────────────────────────────────────
// 3. THE SUBSCRIPTION
// ───────────────────────────────────────────────────────────────────

/**
 * Turn recording on or off for a document.
 *
 * The listeners are capture-phase and passive: this must observe the sequence the app already gets,
 * not participate in it. A trace that changed dispatch would be measuring itself.
 */
export function setSheetTraceEnabled(on: boolean, doc: Document | undefined): void {
  if (on === enabled) return;
  detach?.();
  detach = null;
  enabled = on;
  if (!on) return;

  entries = [];
  startedAt = performance.now();
  // The caller names the document. There is no ambient fallback on purpose: Obsidian opens surfaces
  // in popout windows, and a trace bound to the wrong one records an empty page while the operator
  // taps at the sheet that is actually in front of them.
  if (!doc) return;
  const target = doc;
  const view = target.defaultView;

  const viewport = (): string => {
    const visual = view?.visualViewport;
    if (!visual) return "";
    return ` viewport=${Math.round(visual.height)}@${Math.round(visual.offsetTop)}`;
  };
  const pointer = (event: Event): void => traceSheet(event.type, describe(event.target) + viewport());
  const kinds = ["pointerdown", "touchstart", "touchend", "click"];
  for (const kind of kinds) target.addEventListener(kind, pointer, { capture: true, passive: true });

  const viewportChange = (): void => traceSheet("viewport", viewport().trim());
  view?.visualViewport?.addEventListener("resize", viewportChange);
  view?.visualViewport?.addEventListener("scroll", viewportChange);

  traceSheet("trace-on", "recording started");
  detach = () => {
    for (const kind of kinds) target.removeEventListener(kind, pointer, true);
    view?.visualViewport?.removeEventListener("resize", viewportChange);
    view?.visualViewport?.removeEventListener("scroll", viewportChange);
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. READING IT BACK
// ───────────────────────────────────────────────────────────────────

export function readSheetTrace(): string {
  if (entries.length === 0) {
    return enabled
      ? "sheet trace: recording, nothing captured yet — open a sheet and tap the control that fails"
      : "sheet trace: not recording. Turn on \"Trace sheet lifecycle\" in settings first.";
  }
  const lines = entries.map(
    (entry) => `${String(entry.at).padStart(7)}ms  g${entry.generation}  ${entry.kind}  ${entry.detail}`.trimEnd(),
  );
  return [`sheet trace: ${entries.length} event(s)`, ...lines].join("\n");
}

export function clearSheetTrace(): void {
  entries = [];
  startedAt = performance.now();
}
