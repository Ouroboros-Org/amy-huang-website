"""Checks for the Wiki's pages, in the wiki/ folder or a clone of the GitHub Wiki.

Both storage forms use the same format: flat, hyphenated page names, Home.md,
optional _Sidebar.md and _Footer.md, and Markdown only. Links between pages are
written Page.md in the folder, so they work in the repository's file view, and
Page in the GitHub Wiki.
"""

import re
from pathlib import Path

SPECIAL = {"Home", "_Sidebar", "_Footer"}
PAGE_NAME = re.compile(r"^(?:_Sidebar|_Footer|[A-Za-z0-9][A-Za-z0-9-]*)\.md$")
FENCE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE = re.compile(r"`+[^`]*`+")
INLINE_LINK = re.compile(r"\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]*)>?(?:\s+[\"'(][^)]*)?\)")
REFERENCE_LINK = re.compile(r"^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)")
WIKI_LINK = re.compile(r"\[\[[^\]]+\]\]")
HEADING = re.compile(r"^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$")
EXTERNAL = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//)", re.IGNORECASE)
RELATIVE_PAGE_LINK = re.compile(r"(\]\(\s*<?|^\s{0,3}\[[^\]]+\]:\s*<?)([A-Za-z0-9_][A-Za-z0-9-]*)\.md(#[^)\s>]*)?", re.MULTILINE)


def prose_lines(text):
    """Yield (line number, line) outside fenced code blocks, without inline code."""
    fence = None
    for number, line in enumerate(text.splitlines(), 1):
        match = FENCE.match(line)
        if match:
            if fence is None:
                fence = match.group(1)
            elif match.group(1) == fence:
                fence = None
            continue
        if fence is None:
            yield number, INLINE_CODE.sub("", line)


def link_targets(text):
    """Yield (line number, target) for inline and reference links, including images."""
    for number, line in prose_lines(text):
        for match in INLINE_LINK.finditer(line):
            yield number, match.group(1)
        match = REFERENCE_LINK.match(line)
        if match:
            yield number, match.group(1)


def slug(heading):
    """GitHub's anchor for a heading."""
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", heading)
    text = text.replace("`", "").replace("*", "")
    return re.sub(r"[^\w\- ]", "", text.strip().lower()).replace(" ", "-")


def anchors(text):
    seen = {}
    result = set()
    for _, line in prose_lines(text):
        match = HEADING.match(line)
        if not match:
            continue
        base = slug(match.group(2))
        count = seen.get(base, 0)
        seen[base] = count + 1
        result.add(base if count == 0 else f"{base}-{count}")
    return result


def read_pages(directory):
    return {path.stem: path.read_text(encoding="utf-8") for path in sorted(Path(directory).glob("*.md"))}


def problems(directory, *, native=False, label=None):
    """Return a list of 'file:line: message' strings for the Wiki in `directory`."""
    directory = Path(directory)
    label = label or directory.name
    found = []

    def report(name, line, message):
        found.append(f"{label}/{name}:{line}: {message}" if line else f"{label}/{name}: {message}")

    for entry in sorted(directory.iterdir()):
        if entry.name.startswith("."):
            continue
        if entry.is_dir():
            report(entry.name, 0, "the Wiki is flat: move pages out of subfolders")
        elif entry.suffix != ".md":
            report(entry.name, 0, "the Wiki holds only Markdown pages; draw diagrams with Mermaid or link an absolute URL")
        elif not PAGE_NAME.match(entry.name):
            report(entry.name, 0, "page names use letters, digits and hyphens")

    pages = read_pages(directory)
    if "Home" not in pages:
        report("Home.md", 0, "missing: Home is the Wiki's entry page")
    page_anchors = {name: anchors(text) for name, text in pages.items()}
    linked = set()

    for name, text in pages.items():
        for number, line in prose_lines(text):
            if WIKI_LINK.search(line):
                report(f"{name}.md", number, "write [text](Page.md) links; [[Page]] links work only in the GitHub Wiki")
        for number, target in link_targets(text):
            if not target or EXTERNAL.match(target):
                continue
            page, _, anchor = target.partition("#")
            if not page:
                if anchor and anchor not in page_anchors[name]:
                    report(f"{name}.md", number, f"no heading for #{anchor}")
                continue
            if "/" in page or page.startswith("."):
                report(f"{name}.md", number, f"{target}: link repository files with an absolute URL")
                continue
            stem = page[:-3] if page.endswith(".md") else page
            if native and page.endswith(".md"):
                report(f"{name}.md", number, f"{target}: GitHub Wiki links name the page without .md")
            elif not native and not page.endswith(".md"):
                report(f"{name}.md", number, f"{target}: link {stem}.md so the link works in the repository")
            if stem not in pages:
                report(f"{name}.md", number, f"{target}: no such page")
                continue
            if stem != name:
                linked.add(stem)
            if anchor and anchor not in page_anchors[stem]:
                report(f"{name}.md", number, f"{target}: no heading for #{anchor} in {stem}")

    for name in pages:
        if name not in SPECIAL and name not in linked:
            report(f"{name}.md", 0, "orphan page: link it from Home, the sidebar or a related page")
    return found


def to_native(text):
    """Rewrite folder-form page links (Page.md) to GitHub Wiki links (Page)."""
    return RELATIVE_PAGE_LINK.sub(lambda match: f"{match.group(1)}{match.group(2)}{match.group(3) or ''}", text)
