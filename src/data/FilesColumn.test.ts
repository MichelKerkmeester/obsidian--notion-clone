import { describe, expect, it, vi } from "vitest";
import type { App } from "obsidian";
import {
  classifyFileType,
  FILE_CHIP_CAP,
  formatForEdit,
  isImageTarget,
  normalize,
  parseEdit,
  renderChips,
  resolveFileTarget,
} from "./FilesColumn";
import type { RowData } from "./types";

type TestFile = RowData["file"];

vi.mock("obsidian", () => ({
  TFile: class {},
}));

class FakeElement {
  readonly children: FakeElement[] = [];
  readonly style = {} as Record<string, string>;
  className = "";
  textContent = "";
  title = "";
  width = 0;
  height = 0;
  onclick?: (event: MouseEvent) => void;
  private readonly attributes = new Map<string, string>();

  createDiv(options?: { cls?: string; text?: string }): FakeElement {
    return this.create("div", options);
  }

  createSpan(options?: { cls?: string; text?: string }): FakeElement {
    return this.create("span", options);
  }

  createEl(tag: string, options?: { cls?: string; text?: string; attr?: Record<string, string> }): FakeElement {
    return this.create(tag, options);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setCssProps(props: Record<string, string>): void {
    Object.assign(this.style, props);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  hasClass(name: string): boolean {
    return this.className.split(/\s+/).includes(name);
  }

  private create(_tag: string, options?: { cls?: string; text?: string; attr?: Record<string, string> }): FakeElement {
    const child = new FakeElement();
    child.className = options?.cls || "";
    child.textContent = options?.text || "";
    for (const [name, value] of Object.entries(options?.attr || {})) child.setAttribute(name, value);
    this.children.push(child);
    return child;
  }
}

function row(): RowData {
  return { file: { path: "Notes/Row.md" } as TestFile, frontmatter: {}, computed: {} };
}

function appWithDestination(destination: TestFile | null): App & {
  opened: ReturnType<typeof vi.fn>;
  getResourcePath: ReturnType<typeof vi.fn>;
} {
  const opened = vi.fn();
  const getResourcePath = vi.fn(() => "app://local-resource");
  return {
    metadataCache: { getFirstLinkpathDest: vi.fn(() => destination) },
    vault: { getResourcePath },
    workspace: { openLinkText: opened },
    opened,
    getResourcePath,
  } as unknown as App & {
    opened: ReturnType<typeof vi.fn>;
    getResourcePath: ReturnType<typeof vi.fn>;
  };
}

describe("FilesColumn value helpers", () => {
  it("normalizes an empty list and a local PDF while dropping external URLs", () => {
    expect(normalize([])).toEqual([]);
    expect(normalize(["  [[Sales.pdf|Sales]]  ", "https://example.test/Sales.pdf"])).toEqual([
      "[[Sales.pdf|Sales]]",
    ]);
  });

  it("deduplicates equivalent targets and preserves malformed text safely", () => {
    expect(normalize([
      "[[Sales.pdf]]",
      "[Sales](Sales.pdf)",
      "Sales.pdf",
      "[[broken",
      "[broken](   )",
    ])).toEqual(["[[Sales.pdf]]", "[[broken", "[broken](   )"]);
  });

  it("round-trips newline and comma separated editor values", () => {
    const editText = formatForEdit(["[[Sales.pdf]]", "[[cover.png]]"]);
    expect(editText).toBe("[[Sales.pdf]]\n[[cover.png]]");
    expect(parseEdit("[[Sales.pdf]], [Cover](cover.png)\n[[notes.txt]]")).toEqual([
      "[[Sales.pdf]]",
      "[[cover.png|Cover]]",
      "[[notes.txt]]",
    ]);
  });

  it("classifies extensions without widening the conservative image matcher", () => {
    expect(isImageTarget("cover.png")).toBe(true);
    expect(isImageTarget("cover.heic")).toBe(false);
    expect(classifyFileType("Sales.pdf")).toBe("pdf");
    expect(classifyFileType("voice.mp3")).toBe("audio");
    expect(classifyFileType("clip.mp4")).toBe("video");
    expect(classifyFileType("unknown.bin")).toBe("file");
  });

  it("resolves through the metadata cache and fails closed when unresolved", () => {
    const destination = { path: "Sales.pdf" } as TestFile;
    const app = appWithDestination(destination);

    expect(resolveFileTarget(app, row(), "Sales.pdf")).toBe(destination);
    expect(resolveFileTarget(app, row(), "[[Sales.pdf|Sales]]")).toBe(destination);
    expect(resolveFileTarget(appWithDestination(null), row(), "Missing.pdf")).toBeNull();
  });
});

describe("FilesColumn chips", () => {
  it("caps visible chips, keeps every name in the tooltip, and opens resolved files", () => {
    const parent = new FakeElement();
    const app = appWithDestination({ path: "File01.pdf" } as TestFile);
    const values = Array.from({ length: 50 }, (_, index) => `File${String(index + 1).padStart(2, "0")}.pdf`);

    renderChips(parent as unknown as HTMLElement, app, row(), values);

    const wrap = parent.children[0];
    expect(wrap.children).toHaveLength(FILE_CHIP_CAP + 1);
    expect(wrap.children.at(-1)?.textContent).toBe("+45");
    expect(wrap.title).toContain("File01.pdf");
    expect(wrap.title).toContain("File50.pdf");

    const firstChip = wrap.children[0];
    expect(firstChip.hasClass("internal-link")).toBe(true);
    firstChip.onclick?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent);
    expect(app.opened).toHaveBeenCalledWith("File01.pdf", "Notes/Row.md", false);
  });

  it("marks a dangling target unresolved and makes its click a no-op", () => {
    const parent = new FakeElement();
    const app = appWithDestination(null);

    renderChips(parent as unknown as HTMLElement, app, row(), ["[[Missing.pdf]]"]);

    const chip = parent.children[0].children[0];
    expect(chip.hasClass("internal-link")).toBe(true);
    expect(chip.hasClass("is-unresolved")).toBe(true);
    chip.onclick?.({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent);
    expect(app.opened).not.toHaveBeenCalled();
  });

  it("adds a local thumbnail only for resolved image targets", () => {
    const parent = new FakeElement();
    const app = appWithDestination({ path: "cover.png" } as TestFile);

    renderChips(parent as unknown as HTMLElement, app, row(), ["[[cover.png]]"]);

    expect(app.getResourcePath).toHaveBeenCalledTimes(1);
    expect(parent.children[0].children[0].children[0].getAttribute("src")).toBe("app://local-resource");
  });
});
