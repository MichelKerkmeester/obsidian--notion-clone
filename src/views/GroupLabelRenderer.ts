import { formatGroupKeyDisplay, isUncategorizedGroupKey } from "../data/GroupDisplay";
import { getColumnDisplayType } from "../data/ColumnDisplay";
import { resolveOptionDisplay } from "../data/ColumnTypes";
import { ViewConfig } from "../data/types";

/**
 * Render a group-header label uniformly across views (table/gallery/list/board).
 *
 * Option-typed group fields (status/select/multi-select) render a colored
 * `.status-badge` when the group key matches a configured option; an
 * unregistered but non-empty value (e.g. a dynamic tag, or a select value with
 * no configured color) renders a gray badge. Only the truly empty "uncategorized"
 * group and non-option fields fall back to plain text.
 */
export function renderGroupLabel(
  parent: HTMLElement,
  config: ViewConfig,
  field: string | undefined,
  groupKey: string,
  className: string,
): void {
  const label = formatGroupKeyDisplay(config, field, groupKey);
  const title = parent.createSpan({ cls: className });
  title.title = label;

  const column = field ? config.schema.columns.find((candidate) => candidate.key === field) : undefined;
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  const isOptionGroup =
    displayType === "status" || displayType === "select" || displayType === "multi-select";
  if (!isOptionGroup) {
    title.setText(label);
    return;
  }

  // 未分类（空值，QueryEngine 用 t("common.uncategorized") 文案）分组：纯文本，不套胶囊（无语义色）。
  // 未登记值（有值但 option 未匹配，如动态 tag / 未配色 select 值）：保留灰色 badge 契约。
  if (isUncategorizedGroupKey(groupKey)) {
    title.setText(label);
    return;
  }

  const { option } = column ? resolveOptionDisplay(column, groupKey) : { option: undefined };
  title.createSpan({
    cls: `status-badge status-color-${option?.color || "gray"}`,
    attr: { "data-status-color": option?.color || "gray" },
    text: label,
  });
}
