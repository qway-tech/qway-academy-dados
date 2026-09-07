#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any


PT_MONTHS = {
    "janeiro": 1, "fevereiro": 2, "marco": 3, "março": 3, "abril": 4,
    "maio": 5, "junho": 6, "julho": 7, "agosto": 8, "setembro": 9,
    "outubro": 10, "novembro": 11, "dezembro": 12,
}

KNOWN_EBOOK_KEYS = {
    "id", "titulo", "autor", "descricao", "data_publicacao", "numero_paginas",
    "idioma", "categorias", "nivel_dificuldade", "formato", "sumario",
    "palavras_chave",
}

KNOWN_TEMPLATE_KEYS = {
    "id", "titulo", "descricao", "detalhes", "link",
}


def discover_repo_root(start: Path) -> Path:
    start = start.resolve()
    try:
        result = subprocess.run(
            ["git", "-C", str(start), "rev-parse", "--show-toplevel"],
            check=True, capture_output=True, text=True,
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


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def ascii_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value).strip("-").lower()
    slug = re.sub(r"-+", "-", slug)
    if not slug:
        raise ValueError(f"Cannot derive slug from {value!r}")
    return slug


def semantic_ebook_slug(title: str) -> str:
    # Preserve a concise canonical identity.
    # Example:
    # "Agile Testing - Um Guia Prático..." -> "agile-testing"
    base = re.split(
        r"\\s+(?:-|–|—)\\s+",
        title,
        maxsplit=1,
    )[0].strip()

    return ascii_slug(base)


def normalize_tag(value: str) -> str:
    return ascii_slug(value)


def unique_tags(*groups: Any) -> list[str]:
    values: list[str] = []
    for group in groups:
        if isinstance(group, str):
            group = [group]
        if not isinstance(group, list):
            continue
        for value in group:
            if isinstance(value, str) and value.strip():
                tag = normalize_tag(value)
                if tag not in values:
                    values.append(tag)
    return sorted(values)


