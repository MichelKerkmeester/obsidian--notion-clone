// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-model.test
// COMPONENT: accessibility-label wording regression test
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { formatTimelineAccessibilityLabel } from "./calendar-timeline-model";

describe("formatTimelineAccessibilityLabel", () => {
  it("summarizes the visible window and off-window event counts", () => {
    expect(formatTimelineAccessibilityLabel("2026-08-24", "2026-08-30", 3, 2, 1, 1))
      .toBe("Timeline 2026-08-24 to 2026-08-30. 3 events in the visible range; 2 outside the range (1 before and 1 after).");
  });

  it("reports an empty timeline without omitting the window", () => {
    expect(formatTimelineAccessibilityLabel("2026-08-24", "2026-08-30", 0, 0, 0, 0))
      .toBe("Timeline 2026-08-24 to 2026-08-30. 0 events in the visible range; 0 outside the range (0 before and 0 after).");
  });
});
