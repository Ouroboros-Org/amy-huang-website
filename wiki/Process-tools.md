# Process tools

The `dna/` folder holds the machine-readable part of the process and the commands that apply it. The commands need Git, the GitHub CLI signed in, and Python 3.11 or later. Run them from the repository root.

## Commands

| Command | Purpose |
|---|---|
| `python3 -m dna check` | Run the checks that the change selects. |
| `python3 -m dna check-wiki` | Check the `wiki/` folder's page names, links, anchors and orphan pages. |
| `python3 -m dna doctor` | Report what the triage-refinement and grooming routines should look at. |
| `python3 -m dna merge <number> <head>` | Merge a reviewed pull request at its exact head and retire its branch. |
| `python3 -m dna setup` | Configure GitHub for the project. A dry run unless `--apply`. |
| `python3 -m dna cleanup` | Remove template material after setup. A dry run unless `--apply`. |

`python3 -m dna <command> --help` lists each command's options.

## Check a change

`dna check` compares the head with the merge-base of the base, `origin/HEAD` by default. When the head is `HEAD`, staged, unstaged and untracked files count as changed too. A check runs when:

- it lists no paths;
- a changed path matches one of its paths; or
- `dna/process.toml` or `dna/project.toml` changed.

Paths are Python `fnmatch` patterns, in which `*` also matches `/`. Each check receives `DNA_BASE`, `DNA_HEAD` and `DNA_CHANGED`, the name of a file that lists the changed paths. The command exits with `1` when a selected check failed and `2` when the selection is unavailable.

The built-in checks are:

- `scope`, which requires `wiki/` changes to stand alone;
- `wiki`, which checks the folder's pages;
- `template`, which checks the template manifest and setup leftovers.

Add a project check to `dna/project.toml`:

```toml
[[checks]]
name = "unit tests"
paths = ["src/*", "tests/*"]
run = "make test"
```

When a check needs a toolchain on the hosted runner, add its setup steps to `.github/workflows/checks.yml` before the check step.

## Configuration

| File | Holds | Owner |
|---|---|---|
| `dna/project.toml` | The project's decisions: name, horizons, merge method, Wiki form, routine settings and checks. | The project |
| `dna/process.toml` | Labels, Project fields and views, and the built-in checks. | dna-template |
| `dna/template.toml` | The template version, the template-owned paths and the cleanup manifest. | dna-template |

## Routines

`.github/workflows/routines.yml` runs `dna doctor` on a schedule and on demand, and writes the report to the run summary. Change its schedule to match the project's throughput. With the workflow token, the report covers Issues and the `wiki/` folder. To include the planning Project and a private GitHub Wiki, store a token that can read both as the repository secret `DNA_DOCTOR_TOKEN`.

## Template-owned files

The files listed as `owned` in `dna/template.toml` come from dna-template. Improve them there and bring the change back, rather than changing them only in one project, so that projects keep a common process.
