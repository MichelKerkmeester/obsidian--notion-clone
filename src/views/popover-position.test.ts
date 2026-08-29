// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-position.test
// COMPONENT: verifies the preferred-side / flip / clamp fallback chain
//            for horizontal popover placement
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The clamp-target guard below reads this module's source, which needs the node builtins the
   plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { resolvePopoverHorizontalLeft } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("resolvePopoverHorizontalLeft", () => {
  const bounds = { left: 0, right: 400 };

  it("opens to the preferred side when there is room", () => {
    expect(resolvePopoverHorizontalLeft({ left: 100, right: 140, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(148);
  });

  it("flips to the opposite side when the preferred side is clipped", () => {
    expect(resolvePopoverHorizontalLeft({ left: 350, right: 390, width: 40 }, bounds, 120, 8, 8, "right", "right")).toBe(222);
  });

  it("keeps the aligned position inside the viewport when neither side fits", () => {
    expect(resolvePopoverHorizontalLeft({ left: 180, right: 220, width: 420 }, bounds, 420, 8, 8, "center")).toBe(8);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. CLAMP TARGET ORDERING
// ───────────────────────────────────────────────────────────────────

describe("visible-bounds clamp target", () => {
  // The helper resolves its region through the DOM and this suite has no jsdom, so the only
  // available guard reads the source. It pins the selector order and nothing else.
  it("prefers the root split over regions that span the sidebars", () => {
    const source = readFileSync(resolve(__dirname, "./popover-position.ts"), "utf-8");
    const rootSplit = source.indexOf('".workspace-split.mod-root"');
    const appContainer = source.indexOf('".app-container"');

    expect(rootSplit).toBeGreaterThan(-1);
    // Clamping to a region that includes the right sidebar lets a popover slide under it.
    expect(rootSplit).toBeLessThan(appContainer);
  });
});
