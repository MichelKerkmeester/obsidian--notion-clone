// ───────────────────────────────────────────────────────────────────
// MODULE:    owned-menu.stories
// COMPONENT: catalogue entry for the plugin-owned menu container
// ───────────────────────────────────────────────────────────────────
//
// The replacement for Obsidian's Menu. Same row grammar, but the markup is
// ours, which retires the accesses to MenuItem's undocumented .dom field that
// would have broken silently had Obsidian renamed it.

import type { Meta, StoryObj } from "@storybook/html-vite";
import { createOwnedMenu } from "./owned-menu";

const meta: Meta = { title: "Menus/Owned menu" };
export default meta;

type Story = StoryObj;

/**
 * Rendered in place rather than at a pointer position.
 *
 * The menu mounts to `body` in the app so it can float above a table; here it is reparented and
 * flattened so the catalogue can show it inline. Positioning is exercised in the app, not here —
 * a story that faked a pointer position would be documenting the harness, not the component.
 */
export const Default: Story = {
  render: () => {
    const host = document.createElement("div");
    const menu = createOwnedMenu(document);
    menu.addSection("Row");
    menu.addRow({ icon: "external-link", label: "Open record" });
    menu.addRow({ icon: "copy", label: "Duplicate" });
    menu.addSeparator();
    menu.addRow({ icon: "arrow-up", label: "Move to top" });
    menu.addRow({ icon: "corner-down-right", label: "Move to group", submenu: true });
    menu.addSeparator();
    menu.addRow({ icon: "trash-2", label: "Delete", disabled: true, disabledReason: "Read-only view" });
    host.appendChild(menu.el);
    menu.el.setCssProps({ position: "static", boxShadow: "none" });
    return host;
  },
};
