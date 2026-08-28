import { describe, expect, it } from "vitest";
import { DragDropFeedbackState, resolveDropPlacement } from "./DragDropFeedback";

function fakeElement(): HTMLElement {
  const classes = new Set<string>();
  return {
    dataset: {},
    classList: {
      add: (...values: string[]) => values.forEach((value) => classes.add(value)),
      remove: (...values: string[]) => values.forEach((value) => classes.delete(value)),
      toggle: (value: string, force?: boolean) => force === undefined ? !classes.has(value) : force
        ? (classes.add(value), true)
        : (classes.delete(value), false),
      contains: (value: string) => classes.has(value),
    },
    getBoundingClientRect: () => ({ top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }),
  } as unknown as HTMLElement;
}

describe("DragDropFeedbackState", () => {
  it("tracks destination placement and transactional phases", () => {
    const state = new DragDropFeedbackState();
    const target = fakeElement();
    state.begin("row-a", ["a.md"], "row-b");
    state.update(target, "after", "row-b");
    expect(state.getSnapshot()).toMatchObject({ phase: "over", sourceId: "row-a", sourcePaths: ["a.md"], destinationId: "row-b", placement: "after" });
    state.setPending();
    expect(state.getPhase()).toBe("pending");
    state.commit();
    expect(state.getPhase()).toBe("committed");
    state.clear();
    expect(state.getSnapshot()).toEqual({ phase: null, sourceId: null, sourcePaths: [], destinationId: null, placement: null, error: null });
  });

  it("retains a failure reason until the feedback is cleared", () => {
    const state = new DragDropFeedbackState();
    state.fail(new Error("move failed"));
    expect(state.getSnapshot()).toMatchObject({ phase: "failed", error: "Error: move failed" });
    state.clear();
    expect(state.getPhase()).toBeNull();
  });

  it("resolves vertical and horizontal insertion sides", () => {
    const target = fakeElement();
    expect(resolveDropPlacement(target, { clientX: 80, clientY: 20 } as DragEvent, "vertical")).toBe("before");
    expect(resolveDropPlacement(target, { clientX: 80, clientY: 80 } as DragEvent, "vertical")).toBe("after");
    expect(resolveDropPlacement(target, { clientX: 20, clientY: 80 } as DragEvent, "horizontal")).toBe("before");
    expect(resolveDropPlacement(target, { clientX: 80, clientY: 80 } as DragEvent, "horizontal")).toBe("after");
  });

  it("announces feedback phase updates to an aria-live region", () => {
    const state = new DragDropFeedbackState();
    let statusContent = "";
    const mockLiveRegion = {
      className: "db-sr-status",
      getAttribute: (name: string) => (name === "aria-live" ? "polite" : null),
      setAttribute: () => undefined,
      set textContent(value: string) {
        statusContent = value;
      },
      get textContent() {
        return statusContent;
      },
    };
    const mockDoc = {
      createElement: () => mockLiveRegion,
    };
    const mockContainer = {
      querySelector: () => null,
      appendChild: () => undefined,
    };
    const target = {
      ...fakeElement(),
      ownerDocument: mockDoc,
      closest: () => mockContainer,
    } as unknown as HTMLElement;

    state.begin("row-a", ["a.md", "b.md"]);
    state.update(target, "after", "row-c");

    state.setPending();
    expect(mockLiveRegion.getAttribute("aria-live")).toBe("polite");
    expect(mockLiveRegion.textContent).toContain("2");

    state.commit();
    expect(mockLiveRegion.textContent).toContain("2");

    state.fail(new Error("custom drag error"));
    expect(mockLiveRegion.textContent).toContain("custom drag error");
  });
});
