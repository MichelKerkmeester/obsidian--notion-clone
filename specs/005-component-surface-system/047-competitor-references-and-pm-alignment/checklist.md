---
title: "Verification Checklist: Competitor References and Closer PM Alignment"
description: "Acceptance criteria with the failing number recorded first, so a pass means a measured gap actually closed rather than a reviewer forming an impression."
trigger_phrases:
  - "047 checklist"
  - "competitor reference verification"
  - "pm alignment checklist"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Competitor References and Closer PM Alignment

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Competitor products with reference captures in the repository | 1 — Project Manager, 16 PNGs under `screenshots/project-manager/` | 3 — plus Anytype and AppFlowy | [ ] |
| C2 | Reference groups the manifest schema accepts | 1 — `manifest-schema.mjs:118` rejects anything that is not `project-manager` | a named allowlist, still closed | [ ] |
| C3 | Reference renderers the schema accepts | 2 — `pm-kanban`, `pm-gantt` (`manifest-schema.mjs:51`) | the new products' surfaces added, unlisted ones still rejected | [ ] |
| C4 | Capture rows taken, of product × surface × source | 0 of 16 | 16, or fewer with each absence recorded as uncaptured WITH its reason | [ ] |
| C5 | Deterministic classes for a capture with no in-repo source | 0 — `verify.mjs` has `vendor-unavailable` for an *unavailable* source, not for *no* source | 1, and the same entry never flips class | [ ] |
| C6 | Board fidelity gaps against Project Manager, measured | unknown — `038`'s T12 measured 14 carried-forward elements at `c563f08`, then the operator said "align closer" against 0.0.22 | every gap numbered, then closed with a before/after or dispositioned with a reason | [ ] |
| C7 | Gantt fidelity gaps against Project Manager, measured | unknown — `037`'s AC-007 measured 60 of 60 `pm-gantt-*` classes with zero divergence at `30c4b746`, and the operator still said "align closer" | same | [ ] |
| C8 | Negative control proving the widened schema still rejects | 0 — no such test exists | 1, observed red on a malformed entry both before and after the widening | [ ] |
| C9 | Image sources with a recorded licence position | 0 | one per source, written before the image is committed | [ ] |
| C10 | Our own board/gantt captures moved without a named gap behind the move | 0 today, and it must stay 0 | 0 | [ ] |

**C6 and C7 are the operator's complaint. C2 and C8 together are the thing most likely to go wrong
quietly: widening a contract is easy and leaving it strict while widening it is the actual work.
C10 is the row that stops a fidelity pass from becoming a rebaseline.**

### Blank Failing Numbers

C6 and C7 read "unknown" rather than a number, and that is honest rather than lazy: both packets'
in-repo comparisons already measured **zero divergence on what they carried**, so the gap the
operator is describing is not in those measurements. Producing the number is T012 and T013's job,
and if the second pass also measures zero then the finding is that the gap is in *what was carried*,
not in *how faithfully it was carried* — which is a scope conversation with the operator rather than
a fidelity fix.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] CHK-001 [P0] The licence position for every image source is written down before any download
- [ ] CHK-002 [P0] The operator has approved installing the two Homebrew casks — installation is a scoped mutation
- [ ] CHK-003 [P0] `037`'s AC-007 and `038`'s T12 read, so the comparison style is copied rather than reinvented
- [ ] CHK-004 [P1] The pre-change baseline is recorded: board and gantt capture hashes, the manifest entry count, the gate's lane list
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] CHK-010 [P0] `npx tsc --noEmit` and `npm run lint:tools` exit 0
- [ ] CHK-011 [P0] The negative control goes red on a malformed entry against the WIDENED schema, not only the old one
- [ ] CHK-012 [P1] `verify.mjs`'s new class is deterministic; the same entry never flips between classes across runs
- [ ] CHK-013 [P1] The schema widening lands as its own commit, separate from the captures and from the fidelity fixes
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with observed evidence
- [ ] CHK-021 [P0] `npm run gate` exits 0, read without a pipe
- [ ] CHK-022 [P0] `npm run screenshots:verify` accounts for every new capture rather than skipping it
- [ ] CHK-023 [P1] Board and gantt capture hashes compared against the baseline; any move traced to a named gap
- [ ] CHK-024 [P1] Every uncaptured row is recorded as uncaptured with its reason
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] CHK-FIX-001 [P0] Finding class recorded. The schema widening is `matrix/evidence`; each fidelity gap is `instance-only` until a second surface shows the same shape
- [ ] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'project-manager|pm-kanban|pm-gantt' tools/screenshots tools/live`, count stated before and after
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `REFERENCE_RENDERERS`, `captureRootFor` and `referenceOf` across `tools/` and `src/`
- [ ] CHK-FIX-004 [P0] The schema parses external input. Adversarial rows required: an unknown group, an unknown renderer, a missing `referenceOf`, and a `file` path escaping its capture root
- [ ] CHK-FIX-005 [P1] Matrix axes listed: product × surface × source, 16 rows, uncaptured ones named
- [ ] CHK-FIX-006 [P1] N/A — no process-wide state is read
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a moving branch range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [ ] CHK-030 [P0] No credential is used to obtain any competitor image; anything behind a login is out
- [ ] CHK-031 [P0] Every downloaded image is inspected before it is committed
- [ ] CHK-032 [P1] The widened schema still rejects a `file` path escaping its capture root
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and this file agree
- [ ] CHK-041 [P1] `screenshots/README.md` describes both new roots and where their contents came from
- [ ] CHK-042 [P1] The licence positions survive as a committed record, not as a scratch note
- [ ] CHK-043 [P2] `../roadmap.md` §4 rows 37/38 record what was measured — **without being ticked**
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] CHK-050 [P1] Comparison working files in `scratch/` only
- [ ] CHK-051 [P1] `scratch/` cleaned of throwaway files before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 0/12 |
| P1 Items | 12 | 0/12 |
| P2 Items | 1 | 0/1 |

**Verification Date**: not yet run

**P0/P1 must be complete before this packet claims done.** AC-007 is the operator's and is not in
these counts — an agent never ticks it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## ARCHITECTURE VERIFICATION

- [ ] CHK-100 [P1] The widened reference contract is documented where it is enforced, not only in this packet
- [ ] CHK-101 [P1] The decision about what `referenceOf` means for a capture with no constructed counterpart is recorded
- [ ] CHK-102 [P2] `screenshots/README.md` explains why competitor roots stay flat while our own captures nest under `notion-clone/`
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## PERFORMANCE VERIFICATION

- [ ] CHK-110 [P1] `screenshots:verify`'s entry count and wall time recorded before and after, so "bigger" is measured
- [ ] CHK-111 [P2] N/A — no runtime performance surface changes unless a fidelity fix touches one, in which case it carries its own number
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## DEPLOYMENT READINESS

- [ ] CHK-120 [P1] The rollback path is per-commit: schema, captures and fidelity fixes land separately so each reverts without the others
- [ ] CHK-121 [P1] No image with an unresolved licence position is in the commit
- [ ] CHK-122 [P2] If a release carries the fidelity fixes, its notes say which gaps closed
<!-- /ANCHOR:deploy-ready -->
