---
title: "Implementation Plan: List Usage and Migration Audit"
description: "Enumerate the list from three independent directions — source grep, the gate lane list, and the capture manifest — so a path missed by one is caught by another, then decide the migration target and write the data-loss list."
trigger_phrases:
  - "list audit plan"
  - "list enumeration"
  - "migration target decision"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: List Usage and Migration Audit

<!-- SPECKIT_LEVEL: 1 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, read-only |
| **Framework** | None |
| **Storage** | None written. `viewType` in vault view configs is what is being audited |
| **Testing** | None. This phase produces evidence, not behaviour |

### Overview

Enumerate from three directions that fail differently. A source grep finds branches and misses
harness code that references the view by string. The gate's lane list finds measurement surfaces and
misses source. The capture manifest finds photographed states and misses both. A path missed by one
is caught by another, and the three counts are reported separately rather than merged, so a
disagreement between them is visible instead of averaged away.

Then one decision — the migration target — and one list: every list-only affordance with no table
equivalent.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Three-direction enumeration, then a decision. The same shape `030` used before it wrote
`gallery-migration.ts`, with the counts kept separate rather than summed.

### Key Components
- **Source enumeration**: `rg -n '"list"' src`, the callers of `list-renderer.ts`, and every
  `ViewConfig` field only the list reads (`listCompactFields` is the known one).
- **Measurement enumeration**: `tools/gate.mjs`'s lane list, `tools/live/list-window.*`,
  `renderer-coverage.json`'s pinned inputs, `tools/live/replay.mjs`'s claims, and the `list` /
  `list-sparse` entries in `tools/screenshots/constructed-scenarios.mjs`.
- **Capture enumeration**: `screenshots/manifest.json` entries whose scenario names the list.
- **The decision**: migration target, with the reasoning, written where `006` will read it.

### Data Flow

None changes. The audit reads the tree and writes one document.
<!-- /ANCHOR:architecture -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

N/A by design. This phase changes no behaviour, so there is nothing to test. Its own correctness is
checked by `006` and `007` not finding anything it missed — which is why SC-001 and SC-002 are
phrased as *absence of surprises downstream* rather than as a count.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`030-gallery-view-deprecation` as a precedent, and nothing else. Nothing blocks this phase.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

N/A. A read-only phase has nothing to roll back; reverting its commit removes a document.
<!-- /ANCHOR:rollback -->

---

