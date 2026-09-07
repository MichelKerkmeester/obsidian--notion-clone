// ───────────────────────────────────────────────────────────────────
// MODULE:    bulk-edit-field-menu
// COMPONENT: property picker that starts the property-first bulk edit flow
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { getBulkEditableColumns } from "../data/bulk-edit";
import { getColumnDisplayType } from "../data/column-display";
import { ColumnDef, ComputedFieldDef } from "../data/types";
import { t } from "../i18n";
import { openDropdownMenu } from "./dropdown-field";
import { getPropertyDropdownIcon, renderDropdownPropertyTypeIcon } from "./property-type-icon";

// ───────────────────────────────────────────────────────────────────
// 2. PUBLIC API
// ───────────────────────────────────────────────────────────────────

// First layer of the property-first bulk flow: a shared searchable dropdown of bulk-editable
// columns with left-side property type icons. Holds no persistence; onSelect hands the chosen
// column back to DatabaseView, which opens the native CellRenderer editor for it.
export function openBulkEditFieldMenu(options: {
  anchor: HTMLElement;
  columns: ColumnDef[];
  computedFields: ComputedFieldDef[];
  onSelect(column: ColumnDef): void;
}): () => void {
  const editable = getBulkEditableColumns(options.columns);
  // A column set with nothing bulk-editable maps straight to an empty menu without this floor —
  // the same never-empty guarantee row-menu.ts's unconditional first row already gives every
  // single-row menu, restated here for the one menu that had no floor of its own.
  const rows = editable.length > 0
    ? editable.map((column) => ({
        value: column.key,
        text: column.label || column.key,
        icon: getPropertyDropdownIcon(getColumnDisplayType(column, options.computedFields)),
      }))
    : [{ value: "", text: t("menu.noActions"), disabled: true }];
  return openDropdownMenu({
    anchor: options.anchor,
    label: t("bulkEdit.field"),
    value: "",
    searchable: editable.length > 0,
    searchPlaceholder: t("bulkEdit.searchField"),
    popoverClassName: "obnotion-bulk-edit-field-menu",
    options: rows,
    renderIcon: renderDropdownPropertyTypeIcon,
    onChange: (key) => {
      const column = editable.find((candidate) => candidate.key === key);
      if (column) options.onSelect(column);
    },
  });
}
