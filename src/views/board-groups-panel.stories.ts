// ───────────────────────────────────────────────────────────────────
// MODULE:    board-groups-panel.stories
// COMPONENT: catalogue entries for board groups panel
// ───────────────────────────────────────────────────────────────────
//
// Two states that never appear together in the app: the bare row list a reviewer would see
// mid-edit (some groups visible, one hidden, one an orphan key the schema no longer carries an
// option for) beside the full floating panel — header, bulk actions, the row list, the
// "Hide empty groups" footer — anchored and positioned exactly as `board-renderer.ts` opens it
// from the column menu's own "Manage groups" row.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Meta, StoryObj } from "@storybook/html-vite";
import type { ViewConfig } from "../data/types";
import { openBoardGroupsPanel, renderBoardGroupsRows, resolveBoardGroupsPanelKeys } from "./board-groups-panel";

// ───────────────────────────────────────────────────────────────────
// 2. CATALOGUE ENTRY
// ───────────────────────────────────────────────────────────────────

const meta: Meta = { title: "Panels/Board groups panel" };
export default meta;

type Story = StoryObj;

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURE
// ───────────────────────────────────────────────────────────────────

function config(): ViewConfig {
  return {
    name: "Board",
    sourceFolder: "",
    viewType: "board",
    boardGroupField: "status",
    // "Done" is hidden by the operator; "Retired" has no matching schema option any more, which
    // is exactly the state NFR-R02 exists for — listed as unknown and restorable, never dropped.
    boardHiddenGroups: { status: ["Done", "Retired"] },
    schema: {
      columns: [
        { key: "status", label: "Status", type: "status", statusOptions: [
          { value: "To Do", color: "gray" },
          { value: "Doing", color: "blue" },
          { value: "Done", color: "green" },
        ] },
      ],
      computedFields: [],
    },
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. STORIES
// ───────────────────────────────────────────────────────────────────

export const Rows: Story = {
  render: () => {
    const host = document.createElement("div");
    const view = config();
    const hidden = new Set(view.boardHiddenGroups?.status || []);
    const keys = resolveBoardGroupsPanelKeys(view, "status", ["To Do", "Doing"]);
    renderBoardGroupsRows(host, view, "status", keys, hidden, {
      hideGroup: () => undefined,
      showGroup: () => undefined,
    }, () => undefined);
    return host;
  },
};

export const OpenPanel: Story = {
  render: () => {
    const host = document.createElement("div");
    host.className = "obnotion-container";
    host.style.position = "relative";
    host.style.height = "360px";
    const anchor = host.appendChild(document.createElement("button"));
    anchor.textContent = "⋮";
    const view = config();
    openBoardGroupsPanel({
      anchorEl: anchor,
      containerEl: host,
      config: view,
      groupField: "status",
      groupKeys: ["To Do", "Doing"],
      actions: {
        hideGroup: () => undefined,
        showGroup: () => undefined,
        updateGroupOrder: () => undefined,
        setBoardHideEmptyGroups: () => undefined,
      },
    });
    return host;
  },
};
