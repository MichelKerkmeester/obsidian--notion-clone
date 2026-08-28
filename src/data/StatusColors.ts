import type { StatusColor } from "./types";

/** Keep the persisted status-color vocabulary in one order for every visual picker. */
export const STATUS_COLORS = [
  "gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink",
  "red", "slate", "cyan", "teal", "lime", "indigo", "violet", "rose",
] as const satisfies readonly StatusColor[];
