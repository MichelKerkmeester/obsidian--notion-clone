---
title: "Implementation Plan: Card Field Value Formatting"
description: "How the card field renderer was routed onto the shared formatters, and the verification that has not been built."
trigger_phrases:
  - "019 plan"
  - "card field formatting plan"
importance_tier: "normal"
contextType: "planning"
---
# Implementation Plan: Card Field Value Formatting

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

The eleven-line code change has landed. Nothing else has: no test, no parity check, no operator
confirmation, and no decision on the scope exclusion it crosses.

The remaining work is small and is mostly about building the check that would have caught this in the
first place.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Bar |
|---|---|---|
| Formatter tests | `npx vitest run src/data/euro-format.test.ts` | Exit 0, three functions covered |
| Parity check | `npm run storybook:placement` | Zero card-vs-cell disagreements |
| Phase gate | `SURFACE_PHASE=019 npm run gate` | Exit 0 |
| Unit | `npx vitest run` | Exit 0, count increases by the new tests |

This is the one phase in the program where the unit suite is real evidence, because the subject is a
pure function rather than a rendered surface.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

There is no architecture to choose. A shared module already existed, four surfaces already used it,
and one did not. The fix is to remove the exception.

The interesting question is why the exception survived. `renderCardFieldValue` reaches its numeric
text branch only after the progress-bar and ring display styles have returned, so the branch is
easy to read as a fallback rather than as the main path for every plain number and every currency
column. It is the main path.

The design consequence for the check: assert **agreement between two renderers**, not conformance to
a literal string. A literal passes while the other renderer drifts, and drift between two renderers
of the same value is exactly what the operator reported.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. **Landed.** `card-field-renderer.ts` imports the two formatters and routes the finite-numeric
   branch through them, currency to `formatEuroCurrency` and everything else to `formatEuroNumber`.
2. **Outstanding.** Create `src/data/euro-format.test.ts`. Three functions, three cases each.
3. **Outstanding.** Add the card-versus-cell parity check to the placement harness, and observe it
   red by reverting step 1.
4. **Outstanding.** Take the scope-exclusion question to the operator.
5. **Outstanding.** Operator confirmation on device.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Two layers, doing different jobs.

The unit test pins what the formatters produce, so a locale or `Intl` option change cannot alter
every number in the plugin silently. It does not prove any surface calls them.

The parity check proves the surfaces agree. It must drive both renderers on the same record and
compare the rendered text, and it must be shown failing with step 1 reverted — otherwise it is a
check that passes because both sides are wrong in the same way.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | State |
|---|---|
| `src/data/euro-format.ts` | Present and unmodified. A declared local fork override pinned to `nl-NL`. |
| `010-sheet-reading-and-keyboard` | Its criteria measure text rectangles in rows built by this renderer. A longer formatted string can move one. Re-run after this lands. |
| `styles.css` lane | Not needed. This phase makes no stylesheet edit. |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Remove the import and the guarded branch from `card-field-renderer.ts`. Eleven lines, one file, no
stylesheet involvement and no capture churn. Rolling back restores the reported defect.
<!-- /ANCHOR:rollback -->
