# GitHub configuration

The process runs on GitHub's own features. This page records how the repository and the planning Project are configured and why, so that anyone can check the configuration or restore it in GitHub's settings. When the configuration changes, update this page with it.

## Repository settings

| Setting | Value | Reason |
|---|---|---|
| Merge methods | Squash merging only | One commit per reviewed change on the default branch. |
| Automatically delete head branches | On | A merged pull request keeps its commits and can restore its branch. |
| Issues and Projects | On | Issues own outcomes; the planning Project owns readiness. |
| Wiki | On only when the GitHub Wiki holds the handbook | The handbook has one home. |
| Actions workflow permissions | Read repository contents; can't create or approve pull requests | A workflow gets write access only where its job declares it. |

## Default-branch ruleset

The ruleset `Default branch` targets the default branch and is active. It:

- restricts deletions and blocks force pushes;
- requires a pull request before merging, with no required approvals, stale approvals dismissed when new commits are pushed, and all conversations resolved.

The process still requires a review on the exact head. Someone working alone can't approve their own pull request, so the review is recorded as [Review](Verification-and-review.md#review) describes, and the ruleset doesn't count approvals. When several people review, raise the required approvals.

Require the project's hosted checks under **Require status checks to pass** in this ruleset:

| Check | Workflow | Runs on |
|---|---|---|
| `site verify` | `.github/workflows/site.yml`: type-check, formatting and build of `site/` | Pull requests and default-branch pushes that change `site/` or the workflow |

A required check that doesn't run leaves a pull request waiting, so before requiring `site verify`, remove the workflow's path filters or let pull requests that don't touch `site/` report it as skipped.

Rulesets on private repositories need a paid plan. Without one, follow the same rules as a practice.

## Labels

| Label | Meaning |
|---|---|
| `defect` | Behavior differs from what is expected. |
| `improvement` | A new or better result. |
| `kept open` | Open on purpose; the reason is in a comment. See [Record a disposition](Triage-and-refinement.md#record-a-disposition). |
| `delivery: pending` | Merged; delivery is not verified yet. See [Keep pending delivery visible](Acceptance-and-delivery.md#keep-pending-delivery-visible). |

Add a label only for a distinction the process uses.

## Milestones

One open milestone per horizon: soon, after, later and some time, starting as `0.0.1`, `0.0.2`, `0.1.x` and `1.x.x`. [Project planning](Project-planning.md#choose-a-horizon) explains them and how they roll forward.

## Planning Project

The planning Project belongs to the repository owner and is linked to the repository.

| Field | Options |
|---|---|
| Status | Needs refinement, Needs decision, Ready, Handed off, Done. "Done" is GitHub's built-in option, which the Project's closed and merged workflows set. |
| Priority | High, Normal, Low. |

| View | Layout | Filter |
|---|---|---|
| Backlog | Table | `is:open -milestone:"<soon>"` |
| Needs decision | Table | `is:open status:"Needs decision"` |
| Ready to start | Table | `is:open status:Ready` |
| Current cycle | Board | `milestone:"<soon>"` |

`<soon>` is the soon horizon's milestone. Update the two filters when [the horizons roll forward](Project-planning.md#roll-the-horizons-forward). [Use the planning Project](Project-planning.md#use-the-planning-project) explains the fields and views.
