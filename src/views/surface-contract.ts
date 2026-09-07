// ───────────────────────────────────────────────────────────────────
// MODULE:    surface-contract
// COMPONENT: semantic roles, mount capabilities, role defaults and the
//            producer registry shared by floating surfaces
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. TYPES
// ───────────────────────────────────────────────────────────────────

export type SurfaceRole = "menu" | "panel" | "dialog" | "sheet" | "submenu" | "feedback";

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
  | "drag-to-dismiss"
  | "timeout";

export type SurfaceFocusMode = "roving" | "trapped" | "return-to-parent" | "none";

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
  | "date-value-picker"
  | "toast";

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
  /**
   * A transient report on an operation, not a question the reader must answer. It never takes
   * focus — `aria-live="polite"` is the point precisely because it must not interrupt — and it
   * leaves on its own timer as readily as it leaves on a click, which no other role in this table
   * does. Its geometry is a measured constant rather than a scale, so `role-declared` is honest
   * where `menu`'s 320px cap or `panel`'s bounded range would both be measurably wrong.
   */
  feedback: {
    dismissal: ["explicit-action", "timeout"],
    focusMode: "none",
    width: { kind: "role-declared" },
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
  "--obnotion-space-1",
  "--obnotion-space-2",
  "--obnotion-space-3",
  "--obnotion-space-4",
  "--obnotion-space-5",
  "--obnotion-space-6",
  "--obnotion-space-7",
  "--obnotion-space-8",
  "--obnotion-font-xs",
  "--obnotion-font-xs-line-height",
  "--obnotion-font-xs-weight",
  "--obnotion-font-sm",
  "--obnotion-font-sm-line-height",
  "--obnotion-font-md",
  "--obnotion-font-md-line-height",
  "--obnotion-font-lg",
  "--obnotion-font-lg-line-height",
  "--obnotion-font-lg-weight",
  "--obnotion-font-title",
  "--obnotion-font-title-line-height",
  "--obnotion-font-title-weight",
  "--obnotion-radius-xs",
  "--obnotion-radius-sm",
  "--obnotion-radius-md",
  "--obnotion-radius-lg",
  "--obnotion-radius-full",
  "--obnotion-border-subtle",
  "--obnotion-border-regular",
  "--obnotion-border-emphasis",
  "--obnotion-surface-canvas",
  "--obnotion-surface-raised",
  "--obnotion-surface-overlay",
  "--obnotion-surface-modal",
  "--obnotion-surface-modal-border",
  "--obnotion-elevation-1",
  "--obnotion-elevation-2",
  "--obnotion-elevation-3",
  "--obnotion-layer-panel",
  "--obnotion-layer-popover",
  "--obnotion-layer-submenu",
  "--obnotion-layer-modal",
  "--obnotion-overlay-blur",
  "--obnotion-accent-primary",
  "--obnotion-accent-hover",
  "--obnotion-accent-subtle",
  "--obnotion-accent-focus-ring",
  "--obnotion-hover-bg",
  "--obnotion-active-bg",
  "--obnotion-transition-fast",
  "--obnotion-disabled-opacity",
  "--obnotion-disabled-cursor",
  "--obnotion-scrollbar-thumb",
  "--obnotion-scrollbar-thumb-hover",
  "--obnotion-row-height-compact",
  "--obnotion-row-height-default",
  "--obnotion-row-height-comfortable",
  "--obnotion-row-height",
  "--obnotion-row-cell-padding",
  "--obnotion-row-font-size",
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
  // `showToast` creates its stack on `doc.body` the first time a document raises one — the same
  // body-portal idiom `owned-menu` uses, so a measurement against this entry is a measurement of
  // where the surface actually lands. It was left out of this table for a while rather than
  // entered under the nearest existing role: `menu`'s outside-pointerdown/escape dismissal, roving
  // focus and 320px cap are each measurably false of a surface that dismisses on its own timer,
  // takes no focus, and is fixed at 384px. `feedback` exists so this row can be true.
  "toast": { role: "feedback", mount: "bodyPortal", host: "body" },
} as const satisfies Record<SurfaceProducerId, SurfaceProducerDefinition>;

export function getSurfaceProducerDefinition(producer: SurfaceProducerId): SurfaceProducerDefinition {
  return SURFACE_REGISTRY[producer];
}
