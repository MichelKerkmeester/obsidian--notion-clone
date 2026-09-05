// ───────────────────────────────────────────────────────────────────
// MODULE:    record-open-target.test
// COMPONENT: the resolver's folds, including the ones that must NOT happen
// ───────────────────────────────────────────────────────────────────
//
// The defect this resolver replaces was twenty affordances each deciding for themselves, so the
// assertions that matter most here are the ones proving the resolver does not quietly become a
// second opinion: an unset setting is a specific answer rather than "whatever the caller did
// before", and a target that survives its platform is returned unchanged rather than normalised
// toward something safer.

import { describe, expect, it } from "vitest";
import {
  DEFAULT_RECORD_OPEN_TARGET,
  RECORD_OPEN_TARGETS,
  normalizeRecordOpenTarget,
  opensAWorkspaceLeaf,
  resolveRecordOpenTarget,
} from "./record-open-target";

const desktop = { isPhone: false, hasAnchor: true };
const phone = { isPhone: true, hasAnchor: true };

// ───────────────────────────────────────────────────────────────────
// 1. THE UNSET CASE
// ───────────────────────────────────────────────────────────────────

describe("an unwritten setting is an answer, not an absence", () => {
  it("resolves to the panel on both platforms", () => {
    expect(resolveRecordOpenTarget({ ...desktop }).target).toBe("panel");
    expect(resolveRecordOpenTarget({ ...phone }).target).toBe("panel");
  });

  it("treats an unrecognised stored value as the default rather than a fifth behaviour", () => {
    // A settings file hand-edited to a typo, or written by an older build, must not invent a
    // surface. This is the one path where "unknown" reaching the view would be unrecoverable.
    expect(normalizeRecordOpenTarget("side-by-side")).toBe(DEFAULT_RECORD_OPEN_TARGET);
    expect(normalizeRecordOpenTarget(undefined)).toBe(DEFAULT_RECORD_OPEN_TARGET);
    expect(normalizeRecordOpenTarget(7)).toBe(DEFAULT_RECORD_OPEN_TARGET);
  });

  it("has a default that is one of the offered targets", () => {
    // A default outside the list would be unreachable from the settings control that sets it.
    expect(RECORD_OPEN_TARGETS).toContain(DEFAULT_RECORD_OPEN_TARGET);
  });
});

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MUST NOT FOLD
// ───────────────────────────────────────────────────────────────────

