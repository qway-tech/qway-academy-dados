#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
if not (ROOT / ".git").exists():
    raise SystemExit("ERRO: execute na raiz do repositório qway-academy-dados.")

OUT_JSON = ROOT / ".tmp/resources-v1-v2-reconciliation.json"
OUT_MD = ROOT / ".tmp/resources-v1-v2-reconciliation.md"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def ascii_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value).strip("-").lower()
    return re.sub(r"-+", "-", slug)


def semantic_ebook_slug(title: str) -> str:
    base = re.split(r"\s+(?:-|–|—)\s+", title, maxsplit=1)[0].strip()
    return ascii_slug(base)


def index_catalog() -> dict[str, dict[str, Any]]:
    p = ROOT / "generated/catalogs/resources.json"
    if not p.exists():
        raise SystemExit("ERRO: generated/catalogs/resources.json não existe.")
    data = read_json(p)
    items = data.get("items", [])
    return {item["id"]: item for item in items}


def add_check(checks, entity, field, ok, legacy, v2, severity="ERROR"):
    checks.append({
        "entity": entity,
        "field": field,
        "ok": bool(ok),
        "severity": severity if not ok else "OK",
        "legacy": legacy,
        "v2": v2,
    })


catalog = index_catalog()
checks = []
expected_ids = set()

# ---------- eBooks ----------
legacy_ebooks = read_json(ROOT / "recursos/ebooks/catalogo.json")["ebooks"]

for ebook in legacy_ebooks:
    legacy_id = ebook["id"]
    slug = semantic_ebook_slug(ebook["titulo"])
    cid = f"resource:ebook:{slug}"
    expected_ids.add(cid)
    item = catalog.get(cid)

    add_check(checks, cid, "entity exists", item is not None, legacy_id, cid)
    if not item:
        continue

    pt = item.get("locales", {}).get("pt", {})
    add_check(checks, cid, "title", pt.get("title") == ebook.get("titulo"), ebook.get("titulo"), pt.get("title"))
    add_check(checks, cid, "description", pt.get("description") == ebook.get("descricao"), ebook.get("descricao"), pt.get("description"))

    authors = item.get("authors", [])
    author_name = authors[0].get("name") if authors else None
    add_check(checks, cid, "author", author_name == ebook.get("autor"), ebook.get("autor"), author_name)

    metadata = item.get("metadata", {})
    add_check(checks, cid, "pageCount", metadata.get("pageCount") == ebook.get("numero_paginas"), ebook.get("numero_paginas"), metadata.get("pageCount"))
    add_check(checks, cid, "format", metadata.get("format") == ebook.get("formato"), ebook.get("formato"), metadata.get("format"))

    # Compare copied files by SHA-256.
    legacy_dir = ROOT / "recursos/ebooks" / legacy_id
    v2_dir = ROOT / item["contentPath"]
    for filename in ("capa.png", "ebook.pdf"):
        old = legacy_dir / filename
        new = v2_dir / "assets" / filename
        ok = old.exists() and new.exists() and sha256(old) == sha256(new)
        add_check(
            checks, cid, f"asset:{filename}", ok,
            sha256(old) if old.exists() else "MISSING",
            sha256(new) if new.exists() else "MISSING",
        )

# ---------- Templates ----------
legacy_templates = read_json(ROOT / "recursos/templates/catalogo.json")["templates"]

for template in legacy_templates:
    slug = ascii_slug(template["titulo"])
    cid = f"resource:template:{slug}"
    expected_ids.add(cid)
    item = catalog.get(cid)

    add_check(checks, cid, "entity exists", item is not None, template["id"], cid)
    if not item:
        continue

    pt = item.get("locales", {}).get("pt", {})
    add_check(checks, cid, "title", pt.get("title") == template.get("titulo"), template.get("titulo"), pt.get("title"))
    add_check(checks, cid, "description", pt.get("description") == template.get("descricao"), template.get("descricao"), pt.get("description"))

    legacy_details = template.get("detalhes")
    v2_details = pt.get("details")
    if legacy_details:
        add_check(checks, cid, "details", v2_details == legacy_details, legacy_details, v2_details)

    links = item.get("links", [])
    primary = next((x.get("url") for x in links if x.get("role") == "primary"), None)
    add_check(checks, cid, "primary link", primary == template.get("link"), template.get("link"), primary)

# ---------- Syllabus/reference ----------
legacy_syllabus = ROOT / "recursos/syllabus/syllabus_ctfl_4.0br.pdf"
cid = "resource:reference:istqb-ctfl-4"
expected_ids.add(cid)
item = catalog.get(cid)
add_check(checks, cid, "entity exists", item is not None, "recursos/syllabus/syllabus_ctfl_4.0br.pdf", cid)

if item:
    assets = item.get("assets", [])
    primary_path = next((x.get("path") for x in assets if x.get("role") == "primary"), None)
    v2_file = ROOT / primary_path if primary_path else None
    ok = bool(
        legacy_syllabus.exists()
        and v2_file
        and v2_file.exists()
        and sha256(legacy_syllabus) == sha256(v2_file)
    )
    add_check(
        checks, cid, "asset:syllabus",
        ok,
        sha256(legacy_syllabus) if legacy_syllabus.exists() else "MISSING",
        sha256(v2_file) if v2_file and v2_file.exists() else "MISSING",
    )

# ---------- Catalog set ----------
actual_ids = set(catalog)
add_check(
    checks,
    "__catalog__",
    "exact canonical ID set",
    actual_ids == expected_ids,
    sorted(expected_ids),
    sorted(actual_ids),
)

errors = [c for c in checks if not c["ok"] and c["severity"] == "ERROR"]
warnings = [c for c in checks if not c["ok"] and c["severity"] == "WARN"]

payload = {
    "summary": {
        "legacyEbooks": len(legacy_ebooks),
        "legacyTemplates": len(legacy_templates),
        "expectedResources": len(expected_ids),
        "generatedResources": len(catalog),
        "checks": len(checks),
        "errors": len(errors),
        "warnings": len(warnings),
    },
    "checks": checks,
}

OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

lines = [
    "# Resources v1 × v2 Reconciliation",
    "",
    f"- Legacy eBooks: **{len(legacy_ebooks)}**",
    f"- Legacy templates: **{len(legacy_templates)}**",
    f"- Expected resources: **{len(expected_ids)}**",
    f"- Generated resources: **{len(catalog)}**",
    f"- Checks: **{len(checks)}**",
    f"- Errors: **{len(errors)}**",
    f"- Warnings: **{len(warnings)}**",
    "",
    "## Checks",
    "",
    "| Status | Entity | Field |",
    "|---|---|---|",
]
for c in checks:
    status = "PASS" if c["ok"] else c["severity"]
    lines.append(f"| {status} | `{c['entity']}` | `{c['field']}` |")

if errors:
    lines += ["", "## Errors", ""]
    for c in errors:
        lines.append(f"### `{c['entity']}` — `{c['field']}`")
        lines.append("")
        lines.append(f"- v1: `{c['legacy']}`")
        lines.append(f"- v2: `{c['v2']}`")
        lines.append("")

OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

print("Resources v1 × v2 reconciliation")
print(f"  expected resources: {len(expected_ids)}")
print(f"  generated resources: {len(catalog)}")
print(f"  checks: {len(checks)}")
print(f"  errors: {len(errors)}")
print(f"  warnings: {len(warnings)}")
print(f"  report: {OUT_MD.relative_to(ROOT)}")

if errors:
    print("\nFAILED")
    raise SystemExit(1)

print("\nPASSED")
