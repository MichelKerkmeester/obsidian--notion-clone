// ───────────────────────────────────────────────────────────────────
// MODULE:    manifest-schema
// COMPONENT: the capture manifest's entry contract — what an entry must carry to be written
// ───────────────────────────────────────────────────────────────────
//
// The capture manifest records three kinds of picture: a hand-written fixture, a
// constructed render of the shipped renderer, and a reference render of the vendored
// Project Manager plugin the renderer ports. They share one file so a change to
// either kind marks its own captures stale, and they are told apart by `source`.
// A fixture may omit the field (every historical entry does); a constructed
// capture must declare it and must name the view it photographs, so a manifest
// that lost the renderer or the scale cannot read as a complete record; a
// reference capture must additionally name the vendored view and the constructed
// scenario it mirrors, or the pair a reviewer is told to read does not exist.
//
// Validation is a pure check rather than a writer-side assertion so the same
// contract can gate a test and the capture run: entries are validated before the
// manifest is written, and a run that would write an entry this schema rejects
// fails instead of publishing it.

// ───────────────────────────────────────────────────────────────────
// 1. THE CONTRACT
// ───────────────────────────────────────────────────────────────────

export const MANIFEST_SOURCES = ["fixture", "constructed", "reference"];
export const CONSTRUCTED_RENDERERS = [
  "list", "table", "board", "gallery", "calendar", "timeline", "chart",
  "calendar-toolbar", "timeline-toolbar", "chart-toolbar",
  "toolbar", "active-view-controls", "active-rule-popover", "filter-panel", "sort-panel",
  "view-config", "column-manager", "record-detail", "record-detail-body", "record-peek",
  "column-width-adjuster",
  "summary", "owned-menu", "cell-editors", "date-picker", "icon-picker", "color-picker",
  "relation-values", "file-fields", "number-display", "record-icon", "dropdown",
  "empty-state", "column-header", "group-selection-controls", "card-covers",
];
export const CONSTRUCTED_BAGS = ["file-view", "embed"];
export const CONSTRUCTED_SCALES = ["month", "week", "day", "quarter", "year"];
export const REFERENCE_RENDERERS = ["pm-kanban", "pm-gantt"];

export function validateManifestEntry(entry) {
  const problems = [];

  if (!entry || typeof entry !== "object") {
    return { ok: false, problems: ["entry is not an object"] };
  }

  if (typeof entry.id !== "string" || entry.id.length === 0) {
    problems.push(`entry ${JSON.stringify(entry.id)} has no scenario id`);
  }
  if (typeof entry.file !== "string" || entry.file.length === 0) {
    problems.push(`entry ${entry.id ?? "?"} has no file`);
  }
  if (entry.theme !== "dark" && entry.theme !== "light") {
    problems.push(`entry ${entry.id ?? "?"} has theme ${JSON.stringify(entry.theme)}, want dark or light`);
  }
  if (entry.device !== "desktop" && entry.device !== "mobile") {
    problems.push(`entry ${entry.id ?? "?"} has device ${JSON.stringify(entry.device)}, want desktop or mobile`);
  }
  if (entry.pixelHash == null || typeof entry.pixelHash !== "string") {
    problems.push(`entry ${entry.id ?? "?"} has no pixelHash`);
  }
  if (!entry.sourceHashes || typeof entry.sourceHashes !== "object" || Array.isArray(entry.sourceHashes)) {
    problems.push(`entry ${entry.id ?? "?"} has no sourceHashes object`);
  }

  if (entry.source !== undefined && !MANIFEST_SOURCES.includes(entry.source)) {
    problems.push(`entry ${entry.id ?? "?"} has source ${JSON.stringify(entry.source)}, `
      + `want one of ${MANIFEST_SOURCES.join(", ")}`);
  }

  // A constructed capture is only a record of the view it photographed if it says which view
  // that was. A constructed entry without the renderer or the bag cannot be told from a fixture
  // that merely forgot its marker, so it is rejected rather than written.
  if (entry.source === "constructed") {
    if (!CONSTRUCTED_RENDERERS.includes(entry.renderer)) {
      problems.push(`constructed entry ${entry.id ?? "?"} has renderer ${JSON.stringify(entry.renderer)}, `
        + `want one of ${CONSTRUCTED_RENDERERS.join(", ")}`);
    }
    if (!CONSTRUCTED_BAGS.includes(entry.bag)) {
      problems.push(`constructed entry ${entry.id ?? "?"} has bag ${JSON.stringify(entry.bag)}, `
        + `want one of ${CONSTRUCTED_BAGS.join(", ")}`);
    }
    if (entry.scale !== undefined && !CONSTRUCTED_SCALES.includes(entry.scale)) {
      problems.push(`constructed entry ${entry.id ?? "?"} has scale ${JSON.stringify(entry.scale)}, `
        + `want one of ${CONSTRUCTED_SCALES.join(", ")}`);
    }
  }

  // A reference capture is only the mirror it claims to be if it names the vendored view and
  // the constructed scenario it pairs with; without either, the entry cannot be read beside
  // the capture it exists to compare against.
  if (entry.source === "reference") {
    if (!REFERENCE_RENDERERS.includes(entry.renderer)) {
      problems.push(`reference entry ${entry.id ?? "?"} has renderer ${JSON.stringify(entry.renderer)}, `
        + `want one of ${REFERENCE_RENDERERS.join(", ")}`);
    }
    if (entry.group !== "project-manager") {
      problems.push(`reference entry ${entry.id ?? "?"} has group ${JSON.stringify(entry.group)}, `
        + `want "project-manager" (the directory the pair is read from)`);
    }
    if (typeof entry.referenceOf !== "string" || entry.referenceOf.length === 0) {
      problems.push(`reference entry ${entry.id ?? "?"} has no referenceOf naming the constructed `
        + `scenario it mirrors`);
    }
  }

  if (entry.fixtureOf !== undefined && (typeof entry.fixtureOf !== "string" || entry.fixtureOf.length === 0)) {
    problems.push(`entry ${entry.id ?? "?"} has a fixtureOf that names no constructed scenario`);
  }

  return { ok: problems.length === 0, problems };
}
