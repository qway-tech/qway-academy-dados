# Resources v1 → v2 Migration

Non-destructive deterministic migration of the current legacy Resources model.

## Migrates

```text
recursos/ebooks/catalogo.json
recursos/ebooks/<legacy-id>/*
    ↓
content/resources/ebooks/<semantic-slug>/

recursos/templates/catalogo.json
    ↓
content/resources/templates/<semantic-slug>/

recursos/syllabus/*.pdf
    ↓
content/resources/references/
```

## Guarantees

- never edits or deletes `recursos/`;
- refuses to overwrite an existing `content/resources/` by default;
- semantic slugs replace numeric legacy directory IDs;
- legacy IDs are retained in `legacyIds`;
- eBook files are copied into entity-local `assets/`;
- template links become generic resource links;
- syllabus is migrated as a generic Resource (`collection=references`, `type=syllabus`);
- unknown legacy fields are reported rather than silently discarded;
- runs validator + builder + builder `--check` after migration;
- writes a migration report under `.tmp/`.

## Run

```bash
python3 tooling/migrate/migrate_resources_v1_to_v2.py
```

Expected current baseline:

```text
6 ebooks
6 templates
1 CTFL syllabus reference
13 resources total
```

The actual count is computed from the repository at runtime.

## Important

Review:

```text
.tmp/resources-v1-to-v2-migration-report.json
```

before committing.

If `unmappedFields` is non-empty, decide whether each field:

- belongs in invariant `manifest.json`;
- belongs in localized content;
- belongs in taxonomy;
- is legacy-only and may intentionally be dropped.

Do not use `--force` until the first candidate has been reviewed.