def parse_publication_date(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    raw = value.strip().lower()

    m = re.fullmatch(r"(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?", raw)
    if m:
        return f"{m.group(1)}-{m.group(2)}"

    m = re.search(r"([a-zçãáéíóú]+)\s+de\s+(\d{4})", raw)
    if m:
        month = PT_MONTHS.get(m.group(1))
        if month:
            return f"{m.group(2)}-{month:02d}"

    m = re.search(r"\b(0?[1-9]|1[0-2])[/\-](\d{4})\b", raw)
    if m:
        return f"{m.group(2)}-{int(m.group(1)):02d}"

    m = re.search(r"\b(\d{4})\b", raw)
    if m:
        return m.group(1)

    return None


def normalize_difficulty(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    token = ascii_slug(value)
    mapping = {
        "iniciante": "beginner",
        "beginner": "beginner",
        "junior": "junior",
        "jr": "junior",
        "pleno": "intermediate",
        "intermediario": "intermediate",
        "intermediate": "intermediate",
        "senior": "advanced",
        "avancado": "advanced",
        "advanced": "advanced",
        "todos": "all-levels",
        "todos-os-niveis": "all-levels",
        "all-levels": "all-levels",
    }
    return mapping.get(token)


def localized_toc(sumario: Any) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    if not isinstance(sumario, list):
        return result
    for item in sumario:
        if not isinstance(item, dict):
            continue
        title = item.get("capitulo") or item.get("titulo")
        if not isinstance(title, str) or not title.strip():
            continue
        topics = item.get("topicos", [])
        if not isinstance(topics, list):
            topics = []
        result.append({
            "title": title.strip(),
            "items": [x.strip() for x in topics if isinstance(x, str) and x.strip()],
        })
    return result


def migrate_asset_dir(
    source_dir: Path,
    target_dir: Path,
    *,
    ebook: bool = False,
) -> list[dict[str, Any]]:
    assets: list[dict[str, Any]] = []
    if not source_dir.exists():
        return assets

    target_assets = target_dir / "assets"
    for source in sorted(source_dir.iterdir()):
        if not source.is_file() or source.name.startswith("."):
            continue
        target_assets.mkdir(parents=True, exist_ok=True)
        target = target_assets / source.name
        shutil.copy2(source, target)

        suffix = source.suffix.lower()
        if source.name.lower() in {"capa.png", "cover.png", "cover.jpg", "cover.jpeg"}:
            role = "cover"
            asset_id = "cover"
        elif ebook and suffix == ".pdf":
            role = "primary"
            asset_id = "primary-pdf"
        else:
            role = "attachment"
            asset_id = ascii_slug(source.stem)

        media = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }.get(suffix)

        item: dict[str, Any] = {
            "id": asset_id,
            "role": role,
            "path": f"assets/{source.name}",
        }
        if media:
            item["mediaType"] = media
        assets.append(item)

    return assets


def assert_target_free(target: Path, force: bool) -> None:
    if target.exists():
        if not force:
            raise SystemExit(
                f"Target already exists: {target}. "
                "Migration is non-destructive; remove the v2 candidate or pass --force explicitly."
            )
        shutil.rmtree(target)


def migrate_ebooks(root: Path, report: dict[str, Any]) -> int:
    legacy_catalog = root / "recursos/ebooks/catalogo.json"
    doc = read_json(legacy_catalog)
    items = doc.get("ebooks", []) if isinstance(doc, dict) else []
    if not isinstance(items, list):
        raise SystemExit("Legacy ebooks catalog does not contain an 'ebooks' array.")

    count = 0
    seen_slugs: set[str] = set()

    for item in items:
        if not isinstance(item, dict):
            continue

        legacy_id = str(item.get("id", "")).strip()
        title = str(item.get("titulo", "")).strip()
        if not legacy_id or not title:
            raise SystemExit(f"Legacy ebook is missing id/title: {item!r}")

        slug = semantic_ebook_slug(title)
        if slug in seen_slugs:
            raise SystemExit(f"Duplicate derived ebook slug: {slug}")
        seen_slugs.add(slug)

        target = root / "content/resources/ebooks" / slug
        target.mkdir(parents=True, exist_ok=True)

        legacy_dir = root / "recursos/ebooks" / legacy_id
        assets = migrate_asset_dir(legacy_dir, target, ebook=True)

        metadata: dict[str, Any] = {}
        fmt = item.get("formato")
        if isinstance(fmt, str) and fmt.strip():
            metadata["format"] = fmt.strip()

        pages = item.get("numero_paginas")
        if isinstance(pages, int) and pages > 0:
            metadata["pageCount"] = pages

        difficulty = normalize_difficulty(item.get("nivel_dificuldade"))
        if difficulty:
            metadata["difficulty"] = difficulty
        elif item.get("nivel_dificuldade"):
            report["warnings"].append({
                "code": "UNMAPPED_DIFFICULTY",
                "legacyId": legacy_id,
                "value": item.get("nivel_dificuldade"),
            })

        publication = parse_publication_date(item.get("data_publicacao"))
        if publication:
            metadata["publicationDate"] = publication
        elif item.get("data_publicacao"):
            report["warnings"].append({
                "code": "UNMAPPED_PUBLICATION_DATE",
                "legacyId": legacy_id,
                "value": item.get("data_publicacao"),
            })

        author = item.get("autor")
        authors = [{"name": author.strip()}] if isinstance(author, str) and author.strip() else []

        manifest: dict[str, Any] = {
            "schemaVersion": "2.0",
            "id": f"resource:ebook:{slug}",
            "kind": "resource",
            "type": "ebook",
            "collection": "ebooks",
            "slug": slug,
            "status": "published",
            "sourceLocale": "pt",
            "availableLocales": ["pt"],
            "legacyIds": [legacy_id],
            "assets": assets,
            "links": [],
        }
        tags = unique_tags(item.get("categorias"), item.get("palavras_chave"))
        if tags:
            manifest["tags"] = tags
        if authors:
            manifest["authors"] = authors
        if metadata:
            manifest["metadata"] = metadata

        locale: dict[str, Any] = {
            "title": title,
            "description": str(item.get("descricao", "")).strip() or title,
        }
        toc = localized_toc(item.get("sumario"))
        if toc:
            locale["toc"] = toc

        unknown = sorted(set(item) - KNOWN_EBOOK_KEYS)
        if unknown:
            report["unmappedFields"].append({
                "kind": "ebook",
                "legacyId": legacy_id,
                "fields": unknown,
            })

        write_json(target / "manifest.json", manifest)
        write_json(target / "locales/pt.json", locale)

        report["entities"].append({
            "legacy": f"recursos/ebooks/{legacy_id}",
            "canonicalId": manifest["id"],
            "target": target.relative_to(root).as_posix(),
        })
        count += 1

    return count


def migrate_templates(root: Path, report: dict[str, Any]) -> int:
    legacy_catalog = root / "recursos/templates/catalogo.json"
    doc = read_json(legacy_catalog)
    items = doc.get("templates", []) if isinstance(doc, dict) else []
    if not isinstance(items, list):
        raise SystemExit("Legacy templates catalog does not contain a 'templates' array.")

    count = 0
    seen_slugs: set[str] = set()

    for item in items:
        if not isinstance(item, dict):
            continue
        legacy_id = str(item.get("id", "")).strip()
        title = str(item.get("titulo", "")).strip()
        if not legacy_id or not title:
            raise SystemExit(f"Legacy template is missing id/title: {item!r}")

        slug = ascii_slug(title)
        if slug in seen_slugs:
            raise SystemExit(f"Duplicate derived template slug: {slug}")
        seen_slugs.add(slug)

        target = root / "content/resources/templates" / slug
        target.mkdir(parents=True, exist_ok=True)

        link = item.get("link")
        links = []
        if isinstance(link, str) and link.strip():
            links.append({
                "id": "primary",
                "role": "primary",
                "url": link.strip(),
            })

        manifest = {
            "schemaVersion": "2.0",
            "id": f"resource:template:{slug}",
            "kind": "resource",
            "type": "template",
            "collection": "templates",
            "slug": slug,
            "status": "published",
            "sourceLocale": "pt",
            "availableLocales": ["pt"],
            "legacyIds": [legacy_id],
            "assets": [],
            "links": links,
        }

        locale = {
            "title": title,
            "description": str(item.get("descricao", "")).strip() or title,
        }
        details = item.get("detalhes")
        if isinstance(details, str) and details.strip():
            locale["details"] = details.strip()

        unknown = sorted(set(item) - KNOWN_TEMPLATE_KEYS)
        if unknown:
            report["unmappedFields"].append({
                "kind": "template",
                "legacyId": legacy_id,
                "fields": unknown,
            })

        write_json(target / "manifest.json", manifest)
        write_json(target / "locales/pt.json", locale)

        report["entities"].append({
            "legacy": f"recursos/templates/{legacy_id}",
            "canonicalId": manifest["id"],
            "target": target.relative_to(root).as_posix(),
        })
        count += 1

    return count


def migrate_references(root: Path, report: dict[str, Any]) -> int:
    legacy_dir = root / "recursos/syllabus"
    if not legacy_dir.exists():
        return 0

    pdfs = sorted(legacy_dir.glob("*.pdf"))
    count = 0
    for pdf in pdfs:
        lower = pdf.name.lower()

        if "ctfl" in lower and "4.0" in lower:
            slug = "istqb-ctfl-4"
            canonical_id = "resource:reference:istqb-ctfl-4"
            title = "ISTQB CTFL 4.0 — Syllabus"
            description = "Syllabus CTFL 4.0 em português (Brasil)."
            rtype = "syllabus"
            tags = ["ctfl", "istqb", "software-testing"]
        else:
            slug = ascii_slug(pdf.stem)
            canonical_id = f"resource:reference:{slug}"
            title = pdf.stem.replace("_", " ").replace("-", " ").strip()
            description = title
            rtype = "reference"
            tags = []

        target = root / "content/resources/references" / slug
        target.mkdir(parents=True, exist_ok=True)
        (target / "assets").mkdir(parents=True, exist_ok=True)
        shutil.copy2(pdf, target / "assets" / pdf.name)

        manifest: dict[str, Any] = {
            "schemaVersion": "2.0",
            "id": canonical_id,
            "kind": "resource",
            "type": rtype,
            "collection": "references",
            "slug": slug,
            "status": "published",
            "sourceLocale": "pt",
            "availableLocales": ["pt"],
            "legacyIds": [f"recursos/syllabus/{pdf.name}"],
            "assets": [{
                "id": "primary-pdf",
                "role": "primary",
                "mediaType": "application/pdf",
                "path": f"assets/{pdf.name}",
            }],
            "links": [],
        }
        if tags:
            manifest["tags"] = tags

        write_json(target / "manifest.json", manifest)
        write_json(target / "locales/pt.json", {
            "title": title,
            "description": description,
        })

        report["entities"].append({
            "legacy": f"recursos/syllabus/{pdf.name}",
            "canonicalId": canonical_id,
            "target": target.relative_to(root).as_posix(),
        })
        count += 1

    return count


def run_command(root: Path, *args: str) -> None:
    result = subprocess.run([sys.executable, *args], cwd=root)
    if result.returncode != 0:
        raise SystemExit(
            f"Command failed ({result.returncode}): python3 {' '.join(args)}"
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Non-destructively migrate legacy QWay Resources to Content Plane v2."
    )
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace an existing content/resources candidate tree.",
    )
    parser.add_argument(
        "--skip-verify",
        action="store_true",
        help="Do not run validator and catalog builder after migration.",
    )
    args = parser.parse_args(argv)

    root = discover_repo_root(args.root)
    target_root = root / "content/resources"
    assert_target_free(target_root, args.force)

    required = [
        root / "recursos/ebooks/catalogo.json",
        root / "recursos/templates/catalogo.json",
        root / "taxonomy/resource-collections.json",
        root / "taxonomy/resource-types.json",
    ]
    missing = [p for p in required if not p.exists()]
    if missing:
        raise SystemExit(
            "Required migration input missing:\n" +
            "\n".join(f"  - {p.relative_to(root)}" for p in missing)
        )

    report: dict[str, Any] = {
        "schemaVersion": "2.0",
        "mode": "non-destructive-v1-to-v2",
        "entities": [],
        "unmappedFields": [],
        "warnings": [],
        "counts": {},
    }

    try:
        report["counts"]["ebooks"] = migrate_ebooks(root, report)
        report["counts"]["templates"] = migrate_templates(root, report)
        report["counts"]["references"] = migrate_references(root, report)
        report["counts"]["total"] = sum(report["counts"].values())

        report_path = root / ".tmp/resources-v1-to-v2-migration-report.json"
        write_json(report_path, report)

        if not args.skip_verify:
            run_command(root, "tooling/validate/validate_content.py")
            run_command(root, "tooling/build/build_content.py")
            run_command(root, "tooling/build/build_content.py", "--check")

        print()
        print("Resources migration candidate created.")
        print(f"  ebooks:     {report['counts']['ebooks']}")
        print(f"  templates:  {report['counts']['templates']}")
        print(f"  references: {report['counts']['references']}")
        print(f"  total:      {report['counts']['total']}")
        print(f"  report:     {report_path.relative_to(root)}")
        print()
        if report["unmappedFields"]:
            print(
                f"REVIEW REQUIRED: {len(report['unmappedFields'])} legacy item(s) "
                "contain unmapped fields. See migration report."
            )
        else:
            print("No unmapped legacy fields detected.")
        return 0

    except (Exception, SystemExit):
        # Keep migration non-destructive and atomic from the perspective
        # of the v2 candidate, including verification failures.
        if target_root.exists():
            shutil.rmtree(target_root)
        raise


if __name__ == "__main__":
    raise SystemExit(main())
