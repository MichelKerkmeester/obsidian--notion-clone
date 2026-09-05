---
title: "Goal: Competitor References and Closer PM Alignment"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "047 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T07:40:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the directive from the rows 37/38 align-closer ruling"
    next_safe_action: "Write the negative control red-first, then widen the reference contract"
    blockers:
      - "manifest-schema.mjs rejects any reference group that is not project-manager"
      - "Installing the two casks is a scoped mutation and needs the operator's go-ahead"
    key_files:
      - "tools/screenshots/manifest-schema.mjs"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How does the freshness lane classify a capture with no in-repo source?"
      - "Does align closer have a stopping point if the second pass also measures zero?"
    answered_questions:
      - "Both casks exist and neither app is installed: anytype 0.56.5, appflowy 0.14.1"
---
# Goal: Competitor References and Closer PM Alignment

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give the board and the gantt more than one reference to be judged against — Anytype
and AppFlowy beside Project Manager — and turn the operator's *"align closer"* into a numbered list
of measured gaps, each closed with a before and an after or dispositioned with a reason.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Both sources, per the operator's words:** official product images **and** the apps installed locally through Homebrew casks. Not one or the other. |
| D2 | Captures live at `screenshots/anytype/` and `screenshots/appflowy/`, **flat**, the way `screenshots/project-manager/` does. Our own captures stay under `screenshots/notion-clone/`. |
| D3 | **The manifest contract is widened, not loosened.** `manifest-schema.mjs:118` rejects any reference group but `project-manager` and `:52` allows only `pm-kanban` and `pm-gantt`. A negative control proves the widened version still rejects. |
| D4 | **No fidelity fix without a measured gap behind it.** `037`'s AC-007 and `038`'s T12 are the style: named elements, measured values, a numbered gap or a zero. |
| D5 | **A capture that could not be taken is recorded as uncaptured, with its reason.** An absent capture reported as zero gaps is the exact failure this program was rewritten around. |
| D6 | **Rows 37 and 38 do not close here.** They close on the operator's own vault comparison. An agent never ticks an operator row. |
| D7 | **Every image's licence position is recorded before it is committed.** A source whose terms are unclear is cited by URL rather than vendored. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, `../roadmap.md` §4 rows 37-38 and §6A, then this
folder's `spec.md`, `plan.md` and `checklist.md`. Also read `../037-timeline-gantt-port/acceptance-criteria.md`
AC-007 and `../038-board-kanban-port/tasks.md` T12 — the comparison style is copied from them.

**Precedence.** The parent's D1-D14 outrank child detail; child detail outranks any summary of it,
including a roadmap row. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today so the check
has a value to move from.

- [ ] `screenshots/anytype/` and `screenshots/appflowy/` carry board, table, calendar and timeline
      captures from **both** sources. **Today: neither root exists, and neither app is installed —
      `brew info --cask` reports `anytype` 0.56.5 and `appflowy` 0.14.1, both "Not installed".**
- [ ] Every new capture has a manifest entry carrying its provenance: source, app version, capture
      date. **Today: `screenshots/manifest.json` has 546 entries, 16 of them references, all
      Project Manager.**
- [ ] The reference contract accepts the new groups and renderers **and still rejects a malformed
      entry**, proven by a negative control observed red. **Today: `manifest-schema.mjs:118`
      rejects any group but `project-manager`; `:52` allows two renderers; no negative control
      exists.**
- [ ] A capture with no in-repo source has a deterministic class in `verify.mjs`. **Today:
      `vendor-unavailable` exists for an *unavailable* source, which is a different thing from
      no source at all.**
- [ ] The board and the gantt are compared against Project Manager with named elements and measured
      values, and every gap is closed with a before/after number or dispositioned with a reason.
      **Today: `038`'s T12 matched 14 carried-forward elements at `c563f08` and `037`'s AC-007
      matched 60 of 60 `pm-gantt-*` classes at `30c4b746` — and the operator still says "align
      closer".**
