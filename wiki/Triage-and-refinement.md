# Triage and refinement

Triage-refinement is the routine that keeps the backlog purposeful. Every open Issue is open on purpose, connected to related work, and prepared so that work can start without rediscovering its context.

The routine runs on its own, separately from ordinary work, at a pace set by throughput: daily when much arrives, weekly when little does. Ordinary work still links related Issues when it finds them, but it doesn't run the routine.

## Triage

Triage is the quick first stage. It can also run as Issues arrive.

1. Look for an existing record. Close a duplicate as a duplicate, with a link to the canonical Issue.
2. Close what will not be done as not planned, with the reason.
3. Check that the Issue states one outcome. Ask for missing evidence in a comment.
4. Add a type label, then decide the next step: refine the Issue, or place it directly when it is already ready.

## Refinement

Refinement is research. It prepares an Issue so that whoever picks it up starts with the full picture.

- **Research.** Reproduce the problem, read the relevant source and records, and record the findings as dated comments. Update the body when they change the scope.
- **Connect.** Link Issues that the research shows belong together, even when their titles don't suggest it. Use blocked-by links for order, sub-issues under a parent for a shared cause or goal, and duplicate closure for the same problem. Move a reusable finding into this handbook.
- **Prepare.** Confirm that the Issue states its scope, acceptance, dependencies and the checks that would prove it.
- **Decide.** Set the Project status to Ready, or to Needs decision with the open question stated in the Issue.

## Record a disposition

Every open Issue leaves a pass with one disposition:

| Disposition | Record |
|---|---|
| Placed | A horizon milestone and an entry in the planning Project, with a priority when it matters. |
| Linked | A duplicate is closed with its canonical link. A part becomes a sub-issue, or is blocked by its prerequisite, and is placed with it. |
| Postponed | A later horizon, with the reason and what would bring the Issue back. |
| Closed | Not planned, with the reason. |
| Kept open | The `kept open` label and a comment with the reason, such as a dependency on an upstream fix or a tracked known limit. A later pass reviews it again. |

An open Issue without a horizon milestone or the `kept open` label is untriaged.

## Run a pass

1. Find the untriaged Issues with the repository's Issue search: `is:issue is:open no:milestone -label:"kept open"`.
2. Triage them first. Then refine from the top of the soon horizon downwards, and continue with the after horizon. In the planning Project, **Current cycle** shows the soon horizon by status, and **Needs decision** lists the open questions.
3. Review kept-open Issues, oldest update first: `is:issue is:open label:"kept open" sort:updated-asc`.
4. Record each decision on the Issue itself.

A pass is done when no Issue is untriaged and every Issue in the soon horizon is ready or has its pending decision stated. When passes regularly find a long list, or nothing, change their pace.
