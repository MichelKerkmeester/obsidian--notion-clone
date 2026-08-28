// ───────────────────────────────────────────────────────────────────
// MODULE:    empty-state-renderer
// COMPONENT: empty-state cards/hero and starter-preset catalog shared by
//            every database view type
// ───────────────────────────────────────────────────────────────────
//
// getEmptyStateReason turns raw row-pipeline diagnostics into a single
// EmptyStateReason so table/board/gallery/list/calendar/chart don't each
// reimplement the search-vs-filter-vs-limit precedence order; EMPTY_STATE_COPY
// then maps that one reason to consistent title/message/icon across all of them.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { t } from "../i18n";
import type { ColumnDef, ViewConfig } from "../data/types";
import type { RowPipelineDiagnostics } from "../data/row-pipeline";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type EmptyStateReason =
  | "no-database"
  | "no-columns"
  | "no-matching-data"
  | "search-empty"
  | "filter-empty"
  | "filter-and-search-empty"
  | "limit-empty"
  | "no-date-field"
  | "no-events"
  | "no-events-in-range"
  | "read-failed"
  | "empty-group";

export interface EmptyStateAction {
  label: string;
  icon?: string;
  cls?: string;
  primary?: boolean;
  onClick: () => void | Promise<void>;
}

export interface EmptyStateOptions {
  reason: EmptyStateReason;
  title?: string;
  message?: string;
  icon?: string;
  diagnostics?: string;
  actions?: EmptyStateAction[];
  compact?: boolean;
  tableRowSpan?: number;
  className?: string;
}

export interface StarterPreset {
  id: "tasks" | "projects" | "reading-list" | "notes";
  name: string;
  description: string;
  icon: string;
  columns: ReadonlyArray<ColumnDef>;
}

export interface EmptyStateHeroOptions {
  title: string;
  desc: string;
  onCreateDb: () => void | Promise<void>;
  onSelectPreset: (preset: StarterPreset) => void | Promise<void>;
}

// ───────────────────────────────────────────────────────────────────
// 3. STARTER PRESETS
// ───────────────────────────────────────────────────────────────────

