**Phase 008 — Integration and release observability**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Ships in two parts on two schedules.** Part A lands early, before `001` starts, and gates every lane handoff from `000`'s release onward. Part B runs last and is the only phase permitted to delete a compatibility path.

**WHY THIS PHASE EXISTS.** **No child phase can know that a later stylesheet edit preserved its result.** `styles.css` is one serialized lane, 19,261 lines (`wc -l styles.css`), fingerprinted by all 196 captures, and every phase holds it in turn. A phase that measures its surfaces green, releases the lane, and then watches three more phases edit the same file has proven something about a tree that no longer exists. This file already contains **87 duplicated selectors and 124 silently overridden values** — reversal is not hypothetical here, it is the documented norm.

**WHY IT SPLIT IN TWO.** As first written, this replay was the program's only cross-phase gate **and it did not exist until the very end**. `000` could close, `002` could reverse its token root four weeks later, and nothing would fire until release (`../adversarial-review.md` F7). A gate delivered after the work it guards is a report, not a gate.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../adversarial-review.md`, `../roadmap.md`, `../design-system.md`, then this folder's `spec.md` (§3 for the split, §4B and §4C for the two mechanisms) and `acceptance-criteria.md`.

**Blocks:** every lane release by `004`, `005`, `001`, `002`, `003`, `006` and by `008` itself. **Does not block `000`** — it cannot exist before `000`'s registry does; that window is carried by `000`'s own controls and the `009` live cross-check.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked without
evidence in a lane, and the rows that ask for a REHEARSAL are open even where the rule they
rehearse is enforced, because "the rule exists" is the claim this packet was written to distrust.*

- [x] Every earlier phase's criteria re-pass **from the current tree at every handoff**, and from the
      final tree at release — not from the tree they were written against. **Met by the `replay`
      lane**, which re-measures eight recorded claims from the current tree on every gate run and
      names the phase each belongs to. It is in the gate, so it runs at every handoff by
      construction rather than by anyone remembering.
- [x] A seeded reversal is demonstrated to fail the handoff replay, and only in its own cells.
      **Demonstrated on 2026-09-01, unintentionally, which is the strongest form of this evidence.**
      A fixture repair moved one claim from 0 to 4 and the lane reported `005-content-row-rhythm
      measured 0 and now gets 4` — that phase's cell alone, with the other seven still held. The
      cause turned out to be the check counting an unlabelled reserved box as a property, so the
      check was repaired and the recorded value left alone; the lane's own instruction is *find
      which, rather than re-recording the new number*, and that is what happened.
- [x] A non-holder `styles.css` edit is demonstrated to be refused. **Met by `css-lane`**, which
      fails when the stylesheet hash moves and no phase holds the lane. Observed refusing on
      2026-08-31 and again on 2026-09-01: `check-lane: FAIL — the stylesheet changed and no phase
      claimed the edit`.
- [x] A lane release with an unreviewed changed PNG is demonstrated to be refused. **Not enforced,
      and the record says so every time.** Every lane release note in `css-lane.json` ends with
      *per-image operator sign-off still owed* — the reviewing was done and recorded in prose, and
      nothing refused a release that skipped it.
      **Enforced now, and demonstrated in both directions.** `check-lane` reads the newest history
      entry; when it is a release sitting on the current baseline, it compares the captures git
      reports as changed against a `reviewed` array on that entry. A capture the release does not
      name is refused.

      **Observed red:** appending a byte to `board-view-desktop-light.png` takes the check to
      **exit 1** — *"1 changed capture(s) this release does not name"*, the file listed, and the
      entry reported as carrying no `reviewed` list at all. **Observed green in the other
      direction:** adding that same path to the release's `reviewed` array returns *"release names
      all 1 changed capture(s)"* and exit 0. Both were run, because a rule that only ever refuses is
      a rule nobody can satisfy, and one that only ever passes is not a rule.

      **What it does not claim.** Naming a file asserts that someone opened it, and no check can
      confirm that — this refuses the release that never looked at all, which is the failure the row
      was written about. Older release entries are grandfathered on purpose: only the newest is
      checked, because back-filling `reviewed` onto releases whose reviews nobody did would be
      manufacturing exactly the evidence this rule exists to require.
- [x] A stale replay result is demonstrated to be rejected. **Met by the `evidence` lane**, which
      fingerprints every artefact's inputs and reports one describing a tree that no longer exists.
      Observed rejecting repeatedly on 2026-09-01, once per stylesheet edit.
