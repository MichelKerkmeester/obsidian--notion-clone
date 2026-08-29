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
  });

  it("keeps the verified producer registry closed over five entries", () => {
    expect(Object.keys(SURFACE_REGISTRY)).toEqual([
      "column-menu",
      "owned-menu",
      "record-detail-panel",
      "filter-panel",
      "date-value-picker",
    ]);
    expect(SURFACE_REGISTRY["column-menu"]).toEqual({ role: "menu", mount: "bodyPortal", host: "body" });
    expect(SURFACE_REGISTRY["owned-menu"]).toEqual({ role: "menu", mount: "bodyPortal", host: "body" });
    expect(SURFACE_REGISTRY["record-detail-panel"]).toEqual({ role: "panel", mount: "local", host: "container" });
    expect(SURFACE_REGISTRY["filter-panel"]).toEqual({ role: "panel", mount: "local", host: "container" });
    expect(SURFACE_REGISTRY["date-value-picker"]).toEqual({ role: "menu", mount: "bodyPortal", host: "body" });
  });

  it("defines a versioned plugin token key list", () => {
    expect(SURFACE_TOKEN_SNAPSHOT_VERSION).toBe(1);
    expect(SURFACE_TOKEN_KEYS.length).toBeGreaterThan(0);
    expect(SURFACE_TOKEN_KEYS).toContain("--db-radius-lg");
    expect(SURFACE_TOKEN_KEYS.every((key) => key.startsWith("--db-"))).toBe(true);
  });
});
