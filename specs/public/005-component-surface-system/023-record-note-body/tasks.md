---
title: "Task Breakdown: Markdown Note Body in the Record View"
description: "One task per requirement. Nothing is started; every box is open, and the fork is closed before any of them opens."
trigger_phrases:
  - "023 note body tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Markdown Note Body in the Record View

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Nothing in this phase has started.** Every box below is open, and none should be closed before the
work behind it is done — a checked box here would make this packet owe an implementation summary for
work nobody did.

**Tasks below T5 belong to one shape or the other.** A task marked *editable only* does not exist if
the operator chooses display-only, and is not silently discharged by a display-only build.

**No task closes on "looks right".** Each task's evidence names a number that was read or a command
whose output and exit status were read.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [ ] **T1** Close the shape fork — REQ-001. **Blocking.**
      *Evidence to close:* a recorded operator decision, display-only or editable, with `spec.md`
      §3's recommendation and its reasoning put in front of them. The two shapes score 40 and 64 on
      the same complexity scale and share almost no implementation, so this is not a detail to settle
      later.
- [ ] **T2** Get the layout decision — REQ-005.
      *Evidence to close:* below the properties, behind a collapsed section, or on its own tab.
      Asked in the same conversation as T1. The sheet already carries 13+ properties and a
      keyboard-avoidance inset, so a body of arbitrary length needs a decided home rather than a
      discovered one.
- [ ] **T3** Re-read the data-layer facts on the current tree — `spec.md` §2.
      *Evidence to close:* the nine `vault.read` / `cachedRead` sites, the one `vault.modify` at
      `embedded-database-renderer.ts:3436`, and `MarkdownRenderer`'s single call site at
      `main.ts:438`, confirmed by grep rather than read from this document.
- [ ] **T4** Build the round-trip fixture — NFR-D01, and useful under either shape.
      *Evidence to close:* a note whose frontmatter the plugin did not author — with comments, an
      unusual key order, and a key the plugin has no schema for. Frontmatter the plugin wrote itself
      round-trips trivially and would prove nothing.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Display-only

- [ ] **T5** Strip frontmatter from a read note body — REQ-002.
      *Evidence to close:* unit tests covering a note with frontmatter and a body, one with only
      frontmatter, and one with no frontmatter at all.
- [ ] **T6** Render the body through `MarkdownRenderer` — REQ-002.
      *Evidence to close:* the opened record's body visible in the panel, rendered by Obsidian's own
      renderer rather than a reimplementation. Links, embeds and task checkboxes work as a
      consequence, not as separate work.
- [ ] **T7** Mount it in the chosen home — REQ-005.
      *Evidence to close:* the body in the location T2 decided, at 390px and on desktop.
- [ ] **T8** Wire the tap-through — `plan.md` ADR-001.
      *Evidence to close:* tapping the body opens the note in Obsidian.
- [ ] **T9** Confirm the self-transclusion case — `spec.md` §8.
      *Evidence to close:* a note whose body transcludes itself renders without recursion. Obsidian's
      renderer is expected to handle this; expected is not verified.

### Editable — only if T1 chose it

- [ ] **T10** *Editable only.* Answer the write-path question in writing — REQ-007. **Do this before
      any interface code.**
      *Evidence to close:* a written statement of whether the body write goes through
      `enqueueWrite` on the same path key as the frontmatter writes, or an argument for why it is
      safe outside that queue. `data-source.ts:122`'s own comment gives the reason the queue exists:
      concurrent `processFrontMatter` calls into the same file corrupt each other. A `vault.modify`
      body write rewrites the whole file, frontmatter included, from outside it.
- [ ] **T11** *Editable only.* Prove the byte-exact round trip — REQ-003, C4.
      *Evidence to close:* T4's fixture written and re-read, byte-identical, comments and key order
      intact.
- [ ] **T12** *Editable only.* Prove the concurrency case — C5.
      *Evidence to close:* a property edit and a body edit on one file, neither lost nor corrupted.
      This is the criterion that decides whether the shape is viable and the one an implementation
      would naturally defer.
- [ ] **T13** *Editable only.* Build the editor in the chosen home.
      *Evidence to close:* it works at 390px inside a sheet that already has a keyboard inset. A
      plain textarea is achievable; a real editor inside a bottom sheet is a much larger commitment
      and its scope is decided here, not discovered.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

These are assertions about **absence**, which is the kind that gets skipped.

- [ ] **T14** A record with no body renders exactly as today — REQ-008, C2.
      *Evidence to close:* no empty container, no reserved space, capture pixel-identical to the
      previous commit for that fixture.
- [ ] **T15** Listed rows trigger no body read — REQ-004, C3.
      *Evidence to close:* a read count over a rendered list, showing reads only for the opened
      record. Reading a body per row would put a file read behind every row in every view.
- [ ] **T16** The sheet did not regress — REQ-006, C6.
      *Evidence to close:* floor, navigation bar, backdrop and grab band still green in
      `verify-placement.mjs`. These are asserted by earlier phases and this one must not spend them.
- [ ] **T17** Run the whole gate from the final state and read each exit code without a pipe.
      *Evidence to close:* `npm run gate` exit 0; `npx vitest run` with no reduction in count.
- [ ] **T18** Recapture and attribute the churn.
      *Evidence to close:* every moved image explained against a re-measured churn floor.
- [ ] **T19** Confirm no stray files and no tracker ids in code comments — TASK-HYGIENE.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- The shape and the layout were decided by the operator before implementation began.
- The opened record's body is visible, rendered by Obsidian's own renderer.
- A record with no body renders exactly as it did.
- No body is read for a row that is merely listed.
- The sheet's floor, navigation bar, backdrop and grab band are still green.
- **If the editable shape was chosen**: the write-path question is answered in writing, frontmatter
  the plugin did not author round-trips byte-exactly, and a concurrent property-and-body edit loses
  neither.
- **If it was not**: T10–T13 are recorded as not applicable to what was built, never as done.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md)
- [`../spec.md`](../spec.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- [`../004-checkbox-ownership/spec.md`](../004-checkbox-ownership/spec.md)

<!-- /ANCHOR:cross-refs -->
