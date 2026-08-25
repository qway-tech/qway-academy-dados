# QWay Academy — Content Plane v2 Catalog Builder

Deterministic catalog builder for the Resources vertical slice.

## Design

Canonical authoring source:

```text
content/resources/**/manifest.json
content/resources/**/locales/*
taxonomy/*
```

Generated read model:

```text
generated/catalogs/resources.json
```

The generated catalog is self-contained for the client. It denormalizes:

- canonical ID;
- slug;
- collection;
- resource type;
- publication status;
- locale availability;
- repository content path;
- tags/authors/metadata when present;
- resolved repository-relative asset paths;
- external links;
- localized resource payloads.

## Determinism

The generated catalog deliberately contains **no wall-clock `generatedAt` field**.

Including the current time would make:

```text
content:build
git diff --exit-code generated/
```

dirty on every build.

The catalog instead contains a stable `generatorVersion`.

## Run

```bash
python3 tooling/build/build_content.py
```

The builder runs the validator first and aborts on validation errors.

## Check mode

```bash
python3 tooling/build/build_content.py --check
```

`--check` does not write. It exits non-zero when the generated catalog on disk differs from the canonical build.

This is the intended CI mode after generated catalogs are committed.

## Tests

```bash
python3 -m unittest discover \
  -s tooling/build/tests \
  -p 'test_*.py'
```

## Current scope

Only Resources is implemented.

Future domain builders can be added behind the same command:

```text
learning
practice
community
search
```
