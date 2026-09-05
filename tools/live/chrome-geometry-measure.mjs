// ───────────────────────────────────────────────────────────────────
// MODULE:    chrome-geometry-measure
// COMPONENT: the toolbar/panel chrome geometry unstyled-links.mjs reads off a mounted renderer
// ───────────────────────────────────────────────────────────────────
//
// Two desktop defects were reported against surfaces no lane measured: the New split button read
// as a control of its own rather than one of the toolbar's, and a filter condition row crushed its
// value control to a sliver while the panel around it had room to spare.
//
// Neither is catchable by a count or a class check. Both are geometry and computed tone, so they
// need a measurement with a threshold, taken off the shipped renderer rather than a fixture that
// mirrors it. It rides the constructed pass of an existing lane because the gate's lane count is a
// deliberate ceiling, not because link colour and chrome geometry are the same subject.
//
// `judgeChromeGeometry` is the pure part and carries its own tests. `measureChromeGeometry` needs a
// live `document` and `getComputedStyle`, so the real browser run is what exercises it.

// ───────────────────────────────────────────────────────────────────
// 1. THRESHOLDS
// ───────────────────────────────────────────────────────────────────

/** A split button that agrees with the icon buttons to the pixel is over-specified; one is slack. */
export const SPLIT_HEIGHT_TOLERANCE = 1;

/** Below this a property or operator name is an ellipsis with a character in front of it. */
export const RULE_CONTROL_MIN_WIDTH = 140;

/** Below this a value box holds two characters, which is what the report was about. */
export const RULE_VALUE_MIN_WIDTH = 120;

// ───────────────────────────────────────────────────────────────────
// 2. PURE JUDGEMENT
// ───────────────────────────────────────────────────────────────────

/** A colour string the browser resolved to fully transparent, whatever notation it used. */
function isTransparent(colour) {
  return colour === "transparent" || /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(colour);
}

/**
 * Turns one scenario's reading into the rows that fail it. An empty array is a pass; every row
 * names the measurement, the bound, and what was measured, because a threshold failure with no
 * number in it sends the reader back to the browser to find out what happened.
 */
export function judgeChromeGeometry(reading) {
  const rows = [];
  const split = reading.splitButton;
  if (split) {
    const halves = Math.abs(split.primaryHeight - split.dropdownHeight);
    if (halves > SPLIT_HEIGHT_TOLERANCE) {
      rows.push({
        what: "split-button halves disagree in height",
        detail: `primary ${split.primaryHeight}px, dropdown ${split.dropdownHeight}px, `
          + `tolerance ${SPLIT_HEIGHT_TOLERANCE}px`,
        why: "the dropdown half states no height of its own, so the host's own button height "
          + "decides it while the primary half stays pinned — the two stop being one pill",
      });
    }
    const againstIcons = Math.abs(split.primaryHeight - split.iconHeight);
    if (againstIcons > SPLIT_HEIGHT_TOLERANCE) {
      rows.push({
        what: "the split button does not match the toolbar icon buttons' height",
        detail: `split ${split.primaryHeight}px, icon buttons ${split.iconHeight}px, `
          + `tolerance ${SPLIT_HEIGHT_TOLERANCE}px`,
        why: "it sits in the same cluster and is read as part of the same row",
      });
    }
    if (split.outerRadius !== split.iconRadius) {
      rows.push({
        what: "the split button's outer radius does not match the toolbar icon buttons'",
        detail: `split ${split.outerRadius}, icon buttons ${split.iconRadius}`,
        why: "two radii in one row read as two unrelated control families",
      });
    }
    if (split.innerRadius !== "0px") {
      rows.push({
        what: "the split button's inner edges are rounded",
        detail: `inner radius ${split.innerRadius}, want 0px`,
        why: "a rounded inner edge makes the chevron read as a second button beside the first",
      });
    }
    for (const [half, colour] of [["primary", split.primaryRest], ["dropdown", split.dropdownRest]]) {
      if (!isTransparent(colour)) {
        rows.push({
          what: `the split button's ${half} half paints a fill at rest`,
          detail: `${colour}, want a transparent rest state`,
          why: "the neighbouring icon buttons are transparent until hovered, so a resting fill "
            + "makes this one control louder and taller-looking than the row it belongs to",
        });
      }
    }
  }
  for (const row of reading.ruleRows || []) {
    for (const [name, width, bound] of [
      ["property", row.propertyWidth, RULE_CONTROL_MIN_WIDTH],
      ["operator", row.operatorWidth, RULE_CONTROL_MIN_WIDTH],
      ["value", row.valueWidth, RULE_VALUE_MIN_WIDTH],
    ]) {
      if (width === null || width === undefined) continue;
      if (width >= bound) continue;
      rows.push({
        what: `a ${row.panel} condition row crushed its ${name} control`,
        detail: `${Math.round(width)}px against a ${bound}px floor, in a ${Math.round(row.panelWidth)}px panel`,
        why: "the row's fixed-basis controls and trailing buttons take the panel's width first, "
          + "so the flexible controls absorb every shortfall",
      });
    }
    // The floors above are `min-width`, so on their own they can only ever be satisfied: a panel too
    // narrow to hold them stops shrinking the controls and starts overflowing instead, which reads
    // as controls off the right edge rather than as a squeeze. Measuring the overflow is what makes
    // the pair of checks say something — one proves the floors exist, the other proves the panel
    // was widened to hold them rather than the floors quietly overrunning it.
    if (row.overflow > 1) {
      rows.push({
        what: `a ${row.panel} condition row overflows its panel`,
        detail: `${Math.round(row.overflow)}px past a ${Math.round(row.panelWidth)}px panel`,
        why: "the row's floors add up to more than the panel gives it, so the trailing controls "
          + "are painted outside the surface that owns them",
      });
    }
  }
  return rows;
}

