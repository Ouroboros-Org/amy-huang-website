# Agent instructions

Read [README](README.md) and [CONTRIBUTING](CONTRIBUTING.md) first. Their process applies to agents unchanged; this file adds what agents need to execute it.

## Inspect before acting

1. Establish the outcome, the acceptance, and the actions the task authorizes. A proposal or recommendation does not authorize merging, deployment, publication or data changes.
2. Inspect the checkout: branch, status, local edits, and whether the branch is current. Preserve files you did not create.
3. Read the owning Issue or pull request with its comments. Before updating a pull request, read its current head, base and unresolved review threads.
4. Find maintained guidance in the [handbook](wiki/Home.md). Read the page itself before relying on a search result.
5. Check claims from records and pages against the current source.

## Execute

- Trace entry points, state ownership, callers and side effects before changing behavior.
- Coordinate with parallel work on the same contract or file through its Issues and pull requests.
- Read only the configuration you need. Never print credentials or tokens.
- Confirm that the selected tests ran. Report failures and unavailable prerequisites.

## Commit

1. Inspect the final diff.
2. Stage only the intended paths, then inspect the staged diff.
3. Commit with a message that states the change and its reason.

## Record and hand off

Record scope, decisions, blockers, evidence and the next action in the owning Issue or pull request, not only in a chat or a local file. Keep session IDs, chat links, local paths and tool receipts out of the records: the tools that run agents keep execution details. Stop when acceptance and the relevant checks are satisfied, and give separate follow-up work its own record.
