# Verification and review

Choose checks for the changed behavior and its consumers. Review is a separate, recorded step on the exact revision that will merge.

## Select checks by behavior

Identify the observable change, the responsible module, the affected consumers and the relevant failure cases. Choose checks that would detect an incorrect change. When you apply an earlier fix or a shared rule to another consumer, first check the assumption that makes it applicable there.

| Change | Starting checks | Expand when |
|---|---|---|
| Prose or navigation | Claims, links and described commands. | Software consumes the file. |
| Behavior | The affected tests and the real interaction. | Shared state, persistence, interfaces or concurrency change. |
| Interface or contract | Producer and consumer checks, including error cases. | Encoding, authorization or compatibility change. |
| Shared helper or check definition | Consumer checks and selection boundaries. | The impact cannot be bounded. |

Run the selected checks before you open the pull request, and let hosted checks repeat them for each pull request. Add a hosted check, as a GitHub Actions workflow, once the project has behavior to verify, and require it in the [default-branch ruleset](GitHub-configuration.md#default-branch-ruleset).

## Establish meaningful evidence

A zero-test result or a missing prerequisite verifies nothing, so confirm that the selected tests ran. Check expected results independently of the implementation. Exercise the real boundary when mocks could hide serialization, authorization, persistence or process failures. For asynchronous behavior, observe the transition that matters, not only the final state.

## Prepare the change for review

Record the checks once, in the pull request description: the tested head and base, the environment, which selected checks passed, and any failed or unavailable check. Give test counts only for focused tests that prove the change. Lead with the problem and the resulting behavior, keep the description current, and link evidence instead of pasting logs.

## Review

Review the current head against its base. Trace the changed behavior through its state, interfaces, side effects and callers, and scale compatibility and recovery checks to the affected contract. Review is its own step even when the same person wrote the change: read the diff afresh, as a reviewer.

Tie each finding to its location, trigger, consequence and a useful correction, and separate blockers from suggestions. Every finding gets a disposition: fixed, moved to its own Issue, or accepted with a reason. Resolve each review thread with its disposition.

Record the verdict as a pull request review on the exact head. Use an approval, or, where GitHub doesn't allow one, such as on your own pull request, a comment review that starts with `Approved`. After corrections, review the new head; an approval of an earlier head doesn't carry over.

## Hosted checks

Run a check on pull requests only when the change can alter its result and the check passes on the default branch. Keep jobs with side effects, such as deployment, publication and signing, off pull requests. When a check fails for a reason outside the pull request, record that failure in an Issue. A failure that passes on rerun is a defect of its own: record it in an Issue too.
