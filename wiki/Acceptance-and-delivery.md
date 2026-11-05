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

Merge only the reviewed head, with its checks passing. `python3 -m dna merge <number> <head>`:

1. refuses when the head moved, the pull request is a draft or targets another branch, it has closing keywords, a check failed or is pending, or no review approves that exact head;
2. merges with the head pinned, so a push during the merge makes it fail;
3. verifies that the merged change equals the reviewed diff;
4. preserves the branch tip as the tag `archive/<branch>`, and deletes the branch only when that tag is verified and no open pull request builds on the branch;
5. records the result on the pull request.

Branch deletion on merge stays off in the repository settings, because it would skip the archive.

## Keep pending delivery visible

`delivery: pending` marks merged source whose delivery isn't verified yet. Whoever merges a change that still needs a deployment, a build or a publication adds the label (`--delivery-pending`); whoever verifies the delivery removes it. Changes that take effect on merge, such as workflows, checks and documentation, don't get the label.

An Issue closes once its acceptance is verified where its acceptance says, for example on a tested staging deployment. A later production rollout doesn't keep the Issue open.

## Retire a branch

`dna merge` retires the branch of the pull request it merges. To retire another branch by hand:

1. Record its exact tip. Check that no open pull request uses it as its base, and that the default branch contains its whole change.
2. Push the tag `archive/<branch>` at that tip and verify that the remote tag resolves to it. Never overwrite a conflicting archive tag.
3. Delete the branch with a lease on that tip: `git push --force-with-lease=refs/heads/<branch>:<tip> origin :refs/heads/<branch>`. Verify that it is gone.

Local branches, worktrees and uncommitted files are separate; retiring the remote branch doesn't touch them.

## Release a version

1. Resolve the previously delivered version and the candidate.
2. Read the milestone's outcomes, their pull requests and acceptance evidence, and reconcile them with the actual source range. Closed entries and merged pull requests alone don't establish inclusion.
3. Run candidate checks scoped to the changes, including upgrade, data preservation and recovery where they apply.
4. Draft release notes from the outcomes. Leave out duplicate, not-planned, reverted and deferred work, and record partial delivery and known limits.
5. Publish, read back and verify delivery.
6. Put the verified results, versions, assets and known limits in the GitHub Release. Close the milestone and [roll the horizons forward](Project-planning.md#roll-the-horizons-forward).

GitHub's generated release notes list merged pull requests. Reconcile them with the outcomes instead of publishing them unchanged.
