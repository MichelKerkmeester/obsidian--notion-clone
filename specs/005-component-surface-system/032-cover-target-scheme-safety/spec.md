---
title: "Feature Specification: Cover Target Scheme Safety"
description: "A cover image's click target is opened without checking its URL scheme, so a javascript: or data: target ending in an image extension reaches window.open."
trigger_phrases: ["cover image scheme", "F001", "javascript url cover", "032 cover safety"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/032-cover-target-scheme-safety"
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
    open_questions: ["Is this P0 or lower once the onerror teardown and Chromium's inertness are weighed?"]
    answered_questions: ["The repo already has the correct helper; text links use it and covers do not"]
---
# Feature Specification: Cover Target Scheme Safety

> Phase chain: parent [`../spec.md`](../spec.md). Opened from deep-review findings F001 and F010.

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 032-cover-target-scheme-safety |
| **Level** | 1 |
| **Status** | **In progress — 4 of 4 criteria met, awaiting device.** In the tree: `parseCoverImage` refuses any external target the allowlist rejects, and all ten external opens route through `openExternalUrl` with `noopener,noreferrer`. Open: the operator confirming a real cover still renders and opens |
| **Complexity** | 15/100, confidence 90% |

**On the declared level.** `recommend-level.sh` returned Level 0; this folder declares Level
1. Raising it is permitted and is recorded here rather than left silent: A security defect with a disputed severity and a test rewrite is not a no-doc change, whatever the line count says. The scorer
reads line and file counts and cannot see either.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

Cover images accept any URL scheme and open it. `parseCoverImage` requires the target to *end* in an
image extension and then marks anything with a scheme as external; the renderers pass that straight
to `window.open`. Because the extension test only looks at the end of the string, a target like
`javascript:…#x.png` or `data:text/html;base64,…#a.png` satisfies both gates. Verified by running
the two expressions against those inputs.

`isCoverImageBlocked` only blocks when the column type is `files`, so any other cover column is
unguarded. `board-renderer.ts:971` and `gallery-renderer.ts:719` are the sinks.

**The repository already contains the fix.** `normalizeExternalUrlTarget` returns null for any
non-http(s) scheme, and every text-link path uses it. Covers do not.

**Severity is disputed and that is recorded rather than resolved.** A fresh reviewer found three
mitigations the original finding did not weigh: the victim must configure the attacker-controlled
key as the cover field; `board-renderer.ts:989` attaches an `onerror` that removes the clickable
element, so a `javascript:` image destroys its own target before a click is possible; and top-level
`javascript:` navigation is inert in Chromium. The residual real case is a valid
`data:image/png;base64,…` ending in an image extension. Worth fixing; not obviously P0.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.** Routing cover targets through the existing allowlist helper; auditing the other
`window.open` sites named by F010 for a missing `noopener`; and updating `cover-image.test.ts`,
which **currently pins the vulnerable behaviour as intended** — a fix rewrites tests, not just the
parser.

**Out of scope.** The link pipeline itself, which is already correct and is the reference.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | A cover target with a non-http(s) scheme never reaches `window.open`. |
| REQ-002 | External `window.open` calls pass `noopener`. |
| REQ-003 | The tests that pinned the old behaviour assert the new one, with the reason recorded. |
| REQ-004 | Legitimate covers — http, https, and vault-internal paths — still open. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [x] `javascript:`, `data:` and `file:` targets ending in an image extension are rejected, asserted
      with those exact strings as the control.
- [x] An http(s) cover and a vault-internal cover both still open.
- [x] The severity question in §1 is answered and recorded, rather than left as one lane's label.
- [x] `npm run gate` exits 0. **18 green, read from `$?`.**
<!-- /ANCHOR:success-criteria -->
