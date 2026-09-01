# Deep Review Report

## Executive Summary

The detached review packet contains 10 completed iterations under the requested max-iterations policy. Convergence telemetry was non-terminal before the ceiling. Final verdict: **CONDITIONAL** with 0 active P0, 17 active P1, and 5 active P2 findings.

Session: fanout-codex-luna-xhigh-fast-1788178447595-968qzp. Target: specs/005-component-surface-system (spec-folder). Dimensions: correctness=covered, security=covered, traceability=covered, maintainability=covered. Release readiness remains in-progress until active P1 findings are reconciled.

## Planning Trigger

Planning is required because active P1 findings remain. The structured planning packet is derived from reducer-owned findings and iteration deltas.

```json
{
  "triggered": true,
  "verdict": "CONDITIONAL",
  "hasAdvisories": false,
  "activeFindings": [
    {
      "id": "F001",
      "severity": "P1",
      "title": "The parent phase map does not cover the live child set",
      "file": "specs/005-component-surface-system/spec.md:149",
      "findingClass": "scope-coverage",
      "affectedSurfaceHints": [
        "parent phase map",
        "roadmap status"
      ]
    },
    {
      "id": "F002",
      "severity": "P1",
      "title": "Handover validation status contradicts the transition rule",
      "file": "specs/005-component-surface-system/handover.md:52",
      "findingClass": "verification-status",
      "affectedSurfaceHints": [
        "handover",
        "phase transition gate"
      ]
    },
    {
      "id": "F003",
      "severity": "P1",
      "title": "Phase 019 shipped without verification evidence",
      "file": "specs/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:40",
      "findingClass": "missing-proof",
      "affectedSurfaceHints": [
        "card field renderer",
        "number formatting"
      ]
    },
    {
      "id": "F004",
      "severity": "P1",
      "title": "Record-detail listeners are bound through the global active document instead of the panel's owning document",
      "file": "src/views/record-detail-panel.ts:196",
      "findingClass": "cross-window-boundary",
      "affectedSurfaceHints": [
        "record detail panel",
        "popped-out window",
        "dismissal listeners"
      ]
    },
    {
      "id": "F006",
      "severity": "P1",
      "title": "Phase 001's roadmap status is not supported by its phase-local closure artifacts",
      "file": "specs/005-component-surface-system/roadmap.md:296",
      "findingClass": "status-traceability",
      "affectedSurfaceHints": [
        "phase 001",
        "roadmap",
        "checklist"
      ]
    },
    {
      "id": "F007",
      "severity": "P1",
      "title": "The parent requires a live-verification gate before phase 000, but phase 009 has not produced the required evidence",
      "file": "specs/005-component-surface-system/spec.md:192",
      "findingClass": "open-handoff-gate",
      "affectedSurfaceHints": [
        "009 live verification",
        "000 handoff"
      ]
    },
    {
      "id": "F009",
      "severity": "P1",
      "title": "Phase 003's single-predicate contract remains explicitly unimplemented",
      "file": "specs/005-component-surface-system/003-mobile-sheet-presentation/plan.md:87",
      "findingClass": "contract-drift",
      "affectedSurfaceHints": [
        "touch mode",
        "phone sheets",
        "601-760px band"
      ]
    },
    {
      "id": "F010",
      "severity": "P1",
      "title": "Phase 026's commit/provenance state is contradictory across its own summary and the roadmap",
      "file": "specs/005-component-surface-system/026-production-render-assertions/implementation-summary.md:46",
      "findingClass": "provenance-drift",
      "affectedSurfaceHints": [
        "render assertion",
        "reproducibility",
        "roadmap"
      ]
    },
    {
      "id": "F012",
      "severity": "P1",
      "title": "The record-detail panel closes on window resize instead of satisfying the sheet's resize-preservation contract",
      "file": "src/views/record-detail-panel.ts:226",
      "findingClass": "transition-contract",
      "affectedSurfaceHints": [
        "record detail panel",
        "keyboard resize",
        "mobile sheet"
      ]
    },
    {
      "id": "F013",
      "severity": "P1",
      "title": "Sheet placement can compute bounds from the global active document even when the panel belongs to another document",
      "file": "src/views/popover-position.ts:329",
      "findingClass": "document-coordinate-mismatch",
      "affectedSurfaceHints": [
        "sheet geometry",
        "popped-out window",
        "keyboard inset"
      ]
    },
    {
      "id": "F015",
      "severity": "P1",
      "title": "Phase 000's acceptance row still reports four old pinned runtime values although the current harness file says those values were removed and replaced with a different runtime-value policy",
      "file": "specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:116",
      "findingClass": "stale-criterion",
      "affectedSurfaceHints": [
        "pinned values",
        "acceptance criteria"
      ]
    },
    {
      "id": "F016",
      "severity": "P1",
      "title": "The capture-fingerprint criterion requires three harness edits to stale captures, but the current forced input set does not include two of them",
      "file": "specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:128",
      "findingClass": "partial-fingerprint",
      "affectedSurfaceHints": [
        "screenshot freshness",
        "harness inputs"
      ]
    },
    {
      "id": "F017",
      "severity": "P1",
      "title": "The implemented pinned-value scanner no longer enforces the acceptance criterion it is marked as closing",
      "file": "specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:240",
      "findingClass": "criterion-rule-drift",
      "affectedSurfaceHints": [
        "pinned-value scanner",
        "negative controls"
      ]
    },
    {
      "id": "F018",
      "severity": "P1",
      "title": "Phase 026's coverage evidence is stale and internally contradictory",
      "file": "tools/live/renderer-coverage.json:21",
      "findingClass": "coverage-provenance",
      "affectedSurfaceHints": [
        "renderer coverage",
        "phase 026 evidence"
      ]
    },
    {
      "id": "F019",
      "severity": "P1",
      "title": "The handover generalizes renderer-level coverage into host-level coverage that the assertion explicitly excludes",
      "file": "specs/005-component-surface-system/handover.md:53",
      "findingClass": "coverage-boundary",
      "affectedSurfaceHints": [
        "DatabaseView",
        "EmbeddedDatabaseRenderer",
        "operator reports"
      ]
    },
    {
      "id": "F020",
      "severity": "P1",
      "title": "The CSS lane history contains a stylesheet acquisition for phase 001 with no matching release",
      "file": "tools/lane/css-lane.json:638",
      "findingClass": "ownership-provenance",
      "affectedSurfaceHints": [
        "styles.css",
        "phase 001 handoff",
        "capture provenance"
      ]
    },
    {
      "id": "F022",
      "severity": "P1",
      "title": "REQ-007 names thirteen blind modules but its literal widened-matcher run reports fourteen missing modules",
      "file": "specs/005-component-surface-system/verification-audit.md:376",
      "findingClass": "acceptance-control-mismatch",
      "affectedSurfaceHints": [
        "REQ-007",
        "pinned-value scanner",
        "phase closure"
      ]
    },
    {
      "id": "F005",
      "severity": "P2",
      "title": "Mobile-sheet detection mixes an owner document with the global navigator",
      "file": "src/views/popover-position.ts:621",
      "findingClass": "cross-window-boundary",
      "affectedSurfaceHints": [
        "mobile sheet predicate",
        "popped-out window"
      ]
    },
    {
      "id": "F008",
      "severity": "P2",
      "title": "The adversarial review carries a historical nine-child target without a current-scope qualifier",
      "file": "specs/005-component-surface-system/adversarial-review.md:13",
      "findingClass": "historical-scope",
      "affectedSurfaceHints": [
        "adversarial review",
        "review coverage"
      ]
    },
    {
      "id": "F011",
      "severity": "P2",
      "title": "The shared surface registry has an unproven equality boundary",
      "file": "src/views/surface-contract.ts:224",
      "findingClass": "partial-registry",
      "affectedSurfaceHints": [
        "surface registry",
        "producer census"
      ]
    },
    {
      "id": "F014",
      "severity": "P2",
      "title": "Anchor lease fallback timeout has no evidence-backed budget for asynchronous rebuilds",
      "file": "src/views/anchor-ref.ts:53",
      "findingClass": "unbounded-async-budget",
      "affectedSurfaceHints": [
        "anchor lease",
        "async refresh"
      ]
    },
    {
      "id": "F021",
      "severity": "P2",
      "title": "Capture churn and sign-off remain only partially attributable",
      "file": "tools/lane/css-lane.json:637",
      "findingClass": "capture-evidence-completeness",
      "affectedSurfaceHints": [
        "PNG captures",
        "release sign-off",
        "device confirmation"
      ]
    }
  ],
  "remediationWorkstreams": [
    "Reconcile parent/phase status, strict-validation claims, and live-verification gates.",
    "Align acceptance criteria, scanners, capture fingerprints, coverage counts, and requirement controls.",
    "Fix or explicitly contract document-local runtime ownership and resize/anchor behavior.",
    "Close CSS-lane provenance and complete capture evidence."
  ],
  "specSeed": [
    "Publish one authoritative phase/status inventory.",
    "Make acceptance controls name the exact experiment and result."
  ],
  "planSeed": [
    "Reconcile P1 status/evidence contradictions first.",
    "Address runtime ownership and harness coverage seams.",
    "Re-run scoped evidence checks after changes."
  ],
  "findingClasses": [
    "scope-coverage",
    "verification-status",
    "missing-proof",
    "cross-window-boundary",
    "status-traceability",
    "open-handoff-gate",
    "contract-drift",
    "provenance-drift",
    "transition-contract",
    "document-coordinate-mismatch",
    "stale-criterion",
    "partial-fingerprint",
    "criterion-rule-drift",
    "coverage-provenance",
    "coverage-boundary",
    "ownership-provenance",
    "acceptance-control-mismatch",
    "historical-scope",
    "partial-registry",
    "unbounded-async-budget",
    "capture-evidence-completeness"
  ],
  "affectedSurfacesSeed": [
    "parent phase map",
    "roadmap status",
    "handover",
    "phase transition gate",
    "card field renderer",
    "number formatting",
    "record detail panel",
    "popped-out window",
    "dismissal listeners",
    "phase 001",
    "roadmap",
    "checklist",
    "009 live verification",
    "000 handoff",
    "touch mode",
    "phone sheets",
    "601-760px band",
    "render assertion",
    "reproducibility",
    "keyboard resize",
    "mobile sheet",
    "sheet geometry",
    "keyboard inset",
    "pinned values",
    "acceptance criteria",
    "screenshot freshness",
    "harness inputs",
    "pinned-value scanner",
    "negative controls",
    "renderer coverage",
    "phase 026 evidence",
    "DatabaseView",
    "EmbeddedDatabaseRenderer",
    "operator reports",
    "styles.css",
    "phase 001 handoff",
    "capture provenance",
    "REQ-007",
    "phase closure",
    "mobile sheet predicate",
    "adversarial review",
    "review coverage",
    "surface registry",
    "producer census",
    "anchor lease",
    "async refresh",
    "PNG captures",
    "release sign-off",
    "device confirmation"
  ],
  "fixCompletenessRequired": false
}
```

