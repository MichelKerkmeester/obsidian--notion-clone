# Review Report — Component Surface System (fan-out lineage cursor-grok46-xhigh-fast)

Lineage: `fanout-cursor-grok46-xhigh-fast-1788178447595-968qzp`
Target: `specs/005-component-surface-system` (spec-folder)
Executor: cli-cursor / cursor-grok-4.6-xhigh-fast
Stop policy: max-iterations (10/10). Convergence is telemetry only.
Generated: 2026-08-31T12:21:00.000Z

## Executive Summary

- **Verdict: FAIL**
- **hasAdvisories:** false
- **Active findings:** P0=1, P1=7, P2=7 (resolved=0)
- **hasSearchDebt:** true (deferred 027 operator-device row; does not change FAIL while F001 is active)
- **Release readiness:** `release-blocking`
- **Scope:** Phase parent `005-component-surface-system` (29 children with `spec.md`: `000`–`006`, `008`–`029`) plus production files those packets name: `src/views/database-view.ts`, `src/views/board-renderer.ts`, `src/views/gallery-renderer.ts`, `src/views/surface-contract.ts`, `src/data/cover-image.ts`, `src/data/text-link.ts`, `styles.css`, `tools/live/probe.mjs`.
- **Why FAIL:** Active P0 F001 remains after an adversarial replay (iteration 9). Board and gallery cover clicks still `window.open` a parsed `javascript:` / `data:` target when the cover column is not `files`.
- **Coverage:** correctness, security, traceability, maintainability all visited. Core protocols `spec_code` and `checklist_evidence` both fail. Overlays `feature_catalog_code` and `playbook_capability` fail (advisory). `skill_agent` and `agent_cross_runtime` are notApplicable.
- **Stop reason:** `max-iterations` ceiling reached (iteration 10). Latest ratios 0.20 → 0.50 → 0.08; `convergenceScore` 0.92 is telemetry, not a legal stop.
- **AC_COVERAGE:** exempt — parent `checklist.md` is absent, so the Level-2+ lifecycle predicate does not fire.

## Planning Trigger

`/speckit:plan` is required. FAIL with an active P0 cannot route to changelog.

Planning Packet:

