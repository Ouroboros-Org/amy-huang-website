# Project planning

The planning Project holds future work and its readiness. Milestones hold the horizons and the order of selected work. Issues own scope, findings and outcomes; pull requests own changes and review.

## Choose a horizon

| Milestone | Horizon | Meaning |
|---|---|---|
| `0.0.1` | Soon | The current cycle: selected work in priority order. |
| `0.0.2` | After | The one next cycle, for planned work outside the current scope. |
| `0.1.x` | Later | The next larger feature version, undated until a date is justified. |
| `1.x.x` | Some time | Long-term direction, undated. It is not a release tag. |

The numbers are the starting point; they move forward as versions ship. Keep exactly one milestone per horizon rather than a series of speculative releases. A horizon assignment does not authorize implementation.

A milestone holds its version, a due date when one is justified, its state, the assigned outcomes and their manual order. Leave descriptions empty: scope lives in the entries. Priority in the current cycle follows the milestone list from top to bottom, so take the highest unblocked entry.

### Roll the horizons forward

When the soon horizon ships:

1. Close its milestone once delivery is verified, as [Release a version](Acceptance-and-delivery.md#release-a-version) describes.
2. The after milestone becomes soon. Create the next after milestone, for example `0.0.3`.
3. When the next release is the feature version itself, its milestone takes the exact version, for example `0.1.0`, and the later horizon moves to the following feature version, for example `0.2.x`.
4. Update the Project views that filter by the soon milestone.

Unfinished entries move deliberately. Record the reason on the entry before you move it.

## Use the planning Project

| Field | Values |
|---|---|
| Status | Needs refinement, Needs decision, Ready, Handed off, Done. |
| Priority | High, Normal or Low, with the reason recorded on the entry. |

The views are Backlog (open work outside the soon horizon), Needs decision, Ready to start, and Current cycle (the soon milestone).

**Ready** means bounded acceptance, known checks and satisfied dependencies. **Handed off** means the Issue or pull request owns execution; it does not mean delivery is complete. Status describes planning readiness only: execution state and findings stay in the Issues and pull requests. [Triage and refinement](Triage-and-refinement.md) moves entries from untriaged to Ready.

An idea can stay a Project draft. Convert it into an Issue when investigation or coordinated work starts.

Record dependencies as blocked-by links between Issues, so that the views show blocked work. Blocked work can be investigated; implement it once its blockers close.

## Create an outcome

Search existing Issues and pull requests first, and extend the record that owns the problem. Each Issue is one concrete outcome with:

- a clear title;
- the problem or expected result;
- the relevant versions and environment, or "unknown";
- dated evidence: a report, a reproduction or a source reference;
- acceptance stated as observable results, not implementation steps.

A small, self-contained change that needs no investigation or coordination and fits in one pull request can start as that pull request; its description states the problem and acceptance. Investigation, coordinated work and delivery follow-up start from an Issue.

Pull requests reference their Issue without closing keywords. The Issue closes deliberately when its acceptance is verified.

## Prioritize

Assess entries by the value of the outcome, the harm avoided, reach, urgency and dependencies. Consider effort and uncertainty when you split or sequence work. Record why an entry deserves earlier attention or can wait; for a deferral, also record what would bring it back. Unknown reach is not low reach.

Raise urgent cases at once, even when their reach is small or unknown: data loss, security or privacy exposure, or an outage without a workaround.

## Maintain the entry

Keep the Issue body concise and current: the problem with its evidence, the intended result, testable acceptance, and the scope boundary where it is unclear. Put dated findings, decisions with their reasons, blockers and the next action in comments. A change's verification stays in its pull request. Update the body when findings change the scope or the conclusion. Link procedures from this handbook instead of copying them, and state each fact once.

Parallel work that touches the same contract coordinates through the records. Work that consumes a contract another change alters is blocked by that change's Issue, and the providing change comments on the consumer's Issue when the contract changes. Execution details such as sessions, local paths and tool output stay with the tools; the records hold decisions and results.

## Close or defer an outcome

Close an Issue when its explicit acceptance is met, with one short comment: the outcome, the accepted pull request or commit, where its verification is recorded, the remaining limits, and where any follow-up went. A target milestone and a delivered version are different facts.

Close a duplicate with a link to the canonical Issue, and a not-planned decision with its reason. Reopen an Issue when the same acceptance turns out unmet; a later, distinct regression gets a new linked Issue.

Record partial, reverted or deferred scope explicitly. Before moving unfinished work, explain its disposition on the entry; never roll it forward silently.