## Active Finding Registry

- **F001 — P1 — The parent phase map does not cover the live child set** — [SOURCE: specs/005-component-surface-system/spec.md:149] The parent declares twenty phase folders but omits rows 020-028; the roadmap says those phases exist. Recommendation: Reconcile the parent phase map with every live child or formally exclude the omitted phases. Class: scope-coverage; affected surfaces: parent phase map, roadmap status.
- **F002 — P1 — Handover validation status contradicts the transition rule** — [SOURCE: specs/005-component-surface-system/handover.md:52] Handover says parent strict validation is clean while the parent says every child fails strict validation. Recommendation: Publish one dated, scope-matched validation status and reconcile child results before release claims. Class: verification-status; affected surfaces: handover, phase transition gate.
- **F003 — P1 — Phase 019 shipped without verification evidence** — [SOURCE: specs/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:40] The phase summary says code landed but no verification exists and criteria remain unmet. Recommendation: Run and record formatter parity and acceptance evidence against the shipped tree before closure. Class: missing-proof; affected surfaces: card field renderer, number formatting.
- **F004 — P1 — Record-detail listeners are bound through the global active document instead of the panel's owning document** — [SOURCE: src/views/record-detail-panel.ts:196] Registration and cleanup use window.activeDocument and window, unlike the owned-menu path which derives event.view.document. Recommendation: Derive the document and window from host.ownerDocument/panel.ownerDocument and keep registration, cleanup, and focus in that realm. Class: cross-window-boundary; affected surfaces: record detail panel, popped-out window, dismissal listeners.
- **F006 — P1 — Phase 001's roadmap status is not supported by its phase-local closure artifacts** — [SOURCE: specs/005-component-surface-system/roadmap.md:296] Roadmap says 001 is shipped and verified, while local spec/summary/checklist remain In Progress, 0/67 and unchecked. Recommendation: Reconcile phase-local status, checklist, summary, and acceptance evidence to the same shipped tree. Class: status-traceability; affected surfaces: phase 001, roadmap, checklist.
- **F007 — P1 — The parent requires a live-verification gate before phase 000, but phase 009 has not produced the required evidence** — [SOURCE: specs/005-component-surface-system/spec.md:192] The handoff requires a defect reproduced in the running app; 009 records only one of three transport legs and an unmet citation audit. Recommendation: Complete and record 009's required live evidence before treating the 009-to-000 handoff as satisfied. Class: open-handoff-gate; affected surfaces: 009 live verification, 000 handoff.
- **F009 — P1 — Phase 003's single-predicate contract remains explicitly unimplemented** — [SOURCE: specs/005-component-surface-system/003-mobile-sheet-presentation/plan.md:87] The plan requires one exported predicate, while the implementation summary says both symbols remain live and disagree in the 601-760px band. Recommendation: Unify the predicate or amend the contract to define and test two policies before treating phase 003 as shipped. Class: contract-drift; affected surfaces: touch mode, phone sheets, 601-760px band.
- **F010 — P1 — Phase 026's commit/provenance state is contradictory across its own summary and the roadmap** — [SOURCE: specs/005-component-surface-system/026-production-render-assertions/implementation-summary.md:46] Phase summary says committed at 1bac3c2 while roadmap says no commit and working tree holds the check; N5 is still pending. Recommendation: Reconcile parent and phase provenance to one commit/tree and record the clean N5 result or open status consistently. Class: provenance-drift; affected surfaces: render assertion, reproducibility, roadmap.
- **F012 — P1 — The record-detail panel closes on window resize instead of satisfying the sheet's resize-preservation contract** — [SOURCE: src/views/record-detail-panel.ts:226] onResize calls close whenever the body is not editing, while AC-003 requires an open sheet to survive resize. Recommendation: Preserve and reposition a sheet on resize; keep close behavior only for presentation states that require it. Class: transition-contract; affected surfaces: record detail panel, keyboard resize, mobile sheet.
- **F013 — P1 — Sheet placement can compute bounds from the global active document even when the panel belongs to another document** — [SOURCE: src/views/popover-position.ts:329] placeSheet's default bounds call reaches getVisiblePopoverBounds(null), which selects window.activeDocument. Recommendation: Resolve bounds from panel.ownerDocument/defaultView or pass owner-scoped bounds at every sheet call. Class: document-coordinate-mismatch; affected surfaces: sheet geometry, popped-out window, keyboard inset.
- **F015 — P1 — Phase 000's acceptance row still reports four old pinned runtime values although the current harness file says those values were removed and replaced with a different runtime-value policy** — [SOURCE: specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:116] Acceptance reports four pins while runtime-vars reports five removed values and tasks record a changed scan rule. Recommendation: Separate the dated baseline from current results and reconcile the acceptance population. Class: stale-criterion; affected surfaces: pinned values, acceptance criteria.
- **F016 — P1 — The capture-fingerprint criterion requires three harness edits to stale captures, but the current forced input set does not include two of them** — [SOURCE: specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:128] CAPTURE_INPUTS includes runtime-vars, scenarios and capture, but not preview.ts or verify-placement.mjs. Recommendation: Reconcile the criterion with actual capture dependencies or fingerprint the named files. Class: partial-fingerprint; affected surfaces: screenshot freshness, harness inputs.
- **F017 — P1 — The implemented pinned-value scanner no longer enforces the acceptance criterion it is marked as closing** — [SOURCE: specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:240] AC-016 requires one property population while T4a closes a different rule and explicitly says the old rule was changed. Recommendation: Rewrite or supersede AC-016 with the implemented rule and a matching negative control. Class: criterion-rule-drift; affected surfaces: pinned-value scanner, negative controls.
- **F018 — P1 — Phase 026's coverage evidence is stale and internally contradictory** — [SOURCE: tools/live/renderer-coverage.json:21] Stamped artifact says 6 constructed while phase acceptance and summary say 2 of 22; current scenario list names six renderer families. Recommendation: Reconcile the stamp and phase prose to one dated authoritative coverage count. Class: coverage-provenance; affected surfaces: renderer coverage, phase 026 evidence.
- **F019 — P1 — The handover generalizes renderer-level coverage into host-level coverage that the assertion explicitly excludes** — [SOURCE: specs/005-component-surface-system/handover.md:53] Handover says every reported view is asserted while phase 026 excludes DatabaseView and EmbeddedDatabaseRenderer host construction. Recommendation: Add host-level scenarios or narrow the handover claim and link excluded-host status. Class: coverage-boundary; affected surfaces: DatabaseView, EmbeddedDatabaseRenderer, operator reports.
- **F020 — P1 — The CSS lane history contains a stylesheet acquisition for phase 001 with no matching release** — [SOURCE: tools/lane/css-lane.json:638] The outstanding record says phase 001 acquired the lane a second time and made four edits, with no release event; the live holder is null while the lane contract requires history to answer ownership and baseline provenance. Recommendation: Add a matching release or explicit supersession event with baseline and current stylesheet hashes, then reconcile the history. Class: ownership-provenance; affected surfaces: styles.css, phase 001 handoff, capture provenance.
- **F022 — P1 — REQ-007 names thirteen blind modules but its literal widened-matcher run reports fourteen missing modules** — [SOURCE: specs/005-component-surface-system/verification-audit.md:376] The audit distinguishes the 13 newly revealed modules from the 14 modules reported missing on the tree as received and says the un-skippable control used a substitute run. Recommendation: Change REQ-007 to require the 14-module literal result or explicitly require the 13-module set-difference run, then link the resulting control to phase closure. Class: acceptance-control-mismatch; affected surfaces: REQ-007, pinned-value scanner, phase closure.
- **F005 — P2 — Mobile-sheet detection mixes an owner document with the global navigator** — [SOURCE: src/views/popover-position.ts:621] isMobileBottomSheet receives a document but reads maxTouchPoints from the global navigator. Recommendation: Read touch-point capability from the owner document's defaultView navigator or define the global realm as an explicit contract. Class: cross-window-boundary; affected surfaces: mobile sheet predicate, popped-out window.
- **F008 — P2 — The adversarial review carries a historical nine-child target without a current-scope qualifier** — [SOURCE: specs/005-component-surface-system/adversarial-review.md:13] The review says all nine children although the parent and roadmap now describe later phase generations. Recommendation: Mark the historical scope as-of-date or link a current review inventory. Class: historical-scope; affected surfaces: adversarial review, review coverage.
- **F011 — P2 — The shared surface registry has an unproven equality boundary** — [SOURCE: src/views/surface-contract.ts:224] The type-closed registry declares five producers while the phase inventory describes 33 positioner call sites and 11 owned menus. Recommendation: Complete the census-to-registry equality check or mark the remaining producers as intentionally outside the registry. Class: partial-registry; affected surfaces: surface registry, producer census.
- **F014 — P2 — Anchor lease fallback timeout has no evidence-backed budget for asynchronous rebuilds** — [SOURCE: src/views/anchor-ref.ts:53] Default pending timeout is 250ms, but no inspected phase evidence establishes the slowest replacement-anchor latency. Recommendation: Measure the rebuild latency or make the timeout a documented host contract with a transition test. Class: unbounded-async-budget; affected surfaces: anchor lease, async refresh.
- **F021 — P2 — Capture churn and sign-off remain only partially attributable** — [SOURCE: tools/lane/css-lane.json:637] The outstanding record says only 5 of 19 changed images have individual verdicts, 14 are under one bulk expected-change line, and all verdicts are assistant readings while device confirmation remains outstanding. Recommendation: Attach per-image verdicts and the required device confirmation, or explicitly preserve the unresolved evidence boundary in the release gate. Class: capture-evidence-completeness; affected surfaces: PNG captures, release sign-off, device confirmation.

