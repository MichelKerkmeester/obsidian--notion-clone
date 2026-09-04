---
title: "Implementation Plan: Document and Release the List Removal"
description: "Write what a user needs to know, check it item by item against the audit's declared-loss list, close the two phases that were fixing the removed view, and ship."
trigger_phrases:
  - "list removal docs plan"
  - "deprecation release plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Document and Release the List Removal

<!-- SPECKIT_LEVEL: 1 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Markdown, plus i18n strings if the in-app changelog carries the notice |
| **Framework** | None |
| **Storage** | None |
| **Testing** | `i18n-key-coverage.test.ts` if strings are added; otherwise a read |

### Overview

Three writes and a release. The README's view list, the changelog entry, and the two `005` phases
that were fixing a view that no longer exists.

The one part that needs care is the changelog's rollback sentence. Reverting `007` brings the
renderer back and leaves migrated views as tables, permanently. That is counter-intuitive enough
that it has to be stated rather than implied, because it is the sentence a user will quote back.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Document-then-release. The only structure worth naming is the check: the changelog is verified
item by item against `005`'s declared-loss list, not summarised from it.

### Key Components
- **`README.md`**: the view list, which currently names the list view.
- **The changelog**: what was removed, what existing views became, every declared loss by name, and
  what a rollback does not undo.
- **`033-list-virtualisation` and `024-list-view-freeze`**: closed against this decision, with the
  reason recorded in each document.

### Data Flow

None. This phase writes prose and cuts a release.
<!-- /ANCHOR:architecture -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`i18n-key-coverage.test.ts` if the in-app changelog modal carries the notice, since that string is
localised. Otherwise the verification is a read: the changelog against `005`'s declared-loss list,
item by item.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`007-remove-renderer-and-harness` must be complete, and `005`'s declared-loss list must exist. Both
are sequential preconditions rather than risks.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Revert the documentation commit. The release itself is rolled back by publishing the previous
version, per this repository's release cadence.
<!-- /ANCHOR:rollback -->

---