```json
{
  "triggered": true,
  "verdict": "FAIL",
  "hasAdvisories": false,
  "hasSearchDebt": true,
  "releaseReadinessState": "release-blocking",
  "stopReason": "max-iterations",
  "activeFindings": [
    {"findingId": "F001", "severity": "P0", "dimension": "security", "findingClass": "unsafe-scheme-open", "file": "src/views/board-renderer.ts:971", "title": "Non-files cover fields open javascript and data scheme targets via window.open"},
    {"findingId": "F002", "severity": "P1", "dimension": "correctness", "findingClass": "state-transition", "file": "src/views/database-view.ts:11484", "title": "Sort and filter mutations still destroy and rebuild every view"},
    {"findingId": "F003", "severity": "P1", "dimension": "correctness", "findingClass": "spec-code-drift", "file": "specs/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:59", "title": "Child 000 still specifies deleted openSurface as the create path"},
    {"findingId": "F004", "severity": "P1", "dimension": "traceability", "findingClass": "inventory-gap", "file": "specs/005-component-surface-system/spec.md:69", "title": "Parent phase map is incomplete and under-counts folders"},
    {"findingId": "F005", "severity": "P1", "dimension": "maintainability", "findingClass": "playbook-capability", "file": "specs/005-component-surface-system/009-live-verification/implementation-summary.md:48", "title": "009 never drove the running Obsidian so the circular harness remains in force"},
    {"findingId": "F006", "severity": "P1", "dimension": "traceability", "findingClass": "checklist-evidence", "file": "specs/005-component-surface-system/004-checkbox-ownership/checklist.md:31", "title": "Completion marks and parent evidence are missing or unchecked"},
    {"findingId": "F007", "severity": "P1", "dimension": "correctness", "findingClass": "spec-code-drift", "file": "specs/005-component-surface-system/spec.md:133", "title": "Parent lists 006 as Planned while the child is in progress without the resolver"},
    {"findingId": "F013", "severity": "P1", "dimension": "traceability", "findingClass": "feature-catalog-gap", "file": "src/views/surface-contract.ts:224", "title": "SURFACE_REGISTRY names five producers and omits live panels"}
  ],
  "remediationWorkstreams": [
    {"id": "WS-P0-cover-scheme", "priority": 0, "findingIds": ["F001", "F010"], "title": "Allowlist http(s) on cover parse and click; add noopener"},
    {"id": "WS-P1-freeze", "priority": 1, "findingIds": ["F002", "F009"], "title": "Stop sort/filter from tearing down every view root"},
    {"id": "WS-P1-contract", "priority": 1, "findingIds": ["F003", "F011", "F013", "F015"], "title": "Align 000 and SURFACE_REGISTRY with the shipped tree"},
    {"id": "WS-P1-map-evidence", "priority": 1, "findingIds": ["F004", "F006", "F007", "F014"], "title": "Repair parent inventory, 006 status, and checklist evidence"},
    {"id": "WS-P1-live-probe", "priority": 1, "findingIds": ["F005"], "title": "Drive 009 against a running Obsidian and record a real artefact"},
    {"id": "WS-P2-docs", "priority": 2, "findingIds": ["F008", "F012"], "title": "Refresh stale constants and scaffold claims"}
  ],
  "specSeed": [
    "Rewrite 000 so SURFACE_REGISTRY is the create path and src/views/surface.ts is not a deliverable (F003).",
    "Replace parent spec.md 'Twenty phase folders' and complete PHASE DOCUMENTATION MAP for 000-029 (F004).",
    "Align 006 parent status with the child In-progress / unshipped resolver (F007).",
    "Drop leftover factory overlay language at spec.md:235 (F011).",
    "Census live producers into SURFACE_REGISTRY or narrow 000 (F013)."
  ],
  "planSeed": [
    "P0: parseCoverImage returns null for non-http(s); board/gallery click refuses non-http(s); regression covers javascript:alert(1).png on a text cover column (F001).",
    "P1: sort add-rule and filter-close no longer call DatabaseView.refresh teardown (F002).",
    "P1: record an exit-0 009 live probe with before/after numbers (F005).",
    "P1: parent checklist.md with evidenced rows; 004 B1-B6 marked from the census (F006)."
  ],
  "findingClasses": [
    "unsafe-scheme-open",
    "state-transition",
    "spec-code-drift",
    "inventory-gap",
    "playbook-capability",
    "checklist-evidence",
    "feature-catalog-gap",
    "stale-constant",
    "stale-citation",
    "tabnabbing",
    "stale-prose",
    "stale-status",
    "stale-comment"
  ],
  "affectedSurfacesSeed": [
    "board-cover",
    "gallery-cover",
    "cover-image",
    "database-view.refresh",
    "sort-panel",
    "filter-panel",
    "surface-contract",
    "SURFACE_REGISTRY",
    "009-live-verification",
    "parent-spec-map",
    "004-checklist",
    "record-open-target",
    "popover-position"
  ],
  "fixCompletenessRequired": true
}
```

## Active Finding Registry

| ID | Sev | Dim | Title | Evidence | Class | First/Last | Disposition |
|----|-----|-----|-------|----------|-------|------------|-------------|
| F001 | P0 | security | Non-files cover fields open javascript and data scheme targets via window.open | `src/views/board-renderer.ts:971` | unsafe-scheme-open | 3 / 9 | active |
| F002 | P1 | correctness | Sort and filter mutations still destroy and rebuild every view | `src/views/database-view.ts:11484` | state-transition | 1 / 1 | active |
| F003 | P1 | correctness | Child 000 still specifies deleted openSurface as the create path | `000-.../spec.md:59` | spec-code-drift | 2 / 2 | active |
| F004 | P1 | traceability | Parent phase map is incomplete and under-counts folders | `spec.md:69` | inventory-gap | 4 / 4 | active |
| F005 | P1 | maintainability | 009 never drove the running Obsidian so the circular harness remains in force | `009/.../implementation-summary.md:48` | playbook-capability | 8 / 8 | active |
| F006 | P1 | traceability | Completion marks and parent evidence are missing or unchecked | `004/.../checklist.md:31` | checklist-evidence | 5 / 5 | active |
| F007 | P1 | correctness | Parent lists 006 as Planned while the child is in progress without the resolver | `spec.md:133` | spec-code-drift | 2 / 2 | active |
| F013 | P1 | traceability | SURFACE_REGISTRY names five producers and omits live panels | `src/views/surface-contract.ts:224` | feature-catalog-gap | 6 / 6 | active |
| F008 | P2 | maintainability | Parent styles.css length is stale | `spec.md:259` | stale-constant | 7 / 7 | active |
| F009 | P2 | maintainability | 028 cites refresh at line 11421 | `028-remaining-freezes/spec.md:53` | stale-citation | 7 / 7 | active |
| F010 | P2 | security | External window.open calls omit noopener | `src/views/board-renderer.ts:1409` | tabnabbing | 3 / 3 | active |
| F011 | P2 | traceability | Parent still narrates the deleted factory as the overlay sequence | `spec.md:235` | stale-prose | 4 / 4 | active |
| F012 | P2 | maintainability | Parent says 010-017 lack plan.md | `spec.md:157` | stale-prose | 7 / 7 | active |
| F014 | P2 | maintainability | Parent still labels 004 Contested after roadmap 7.1 resolved it | `spec.md:132` | stale-status | 10 / 10 | active |
| F015 | P2 | maintainability | popover-position still documents openSurface.place() after the factory was deleted | `src/views/popover-position.ts:177` | stale-comment | 10 / 10 | active |