// ───────────────────────────────────────────────────────────────────
// 3. DOM READING (browser-only)
// ───────────────────────────────────────────────────────────────────

function readSplitButton(root) {
  const primary = root.querySelector(".db-new-button-primary");
  const dropdown = root.querySelector(".db-new-button-dropdown");
  const icon = root.querySelector(".db-toolbar-icon-button");
  if (!primary || !dropdown || !icon) return null;
  // The phone's floating action button is a different control wearing the same class: round,
  // accent-filled and off the toolbar row entirely, so none of the comparisons below apply to it.
  if (primary.classList.contains("is-mobile-fab")) return null;
  const primaryStyle = getComputedStyle(primary);
  const dropdownStyle = getComputedStyle(dropdown);
  return {
    primaryHeight: Math.round(primary.getBoundingClientRect().height),
    dropdownHeight: Math.round(dropdown.getBoundingClientRect().height),
    iconHeight: Math.round(icon.getBoundingClientRect().height),
    outerRadius: primaryStyle.borderTopLeftRadius,
    innerRadius: primaryStyle.borderTopRightRadius,
    iconRadius: getComputedStyle(icon).borderTopLeftRadius,
    primaryRest: primaryStyle.backgroundColor,
    dropdownRest: dropdownStyle.backgroundColor,
  };
}

/** The one control in a condition row that holds the value, whatever type the column is. */
function valueControl(row) {
  return row.querySelector(".db-filter-value-dropdown, .db-panel-date-value")
    || row.querySelector("input");
}

/**
 * The border box, not `clientWidth`. Every control here carries a 1px border and the floors govern
 * the box the reader sees, so subtracting the border would compare the rule against a number the
 * rule does not set.
 */
function boxWidth(el) {
  return el ? el.getBoundingClientRect().width : null;
}

function readRuleRows(root) {
  const rows = [];
  for (const [panel, selector, property, operator] of [
    ["filter", ".db-filter-panel", ".db-filter-field-dropdown", ".db-filter-operator-dropdown"],
    ["sort", ".db-sort-panel", ".db-sort-field-dropdown", null],
  ]) {
    // Same two exclusions the floors themselves carry: a panel presenting as a phone sheet lays its
    // rows out as a two-line grid on purpose, and the compact single-rule editor the chip rail opens
    // borrows this panel's chrome class while being a wrapping column a third of the width.
    const host = root.querySelector(`${selector}:not(.db-mobile-bottom-sheet):not(.db-active-rule-popover)`);
    if (!host) continue;
    const panelWidth = host.getBoundingClientRect().width;
    for (const row of host.querySelectorAll(".db-panel-row")) {
      const propertyEl = row.querySelector(property);
      if (!propertyEl) continue;
      const operatorEl = operator ? row.querySelector(operator) : null;
      const value = operator ? valueControl(row) : null;
      rows.push({
        panel,
        panelWidth,
        propertyWidth: boxWidth(propertyEl),
        operatorWidth: boxWidth(operatorEl),
        // An "is empty" rule renders a dash rather than a control, and has no width to defend.
        valueWidth: boxWidth(value),
        overflow: row.scrollWidth - row.clientWidth,
      });
    }
  }
  return rows;
}

/** Reads whichever of the two chrome surfaces this scenario built; both absent is a clean skip. */
export function measureChromeGeometry(root) {
  return { splitButton: readSplitButton(root), ruleRows: readRuleRows(root) };
}
