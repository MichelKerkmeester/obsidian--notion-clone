---
title: "Decision Record: Remove Renderers and Harness"
description: "The archival, exclusion, dormant-machinery and retired-token decisions this phase took, with the alternatives each rejected."
trigger_phrases:
  - "003-remove-renderers-and-harness decision record"
  - "archival ADR"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness"
    last_updated_at: "2026-09-09T08:20:00Z"
    last_updated_by: "250-deprecation-removal"
    recent_action: "Took the archival, dormant-machinery and retired-token ADRs"
    next_safe_action: "Hand off for a fresh verifier; 004 (docs and release) waits"
    blockers: []
    key_files:
      - "../../../archive/deprecated-views/README.md"
      - "../../../archive/deprecated-views/timeline/README.md"
      - "../../../src/views/database-view.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-remove-renderers-and-harness-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Archive-then-exclude by construction, no glob edits — ADR-001; the harness's retired-view machinery stays dormant, gate lanes 27->27 — ADR-002; five retired-view tokens recorded in the pinned-values baseline, not stood in — ADR-003"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Remove Renderers and Harness

---

## 1. METADATA

| Field | Value |
|-------|-------|
| **Packet** | 008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness |
| **Status** | Accepted |
| **Date** | 2026-09-09 |
| **Supersedes** | — |
| **Related** | The parent packet's D2 and D4; the gallery-removal precedent's decision record |

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Archive-then-exclude — the renderers move, nothing is deleted, and exclusion happens by construction

**Status**: Accepted

**Context**: The three retired view renderers (calendar, timeline, chart) and their dedicated tests and render benches are dead weight in the shipped bundle once no surface can open those views — but the parent's D2 forbids deletion: the date/renderer-parity work may need to resurrect one, so the removed code must stay in the tree, at a known location, with a documented restore path. The question was where the code goes and what mechanism keeps it out of the build.

**Decision**: The ten sources move via `git mv` — history preserved, no content rewritten — into `archive/deprecated-views/<view>/` (one folder per view, plus a root README), and the exclusion mechanism is *by construction*, not by edited globs:

- **Bundle**: the production build is esbuild from the single entry `src/main.ts`; after the surgery no `src/` module imports any archived file, so nothing archived is reachable and the bundle simply stops carrying it. Proof: the bundle grep for the retired identifiers reads 0 (5 before this phase).
- **Tests**: the vitest collections match `src/**/*.test.ts` and `tools/**/*.test.mjs`; archived test files fall out of both patterns by construction. Archived *sources* still load where a surviving module imports them — the render-assertion harness loads both render benches from the archive, and the bench-fixture module the reference scenarios consume imports the timeline bench — so the behaviour those imports feed stays exercised and green.
- **Lint**: the linters glob `src/**` and `tools/**.mjs`; the archive sits outside both.
- **Type-check**: the one deliberate configuration touch. tsc follows import edges even outside an include root, and with the (never-emit, vestigial) `rootDir` still pinned to `src`, the archived imports — entered via the surviving test importers — tripped TS6059. `rootDir` widened to `.`; there is no emit anywhere, so the widening changes nothing else.

