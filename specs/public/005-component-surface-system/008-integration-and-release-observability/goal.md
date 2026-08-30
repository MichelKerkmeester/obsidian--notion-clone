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
- Every earlier phase's criteria re-pass **from the current tree at every handoff**, and from the final tree at release — not from the tree they were written against.
- A seeded reversal is demonstrated to fail the handoff replay, and only in its own cells.
- A non-holder `styles.css` edit is demonstrated to be refused.
- A lane release with an unreviewed changed PNG is demonstrated to be refused.
- A stale replay result is demonstrated to be rejected.
- Every registered surface family appears in the replay; registry equality between source census and runtime census.
- Each negative control fails when its dimension is substituted.
- No compatibility path removed without its agreements recorded.
- **A red operator device review is demonstrated to block a release with the pipeline green** — the rehearsal, not just the rule.

**DONE MEANS** the operator confirms on device that each original defect is gone. That is the only closing condition for the program.
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
- **The file:** `specs/public/005-component-surface-system/<phase>/capture-review.md`, one `## Release N` section per lane release, authored by the **releasing** phase (008 owns the schema and the checker, not the sibling's file).
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
