# Contributing

People and agents follow the same process. This page is the path from a bounded change to a merged pull request. The [handbook](wiki/Home.md) owns the detailed methods.

## Choose a bounded change

Search existing Issues and pull requests first, and extend the record that already owns the problem. A small, self-contained change can start directly as a pull request. Investigation and coordinated work start from an Issue with a concrete outcome and acceptance stated as observable results. [Project planning](wiki/Project-planning.md) explains horizons, selection and blocked-by dependencies.

## Prepare

1. Read the owning Issue or pull request and the relevant handbook page. Check their claims against the current source.
2. Branch from the current default branch.

## Make the change

- Keep each change and each commit cohesive. Separate mechanical moves from behavior changes.
- Let code explain ordinary behavior. Use comments for non-obvious reasons, constraints and invariants.
- Inspect a file's consumers before you move or remove it.
- Keep build output, downloaded data and credentials out of the repository.

## Check the change

Run `python3 -m dna check`. It runs the checks that the changed paths select, the same way the hosted run does; `python3 -m dna check --list` previews the selection. Add checks that would detect an incorrect change. A zero-test result verifies nothing. [Verification and review](wiki/Verification-and-review.md) explains how to choose checks.

## Open the pull request

Complete the [pull request template](.github/pull_request_template.md). Lead with the problem and the resulting behavior, record the checks once, and keep the description current. Reference the Issue without a closing keyword.

## Review

Review the current head against its base. It is a separate step even when you wrote the change. Give every finding a disposition: fixed, moved to its own Issue, or accepted with a reason. Record the verdict as a review on the exact head. [Review](wiki/Verification-and-review.md#review) gives the details.

## Merge

Merge with `python3 -m dna merge <number> <reviewed-head>`. It refuses unless the head is reviewed and its checks pass. It then verifies that the merged change equals the reviewed diff, archives the branch and records the result on the pull request. Add `--delivery-pending` when the change still needs a deployment, build or publication.

## Update the Wiki

When the change affects what a handbook page explains, name the page and the rule in the pull request. After the merge, publish the Wiki change on its own: a pull request that changes only `wiki/`, or an edit of the GitHub Wiki. [Update guidance with a change](wiki/Wiki-maintenance.md#update-guidance-with-a-change) gives the steps.

## Finish

Close the Issue when its acceptance is verified, with one short comment: the merged pull request, where the verification is recorded, the remaining limits and where follow-up went. [Acceptance and delivery](wiki/Acceptance-and-delivery.md) separates merging from delivery.
