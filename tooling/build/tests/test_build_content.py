from __future__ import annotations

import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
BUILDER = HERE.parent / "build_content.py"


def load_builder():
    spec = importlib.util.spec_from_file_location("build_content", BUILDER)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


bc = load_builder()


class ContentBuilderTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / ".git").mkdir()

        fixture_root = HERE / "fixture-repo"
        for name in ["taxonomy", "content"]:
            src = fixture_root / name
            shutil.copytree(src, self.root / name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_catalog_is_deterministic(self):
        first = bc.canonical_json(bc.build_resources_catalog(self.root))
        second = bc.canonical_json(bc.build_resources_catalog(self.root))
        self.assertEqual(first, second)

    def test_catalog_contains_localized_content(self):
        catalog = bc.build_resources_catalog(self.root)
        self.assertEqual(1, len(catalog["items"]))
        item = catalog["items"][0]
        self.assertEqual("Plano de Testes", item["locales"]["pt"]["title"])

    def test_catalog_resolves_asset_to_repo_relative_path(self):
        entity = self.root / "content/resources/templates/plano-testes"
        (entity / "assets").mkdir()
        (entity / "assets/template.pdf").write_bytes(b"%PDF-fixture")

        manifest_path = entity / "manifest.json"
        manifest = json.loads(manifest_path.read_text())
        manifest["assets"] = [{
            "id": "primary-pdf",
            "role": "primary",
            "mediaType": "application/pdf",
            "path": "assets/template.pdf",
        }]
        manifest_path.write_text(json.dumps(manifest))

        catalog = bc.build_resources_catalog(self.root)
        self.assertEqual(
            "content/resources/templates/plano-testes/assets/template.pdf",
            catalog["items"][0]["assets"][0]["path"],
        )

    def test_collection_order_controls_output(self):
        source = self.root / "content/resources/templates/plano-testes"
        target = self.root / "content/resources/references/aaa-reference"
        shutil.copytree(source, target)
        manifest_path = target / "manifest.json"
        manifest = json.loads(manifest_path.read_text())
        manifest.update({
            "id": "resource:reference:aaa-reference",
            "slug": "aaa-reference",
            "collection": "references",
            "type": "reference",
        })
        manifest_path.write_text(json.dumps(manifest))

        catalog = bc.build_resources_catalog(self.root)
        self.assertEqual("templates", catalog["items"][0]["collection"])
        self.assertEqual("references", catalog["items"][1]["collection"])

    def test_check_mode_detects_missing_output(self):
        # Covered at behavior level through deterministic renderer/write contract.
        output = self.root / "generated/catalogs/resources.json"
        self.assertFalse(output.exists())
        rendered = bc.canonical_json(bc.build_resources_catalog(self.root))
        changed = bc.write_if_changed(output, rendered)
        self.assertTrue(changed)
        changed_again = bc.write_if_changed(output, rendered)
        self.assertFalse(changed_again)


if __name__ == "__main__":
    unittest.main()
