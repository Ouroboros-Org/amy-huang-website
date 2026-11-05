"""Bootstrap a project created from dna-template: `dna setup` and `dna cleanup`.

Both are dry runs unless --apply. Setup configures GitHub: repository settings,
labels, horizon milestones, the default-branch ruleset, Actions permissions,
the planning Project and the Wiki. After applying, it reads every area back.
Cleanup changes files in the working tree for the Bootstrap pull request; it
never commits.
"""

import re
import shutil
import tempfile
from pathlib import Path
from urllib.parse import quote

from . import wiki
from .check import template_problems
from .config import PLACEHOLDER, ROOT, WIKI, horizons, load, placeholders, project_title
from .gh import CommandError, api, gh, gh_json, graphql, repository, run, wiki_reachable, wiki_url

RULESET = "dna: default branch"
CHECK_CONTEXT = "dna check"
GH_CREDENTIAL = ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential"]


class Context:
    def __init__(self):
        self.project = load("project")
        self.process = load("process")
        self.repo = repository()
        self.name = self.repo["nameWithOwner"]
        self.owner = self.repo["owner"]["login"]
        mode = self.project["wiki"]["mode"]
        if mode not in ("auto", "native", "folder"):
            raise SystemExit(f"dna/project.toml: wiki.mode must be auto, native or folder, not {mode!r}.")
        if mode == "auto":
            mode = "native" if not WIKI.is_dir() or wiki_reachable(self.name) else "folder"
        self.wiki_mode = mode


def settings(ctx, apply):
    method = ctx.project["repository"]["merge_method"]
    if method not in ("squash", "merge"):
        raise SystemExit(f"dna/project.toml: repository.merge_method must be squash or merge, not {method!r}.")
    desired = {
        "allow_squash_merge": method == "squash",
        "allow_merge_commit": method == "merge",
        "allow_rebase_merge": False,
        # Branches are archived before deletion, so GitHub must not delete them on merge.
        "delete_branch_on_merge": False,
        "has_issues": True,
        "has_projects": True,
        # One home for the Wiki: the folder form turns the GitHub Wiki off.
        "has_wiki": ctx.wiki_mode == "native",
    }
    current = api(f"repos/{ctx.name}")
    differences = {key: value for key, value in desired.items() if current.get(key) != value}
    if not differences:
        return ["Repository settings: ok."]
    changes = ", ".join(f"{key} → {str(value).lower()}" for key, value in differences.items())
    if not apply:
        return [f"Repository settings: would set {changes}."]
    api(f"repos/{ctx.name}", "PATCH", differences)
    return [f"Repository settings: set {changes}."]


def labels(ctx, apply):
    desired = {label["name"]: label for label in ctx.process["labels"]}
    current = {label["name"]: label for label in gh_json("label", "list", "--limit", "500", "--json", "name,color,description")}
    lines = []
    for name, label in desired.items():
        existing = current.get(name)
        args = ["--color", label["color"], "--description", label["description"]]
        if existing is None:
            lines.append(f"Label {name!r}: {'created' if apply else 'would create'}.")
            if apply:
                gh("label", "create", name, *args)
        elif existing["color"].lower() != label["color"].lower() or (existing["description"] or "") != label["description"]:
            lines.append(f"Label {name!r}: {'updated' if apply else 'would update'} color and description.")
            if apply:
                gh("label", "edit", name, *args)
    for name in sorted(set(current) - set(desired)):
        used = api("search/issues?q=" + quote(f'repo:{ctx.name} label:"{name}"', safe=""))["total_count"]
        if used:
            lines.append(f"Label {name!r}: kept, {used} Issues or PRs use it.")
        else:
            lines.append(f"Label {name!r}: {'removed' if apply else 'would remove'} (unused, not in the process).")
            if apply:
                gh("label", "delete", name, "--yes")
    return lines or ["Labels: ok."]


