# Information homes

Each topic has one maintained home. Other places link to it instead of copying it. The homes follow the question a reader asks: what happened and what we learned, what is changing now, and what comes next.

## Past: what happened and what we learned

| Information | Home |
|---|---|
| Problems, reproduction, investigation and resolution | Issues |
| Reusable explanations, findings, reasons and methods | This handbook |
| Delivered results, artifacts and known limits | Releases |
| Replaced text and code | Git history |

## Present: what is changing now

| Information | Home |
|---|---|
| Current changes, review, checks and blockers | Pull requests and the Issues they work on |

## Future: what comes next

| Information | Home |
|---|---|
| Ideas, backlog and readiness | The planning Project |
| Horizons, dates and the order of selected work | Milestones |

[Project planning](Project-planning.md) explains both. The time categories describe the reader's question, not the age of a record: an open Issue can describe a current problem, and a handbook page explains today's method.

## Repository entry files

| Entry | Purpose |
|---|---|
| README | Project overview, real component boundaries, and links to these homes. |
| CONTRIBUTING | The common process for people and agents. |
| AGENTS | Additional instructions for agents. It links to the common rules instead of repeating them. |
| Source, tests and configuration | Actual behavior and executable contracts. |

Code explains ordinary behavior. Comments explain non-obvious reasons, constraints and invariants. A component README belongs at a real component boundary.

Maintained explanations belong in this handbook, not in a `docs/` folder. When a repository keeps `docs/`, it holds only dated evidence and files that software consumes, such as notice text.

## Where the handbook is stored

The handbook is the repository's GitHub Wiki when it is available. Otherwise it is the `wiki/` folder at the repository root. The folder holds only the handbook's Markdown pages and is treated like a separate Wiki repository: its changes are pull requests of their own, its checks run separately, and source archives leave it out. [Publish a change](Wiki-maintenance.md#publish-a-change) explains both forms.

## Keep ownership clear

Extend the owning record before creating another one. Link scope, evidence, dates and process from their owners instead of copying lists, calendars or status reports into other records.
