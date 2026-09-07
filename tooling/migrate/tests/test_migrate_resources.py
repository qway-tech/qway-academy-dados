from __future__ import annotations

import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
MIGRATOR = HERE.parent / "migrate_resources_v1_to_v2.py"


def load_migrator():
    spec = importlib.util.spec_from_file_location("migrate_resources", MIGRATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


mr = load_migrator()


class ResourceMigrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / ".git").mkdir()

        # Legacy ebook
        ebook_dir = self.root / "recursos/ebooks/ebook01"
        ebook_dir.mkdir(parents=True)
        (ebook_dir / "capa.png").write_bytes(b"png")
        (ebook_dir / "ebook.pdf").write_bytes(b"pdf")
        (self.root / "recursos/ebooks/catalogo.json").write_text(json.dumps({
            "ebooks": [{
                "id": "ebook01",
                "titulo": "Fundamentos de Testes",
                "autor": "QWay Academy",
                "descricao": "Descrição",
                "data_publicacao": "Junho de 2024",
                "numero_paginas": 62,
                "idioma": "Português",
                "categorias": ["Testes de Software"],
                "nivel_dificuldade": "Junior",
                "formato": "PDF",
                "sumario": [{"capitulo": "Capítulo 1", "topicos": ["A", "B"]}],
                "palavras_chave": ["QA"],
            }]
        }))

        # Legacy template
        (self.root / "recursos/templates").mkdir(parents=True)
        (self.root / "recursos/templates/catalogo.json").write_text(json.dumps({
            "templates": [{
                "id": "template01",
                "titulo": "Plano de Testes",
                "descricao": "Descrição",
                "detalhes": "Detalhes",
                "link": "https://example.com/template",
            }]
        }))

        # Legacy syllabus
        (self.root / "recursos/syllabus").mkdir(parents=True)
        (self.root / "recursos/syllabus/syllabus_ctfl_4.0br.pdf").write_bytes(b"pdf")

    def tearDown(self):
        self.tmp.cleanup()

    def report(self):
        return {
            "entities": [],
            "unmappedFields": [],
            "warnings": [],
            "counts": {},
        }

    def test_migrates_ebook_with_assets(self):
        report = self.report()
        count = mr.migrate_ebooks(self.root, report)
        self.assertEqual(1, count)
        target = self.root / "content/resources/ebooks/fundamentos-de-testes"
        manifest = json.loads((target / "manifest.json").read_text())
        locale = json.loads((target / "locales/pt.json").read_text())
        self.assertEqual("resource:ebook:fundamentos-de-testes", manifest["id"])
        self.assertEqual("2024-06", manifest["metadata"]["publicationDate"])
        self.assertEqual("junior", manifest["metadata"]["difficulty"])
        self.assertTrue((target / "assets/ebook.pdf").exists())
        self.assertEqual("Capítulo 1", locale["toc"][0]["title"])

    def test_migrates_template_with_primary_link(self):
        report = self.report()
        count = mr.migrate_templates(self.root, report)
        self.assertEqual(1, count)
        target = self.root / "content/resources/templates/plano-de-testes"
        manifest = json.loads((target / "manifest.json").read_text())
        self.assertEqual("https://example.com/template", manifest["links"][0]["url"])

    def test_migrates_ctfl_as_generic_reference_resource(self):
        report = self.report()
        count = mr.migrate_references(self.root, report)
        self.assertEqual(1, count)
        target = self.root / "content/resources/references/istqb-ctfl-4"
        manifest = json.loads((target / "manifest.json").read_text())
        self.assertEqual("resource", manifest["kind"])
        self.assertEqual("references", manifest["collection"])
        self.assertEqual("syllabus", manifest["type"])

    def test_unknown_fields_are_reported(self):
        catalog = self.root / "recursos/templates/catalogo.json"
        data = json.loads(catalog.read_text())
        data["templates"][0]["campo_novo"] = "x"
        catalog.write_text(json.dumps(data))
        report = self.report()
        mr.migrate_templates(self.root, report)
        self.assertEqual(["campo_novo"], report["unmappedFields"][0]["fields"])

    def test_slug_is_semantic_not_legacy_numeric_id(self):
        report = self.report()
        mr.migrate_templates(self.root, report)
        target = self.root / "content/resources/templates/plano-de-testes"
        self.assertTrue(target.exists())
        self.assertFalse((self.root / "content/resources/templates/template01").exists())


    def test_ebook_slug_drops_editorial_subtitle(self):
        self.assertEqual(
            "fundamentos-de-testes",
            mr.semantic_ebook_slug(
                "Fundamentos de Testes - Um Guia Completo"
            ),
        )


if __name__ == "__main__":
    unittest.main()
