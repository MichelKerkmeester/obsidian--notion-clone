// ───────────────────────────────────────────────────────────────────
// MODULE:    interaction-snapshot.test
// COMPONENT: unit test for cloneInteractionSnapshot's deep-copy guarantee
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { cloneInteractionSnapshot, InteractionSnapshot } from "./interaction-snapshot";

// ───────────────────────────────────────────────────────────────────
// 2. CLONE SNAPSHOT TEST
// ───────────────────────────────────────────────────────────────────

describe("InteractionSnapshot", () => {
  it("clones focus, range, draft, and pointer state without sharing nested objects", () => {
    const snapshot: InteractionSnapshot = {
      focusedCell: { rowPath: "a.md", colKey: "status" },
      selectedRange: {
        anchor: { rowPath: "a.md", colKey: "name" },
        focus: { rowPath: "b.md", colKey: "status" },
        active: { rowPath: "b.md", colKey: "status" },
      },
      activeDraft: {
        value: "pending",
        inputType: "text",
        cell: { rowPath: "a.md", colKey: "title" },
        editorKind: "text",
      },
      pointerPosition: { x: 12, y: 24 },
    };
    const clone = cloneInteractionSnapshot(snapshot);
    expect(clone).toEqual(snapshot);
    expect(clone).not.toBe(snapshot);
    expect(clone.selectedRange).not.toBe(snapshot.selectedRange);
    expect(clone.activeDraft).not.toBe(snapshot.activeDraft);
    expect(clone.activeDraft?.cell).not.toBe(snapshot.activeDraft?.cell);
    expect(clone.pointerPosition).not.toBe(snapshot.pointerPosition);
  });
});
