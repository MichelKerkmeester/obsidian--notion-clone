---
title: "Tasks: Cover Target Scheme Safety"
description: "Route cover targets through the allowlist the rest of the plugin already uses."
trigger_phrases: ["032 plan", "032 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/032-cover-target-scheme-safety"
    last_updated_at: "2026-08-31T22:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Covers routed through the allowlist; all ten external opens now sever the opener"
    next_safe_action: "The operator confirms a real cover still renders and opens on device"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-032"
      parent_session_id: null
    completion_pct: 100
    open_questions: ["Is this P0 once the onerror teardown is weighed"]
    answered_questions: ["The safe helper already exists and text links use it"]
---
# Tasks: Cover Target Scheme Safety

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [x] **T1** Write the failing control — REQ-001.
      *Evidence to close:* the three exploit strings reach `window.open` today, asserted.
      *Closed by:* running the two gates against the exact strings before changing anything. All
      three passed `isImageTarget` AND `hasUrlScheme`, so all three were marked external and handed
      through unchanged — while `normalizeExternalUrlTarget`, the allowlist the repo already had,
      returned `null` for every one of them. The rewritten tests then failed 4 and passed 11: the
      http(s) and vault-internal cases were green throughout, so the control discriminates rather
      than simply refusing everything.
- [x] **T2** Route covers through the existing allowlist helper — REQ-001.
      *Evidence to close:* T1 inverts; the three strings are rejected.
      *Closed by:* one line in `parseCoverImage`. Rejecting at PARSE time rather than at the click,
      so no cover element is built for a target that must not be opened — there is nothing to click
      rather than a click that is refused.
- [x] **T3** Rewrite the tests that pinned the vulnerable behaviour — REQ-003.
      *Evidence to close:* the tests assert rejection, with the reason recorded beside them.
      *Closed by:* three tests asserted `expect(image).not.toBeNull()` for `javascript:` and `data:`
      covers — the defect written down as the intent. They now pin the exact strings that must not
      parse, with a note saying why the old assertion existed, so this does not read as a test
      loosened to suit new code.
- [x] **T4** Audit `window.open` sites for `noopener` — REQ-002.
      *Evidence to close:* every external open passes it, or the exception is named.
      *Closed by:* ten bare `window.open(target)` calls across six renderers, none passing
      `noopener` — each handed the opened page a live `window.opener` back into the running app.
      All ten now route through `openExternalUrl`, which re-validates and opens with
      `noopener,noreferrer`. No exceptions were needed.
      *And the audit is now standing:* a test asserts `open-external.ts` is the ONLY place in
      `src/` that calls `window.open`. A guard with a way around it is not a guard, and that is a
      property of the source rather than of any one behaviour. Verified it can fail — adding a bare
      call to a renderer turns it red.
- [x] **T5** Legitimate covers still open — REQ-004.
      *Evidence to close:* an http cover and a vault-internal cover both render and open.
      *Closed by:* both asserted in the same suite as the refusals, so a fix that closed the hole by
      refusing everything would fail here. `https://example.com/real.png` parses external and never
      touches vault resolution; the internal wikilink cover still resolves to a real local src; and
      `openExternalUrl` upgrades a bare domain rather than rejecting it.
- [x] **T6** Answer the severity question in `spec.md` §1.
      *Evidence to close:* a recorded decision, not one lane's label adopted verbatim.
      *Answered:* **not P0, and fixed anyway.** The three mitigations the reviewer raised hold, and
      one of them was checked rather than repeated: `board-renderer.ts` does attach an `onerror`
      that removes the clickable element, so a `javascript:` target destroys its own affordance
      before a click is possible. Top-level `javascript:` navigation is inert in Chromium, and the
      victim must first configure an attacker-controlled key as the cover field. That is a narrow
      path.
      What decided it was not severity but cost: the allowlist already existed, every text link
      already used it, and covers were the one consumer that did not. A one-line fix that removes a
      whole class does not need a P0 label to be worth doing, and arguing the rating further would
      have cost more than the fix. The `noopener` half is the broader win — it applied to all ten
      external opens, not just covers.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T2 through T6 close and `npm run gate` exits 0.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · parent [`../spec.md`](../spec.md)
<!-- /ANCHOR:cross-refs -->
