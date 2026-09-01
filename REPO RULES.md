# Repo Rules, Obsidian Note Database

> Per-repository router. `AGENTS.md` carries what is true in every repository. The rules
> below carry how to think and act; the ones marked **local** carry what is true only here, > the paths, the commands, the numbers, the traps.
>
> When a rule and `AGENTS.md` disagree about a *rule*, `AGENTS.md` wins. About a *path,
> command or number*, the local rule wins.

The comment-hygiene rule this repository used to carry is not reproduced here. It is an
`AGENTS.md` §1 HARD BLOCK, so it binds on every turn whether or not a trigger fires; a
copy behind a trigger would bind less, not more.

---

## 1. HOW TO USE THIS

1. **Match on the action you are about to take** not the topic of the request.
2. **Load before the action.** A rule read afterwards is a post-mortem.
3. **A file already in context is not re-read.**
4. **Every trigger that fires is loaded, not just the first.** They compose; the more
   specific wins on conflict. Three and four firing at once is the normal case, not an
   edge case.
5. **Nothing fires → `AGENTS.md` alone governs.** Do not hunt for a rule to apply.

### Precedence

| Level | Source | Can be overridden? |
|-------|--------|--------------------|
| 1 | Every `AGENTS.md` §1 hard blocker, the Four Laws, PLAN-WORKFLOW LOCK, Comment Hygiene, and every mandatory gate in §2 | No |
| 2 | An explicit, in-the-moment operator instruction | Not applicable, it is the instruction |
| 3 | These rule files | Only by level 1 or 2 |
| 4 | General judgment | By anything above |

A rule file may tighten `AGENTS.md`. None relaxes a HARD BLOCK or authorizes what
`AGENTS.md` forbids. Gate 5 does not change that: it makes the **load** mandatory,
while what you load stays at level 3, the obligation to read is tier 1, the content
is not.

---

## 2. TRIGGER TABLE

| You are about to | Load | It settles |
|------------------|------|------------|
| Add a file, module, class, interface, option, layer, or dependency · generalize something that works · write "flexible", "future-proof", "might need", "best practice" · add a test beyond the coverage floor | [`prevent-overengineering.md`](repo-rules/prevent-overengineering.md) | Whether this should exist at all, and at what size |
| Touch a file outside the ask · fix something noticed in passing · rename, reformat, or delete beyond the named area · deviate from an approved plan | [`scope-discipline.md`](repo-rules/scope-discipline.md) | What is yours to change, and how to raise what isn't |
| Say "done", "works", "fixed", "passing", "no regressions" · report a result · quote a number · act on a tool's or sub-agent's success report · close out a turn | [`evidence-and-proof.md`](repo-rules/evidence-and-proof.md) | What counts as proof, how a green run lies, what an honest close-out contains |
| Hand work to another runtime: a CLI executor, sub-agent, fan-out lineage, or deep loop · compose the prompt one will act on · accept or quote what one returned · answer a judgment question from your own reading alone | [`delegation-and-orchestration.md`](repo-rules/delegation-and-orchestration.md) | The orchestrating posture, what a brief must carry, why one model is one opinion |
| Delete, overwrite, migrate, deploy, publish, send, install · force-push or rewrite history · change a shared contract · touch auth, data, or config | [`blast-radius.md`](repo-rules/blast-radius.md) | Reversibility, the rollback sentence, when to stop for a yes |
| Diagnose a failure · make a red check green · attempt the same fix twice · add a special case, retry, sleep, or broadened catch | [`root-cause-and-debugging.md`](repo-rules/root-cause-and-debugging.md) | Fixing the producer instead of the symptom, and when to level up to the seam |
| Answer without certainty · contradict the operator · fill a gap with a plausible guess · hit a contradiction between two things that must both be true | [`uncertainty-and-honesty.md`](repo-rules/uncertainty-and-honesty.md) | Confidence bands, UNKNOWN, contradiction halts |
| Write any substantive reply · present a recommendation, a fork, or a trade-off · answer a complex or ambiguous request · the reader says they did not follow | [`communication.md`](repo-rules/communication.md) | How a reply reads: sentence shape, length, filler, verdict-first order, Ask→Do framing |
| Wire, rewire or remove a mode in a parent-hub skill · edit a hub's registry, router, `ROUTER.md`, `graph-metadata.json` or `SKILL.md` mode table · report that a mode is registered, routed or integrated · quote a per-hub gate result | [`skill-hub-routing.md`](repo-rules/skill-hub-routing.md) | The two routing stages, what "integrated" requires, and checking the hub you actually changed |
| Answer the documentation-scope question · write into a spec folder · cite, build or follow a `specs/` path · move, rename or create a top-level packet · decide whether something under `specs/` is tracked | [`spec-tree-layout.md`](repo-rules/spec-tree-layout.md) **local** | Where packets live since the flattening, what a move breaks silently, and the one place a stale path is correct |
| Add or change a view, component or state · claim UI work is done · read a capture to judge a surface | [`screenshot-currency.md`](repo-rules/screenshot-currency.md) **local** | Which captures go stale, what registers a new surface, and what the harness is not |
| Say done, complete, fixed or passing · quote a gate result · hand work back | [`verification-gates.md`](repo-rules/verification-gates.md) **local** | The three commands that must pass, and why a green run that changed nothing proves nothing |

