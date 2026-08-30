// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-contract
// COMPONENT: semantic roles, mount capabilities, role defaults and the
//            producer registry shared by floating surfaces
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type SurfaceRole = "menu" | "panel" | "dialog" | "sheet" | "submenu";

export type SurfaceMount = "local" | "bodyPortal" | "shadowRoot" | "topLayer";

/** Mounts with an implemented adapter. The other mounts stay visible in the vocabulary but cannot be selected. */
export type ImplementedMount = Extract<SurfaceMount, "local" | "bodyPortal">;

export type SurfaceDismissal =
  | "outside-pointerdown"
  | "escape"
  | "selection"
  | "explicit-action"
  | "scrim-tap"
  | "back"
  | "drag-to-dismiss";

export type SurfaceFocusMode = "roving" | "trapped" | "return-to-parent";

export type SurfaceWidthPolicy =
  | {
      readonly kind: "fixed";
      readonly minWidth: 220;
      readonly preferredWidth: 292;
      readonly maxWidth: 320;
    }
  | {
      readonly kind: "bounded";
      readonly minWidth: 292;
      readonly preferredWidth: 360;
      readonly maxWidth: 360;
    }
  | {
      readonly kind: "role-declared";
    }
  | {
      readonly kind: "full-width";
    };

export interface SurfaceRoleDefaults {
  readonly dismissal: readonly SurfaceDismissal[];
  readonly focusMode: SurfaceFocusMode;
  readonly width: SurfaceWidthPolicy;
}

export interface SurfaceProducerDefinition {
  readonly role: SurfaceRole;
  readonly mount: ImplementedMount;
  readonly host: SurfaceHost;
}

export type SurfaceHost = "container" | "body";

export type SurfaceProducerId =
  | "column-menu"
  | "owned-menu"
  | "record-detail-panel"
  | "filter-panel"
  | "date-value-picker";

export type SurfaceTokenKey = (typeof SURFACE_TOKEN_KEYS)[number];

export interface SurfaceTokenSnapshot {
  readonly version: number;
  readonly values: Readonly<Partial<Record<SurfaceTokenKey, string>>>;
}

// ───────────────────────────────────────────────────────────────────
// 2. ROLE DEFAULTS
// ───────────────────────────────────────────────────────────────────

export const SURFACE_ROLE_DEFAULTS: Readonly<Record<SurfaceRole, SurfaceRoleDefaults>> = {
  menu: {
    dismissal: ["outside-pointerdown", "escape", "selection"],
    focusMode: "roving",
    width: {
      kind: "fixed",
      minWidth: 220,
      preferredWidth: 292,
      maxWidth: 320,
    },
  },
  panel: {
    dismissal: ["outside-pointerdown", "escape"],
    focusMode: "trapped",
    width: {
      kind: "bounded",
      minWidth: 292,
      preferredWidth: 360,
      maxWidth: 360,
    },
  },
  dialog: {
    dismissal: ["explicit-action"],
    focusMode: "trapped",
    width: { kind: "role-declared" },
  },
  sheet: {
    dismissal: ["scrim-tap", "escape", "back", "drag-to-dismiss"],
    focusMode: "trapped",
    width: { kind: "full-width" },
  },
  submenu: {
    dismissal: ["escape"],
    focusMode: "return-to-parent",
    width: {
      kind: "fixed",
      minWidth: 220,
      preferredWidth: 292,
      maxWidth: 320,
    },
  },
} as const;

export function getSurfaceRoleDefaults(role: SurfaceRole): SurfaceRoleDefaults {
  return SURFACE_ROLE_DEFAULTS[role];
}

// ───────────────────────────────────────────────────────────────────
// 3. TOKEN SNAPSHOT CONTRACT
// ───────────────────────────────────────────────────────────────────

export const SURFACE_TOKEN_SNAPSHOT_VERSION = 1 as const;