def milestones(ctx, apply):
    existing = {milestone["title"] for milestone in api(f"repos/{ctx.name}/milestones?state=all&per_page=100", paginate=True)}
    missing = [title for title in horizons(ctx.project) if title not in existing]
    if not missing:
        return ["Horizon milestones: ok."]
    if apply:
        for title in missing:
            api(f"repos/{ctx.name}/milestones", "POST", {"title": title})
        return [f"Horizon milestones: created {', '.join(missing)}."]
    return [f"Horizon milestones: would create {', '.join(missing)}."]


def ruleset_body(ctx):
    return {
        "name": RULESET,
        "target": "branch",
        "enforcement": "active",
        "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
        "rules": [
            {"type": "deletion"},
            {"type": "non_fast_forward"},
            {
                "type": "pull_request",
                "parameters": {
                    # Review is recorded on the exact head (see `dna merge`); a solo
                    # contributor cannot approve their own pull request, so no count is required.
                    "required_approving_review_count": 0,
                    "dismiss_stale_reviews_on_push": True,
                    "require_code_owner_review": False,
                    "require_last_push_approval": False,
                    # Every review finding gets a disposition before merging.
                    "required_review_thread_resolution": True,
                },
            },
            {
                "type": "required_status_checks",
                "parameters": {
                    "strict_required_status_checks_policy": False,
                    "required_status_checks": [{"context": CHECK_CONTEXT}],
                },
            },
        ],
    }


def ruleset(ctx, apply):
    try:
        existing = [item for item in api(f"repos/{ctx.name}/rulesets") or [] if item["name"] == RULESET]
    except CommandError as error:
        return [f"Ruleset: unavailable ({str(error).splitlines()[-1][:140]}). Rulesets need a public repository or a paid plan; `dna merge` still enforces the merge conditions."]
    body = ruleset_body(ctx)
    if existing:
        current = api(f"repos/{ctx.name}/rulesets/{existing[0]['id']}")
        if _rules_match(current, body):
            return [f"Ruleset {RULESET!r}: ok."]
        if apply:
            api(f"repos/{ctx.name}/rulesets/{existing[0]['id']}", "PUT", body)
            return [f"Ruleset {RULESET!r}: updated to the template's rules."]
        return [f"Ruleset {RULESET!r}: would update to the template's rules."]
    if apply:
        api(f"repos/{ctx.name}/rulesets", "POST", body)
        return [f"Ruleset {RULESET!r}: created for the default branch."]
    return [f"Ruleset {RULESET!r}: would create it for the default branch (no deletion or force push, pull requests with resolved threads, `{CHECK_CONTEXT}` passing)."]


def _rules_match(current, body):
    if current.get("enforcement") != body["enforcement"] or current.get("conditions") != body["conditions"]:
        return False
    actual = {rule["type"]: rule.get("parameters") or {} for rule in current.get("rules", [])}
    for rule in body["rules"]:
        parameters = actual.get(rule["type"])
        if parameters is None:
            return False
        for key, value in (rule.get("parameters") or {}).items():
            if parameters.get(key) != value:
                return False
    return True


def actions(ctx, apply):
    current = api(f"repos/{ctx.name}/actions/permissions/workflow")
    desired = {"default_workflow_permissions": "read", "can_approve_pull_request_reviews": False}
    if all(current.get(key) == value for key, value in desired.items()):
        return ["Actions permissions: ok."]
    if apply:
        api(f"repos/{ctx.name}/actions/permissions/workflow", "PUT", desired)
        return ["Actions permissions: workflows read by default and cannot approve pull requests."]
    return ["Actions permissions: would make workflows read-only by default and unable to approve pull requests."]


PROJECT_QUERY = """
query($id: ID!) {
  node(id: $id) {
    ... on ProjectV2 {
      items(first: 1) { totalCount }
      repositories(first: 50) { nodes { nameWithOwner } }
      views(first: 50) { nodes { id name layout filter } }
      fields(first: 50) {
        nodes {
          ... on ProjectV2FieldCommon { id name }
          ... on ProjectV2SingleSelectField { options { id name } }
        }
      }
    }
  }
}"""