- [x] Every registered surface family appears in the replay; registry equality between source census
      and runtime census. **Partly instrumented, not asserted.** `surface-census` and `view-census`
      each publish a count; nothing compares them, so the equality this row asks for is computable
      and uncomputed. **Computed and asserted 2026-09-01, on both registries this row names.**
      **The class census, and the first thing it found was itself.** `surface-census` published
      *"rendered but not buildable — 7 (fixture-only markup)"* and named none of them. Listed, all
      seven were built by the plugin — `.db-dropdown-popover`, `.db-menu-item-chevron`,
      `.db-icon-picker-item` and four more, **every one from a template literal the scanner could not
      read**. It walked `StringLiteral` and `NoSubstitutionTemplateLiteral` only, so
      ``cls: `db-dropdown-popover ${context}` `` was invisible and the fixtures were accused of
      drawing markup the plugin does not make. Buildable went **204 → 214**, fixture-only **7 → 0**,
      and the equality is now enforced: `renderedOnly` must be zero. Red with the template walk
      disabled — `7 class(es) render in a fixture that no source file builds`, exit 1.
      **A token that runs into a substitution is dropped, not recorded.** `` `db-option-color-${color}` ``
      would otherwise register `db-option-color-` as a class. The boundary is decided by reading the
      substitution beside it: `${disabled ? " is-disabled" : ""}` cannot extend the token because
      every value it produces is empty or starts with a space, so the class before it is whole;
      anything the walk cannot evaluate is treated as able to extend. **Verified both ways** — no
      recorded class ends in a hyphen, and the three that this rule rescued are the three that a
      cruder guard left behind.
      **The producer registry, driven.** `SURFACE_REGISTRY` declares a `host` and a `mount` for five
      producers, and nothing read it. An entry that says `bodyPortal` while its producer mounts into
      the container is worse than no entry, because every check that trusts the registry is then
      reasoning about a program that does not exist. All five are now opened through their shipped
      entry points and their node's real parent compared to their own entry: `column-menu` and
      `owned-menu` on the body, `record-detail-panel`, `filter-panel` and `date-value-picker` inside
      the container. **The registry is iterated, not listed**, so a sixth producer arrives here red
      rather than silently uncovered — watched, by adding one: `5 of 6 … undriven: chart-options`.
      And watched the other way by flipping `filter-panel` to `body`: `declared host=body … the
      node's parent is .db-panel-host, body=false`.
      **`buildableNotRendered` is 132 and is deliberately NOT enforced.** Those classes exist and the
      plugin builds them; no fixture covers them yet. That is a coverage debt, and failing on it
      would fail a correct tree.
- [ ] Each negative control fails when its dimension is substituted. **True where it has been
      exercised and enforced nowhere.** `012` now machine-checks that every check in its section
      carries a recorded red, and that mechanism is per-phase rather than program-wide.
      **Enforcement now exists program-wide and the row still does not close, which is the honest
      reading.** The placement lane carries a ratchet over provenance coverage: **12 of 384** checks
      sit in a section that records the red it was watched failing at, and that number may rise and
      may not fall. Control: dropping one check out of the attributed section takes it to 11 and the
      lane red.

      **Why a ratchet and not the row's literal demand.** Making it literal means a recorded red for
      every check in the lane, and most were written against correct code and never failed. Demanding
      a number for those is demanding fiction — the same mistake `failing-values` exists to avoid and
      names in its own reason field. So what is enforced is that coverage cannot shrink, not that
      every control has been substituted.

      **This row stays open because 12 of 384 is not "each".** Ticking it would claim the program-wide
      property the ratchet deliberately does not assert. What closes it is sections adopting
      attribution until the count is the whole lane, and the ratchet is what makes that progress
      one-way rather than a number someone re-reads.
- [ ] No compatibility path removed without its agreements recorded. **No check.** The gallery
      deprecation is the live test of it: `030` records the decision and the undo, and nothing
      would have stopped a deletion that did not.
- [ ] **A red operator device review is demonstrated to block a release with the pipeline green** —
      the rehearsal, not just the rule. **Never rehearsed.** The pipeline has been green while
      operator rows stayed open throughout this program, which is the condition, not the rehearsal.
- [ ] The operator confirms on device that each original defect is gone. **That is the only closing
      condition for the program**, and no harness can stand in for it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**PART A — THE HANDOFF REPLAY. Lands before `001` starts. Runs at EVERY lane handoff.**

It re-asserts **every previously-closed phase's criteria against the CURRENT tree**. Minimal by construction — recorded criteria, registry equality and cascade winners, not the full grid — because a handoff gate that takes an hour is a handoff gate that gets skipped, and this repo already has that scar.

**Exit criterion:** a **deliberately reintroduced cascade reversal** in an already-closed phase's surface **fails** the handoff replay, reddening only that phase's cells and going green again when removed (AC-011 / N12). A run that reddens everything is as useless as one that reddens nothing.

Part A also ships the two mechanisms the program was leaving to convention:

