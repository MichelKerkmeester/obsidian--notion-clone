// ───────────────────────────────────────────────────────────────────
// MODULE:    create-property-modal.test
// COMPONENT: unit coverage for the shared create-property body's own contract
// ───────────────────────────────────────────────────────────────────
//
// The grammar lane measures the body's rendered geometry; this suite pins the
// choices underneath it: one flat 21-format list where a gated format keeps its
// reason, the name field's lifetime above the list, the label→key mirror's
// handoff, the read-only row a locked entry point gets, and the state the
// confirm step later reads. It runs against a bare fake element because the
// vitest environment is `node` — no document, no SVG namespace — so the icon
// module is stood in exactly the way the panel test next door stands its in.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS AND STAND-INS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../property-type-icon", () => ({
  // `getPropertyDropdownIcon` marks the option so the assertion side can predict
  // what the row should have handed the icon renderer.
  getPropertyDropdownIcon: (type: string) => `icon:${type}`,
  renderDropdownPropertyTypeIcon: (parent: FakeEl, icon?: string) => {
    const holder = parent.createSpan({ cls: "icon-svg" });
    (holder as FakeEl & { drawn: string | undefined }).drawn = icon;
    return true;
  },
}));

import { renderCreatePropertyBody, CreatePropertyBodyState } from "./create-property-modal";
import { COLUMN_TYPE_LABELS } from "../../data/column-types";
import { t } from "../../i18n";

class FakeEl {
  tag: string;
  children: FakeEl[] = [];
  classes = new Set<string>();
  attrs: Record<string, string> = {};
  text = "";
  value = "";
  oninput: (() => void) | null = null;
  onclick: (() => void) | null = null;
  focused = 0;
  keydownHandlers: Array<(event: unknown) => void> = [];
  classList = { contains: (c: string) => this.classes.has(c) };

  constructor(tag: string) {
    this.tag = tag;
  }

  addClass(c: string): this {
    this.classes.add(c);
    return this;
  }

  removeClass(c: string): this {
    this.classes.delete(c);
    return this;
  }

  toggleClass(c: string, value: boolean): this {
    if (value) this.classes.add(c);
    else this.classes.delete(c);
    return this;
  }

  setAttribute(k: string, v: string): void {
    this.attrs[k] = v;
    if (k === "value") this.value = v;
  }

  getAttribute(k: string): string | null {
    return this.attrs[k] ?? null;
  }

  createEl(tag: string, opts?: { cls?: string; text?: string; attr?: Record<string, string> }): FakeEl {
    const el = new FakeEl(tag);
    if (opts?.cls) for (const c of opts.cls.split(" ").filter(Boolean)) el.addClass(c);
    if (opts?.text !== undefined) el.text = opts.text;
    if (opts?.attr) for (const [k, v] of Object.entries(opts.attr)) el.setAttribute(k, String(v));
    this.children.push(el);
    return el;
  }

  createDiv(opts?: { cls?: string; text?: string; attr?: Record<string, string> }): FakeEl {
    return this.createEl("div", opts);
  }

  createSpan(opts?: { cls?: string; text?: string; attr?: Record<string, string> }): FakeEl {
    return this.createEl("span", opts);
  }

  addEventListener(_type: string, handler: (event: unknown) => void): void {
    this.keydownHandlers.push(handler);
  }

  focus(): void {
    this.focused += 1;
  }

  textContent(): string {
    return this.text + this.children.map((c) => c.textContent()).join("");
  }

  all(cls: string, out: FakeEl[] = []): FakeEl[] {
    if (this.classes.has(cls)) out.push(this);
    for (const c of this.children) c.all(cls, out);
    return out;
  }

  byTag(tag: string, out: FakeEl[] = []): FakeEl[] {
    if (this.tag === tag) out.push(this);
    for (const c of this.children) c.byTag(tag, out);
    return out;
  }

  first(cls: string): FakeEl | undefined {
    return this.all(cls)[0];
  }

