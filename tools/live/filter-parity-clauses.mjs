// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-parity-clauses
// COMPONENT: the six filter-sheet presentation numbers the grammar lane measures
// ───────────────────────────────────────────────────────────────────
//
// The filter sheet is judged on how it reads, and "how it reads" has to be a
// number before it can be reviewed. These six clauses reduce one mounted sheet
// to those numbers: how many rows edit a rule across three or more controls at
// once, how many condition rows stack per rule, whether a plain-canvas detail
// group exists, how many nested icon buttons carry no visible word, how many
// operators are edited off a detail row, and how many action rows sit outside a
// labelled group.
//
// The clauses read the shipped markup rather than a fixture, so the same
// numbers describe the tree before and after the presentation change. Two
// shapes are accepted: the marked one, where a producer has declared its
// summary row, detail group and action group, and the unmarked one, where a
// rule is recognised by the row that carries its field control. The unmarked
// path is not decoration — the RED baseline runs before any marker exists, so a
// marker-only clause would read zero on the tree it is meant to measure, and a
// check that cannot go red is not evidence.

// ───────────────────────────────────────────────────────────────────
// 1. MARKER CONTRACT
// ───────────────────────────────────────────────────────────────────

/**
 * Presentation markers a filter producer writes. Kept in one place so a
 * producer and the clause that reads it cannot drift apart.
 */
export const FILTER_MARKERS = {
  leaf: 'data-filter-leaf',
  summaryRow: 'data-filter-summary-row',
  detailGroup: 'data-filter-detail-group',
  detailRow: 'data-filter-detail-row',
  controlBox: 'data-filter-control-box',
  actionGroup: 'data-filter-action-group',
};

