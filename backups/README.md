# Backups

Local Firestore snapshots live here. **Everything in this folder except this README is gitignored** — the files contain personal data (meals, weights, notes) and must never be committed or pushed.

## Creating a backup

```bash
node scripts/backup-firestore.mjs
```

Writes `backups/gtrak-backup-<timestamp>.json`. The script is read-only — it contains no write, update or delete call, so it cannot damage the database.

Pass `--out <path>` to choose a different filename.

> Note: this script signs in anonymously. Anonymous sign-in is disabled on the
> project and the security rules now block the legacy collections, so it will
> not work as-is anymore. In-app **Settings → Export** is the current backup
> path, and it covers every collection the signed-in user owns, including
> `foods`. To restore script-based backups, the script needs to sign in as a
> real user instead.

## File shape

```json
{
  "backedUpAt": "ISO timestamp",
  "projectId": "gs-gtrak",
  "legacy": { "foods": [ ... ], "meals": [ ... ] },
  "perUser": { "<uid>": { "foods": [ ... ], "meals": [ ... ] } }
}
```

Each document is `{ "_docId": "<real Firestore id>", ...fields }`. `_docId` is authoritative — a document's own `id` field is not always identical to it, so never use the `id` field as the write target when restoring.

## Keep a copy elsewhere

A backup sitting in the same folder as the project is not really a backup. Copy these somewhere off this machine.