## Remediation Workstreams

1. Reconcile parent/phase status, strict-validation claims, and live-verification gates.
2. Align acceptance criteria, scanners, capture fingerprints, coverage counts, and requirement controls.
3. Fix or explicitly contract document-local runtime ownership and resize/anchor behavior.
4. Close CSS-lane provenance and complete capture evidence.

## Spec Seed

- Publish one authoritative phase/status inventory with dated evidence.
- Make each acceptance control name the exact experiment, expected result, and closure artifact.
- State document/window ownership and production-render coverage boundaries explicitly.

## Plan Seed

- Reconcile P1 status and evidence contradictions first.
- Address runtime ownership and harness coverage seams.
- Re-run scoped evidence checks after the planned changes.

## Traceability Status

- Core spec_code: partial/fail evidence appears in the state log across the 10 passes; unresolved P1 contradictions remain.
- Core checklist_evidence: partial/fail evidence appears in the state log; checked claims remain incompletely supported.
- Overlay feature_catalog_code: not applicable to the dominant findings in this spec-folder run.
- Overlay playbook_capability: not applicable to the dominant findings in this spec-folder run.
- AC_COVERAGE: advisory context only; no repo validator was run because the requested lineage write surface forbids it.

## Deferred Items

- F005: Mobile-sheet detection mixes an owner document with the global navigator — [SOURCE: src/views/popover-position.ts:621]
- F008: The adversarial review carries a historical nine-child target without a current-scope qualifier — [SOURCE: specs/005-component-surface-system/adversarial-review.md:13]
- F011: The shared surface registry has an unproven equality boundary — [SOURCE: src/views/surface-contract.ts:224]
- F014: Anchor lease fallback timeout has no evidence-backed budget for asynchronous rebuilds — [SOURCE: src/views/anchor-ref.ts:53]
- F021: Capture churn and sign-off remain only partially attributable — [SOURCE: tools/lane/css-lane.json:637]
- Resource-map coverage gate skipped because resource-map.md was absent at initialization.

