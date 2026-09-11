# Iteration 1 findings

## Gap class

COVERAGE — operator requests, inventory surfaces, and dedicated child ownership.

## Evidence

- specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:15-20 — “87 surfaces (55 primary + 32 stacked).”
- specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:54-110 — row 8 record-peek is assigned contextually to child 008 and row 30 generic dropdown is marked shared-primitive coverage.
- specs/005-component-surface-system/076-sheet-visual-parity/coverage-audit.md:112-147 — stacked rows 56–87 include provisional ownership for row 87 timeline event menu.
- specs/005-component-surface-system/076-sheet-visual-parity/decision-record.md:184-192 — D6 still says the outer graph launches “the eleven children”.
- specs/005-component-surface-system/076-sheet-visual-parity/plan.md:175-181 — section 6A still describes “all eleven children”.
- specs/005-component-surface-system/roadmap.md:422-451 — rows 70–94 mix external operator requests with the binding 076 loop, frame, inventory, and board rulings.

## Finding

The audit has a useful 87-row baseline, but contextual assignment is not a dedicated six-phase contract. Rows 8 and 30 need an explicit shared-surface owner, rows 65 and 87 need renderer decisions, and roadmap rows 70–88 need a trace bridge so external work cannot be silently counted as visual parity. The parent’s 19-child phase map and its 11-child D6/6A prose also disagree.

## Proposed text

Add child 020, contextual-sheet-primitives, with DEFINE source rows for record-peek, generic dropdown, and all contextual shared controls; PLAN a stable row/capture/rubric ownership matrix; CREATE shared frame/row/dropdown primitives; SCREENSHOT light/dark full-sheet and depth states; VERIFY each contextual row independently plus the host sheet; REMEDIATE by row ID and unchanged-tree hash.

Add child 021, operator-ruling-traceability, or a parent-level equivalent:

“For roadmap rows 70–94, record one trace row with request ID, owning child, task ID, source path, six-phase lane clause, fixture/capture IDs, and release assertion. Rows 70–88 are dependency or regression guards unless the row explicitly names a 076 visual target. Rows 89–94 are mandatory 076 acceptance clauses. The outer graph count is 19 existing children plus any approved bridge children; no request or inventory row may remain contextual without a named owner.”

Replace every parent “eleven children” phrase with “the 19 mapped children (plus approved bridge children 020/021)” and add COV-001 through COV-094 to the owning task/verification packets.

## Confidence

High for the missing dedicated owner and the 11-versus-19 contradiction; medium for whether the operator wants 020/021 as physical folders or parent-level tasks.

