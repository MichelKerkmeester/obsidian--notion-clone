// ───────────────────────────────────────────────────────────────────
// MODULE:    unstyled-links-measure.test
// COMPONENT: the pure user-agent-default classifier unstyled-links.mjs applies to a computed colour
// ───────────────────────────────────────────────────────────────────
//
// `classifyLinkColour` decides the unstyled-links verdict for every link in both the fixture pass
// and the constructed-renderer pass. It used to be an inline lookup inside the page.evaluate()
// closure; extracting it makes the three tracked defaults, and everything that is not one of them,
// provable without a browser.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { classifyLinkColour } from "./unstyled-links-measure.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. classifyLinkColour
// ───────────────────────────────────────────────────────────────────

describe("classifyLinkColour", () => {
  const defaults = {
    "rgb(0, 0, 238)": "the user agent's unvisited link blue",
    "rgb(85, 26, 139)": "the user agent's visited link purple",
    "rgb(255, 0, 0)": "the user agent's active link red",
  };

  it("names the reason for each tracked user-agent default", () => {
    expect(classifyLinkColour("rgb(0, 0, 238)", defaults)).toBe("the user agent's unvisited link blue");
    expect(classifyLinkColour("rgb(85, 26, 139)", defaults)).toBe("the user agent's visited link purple");
    expect(classifyLinkColour("rgb(255, 0, 0)", defaults)).toBe("the user agent's active link red");
  });

  it("returns null for a themed colour that is not a tracked default", () => {
    expect(classifyLinkColour("rgb(124, 58, 237)", defaults)).toBeNull();
  });

  it("returns null for a colour string that is not an exact key match", () => {
    // Chrome always serialises getComputedStyle().color as "rgb(...)"; a differently
    // formatted string (spacing, alpha channel) must not accidentally match.
    expect(classifyLinkColour("rgba(0, 0, 238, 1)", defaults)).toBeNull();
    expect(classifyLinkColour("rgb(0,0,238)", defaults)).toBeNull();
  });
});