def planning_project(ctx, apply):
    title = project_title(ctx.project)
    try:
        projects = gh_json("project", "list", "--owner", ctx.owner, "--format", "json", "--limit", "100")["projects"]
    except CommandError as error:
        return [f"Planning Project: not readable ({str(error).splitlines()[-1][:140]}). The GitHub CLI needs the `project` scope: gh auth refresh -s project."]
    found = [project for project in projects if project["title"] == title and not project.get("closed")]
    if not found:
        if not apply:
            return [f"Planning Project {title!r}: would create it under {ctx.owner}, link it, and set its fields and views."]
        created = gh_json("project", "create", "--owner", ctx.owner, "--title", title, "--format", "json")
        lines = [f"Planning Project {title!r}: created ({created['url']})."]
        number, project_id = created["number"], created["id"]
    else:
        lines = []
        number, project_id = found[0]["number"], found[0]["id"]

    state = graphql(PROJECT_QUERY, id=project_id)["node"]
    if ctx.name not in {repo["nameWithOwner"] for repo in state["repositories"]["nodes"]}:
        lines.append(f"Planning Project: {'linked to' if apply else 'would link to'} {ctx.name}.")
        if apply:
            gh("project", "link", str(number), "--owner", ctx.owner, "--repo", ctx.name)
    fields = {field["name"]: field for field in state["fields"]["nodes"] if field}
    lines += _select_field(ctx, apply, project_id, fields, "Status", ctx.process["project"]["status_options"], state["items"]["totalCount"])
    lines += _select_field(ctx, apply, project_id, fields, "Priority", ctx.process["project"]["priority_options"], state["items"]["totalCount"])
    lines += _views(ctx, apply, project_id, state["views"]["nodes"])
    return lines or [f"Planning Project {title!r}: ok."]


def _select_field(ctx, apply, project_id, fields, name, options, item_count):
    field = fields.get(name)
    wanted = [option["name"] for option in options]
    if field is None:
        if apply:
            graphql(
                "mutation($input: CreateProjectV2FieldInput!) { createProjectV2Field(input: $input) { clientMutationId } }",
                input={"projectId": project_id, "dataType": "SINGLE_SELECT", "name": name, "singleSelectOptions": options},
            )
        return [f"Project field {name}: {'created' if apply else 'would create'} with {', '.join(wanted)}."]
    current = [option["name"] for option in field.get("options", [])]
    if current == wanted:
        return []
    if item_count and set(current) - set(wanted):
        return [f"Project field {name}: options are {', '.join(current)}; the process uses {', '.join(wanted)}. The Project has items, so change them by hand."]
    if apply:
        ids = {option["name"]: option["id"] for option in field.get("options", [])}
        # Keeping an existing option's ID keeps automations that set it, such as "Done".
        with_ids = [{**option, "id": ids[option["name"]]} if option["name"] in ids else option for option in options]
        graphql(
            "mutation($input: UpdateProjectV2FieldInput!) { updateProjectV2Field(input: $input) { clientMutationId } }",
            input={"fieldId": field["id"], "singleSelectOptions": with_ids},
        )
    return [f"Project field {name}: {'set' if apply else 'would set'} options {', '.join(wanted)}."]


