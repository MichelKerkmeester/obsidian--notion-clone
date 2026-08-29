**Note Database: finish the component surface system — verified, not asserted**

Repo `~/MEGA/Development/Obsidian Plugin`, `main`. Program `specs/public/005-component-surface-system/`.

**WHY.** 1.3.1 passed every gate and changed nothing on device. Then this program shipped a **broken sheet to the operator's phone twice** — unstyled text over the view, still above the navbar — while three purpose-built checks stayed green. Do not trust a green check here.

**THE FOUR RULES THAT CAUSED EVERY FAILURE SO FAR.**
1. **A check that does not drive the production path proves nothing.** The sheet checks called `applySheetChrome` directly and never ran `positionToolbarPopover` — the line that actually decides placement. All 196 captures render static markup and import nothing from `src/`.
2. **Verify on device before claiming.** Fixtures showed a clean Sort panel while the phone showed it destroyed.
3. **A fresh Opus verifies; never self-certify.** Six verifiers found: a vault-wide write added to Open with no `.catch`, 5-of-8 grid columns claimed while the comment said 8, a preset contradicting its own role contract, mobile captures identical in width to desktop, a post-fix number that was the pre-fix number, and a negative control that reads `expect(5).toBe(5)`.
4. **Read the rule before theorising.** The sheet defect was `innerHeight - bounds.bottom` = 106px. Not z-index (Obsidian's navbar declares none — verified in `obsidian.asar`), not the portal.

**STATE — verifier-confirmed, not self-reported.**
- `004` checkboxes — **FAIL.** 84/84 own appearance, but 10 toggles still ancestor-owned; board/gallery/table/list fixtures contain **zero checkboxes**, so the families the operator reported are measured by nothing; one hit target 37×24 (<28). Phone size split fixed (28×28 both).
- `005` rows — 26px overflow fixed and causally isolated. **Raggedness is horizontal, not vertical** — values start at up to 13 x-positions because empty fields are skipped. Row-matrix emits classes the renderer never builds.
- `001` — width policy only, ~15% of the phase. `openSurface` has **zero callers**; no production node carries `data-db-surface`. 15 bespoke widths remain. The three panels share an outer box and nothing else.
- `002` — row 52px→34px, one line, all regimes hold. The removal credited for it was **not** load-bearing; the 8-column frame was.
- `003` — sheet now `bottom: 0`, driven through the real positioner. **Unverified on device.**
- `006` — all four affordances bind `openNote`. Peek is now undiscoverable (Cmd+Enter only).
- `000` — 0/73 rendered surfaces lack tokens (was 70/73). **140 buildable surfaces no fixture renders.**

**DO NEXT.** Fix what verifiers found, in this order: fixtures for the five unmeasured checkbox families → make `checkbox-borrowed-ancestor.test.ts` an actual control → horizontal field alignment in list rows → wire `openSurface` or delete it → 008 Part B release.

**EVERY CLAIM NEEDS.** A check that drives the production code path; a number with a threshold, shown failing first; an image a person opened; a fresh-Opus verdict; operator confirmation on device. Missing any one → the criterion stays open.

**GATE.** `SURFACE_PHASE=<phase> npm run gate` (13 checks). `npm run replay` re-asserts landed results. Lane: `tools/lane/css-lane.json`, one phase at a time, record every edit.

**TRAPS.** A pipe makes `$?` the pipe's status. A changed file hash proves *a* change, not the intended one — target by rule, then assert the property is gone. `git checkout --` silently does nothing for untracked files. Captures are not byte-reproducible; compare `layoutHash`.

**DONE MEANS** the operator confirms on device.