export const STARTER_PRESETS: ReadonlyArray<StarterPreset> = [
  {
    id: "tasks",
    get name() { return t("emptyState.presetTasksTitle"); },
    get description() { return t("emptyState.presetTasksDesc"); },
    icon: "check-square",
    columns: [
      { key: "file.name", label: "Title", type: "text" },
      { key: "status", label: "Status", type: "status", statusOptions: [
        { value: "To Do", color: "gray" },
        { value: "In Progress", color: "blue" },
        { value: "Done", color: "green" },
      ] },
      { key: "priority", label: "Priority", type: "select", statusOptions: [
        { value: "P1", color: "red" },
        { value: "P2", color: "orange" },
        { value: "P3", color: "gray" },
      ] },
      { key: "due", label: "Due Date", type: "date" },
    ],
  },
  {
    id: "projects",
    get name() { return t("emptyState.presetProjectsTitle"); },
    get description() { return t("emptyState.presetProjectsDesc"); },
    icon: "briefcase-business",
    columns: [
      { key: "file.name", label: "Project Name", type: "text" },
      { key: "status", label: "Status", type: "status" },
      { key: "lead", label: "Lead", type: "text" },
      { key: "targetDate", label: "Target Date", type: "date" },
      { key: "tags", label: "Tags", type: "multi-select" },
    ],
  },
  {
    id: "reading-list",
    get name() { return t("emptyState.presetReadingListTitle"); },
    get description() { return t("emptyState.presetReadingListDesc"); },
    icon: "book-open",
    columns: [
      { key: "file.name", label: "Book Title", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "status", label: "Status", type: "status" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "category", label: "Category", type: "select" },
    ],
  },
  {
    id: "notes",
    get name() { return t("emptyState.presetNotesTitle"); },
    get description() { return t("emptyState.presetNotesDesc"); },
    icon: "notebook-tabs",
    columns: [
      { key: "file.name", label: "Note Title", type: "text" },
      { key: "tags", label: "Tags", type: "multi-select" },
      { key: "file.created", label: "Created Date", type: "date" },
      { key: "file.modified", label: "Modified Date", type: "date" },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────
// 4. COPY CATALOG
// ───────────────────────────────────────────────────────────────────

const EMPTY_STATE_COPY: Record<EmptyStateReason, { title: string; message: string; icon: string }> = {
  "no-database": {
    title: "emptyState.noDatabaseTitle",
    message: "emptyState.noDatabaseMessage",
    icon: "database",
  },
  "no-columns": {
    title: "emptyState.noColumnsTitle",
    message: "emptyState.noColumnsMessage",
    icon: "columns-3",
  },
  "no-matching-data": {
    title: "emptyState.noMatchingTitle",
    message: "emptyState.noMatchingMessage",
    icon: "inbox",
  },
  "search-empty": {
    title: "emptyState.searchEmptyTitle",
    message: "emptyState.searchEmptyMessage",
    icon: "search-x",
  },
  "filter-empty": {
    title: "emptyState.filterEmptyTitle",
    message: "emptyState.filterEmptyMessage",
    icon: "list-filter",
  },
  "filter-and-search-empty": {
    title: "emptyState.filterAndSearchTitle",
    message: "emptyState.filterAndSearchMessage",
    icon: "list-filter",
  },
  "limit-empty": {
    title: "emptyState.limitEmptyTitle",
    message: "emptyState.limitEmptyMessage",
    icon: "list-x",
  },
  "no-date-field": {
    title: "emptyState.noDateFieldTitle",
    message: "emptyState.noDateFieldMessage",
    icon: "calendar-plus",
  },
  "no-events": {
    title: "emptyState.noEventsTitle",
    message: "emptyState.noEventsMessage",
    icon: "calendar-off",
  },
  "no-events-in-range": {
    title: "emptyState.noEventsInRangeTitle",
    message: "emptyState.noEventsInRangeMessage",
    icon: "calendar-search",
  },
  "read-failed": {
    title: "emptyState.readFailedTitle",
    message: "emptyState.readFailedMessage",
    icon: "triangle-alert",
  },
  "empty-group": {
    title: "emptyState.emptyGroupTitle",
    message: "emptyState.emptyGroupMessage",
    icon: "folder-open",
  },
};

// ───────────────────────────────────────────────────────────────────
// 5. DIAGNOSIS HELPERS
// ───────────────────────────────────────────────────────────────────

export function getEmptyStateReason(diagnostics: RowPipelineDiagnostics): EmptyStateReason {
  if (diagnostics.sourceCount === 0) return "no-matching-data";
  if (diagnostics.hasActiveSearch && diagnostics.hasActiveFilters) return "filter-and-search-empty";
  if (diagnostics.hasActiveSearch) return "search-empty";
  if (diagnostics.hasActiveFilters) return "filter-empty";
  if (diagnostics.hasActiveLimit && diagnostics.visibleCount === 0) return "limit-empty";
  return "no-matching-data";
}

export function formatEmptyStateDiagnostics(diagnostics: RowPipelineDiagnostics): string | undefined {
  if (diagnostics.sourceCount === 0) return undefined;
  if (diagnostics.hasActiveLimit && diagnostics.visibleCount < diagnostics.postLimitCount) {
    return t("emptyState.limitDiagnostics", {
      visible: diagnostics.visibleCount,
      total: diagnostics.postLimitCount,
    });
  }
  if (diagnostics.hasActiveSearch && diagnostics.postSearchCount < diagnostics.sourceCount) {
    return t("emptyState.searchDiagnostics", {
      visible: diagnostics.postSearchCount,
      total: diagnostics.sourceCount,
    });
  }
  if (diagnostics.hasActiveFilters && diagnostics.postFilterCount < diagnostics.postSearchCount) {
    return t("emptyState.filterDiagnostics", {
      visible: diagnostics.postFilterCount,
      total: diagnostics.postSearchCount,
    });
  }
  return t("emptyState.sourceDiagnostics", { total: diagnostics.sourceCount });
}

export function createStarterViewConfig(preset: StarterPreset): ViewConfig {
  return {
    name: preset.name,
    sourceFolder: "",
    viewType: "table",
    schema: {
      columns: preset.columns.map((column) => ({
        ...column,
        statusOptions: column.statusOptions?.map((option) => ({ ...option })),
      })),
      computedFields: [],
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 6. EMPTY STATE RENDERER
// ───────────────────────────────────────────────────────────────────

export class EmptyStateRenderer {
  renderCard(container: HTMLElement, options: EmptyStateOptions): HTMLElement {
    const copy = EMPTY_STATE_COPY[options.reason];
    const classes = ["db-empty", "db-empty-card", options.compact ? "is-compact" : "", options.className || ""]
      .filter(Boolean)
      .join(" ");
    const card = container.createDiv({ cls: classes, attr: { "data-empty-reason": options.reason } });
    const icon = card.createDiv({ cls: "db-empty-card-icon", attr: { "aria-hidden": "true" } });
    setIcon(icon, options.icon || copy.icon);
    const content = card.createDiv({ cls: "db-empty-card-content" });
    content.createEl("h3", {
      cls: "db-empty-card-title",
      text: options.title || t(copy.title),
    });
    content.createDiv({
      cls: "db-empty-card-message",
      text: options.message || t(copy.message),
    });
    if (options.diagnostics) {
      content.createSpan({ cls: "db-empty-card-diagnostics", text: options.diagnostics });
    }
    if (options.actions && options.actions.length > 0) {
      const actionGroup = content.createDiv({ cls: "db-empty-action-group" });
      for (const action of options.actions) {
        const button = actionGroup.createEl("button", {
          cls: ["db-empty-action", action.primary ? "mod-cta" : "", action.cls || ""].filter(Boolean).join(" "),
          attr: { type: "button", "aria-label": action.label },
        });
        if (action.icon) setIcon(button.createSpan({ cls: "db-empty-action-icon", attr: { "aria-hidden": "true" } }), action.icon);
        button.createSpan({ text: action.label });
        button.onclick = () => { void action.onClick(); };
      }
    }
    return card;
  }

  renderHero(container: HTMLElement, options: EmptyStateHeroOptions): HTMLElement {
    const hero = container.createDiv({ cls: "db-empty-hero", attr: { "data-empty-reason": "no-database" } });
    const icon = hero.createDiv({ cls: "db-empty-hero-icon", attr: { "aria-hidden": "true" } });
    setIcon(icon, "database");
    const content = hero.createDiv({ cls: "db-empty-hero-content" });
    content.createEl("h2", { cls: "db-empty-hero-title", text: options.title });
    content.createDiv({ cls: "db-empty-hero-description", text: options.desc });
    const actions = content.createDiv({ cls: "db-empty-action-group" });
    const create = actions.createEl("button", {
      cls: "db-empty-action mod-cta",
      attr: { type: "button", "aria-label": t("emptyState.createDatabase") },
    });
    setIcon(create.createSpan({ cls: "db-empty-action-icon", attr: { "aria-hidden": "true" } }), "plus");
    create.createSpan({ text: t("emptyState.createDatabase") });
    create.onclick = () => { void options.onCreateDb(); };

    const presets = hero.createDiv({ cls: "db-empty-presets", attr: { "aria-label": t("emptyState.starterPresets") } });
    presets.createDiv({ cls: "db-empty-presets-title", text: t("emptyState.starterPresets") });
    const presetGrid = presets.createDiv({ cls: "db-empty-preset-grid" });
    for (const preset of STARTER_PRESETS) {
      const card = presetGrid.createEl("button", {
        cls: "db-empty-preset-card",
        attr: { type: "button" },
      });
      const presetIcon = card.createDiv({ cls: "db-empty-preset-icon", attr: { "aria-hidden": "true" } });
      setIcon(presetIcon, preset.icon);
      card.createEl("strong", { cls: "db-empty-preset-title", text: preset.name });
      card.createSpan({ cls: "db-empty-preset-description", text: preset.description });
      card.onclick = () => { void options.onSelectPreset(preset); };
    }
    return hero;
  }

  renderTableRow(tbody: HTMLElement, colSpan: number, options: EmptyStateOptions): HTMLElement {
    const row = tbody.createEl("tr", { cls: "db-empty-table-row" });
    const cell = row.createEl("td", { attr: { colspan: String(Math.max(1, colSpan)) } });
    this.renderCard(cell, { ...options, compact: true });
    return row;
  }
}
