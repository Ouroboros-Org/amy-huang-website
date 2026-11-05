# Acceptance and delivery

A merge accepts source into the default branch. Delivery means the result reached its delivery path, with evidence. Steps that are hard to reverse, such as merging, deleting and publishing, are deliberate and recorded on the pull request or Issue.

## Describe the actual result

| Result | Establishes | Still open |
|---|---|---|
| Prepared or reviewed | A proposal exists; checks and review cover a named revision. | Acceptance, later changes and delivery. |
| Merged | The source entered the default branch. | Build, deployment or publication. |
| Built | An identified artifact passed its build checks. | Publication. |
| Published or deployed | The result became available. | Readback and verification for its users. |
| Delivery verified | The result reached its delivery path, with evidence. | Individual installations can still differ. |

When you report status, name the component and the action rather than an unqualified "done".

## Merge a reviewed change

Merge only the reviewed head, with its checks passing. Before you merge, check on the pull request that:

1. it targets the default branch and isn't a draft;
2. its description references Issues without closing keywords;
3. the latest review approves the current head: the review names the commit it covers, and a later push needs a new review;
4. every conversation is resolved and every check passed.

Merge with GitHub's squash merge. From the command line, pin the reviewed head, so that a push during the merge makes it fail: `gh pr merge <number> --squash --match-head-commit <head>`. The pull request records the merge, and GitHub then deletes its branch.

## Keep pending delivery visible

`delivery: pending` marks merged source whose delivery isn't verified yet. Whoever merges a change that still needs a deployment, a build or a publication adds the label; whoever verifies the delivery removes it. Changes that take effect on merge, such as workflows, checks and documentation, don't get the label.

An Issue closes once its acceptance is verified where its acceptance says, for example on a tested staging deployment. A later production rollout doesn't keep the Issue open.

## Delete a branch

GitHub deletes a pull request's branch when the pull request merges, and **Restore branch** on the pull request brings it back. Delete another branch on the repository's Branches page once the default branch contains its change, or once it is recorded as abandoned, and no open pull request uses it as its base.

Local branches, worktrees and uncommitted files are separate; deleting the remote branch doesn't touch them.

## Release a version

1. Resolve the previously delivered version and the candidate.
2. Read the milestone's outcomes, their pull requests and acceptance evidence, and reconcile them with the actual source range. Closed entries and merged pull requests alone don't establish inclusion.
3. Run candidate checks scoped to the changes, including upgrade, data preservation and recovery where they apply.
4. Draft release notes from the outcomes. Leave out duplicate, not-planned, reverted and deferred work, and record partial delivery and known limits.
5. Publish, read back and verify delivery.
6. Put the verified results, versions, assets and known limits in the GitHub Release. Close the milestone and [roll the horizons forward](Project-planning.md#roll-the-horizons-forward).

GitHub's generated release notes list merged pull requests. Reconcile them with the outcomes instead of publishing them unchanged.
