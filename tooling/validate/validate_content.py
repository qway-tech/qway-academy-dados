#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Iterable

try:
    from jsonschema import Draft202012Validator
    from referencing import Registry, Resource
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: jsonschema. Install with:\n"
        "  python3 -m pip install -r tooling/validate/requirements.txt"
    ) from exc


SUPPORTED_SCHEMA_VERSION = "2.0"
ENTITY_ID_RE = re.compile(r"^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*){2,}$")
KEBAB_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LOCALE_FILE_RE = re.compile(r"^(pt|en|es)\.(json|md)$")

FORBIDDEN_CONTENT_SEGMENTS = {
    "usuarios",
    "users",
    "attempts",
    "results",
    "progress",
    "memberships",
    "entitlements",
    "answer-keys",
    "answer_keys",
    "private-question-bank",
    "private_question_bank",
}

LEGACY_ASSESSMENT_PATTERNS = (
    "formacoes/**/quiz/perguntas.json",
    "formacoes/**/exame/*.json",
)

KIND_SCHEMA = {
    "resource": "schemas/resources/resource-manifest.schema.json",
}


@dataclass(order=True)
class Finding:
    severity: str
    code: str
    path: str
    message: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


class ValidationReport:
    def __init__(self) -> None:
        self.findings: list[Finding] = []

    def add(self, severity: str, code: str, path: Path | str, message: str) -> None:
        p = str(path).replace("\\", "/")
        self.findings.append(Finding(severity, code, p, message))

    def error(self, code: str, path: Path | str, message: str) -> None:
        self.add("ERROR", code, path, message)

    def warn(self, code: str, path: Path | str, message: str) -> None:
        self.add("WARN", code, path, message)

    def info(self, code: str, path: Path | str, message: str) -> None:
        self.add("INFO", code, path, message)

    @property
    def errors(self) -> list[Finding]:
        return [f for f in self.findings if f.severity == "ERROR"]

    @property
    def warnings(self) -> list[Finding]:
        return [f for f in self.findings if f.severity == "WARN"]

    def sorted(self) -> list[Finding]:
        order = {"ERROR": 0, "WARN": 1, "INFO": 2}
        return sorted(self.findings, key=lambda f: (order[f.severity], f.path, f.code, f.message))


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


def load_json(path: Path, report: ValidationReport) -> Any | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        report.error("FILE_MISSING", path, "Required file does not exist.")
    except json.JSONDecodeError as exc:
        report.error(
            "JSON_INVALID",
            path,
            f"Invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}",
        )
    except UnicodeDecodeError:
        report.error("UTF8_INVALID", path, "File is not valid UTF-8.")
    return None


def relative(root: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except Exception:
        return path.as_posix()


def load_schema_registry(root: Path, report: ValidationReport) -> tuple[dict[str, Any], Registry]:
    schemas: dict[str, Any] = {}
    resources: list[tuple[str, Resource[Any]]] = []

    schema_root = root / "schemas"
    if not schema_root.exists():
        report.error("SCHEMAS_MISSING", "schemas", "schemas/ directory does not exist.")
        return schemas, Registry()

    for path in sorted(schema_root.rglob("*.schema.json")):
        data = load_json(path, report)
        if not isinstance(data, dict):
            continue
        sid = data.get("$id")
        if not isinstance(sid, str) or not sid:
            report.error("SCHEMA_ID_MISSING", relative(root, path), "Schema must define a non-empty $id.")
            continue
        try:
            resource = Resource.from_contents(data)
        except Exception as exc:
            report.error("SCHEMA_INVALID", relative(root, path), f"Cannot load schema resource: {exc}")
            continue
        schemas[relative(root, path)] = data
        resources.append((sid, resource))

    registry = Registry().with_resources(resources)
    return schemas, registry


def validate_schema_document(
    root: Path,
    manifest_path: Path,
    data: dict[str, Any],
    schema_rel: str,
    schemas: dict[str, Any],
    registry: Registry,
    report: ValidationReport,
) -> None:
    schema = schemas.get(schema_rel)
    if schema is None:
        report.error("SCHEMA_NOT_FOUND", schema_rel, f"Schema required for {relative(root, manifest_path)} was not loaded.")
        return

    try:
        validator = Draft202012Validator(schema, registry=registry)
        errors = sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path))
    except Exception as exc:
        report.error("SCHEMA_RUNTIME_ERROR", schema_rel, f"Could not execute schema validation: {exc}")
        return

    for err in errors:
        json_path = "$"
        for item in err.absolute_path:
            if isinstance(item, int):
                json_path += f"[{item}]"
            else:
                json_path += f".{item}"
        report.error(
            "SCHEMA_VIOLATION",
            relative(root, manifest_path),
            f"{json_path}: {err.message}",
        )