export const SURFACE_TOKEN_KEYS = [
  "--db-space-1",
  "--db-space-2",
  "--db-space-3",
  "--db-space-4",
  "--db-space-5",
  "--db-space-6",
  "--db-space-7",
  "--db-space-8",
  "--db-font-xs",
  "--db-font-xs-line-height",
  "--db-font-xs-weight",
  "--db-font-sm",
  "--db-font-sm-line-height",
  "--db-font-md",
  "--db-font-md-line-height",
  "--db-font-lg",
  "--db-font-lg-line-height",
  "--db-font-lg-weight",
  "--db-font-title",
  "--db-font-title-line-height",
  "--db-font-title-weight",
  "--db-radius-xs",
  "--db-radius-sm",
  "--db-radius-md",
  "--db-radius-lg",
  "--db-radius-full",
  "--db-border-subtle",
  "--db-border-regular",
  "--db-border-emphasis",
  "--db-surface-canvas",
  "--db-surface-raised",
  "--db-surface-overlay",
  "--db-surface-modal",
  "--db-surface-modal-border",
  "--db-elevation-1",
  "--db-elevation-2",
  "--db-elevation-3",
  "--db-layer-panel",
  "--db-layer-popover",
  "--db-layer-submenu",
  "--db-layer-modal",
  "--db-overlay-blur",
  "--db-accent-primary",
  "--db-accent-hover",
  "--db-accent-subtle",
  "--db-accent-focus-ring",
  "--db-hover-bg",
  "--db-active-bg",
  "--db-transition-fast",
  "--db-disabled-opacity",
  "--db-disabled-cursor",
  "--db-scrollbar-thumb",
  "--db-scrollbar-thumb-hover",
  "--db-row-height-compact",
  "--db-row-height-default",
  "--db-row-height-comfortable",
  "--db-row-height",
  "--db-row-cell-padding",
  "--db-row-font-size",
] as const;

export const TOKEN_SNAPSHOT_KEYS = SURFACE_TOKEN_KEYS;

// ───────────────────────────────────────────────────────────────────
// 4. PRODUCER REGISTRY
// ───────────────────────────────────────────────────────────────────

/**
 * Where each producer mounts its surface.
 *
 * The date-picker row took three attempts and the sequence is worth keeping, because two of the
 * three were defensible and wrong. It said `bodyPortal` while `date-value-picker.ts` mounts on the
 * container. Portalling was assumed to free the surface from the leaf, and a first measurement said
 * the two mounts were identical — but that harness put the leaf at the viewport origin, where the
 * offset being tested for is zero by construction. Rerun with a sidebar, a container-mounted
 * popover landed 244px outside the editing area, because `.workspace-leaf` carries `contain: strict`
 * and paint containment makes the leaf the containing block for the `position: fixed` the toolbar
 * positioner applies.
 *
 * That was a real defect in every locally mounted popover, not an argument about this row.
 * `positionToolbarPopover` now resolves its own containing block and offsets against it, so a
 * viewport coordinate lands where it was computed to land whatever the surface is mounted in. The
 * row is `local` because that is what the producer does, and it is now correct rather than merely
 * unmeasured.
 *
 * `record-detail-panel` is `local` at construction and becomes a body portal on a phone, where
 * `setSheetMount` moves it to clear the navigation bar. One row cannot say both; it says what the
 * producer does when it is built, and the sheet path is the documented exception.
 */
export const SURFACE_REGISTRY = {
  "column-menu": { role: "menu", mount: "bodyPortal", host: "body" },
  "owned-menu": { role: "menu", mount: "bodyPortal", host: "body" },
  "record-detail-panel": { role: "panel", mount: "local", host: "container" },
  "filter-panel": { role: "panel", mount: "local", host: "container" },
  "date-value-picker": { role: "menu", mount: "local", host: "container" },
} as const satisfies Record<SurfaceProducerId, SurfaceProducerDefinition>;

export function getSurfaceProducerDefinition(producer: SurfaceProducerId): SurfaceProducerDefinition {
  return SURFACE_REGISTRY[producer];
}
