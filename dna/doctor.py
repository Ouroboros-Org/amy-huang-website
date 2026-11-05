"""Read-only reports for the triage-refinement and Wiki grooming routines.

The report lists what can be found mechanically. Deciding what each finding
means is the routine's work, recorded on the Issue or Wiki page itself.
"""

import os
import re
import tempfile
from datetime import datetime, timedelta, timezone
from urllib.parse import unquote

from . import wiki
from .check import template_problems
from .config import WIKI, horizons, load, project_title
from .gh import CommandError, gh_json, git, repository, run, wiki_url

KEPT_OPEN = "kept open"
READY = {"Ready", "Handed off"}
GH_CREDENTIAL = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"]


def parse_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def issue_line(issue, extra=""):
    return f"- [#{issue['number']}]({issue['url']}) {issue['title']}{extra}"


def planning_items(owner, title, name_with_owner):
    """Map Issue number to its planning Project status, or return a reason it is unreadable."""
    projects = gh_json("project", "list", "--owner", owner, "--format", "json", "--limit", "100")["projects"]
    matches = [project for project in projects if project["title"] == title]
    if not matches:
        return None, f'no Project titled "{title}" under {owner}'
    number = str(matches[0]["number"])
    items = gh_json("project", "item-list", number, "--owner", owner, "--format", "json", "--limit", "1000")["items"]
    statuses = {}
    for item in items:
        content = item.get("content") or {}
        if content.get("type") == "Issue" and content.get("repository") == name_with_owner:
            statuses[content["number"]] = item.get("status")
    return statuses, None


def triage_section(repo, project):
    soon = horizons(project)[0]
    days = project["routines"]["kept_open_review_days"]
    issues = gh_json(
        "issue", "list", "--state", "open", "--limit", "1000",
        "--json", "number,title,url,milestone,labels,createdAt,updatedAt",
    )
    for issue in issues:
        issue["label_names"] = {label["name"] for label in issue["labels"]}
        issue["horizon"] = (issue["milestone"] or {}).get("title")

    untriaged = [i for i in issues if not i["horizon"] and KEPT_OPEN not in i["label_names"]]
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    kept_due = [i for i in issues if KEPT_OPEN in i["label_names"] and parse_time(i["updatedAt"]) < cutoff]

    lines = ["## Triage and refinement", ""]
    lines += [f"### Untriaged ({len(untriaged)})", "Open Issues with no horizon and no `kept open` label.", ""]
    lines += [issue_line(i, f" (opened {i['createdAt'][:10]})") for i in untriaged] or ["None."]

    try:
        statuses, reason = planning_items(repo["owner"]["login"], project_title(project), repo["nameWithOwner"])
    except (CommandError, KeyError) as error:
        statuses, reason = None, f"not readable with this token ({str(error).splitlines()[0][:160]})"
    lines.append("")
    if statuses is None:
        lines += [f"Planning Project: {reason}. The sections that need it are left out.", ""]
    else:
        deciding = [i for i in issues if statuses.get(i["number"]) == "Needs decision"]
        not_ready = [i for i in issues if i["horizon"] == soon and statuses.get(i["number"]) not in READY]
        missing = [i for i in issues if (i["horizon"] or KEPT_OPEN in i["label_names"]) and i["number"] not in statuses]
        lines += [f"### Waiting for a decision ({len(deciding)})", ""]
        lines += [issue_line(i) for i in deciding] or ["None."]
        lines += ["", f"### In the {soon} horizon but not ready ({len(not_ready)})", ""]
        lines += [issue_line(i, f" (status: {statuses.get(i['number']) or 'none'})") for i in not_ready] or ["None."]
        lines += ["", f"### Triaged but not in the planning Project ({len(missing)})", ""]
        lines += [issue_line(i) for i in missing] or ["None."]
        lines.append("")
    lines += [f"### Kept open, no update for {days} days ({len(kept_due)})", ""]
    lines += [issue_line(i, f" (updated {i['updatedAt'][:10]})") for i in kept_due] or ["None."]
    count = len(untriaged) + len(kept_due) + (0 if statuses is None else len(deciding) + len(not_ready) + len(missing))
    return lines, count, {i["number"] for i in issues}


