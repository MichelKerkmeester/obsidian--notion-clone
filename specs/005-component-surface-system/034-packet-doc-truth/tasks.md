---
title: "Tasks: Packet Documentation Truth"
description: "Correct eleven untrue statements against the tree, and ask whether any class can be checked mechanically."
trigger_phrases: ["034 plan", "034 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/034-packet-doc-truth"
    last_updated_at: "2026-09-01T00:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Eleven findings corrected from the tree; the mechanical check built and deliberately not gated"
    next_safe_action: "Re-run the review dimension that raised the eleven, which only a review can do"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-034"
      parent_session_id: null
    completion_pct: 100
    open_questions: ["Can a stale line reference be caught by a script"]
    answered_questions: ["Every one of these was true when written and drifted when the tree moved"]
---
# Tasks: Packet Documentation Truth

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [x] **T1** Correct the six parent-spec findings — F004, F007, F008, F011, F012, F014.
      *Each re-derived from the tree, with the command that yields it, because these are all
      growing numbers that will drift again:*
      **F004** twenty phase folders -> **35** (`ls -d [0-9][0-9][0-9]-* | wc -l`).
      **F008** 19,261 stylesheet lines -> **20,124** (`wc -l styles.css`); 196 captures -> **236**
      (`find screenshots -name '*.png' | wc -l`).
      **F007** `006` listed Planned -> **In progress**; the roadmap already said so.
      **F014** `004` labelled Contested -> **Resolved**, per `roadmap.md` §7.1, which corroborates
      the lane entry and refutes the verifier.
      **F012** "`010`-`017` were created without `plan.md` and `tasks.md`" -> all eight now carry
      both, checked folder by folder.
      **F011** the deleted `openSurface` factory was narrated as live in **three** places, not the
      one the finding named — the bullet it cited plus two rows of the dependency table.
      *Evidence to close:* each re-derived from the tree, citing its source.
- [x] **T2** Correct the child findings — F003, F005, F006, F009.
      **F003** `000/spec.md` presented `openSurface()` as the create path. The decision is left
      standing — it was the real decision — with a superseded note recording that the factory was
      deleted 2026-08-30 for having zero importers, and that `surface-contract.ts` was kept.
      **F005** `009/implementation-summary.md` reads as current state but is a transcript of
      commands run on 2026-08-29. Dated rather than rewritten: updating a recorded command output
      turns a true record into a false one. The finding it carries has not changed — the app was
      never driven, and the transport still reports exit 2.
      **F006** `004/checklist.md` had all six evidence cells empty and stale "today" values.
      Re-derived from `tools/live/checkbox-appearance.json` (fresh per the gate's `evidence` lane):
      **B1 and B3 are now evidenced** — 211 of 211 controls self-own appearance across 59 fixtures,
      `appearanceOwnedByAncestor: 0`, `platformBox: 0`. **B2, B4, B5 and B6 stay unticked**, each
      with what would settle it. They are not carried along by the two that closed.
      *And it surfaced a contradiction:* B6's reach. `roadmap.md` §7.1 records the switch at 34x28;
      the artefact measures its box at **34x18**. Both can be true — a box is not a reach — but
      nothing measures reach, so the criterion is evidenced by neither.
      **F009** `028/spec.md` cited `database-view.ts:11421`. Fixed by naming the symbol and its
      grep instead of an address.
      *And then the correction drifted too, which is the finding worth keeping.* The first fix still
      wrote an address — "now at 11490" — and unrelated edits to that file later in the same session
      carried the method to **11522** within hours. The independent audit caught it by running the
      command printed beside the number. The number is now gone entirely: the grep is the durable
      form, and any figure sitting next to it is the part that rots.
      *Evidence to close:* same standard, per child.
- [x] **T3** Correct the code comment documenting a deleted API — F015.
      `popover-position.ts` justified hiding a surface by saying it matched what `openSurface`'s own
      `place()` did. That function exists nowhere in `src/`. The clause is gone and the reasoning
      now stands on its own terms, which is what it needed to do anyway.
      *Evidence to close:* the comment names what exists; no tracker ids in code comments.
- [x] **T4** Answer the mechanical-check question.
      *Evidence to close:* either a script that catches one class, or the recorded reason none can.
      **Both, as it turns out.** `tools/naming/scan-spec-references.mjs` is built and it does catch
      the class — every repo-relative source path a canonical spec doc names must exist on disk.
      **It is deliberately NOT a gate lane, and the reason is structural, not a matter of tuning.**
      A spec document names a path for two different reasons — describing what IS, and specifying
      what WILL BE — and the path alone cannot tell them apart. Measured rather than asserted:

      | Scope | Hits |
      |---|---|
      | Whole `specs/` tree | **3,597** |
      | In completed packets (`001-...-build`, `003-...-build`) | **3,569** |
      | In this packet | **28** |
      | Of those 28, `tasks.md` / `plan.md` rows naming artefacts still to be built | **26** |
      | Genuine "cites a deleted file as live" | **0** |

      The zero is the interesting number: the three real ones were fixed in T1-T3, and the
      corrections say the file was deleted — which the scanner skips by design. So it agrees with
      the fixes, and everything it still reports is a planning row.
      Wiring 28 known-benign hits into the gate would train people to ignore a red lane, which is
      the failure this packet exists to prevent. It ships as an on-demand tool with `--path=` so it
      can be scoped to the packet being worked.
      *What would make it gateable:* a convention that distinguishes a planned path from a
      described one. That is a change to how spec docs are written, not to this script, and it is
      not in this packet's scope.
- [x] **T5** Metadata regenerated for every folder touched — REQ-004.
      *Evidence to close:* `validate.sh --strict` Errors: 0 for each. This step was missed twice in
      the session that opened this phase, which is why it is a task rather than an assumption.
      *Closed by:* backfilled and then validated, exit codes read directly rather than from a pipe —
      `000`, `004`, `009`, `028`, `031`, `032`, `033`, `034`, all **Errors: 0**.
- [x] **T6** Re-run the review dimension that raised them.
      *Evidence to close:* no corrected finding is re-raised.
      *Closed by:* an independent read-only audit dispatched to `cli-devin` on
      `deepseek-v4-flash-max`, given the eleven claims and told to re-derive each from the tree
      rather than trust it. **10 of 11 verified; 1 wrong.**
      The one it caught was F009, and it was mine: the correction had replaced a stale line number
      with a fresh line number, and edits elsewhere in the same file carried the method from 11490
      to **11522** in the same session. Confirmed by hand before accepting it — `grep -n
      'refresh(options'` returns 11522, and line 11490 is blank. The address is now removed rather
      than updated again.
      *Why this closes the row where a self-check could not:* the audit ran the command the document
      prints beside its own claim. That is a check I had already written and had not re-run, which
      is exactly the blind spot an independent pass exists to cover.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when all eleven are closed or explicitly declared still-true with evidence.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · the findings: [`../handover.md`](../handover.md) §7
<!-- /ANCHOR:cross-refs -->
