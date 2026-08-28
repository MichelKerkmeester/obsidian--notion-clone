import { describe, expect, it, vi } from "vitest";

import { getTableKeyboardNavigationIntent, TableKeyboardNavigationController } from "./TableKeyboardNavigation";

function keyEvent(key: string, extra: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    target: null,
    preventDefault: vi.fn(),
    ...extra,
  } as unknown as KeyboardEvent;
}

describe("table keyboard navigation", () => {
  it("maps spreadsheet movement, editing, and paging keys", () => {
    expect(getTableKeyboardNavigationIntent(keyEvent("ArrowRight"))).toBe("right");
    expect(getTableKeyboardNavigationIntent(keyEvent("Tab", { shiftKey: true }))).toBe("previous");
    expect(getTableKeyboardNavigationIntent(keyEvent("Home", { ctrlKey: true }))).toBe("grid-start");
    expect(getTableKeyboardNavigationIntent(keyEvent("Enter"))).toBe("edit");
    expect(getTableKeyboardNavigationIntent(keyEvent("PageDown"))).toBe("page-down");
  });

  it("delegates handled keys to the shared controller", () => {
    const move = vi.fn();
    const edit = vi.fn();
    const controller = new TableKeyboardNavigationController({
      hasSelection: () => true,
      move,
      edit,
      toggle: vi.fn(),
      escape: vi.fn(),
    });
    const event = keyEvent("ArrowDown", { shiftKey: true });
    expect(controller.handleKeydown(event)).toBe(true);
    expect(move).toHaveBeenCalledWith("down", true);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
