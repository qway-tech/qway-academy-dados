#!/usr/bin/env python3

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

VALIDATOR = [
    sys.executable,
    "tooling/validate/validate_content.py",
]

BUILDER = [
    sys.executable,
    "tooling/build/build_content.py",
]


def run(command: list[str]) -> None:
    print()
    print("$", " ".join(command))
    subprocess.run(
        command,
        cwd=ROOT,
        check=True,
    )


def update() -> None:
    """
    Validate canonical content, regenerate deterministic read models,
    then prove that generated output is synchronized.
    """
    print("QWay Academy Content Plane — UPDATE")

    run(VALIDATOR)

    run(
        BUILDER
        + [
            "--skip-validation",
        ]
    )

    run(
        BUILDER
        + [
            "--skip-validation",
            "--check",
        ]
    )

    print()
    print("OK: Content Plane validated and generated catalogs updated.")


def check() -> None:
    """
    CI/read-only mode.

    Validate canonical content and fail if a committed generated
    read model is stale.
    """
    print("QWay Academy Content Plane — CHECK")

    run(VALIDATOR)

    run(
        BUILDER
        + [
            "--skip-validation",
            "--check",
        ]
    )

    print()
    print("OK: Content Plane is valid and generated catalogs are current.")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="QWay Academy Content Plane command runner."
    )

    parser.add_argument(
        "command",
        choices=("update", "check"),
        help=(
            "'update' regenerates committed read models; "
            "'check' validates without changing files."
        ),
    )

    args = parser.parse_args()

    try:
        if args.command == "update":
            update()
        else:
            check()

        return 0

    except subprocess.CalledProcessError as exc:
        print()
        print(
            f"ERROR: command failed with exit code {exc.returncode}.",
            file=sys.stderr,
        )
        return exc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
