# Live verification

Asks the **running Obsidian** for measurements, from a shell.

Every other harness in this repository measures a reproduction — a fixture, a Storybook story, a
headless page with a hand-built workspace. None of them measures the product you actually install,
with your theme and your other plugins loaded. A release once passed every one of those checks and
changed nothing anyone could see; this directory exists to close that gap.

## Use it

```bash
# Does the real app answer at all?
node tools/live/probe.mjs --check transport

# Ask it anything that returns JSON
node tools/live/probe.mjs --eval "JSON.stringify(getComputedStyle(document.body).fontSize)"
```

**Obsidian must be open.** The transport is Obsidian's own command-line interface, which talks to a
running app and exits with an error when there is none. That makes this a developer-loop and review
instrument rather than an unattended CI gate, and the exit codes say so:

| Exit | Meaning |
|---|---|
| `0` | every assertion held |
| `1` | an assertion failed — the product is wrong |
| `2` | the question could not be asked — app closed, CLI missing, eval refused |

**`1` and `2` are deliberately different.** A caller that treats "could not ask" as "nothing wrong"
has rebuilt exactly the blindness this instrument exists to remove.

## What else lives here

`guard-inverted-assertions.mjs` refuses a check that certifies a defect instead of catching it. One
geometry assertion used to require a widthless popover to render at its absurd default width; it was
green, it ran on every push, and any correct fix would have turned the pipeline red — so it quietly
defended the bug. The inversion is a few lines in a file that several later stages all edit, and a
conflict resolution reverts that kind of change without anyone noticing. The guard is cheaper than
rediscovering the trap.

```bash
npm run guard:assertions
```

## Mobile

Not automatable, and the spec says so plainly rather than pretending. The dev handlers sit behind a
desktop-only guard over a transport iOS does not have. The phone story stays: emulation on desktop
with its limits stated, and the operator looking at their own device.
