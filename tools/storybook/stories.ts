// ───────────────────────────────────────────────────────────────────
// MODULE:    stories
// COMPONENT: catalogue entries rendered from the shipped modules
// ───────────────────────────────────────────────────────────────────
//
// Every story here calls the real component. That is the whole point, and the
// difference from the screenshot fixtures: those render hand-written markup,
// so a capture can pass while the renderer that ships is broken, and a class
// the plugin never emits can be photographed looking healthy.
//
// A story that cannot be built from a real module does not belong here. If a
// surface needs the vault, the stub throws and the story fails loudly rather
// than quietly documenting a shape nobody ships.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createDropdownField } from "../../src/views/dropdown-field";
import { createMenuRow, createMenuSection, createMenuSeparator } from "../../src/views/menu-row";
import { createOwnedMenu } from "../../src/views/owned-menu";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

interface Story {
  id: string;
  title: string;
  /** What a reviewer should be checking, not what the code does. */
  note: string;
  render(parent: HTMLElement): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

export const stories: Story[] = [
  {
    id: "dropdown-field",
    title: "Dropdown field",
    note: "Row anatomy: leading icon, label, trailing state. Compare against the column menu — the "
      + "one surface that already reads correctly — and note where the grammar diverges.",
    render(parent) {
      createDropdownField({
        parent,
        label: "Billing",
        value: "monthly",
        options: [
          { value: "monthly", text: "Monthly", icon: "calendar" },
          { value: "yearly", text: "Yearly", icon: "calendar-days" },
          { value: "once", text: "One-off", icon: "circle-dot" },
        ],
        onChange: () => undefined,
      });
    },
  },
  {
    id: "dropdown-field-sections",
    title: "Dropdown field — sections and disabled rows",
    note: "Section headers and a disabled row. Check the divider treatment and that the disabled "
      + "row reverts the pointer cursor rather than inviting a click.",
    render(parent) {
      createDropdownField({
        parent,
        label: "Group by",
        value: "status",
        searchable: true,
        options: [
          { value: "status", text: "Status", section: "Properties", icon: "circle-dot" },
          { value: "priority", text: "Priority", section: "Properties", icon: "flag" },
          { value: "formula", text: "Margin %", section: "Computed", icon: "sigma" },
          { value: "locked", text: "Unavailable", section: "Computed", disabled: true,
            disabledReason: "Needs a numeric column" },
        ],
        onChange: () => undefined,
      });
    },
  },
  {
    id: "menu-row-grammar",
    title: "Menu row grammar",
    note: "The vocabulary generalised from the column menu: leading icon, ellipsising label, "
      + "trailing value, submenu chevron. Put this beside the dropdown story above — they should "
      + "now read as the same family, which was the whole complaint.",
    render(parent) {
      const menu = parent.createDiv({ cls: "db-menu" });
      createMenuSection(menu, "Property");
      createMenuRow(menu, { icon: "edit", label: "Edit property" });
      createMenuRow(menu, { icon: "layers", label: "Change type", submenu: true });
      createMenuRow(menu, { icon: "paintbrush", label: "Display style", value: "Number", submenu: true });
      createMenuSeparator(menu);
      createMenuSection(menu, "Layout");
      createMenuRow(menu, { icon: "ruler-dimension-line", label: "Adjust column width", value: "180px" });
      createMenuRow(menu, { icon: "eye-off", label: "Hide property" });
      createMenuRow(menu, {
        icon: "trash-2",
        label: "Delete property",
        disabled: true,
        disabledReason: "The title property cannot be deleted",
      });
      createMenuRow(menu, {
        icon: "check",
        label: "Selected row",
        selected: true,
        value: "Active",
      });
    },
  },
  {
    id: "checkbox-shape",
    title: "Boolean cell checkbox",
    note: "Square, never a radio. The plugin used to own no shape at all, so this rendered as "
      + "whatever the theme drew — circles in boolean cells while row-select boxes stayed square. "
      + "Check unchecked, checked, and disabled read as one family.",
    render(parent) {
      const row = parent.createDiv({ cls: "db-story-row" });
      for (const [label, checked, disabled] of [
        ["Unchecked", false, false],
        ["Checked", true, false],
        ["Disabled", false, true],
        ["Disabled + checked", true, true],
      ] as Array<[string, boolean, boolean]>) {
        const cell = row.createDiv({ cls: "db-checkbox-cell" });
        const input = cell.createEl("input", { attr: { type: "checkbox" } });
        input.checked = checked;
        input.disabled = disabled;
        cell.createSpan({ cls: "db-story-note", text: label });
      }
    },
  },
  {
    id: "owned-menu",
    title: "Plugin-owned menu",
    note: "The replacement for Obsidian's Menu. Same row grammar, but the markup is ours — which "
      + "retires the 26 accesses to MenuItem's undocumented .dom field that would break silently "
      + "if Obsidian renamed it. Rendered in place here rather than at a pointer position.",
    render(parent) {
      const menu = createOwnedMenu(parent.ownerDocument);
      menu.addSection("Row");
      menu.addRow({ icon: "external-link", label: "Open record" });
      menu.addRow({ icon: "copy", label: "Duplicate" });
      menu.addSeparator();
      menu.addRow({ icon: "arrow-up", label: "Move to top" });
      menu.addRow({ icon: "corner-down-right", label: "Move to group", submenu: true });
      menu.addSeparator();
      menu.addRow({ icon: "trash-2", label: "Delete", disabled: true, disabledReason: "Read-only view" });
      // Reparent for the catalogue: the menu mounts to body so it can float over a real table.
      parent.appendChild(menu.el);
      menu.el.setCssProps({ position: "static", boxShadow: "none" });
    },
  },
];

// ───────────────────────────────────────────────────────────────────
// 4. MOUNT
// ───────────────────────────────────────────────────────────────────

export function renderCatalogue(root: HTMLElement): number {
  for (const story of stories) {
    const section = root.createDiv({ cls: "db-story" });
    section.setAttr("data-story", story.id);
    section.createEl("h2", { cls: "db-story-title", text: story.title });
    section.createDiv({ cls: "db-story-note", text: story.note });
    const stage = section.createDiv({ cls: "db-story-stage note-database-container" });
    story.render(stage);
  }
  return stories.length;
}