The root and per-view READMEs each name the last-live SHA (`e75a979c9a21f6f93967a40e24b2a58f474fa9d5`, the commit 0.0.34 was cut from — the last release whose bundle still carried the three renderers) and the exact restore procedure: `git checkout <sha> -- <original paths>`, which writes the bytes back at their original location without touching the archived copies, plus what a restored view needs beside its own files (the importers' import/field/dispatch/teardown legs, the root-class registration, the harness registries, the capture rows). All ten restored paths were proven reachable at that SHA by `git show` (byte counts > 0); the checkout itself was not executed, so the verified tree state is exactly what ships.

**Consequences**:
- The bundle loses the three renderers, their tests and their benches without any bundler, test or lint configuration change; a future resurrection starts from real, versioned bytes rather than from history archaeology.
- The archive is *not* dead weight in theTypeScript program: tsc still checks the archived sources through the surviving import edges, so archived code that drifts from `src/`'s APIs fails the same type-check as everything else. That is deliberate — silent rot is the failure this repository keeps removing.
- Two counted numbers in `screenshots/` documentation will not reconcile at a glance: 136 retired manifest rows (616→480) against 138 deleted PNG files. Both are observed; the two-PNG difference is the pre-existing tracked captures that the committed manifest never carried. Recorded here so nobody re-derives it.

**Alternatives rejected**:
- **Delete outright** (no `archive/`): loses the only copy of the gantt-port behaviour tests and the render benches; resurrection would depend on `git history` spelunking, which is exactly what D2's README requirement exists to prevent.
- **Keep the sources in place under `src/views/`, unchecked-only**: needs a dozen precise exclusions (tsconfig, vitest, both linters, the harness) that every future contributor must maintain, and the next "while we're here" pass would re-wire them; a physical move needs zero maintenance.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The harness's retired-view machinery stays dormant rather than being excised

**Status**: Accepted

**Context**: The live-render harness (the assertion runner and its bundle) carries branches, negative-control tags, option bags and assertion clauses that exist to exercise the three retired views. After the registries were trimmed, those code paths have no callers: no constructed, fixture or reference scenario mounts those views any more.

**Decision**: The dormant machinery stays, compiling and running green, with its inputs populated by the surviving surfaces. Its resident-data warning header now names only the surviving views' ownership. The mirrors-what-the-hosts-do argument decided it: the hosts deliberately keep their retired-view-adjacent machinery (the permanently idle search-results element, the surviving `pipelineConfig` chart ternary) because the stored-view migration machinery from 002 reads the same neighbourhood, and 002's hide-and-migrate suite pins those clauses. Excising the harness's copy while the hosts keep theirs would make the two halves of one story diverge for no counted gain.

**Consequences**:
- The gate's lane count is unchanged, 27→27: every lane's inputs stayed populated, so no lane needed retiring and the "may drop" clause of the removal directive never fired.
- `runViewSwitchResidueCheck` is exported and currently unused; a future harness pass either finds it a caller or deletes it with its singular behaviour.
- The dormant code's fate is decoupled from this leg's closure — nobody must remember it, because the census artefacts and the suite banners are the things that count it.

**Alternatives rejected**:
- **Full excision** (delete every retired-view clause): a second, purely-vestigial surgery riding on this one, with its own red/green cycle, purchased only a smaller harness file; the directives' counted outcomes (bundle grep 0, gate green) are identical either way.
- **Empty the branches, keep the shell**: the worst of both — the reader still pays for the branchy shape while the clauses say nothing.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The retired-view tokens are recorded in the pinned-values baseline, not stood in

**Status**: Accepted

**Context**: After the moves, the pinned-values scan reported ten tokens whose stylesheet reads have no supplier, against a recorded five. The five arrivals are the retired views' custom properties: their only setters were style-assignments inside the now-archived renderers, so the declarations existed only while such a view was mounted — the scanner counts declarations under `src/` and `styles.css`, and the setters now live outside its scanned roots. The reads themselves survive in `styles.css`'s now-unreachable `.obnotion-calendar-*` and `.obnotion-timeline-*` rules.

**Decision**: Record all five, by name and read-count, in `pinned-values-baseline.json`, with the story of how they arrived; do not add declarations for them anywhere.

**Consequences**:
- The scan's headcount matches the baseline again and the ratchet holds: a genuinely new unsupplied read still turns the lane red.
- The dead stylesheet rules keep their dropped-declaration behaviour, which is invisible to every reachable surface (no live code constructs that markup — verified: the sort-panel renderer, the one surviving consumer of that visual neighbourhood, constructs none of it).
- Five unremovable entries now sit in the baseline until the stylesheet's retired-family audit (a per-rule pass the parent's removal phase deliberately did not absorb) cuts the rules and the entries with them.

**Alternatives rejected**:
- **Stand the five tokens in** (`theme.css` or the harness theme): resurrects values no product code computes any more, adds five declarations whose only readers are dead rules, and bends the baseline's own stated purpose — it records what nothing declares, and these now genuinely are that.
- **Cut the dead rules in the same leg**: a whole-stylesheet, per-rule audit that moves more captures than this leg's removal did; recorded as the CSS lane's outstanding, where the board-column-width precedent already lives.
<!-- /ANCHOR:adr-003 -->