- [ ] **The operator reads the board and the timeline on a released build and no longer says "align
      closer".** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Operator 2026-09-05 on 0.0.22: *"align closer"*, plus capture Anytype and AppFlowy — official images and installed apps both. Recorded at `../roadmap.md` §4 rows 37/38 and §6A |
| Level and shape decided | Done | `recommend-level.sh --loc 500 --files 18 --api` → **Level 2, 53/100, confidence 92%**; phase score **10/50** against a threshold of 25. Neither `phase-definitions.md` §2 condition is met, so a standard child |
| Cask availability checked | Done | `brew info --cask anytype` → 0.56.5, auto_updates, **Not installed**. `brew info --cask appflowy` → 0.14.1, **Not installed** |
| Contract blocker found | Done | `tools/screenshots/manifest-schema.mjs:118` rejects any reference `group` but `project-manager`; `:52` limits `REFERENCE_RENDERERS` to `pm-kanban` and `pm-gantt` |
| Contract widened | Not started | `tasks.md` T005, T006 |
| Captures | Done, partial | `tasks.md` T008, T009 — 8 of 16 matrix rows captured, 4 N/A (no timeline in either product), 4 not reachable (no simulated click in this environment); demo page cleanup deferred to the operator |
| Fidelity comparison | Not started | `tasks.md` T012, T013 |

### Deviations and findings

| Item | Note |
|------|------|
| The captures cannot enter the manifest today | `manifest-schema.mjs:118` hard-codes `project-manager` as the only acceptable reference group. That was correct when one reference existed. Widening it is the first task and it is where the packet is most likely to do quiet damage — a widened contract that stops rejecting is worse than no contract. |
| The freshness model does not fit an external screenshot | Project Manager references are **rendered from vendored source**, so each entry's `sources` array names real files (`specs/context/obsidian-pm-main/src/views/gantt/*.ts`) and `verify.mjs` hashes them. An Anytype screenshot has no source to hash. Inventing a fake `sources` entry to satisfy the lane would be worse than widening the lane honestly. |
| "Align closer" arrives after two zero-divergence measurements | `037`'s AC-007 measured 60 of 60 `pm-gantt-*` classes with zero divergence; `038`'s T12 matched fourteen elements to the pixel. Neither is contradicted by the operator's verdict. The likely reading is that matching the reference on the elements we chose to carry is not the same as looking like it — which, if the second pass also measures zero, is a scope conversation rather than a fidelity fix. |
| `anytype` auto-updates | The cask is marked `auto_updates`, so a capture drifts from the app without warning. The entry records the version so a later reader knows what they are looking at. |
| Neither app is installed | So the installed-app half of the operator's ask starts with an installation, which is a scoped mutation and waits for a go-ahead rather than being assumed. |
| No simulated mouse click works in this environment | Confirmed three ways: `CGEvent` posts (Quartz, from Python) return no error and have no visible effect; `System Events`'s `click at {x,y}` is refused outright — `osascript is not allowed assistive access` (-25211); and both apps' content areas expose no accessibility tree to click through instead (their whole window body is one opaque `AXGroup` — only native window-chrome buttons and the native macOS menu bar are real accessibility elements). What does work: `keystroke`/`key code` sent to whatever is frontmost, and clicking a native menu-bar item via the accessibility API's menu action. Every installed-app capture was reached through some combination of `Cmd+K`/`Cmd+P`, `Cmd+N`, `/`, arrows + Return, Escape, and native-menu clicks — never a coordinate click. This caps what could be captured: view-switcher tabs, toolbar icons, table cells, and context menus were all unreachable. |
| The Anytype demo page could not be deleted | Anytype's own deletion docs (`docs.anytype.io/anytype/organize/deletion`) describe a click/checkbox-driven Bin flow with no keyboard shortcut, and neither app's native menu bar carries a Delete/Move-to-Bin item. `notion-clone-reference-demo` and its inline collection remain in the operator's Anytype vault; removing them is a one-click action left for the operator. |
<!-- /ANCHOR:log -->