def _views(ctx, apply, project_id, existing):
    soon = horizons(ctx.project)[0]
    by_name = {view["name"]: view for view in existing}
    spare = by_name.get("View 1") if len(existing) == 1 else None
    lines = []
    for view in ctx.process["project"]["views"]:
        name, layout, view_filter = view["name"], view["layout"], view["filter"].replace("{soon}", soon)
        current = by_name.get(name)
        if current and current["layout"] == layout and (current["filter"] or "") == view_filter:
            continue
        if not apply:
            lines.append(f"Project view {name!r}: would {'update' if current else 'create'} ({layout.split('_')[0].lower()}, filter {view_filter}).")
            continue
        try:
            if current is None and spare is not None and spare["layout"] == layout:
                current, spare = spare, None  # Reuse the new Project's default view instead of leaving it beside the process views.
            if current is None:
                current = graphql(
                    "mutation($input: CreateProjectV2ViewInput!) { createProjectV2View(input: $input) { projectV2View { id } } }",
                    input={"projectId": project_id, "name": name, "layout": layout},
                )["createProjectV2View"]["projectV2View"]
            graphql(
                "mutation($input: UpdateProjectV2ViewInput!) { updateProjectV2View(input: $input) { clientMutationId } }",
                input={"viewId": current["id"], "name": name, "layout": layout, "filter": view_filter},
            )
            lines.append(f"Project view {name!r}: set (filter {view_filter}).")
        except (RuntimeError, CommandError) as error:
            lines.append(f"Project view {name!r}: create it by hand ({layout.split('_')[0].lower()}, filter {view_filter}); the API refused: {str(error)[:140]}.")
    return lines


def wiki_area(ctx, apply):
    if ctx.wiki_mode == "folder":
        return ["Wiki: the wiki/ folder holds the pages; the GitHub Wiki stays off."]
    if not WIKI.is_dir():
        return ["Wiki: the GitHub Wiki holds the pages."]
    if not wiki_reachable(ctx.name):
        return [f"Wiki: the GitHub Wiki has no Git repository yet. Create its first page at {ctx.repo['url']}/wiki, then run setup again to seed it."]
    with tempfile.TemporaryDirectory(prefix="dna-wiki-") as directory:
        run(["git", *GH_CREDENTIAL, "clone", "-q", wiki_url(ctx.name), directory])
        clone = Path(directory)
        wanted = {path.name: wiki.to_native(path.read_text(encoding="utf-8")) for path in sorted(WIKI.glob("*.md"))}
        present = {path.name: path.read_text(encoding="utf-8") for path in clone.glob("*.md")}
        if all(present.get(name) == text for name, text in wanted.items()):
            return ["Wiki: the GitHub Wiki holds the seeded pages."]
        unexpected = sorted(name for name in present if name != "Home.md" and present[name] != wanted.get(name))
        if unexpected:
            return [f"Wiki: the GitHub Wiki already has other pages ({', '.join(unexpected)}). Merge wiki/ into it by hand."]
        if not apply:
            return [f"Wiki: would seed the GitHub Wiki with {len(wanted)} pages from wiki/."]
        for name, text in wanted.items():
            (clone / name).write_text(text, encoding="utf-8")
        run(["git", "add", "-A"], cwd=clone)
        version = load("template")["version"]
        run(["git", "commit", "-q", "-m", f"Seed the handbook from dna-template {version}"], cwd=clone)
        run(["git", *GH_CREDENTIAL, "push", "-q", "origin", "HEAD"], cwd=clone)
    return [f"Wiki: seeded the GitHub Wiki with {len(wanted)} pages."]


AREAS = [settings, labels, milestones, ruleset, actions, planning_project, wiki_area]


def setup(args):
    unfilled = placeholders(load("project"))
    if unfilled:
        raise SystemExit("Fill dna/project.toml first: " + ", ".join(unfilled))
    ctx = Context()
    print(f"{'Applying' if args.apply else 'Dry run'} for {ctx.name} (Wiki: {ctx.wiki_mode}).\n")
    for area in AREAS:
        for line in area(ctx, args.apply):
            print(f"- {line}")
    if not args.apply:
        print("\nNothing changed. Run again with --apply to make these changes.")
        return 0
    print("\nReadback:")
    ctx = Context()
    for area in AREAS:
        for line in area(ctx, False):
            print(f"- {line}")
    print("\nPaste the readback into the Bootstrap pull request. Next: python3 -m dna cleanup")
    return 0


def fill(text, values):
    def replace(match):
        key = match.group(0)[2:-2].strip()
        if key not in values:
            raise SystemExit(f"Unknown placeholder {match.group(0)}")
        return values[key]
    return PLACEHOLDER.sub(replace, text)


REPO_WIKI_LINK = re.compile(r"\]\((?:\./)?wiki/([A-Za-z0-9_][A-Za-z0-9-]*)\.md(#[^)\s]*)?\)")


