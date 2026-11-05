"""Paths and configuration files shared by the commands."""

import re
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "wiki"
PLACEHOLDER = re.compile(r"\{\{[^{}]+\}\}")


def load(name):
    """Read dna/<name>.toml."""
    with open(ROOT / "dna" / f"{name}.toml", "rb") as handle:
        return tomllib.load(handle)


def placeholders(value):
    """Return the unfilled {{...}} values in a configuration value, recursively."""
    if isinstance(value, str):
        return PLACEHOLDER.findall(value)
    if isinstance(value, dict):
        return [found for item in value.values() for found in placeholders(item)]
    if isinstance(value, list):
        return [found for item in value for found in placeholders(item)]
    return []


def project_title(project):
    return project["planning"].get("project_title") or f"{project['project']['name']} planning"


def horizons(project):
    values = project["planning"]["horizons"]
    if len(values) != 4:
        raise SystemExit("dna/project.toml: planning.horizons needs four milestones: soon, after, later, some time.")
    return values
