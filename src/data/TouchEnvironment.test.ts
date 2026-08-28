import { describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => ({ Platform: { isMobile: false, isTablet: false } }));

import { Platform } from "obsidian";
import { isTouchDevice } from "./TouchEnvironment";

describe("isTouchDevice", () => {
  it("recognizes Obsidian mobile and tablet platforms", () => {
    const platform = Platform as typeof Platform & { isMobile: boolean; isTablet: boolean };
    platform.isMobile = true;
    expect(isTouchDevice(undefined, undefined)).toBe(true);
    platform.isMobile = false;
    platform.isTablet = true;
    expect(isTouchDevice(undefined, undefined)).toBe(true);
    platform.isTablet = false;
  });

  it("recognizes coarse pointers and narrow split panes", () => {
    const view = { matchMedia: vi.fn(() => ({ matches: true })) } as unknown as Window;
    expect(isTouchDevice(undefined, view)).toBe(true);
    const container = { getBoundingClientRect: () => ({ width: 640 }) } as HTMLElement;
    const desktopView = { matchMedia: vi.fn(() => ({ matches: false })) } as unknown as Window;
    expect(isTouchDevice(container, desktopView)).toBe(true);
  });

  it("does not classify a normal desktop viewport as touch", () => {
    const container = { getBoundingClientRect: () => ({ width: 1200 }), clientWidth: 1200 } as HTMLElement;
    const view = { matchMedia: vi.fn(() => ({ matches: false })) } as unknown as Window;
    expect(isTouchDevice(container, view)).toBe(false);
  });
});
