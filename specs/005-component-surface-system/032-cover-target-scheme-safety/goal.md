---
title: "Goal: Cover Target Scheme Safety"
description: "A cover click target is opened without checking its URL scheme; the safe helper already exists and covers do not use it."
trigger_phrases: ["032 goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/032-cover-target-scheme-safety"
    last_updated_at: "2026-09-02T22:30:00Z"
    last_updated_by: "goal-audit-2"
    recent_action: "Struck stale 'nothing has started' log line; shipped in 8ff9c3f4"
    next_safe_action: "The operator confirms a real cover still renders and opens on device"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-032-goal"
      parent_session_id: null
    completion_pct: 100
    open_questions: ["Is this P0 once the onerror teardown and Chromium inertness are weighed"]
    answered_questions: ["The allowlist helper exists and every text-link path already uses it"]
---
# Goal: Cover Target Scheme Safety

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** A cover image can never open a target whose scheme the rest of the plugin would reject.

**This is a one-line routing gap, not a missing capability.** `normalizeExternalUrlTarget`
already rejects any non-http(s) scheme and every text-link path calls it. Covers call `window.open`
directly. The fix is which function the cover path calls.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Use the existing helper. A second definition of "safe URL" would drift from the first. |
| D2 | The control is three literal strings — a `javascript:`, a `data:` and a `file:` target each ending in an image extension. They pass today. |
| D3 | Severity is **disputed and recorded as such**, not adopted at P0 on one reviewer's label. |
| D4 | The tests currently pin the vulnerable behaviour as intended, so a fix rewrites tests. That is expected, not a surprise to discover mid-change. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] The three exploit strings are rejected, asserted with those exact strings. **Met** — the
      strings are pinned in the test, not described.
- [x] An http(s) cover and a vault-internal cover both still open — the fix must not trade a hole
      for a regression. **Met** — both asserted in the same suite as the refusals, so refusing
      everything would fail here rather than pass.
- [x] External opens pass `noopener`. **Met** — all ten sites route through one helper, and a
      test asserts it is the only place in `src/` that calls `window.open`.
- [x] The severity question is answered and recorded. **Not P0, fixed anyway** — the reasoning,
      including which mitigation was checked rather than repeated, is under T6 in `tasks.md`.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

~~**Nothing has started.**~~ *Stale, corrected 2026-09-02: shipped in `8ff9c3f4`, all four
criteria met.*

**On the severity.** The original finding rated this P0. A fresh reviewer found three mitigations it
never weighed: the victim must configure the attacker-controlled key as the cover field; the cover's
`onerror` removes the clickable element when a `javascript:` target fails to load, destroying the
target before a click is possible; and top-level `javascript:` navigation is inert in Chromium. The
residual real case is a valid `data:image/png;base64,…` ending in an image extension.

Recorded rather than resolved, because adopting a severity label from one lane without weighing its
mitigations is the finding-as-hypothesis trap this packet names.
<!-- /ANCHOR:log -->