### F001 (P0)

- **Claim:** A `javascript:` cover value that ends with an image extension is parsed as an external image and opened with `window.open` on board and gallery cover click when the cover column is not type `files`.
- **Evidence:** `src/data/cover-image.ts:56-72`; `src/data/cover-image.ts:107-108` (`isCoverImageBlocked` is files-only); `src/data/cover-image.test.ts:128-160` documents `javascript:alert(1).png` as external and unblocked for a text column; `src/views/board-renderer.ts:969-971`; `src/views/gallery-renderer.ts:615-719`. Contrast: `src/data/text-link.ts:71` `normalizeExplicitLinkTarget` rejects non-http(s).
- **Impact:** User-controlled frontmatter can induce a scheme open in the Obsidian/Electron shell.
- **Fix:** Allowlist http(s) in `parseCoverImage` / cover click; add a click-path regression. Pass `noopener,noreferrer` (F010).
- **scopeProof:** Re-read parse/block, tests 128-160, board click, gallery guard and `openTarget`.
- **affectedSurfaceHints:** board-cover, gallery-cover, cover-image
- **Adversarial (iteration 9):** Hunter re-read cited lines plus gallery. Skeptic: click + frontmatter required; Electron `javascript:` policy unmeasured. Referee kept P0.

### F002 (P1)

- **Claim:** `DatabaseView.refresh()` still removes every top-level view root then `render()`, and sort-panel add-rule plus header-popover dismissal still call that path.
- **Evidence:** `src/views/database-view.ts:11484-11502`; `src/views/sort-panel-renderer.ts:81-88`; `database-view.ts:2833`.
- **Fix:** Incremental rules-apply that does not teardown `:scope` view roots.
- **scopeProof:** Read refresh body and add-sort onclick; `dismissalNeedsRebuild` still calls `refresh()`.

### Remaining P1

- **F003:** 000 REQ-001 (`000/spec.md:306`) and files table (`:242`) still require `src/views/surface.ts` / `openSurface()`. Glob finds no `surface.ts`. Parent `spec.md:225` records the deletion. Shipped contract is `SURFACE_REGISTRY` at `surface-contract.ts:224`.
- **F004:** Parent says twenty phase folders (`spec.md:69`); map stops at 019 with a note that 020–028 rows are missing (`spec.md:145-151`). Tree has 29 child `spec.md` files.
- **F005:** 009 implementation-summary:48 — transport built, 1 of 13 criteria Met vacuously, app never driven. Parent `spec.md:248-253` agrees. Circular harness 009 was meant to break remains in force.
- **F006:** No parent `checklist.md`. 004 B1–B6 still `[ ]` while continuity claims 211/211.
- **F007:** Parent map Planned for 006 (`spec.md:133`); child In progress (`006/spec.md:78`); resolver/setting unshipped.
- **F013:** `SURFACE_REGISTRY` keys: column-menu, owned-menu, record-detail-panel, filter-panel, date-value-picker. Sort, column manager, view-config, add-view, board covers are live without a row.

## Remediation Workstreams

1. **WS-P0-cover-scheme** — F001, F010. Blocker. Scheme allowlist + click refusal + noopener.
2. **WS-P1-freeze** — F002, F009. Sort/filter must stop calling the full teardown; retarget 028's line citation.
3. **WS-P1-contract** — F003, F011, F013, F015. Rewrite 000 and leftover factory prose/comments; census `SURFACE_REGISTRY`.
4. **WS-P1-map-evidence** — F004, F006, F007, F014. Complete the parent map, parent checklist, 006 status.
5. **WS-P1-live-probe** — F005. Drive 009 and record a real artefact before claiming 000 harness truth.
6. **WS-P2-docs** — F008, F012. Refresh stale constants and scaffold claims.

## Spec Seed

