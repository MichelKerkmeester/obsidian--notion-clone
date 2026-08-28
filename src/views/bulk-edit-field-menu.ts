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
  return openDropdownMenu({
    anchor: options.anchor,
    label: t("bulkEdit.field"),
    value: "",
    searchable: true,
    searchPlaceholder: t("bulkEdit.searchField"),
    popoverClassName: "db-bulk-edit-field-menu",
    options: editable.map((column) => ({
      value: column.key,
      text: column.label || column.key,
      icon: getPropertyDropdownIcon(getColumnDisplayType(column, options.computedFields)),
    })),
    renderIcon: renderDropdownPropertyTypeIcon,
    onChange: (key) => {
      const column = editable.find((candidate) => candidate.key === key);
      if (column) options.onSelect(column);
    },
  });
}
