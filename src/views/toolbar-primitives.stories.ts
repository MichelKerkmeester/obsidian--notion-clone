// ───────────────────────────────────────────────────────────────────
// MODULE:    toolbar-primitives.stories
// COMPONENT: catalogue entries for the shared toolbar constructors
// ───────────────────────────────────────────────────────────────────
//
// These constructors are the only place a trigger's add/active state and a
// tab strip's overflow are built. The catalogue shows the four states a
// filter/sort pair can take, not a second toolbar.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import { createControlClusterButton, createTabStrip } from "./toolbar-primitives";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Toolbar/Primitives",
  parameters: {
    docs: {
      description: {
        component:
          "Cluster buttons declare add versus active from their count. The tab strip keeps a "
          + "roving tabindex and measures overflow against the strip's own box.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. STORIES
// ───────────────────────────────────────────────────────────────────

/** Filter and sort in every combination of empty versus applied. */
export const ControlStates: Story = {
  render: () => {
    const root = document.createElement("div");
    root.className = "note-database-container";
    const row = root.createDiv({ cls: "db-toolbar" });
    const cluster = row.createDiv({ cls: "db-toolbar-cluster" });
    createControlClusterButton(cluster, { icon: "list-filter", label: "Filter", state: "add" });
    createControlClusterButton(cluster, { icon: "arrow-up-down", label: "Sort", state: "add" });
    const active = row.createDiv({ cls: "db-toolbar-cluster" });
    createControlClusterButton(active, { icon: "list-filter", label: "Filter", state: "active", count: 2 });
    createControlClusterButton(active, { icon: "arrow-up-down", label: "Sort", state: "active", count: 1 });
    return root;
  },
};

/** A short strip so the tabs, the active tab and the add control are all visible. */
export const TabStrip: Story = {
  render: () => {
    const root = document.createElement("div");
    root.className = "note-database-container";
    createTabStrip(root, {
      activeId: "table",
      ariaLabel: "Views",
      tabs: [
        { id: "table", label: "Table", icon: "table", active: true },
        { id: "board", label: "Board", icon: "layout-grid" },
      ],
      onActivate: () => undefined,
      addButton: { label: "Add view", onClick: () => undefined },
    });
    return root;
  },
};