def taxonomy_ids(data: Any, key: str) -> set[str]:
    if not isinstance(data, dict):
        return set()
    values = data.get(key, [])
    if key == "collections" and isinstance(values, list):
        return {x.get("id") for x in values if isinstance(x, dict) and isinstance(x.get("id"), str)}
    if isinstance(values, list):
        return {x for x in values if isinstance(x, str)}
    return set()


def validate_taxonomy(root: Path, report: ValidationReport) -> dict[str, Any]:
    taxonomy_root = root / "taxonomy"
    if not taxonomy_root.exists():
        report.error("TAXONOMY_MISSING", "taxonomy", "taxonomy/ directory does not exist.")
        return {}

    collections_doc = load_json(taxonomy_root / "resource-collections.json", report)
    types_doc = load_json(taxonomy_root / "resource-types.json", report)
    locales_doc = load_json(taxonomy_root / "locales.json", report)

    collections = taxonomy_ids(collections_doc, "collections")
    types = taxonomy_ids(types_doc, "types")

    supported_locales: set[str] = set()
    if isinstance(locales_doc, dict):
        supported = locales_doc.get("supported", [])
        if isinstance(supported, list):
            supported_locales = {x for x in supported if isinstance(x, str)}

    if not collections:
        report.error("TAXONOMY_EMPTY", "taxonomy/resource-collections.json", "No resource collections defined.")
    if not types:
        report.error("TAXONOMY_EMPTY", "taxonomy/resource-types.json", "No resource types defined.")
    if not supported_locales:
        report.error("TAXONOMY_EMPTY", "taxonomy/locales.json", "No supported locales defined.")

    labels_by_locale: dict[str, dict[str, str]] = {}
    for locale in sorted(supported_locales):
        p = taxonomy_root / "locales" / f"{locale}.json"
        data = load_json(p, report)
        labels: dict[str, str] = {}
        if isinstance(data, dict):
            raw = data.get("resourceCollections", {})
            if isinstance(raw, dict):
                labels = {str(k): str(v) for k, v in raw.items() if isinstance(v, str)}
        labels_by_locale[locale] = labels

        missing = sorted(collections - set(labels))
        if missing:
            report.error(
                "TAXONOMY_LABEL_MISSING",
                relative(root, p),
                f"Missing resource collection labels: {', '.join(missing)}",
            )

        unknown = sorted(set(labels) - collections)
        if unknown:
            report.warn(
                "TAXONOMY_LABEL_UNKNOWN",
                relative(root, p),
                f"Labels exist for unknown collections: {', '.join(unknown)}",
            )

    return {
        "collections": collections,
        "types": types,
        "locales": supported_locales,
        "labels": labels_by_locale,
    }


def validate_public_boundary(root: Path, report: ValidationReport, strict_legacy: bool) -> None:
    content_root = root / "content"
    if content_root.exists():
        for path in content_root.rglob("*"):
            rel_parts = [p.lower() for p in path.relative_to(content_root).parts]
            bad = FORBIDDEN_CONTENT_SEGMENTS.intersection(rel_parts)
            if bad:
                report.error(
                    "PUBLIC_BOUNDARY_VIOLATION",
                    relative(root, path),
                    f"Forbidden public Content Plane path segment(s): {', '.join(sorted(bad))}",
                )

            lower_name = path.name.lower()
            if re.match(r"^(respostas|resultados|answers|attempts)(?:_|\.|$)", lower_name):
                report.error(
                    "PUBLIC_OPERATIONAL_DATA_PATTERN",
                    relative(root, path),
                    "Operational answer/result/attempt-like file is forbidden under content/.",
                )

    legacy_users = root / "usuarios"
    if legacy_users.exists():
        add = report.error if strict_legacy else report.warn
        add(
            "LEGACY_PUBLIC_USER_DATA",
            "usuarios",
            "Legacy usuarios/ exists in the public repository and must not migrate into v2 content/.",
        )

    for pattern in LEGACY_ASSESSMENT_PATTERNS:
        for path in root.glob(pattern):
            report.warn(
                "ASSESSMENT_CLASSIFICATION_REQUIRED",
                relative(root, path),
                "Legacy assessment content requires explicit PUBLIC SELF-CHECK vs PROTECTED ASSESSMENT classification before migration.",
            )


