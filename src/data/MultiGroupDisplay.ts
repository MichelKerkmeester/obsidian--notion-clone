/**
 * Display-only decisions shared by the table grouping entry points.
 *
 * Keep this module small and renderer-free, following the EuroFormat pattern:
 * it resolves the fields that can actually be displayed and preserves the
 * legacy depth-zero header shape while nested headers opt into depth styling.
 */

import { dropComputedGroupFields, effectiveGroupFields } from "./MultiFieldGrouping";
import type { ViewConfig, ViewModeStateDef } from "./types";

/** Resolve configured grouping fields that are safe to render. */
export function getDisplayGroupFields(
  config: ViewConfig,
  state: Pick<ViewModeStateDef, "groupByField">,
): string[] {
  return dropComputedGroupFields(effectiveGroupFields(config, state), config);
}

/** Keep the existing one-field header class and add a class only for nesting. */
export function getGroupHeaderClassName(depth: number): string {
  const normalizedDepth = normalizeDepth(depth);
  return normalizedDepth === 0
    ? "db-group-header"
    : `db-group-header db-group-header--depth-${normalizedDepth}`;
}

/** Return the nested depth token; depth zero keeps the legacy inline style absent. */
export function getGroupHeaderDepthValue(depth: number): string | undefined {
  const normalizedDepth = normalizeDepth(depth);
  return normalizedDepth === 0 ? undefined : String(normalizedDepth);
}

function normalizeDepth(depth: number): number {
  return Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
}
