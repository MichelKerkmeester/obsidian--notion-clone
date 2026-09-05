// ───────────────────────────────────────────────────────────────────
// MODULE:    record-open-target
// COMPONENT: one answer to "where does a record open", for every affordance
// ───────────────────────────────────────────────────────────────────
//
// Twenty affordances used to resolve to four surfaces and the surface was decided by which control
// was clicked. The same glyph and the same label opened a preview from a table row and a real
// workspace leaf from a list row; a keyboard shortcut and the button beside it disagreed; and the
// touch answer was a hardcoded branch rather than anything a reader had chosen.
//
// This decides it once. The affordance says which record and whether it has an element to anchor
// against; the setting says what the reader wants; the platform says what is possible. Nothing else
// participates, which is the point — an affordance that can reach a surface on its own is an
// affordance that can disagree with the setting again.
//
// WHAT THIS DOES NOT DECIDE: how a surface is built, or what it shows. It returns a name. The view
// owns the construction, so a surface can change shape without every call site learning about it.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

/**
 * Where a record opens.
 *
 * `panel` is the record detail surface — a side panel on a desktop, a bottom sheet on a phone.
 * `peek` is the lightweight preview layer that needs something to point at. The remaining three are
 * real workspace leaves and differ only in where the leaf goes.
 */
export type RecordOpenTarget = "panel" | "peek" | "tab" | "split" | "window";

export const RECORD_OPEN_TARGETS: RecordOpenTarget[] = ["panel", "peek", "tab", "split", "window"];

/**
 * How a surface takes its position once the target is known.
 *
 * `anchored` points the surface at the element that opened it. `docked` gives it the pane's edge
 * instead, and exists because an affordance with no element to point at used to hand the positioner
 * the whole container as its anchor. A container fills the pane, so it leaves no room above or below
 * itself; the anchored arithmetic then finds no space, falls back to pinning the surface at the top
 * of the viewport, and lets whatever height the content happens to have at that moment stand — which
 * renders as a clipped strip rather than a panel. Docking answers from the pane instead of from an
 * element, so there is no space to run out of.
 */
export type RecordSurfacePlacement = "anchored" | "docked";

/**
 * The default when the setting has never been written.
 *
 * `panel` rather than `peek`, because it is what most affordances already did — every list, board,
 * gallery, calendar and timeline body press, and every touch open — so an unset plugin keeps the
 * behaviour most of its surfaces had, and the ones that change are the four that disagreed with
 * their own siblings.
 */
export const DEFAULT_RECORD_OPEN_TARGET: RecordOpenTarget = "panel";

export interface OpenTargetRequest {
  /** The persisted preference. Absent means it has never been set, not that it is invalid. */
  setting?: string;
  /** A phone-shaped host. Decided by the caller, since only the view can measure it. */
  isPhone: boolean;
  /**
   * Whether the affordance has an element the surface can point at.
   *
   * A keyboard shortcut and a context-menu item have a record but nothing on screen to anchor to,
   * and a preview layer with no anchor has no position to take.
   */
  hasAnchor: boolean;
}

export interface ResolvedOpenTarget {
  target: RecordOpenTarget;
  /** What was asked for before the platform and the anchor had their say. */
  requested: RecordOpenTarget;
  /**
   * How the resolved surface takes its position.
   *
   * Decided here rather than at the call site for the same reason the target is: an affordance that
   * can choose its own placement is an affordance that can disagree with the one beside it, and the
   * anchorless case reached twenty call sites before it reached one of them correctly. A caller that
   * opens a workspace leaf ignores this; it is meaningful for `panel` and `peek` alone.
   */
  placement: RecordSurfacePlacement;
  /** Why it differs, or undefined when it does not. Carried so a caller can report rather than guess. */
  reason?: "no-anchor" | "phone-has-no-split" | "phone-has-no-window" | "phone-has-no-peek";
}

// ───────────────────────────────────────────────────────────────────
// 2. RESOLUTION
// ───────────────────────────────────────────────────────────────────

/** An unrecognised stored value is the default, not a crash and not a fifth behaviour. */
export function normalizeRecordOpenTarget(value: unknown): RecordOpenTarget {
  return RECORD_OPEN_TARGETS.includes(value as RecordOpenTarget)
    ? (value as RecordOpenTarget)
    : DEFAULT_RECORD_OPEN_TARGET;
}

/**
 * Setting x platform x anchor -> surface, and how that surface is placed.
 *
 * Two answers rather than one, because they have the same three inputs and separating them is what
 * let an affordance take the right surface and position it wrongly. The folds are all in one
 * direction: a target that cannot exist here becomes the nearest one that can. None of them
 * silently becomes something unrelated, and each carries the reason, so a caller that wants to tell
 * the reader why they got a sheet instead of a split can.
 */
export function resolveRecordOpenTarget(request: OpenTargetRequest): ResolvedOpenTarget {
  const requested = normalizeRecordOpenTarget(request.setting);
  const fold = foldToTarget(requested, request);
  return { ...fold, requested, placement: resolvePlacement(fold.target, request) };
}

/** The target alone, before placement: setting x platform x anchor -> surface. */
function foldToTarget(
  requested: RecordOpenTarget,
  request: OpenTargetRequest,
): Pick<ResolvedOpenTarget, "target" | "reason"> {
  // A preview layer is positioned against something, and points at nothing else by design. With
  // nothing to point at it has no shape left, so the panel takes it — which is also what the panel
  // is for, and the panel can be docked instead.
  if (requested === "peek" && !request.hasAnchor) {
    return { target: "panel", reason: "no-anchor" };
  }

  if (request.isPhone) {
    // A phone has one pane. A split and a popout are both "another window" on a surface that has
    // none, and a peek is a hover-shaped idea on a device with no hover.
    if (requested === "split") return { target: "tab", reason: "phone-has-no-split" };
    if (requested === "window") return { target: "tab", reason: "phone-has-no-window" };
    if (requested === "peek") return { target: "panel", reason: "phone-has-no-peek" };
  }

  return { target: requested };
}

/**
 * Anchored unless the surface is one of this plugin's own AND has nothing to anchor to.
 *
 * A phone is deliberately excluded. Its panel is a bottom sheet placed from the viewport, which
 * already asks the anchor for nothing, so docking it would replace a working answer with a second
 * one. The defect this exists for is a desktop pane with a container standing in for an element.
 */
function resolvePlacement(target: RecordOpenTarget, request: OpenTargetRequest): RecordSurfacePlacement {
  if (opensAWorkspaceLeaf(target)) return "anchored";
  if (request.isPhone || request.hasAnchor) return "anchored";
  return "docked";
}

/** True when the resolved target is a real workspace leaf rather than one of this plugin's surfaces. */
export function opensAWorkspaceLeaf(target: RecordOpenTarget): boolean {
  return target === "tab" || target === "split" || target === "window";
}