def validate_resource_entities(
    root: Path,
    schemas: dict[str, Any],
    registry: Registry,
    taxonomy: dict[str, Any],
    report: ValidationReport,
) -> None:
    resources_root = root / "content" / "resources"
    if not resources_root.exists():
        report.info("RESOURCES_NOT_MIGRATED", "content/resources", "No v2 Resources entities found yet.")
        return

    manifests = sorted(resources_root.glob("*/*/manifest.json"))
    if not manifests:
        report.warn("RESOURCE_MANIFESTS_MISSING", "content/resources", "No resource manifest.json files found.")
        return

    ids: dict[str, str] = {}
    legacy_ids: dict[str, str] = {}
    slugs_by_collection: dict[tuple[str, str], str] = {}

    collections: set[str] = taxonomy.get("collections", set())
    types: set[str] = taxonomy.get("types", set())
    supported_locales: set[str] = taxonomy.get("locales", set())

    for manifest_path in manifests:
        rel_manifest = relative(root, manifest_path)
        data = load_json(manifest_path, report)
        if not isinstance(data, dict):
            continue

        validate_schema_document(
            root,
            manifest_path,
            data,
            "schemas/resources/resource-manifest.schema.json",
            schemas,
            registry,
            report,
        )

        entity_dir = manifest_path.parent
        collection_dir = entity_dir.parent.name
        slug_dir = entity_dir.name

        entity_id = data.get("id")
        slug = data.get("slug")
        collection = data.get("collection")
        rtype = data.get("type")
        source_locale = data.get("sourceLocale")
        available = data.get("availableLocales", [])

        if isinstance(entity_id, str):
            if not ENTITY_ID_RE.fullmatch(entity_id):
                report.error("ENTITY_ID_INVALID", rel_manifest, f"Invalid canonical ID: {entity_id}")
            previous = ids.get(entity_id)
            if previous:
                report.error("ENTITY_ID_DUPLICATE", rel_manifest, f"Canonical ID already used by {previous}: {entity_id}")
            else:
                ids[entity_id] = rel_manifest

        if not isinstance(slug, str) or not KEBAB_RE.fullmatch(slug):
            report.error("SLUG_INVALID", rel_manifest, f"Invalid semantic kebab-case slug: {slug!r}")
        elif slug != slug_dir:
            report.error("SLUG_PATH_MISMATCH", rel_manifest, f"manifest slug '{slug}' != entity directory '{slug_dir}'")

        if collection != collection_dir:
            report.error(
                "COLLECTION_PATH_MISMATCH",
                rel_manifest,
                f"manifest collection '{collection}' != parent collection directory '{collection_dir}'",
            )
        if isinstance(collection, str) and collection not in collections:
            report.error("COLLECTION_UNKNOWN", rel_manifest, f"Unknown resource collection: {collection}")

        if isinstance(rtype, str) and rtype not in types:
            report.error("RESOURCE_TYPE_UNKNOWN", rel_manifest, f"Unknown resource type: {rtype}")

        if isinstance(slug, str) and isinstance(collection, str):
            key = (collection, slug)
            previous = slugs_by_collection.get(key)
            if previous:
                report.error("SLUG_DUPLICATE", rel_manifest, f"Duplicate slug within collection; already used by {previous}")
            else:
                slugs_by_collection[key] = rel_manifest

        if isinstance(source_locale, str) and isinstance(available, list):
            if source_locale not in available:
                report.error(
                    "SOURCE_LOCALE_NOT_AVAILABLE",
                    rel_manifest,
                    f"sourceLocale '{source_locale}' is not listed in availableLocales.",
                )

        if isinstance(available, list):
            unknown_locales = sorted(
                {x for x in available if isinstance(x, str)} - supported_locales
            )
            if unknown_locales:
                report.error(
                    "LOCALE_UNKNOWN",
                    rel_manifest,
                    f"Unsupported availableLocales: {', '.join(unknown_locales)}",
                )

        legacy = data.get("legacyIds", [])
        if isinstance(legacy, list):
            for legacy_id in legacy:
                if not isinstance(legacy_id, str):
                    continue
                previous = legacy_ids.get(legacy_id)
                if previous:
                    report.error(
                        "LEGACY_ID_DUPLICATE",
                        rel_manifest,
                        f"legacyId '{legacy_id}' already claimed by {previous}",
                    )
                else:
                    legacy_ids[legacy_id] = rel_manifest

        locales_dir = entity_dir / "locales"
        declared = {x for x in available if isinstance(x, str)} if isinstance(available, list) else set()
        actual: dict[str, list[Path]] = {}

        if locales_dir.exists():
            for p in sorted(locales_dir.iterdir()):
                if not p.is_file():
                    continue
                match = LOCALE_FILE_RE.fullmatch(p.name)
                if not match:
                    report.warn(
                        "LOCALE_FILE_UNRECOGNIZED",
                        relative(root, p),
                        "Locale file must be named <locale>.json or <locale>.md.",
                    )
                    continue
                locale = match.group(1)
                actual.setdefault(locale, []).append(p)

        for locale in sorted(declared):
            candidates = actual.get(locale, [])
            if not candidates:
                report.error(
                    "LOCALE_FILE_MISSING",
                    rel_manifest,
                    f"Declared locale '{locale}' has no locales/{locale}.json or locales/{locale}.md.",
                )
            elif len(candidates) > 1:
                report.error(
                    "LOCALE_FILE_AMBIGUOUS",
                    rel_manifest,
                    f"Locale '{locale}' has both/multiple primary locale files.",
                )

        undeclared = sorted(set(actual) - declared)
        if undeclared:
            report.error(
                "LOCALE_FILE_UNDECLARED",
                rel_manifest,
                f"Locale file(s) exist but are not declared in availableLocales: {', '.join(undeclared)}",
            )

        for locale, paths in actual.items():
            for p in paths:
                if p.suffix == ".json":
                    loc_data = load_json(p, report)
                    if isinstance(loc_data, dict):
                        schema_rel = "schemas/resources/resource-locale.schema.json"
                        validate_schema_document(root, p, loc_data, schema_rel, schemas, registry, report)

        for asset in data.get("assets", []) if isinstance(data.get("assets"), list) else []:
            if not isinstance(asset, dict):
                continue
            asset_path = asset.get("path")
            if not isinstance(asset_path, str):
                continue
            resolved = (entity_dir / asset_path).resolve()
            try:
                resolved.relative_to(entity_dir.resolve())
            except ValueError:
                report.error(
                    "ASSET_PATH_ESCAPE",
                    rel_manifest,
                    f"Asset path escapes entity directory: {asset_path}",
                )
                continue
            if not resolved.exists():
                report.error(
                    "ASSET_MISSING",
                    rel_manifest,
                    f"Referenced asset does not exist: {asset_path}",
                )


