// ───────────────────────────────────────────────────────────────────
// MODULE:    checkbox
// COMPONENT: shared checkbox creation with semantic size roles
// ───────────────────────────────────────────────────────────────────
//
// Checkbox appearance belongs to the input itself so a wrapper can move
// without changing the control. Callers retain their existing input state
// and event wiring after creation.

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type CheckboxRole = "row" | "field";

export interface CheckboxOptions {
  role: CheckboxRole;
  cls?: string | string[];
  attr?: Record<string, string | number | boolean | null>;
}

// ───────────────────────────────────────────────────────────────────
// 2. FACTORY
// ───────────────────────────────────────────────────────────────────

export function createCheckbox(parent: HTMLElement, options: CheckboxOptions): HTMLInputElement {
  const { role, cls, attr } = options;
  const classes = [
    "db-checkbox",
    `db-checkbox-${role}`,
    ...(Array.isArray(cls) ? cls : cls ? [cls] : []),
  ];

  return parent.createEl("input", {
    cls: classes,
    attr: { ...attr, type: "checkbox" },
  });
}