## Dimension Expansion Map

- Completed pivots: 0; failed pivots: 0; audited overrides: 0.
- Covered directions: correctness, security, traceability, maintainability, plus runtime geometry, modality dismissal, evidence freshness, production-render coverage, CSS provenance, and final requirement reconciliation.
- Remaining frontier: active P1 remediation and post-fix evidence replay.

## Search Ledger

- Graph coverage mode: graphless fallback, required by the lineage-only write-surface constraint.
- Search debt: none recorded in the retained reducer state.
- Ruled-out directions and per-iteration search coverage are retained in the 10 iteration deltas.

## Audit Appendix

- Stop reason: maxIterationsReached; iterations: 10; configured maxIterations: 10; convergenceThreshold: 0.1; stopPolicy: max-iterations.
- Executor: cli-codex model=gpt-5.6-luna, reasoningEffort=xhigh, serviceTier=fast, sandbox=workspace-write.
- Dimension coverage: correctness, security, traceability, and maintainability all covered.
- State/config/registry/dashboard/strategy, 10 iteration narratives, 10 deltas, and dispatch receipts are present under this lineage.
- Core Protocols: spec_code and checklist_evidence were exercised; unresolved drift is reflected in active findings.
- Overlay Protocols: feature_catalog_code and playbook_capability were considered and marked not applicable where unsupported by the focused evidence.
- Continuity save, validate.sh, graph upsert, and Git writes were intentionally omitted to preserve the user-specified lineage-only write surface.

Review verdict: CONDITIONAL
