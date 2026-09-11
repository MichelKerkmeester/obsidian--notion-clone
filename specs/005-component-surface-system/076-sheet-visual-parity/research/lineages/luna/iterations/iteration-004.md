# Iteration 4: DESIGN SYSTEM — shared surface primitives, semantic roles, and landing order

## Focus

Describe how the 076 children connect to one token and component system, identify duplicated or conflicting authorities, and define the landing order that prevents child CSS from invalidating later captures.

## Actions Taken

- Read the parent D4 serial-CSS ruling and D7/D9 frame constraints.
- Read the design-fundamentals spacing, type, colour, and build guidance.
- Inspected styles.css, surface-shell.ts, record-surface/CODE.md, property-row.ts, hidden-properties.ts, menu-row.ts, toolbar-primitives.ts, and the child 008/002 primitive references.
- Compared shared seams with consumer-specific row, divider, card, status, and stack selectors.

## Findings

### DS-001 — Tokens exist, but the authority map still contains stale card and geometry values

Evidence: styles.css:44-93 defines spacing, inset, type, and radius tokens, but styles.css:244-376 still defines sheet/card surface vocabulary; the design-fundamentals guidance requires a 4/8/12/16/24 spacing rhythm and a 12/14/16/18/20/24 type scale. The 076 target needs semantic aliases and an explicit deprecation list rather than letting children invent near-duplicate values.

### DS-002 — The shell/header is the strongest shared primitive and should land before consumer tuning

Evidence: src/views/surface-shell.ts:230-327 already owns the three-slot header and 44px edge controls; styles.css:13590-13718 supplies the phone header grid and controls. D9 additionally requires the handle, 16pt inset, and stacked-sheet behavior. This is a safe shared seam, but replacement and overlay depth behavior at surface-shell.ts:342-420 must be named in the stack contract.

### DS-003 — Row and divider geometry is duplicated across menu, panel, settings, record, and column-manager families

Evidence: styles.css:590-680 and :727-770 define menu row/divider rules; styles.css:13872-13932 defines panel row geometry; styles.css:12342-12386 defines settings rows; styles.css:11105-11155 and :14512-14558 define record/column-manager variants. The repeated 30px and 44px values are evidence of multiple authorities, not a component system.

### DS-004 — Record-surface has reusable property-row and hidden-property seams but they are not yet the universal row contract

Evidence: src/views/record-surface/CODE.md:15-31,43-45 lists property-row, hidden-properties, and related primitives while noting partial wiring; property-row.ts:100-145 and :250-295 already provide status/select and split-option anatomy. Child 008 says its property row should be identical to child 002, so these consumers should bind to shared variants before the sheet-family work lands.

### DS-005 — Status and priority use raw palette values instead of semantic roles

Evidence: styles.css:182-213 and :1049-1086 define raw status colours and styles.css:8079-8205 applies status badge/text treatment; property-row.ts:390-455 consumes status colour directly. The design-fundamentals semantic-role guidance and assets/tokens.css:92-147 support light/dark semantic aliases. Add status and priority roles with foreground, tint, border, and muted variants in both themes.

## Questions Answered

- Q4 is partially answered: shared frame/header and record-surface seams exist, but rows, dividers, card tokens, status/priority roles, and stack policy remain fragmented.
- The safe landing order is token/guard, frame/header/stack, row/divider, record/property, sheet families, then board.

## Questions Remaining / Next Focus

- The operator must decide whether the 22px/13px typography values are measured exceptions or migration targets.
- Iteration 5 will audit D6 loop reliability, stall detection, verdict contracts, judge calibration, release gating, parallelism, and logging.

## Sources

- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:184-289,295-336,375-423
- specs/005-component-surface-system/076-sheet-visual-parity/plan.md:149-157
- .opencode/skills/sk-design/sk-design-fundamentals/SKILL.md:277-324
- .opencode/skills/sk-design/sk-design-fundamentals/assets/tokens.css:92-147
- styles.css:44-93,182-213,244-376,590-680,727-770,8079-8205,11105-11155,12342-12386,13590-13718,13872-13932,14512-14558
- src/views/surface-shell.ts:230-420
- src/views/record-surface/CODE.md:15-45
- src/views/record-surface/property-row.ts:100-145,250-295,390-455

## Assessment

The design-system gap is structural and release-blocking: child plans can meet local thresholds while still creating competing selectors. A token-first, primitive-first sequence with serial shared CSS work is high confidence.

## Reflection

The previous composition pass identified D7 as a universal target. This pass turns that ruling into ownership boundaries: shared frame, rows, dividers, themes, and stacking must be landed once and referenced by all child clauses.

