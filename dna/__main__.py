"""Process tools: python3 -m dna <command>. The Wiki's Process-tools page explains them."""

import argparse
import sys

if sys.version_info < (3, 11):
    sys.exit("The process tools need Python 3.11 or later.")

from . import check, doctor, merge, setup  # noqa: E402
from .gh import CommandError  # noqa: E402


def main(argv=None):
    parser = argparse.ArgumentParser(prog="python3 -m dna", description="Apply the project's process to GitHub and the repository.")
    sub = parser.add_subparsers(dest="command", required=True, metavar="command")
    for module in (check, doctor, merge, setup):
        module.add_parsers(sub)
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except CommandError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