describe("a target that its platform supports is returned untouched", () => {
  it("keeps every target on a desktop with an anchor", () => {
    for (const target of RECORD_OPEN_TARGETS) {
      const resolved = resolveRecordOpenTarget({ ...desktop, setting: target });
      expect(resolved.target).toBe(target);
      expect(resolved.reason).toBeUndefined();
    }
  });

  it("keeps panel and tab on a phone", () => {
    // These two are the phone's whole vocabulary; folding either would leave it with one.
    expect(resolveRecordOpenTarget({ ...phone, setting: "panel" }).target).toBe("panel");
    expect(resolveRecordOpenTarget({ ...phone, setting: "tab" }).target).toBe("tab");
  });

  it("does not care about the anchor for anything but peek", () => {
    // Over-broad folding would make a keyboard shortcut open somewhere different from the button
    // beside it, which is the exact defect this resolver exists to remove.
    for (const target of ["panel", "tab", "split", "window"] as const) {
      expect(resolveRecordOpenTarget({ isPhone: false, hasAnchor: false, setting: target }).target)
        .toBe(target);
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. WHAT MUST FOLD, AND WHY
// ───────────────────────────────────────────────────────────────────

describe("a target its platform cannot show folds to the nearest one that can", () => {
  it("sends an unanchored peek to the panel", () => {
    const resolved = resolveRecordOpenTarget({ isPhone: false, hasAnchor: false, setting: "peek" });
    expect(resolved).toMatchObject({ target: "panel", requested: "peek", reason: "no-anchor" });
  });

  it("sends a phone's split and window to a tab, and its peek to the panel", () => {
    expect(resolveRecordOpenTarget({ ...phone, setting: "split" }))
      .toMatchObject({ target: "tab", requested: "split", reason: "phone-has-no-split" });
    expect(resolveRecordOpenTarget({ ...phone, setting: "window" }))
      .toMatchObject({ target: "tab", requested: "window", reason: "phone-has-no-window" });
    expect(resolveRecordOpenTarget({ ...phone, setting: "peek" }))
      .toMatchObject({ target: "panel", requested: "peek", reason: "phone-has-no-peek" });
  });

  it("keeps what was asked for alongside what it got", () => {
    // Without this the view can report that a split was unavailable; with only the folded value it
    // can only report that a tab was wanted, which is not what happened.
    const resolved = resolveRecordOpenTarget({ ...phone, setting: "window" });
    expect(resolved.requested).toBe("window");
    expect(resolved.target).not.toBe(resolved.requested);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE LEAF PREDICATE
// ───────────────────────────────────────────────────────────────────

describe("which targets are real workspace leaves", () => {
  it("separates the plugin's own surfaces from the workspace's", () => {
    expect(opensAWorkspaceLeaf("tab")).toBe(true);
    expect(opensAWorkspaceLeaf("split")).toBe(true);
    expect(opensAWorkspaceLeaf("window")).toBe(true);
    expect(opensAWorkspaceLeaf("panel")).toBe(false);
    expect(opensAWorkspaceLeaf("peek")).toBe(false);
  });

  it("covers every target, so a new one cannot be silently neither", () => {
    // A target added to the union without a decision here would default to "not a leaf" and open
    // nothing. Counting both sides is what makes that a failure rather than a quiet no-op.
    const leaves = RECORD_OPEN_TARGETS.filter(opensAWorkspaceLeaf);
    const surfaces = RECORD_OPEN_TARGETS.filter((target) => !opensAWorkspaceLeaf(target));
    expect(leaves.length + surfaces.length).toBe(RECORD_OPEN_TARGETS.length);
    expect(leaves.length).toBeGreaterThan(0);
    expect(surfaces.length).toBeGreaterThan(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. PLACEMENT, PER AFFORDANCE WITH NOTHING TO POINT AT
// ───────────────────────────────────────────────────────────────────

// Every one of these reaches the view as an open with no anchor element. They are listed
// individually rather than as one case because they arrived at the sliver independently — each was
// wired by a different renderer, and the reason the defect survived a fix to the board card is that
// a fix per affordance leaves the next affordance broken. If placement ever moves back to the call
// sites, these rows fail together and say which surfaces regressed.
const ANCHORLESS_AFFORDANCES = [
  "the row context menu's open item",
  "the timeline event menu's open item",
  "a gallery card's open button",
  "a board card's open button",
  "the open action inside the record panel itself",
] as const;

describe("an affordance with no element to point at gets a docked panel", () => {
  for (const affordance of ANCHORLESS_AFFORDANCES) {
    it(`docks the panel for ${affordance}`, () => {
      const resolved = resolveRecordOpenTarget({ isPhone: false, hasAnchor: false });
      expect(resolved.target).toBe("panel");
      expect(resolved.placement).toBe("docked");
    });
  }

  it("docks the panel a peek folded into, rather than leaving it pointing at nothing", () => {
    // The fold already sent this to the panel; without a placement to go with it the panel was
    // handed the container as its anchor, which is the case that renders as a strip.
    const resolved = resolveRecordOpenTarget({ isPhone: false, hasAnchor: false, setting: "peek" });
    expect(resolved).toMatchObject({ target: "panel", reason: "no-anchor", placement: "docked" });
  });
});

describe("placement leaves every other opening alone", () => {
  it("anchors whenever the affordance has an element", () => {
    expect(resolveRecordOpenTarget({ isPhone: false, hasAnchor: true }).placement).toBe("anchored");
    expect(resolveRecordOpenTarget({ isPhone: false, hasAnchor: true, setting: "peek" }).placement)
      .toBe("anchored");
  });

  it("anchors on a phone even with nothing to point at", () => {
    // A phone panel is a bottom sheet placed from the viewport. It never asked the anchor anything,
    // so it never had the defect, and docking it would be a second answer to a settled question.
    expect(resolveRecordOpenTarget({ isPhone: true, hasAnchor: false }).placement).toBe("anchored");
    expect(resolveRecordOpenTarget({ isPhone: true, hasAnchor: false, setting: "peek" }).placement)
      .toBe("anchored");
  });

  it("leaves the workspace's own surfaces anchored, since they take no placement from us", () => {
    for (const target of ["tab", "split", "window"] as const) {
      expect(resolveRecordOpenTarget({ isPhone: false, hasAnchor: false, setting: target }))
        .toMatchObject({ target, placement: "anchored" });
    }
  });

  it("states a placement on every path, so no caller has to guess one", () => {
    for (const setting of RECORD_OPEN_TARGETS) {
      for (const isPhone of [false, true]) {
        for (const hasAnchor of [false, true]) {
          const resolved = resolveRecordOpenTarget({ setting, isPhone, hasAnchor });
          expect(["anchored", "docked"]).toContain(resolved.placement);
        }
      }
    }
  });
});