---

## 3. INDEX

| Rule | Binding sentence |
|------|------------------|
| [Prevent overengineering](repo-rules/prevent-overengineering.md) | Build the smallest thing that solves the stated problem; take a costlier move only by naming what fails at the cheaper one. |
| [Scope discipline](repo-rules/scope-discipline.md) | The requested scope is the deliverable, adjacent problems get named, not fixed. |
| [Evidence and proof](repo-rules/evidence-and-proof.md) | A claim is only as strong as the observation behind it. |
| [Delegation and orchestration](repo-rules/delegation-and-orchestration.md) | Delegating makes you the orchestrator; brief with evidence, and no single model's verdict closes a question. |
| [Blast radius](repo-rules/blast-radius.md) | Size effort to what the change can break; no irreversible step without a named rollback and a yes. |
| [Root cause](repo-rules/root-cause-and-debugging.md) | Fix the producer, not the symptom; every fix names the mechanism. |
| [Uncertainty and honesty](repo-rules/uncertainty-and-honesty.md) | Never fabricate; mark the confidence you actually have. |
| [Communication](repo-rules/communication.md) | Write so the reader can act after one pass: one idea per sentence, verdict first, nothing that does not carry information. |
| [Skill hub routing](repo-rules/skill-hub-routing.md) | A hub projects one advisor identity and routes in two stages; registered is not routed, and a gate run without its hub argument checks something else. |
| [Spec tree layout](repo-rules/spec-tree-layout.md) **local** | Packets sit directly under `specs/`; a path with `public/` in it is stale everywhere except a run record, where it is history. |
| [Screenshot currency](repo-rules/screenshot-currency.md) **local** | A surface is not done until a current capture of it exists and you have looked at the image. |
| [Verification gates](repo-rules/verification-gates.md) **local** | All three gates pass, and you read the output and the exit status rather than assuming them. |

---

## 4. SCOPE OF THIS DOCUMENT

**In:** how to think and act, restraint, scope, evidence, risk, diagnosis, honesty,
the posture to hold when work is handed to another runtime, how the resulting reply
reads, and what you may claim about wiring you have changed. Plus, in the **local**
rules only, the paths, commands, numbers and baselines true of this repository.

**Out:** skill routing, workflow selection, spec-folder mechanics, and the *mechanics*
of agent and CLI dispatch, which agent, which command, which model, which flags. Spec-folder
**layout** is in, and is not the same thing: where the packets sit on disk is a repo-local path
fact, while which documents a packet owes and when is the kit's.
Those belong to `AGENTS.md` §2 and the skills it routes to. The line is between
plumbing and posture: how to dispatch is theirs, how to think while dispatching is ours.

The shared rules are symlinked from the Public monorepo and are git-ignored here; edit
them there. The local rules and this router are tracked in this repository.
