---
title: "Rule: Verification gates"
description: "The three commands that must pass before work is claimed complete here, and the reason a green run that changed nothing proves nothing."
trigger_phrases:
  - "claim complete"
  - "is it done"
  - "run the gates"
  - "typecheck"
  - "npm run build"
  - "vitest"
  - "tsc --noEmit"
  - "before saying done"
  - "did the build pass"
  - "exit status"
  - "green run"
  - "verification ladder"
  - "which commands must pass"
  - "plugin build gate"
importance_tier: important
contextType: reference
version: 1.0.0.0
---

# Rule: Verification gates

> Routed from [`REPO RULES.md`](../REPO%20RULES.md). Load it before claiming any work in this repository is complete.
> Expands `AGENTS.md`, never overrides it. Where they appear to disagree, `AGENTS.md` wins and this file is wrong. Say so.

## Fires when

- Saying done, complete, fixed, passing or works.
- Deciding whether a change is ready to hand back.
- Quoting the result of a gate.

## The rule

**All three gates pass, and you read the output and the exit status rather than assuming them.**

---

## 1. THE THREE GATES

```bash
npx tsc --noEmit
npm run build
npx vitest run
```

All three have to pass before work is claimed complete. This rule carries the commands; `evidence-and-proof.md` carries what counts as proof once you have run them.

---

## 2. A GREEN RUN THAT CHANGED NOTHING PROVES NOTHING

Read the output and the exit status. A gate that passed because it matched no files, or ran against a stale build, is green and uninformative.

**The failure this prevents:** quoting an exit code as evidence for a claim the command never tested. When the run touched nothing, say so, rather than presenting it as coverage.

---

## 3. UI WORK HAS A FOURTH GATE

A change that renders anything is not complete on these three alone. See [`screenshot-currency.md`](screenshot-currency.md).

---

## 4. SELF-CHECK

- [ ] All three commands ran, and I read each one's output and exit status.
- [ ] No result is quoted from a run that did not actually exercise the change.
- [ ] UI work also cleared the screenshot gate.