**1. CSS lane ownership — a file and a command, not a sentence.**
`../spec.md` §4 says exactly one phase holds `styles.css` at a time, and nothing enforced it while `004` and `005` both unblock after `000` (F6).
- **Records ownership:** `tools/lane/css-lane.json` — `holder` (phase folder name or `null`), `acquiredAt`, `baselineHash` (`sha256(styles.css)` truncated to 12, the same convention `tools/screenshots/verify.mjs:45-48` already uses), `baselineCommit`, and an append-only `history`.
- **Enforces it:** `node tools/lane/check-lane.mjs <acquire|verify|release> --phase <folder>` → `npm run lane:acquire | lane:check | lane:release`.
- **Fails when:** `acquire` is attempted while another phase holds; the current hash differs from `baselineHash` and the lane is free; the hash differs and the requester is not the holder; `release` is attempted by a non-holder, without a green handoff replay, or without a complete capture review. `verify` runs per push and in every phase's own gate block, and costs nothing on branches that never touch the stylesheet.

**2. Capture-review sign-off — the human PNG review gets an artefact and a gate.**
`screenshots:verify` compares recorded source fingerprints; its only PNG operation is an existence check. It **never opens an image** (F9), yet the program cited it as a gate in four places while the compensating human review had no reviewer, no date and no gate.
- **The file:** `specs/005-component-surface-system/<phase>/capture-review.md`, one `## Release N` section per lane release, authored by the **releasing** phase (008 owns the schema and the checker, not the sibling's file).
- **Contents:** Reviewer, Date, the current `styles.css` hash, and one row per changed PNG — before hash, after hash, verdict, note. Verdicts are a closed set: `correct`, `expected-change`, `regression`, `pre-existing-defect (<finding id>)`.
- **Enforces it:** `node tools/lane/check-capture-review.mjs --phase <folder> --release <n>` → `npm run lane:capture-review`, shelled by `lane:release`. The changed-PNG set is derived from **image byte hashes** against a baseline snapshot taken at `acquire`, not from the hand-maintained scenario source list — otherwise it would reproduce the hole it exists to close.
- **Fails when:** a changed PNG has no row; a row names a PNG that did not change; a verdict is outside the vocabulary; any verdict is `regression`; Reviewer or Date is empty; the recorded stylesheet hash is not current; a `pre-existing-defect` names no finding. **A lane release without a complete sign-off fails, and the lane stays held.**

**PART B — THE RELEASE GATE. Runs last.**

- A **registry-driven runtime replay** across every surface family, including checkbox and content-row triggers.
- Local, body, shadow and explicit top-layer mount samples.
- Both themes; desktop, phone and the intermediate touch conditions; visual viewport; **real host chrome including `.mobile-navbar`**.
- Semantic actions, hit tests, focus return, outside/Escape/back dismissal, cleanup.
- Wholesale refresh, anchor replacement, nested surfaces, owner teardown.
- CSS computed-winner evidence on the final file, after the last deletion.
- Six negative controls: raw bypasses, fixture wrappers, stale anchors, missing navbar, wrong visual viewport, capture-only placement.
- Parity traces, compatibility retirement, full captures **and human/device review**.

**IT IS A REPLAY MATRIX, NOT A SCREENSHOT COLLECTION.** A capture proves a frame rendered. It cannot show that a tap landed on the sheet, that focus returned, that exactly one owner dismissed, that the anchor re-resolved after a refresh, or that no listener leaked. Those are the failures 1.3.1 shipped, and they are all invisible to an image.

**COMPATIBILITY RETIREMENT — ONE AT A TIME.** `000` adds `openSurface()` as an adapter and **deletes nothing**. Every removal lands here, one disposition at a time, behind a byte-exact checkpoint, and only once the replay, the registry equality, the capture review and the operator's device review **all** agree. Restore the checkpoint on any regression.

**THE PROOF TUPLE.** Every invariant observed through the same **producer × runtime branch × mount/host × environment × transition × semantic outcome**, paired with a **negative control that fails if any one dimension is substituted**. A missing coordinate is a coverage gap even when the number is technically valid.

**WHAT IS NOT BUILT HERE.**
- **The input-hash recorder.** `000` builds it once, cheaply, for the whole program (F17). This phase **consumes** it: every result carries the hashes it was produced against, and one whose recorded hashes differ from the current tree is rejected as stale — demonstrated, not asserted (AC-010 / N11). Two vintage systems in a repo whose whole problem is two systems disagreeing would be the same mistake again.
- **Any sibling's `capture-review.md`.** This phase owns the schema and the checker.
- **Any sibling's defect fix.** A replay failure is reported back to the owning phase. A patch by the replay owner destroys the independence the replay exists for.

**VITEST IS NOT EVIDENCE HERE.** It runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so the 410-test suite exercises pure logic only and asserts nothing about a rendered surface. Every phase in this program lists it as a quality gate, and the listing invites exactly the mistake 1.3.1 made. It is a **regression guard** — a broken import or a changed pure function should still go red — and a green suite is evidence for **no criterion in this program** (`../adversarial-review.md` O3).

**EVERY NUMBER NAMES ITS PRODUCER.** Each *census* / *trace* cell in `acceptance-criteria.md` states the command that yields the number and the stage at which it is yielded. `000` is building a checker that blocks a phase moving to In Progress with blank cells; this packet is subject to it, and no row may be worked before its named producer has run (F16).
<!-- /ANCHOR:log -->