  inside(target: FakeEl): boolean {
    return this !== target && this.children.some((c) => c === target || c.inside(target));
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. HARNESS
// ───────────────────────────────────────────────────────────────────

const LABELS = COLUMN_TYPE_LABELS();

interface MountedBody {
  parent: FakeEl;
  body: ReturnType<typeof renderCreatePropertyBody>;
  rows: FakeEl[];
  rowFor: (type: keyof typeof LABELS) => FakeEl | undefined;
  labelInput: FakeEl;
  keyInput: FakeEl;
  confirmCount: () => number;
  cancelCount: () => number;
}

const mountBody = (options: { lockType?: boolean; initialType?: CreatePropertyBodyState["type"] } = {}): MountedBody => {
  const parent = new FakeEl("div");
  let confirms = 0;
  let cancels = 0;
  const body = renderCreatePropertyBody(
    parent as unknown as HTMLElement,
    { schema: { columns: [{ key: "Name", type: "text" }, { key: "Due", type: "date" }, { key: "Amount", type: "number" }] } } as never,
    options as never,
    {
      onConfirm: () => {
        confirms += 1;
      },
      onCancel: () => {
        cancels += 1;
      },
    },
  );
  const rows = () => parent.all("obnotion-create-property-type-option");
  const inputs = () => parent.byTag("input");
  return {
    parent,
    body,
    rows: rows(),
    rowFor: (type) => rows().find((row) => row.first("obnotion-create-property-type-option-label")?.text === LABELS[type]),
    labelInput: inputs()[0],
    keyInput: inputs()[1],
    confirmCount: () => confirms,
    cancelCount: () => cancels,
  };
};

// ───────────────────────────────────────────────────────────────────
// 3. THE CONTRACT
// ───────────────────────────────────────────────────────────────────

describe("renderCreatePropertyBody", () => {
  let mounted: MountedBody;

  beforeEach(() => {
    mounted = mountBody();
  });

  it("marks the sheet so its pinned-layout rules can find it, and puts the heading first", () => {
    expect(mounted.parent.classes.has("obnotion-create-property-modal")).toBe(true);
    expect(mounted.parent.children[0].tag).toBe("h3");
  });

  it("renders all 21 formats as rows — icon and label on each, none omitted", () => {
    expect(mounted.rows).toHaveLength(21);
    for (const row of mounted.rows) {
      const label = row.first("obnotion-create-property-type-option-label");
      const icon = row.first("obnotion-create-property-type-option-icon")?.children[0] as (FakeEl & { drawn?: string }) | undefined;
      expect(label?.text.trim()).not.toBe("");
      expect(icon?.drawn).not.toBe("");
      expect(icon?.drawn).not.toBeUndefined();
    }
  });

  it("keeps a gated format in the list, carrying its reason where the label explains why", () => {
    const rollup = mounted.rowFor("rollup");
    expect(rollup).toBeDefined();
    expect(rollup!.classes.has("is-disabled")).toBe(true);
    expect(rollup!.first("obnotion-create-property-type-option-reason")?.text).toBe(t("modal.rollupNeedsRelation"));
    // And its label still declares the format, because a disabled row that no longer names
    // itself answers nothing.
    expect(rollup!.first("obnotion-create-property-type-option-label")?.text).toBe(LABELS.rollup);
  });

  it("marks the currently offered format, and moves the mark when a row is chosen", () => {
    const text = mounted.rowFor("text");
    expect(text?.classes.has("is-selected")).toBe(true);
    expect(mounted.body.state.type).toBe("text");

    const number = mounted.rowFor("number");
    (number!.onclick as () => void)();

    expect(mounted.body.state.type).toBe("number");
    expect(number!.classes.has("is-selected")).toBe(true);
    expect(text!.classes.has("is-selected")).toBe(false);
  });

  it("pins the name field above the list — before it in the sheet, and outside the scrolling element", () => {
    const list = mounted.parent.children.find((child) => child.classes.has("obnotion-create-property-type-list"));
    expect(list).toBeDefined();
    expect(mounted.labelInput.inside(list!)).toBe(false);
    // The ordering proof: the name field's row sits before the list in the parent, so no scroll
    // of the list can move the field the user already typed in.
    const listIndex = mounted.parent.children.indexOf(list!);
    const labelRowIndex = mounted.parent.children.findIndex((child) => child.inside(mounted.labelInput));
    expect(labelRowIndex).toBeGreaterThanOrEqual(0);
    expect(labelRowIndex).toBeLessThan(listIndex);
  });

  it("mirrors the label into the key until the key is touched by hand", () => {
    mounted.labelInput.value = "Vaultography";
    mounted.labelInput.oninput!();
    expect(mounted.keyInput.value).toBe("Vaultography");
    expect(mounted.body.state.key).toBe("Vaultography");

    mounted.keyInput.value = "VaultScore";
    mounted.keyInput.oninput!();

    mounted.labelInput.value = "Vaultography Two";
    mounted.labelInput.oninput!();
    expect(mounted.body.state.key).toBe("VaultScore");
    expect(mounted.body.state.label).toBe("Vaultography Two");
  });

  it("submits from either field on Enter, and cancels from the cancel button", () => {
    const pressEnter = (input: FakeEl) => input.keydownHandlers[0]({ key: "Enter", preventDefault: () => undefined });

    pressEnter(mounted.labelInput);
    pressEnter(mounted.keyInput);
    expect(mounted.confirmCount()).toBe(2);

    const buttonRow = mounted.parent.all("obnotion-modal-button-row")[0];
    const cancelButton = buttonRow!.children.find((b) => !b.classes.has("mod-cta"));
    (cancelButton!.onclick as () => void)();
    expect(mounted.cancelCount()).toBe(1);
  });

  it("gives a locked entry point one read-only row instead of a 21-row picker", () => {
    const locked = mountBody({ lockType: true, initialType: "text" });
    expect(locked.rows).toHaveLength(1);
    expect(locked.rows[0].classes.has("is-readonly")).toBe(true);
    expect(locked.rows[0].classes.has("is-selected")).toBe(false);
    expect(locked.body.state.type).toBe("text");
  });
});
