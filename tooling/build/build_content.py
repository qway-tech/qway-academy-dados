#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

GENERATOR_VERSION = "1.0"


def discover_repo_root(start: Path) -> Path:
    start = start.resolve()
    try:
        result = subprocess.run(
            ["git", "-C", str(start), "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
        )
        return Path(result.stdout.strip()).resolve()
    except Exception:
        current = start
        while True:
            if (current / ".git").exists():
                return current
            if current.parent == current:
                raise SystemExit("Could not locate repository root.")
            current = current.parent


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def collection_order(root: Path) -> dict[str, int]:
    doc = read_json(root / "taxonomy/resource-collections.json")
    result: dict[str, int] = {}
    for item in doc.get("collections", []):
        if isinstance(item, dict) and isinstance(item.get("id"), str):
            result[item["id"]] = int(item.get("order", 9999))
    return result


def resolve_assets(root: Path, entity_dir: Path, assets: list[Any]) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    for raw in assets:
        if not isinstance(raw, dict):
            continue
        item = dict(raw)
        path = item.get("path")
        if isinstance(path, str):
            absolute = (entity_dir / path).resolve()
            item["path"] = absolute.relative_to(root.resolve()).as_posix()
        resolved.append(item)
    return resolved


def load_locales(entity_dir: Path, available_locales: list[str]) -> dict[str, Any]:
    locales: dict[str, Any] = {}
    for locale in sorted(available_locales):
        json_path = entity_dir / "locales" / f"{locale}.json"
        md_path = entity_dir / "locales" / f"{locale}.md"

        if json_path.exists():
            locales[locale] = read_json(json_path)
        elif md_path.exists():
            locales[locale] = {"body": md_path.read_text(encoding="utf-8")}
        else:
            raise ValueError(
                f"Declared locale '{locale}' has no locale file in {entity_dir}"
            )
    return locales


def build_resource_item(root: Path, manifest_path: Path) -> dict[str, Any]:
    manifest = read_json(manifest_path)
    entity_dir = manifest_path.parent

    item: dict[str, Any] = {
        "id": manifest["id"],
        "slug": manifest["slug"],
        "collection": manifest["collection"],
        "type": manifest["type"],
        "status": manifest["status"],
        "sourceLocale": manifest["sourceLocale"],
        "availableLocales": sorted(manifest["availableLocales"]),
        "contentPath": entity_dir.relative_to(root).as_posix(),
        "tags": sorted(manifest.get("tags", [])),
        "authors": manifest.get("authors", []),
        "maintainers": manifest.get("maintainers", []),
        "metadata": manifest.get("metadata", {}),
        "assets": resolve_assets(root, entity_dir, manifest.get("assets", [])),
        "links": manifest.get("links", []),
        "locales": load_locales(entity_dir, manifest["availableLocales"]),
    }

    # Omit empty optional projection fields to keep the catalog compact and stable.
    for key in ["tags", "authors", "maintainers", "metadata", "assets", "links"]:
        if item.get(key) in ([], {}, None):
            item.pop(key, None)

    return item


def build_resources_catalog(root: Path) -> dict[str, Any]:
    resources_root = root / "content/resources"
    order = collection_order(root)

    manifests = (
        sorted(resources_root.glob("*/*/manifest.json"))
        if resources_root.exists()
        else []
    )

    items = [build_resource_item(root, p) for p in manifests]
    items.sort(
        key=lambda x: (
            order.get(x["collection"], 9999),
            x["collection"],
            x["slug"],
            x["id"],
        )
    )

    return {
        "schemaVersion": "2.0",
        "generatorVersion": GENERATOR_VERSION,
        "items": items,
    }


def canonical_json(data: Any) -> str:
    return json.dumps(
        data,
        ensure_ascii=False,
        indent=2,
        sort_keys=False,
    ) + "\n"


def validate_first(root: Path) -> None:
    validator = root / "tooling/validate/validate_content.py"
    if not validator.exists():
        raise SystemExit(
            "Validator not found at tooling/validate/validate_content.py."
        )

    result = subprocess.run(
        [sys.executable, str(validator), "--root", str(root)],
        cwd=root,
    )
    if result.returncode != 0:
        raise SystemExit(
            f"Content validation failed with exit code {result.returncode}; "
            "catalog generation aborted."
        )


def write_if_changed(path: Path, text: str) -> bool:
    previous = path.read_text(encoding="utf-8") if path.exists() else None
    if previous == text:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return True


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Build deterministic QWay Academy Content Plane v2 catalogs."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root or any path inside it.",
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Build without running the repository validator first.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Do not write; fail if generated resources catalog differs from disk.",
    )
    args = parser.parse_args(argv)

    root = discover_repo_root(args.root)

    if not args.skip_validation:
        validate_first(root)

    catalog = build_resources_catalog(root)
    rendered = canonical_json(catalog)
    output = root / "generated/catalogs/resources.json"

    if args.check:
        if not output.exists():
            print(f"OUTDATED: {output.relative_to(root)} does not exist.")
            return 1
        current = output.read_text(encoding="utf-8")
        if current != rendered:
            print(f"OUTDATED: {output.relative_to(root)} differs from canonical build.")
            return 1
        print(f"OK: {output.relative_to(root)} is up to date.")
        return 0

    changed = write_if_changed(output, rendered)
    state = "updated" if changed else "unchanged"
    print(
        f"OK: generated/catalogs/resources.json {state} "
        f"({len(catalog['items'])} item(s))."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