/** The shipped classes a rule is recognised by when no marker is present. */
export const FILTER_SELECTORS = {
  conditionRow: '.obnotion-filter-condition-row, .obnotion-active-rule-editor-row',
  conditionAction: '.obnotion-filter-condition-action',
  fieldControl: '.obnotion-filter-field-dropdown',
  operatorControl: '.obnotion-filter-operator-dropdown',
  notNode: '.obnotion-source-rule-not',
  notHeader: '.obnotion-source-rule-header',
  interactive: [
    'button',
    '[role="button"]',
    'select',
    'input:not([type="hidden"])',
    'textarea',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '),
};

/** What a conforming sheet must show. L1, L2, L4, L5 and L6 are ceilings; L3 is a presence. */
export const FILTER_PARITY_TARGET = { L1: 0, L2: 1, L3: 1, L4: 0, L5: 0, L6: 0 };

/** One line per clause, so a failing number names the shape it measured. */
export const FILTER_CLAUSE_SHAPE = {
  L1: 'rows editing one rule across three or more controls at once',
  L2: 'condition rows stacked per rule, outside a plain-canvas detail group',
  L3: 'plain-canvas detail groups per rule (a presence: exactly one)',
  L4: 'nested icon buttons in a Not header with no visible word',
  L5: 'operator controls edited outside a detail group',
  L6: 'action rows outside a labelled action group',
};

// ───────────────────────────────────────────────────────────────────
// 2. DOM READING
// ───────────────────────────────────────────────────────────────────

function matches(el, selector) {
  try {
    return Boolean(el?.matches?.(selector));
  } catch {
    return false;
  }
}

function query(root, selector) {
  return root?.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : [];
}

function inside(el, marker) {
  return Boolean(el?.closest?.(`[${marker}]`));
}

function visibleText(el) {
  return (el?.textContent || '').replace(/\s+/g, ' ').trim();
}

function rectOf(el) {
  const rect = el?.getBoundingClientRect?.();
  if (!rect || (!rect.width && !rect.height)) return null;
  return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
}

function sameBand(rects) {
  if (rects.some((rect) => rect == null)) return true;
  const bands = new Set(rects.map((rect) => rect.top));
  return bands.size <= 2;
}

/**
 * Split the sheet's rows into one group per rule. A marked tree hands its own
 * leaves over; an unmarked one starts a rule at every row carrying a field
 * control, which is the row that names the property the rest of the rule edits.
 */
function segmentRules(sheet, selectors) {
  const marked = query(sheet, `[${FILTER_MARKERS.leaf}]`);
  if (marked.length) {
    return marked.map((leaf) => ({ leaf, rows: query(leaf, `${selectors.conditionRow}, ${selectors.conditionAction}`) }));
  }
  const rows = query(sheet, `${selectors.conditionRow}, ${selectors.conditionAction}`);
  const groups = [];
  for (const row of rows) {
    if (matches(row, selectors.conditionRow) && row.querySelector(selectors.fieldControl)) {
      groups.push({ leaf: null, rows: [row] });
      continue;
    }
    if (!groups.length) groups.push({ leaf: null, rows: [] });
    groups[groups.length - 1].rows.push(row);
  }
  return groups;
}

const DOCUMENT_POSITION_FOLLOWING = 4;

/**
 * An unmarked rule owns everything between its own first row and the next rule's, which is how a
 * sheet with no leaf marker still reports one number per rule instead of one number for the whole
 * sheet: a marker written by the next rule must not be counted against this one.
 */
function ruleSpans(groups) {
  return groups.map((group, index) => {
    const start = group.rows[0] || null;
    const end = groups[index + 1]?.rows[0] || null;
    return (el) => {
      if (group.leaf) return group.leaf === el || group.leaf.contains(el);
      if (!start || !el?.compareDocumentPosition) return true;
      if (el === start) return true;
      const afterStart = Boolean(start.compareDocumentPosition(el) & DOCUMENT_POSITION_FOLLOWING);
      const beforeEnd = !end || el === end || Boolean(end.compareDocumentPosition(el) & DOCUMENT_POSITION_FOLLOWING);
      return afterStart && beforeEnd;
    };
  });
}

function describeRule(group, inScope, sheet, selectors) {
  const rows = group.rows;
  const conditionRows = rows.filter((row) => matches(row, selectors.conditionRow) && !inside(row, FILTER_MARKERS.detailGroup));
  const actionRows = rows.filter((row) => matches(row, selectors.conditionAction) && !inside(row, FILTER_MARKERS.actionGroup));

  const summaryRows = query(sheet, `[${FILTER_MARKERS.summaryRow}]`).filter(inScope);
  const sideBySideRows = (summaryRows.length ? summaryRows : conditionRows).filter((row) => {
    const candidates = (matches(row, selectors.interactive) ? [row] : []).concat(query(row, selectors.interactive));
    // A summary row is itself the control, so it carries no interactive descendant: the row joins
    // its own count, or a one-control summary row would read as zero controls and the clause
    // could never see a crowded row again.
    const controls = candidates.filter((control) => !inside(control, FILTER_MARKERS.detailGroup));
    if (controls.length < 3) return false;
    return sameBand(controls.map(rectOf));
  });

  const operatorControls = query(sheet, selectors.operatorControl).filter(
    (control) => inScope(control) && !inside(control, FILTER_MARKERS.detailGroup),
  );

  return {
    hasMarkedLeaf: Boolean(group.leaf),
    conditionRows: conditionRows.length,
    sideBySideRows: sideBySideRows.length,
    detailGroups: query(sheet, `[${FILTER_MARKERS.detailGroup}]`).filter(inScope).length,
    detailRows: query(sheet, `[${FILTER_MARKERS.detailRow}]`).filter(inScope).length,
    // Before the detail group exists, each condition row is its own bordered box; the count
    // falls back to the rows themselves so the number is a real reading rather than a zero.
    controlBoxes: query(sheet, `[${FILTER_MARKERS.controlBox}]`).filter(inScope).length || conditionRows.length,
    actionGroups: query(sheet, `[${FILTER_MARKERS.actionGroup}]`).filter(inScope).length,
    operatorControls: operatorControls.length,
    actionRows: actionRows.length,
  };
}

function unlabelledNotIcons(sheet, selectors) {
  let count = 0;
  const nodes = [];
  for (const node of query(sheet, selectors.notNode)) {
    const header = node.querySelector(selectors.notHeader) || node;
    const icons = query(header, selectors.interactive).filter((control) => !visibleText(control));
    nodes.push({ controls: query(header, selectors.interactive).length, withoutWord: icons.length });
    count += icons.length;
  }
  return { count, nodes };
}

// ───────────────────────────────────────────────────────────────────
// 3. THE SIX CLAUSES
// ───────────────────────────────────────────────────────────────────

function summarise(values) {
  return {
    perLeaf: values,
    max: values.length ? Math.max(...values) : 0,
    min: values.length ? Math.min(...values) : 0,
    total: values.reduce((sum, value) => sum + value, 0),
  };
}

/**
 * Measure one mounted filter sheet. `root` is any node holding the sheet — the
 * phone sheet's body, the active-rule companion, or a fixture.
 */
export function measureFilterSheet(root, options = {}) {
  const selectors = { ...FILTER_SELECTORS, ...(options.selectors || {}) };
  const groups = segmentRules(root, selectors);
  const spans = ruleSpans(groups);
  const rules = groups.map((group, index) => describeRule(group, spans[index], root, selectors));

  const notIcons = unlabelledNotIcons(root, selectors);
  const clauses = {
    L1: summarise(rules.map((rule) => rule.sideBySideRows)),
    L2: summarise(rules.map((rule) => rule.conditionRows)),
    L3: summarise(rules.map((rule) => rule.detailGroups)),
    L4: summarise(rules.length ? rules.map(() => 0) : [notIcons.count]),
    L5: summarise(rules.map((rule) => rule.operatorControls)),
    L6: summarise(rules.map((rule) => rule.actionRows)),
  };
  if (notIcons.count > 0) clauses.L4 = { ...clauses.L4, max: notIcons.count, total: clauses.L4.total + notIcons.count };

  return {
    rules: rules.length,
    marked: rules.some((rule) => rule.hasMarkedLeaf),
    clauses,
    detailRows: summarise(rules.map((rule) => rule.detailRows)),
    controlBoxes: summarise(rules.map((rule) => rule.controlBoxes)),
    actionGroups: summarise(rules.map((rule) => rule.actionGroups)),
    notNodes: notIcons.nodes,
  };
}

/** The clauses a measured sheet still fails, named with the number that failed them. */
export function filterClauseFailures(result, target = FILTER_PARITY_TARGET) {
  const failures = [];
  const { clauses } = result;
  for (const id of ['L1', 'L2', 'L4', 'L5', 'L6']) {
    if (clauses[id].max > target[id]) {
      failures.push(`${id}=${clauses[id].max} (max ${target[id]}): ${FILTER_CLAUSE_SHAPE[id]}`);
    }
  }
  const missing = clauses.L3.perLeaf.filter((count) => count < target.L3);
  if (missing.length) {
    failures.push(`L3=${missing.length} rule(s) with no plain-canvas detail group: ${FILTER_CLAUSE_SHAPE.L3}`);
  }
  // Reported in clause order, so two runs of the same sheet read the same way.
  return failures.sort((a, b) => a.slice(0, 2).localeCompare(b.slice(0, 2)));
}

/** One line per clause, for a lane's own output. */
export function formatFilterClause(result, id) {
  const clause = result.clauses[id];
  return `${id} max=${clause.max} min=${clause.min} total=${clause.total} perRule=[${clause.perLeaf.join(',')}] — ${FILTER_CLAUSE_SHAPE[id]}`;
}
