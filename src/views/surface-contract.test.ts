// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-contract
// COMPONENT: pure contract tests for roles, producers and token keys
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import {
  SURFACE_REGISTRY,
  SURFACE_ROLE_DEFAULTS,
  SURFACE_TOKEN_KEYS,
  SURFACE_TOKEN_SNAPSHOT_VERSION,
} from "./surface-contract";

// ───────────────────────────────────────────────────────────────────
// 2. CONTRACT TESTS
// ───────────────────────────────────────────────────────────────────

describe("surface contract", () => {
  it("declares the role defaults from the surface vocabulary", () => {
    expect(SURFACE_ROLE_DEFAULTS.menu).toMatchObject({
      dismissal: ["outside-pointerdown", "escape", "selection"],
      focusMode: "roving",
      width: { kind: "fixed", preferredWidth: 292 },
    });
    expect(SURFACE_ROLE_DEFAULTS.panel).toMatchObject({
      dismissal: ["outside-pointerdown", "escape"],
      focusMode: "trapped",
      width: { kind: "bounded", minWidth: 292, maxWidth: 360 },
    });
    expect(SURFACE_ROLE_DEFAULTS.dialog).toMatchObject({
      dismissal: ["explicit-action"],
      focusMode: "trapped",
      width: { kind: "role-declared" },
    });
    expect(SURFACE_ROLE_DEFAULTS.sheet).toMatchObject({
      dismissal: ["scrim-tap", "escape", "back", "drag-to-dismiss"],
      focusMode: "trapped",
      width: { kind: "full-width" },
    });
    expect(SURFACE_ROLE_DEFAULTS.submenu).toMatchObject({
      dismissal: ["escape"],
      focusMode: "return-to-parent",
      width: { kind: "fixed", preferredWidth: 292 },
    });
    // Neither an action sheet nor a dialog: a toast reports on an operation without asking the
    // reader to answer it, so it never takes focus and dismisses itself as readily as it waits for
    // a click. `dialog`'s width policy is the nearest fit — a fixed geometry declared by the role,
    // not derived from the fixed/bounded scales the other floating surfaces share.
    expect(SURFACE_ROLE_DEFAULTS.feedback).toMatchObject({
      dismissal: ["explicit-action", "timeout"],
      focusMode: "none",
      width: { kind: "role-declared" },
    });
  });

  it("keeps the verified producer registry closed over six entries", () => {
    expect(Object.keys(SURFACE_REGISTRY)).toEqual([
      "column-menu",
      "owned-menu",
      "record-detail-panel",
      "filter-panel",
      "date-value-picker",
      "toast",
    ]);
    expect(SURFACE_REGISTRY["column-menu"]).toEqual({ role: "menu", mount: "bodyPortal", host: "body" });
    expect(SURFACE_REGISTRY["owned-menu"]).toEqual({ role: "menu", mount: "bodyPortal", host: "body" });
    expect(SURFACE_REGISTRY["record-detail-panel"]).toEqual({ role: "panel", mount: "local", host: "container" });
    expect(SURFACE_REGISTRY["filter-panel"]).toEqual({ role: "panel", mount: "local", host: "container" });
    // Local, and correct rather than merely unmeasured. A container-mounted popover used to be
    // displaced by the leaf's own origin, because `.workspace-leaf` has `contain: strict` and paint
    // containment makes it the containing block for the fixed position the toolbar positioner
    // applies. The positioner now resolves that block and offsets against it, so placement no longer
    // depends on where a surface is mounted. Any measurement rerun on this has to put the leaf away
    // from the viewport origin, or the offset it is testing for is zero by construction.
    expect(SURFACE_REGISTRY["date-value-picker"]).toEqual({ role: "menu", mount: "local", host: "container" });
    // `showToast` builds its stack on `doc.body` on first use, the same body-portal idiom
    // `owned-menu` uses, so a measurement taken against the registry describes where it actually
    // lands rather than a role of convenience.
    expect(SURFACE_REGISTRY["toast"]).toEqual({ role: "feedback", mount: "bodyPortal", host: "body" });
  });

  it("defines a versioned plugin token key list", () => {
    expect(SURFACE_TOKEN_SNAPSHOT_VERSION).toBe(1);
    expect(SURFACE_TOKEN_KEYS.length).toBeGreaterThan(0);
    expect(SURFACE_TOKEN_KEYS).toContain("--obnotion-radius-lg");
    expect(SURFACE_TOKEN_KEYS.every((key) => key.startsWith("--obnotion-"))).toBe(true);
  });
});
