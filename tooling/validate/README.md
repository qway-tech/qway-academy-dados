# QWay Academy — Content Plane v2 Validator

First repository-aware validator for the v2 Resources vertical slice.

## Scope

The validator checks:

- JSON Schema contracts;
- resource canonical ID uniqueness;
- semantic slug/path coherence;
- resource `collection` taxonomy membership;
- resource `type` taxonomy membership;
- `sourceLocale` membership in `availableLocales`;
- declared/actual locale file coherence;
- localized JSON schema;
- asset existence and path confinement;
- legacy ID uniqueness among migrated v2 resources;
- resource collection localization completeness;
- forbidden operational-data patterns under `content/`;
- legacy `usuarios/` as a migration warning;
- legacy quiz/exam files as assessment-classification warnings.

## Deliberate coexistence behavior

During v1/v2 coexistence, the legacy root `usuarios/` is a **warning**, not a default hard failure.

Use:

```bash
python3 tooling/validate/validate_content.py --strict-legacy-boundary
```

only when the legacy public user-data migration/removal work is ready to be enforced.

Legacy quiz/question-bank files are also warnings until each is classified as:

```text
PUBLIC SELF-CHECK
or
PROTECTED ASSESSMENT
```

## Install dependency

Prefer a virtual environment:

```bash
python3 -m venv .venv-content
source .venv-content/bin/activate
python3 -m pip install -r tooling/validate/requirements.txt
```

## Run

```bash
python3 tooling/validate/validate_content.py
```

Optional machine-readable report:

```bash
python3 tooling/validate/validate_content.py \
  --json-report .tmp/content-validation.json
```

## Exit codes

```text
0 = no errors
1 = validation errors
2 = warnings present when --fail-on-warnings is enabled
```

## CI target

Later the repository workflow can run:

```bash
python3 tooling/validate/validate_content.py --json-report validation-report.json
```

and then execute the catalog builder.

## Important

This validator understands only the v2 **Resources** manifest schema at this stage.

Learning, Practice and Community dispatch will be added when their schemas are introduced.
