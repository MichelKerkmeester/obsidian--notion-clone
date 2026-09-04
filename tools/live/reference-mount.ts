// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-mount
// COMPONENT: mounts the vendored Project Manager views in the reference-capture bundle
// ───────────────────────────────────────────────────────────────────
//
// The reference bundle's counterpart to the render-assertion harness: everything a
// reference capture needs that the vendored plugin expects its host to provide. The views
// themselves are the vendored code, unedited; this module stands in for the parts of the
// plugin the render path reaches — the plugin object (app, settings, store, router, undo
// stack), the scope over one project, the no-op refresh callback — and wraps the view in
// the `.pm-root`/`.pm-content` chrome ProjectView.ts's real host builds.
//
// Only the render path is stood in for. Every interaction surface the vendored code wires
// (menus, modals, drag/drop, the undo keybindings) is left pointing at the same stubs the
// rest of the catalogue uses: present, but throwing when invoked, because a capture never
// invokes them. The one exception is the gantt's requestAnimationFrame scroll-to-today,
// which runs on every mount and is why the capture waits its readiness frames.
//
// The rows and their conversion to the reference's Task shape come from the reference
// fixture (tools/bench/reference-fixture.ts), so the picture is of the SAME project the
// constructed captures show.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { KanbanView } from "../../specs/context/obsidian-pm-main/src/views/KanbanView";
import { GanttView } from "../../specs/context/obsidian-pm-main/src/views/gantt/GanttView";
import { ProjectScope } from "../../specs/context/obsidian-pm-main/src/store/ProjectScope";
import { buildTaskIndex } from "../../specs/context/obsidian-pm-main/src/store/TaskIndex";
import { resolveProjectConfig } from "../../specs/context/obsidian-pm-main/src/store/ProjectConfig";
import { DEFAULT_SETTINGS, makeDefaultFilter } from "../../specs/context/obsidian-pm-main/src/types";
import type { PMSettings, Project, ResolvedProjectConfig, Task } from "../../specs/context/obsidian-pm-main/src/types";
import type { TaskSource } from "../../specs/context/obsidian-pm-main/src/store/TaskSource";
import type PMPlugin from "../../specs/context/obsidian-pm-main/src/main";
import {
  makeReferenceProject,
  makeReferenceBoardRows,
  makeReferenceTimelineRows,
} from "../bench/reference-fixture";

// ───────────────────────────────────────────────────────────────────
// 2. THE HOST STUBS
// ───────────────────────────────────────────────────────────────────

// The app surface the render path reads: linkedRefs resolves every assignee through
// metadataCache.getFirstLinkpathDest (an empty cache answers null, which is the honest
// no-vault state and what makes the avatars render as unresolved), and personKeyer keys
// people the same way. workspace is only reached by click handlers, which a capture never
// fires; it exists so the shape is complete rather than undefined.
function makeAppStub() {
  return {
    metadataCache: { getFirstLinkpathDest: () => null },
    workspace: { openLinkText: () => undefined },
  };
}

// The store surface the render path reads. configFor is the real resolution the views
// are specified against (the project's overrides over the global settings); the mutators
// below exist for the click handlers that never fire.
function makeStoreStub(settings: PMSettings): TaskSource {
  return {
    registerVaultSync: () => undefined,
    onProjectChanged: () => () => undefined,
    ensureFolder: async () => undefined,
    configFor: (project: Project): ResolvedProjectConfig => resolveProjectConfig(project, settings),
    loadProjects: async () => [],
    loadProject: async () => null,
    loadProjectByPath: async () => null,
    loadTaskBody: async () => undefined,
    loadProjectBody: async () => undefined,
    createProject: async () => { throw new Error("reference mount: store mutation is out of scope"); },
    moveProjectIntoOwnFolder: async () => null,
    repointProjectParent: async () => undefined,
    saveProject: async () => undefined,
    updateProject: async () => undefined,
    deleteProject: async () => undefined,
    insertTask: async () => undefined,
    duplicateTask: async () => null,
    importNoteAsTask: async () => "skipped",
    importTaskForest: async () => 0,
    updateTask: async () => undefined,
    updateTasks: async () => undefined,
    moveTask: async () => undefined,
    moveTaskToProject: async () => undefined,
    moveTasks: async () => undefined,
    reorderTask: async () => undefined,
    deleteTask: async () => undefined,
    deleteTasks: async () => undefined,
    archiveTask: async () => undefined,
    archiveTasks: async () => undefined,
    unarchiveTask: async () => undefined,
    scheduleAfterChange: async () => 0,
    saveTaskAttachment: async () => { throw new Error("reference mount: store mutation is out of scope"); },
    findTaskFileConflict: () => null,
  };
}

function makePluginStub(settings: PMSettings): PMPlugin {
  const store = makeStoreStub(settings);
  return {
    app: makeAppStub() as PMPlugin["app"],
    settings,
    store,
    saveSettings: async () => undefined,
    undoLastAction: async () => undefined,
    redoLastAction: async () => undefined,
    persistCollapsedState: async () => undefined,
    toggleTaskCollapsed: async () => undefined,
    router: { openProjectLink: async () => undefined },
    index: { task: () => null, projectRef: () => null },
  } as unknown as PMPlugin;
}

// ───────────────────────────────────────────────────────────────────
// 3. THE MOUNT
// ───────────────────────────────────────────────────────────────────

export interface ReferenceMountSpec {
  view: "kanban" | "gantt";
  /** Wires the first three fixture rows into a parent with two children. */
  subtask?: boolean;
}

// The gantt registers document-level listeners and timers on render; the next mount must
// tear the previous view down or the listeners stack across mounts in one page.
let mountedView: { destroy?: () => void } | null = null;

export function mountReferenceView(container: HTMLElement, spec: ReferenceMountSpec): HTMLElement | null {
  mountedView?.destroy?.();
  mountedView = null;

  // The same host chrome ProjectView.ts wraps every sub-view in: the tokens widgets.css
  // scopes to .pm-root, and .pm-content is the pane the views fill.
  const root = container.createDiv("pm-root pm-content");

  const { rows, columns } = spec.view === "kanban" ? makeReferenceBoardRows() : makeReferenceTimelineRows();
  const project = makeReferenceProject(rows, columns, { view: spec.view, subtask: Boolean(spec.subtask) });
  project.taskIndex = buildTaskIndex(project.tasks);

  const settings: PMSettings = {
    ...DEFAULT_SETTINGS,
    showTagColors: true,
    // The kanban's subtask rows render only when the config asks for them; the gantt
    // always flattens its tree, so the flag only matters on the kanban side.
    kanbanShowSubtasks: spec.view === "kanban" && Boolean(spec.subtask),
    ganttGranularity: "week",
    ganttWeekLabel: "weekNumber",
  };
  const plugin = makePluginStub(settings);
  const scope = new ProjectScope({ kind: "project", path: project.filePath }, [project], plugin.store);
  const filter = makeDefaultFilter();
  const onRefresh = async () => undefined;

  if (spec.view === "kanban") {
    new KanbanView(root, scope, plugin, onRefresh, filter).render();
  } else {
    const view = new GanttView(root, scope, plugin, onRefresh, filter);
    view.render();
    mountedView = view;
  }

  // The readiness marker is the view's own class, which the renderer puts on the mount
  // root itself: a mount that resolved without it rendered nothing, and a capture must
  // refuse to photograph that.
  const marker = root.classList.contains(spec.view === "kanban" ? "pm-kanban-view" : "pm-gantt-view");
  if (!marker) return null;
  return root;
}
