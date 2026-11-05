# dna-template

A starting point for projects that people, agents or both develop. It holds no product code. It holds the process: where each kind of information lives, how work moves from an idea to a delivered result, and the routines that keep the records healthy.

GitHub carries the process: Issues, pull requests, milestones, a planning Project and a Wiki. Any person, agent or orchestration can read it there and work with it. The template names no roles and needs no tools beyond Git, the GitHub CLI and a small set of Python commands. The process says what each step must leave behind, not who takes it.

## What a project gets

- **Information homes.** The past lives in Issues, the Wiki and Releases; the present in pull requests; the future in the planning Project and milestones. [Information homes](wiki/Information-homes.md) explains them.
- **Planning horizons from the start.** `0.0.1` soon, `0.0.2` after, `0.1.x` later, `1.x.x` some time. See [Project planning](wiki/Project-planning.md).
- **Recorded steps.** Review on the exact head, merges that verify what was reviewed, branches archived before deletion, and Issues closed deliberately once acceptance is verified.
- **Routines.** [Triage and refinement](wiki/Triage-and-refinement.md) and [Wiki grooming](wiki/Wiki-maintenance.md#groom-the-wiki), at a cadence that follows throughput.
- **A handbook.** The repository's GitHub Wiki when it is available, otherwise the `wiki/` folder, which is treated like a separate Wiki repository.

## Start a project

You need Git, the GitHub CLI signed in with the `repo`, `workflow` and `project` scopes, and Python 3.11 or later.

1. Create a repository from this template, with **Use this template** on GitHub or:

   ```sh
   gh repo create <owner>/<name> --template Marc-Paul/dna-template --private --clone
   ```

2. Fill the `{{...}}` values in `dna/project.toml` and review its other decisions: horizons, merge method and Wiki form.
3. To keep the handbook in the GitHub Wiki, create the Wiki's first page in the browser now. GitHub creates the Wiki's Git repository only with that page, and setup then seeds it from `wiki/`. Without it, the `wiki/` folder stays the handbook. The GitHub Wiki needs a public repository or a paid plan.
4. Preview the GitHub configuration with `python3 -m dna setup`. Apply it with `python3 -m dna setup --apply`, which reads every area back afterwards.
5. Preview the template cleanup with `python3 -m dna cleanup`, then run `python3 -m dna cleanup --apply`. It replaces this README with the project's own and, in the GitHub Wiki form, moves the handbook out of the repository.
6. Commit on a branch and open the Bootstrap pull request with the setup readback. Review it and merge it with `python3 -m dna merge <number> <head>`. This first change runs the whole process once.
7. Record the first outcomes as Issues and triage them onto the horizons.

[Process tools](wiki/Process-tools.md) describes each command and configuration file.

## Improve the template

Files listed as `owned` in `dna/template.toml` come from this template. Improve them here first, then carry the change into projects, so that projects keep a common process.
