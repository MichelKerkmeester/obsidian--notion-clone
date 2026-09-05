// ───────────────────────────────────────────────────────────────────
// MODULE:    record-surface
// COMPONENT: barrel and contract table for the record/object primitive family
// ───────────────────────────────────────────────────────────────────
//
// The property row used to exist wherever a consumer needed one — three separate anatomies
// across four files, none of them aware the others existed. Every module in this family lives
// beside its consumers rather than inside one of them, so a fix lands once and every surface
// inherits it. This file is the registry a later census reads to answer "how many of these are
// there," and the single import surface a consumer switches onto.

// ───────────────────────────────────────────────────────────────────
// 1. THE CONTRACT TABLE
// ───────────────────────────────────────────────────────────────────

export interface RecordSurfacePrimitiveEntry {
  /** The short name this family's own documents use for the primitive. */
  name: string;
  module: string;
  summary: string;
}

export const RECORD_SURFACE_PRIMITIVES: readonly RecordSurfacePrimitiveEntry[] = [
  {
    name: "P1",
    module: "./record-header",
    summary: "Header block: icon, title, open, close. Desktop reproduces the record sheet's own DOM; phone delegates to the shared sheet header.",
  },
  {
    name: "P2",
    module: "./property-row",
    summary: "Property row: today's display value (the shim card-field-renderer.ts calls) plus the trued-up shell — label, then value, value left-aligned, no format icon.",
  },
  {
    name: "P3",
    module: "./add-property-row",
    summary: "Add-property affordance: a search field that filters the format list and falls through to create when nothing matches.",
  },
  {
    name: "P5",
    module: "./hidden-properties",
    summary: "Hidden-properties group: collapsed with a count, expanded state survives a rebuild.",
  },
];

// ───────────────────────────────────────────────────────────────────
// 2. RE-EXPORTS
// ───────────────────────────────────────────────────────────────────

export * from "./record-header";
export * from "./property-row";
export * from "./hidden-properties";
export * from "./add-property-row";
export * from "./cell-editor-contract";
