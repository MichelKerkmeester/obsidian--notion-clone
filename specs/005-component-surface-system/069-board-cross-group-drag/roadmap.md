---
title: "Roadmap: Board Cross-Group Drag"
description: "Level-agnostic forward plan for near-term, next-step and later work."
trigger_phrases:
  - "069 roadmap"
  - "board touch drag roadmap"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: roadmap | v2.2 -->
# Roadmap: Board Cross-Group Drag

> Plans this packet's close and the one follow-up it names, over the current session and the next
> release.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Board cross-group drag
**Status:** Active
**Horizon:** Current session through the next release
**Owner:** Implementation session
**Last updated:** 2026-09-07
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:now-next-later -->
## 2. PHASES: NOW / NEXT / LATER

**Now:** In Progress. Focus: full gate to 26 green, spec validation `--strict` for this packet and
the parent, graph-metadata backfill, then commit. Exit signal: `npm run gate` exits 0 and
`validate.sh` reports `RESULT: PASSED` for both.

**Next:** Planned. Focus: the verifier lands this packet (rebase, land, release) — this session does
not push. Exit signal: a fresh release carries the change and the operator confirms cross-group
drag on their own phone (`goal.md`'s operator row).

**Later:** Planned. Focus: if a future packet wants the constructed capture tracked in
`screenshots/manifest.json`'s hash-verified pipeline, it adds a synchronously-reachable
`boardTouchDragLifted` state to `render-assertion-harness.ts` (per `decision-record.md` ADR-004's
own constraint) and registers it in `constructed-scenarios.mjs`. Exit signal: `npm run screenshots`
produces a real, hash-tracked entry for the lifted state.
<!-- /ANCHOR:now-next-later -->

---

<!-- ANCHOR:milestones-targets -->
## 3. MILESTONES & TARGETS

**Gate green:** phase Now, target same-session. Status: In Progress. Evidence: `.gate-*.log`.

**Packet landed:** phase Next, target next release. Status: Planned. Evidence: a future release's
changelog entry.

**Tracked capture:** phase Later, target unscheduled. Status: Planned. Evidence:
`screenshots/manifest.json` gaining a `board-touch-drag-lifted` entry with real `sourceHashes`.
<!-- /ANCHOR:milestones-targets -->

---

<!-- ANCHOR:dependencies -->
## 4. DEPENDENCIES

**Verifier session:** needed by the Next phase, owner the operator's chosen verifier. Status:
Ready — this session hands off HEAD SHA, desktop proof, phone measurements and exit statuses in the
final report. Risk and mitigation: none identified; no file lane contention, since this session did
not push.
<!-- /ANCHOR:dependencies -->