def write_json_report(path: Path, root: Path, report: ValidationReport) -> None:
    payload = {
        "root": str(root),
        "summary": {
            "errors": len(report.errors),
            "warnings": len(report.warnings),
            "findings": len(report.findings),
        },
        "findings": [f.to_dict() for f in report.sorted()],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def print_report(root: Path, report: ValidationReport) -> None:
    print(f"Content Plane v2 validation: {root}")
    print()
    for f in report.sorted():
        print(f"[{f.severity}] {f.code} :: {f.path}")
        print(f"  {f.message}")
    print()
    print(
        f"Summary: {len(report.errors)} error(s), "
        f"{len(report.warnings)} warning(s), "
        f"{len(report.findings)} finding(s)"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate QWay Academy Content Plane v2.")
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository root or any path inside it.")
    parser.add_argument("--json-report", type=Path, help="Optional JSON report output path.")
    parser.add_argument(
        "--strict-legacy-boundary",
        action="store_true",
        help="Treat legacy public usuarios/ presence as an error instead of a warning.",
    )
    parser.add_argument(
        "--fail-on-warnings",
        action="store_true",
        help="Return non-zero if warnings are present.",
    )
    args = parser.parse_args(argv)

    root = discover_repo_root(args.root)
    report = ValidationReport()

    schemas, registry = load_schema_registry(root, report)
    taxonomy = validate_taxonomy(root, report)
    validate_public_boundary(root, report, args.strict_legacy_boundary)
    validate_resource_entities(root, schemas, registry, taxonomy, report)

    print_report(root, report)

    if args.json_report:
        write_json_report(args.json_report, root, report)

    if report.errors:
        return 1
    if args.fail_on_warnings and report.warnings:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