- Rewrite 000 so `SURFACE_REGISTRY` is the create path and `src/views/surface.ts` is not a deliverable.
- Replace parent "Twenty phase folders" and list `000`–`029` with current status, including `020`–`028`.
- Align 006 parent status with the child In-progress / unshipped resolver.
- Drop leftover factory overlay language at `spec.md:235`.
- Census live producers into `SURFACE_REGISTRY` or explicitly narrow 000.

## Plan Seed

- P0: `parseCoverImage` returns null for non-http(s); board/gallery click refuses non-http(s); regression covers `javascript:alert(1).png` on a text cover column.
- P1: sort add-rule and filter-close no longer call `DatabaseView.refresh` teardown.
- P1: record an exit-0 009 live probe with before/after numbers.
- P1: parent `checklist.md` with evidenced rows; 004 B1–B6 marked from the census.

## Traceability Status

### Core Protocols

| Protocol | Status | Evidence | Unresolved |
|----------|--------|----------|------------|
| `spec_code` | fail | 000 still names `openSurface`; parent inventory false; 006 status disagrees; leftover factory prose | F003, F004, F007, F011 |
| `checklist_evidence` | fail | Parent `checklist.md` absent; 004 B-rows unchecked | F006 |

### Overlay Protocols

| Protocol | Status | Evidence | Unresolved |
|----------|--------|----------|------------|
| `skill_agent` | notApplicable | spec-folder target | — |
| `agent_cross_runtime` | notApplicable | spec-folder target | — |
| `feature_catalog_code` | fail | `SURFACE_REGISTRY` five keys vs live panels | F013 |
| `playbook_capability` | fail | 009 never drove the running app | F005 |
| `AC_COVERAGE` | exempt | Parent checklist absent; lifecycle predicate does not fire | — |

Resource-map.md was not present at init; the Resource Map Coverage Gate section is skipped.

## Deferred Items

- F008, F009, F010, F011, F012, F014, F015 — P2 advisories. Do not block FAIL (P0 already does).
- 027 operator-device row: packet already records 13 of 14 criteria met; remaining row is an operator pass, not a new P1. Logged as search debt SL-010.
- Graph upsert and `generate-context.js` continuity save were skipped because they write outside this lineage directory.

## Dimension Expansion Map

- Completed pivots: 0
- Failed pivots: 0
- Audited overrides: 0
- Swept: none
- Pivot lineage: none
- Remaining frontier: live Obsidian drive of 009; 027 operator device pass; incremental refresh path for sort/filter

This section records breadth only. It does not alter the Executive Summary verdict.

## Search Ledger

- **hasSearchDebt:** true
- graphCoverageMode: `graphless_fallback` (coverage graph upsert skipped — out of lineage write surface)
- candidateCoverage: covered=8, ruledOut=1, deferred=1, blocked=0
- searchDebt: SL-010 stale_status deferred — 027 operator row is expected remaining work, not a new P1
- ruledOutCandidates: SL-009 "only board is affected" — gallery shares the hole; F001 refined not replaced
- Dashboard verdict stays FAIL because active P0 F001 remains (search debt would otherwise promote CONDITIONAL)

## Audit Appendix

### Convergence

- stopPolicy: max-iterations
- Iterations: 10/10
- Ratios: 0.45, 0.41, 0.62, 0.28, 0.22, 0.18, 0.12, 0.20, 0.50, 0.08
- Last 3: 0.20 → 0.50 → 0.08
- convergenceScore: 0.92 (telemetry; P0 override on iterations 3 and 9 blocked a legal STOP even under convergence policy)
- graphConvergenceScore: 0 (graphless fallback)

### Coverage

- Dimensions: correctness (1–2), security (3, 9), traceability (4–6), maintainability (7–8, 10)
- Core protocols each had at least one full pass
- Applicable overlays each had at least one full pass

### Replay validation

- F001 re-read at iteration 9 against `cover-image.ts`, `board-renderer.ts:971`, `gallery-renderer.ts:615-719`. Severity held at P0.
- F002 re-read `refresh()` at `database-view.ts:11484` during init of this session.

### Core Protocols (appendix)

- `spec_code`: fail — see F003, F004, F007, F011
- `checklist_evidence`: fail — see F006

### Overlay Protocols (appendix)

- `feature_catalog_code`: fail — F013
- `playbook_capability`: fail — F005
- `skill_agent` / `agent_cross_runtime`: notApplicable

### Continuity

- `generate-context.js` not run (lineage containment: writes outside the artifact dir).
- Config status set to `complete` by synthesis; releaseReadinessState remains conceptually `release-blocking` via this report (config field left as initialized-then-complete per YAML `step_update_config_status`).
