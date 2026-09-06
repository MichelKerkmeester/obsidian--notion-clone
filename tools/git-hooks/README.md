---
title: "tools/git-hooks: this repo's own pre-commit gate"
description: "The tracked, blocking comment-hygiene pre-commit hook this repository owns, and how to install it — because the pre-commit hook actually installed on this machine is a different, external checker that does not cover this rule's full pattern set."
trigger_phrases:
  - "install pre-commit hook"
  - "comment hygiene pre-commit"
  - "blocking git hook obsidian plugin"
---

# tools/git-hooks: this repo's own pre-commit gate

---

## 1. WHY THIS EXISTS

This machine's git hooks run from a global `core.hooksPath` outside this repository (an
account-wide checkout, not a file this repository tracks or can edit), and that hook's own
comment-hygiene checker does not recognize every artifact-id shape `tools/naming/scan-comments.mjs`
now catches — a bare packet number used as a label (`045's`, `per 045`) and this repo's own
numbered spec-folder path convention are outside its pattern set. A hard block enforced by a script
this repository cannot read, edit or test is not a block this repository can prove. So this repo
carries its own: `pre-commit` here, tracked, running the exact script `tools/gate.mjs`'s `comments`
lane runs.

---

## 2. WHAT IT DOES

`pre-commit` runs `node tools/naming/scan-comments.mjs` (full tree, not staged-files-only — the
scan takes well under a second) and exits non-zero — blocking the commit — on any violation:
missing `MODULE:` banner, missing numbered sections, commented-out code, or an ephemeral artifact
id in a comment or a `describe`/`it`/`test` name. See
[`../naming/README.md`](../naming/README.md) §2 for the artifact-id patterns.

---

## 3. INSTALL

This machine already has a global `core.hooksPath` (`git config --get core.hooksPath`), so a local
`.git/hooks/pre-commit` file is never consulted — git only reads the hooks directory `core.hooksPath`
names. Point it at this folder instead:

```bash
git config core.hooksPath tools/git-hooks
```

That is a **local** setting: it lives in this repository's `.git/config`, not the global one, and
does not touch anything outside this checkout. Because this repository does not have
`extensions.worktreeConfig` enabled, `.git/config` is shared by every worktree of this repository —
installing it from any one worktree turns it on for all of them, not only the one you ran it from.

To try the hook without installing anything (leaves no config behind, scoped to one command):

```bash
git -c core.hooksPath=tools/git-hooks commit -m "..."
```

**Uninstall** (return to whatever `core.hooksPath` pointed at before):

```bash
git config --unset core.hooksPath
```

---

## 4. RELATED

- [`../naming/README.md`](../naming/README.md) — the scanner this hook runs, and the artifact-id
  patterns it checks.
- [`../gate.mjs`](../gate.mjs) — the `comments` lane, the same script this hook runs standalone.
