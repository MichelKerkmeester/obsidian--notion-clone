import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it, vi } from "vitest";
import { DragDropFeedbackState } from "./DragDropFeedback";

vi.mock("obsidian", () => ({
  TFile: class {},
}));

describe("Accessibility Defect Fixes", () => {
  const stylesPath = resolve(__dirname, "../../styles.css");
  const stylesContent = readFileSync(stylesPath, "utf-8");

  it("Item 1 & 3: baseline focus ring extends across all 9 surface roots and standardises on box-shadow", () => {
    const requiredRoots = [
      ".note-database-container",
      ".note-database-modal",
      ".note-database-settings",
      ".db-color-picker-popup",
      ".db-icon-picker-popover",
      ".db-dropdown-popover",
      ".db-cell-option-popover",
      ".formula-workbench-modal",
      ".db-chart-drilldown-modal",
    ];

    for (const root of requiredRoots) {
      expect(stylesContent).toContain(root);
    }

    expect(stylesContent).toContain("box-shadow: var(--db-accent-focus-ring);");
  });

  it("Item 2: db-icon-picker-search focus has accent focus ring box-shadow", () => {
    expect(stylesContent).toMatch(
      /\.db-icon-picker-search:focus-visible\s*\{[^}]*box-shadow:\s*var\(--db-accent-focus-ring\)/
    );
  });

  it("Item 4: peek open button is keyboard reachable without negative tabindex in TableRecordPeek.ts", () => {
    const peekPath = resolve(__dirname, "TableRecordPeek.ts");
    const peekContent = readFileSync(peekPath, "utf-8");

    // Negative tabindex should not be set on the open button
    expect(peekContent).not.toMatch(/button\.setAttribute\("tabindex",\s*"-1"\)/);
    expect(peekContent).toContain('button.setAttribute("aria-label", t("panel.open"))');
  });

  it("Item 5: TableRecordPeek and RecordDetailPanel declare dialog role and modal semantics matching focus trapping", () => {
    const peekPath = resolve(__dirname, "TableRecordPeek.ts");
    const detailPath = resolve(__dirname, "RecordDetailPanel.ts");
    const peekContent = readFileSync(peekPath, "utf-8");
    const detailContent = readFileSync(detailPath, "utf-8");

    expect(peekContent).toContain('panel.setAttribute("role", "dialog")');
    expect(peekContent).toContain('panel.setAttribute("aria-modal", "true")');

    expect(detailContent).toContain('panel.setAttribute("role", "dialog")');
    expect(detailContent).toContain('panel.setAttribute("aria-modal", "true")');
    expect(detailContent).toContain('panel.setAttribute("aria-label", title.text || r.file.basename)');
  });

  it("Item 6: selection checkboxes in Board, Gallery, and List renderers have descriptive aria-labels", () => {
    const boardPath = resolve(__dirname, "BoardRenderer.ts");
    const galleryPath = resolve(__dirname, "GalleryRenderer.ts");
    const listPath = resolve(__dirname, "ListRenderer.ts");

    const boardContent = readFileSync(boardPath, "utf-8");
    const galleryContent = readFileSync(galleryPath, "utf-8");
    const listContent = readFileSync(listPath, "utf-8");

    // Board checkboxes
    expect(boardContent).toContain('cls: "db-board-column-checkbox",');
    expect(boardContent).toContain('"aria-label": group.key || t("common.noGroup")');
    expect(boardContent).toContain('"aria-label": subgroup.key || t("common.noGroup")');
    expect(boardContent).toContain('"aria-label": row.file.basename || row.file.path');

    // Gallery checkboxes
    expect(galleryContent).toContain('cls: "db-gallery-group-checkbox",');
    expect(galleryContent).toContain('"aria-label": label || t("common.total")');
    expect(galleryContent).toContain('"aria-label": row.file.basename || row.file.path');

    // List checkboxes
    expect(listContent).toContain('cls: "db-list-group-checkbox",');
    expect(listContent).toContain('"aria-label": label || t("common.total")');
    expect(listContent).toContain('"aria-label": row.file.basename || row.file.path');
  });

  it("Item 7: urgency classes supply non-colour visual glyphs for deuteranope clarity", () => {
    expect(stylesContent).toContain(".note-database-container .urgency-red::before");
    expect(stylesContent).toContain(".note-database-container .urgency-orange::before");
    expect(stylesContent).toContain(".note-database-container .urgency-green::before");
  });

  it("Item 8: drag-drop feedback announces transactional outcomes via aria-live polite region", () => {
    const state = new DragDropFeedbackState();
    let statusText = "";
    const mockLiveRegion = {
      className: "db-sr-status",
      getAttribute: (attr: string) => (attr === "aria-live" ? "polite" : null),
      setAttribute: vi.fn(),
      set textContent(val: string) {
        statusText = val;
      },
      get textContent() {
        return statusText;
      },
    };
    const mockDoc = {
      createElement: vi.fn(() => mockLiveRegion),
    };
    const mockContainer = {
      querySelector: vi.fn(() => null),
      appendChild: vi.fn(),
    };
    const target = {
      dataset: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        toggle: vi.fn(),
      },
      ownerDocument: mockDoc,
      closest: vi.fn(() => mockContainer),
    } as any;

    state.begin("source-1", ["a.md", "b.md"]);
    state.update(target, "after", "dest-1");

    state.setPending();
    expect(mockLiveRegion.getAttribute("aria-live")).toBe("polite");
    expect(mockLiveRegion.textContent).toContain("2");

    state.commit();
    expect(mockLiveRegion.textContent).toContain("2");

    state.fail(new Error("Operation rejected"));
    expect(mockLiveRegion.textContent).toContain("Operation rejected");
  });

  it("Item 9: ToolbarRenderer disclosure popover trigger sets aria-expanded without aria-pressed", () => {
    const toolbarPath = resolve(__dirname, "ToolbarRenderer.ts");
    const toolbarContent = readFileSync(toolbarPath, "utf-8");

    expect(toolbarContent).not.toMatch(/setPopoverTriggerState[\s\S]*?aria-pressed/);
  });

  it("Item 10 & 11: renderers use row role on cards and provide explicit aria-labels on controls", () => {
    const boardPath = resolve(__dirname, "BoardRenderer.ts");
    const galleryPath = resolve(__dirname, "GalleryRenderer.ts");
    const listPath = resolve(__dirname, "ListRenderer.ts");

    const boardContent = readFileSync(boardPath, "utf-8");
    const galleryContent = readFileSync(galleryPath, "utf-8");
    const listContent = readFileSync(listPath, "utf-8");

    // Cards should not have role="button"
    expect(boardContent).not.toContain('card.setAttribute("role", "button")');
    expect(galleryContent).not.toContain('card.setAttribute("role", "button")');
    expect(listContent).not.toContain('item.setAttribute("role", "button")');

    // Cards should have role="row"
    expect(boardContent).toContain('role: "row"');
    expect(galleryContent).toContain('role: "row"');
    expect(listContent).toContain('role: "row"');

    // Open buttons have aria-label
    expect(boardContent).toContain('attr: { type: "button", "aria-label": t("menu.openNote") }');
    expect(galleryContent).toContain('attr: { type: "button", "aria-label": t("menu.openNote") }');
    expect(listContent).toContain('attr: { type: "button", "aria-label": t("menu.openNote") }');
  });
});
