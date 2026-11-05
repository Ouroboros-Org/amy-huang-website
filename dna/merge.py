"""Merge a reviewed pull request at its exact head, verify it, and retire its branch.

Merging and deleting are deliberate steps: every refusal says why, and the
result is recorded on the pull request.
"""

import time

from .config import load
from .gh import CommandError, api, gh, gh_json, git, repository, run

PASSING = {"SUCCESS", "SKIPPED", "NEUTRAL"}
VERDICTS = {"APPROVED", "CHANGES_REQUESTED", "COMMENTED"}


def review_verdict(name_with_owner, number, head):
    """The latest verdict recorded for the exact head, or None.

    An approval counts, and so does a comment review whose body starts with
    "Approved": GitHub does not let the author approve their own pull request.
    """
    verdict = None
    for review in api(f"repos/{name_with_owner}/pulls/{number}/reviews", paginate=True):
        if review.get("commit_id") != head or review.get("state") not in VERDICTS:
            continue
        body = (review.get("body") or "").strip().lower()
        if review["state"] == "APPROVED" or body.startswith("approved"):
            verdict = "approved"
        elif review["state"] == "CHANGES_REQUESTED" or body.startswith("changes requested"):
            verdict = "changes requested"
    return verdict


def comparable(diff):
    """A diff without index and hunk lines, which differ between equivalent diffs."""
    return [line for line in diff.splitlines() if not line.startswith(("index ", "@@ "))]


def merge(args):
    repo = repository()
    name, default = repo["nameWithOwner"], repo["defaultBranchRef"]["name"]
    method = load("project")["repository"]["merge_method"]
    number = str(args.pr)
    info = gh_json(
        "pr", "view", number, "--json",
        "state,isDraft,headRefOid,headRefName,baseRefName,isCrossRepository,closingIssuesReferences,statusCheckRollup",
    )

    # Accept an abbreviated SHA of at least 7 characters for the current head.
    head = info["headRefOid"] if len(args.head) >= 7 and info["headRefOid"].startswith(args.head) else args.head
    refusals = []
    if info["state"] != "OPEN":
        refusals.append(f"the pull request is {info['state'].lower()}")
    if info["headRefOid"] != head:
        refusals.append(f"the head moved to {info['headRefOid']}; review that head")
    if info["baseRefName"] != default:
        refusals.append(f"it targets {info['baseRefName']}, not {default}")
    if info["isDraft"]:
        refusals.append("it is a draft")
    if info["closingIssuesReferences"]:
        closing = ", ".join(f"#{issue['number']}" for issue in info["closingIssuesReferences"])
        refusals.append(f"it would close {closing}; Issues close deliberately once their acceptance is verified")
    unfinished = [
        f"{check.get('name') or check.get('context')}: {check.get('conclusion') or check.get('state') or check.get('status')}"
        for check in info["statusCheckRollup"]
        if (check.get("conclusion") or check.get("state") or check.get("status")) not in PASSING
    ]
    if unfinished:
        refusals.append("checks are not passing: " + "; ".join(unfinished))
    verdict = review_verdict(name, number, head)
    if verdict != "approved":
        refusals.append(f"no review approves {head[:12]}" + (f" (latest: {verdict})" if verdict else ""))
    if refusals:
        print(f"Not merging #{number}:")
        for refusal in refusals:
            print(f"  - {refusal}")
        return 1

    git("fetch", "-q", "origin", default, f"pull/{number}/head")
    base = git("merge-base", f"origin/{default}", head)
    if args.dry_run:
        print(f"#{number} can merge: head {head[:12]}, base {base[:12]}, method {method}.")
        return 0

    gh("pr", "merge", number, f"--{method}", "--match-head-commit", head)
    merged = None
    for _ in range(10):
        merged = (gh_json("pr", "view", number, "--json", "mergeCommit")["mergeCommit"] or {}).get("oid")
        if merged:
            break
        time.sleep(2)
    if not merged:
        print(f"#{number} merged, but the merge commit is not visible yet. Verify the change by hand.")
        return 1
    git("fetch", "-q", "origin", default)
    record = [f"Merged {head} as {merged}."]
    if comparable(git("diff", base, head)) == comparable(git("diff", f"{merged}^", merged)):
        record.append("The merged change equals the reviewed diff.")
    else:
        record.append(f"**The merged change differs from the reviewed diff** ({base[:12]}..{head[:12]}). Investigate before anything else.")
        print("\n".join(record))
        gh("pr", "comment", number, "--body", "\n".join(record))
        return 1

    if args.delivery_pending:
        gh("pr", "edit", number, "--add-label", "delivery: pending")
        record.append("Labeled `delivery: pending`.")
    record.append(retire_branch(name, info, head, keep=args.keep_branch))
    gh("pr", "comment", number, "--body", "\n\n".join(record))
    print("\n".join(record))
    return 0


def retire_branch(name, info, head, keep):
    branch = info["headRefName"]
    if keep:
        return f"Branch `{branch}` kept on request."
    if info["isCrossRepository"]:
        return f"Branch `{branch}` is in a fork; its owner retires it."
    dependents = gh_json("pr", "list", "--state", "open", "--base", branch, "--json", "number")
    if dependents:
        numbers = ", ".join(f"#{pr['number']}" for pr in dependents)
        return f"Branch `{branch}` kept: {numbers} build on it."
    tag = f"refs/tags/archive/{branch}"
    existing = git("ls-remote", "origin", tag).split("\t")[0]
    if existing and existing != head:
        return f"Branch `{branch}` kept: `archive/{branch}` already points at {existing[:12]}."
    if not existing:
        try:
            git("push", "-q", "origin", f"{head}:{tag}")
        except CommandError as error:
            return f"Branch `{branch}` kept: archiving failed ({error})."
    if git("ls-remote", "origin", tag).split("\t")[0] != head:
        return f"Branch `{branch}` kept: `archive/{branch}` does not resolve to {head[:12]}."
    deleted = run(
        ["git", "push", "-q", f"--force-with-lease=refs/heads/{branch}:{head}", "origin", f":refs/heads/{branch}"],
        check=False,
    )
    if deleted.returncode != 0 or git("ls-remote", "origin", f"refs/heads/{branch}"):
        return f"Archived as `archive/{branch}`; branch `{branch}` kept: its tip changed or deletion failed."
    return f"Archived as `archive/{branch}` and deleted the branch."


def add_parsers(sub):
    parser = sub.add_parser("merge", help="merge a reviewed pull request at its exact head")
    parser.add_argument("pr", type=int, help="pull request number")
    parser.add_argument("head", help="the reviewed head commit (full SHA)")
    parser.add_argument("--delivery-pending", action="store_true", help="the change still needs delivery")
    parser.add_argument("--keep-branch", action="store_true", help="keep the branch after merging")
    parser.add_argument("--dry-run", action="store_true", help="check without merging")
    parser.set_defaults(func=merge)
