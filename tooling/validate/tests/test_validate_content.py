from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
VALIDATOR = HERE.parent / "validate_content.py"


def load_validator():
    spec = importlib.util.spec_from_file_location("validate_content", VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    import sys
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


vc = load_validator()


class ContentValidatorTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / ".git").mkdir()

        fixture_root = HERE / "fixture-repo"
        for name in ["schemas", "taxonomy", "content"]:
            src = fixture_root / name
            if src.exists():
                shutil.copytree(src, self.root / name)

    def tearDown(self):
        self.tmp.cleanup()

    def validate(self):
        report = vc.ValidationReport()
        schemas, registry = vc.load_schema_registry(self.root, report)
        taxonomy = vc.validate_taxonomy(self.root, report)
        vc.validate_public_boundary(self.root, report, strict_legacy=False)
        vc.validate_resource_entities(self.root, schemas, registry, taxonomy, report)
        return report

    def test_valid_resource_passes(self):
        report = self.validate()
        self.assertEqual([], report.errors)

    def test_source_locale_must_be_available(self):
        manifest = next((self.root / "content/resources").glob("*/*/manifest.json"))
        data = json.loads(manifest.read_text())
        data["availableLocales"] = ["en"]
        manifest.write_text(json.dumps(data))
        report = self.validate()
        self.assertTrue(any(x.code == "SOURCE_LOCALE_NOT_AVAILABLE" for x in report.errors))

    def test_unknown_resource_type_fails(self):
        manifest = next((self.root / "content/resources").glob("*/*/manifest.json"))
        data = json.loads(manifest.read_text())
        data["type"] = "unknown-type"
        manifest.write_text(json.dumps(data))
        report = self.validate()
        self.assertTrue(any(x.code == "RESOURCE_TYPE_UNKNOWN" for x in report.errors))

    def test_missing_asset_fails(self):
        manifest = next((self.root / "content/resources").glob("*/*/manifest.json"))
        data = json.loads(manifest.read_text())
        data["assets"] = [{
            "id": "missing",
            "role": "attachment",
            "mediaType": "application/pdf",
            "path": "assets/missing.pdf",
        }]
        manifest.write_text(json.dumps(data))
        report = self.validate()
        self.assertTrue(any(x.code == "ASSET_MISSING" for x in report.errors))

    def test_operational_data_under_content_fails(self):
        bad = self.root / "content/resources/usuarios/respostas_01.json"
        bad.parent.mkdir(parents=True, exist_ok=True)
        bad.write_text("{}")
        report = self.validate()
        self.assertTrue(any(x.code == "PUBLIC_BOUNDARY_VIOLATION" for x in report.errors))


if __name__ == "__main__":
    unittest.main()
