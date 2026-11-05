"""Thin wrappers around git and the GitHub CLI."""

import json
import os
import subprocess

from .config import ROOT


class CommandError(Exception):
    def __init__(self, args, result):
        self.result = result
        detail = (result.stderr or result.stdout).strip()
        super().__init__(f"{' '.join(args)} failed ({result.returncode}): {detail}")


def run(args, *, input=None, check=True, cwd=ROOT):
    # Never wait for a credential prompt: a missing credential is a failed command.
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    result = subprocess.run(args, input=input, capture_output=True, text=True, cwd=cwd, env=env)
    if check and result.returncode != 0:
        raise CommandError(args, result)
    return result


def git(*args, check=True, cwd=ROOT):
    return run(["git", *args], check=check, cwd=cwd).stdout.strip()


def gh(*args, input=None, check=True):
    return run(["gh", *args], input=input, check=check).stdout


def gh_json(*args):
    output = gh(*args)
    return json.loads(output) if output.strip() else None


def api(path, method="GET", body=None, paginate=False):
    """Call the REST API. A body is sent as JSON."""
    args = ["api", "-X", method, path, "-H", "Accept: application/vnd.github+json"]
    if paginate:
        args += ["--paginate", "--slurp"]
    if body is not None:
        args += ["--input", "-"]
    output = gh(*args, input=json.dumps(body) if body is not None else None)
    if not output.strip():
        return None
    data = json.loads(output)
    if paginate:
        return [item for page in data for item in (page if isinstance(page, list) else [page])]
    return data


def graphql(query, **variables):
    payload = {"query": query, "variables": variables}
    data = json.loads(gh("api", "graphql", "--input", "-", input=json.dumps(payload)))
    if data.get("errors"):
        raise RuntimeError("; ".join(error["message"] for error in data["errors"]))
    return data["data"]


def repository():
    """The current repository's identity and settings."""
    return gh_json(
        "repo", "view", "--json",
        "nameWithOwner,owner,url,visibility,isTemplate,hasWikiEnabled,hasIssuesEnabled,"
        "hasProjectsEnabled,defaultBranchRef,squashMergeAllowed,mergeCommitAllowed,"
        "rebaseMergeAllowed,deleteBranchOnMerge",
    )


def wiki_url(name_with_owner):
    return f"https://github.com/{name_with_owner}.wiki.git"


def wiki_reachable(name_with_owner):
    """True when the GitHub Wiki's Git repository exists. It exists only after its first page."""
    return run(["git", "ls-remote", "--exit-code", wiki_url(name_with_owner)], check=False).returncode in (0, 2)
