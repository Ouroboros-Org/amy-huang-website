# Wiki maintenance

This handbook explains reusable behavior, reasons and recurring tasks, and people and agents use the same pages. Two habits keep it useful: work updates the answer it changes, and a grooming routine keeps the whole handbook relevant and connected.

## Choose what belongs here

A page answers a recurring question that the source or another page doesn't already answer. Keep architecture, important contracts, operating constraints and procedures here. Defect investigation stays in Issues, future choices in the planning Project, and current changes in pull requests. Record a known defect in an Issue before a page describes its constraint, and add a process rule for a recurring need, not for a single incident.

Audit reports, function catalogues, test totals and work queues don't become pages. Keep their useful conclusion in the page that owns the topic.

## Edit the owning answer

1. Identify the reader's question.
2. Search the existing pages and headings.
3. Check the relevant source, configuration or evidence.
4. Update the existing answer when its purpose fits, and correct or link other statements of the same claim.
5. Add a page only for a distinct recurring task or explanation, and link it from Home or its overview page.

Replace outdated text instead of appending to it; Git history keeps the old version. A source link pinned to a commit identifies the implementation; it doesn't prove delivery.

## Update guidance with a change

When work changes behavior, a procedure or an instruction that a page describes, it updates that page. This happens when the task calls for it, not as a ritual for every change. The handbook describes accepted behavior, so the Wiki change follows the merge:

1. While preparing the pull request, name the affected page and heading, and the rule the change adds or replaces, in its Wiki update section.
2. After the pull request merges, publish the Wiki change. Pin source links for the changed claims to the merged commit.
3. Record the Wiki revision on the Issue or pull request.

A Wiki change can also stand alone, for example to record a finding from refinement.

## Publish a change

The mindset is the same in both storage forms; only the mechanics differ.

| Storage | Publish |
|---|---|
| `wiki/` folder | A pull request that changes only `wiki/`. Review it like any other change. |
| GitHub Wiki | Edit in the browser, or push to the `.wiki.git` repository. There is no pull request, but treat the edit the same way: check it, read the diff, push without force and read back the changed pages. |

In both forms, check changed claims and commands against the implementation, verify links and anchors, and link new pages from Home or their overview page.

## Groom the Wiki

Grooming is a routine of its own, separate from ordinary work. Its pace follows how fast the project changes, from daily to weekly. Each pass checks the pages for two qualities:

- **Relevant.** The page is still true for current source and delivered behavior. Merge duplicate answers into their owner, update or remove outdated statements, and retire pages that lost their purpose.
- **Connected.** The page is reachable from Home or the sidebar, linked from the pages it relates to, and links its owners instead of restating them.

A pass reads the pages that merges since the last pass affected, and follows their links. Look for broken links and anchors, pages nothing links to, source links whose pinned file changed since, and links to Issues that have closed. A pass is done when each finding has a disposition.

## Write for the task

Lead with the purpose or the result. Use plain words, active verbs and consistent terms, and define unfamiliar terms in the [Glossary](Glossary.md). Describe current behavior without change wording such as "now" or "new". Put conditions before actions. Use paragraphs for explanations, numbered steps for procedures and tables for comparisons. Preserve exact identifiers, commands and paths.

## Move between storage forms

Both forms use the same format: flat, hyphenated page names, `Home.md`, an optional `_Sidebar.md` and `_Footer.md`, and Markdown only, with Mermaid for diagrams. Links between pages are written `Page.md` in the folder and `Page` in the GitHub Wiki, and links from repository files point at the folder or at the GitHub Wiki's URL.

A move copies the pages, rewrites the links between them, and repoints the links from repository files, in one change of its own.