def cleanup(args):
    manifest = load("template")
    if manifest["state"] != "template":
        raise SystemExit("dna/template.toml: cleanup has already run (state is not template).")
    project = load("project")
    unfilled = placeholders(project)
    if unfilled:
        raise SystemExit("Fill dna/project.toml first: " + ", ".join(unfilled))
    ctx = Context()
    if ctx.repo["isTemplate"]:
        raise SystemExit(f"{ctx.name} is a template repository. Cleanup prepares a project created from it.")
    native = ctx.wiki_mode == "native" and WIKI.is_dir()
    if native and wiki_area(ctx, False) != ["Wiki: the GitHub Wiki holds the seeded pages."]:
        raise SystemExit("The GitHub Wiki doesn't hold the wiki/ pages yet. Run `python3 -m dna setup --apply` first.")

    wiki_home = f"{ctx.repo['url']}/wiki" if ctx.wiki_mode == "native" else "wiki/Home.md"
    values = {
        "project.name": project["project"]["name"],
        "project.description": project["project"]["description"],
        "repository": ctx.name,
        "repository.url": ctx.repo["url"],
        "wiki": wiki_home,
    }
    steps = []
    for target, source in manifest["cleanup"]["replace"].items():
        steps.append((f"Replace {target} with {source}, filled for {ctx.name}.",
                      lambda target=target, source=source: (ROOT / target).write_text(fill((ROOT / source).read_text(encoding="utf-8"), values), encoding="utf-8")))
    for path in manifest["cleanup"]["remove"]:
        steps.append((f"Remove {path}.", lambda path=path: _remove(ROOT / path)))
    if native:
        steps.append(("Point repository links at the GitHub Wiki.", lambda: _relink(ctx.repo["url"])))
        steps.append(("Remove the wiki/ folder; the GitHub Wiki holds the pages.", lambda: _remove(WIKI)))
        steps.append(("Remove the wiki/ lines from .gitattributes.", _drop_wiki_attributes))
    steps.append(("Mark dna/template.toml as a project.", _mark_project))

    for description, action in steps:
        print(f"- {'' if args.apply else 'Would: '}{description}")
        if args.apply:
            action()
    if not args.apply:
        print("\nNothing changed. Run again with --apply, then review the diff.")
        return 0
    found = template_problems()
    for problem in found:
        print(f"  {problem}")
    print("\nNext: commit on a branch and open the Bootstrap pull request with the setup readback.")
    return 1 if found else 0


def _remove(path):
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()


def _relink(url):
    for name in run(["git", "ls-files", "--", "*.md"]).stdout.split():
        path = ROOT / name
        if name.startswith("wiki/") or not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        changed = REPO_WIKI_LINK.sub(lambda match: f"]({url}/wiki/{match.group(1)}{match.group(2) or ''})", text)
        if changed != text:
            path.write_text(changed, encoding="utf-8")


def _drop_wiki_attributes():
    path = ROOT / ".gitattributes"
    if path.is_file():
        kept = [line for line in path.read_text(encoding="utf-8").splitlines() if not line.startswith("/wiki/")]
        if any(line.strip() and not line.startswith("#") for line in kept):
            path.write_text("\n".join(kept) + "\n", encoding="utf-8")
        else:
            path.unlink()


def _mark_project():
    path = ROOT / "dna" / "template.toml"
    path.write_text(path.read_text(encoding="utf-8").replace('state = "template"', 'state = "project"', 1), encoding="utf-8")


def add_parsers(sub):
    parser = sub.add_parser("setup", help="configure GitHub for this project (dry run unless --apply)")
    parser.add_argument("--apply", action="store_true", help="make the changes, then read them back")
    parser.set_defaults(func=setup)

    parser = sub.add_parser("cleanup", help="remove template material from the working tree (dry run unless --apply)")
    parser.add_argument("--apply", action="store_true", help="change the files")
    parser.set_defaults(func=cleanup)
