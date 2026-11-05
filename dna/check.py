"""Run the checks a change selects, and the built-in process checks."""

import fnmatch
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from . import wiki
from .config import PLACEHOLDER, ROOT, WIKI, load, placeholders
from .gh import CommandError, git

# A change to these files can change any check's selection, so it runs every check.
DEFINITIONS = ("dna/process.toml", "dna/project.toml")


def changed_paths(base, head):
    """Paths changed between the merge-base of base and head, and head.

    When head is HEAD, staged, unstaged and untracked files count too, so a
    local run covers work that is not committed yet.
    """
    merge_base = git("merge-base", base, head)
    paths = set(git("diff", "--name-only", merge_base, head).splitlines())
    if head == "HEAD":
        paths |= set(git("diff", "--name-only", "HEAD").splitlines())
        paths |= set(git("ls-files", "--others", "--exclude-standard").splitlines())
    return merge_base, sorted(path for path in paths if path)


def default_base():
    try:
        return git("rev-parse", "--abbrev-ref", "origin/HEAD")
    except CommandError:
        raise SystemExit(
            "No origin/HEAD to compare with. Fetch the default branch "
            "(git remote set-head origin --auto) or pass --base."
        )


def checks():
    return load("process").get("checks", []) + load("project").get("checks", [])


def selection(check, changed):
    """Return the reason a check runs, or None."""
    paths = check.get("paths")
    if not paths:
        return "always"
    if any(path in DEFINITIONS for path in changed):
        return "check definitions changed"
    for path in changed:
        if any(fnmatch.fnmatchcase(path, pattern) for pattern in paths):
            return f"{path} changed"
    return None


def run_checks(args):
    base = args.base or default_base()
    try:
        merge_base, changed = changed_paths(base, args.head)
    except CommandError as error:
        print(f"Selection unavailable: {error}", file=sys.stderr)
        return 2
    print(f"Comparing {args.head} with {base} (merge-base {merge_base[:12]}): {len(changed)} changed paths.")
    selected = [(check, selection(check, changed)) for check in checks()]
    if args.list:
        for check, reason in selected:
            print(f"  {check['name']}: {'runs, ' + reason if reason else 'not selected'}")
        return 0

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as listing:
        listing.write("".join(f"{path}\n" for path in changed))
    env = {**os.environ, "DNA_BASE": merge_base, "DNA_HEAD": git("rev-parse", args.head), "DNA_CHANGED": listing.name}
    results = []
    try:
        for check, reason in selected:
            if not reason:
                results.append((check["name"], "skipped"))
                continue
            print(f"\n== {check['name']} ({reason})\n$ {check['run']}", flush=True)
            code = subprocess.run(check["run"], shell=True, cwd=ROOT, env=env).returncode
            results.append((check["name"], "passed" if code == 0 else f"failed ({code})"))
    finally:
        Path(listing.name).unlink(missing_ok=True)

    print("\nResults:")
    for name, result in results:
        print(f"  {name}: {result}")
    return 1 if any(result.startswith("failed") for _, result in results) else 0


def changed_from_env():
    listing = os.environ.get("DNA_CHANGED")
    if listing:
        return Path(listing).read_text().split()
    _, changed = changed_paths(default_base(), "HEAD")
    return changed


def check_scope(args):
    """A change to the wiki/ folder is its own change, like a commit to a separate Wiki repository."""
    if not WIKI.is_dir():
        print("No wiki/ folder: the Wiki is the GitHub Wiki.")
        return 0
    changed = changed_from_env()
    in_wiki = [path for path in changed if path.startswith("wiki/")]
    outside = [path for path in changed if not path.startswith("wiki/")]
    if in_wiki and outside:
        print("This change mixes Wiki pages with other files. Publish the Wiki change as its own pull request,")
        print("after the change it describes has merged.")
        print("  Wiki: " + ", ".join(in_wiki))
        print("  Other: " + ", ".join(outside))
        return 1
    print("Scope is separate." if changed else "No changes.")
    return 0


def check_wiki(args):
    directory = Path(args.dir) if args.dir else WIKI
    if not directory.is_dir():
        print("No wiki/ folder: the Wiki is the GitHub Wiki. `python3 -m dna doctor` checks it.")
        return 0
    found = wiki.problems(directory, native=args.native)
    for problem in found:
        print(problem)
    print(f"{len(found)} Wiki problems." if found else "Wiki pages are consistent.")
    return 1 if found else 0


def template_problems():
    manifest = load("template")
    found = []
    if manifest["state"] == "template":
        for path in manifest["owned"] + list(manifest["cleanup"]["replace"].values()) + manifest["cleanup"]["remove"]:
            if not (ROOT / path).exists():
                found.append(f"{path}: listed in dna/template.toml but missing")
        return found
    if manifest["state"] != "project":
        return [f"dna/template.toml: unknown state {manifest['state']!r}"]
    for value in placeholders(load("project")):
        found.append(f"dna/project.toml: unfilled {value}")
    for path in manifest["cleanup"]["replace"]:
        target = ROOT / path
        if target.is_file() and PLACEHOLDER.search(target.read_text(encoding="utf-8")):
            found.append(f"{path}: unfilled {{{{...}}}} values remain")
    for path in manifest["cleanup"]["remove"]:
        if (ROOT / path).exists():
            found.append(f"{path}: template leftover; `python3 -m dna cleanup` removes it")
    return found


def check_template(args):
    found = template_problems()
    for problem in found:
        print(problem)
    state = load("template")["state"]
    print(f"{len(found)} template problems." if found else f"Template manifest is consistent ({state}).")
    return 1 if found else 0


def add_parsers(sub):
    parser = sub.add_parser("check", help="run the checks the change selects")
    parser.add_argument("--base", help="ref to compare with (default: origin/HEAD)")
    parser.add_argument("--head", default="HEAD", help="revision to check (default: HEAD and uncommitted files)")
    parser.add_argument("--list", action="store_true", help="show the selection without running checks")
    parser.set_defaults(func=run_checks)

    parser = sub.add_parser("check-scope", help="require wiki/ changes to stand alone")
    parser.set_defaults(func=check_scope)

    parser = sub.add_parser("check-wiki", help="check links, names and orphans in the Wiki pages")
    parser.add_argument("--dir", help="Wiki directory (default: wiki/)")
    parser.add_argument("--native", action="store_true", help="the directory is a GitHub Wiki clone")
    parser.set_defaults(func=check_wiki)

    parser = sub.add_parser("check-template", help="check the template manifest and setup leftovers")
    parser.set_defaults(func=check_template)