def wiki_pages(repo):
    """Return (label, directory, native, cleanup) for the Wiki, or a reason it is unavailable."""
    if WIKI.is_dir():
        return ("wiki", WIKI, False, None), None
    temporary = tempfile.TemporaryDirectory(prefix="dna-wiki-")
    result = run(["git", *GH_CREDENTIAL, "clone", "-q", "--depth", "1", wiki_url(repo["nameWithOwner"]), temporary.name], check=False)
    if result.returncode != 0:
        temporary.cleanup()
        return None, (
            "the GitHub Wiki is not readable. It exists only after its first page; "
            "a private Wiki needs DNA_DOCTOR_TOKEN in the routines workflow"
        )
    return ("GitHub Wiki", temporary.name, True, temporary), None


def grooming_section(repo, open_numbers):
    lines = ["## Wiki grooming", ""]
    location, reason = wiki_pages(repo)
    if location is None:
        return lines + [f"Unavailable: {reason}."], 0
    label, directory, native, temporary = location
    try:
        problems = wiki.problems(directory, native=native, label=label)
        pages = wiki.read_pages(directory)
    finally:
        if temporary:
            temporary.cleanup()
    lines += [f"Pages: {len(pages)} in the {'GitHub Wiki' if native else 'wiki/ folder'}.", ""]
    lines += [f"### Page problems ({len(problems)})", ""]
    lines += [f"- {problem}" for problem in problems] or ["None."]

    name = re.escape(repo["nameWithOwner"])
    pin = re.compile(rf"https://github\.com/{name}/blob/([0-9a-f]{{7,40}})/([^\s)#?\"'>]+)")
    issue_link = re.compile(rf"https://github\.com/{name}/issues/(\d+)")
    stale, unknown, linked_issues = [], [], {}
    for page, text in pages.items():
        for sha, path in sorted(set(pin.findall(text))):
            path = unquote(path)
            if run(["git", "cat-file", "-e", f"{sha}^{{commit}}"], check=False).returncode != 0:
                unknown.append(f"- {page}: `{sha[:12]}` (`{path}`) is not in this checkout's history")
                continue
            newer = git("log", "-1", "--format=%h %cs", f"{sha}..HEAD", "--", path)
            if newer:
                stale.append(f"- {page}: `{path}` pinned at `{sha[:12]}`, changed since in `{newer}`")
        for number in issue_link.findall(text):
            linked_issues.setdefault(int(number), set()).add(page)

    closed = []
    for number, linking in sorted(linked_issues.items()):
        if number in open_numbers:
            continue
        try:
            state = gh_json("api", f"repos/{repo['nameWithOwner']}/issues/{number}")
        except CommandError:
            continue
        if state.get("state") == "closed" and "pull_request" not in state:
            closed.append(f"- #{number} ({state.get('state_reason') or 'closed'}), linked from {', '.join(sorted(linking))}")

    lines += ["", f"### Source changed since its pinned link ({len(stale)})", ""]
    lines += stale + unknown or ["None."]
    lines += ["", f"### Links to closed Issues ({len(closed)})", ""]
    lines += closed or ["None."]
    return lines, len(problems) + len(stale) + len(unknown) + len(closed)


def doctor(args):
    repo = repository()
    project = load("project")
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"# Routine report for {repo['nameWithOwner']}", "", f"Generated {now}.", ""]
    triage, triage_count, open_numbers = triage_section(repo, project)
    grooming, grooming_count = grooming_section(repo, open_numbers)
    template = template_problems()
    lines += triage + [""] + grooming + ["", f"## Template ({len(template)})", ""]
    lines += [f"- {problem}" for problem in template] or ["None."]
    report = "\n".join(lines) + "\n"
    print(report)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as handle:
            handle.write(report)
    total = triage_count + grooming_count + len(template)
    return 1 if args.strict and total else 0


def add_parsers(sub):
    parser = sub.add_parser("doctor", help="report what the triage-refinement and grooming routines should look at")
    parser.add_argument("--strict", action="store_true", help="exit 1 when the report lists anything")
    parser.set_defaults(func=doctor)
