// ───────────────────────────────────────────────────────────────────
// MODULE:    menu-row.stories
// COMPONENT: catalogue entries for the shared menu row grammar
// ───────────────────────────────────────────────────────────────────
//
// This is the vocabulary generalised from the column menu, the one surface
// that already read correctly. Put it beside the dropdown story: they should
// look like the same family, which was the original complaint.

import type { Meta, StoryObj } from "@storybook/html-vite";
import { createMenuRow, createMenuSection, createMenuSeparator } from "./menu-row";

const meta: Meta = {
  title: "Menus/Menu row",
  parameters: {
    docs: {
      description: {
        component:
          "One row is [icon][label][value][chevron]. Five files used to build this markup by "
          + "hand, which is why rows were centred in one popover and left-aligned in another.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/** Every row state at once, so drift between them is visible rather than inferred. */
export const Grammar: Story = {
  render: () => {
    const menu = document.createElement("div");
    menu.className = "db-menu";
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
    createMenuRow(menu, { icon: "check", label: "Selected row", selected: true, value: "Active" });
    return menu;
  },
};

/** A destructive row renders in the error colour, as the native menu did. */
export const Warning: Story = {
  render: () => {
    const menu = document.createElement("div");
    menu.className = "db-menu";
    createMenuRow(menu, { icon: "eraser", label: "Clear all values", warning: true });
    createMenuRow(menu, { icon: "trash-2", label: "Delete rows", warning: true });
    return menu;
  },
};
