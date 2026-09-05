---
title: "Goal: Gallery Settings Redirect and Migration"
description: "The durable directive this phase executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "gallery redirect goal"
  - "007 phase 2 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T07:12:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the durable directive for the redirect and migration phase"
    next_safe_action: "Wait for 001's surface list, then run T004"
    blockers:
      - "001's audit must land: this phase's REQ set is written from its surface list"
    key_files:
      - "spec.md"
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the embedded codeblock host migrate, or ship 030's partial state knowingly?"
    answered_questions:
      - "The migration target is board: it is the other cover-drawing surface"
---
# Goal: Gallery Settings Redirect and Migration

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Close every remaining door that mints a gallery, and make sure nothing still is one —
in both render hosts — before a single line of the renderer is deleted.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | The migration target is **board with the same cover**, not table. `gallery-migration.ts`'s own header carries the reasoning: the board is the only other surface that draws a cover, through the same `resolveCoverImage` call. |
| D2 | The withdrawal is **not** re-implemented. `030` already filters both pickers; this phase verifies them and closes what `030` missed. |
| D3 | Every closed surface gets a test **observed red before green**. A surface closed without a failing value first is a claim, not a fix. |
| D4 | The embedded codeblock host is decided **here**, either way, and recorded. Not deciding is what `030` did and what `006` inherited. |
| D5 | **This phase must ship in a release before `003` starts.** Merged is not shipped, and `006`'s `007` ran while the same precondition was unconfirmed — recorded honestly there as a gap behind the work. This packet has that precedent in front of it. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, `../001-usage-and-migration-audit/implementation-summary.md`,
then this folder's `spec.md` and `plan.md`.

**It gates `003`.** The renderer cannot be deleted until a released build has migrated the views that
need it. That is parent D8 and it is not a formality.

**Precedence.** The parent's decisions outrank anything here; this document outranks any summary of
it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today so the check
has a value to move from.

- [ ] The settings-load sanitizer coerces a gallery like any other unrecognised type. **Today it
      does not**: `main.ts:144` and `:180` exempt `gallery` explicitly.
- [ ] An imported `.base` `cards` view lands on **board**, with the `:1557` schema guard intact.
      **Today it lands on gallery** (`main.ts:1548-1616`), and that file's own comment at `:1551`
      already observes that board is where the gallery migration lands anyway.
- [ ] A gallery-configured view opens as a board with the same cover, once, with a notice, in the
      standalone host. **Today this works** — the criterion exists to catch a regression, not
      because it is new.
- [ ] The embedded codeblock host either migrates too or carries an ADR saying why not. **Today:
      one call site (`database-view.ts:11663`), none in `embedded-database-renderer.ts`.**
- [ ] Every closed surface has a test that was observed red before green, with the failing value
      recorded.
- [ ] `npm run gate` exits 0 read from `$?`, never through a pipe.
- [ ] A **released** version number carries this work. Merged is not shipped, and `003` does not
      start without it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent packet opened 2026-09-05; `../spec.md` PHASE DOCUMENTATION MAP |
| REQ set written from `001` | Blocked | `tasks.md` T001 — `001` has not run |
| Sanitizer closed | Not started | `tasks.md` T004 |
| Importer closed | Not started | `tasks.md` T005 |
| Migration symmetry decided | Not started | `tasks.md` T008, ADR-001 in `plan.md` |
| Released | Not started | `tasks.md` T013 |

### Deviations and findings

| Item | Note |
|------|------|
| This phase is a *redirect*, not a *hide* | `006`'s equivalent child is `006-hide-and-migrate`, because it had to withdraw the list itself. `030` already withdrew the gallery in August, so what is left here is the surfaces the withdrawal did not reach. |
| The importer already knows the answer | `main.ts:1551`'s own comment says board is "the same landing the gallery migration makes". The import has been taking a detour through a deprecated type to reach a destination it already knew. |
| The embed-write objection has weakened | The strongest argument against migrating from the embedded host was that a reading-view render should not write vault data. On 2026-09-05 the operator allowed exactly that class of write for linked views (`046/decision-record.md` ADR-001). Worth reading before deciding, and not the same question — but the objection is no longer categorical. |
<!-- /ANCHOR:log -->
