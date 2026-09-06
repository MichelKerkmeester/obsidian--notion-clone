---
title: "tools/git-hooks: this repo's own pre-commit gate"
description: "The tracked, blocking comment-hygiene pre-commit hook this repository owns, what it adds over the external checker this machine actually runs, and why installing it costs more than it looks."
trigger_phrases:
  - "install pre-commit hook"
  - "comment hygiene pre-commit"
  - "blocking git hook obsidian plugin"
---

# tools/git-hooks: this repo's own pre-commit gate

---

## 1. WHAT ACTUALLY BLOCKS

**The gate's `comments` lane blocks landing; the repo-owned hook below blocks only when installed.**
Nothing installs it for you, and this repository does not install it by default — see §3 for why
that is deliberate.

This machine's git hooks run from a global `core.hooksPath` outside this repository (an
account-wide checkout, not a file this repository tracks or can edit). That external chain **does**
carry its own blocking comment-hygiene gate, so it is not the case that nothing checks commits
here. What it does not check is the remainder:

| Shape | External pre-commit | `scan-comments.mjs` |
|---|---|---|
| `ADR-`/`REQ-`/`CHK-` id, `T123`, `specs/<name>/` path in a comment | blocks | blocks |
| `AC-001` id | passes | blocks |
| bare packet number as a label (`045's`, `per 045`) | passes | blocks |
| id in a `describe`/`it`/`test` name | passes | blocks |
| id in `styles.css` | not read at all | blocks |
| a violation in a file you did not stage | not read at all | blocks |

The external hook reads comment lines in staged `.ts/.js/.mjs/.py/.sh` files only; `.css` exits
its extension check unscanned. So the two overlap on the common shapes and diverge on the rest,
which is the reason this repo carries its own rather than the claim that the external one does
nothing.

---

## 2. WHAT IT DOES

`pre-commit` runs `node tools/naming/scan-comments.mjs` (full tree, not staged-files-only — the
scan takes well under a second) and exits non-zero — blocking the commit — on any violation:
missing `MODULE:` banner, missing numbered sections, commented-out code, or an ephemeral artifact
id in a comment or a `describe`/`it`/`test` name. See
[`../naming/README.md`](../naming/README.md) §2 for the artifact-id patterns.

---

## 3. RUNNING IT — AND WHY NOT TO INSTALL IT PERMANENTLY

Git reads hooks from exactly one directory. Setting `core.hooksPath` to this folder does not add
this hook to the chain, it **replaces the chain**, and this folder holds only `pre-commit`. Every
other hook the global path supplies then stops running: `commit-msg`, `post-commit`, `post-merge`,
`post-rewrite`, and `pre-push` — the last of which is the technical backstop for the remote-push
policy. Trading that away to gain one lane the gate already enforces is a bad trade, so:

**Use the scoped, one-invocation form.** It leaves no config behind and costs the chain nothing:

```bash
git -c core.hooksPath=tools/git-hooks commit -m "..."
```

Or just run the lane directly, which is the same check without touching git at all:

```bash
node tools/naming/scan-comments.mjs
```

A permanent install is available and is a deliberate choice to accept the loss above:

```bash
git config core.hooksPath tools/git-hooks   # replaces the whole hook chain for this repo
git config --unset core.hooksPath           # undo
```

That setting is local to this repository's `.git/config`. Because `extensions.worktreeConfig` is
not enabled here, that file is shared by every worktree — installing from any one worktree turns
it on for all of them. The durable fix is to wire this lane into the global chain instead of
displacing it; that work is tracked in the parent program's roadmap and is out of this
repository's scope.

---

## 4. RELATED

- [`../naming/README.md`](../naming/README.md) — the scanner this hook runs, and the artifact-id
  patterns it checks.
- [`../gate.mjs`](../gate.mjs) — the `comments` lane, the same script this hook runs standalone.
