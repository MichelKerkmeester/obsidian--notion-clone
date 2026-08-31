---
title: "Implementation Summary: Cover Target Scheme Safety"
description: "Covers now pass the allowlist every text link already passed, and the ten external opens sever the opener."
trigger_phrases:
  - "032 implementation summary"
  - "cover scheme fix"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/032-cover-target-scheme-safety"
    last_updated_at: "2026-08-31T22:30:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Covers routed through the allowlist; all ten external opens now sever the opener"
    next_safe_action: "The operator confirms a real cover still renders and opens on device"
    blockers:
      - "No cover has been opened on the operator's device"
    key_files:
      - "spec.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-032-impl"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Not P0, and fixed anyway — the cost of the fix decided it, not the rating"
      - "data:image is refused with the rest; nothing can tell it from a html payload"
---
# Implementation Summary: Cover Target Scheme Safety

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 032-cover-target-scheme-safety |
| **Level** | 1 |
| **Status** | In progress — all four criteria met, awaiting the operator's device |
| **State** | Gate 18 green, exit 0; tsc, build and vitest all exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

**One line in the parser, and one function replacing ten call sites.**

`parseCoverImage` now refuses any external target that `normalizeExternalUrlTarget` rejects — the
allowlist this repository already had, which every text link already used and which covers were the
single consumer to skip. The rejection happens at PARSE time, so no cover element is ever built for
a target that must not be opened: there is nothing to click, rather than a click that is refused.

`openExternalUrl` is now the only way this plugin hands a URL to the browser. Ten bare
`window.open(target)` calls across six renderers each handed the opened page a live `window.opener`
back into the running app; all ten now re-validate and open with `noopener,noreferrer`.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE HOLE, AND WHY IT SURVIVED REVIEW

The extension test only looks at the END of the string. `javascript:alert(1)#x.png` and
`data:text/html;base64,…#a.png` both satisfy it, while the scheme in front is what actually opens.
Marking a scheme "external" then looked like the safety check, and it was half of one: it kept the
target away from vault resolution and handed it, unchanged, to `window.open`.

Measured before changing anything — all three exploit strings passed `isImageTarget` **and**
`hasUrlScheme`, and the allowlist returned `null` for every one of them. The fix was already in the
repository; covers simply did not call it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| The control discriminates | The rewritten tests failed **4 and passed 11** before the fix. The http(s) and vault-internal cases were green throughout, so this is not a check that refuses everything |
| The exact strings are pinned | Not a description of the rule — the three inputs that must not parse are in the test, because a prose rule can be satisfied by a parser rejecting for an unrelated reason |
| Legitimate covers still work | `https://` parses external without touching vault resolution; the internal wikilink still resolves to a real local src; a bare domain is upgraded rather than refused |
| The opener is severed | Asserted on the call itself: `("https://example.com/real.png", "_blank", "noopener,noreferrer")` |
| A refusal opens nothing | Asserted as `window.open` not being called at all — not as "opened something harmless" |
| There is no second door | A test asserts `open-external.ts` is the only place in `src/` calling `window.open`. **Verified it can fail**: adding a bare call to a renderer turns it red |
| Gates | `npx tsc --noEmit`, `npm run build`, `npx vitest run` all exit 0 — 540 tests, up from 531 |
| Gate | `npm run gate` — 18 green, exit 0 read from `$?` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

No cover has been rendered or clicked on the operator's device. Everything here is asserted against
the parser and the open helper directly.

`noopener` is asserted on the **arguments passed** to `window.open`, not on the resulting window —
the browser's behaviour given those arguments is taken as given rather than measured.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DECISIONS

| Item | Note |
|---|---|
| Severity: **not P0, fixed anyway** | The reviewer's three mitigations hold, and one was checked rather than repeated — `board-renderer.ts` really does attach an `onerror` that removes the clickable element, so a `javascript:` target destroys its own affordance. What decided it was cost, not rating: the allowlist existed, every text link used it, covers were the one consumer that did not |
| `data:image/...` refused with the rest | The one case with an arguable use. Nothing in the parser can tell it from the html payload without trusting the string's own claim about itself, and a cover has no need of an inline image the vault could hold |
| Rejected at parse, not at click | A guard on the click leaves a clickable element whose target must never be opened. Refusing earlier means the affordance is never built |
| The audit was made standing | T4 asked to audit ten call sites. An audit is true on the day it is run, so it was replaced with an assertion that no eleventh site can appear |
<!-- /ANCHOR:decisions -->
