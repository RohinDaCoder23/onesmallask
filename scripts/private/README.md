# scripts/private — never committed

Everything in this folder except this README is git-ignored (see `.gitignore`). It holds
the two files the screening tool reads, both of which contain real people's contact details:

- `responses.csv` — the Google Forms responses export for the "ask for help" form
  (Responses → Sheets icon → File → Download → CSV).
- `log.csv` — your private log of every submission, approved and rejected, with the columns
  `date,name,area,handle,contact,decision,reason,story`. `MODERATION.md` Part 3 explains why
  this log exists; `scripts/SCREEN-SPEC.md` §2b defines the columns.

Run the screen with:

```bash
node scripts/screen.mjs scripts/private/responses.csv scripts/private/log.csv
```

If `git status` ever shows a file from this folder, stop and check `.gitignore` before you
commit anything.
