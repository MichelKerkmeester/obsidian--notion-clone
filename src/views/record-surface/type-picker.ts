// ───────────────────────────────────────────────────────────────────
// MODULE:    type-picker
// COMPONENT: the one property-format list every type-list site renders
// ───────────────────────────────────────────────────────────────────
//
// Three sites drew their own type list before this: `create-property-modal.ts`'s `PROPERTY_TYPES`
// array, `property-type-conflict-modal.ts`'s `getTypeOptions` (a filtered subset, 9-of-13 or
// 5-of-13 by writer kind), and `column-menu.ts`'s grouped type submenu. A format missing from a
// dropdown is unexplainable; a disabled format carrying its reason is not — `row-menu.ts`'s own
// existing precedent for the same shape ("disabled documents that the action exists but doesn't
// apply here"). This module is that one list: the thirteen formats, their icons, and a gate a
// caller supplies to disable (never omit) the ones that do not apply.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { COLUMN_TYPE_LABELS } from "../../data/column-types";
import { ColumnDef } from "../../data/types";
import { getPropertyDropdownIcon } from "../property-type-icon";
import type { DropdownOption } from "../dropdown-field";

// ───────────────────────────────────────────────────────────────────
// 2. THE ONE LIST
// ───────────────────────────────────────────────────────────────────

/** The twenty-one formats, grouped Basic / Options / Advanced — `column-menu.ts`'s type submenu
 *  slices this exact array at the group boundaries below, so a type's position here decides which
 *  group it renders in. Basic: the thirteen's six primitives plus the four link-shaped text types
 *  (URL/Email/Phone reuse the text scheme-link renderer; Person reuses the text wikilink renderer)
 *  reach ten. Options is unchanged at three. Advanced gains the four read-only audit types
 *  alongside the four it already had, reaching eight. 10 + 3 + 8 = 21. */
export const PROPERTY_TYPES: readonly ColumnDef["type"][] = [
  "text", "number", "date", "datetime", "currency", "checkbox",
  "url", "email", "phone", "person",
  "select", "multi-select", "status",
  "computed", "relation", "rollup", "files",
  "created-time", "created-by", "last-edited-time", "last-edited-by",
];

// ───────────────────────────────────────────────────────────────────
// 3. GATING — disabled, never omitted
// ───────────────────────────────────────────────────────────────────

export interface TypePickerGateResult {
  disabled: true;
  reason: string;
}

/** Returns a gate result for a format a caller's site cannot offer right now, or undefined to
 *  leave it selectable. A format that fails every gate is a picker with nothing to disable. */
export type TypePickerGate = (type: ColumnDef["type"]) => TypePickerGateResult | undefined;

/**
 * `create-property-modal.ts`'s own precedent, named so every site that needs it reads the same
 * rule: rollup has nothing to aggregate without an existing relation column.
 */
export function rollupNeedsRelationGate(hasRelation: boolean, reason: string): TypePickerGate {
  return (type) => (type === "rollup" && !hasRelation ? { disabled: true, reason } : undefined);
}

/**
 * The property-type-conflict modal's per-writer subset (`getTypeOptions`), restated as a gate
 * rather than a filter, as the capture read corrected: a computed writer's draft resolves to one of
 * five plain types, and any other writer's draft cannot become a relation, rollup, computed value
 * or a files column through this dialog. The eight always-disabled formats carry one shared
 * reason; the computed-only gap is named separately so the copy matches what is actually missing.
 */
export function conflictWriterGate(sourceKind: "computed" | "column", reasons: {
  notAWriterTarget: string;
  computedOnlyPlainTypes: string;
}): TypePickerGate {
  const alwaysDisabled: ReadonlySet<ColumnDef["type"]> = new Set(["computed", "relation", "rollup", "files"]);
  const computedAllowed: ReadonlySet<ColumnDef["type"]> = new Set(["text", "number", "date", "datetime", "checkbox"]);
  return (type) => {
    if (alwaysDisabled.has(type)) return { disabled: true, reason: reasons.notAWriterTarget };
    if (sourceKind === "computed" && !computedAllowed.has(type)) {
      return { disabled: true, reason: reasons.computedOnlyPlainTypes };
    }
    return undefined;
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. OPTIONS — the `DropdownOption[]` every site's `createDropdownField` consumes
// ───────────────────────────────────────────────────────────────────

/**
 * Builds the full, unfiltered list every site renders — `createDropdownField`'s own `searchable`
 * flag is what makes a site's picker search-first; this module only owns the options themselves.
 */
export function buildTypePickerOptions(gate?: TypePickerGate): DropdownOption[] {
  const labels = COLUMN_TYPE_LABELS();
  return PROPERTY_TYPES.map((type) => {
    const gated = gate?.(type);
    return {
      value: type,
      text: labels[type],
      icon: getPropertyDropdownIcon(type),
      ...(gated ? { disabled: true, disabledReason: gated.reason } : {}),
    };
  });
}
