# `screen.mjs` — the duplicate-screening tool. The spec it was built to.

This document was written first and the tool was built to it, so the rules are checkable
against something other than the code. The spec, the fixtures in `scripts/fixtures/`, the
test runner `scripts/screen.test.mjs` and the tool itself were all generated with AI
assistance, reviewed and run by Rohin (see README.md, "Who built this, and how"). The hard
lines the tool enforces are the site's own, from `MODERATION.md`.

Run the tests any time with:

```bash
npm run screen:test
```

The runner reports row by row what passed, what failed, and which rule to look at. If you
change a rule here, change the tool and the fixtures' `expected.json` to match — the three
are meant to agree.

---

## 1. What it is for

`MODERATION.md` lists four checks before anything is published. Three of them need a human
(watch the video, reverse-image search the photo, corroborate a detail). The fourth —
**screen against everything submitted before** — is the one that gets harder every month,
because it means comparing a new submission to every old one, approved *and* rejected, on
handle, contact, name, area and story. Done by eye against a growing spreadsheet, it is the
check most likely to slip. It is also the one a computer is good at.

So: before you spend ten minutes reviewing a submission, run it through `screen.mjs`. The
tool reads two files, applies a fixed set of rules, and prints a verdict with reasons.

- **REJECT** — breaks a hard line. Don't spend review time on it; tell the person kindly,
  point them at 211.
- **FLAG** — a human needs to look at something specific before deciding.
- **CLEAR** — nothing the rules can catch. Now do the three human checks.

It never publishes anything. `publish.mjs` still does that, and it still refuses the same
hard lines. This tool just catches them *first*, and catches the duplicates that nothing
else does.

## 2. Inputs

### 2a. The responses export — `responses.csv`

Google Forms → Responses tab → the green Sheets icon → in the sheet, **File → Download →
Comma-separated values (.csv)**. One row per submission, one column per question. The
header row is the question titles, exactly as they appear in the form:

| Column header | Needle to find it by |
|---|---|
| `Timestamp` | `Timestamp` |
| `Are you 18 or older?` | `18 or older` |
| `First name, or the name you want shown` | `First name` |
| `Your city or area` | `city or area` |
| `What kind of thing is this?` | `kind of thing` |
| `In one line, what do you need?` | `In one line` |
| `Exactly how much? (between $5 and $100)` | `Exactly how much` |
| `What is going on, and why this amount?` | `What is going on` |
| `What exactly will the money buy?` | `money buy` |
| `Name one thing we can check` | `we can check` |
| `Your ten-second video` | `video` (the file-upload column; a Drive link) |
| `May we publish your video on the site?` | `May we publish` |
| `How should someone send it to you?` | `How should someone send` |
| `Your handle` | `Your handle` |
| `An email or phone we can reach you at` | `reach you at` |
| `Tick all four to confirm you understand` | `Tick all four` |

Find columns by **needle** (case-insensitive substring of the header), not by position or
exact title. `fix-form.gs` does the same, for the same reason: if a question gets reworded
in the form editor, nothing breaks.

Two things about this file that matter for parsing:

- Any cell containing a comma, a double quote, or a line break is wrapped in double quotes,
  and a double quote inside such a cell is doubled (`""`). Paragraph answers routinely
  contain all three. **Splitting on commas will not work.** Row 11 of the fixture exists to
  prove it.
- When someone answers **No** to "Are you 18 or older?", the form jumps to a closing section
  and ends, so every other cell in that row is empty. Row 3 of the fixture is one of these.

### 2b. The private log — `log.csv`

`MODERATION.md` Part 3 says to keep a private sheet of every submission, approved and
rejected. This is that sheet, exported the same way. Fixed columns, in this order:

```
date,name,area,handle,contact,decision,reason,story
```

`decision` is `approved` or `rejected`. `reason` is free text (blank for approvals). `story`
is the "What is going on" answer, pasted in. This file never goes in the repo —
`scripts/private/` is git-ignored for exactly this, so keep both CSVs there.

## 3. Command line

```bash
node scripts/screen.mjs <responses.csv> <log.csv>            # readable report, every row
node scripts/screen.mjs <responses.csv> <log.csv> --row 7    # one row
node scripts/screen.mjs <responses.csv> <log.csv> --json     # machine-readable (the tests use this)
```

- **Row numbers are spreadsheet row numbers**: the header is row 1, the first response is
  row 2. That way a row in the tool's output is the row you click on in Sheets.
- Exit code `0` when it ran, whatever the verdicts were. Exit code `2` for a usage problem:
  missing arguments, a file that can't be read, a flag it doesn't know.
- No dependencies. `node:fs` and `node:path` are all you need. `publish.mjs` and
  `scramble.mjs` work the same way.

### `--json` output

An array, one object per response row, in file order:

```json
[
  {
    "row": 4,
    "name": "Dana",
    "verdict": "REJECT",
    "codes": ["H2"],
    "reasons": ["amount $150 is outside the $5–$100 range"]
  }
]
```

- `codes` — every rule that fired, from the tables below. Order doesn't matter; the test
  compares them as a set. An empty array means CLEAR.
- `reasons` — one plain-English sentence per code, in the same order. These are for you at
  11pm, so make them specific: say *which* handle matched *which* date, not "duplicate".
- `verdict` — `REJECT` if any `H` code fired, otherwise `FLAG` if any `F` code fired,
  otherwise `CLEAR`. **Evaluate every rule for every row** — don't stop at the first hit. A
  rejected person still deserves the complete list of what was wrong. The one exception is
  H1: when someone answered No to 18+, the form ended right there, so report `H1` and `H5`
  and skip the rest — every other cell is blank by design, and "amount is blank" or "no
  boxes ticked" would just be noise about a form they never saw.

## 4. The rules

### Normalisation (do this first, use it everywhere)

| Field | Normalise by |
|---|---|
| handle | trim; lowercase; drop a leading `$` or `@`; if it contains `paypal.me/`, keep only what follows it; drop any trailing `/` |
| contact | trim; lowercase. If it has 10 or more digits in it, it's a phone: keep digits only and take the **last 10**. Otherwise it's an email: keep as is. |
| name, area | trim; lowercase; collapse runs of whitespace to one space |
| story | see F3 |

`" @Test-Casey "` and `"@test-casey"` must come out identical. `"720-555-0111"`,
`"(720) 555-0111"` and `"7205550111"` must come out identical. `"RILEY.TEST@example.com"`
and `"riley.test@example.com"` must come out identical.

### Hard lines → REJECT

| Code | Rule | Where it comes from |
|---|---|---|
| **H1** | "Are you 18 or older?" is not exactly `Yes`. When this fires, also run H5, then stop — the form ended at this question. | `MODERATION.md` Part 8, line 1 |
| **H2** | The amount, after stripping everything but digits and `.`, is not a number between **5 and 100** inclusive | `types.ts` MIN/MAX_ASK_USD |
| **H3** | The word `zelle` (case-insensitive) appears in the handle, the payment-method answer, the story, or "what the money will buy" | no-Zelle rule |
| **H4** | An SSN-shaped pattern — three digits, two digits, four digits, with optional hyphens between (`\b\d{3}-?\d{2}-?\d{4}\b`) — appears in the story or "what the money will buy" | `publish.mjs` has the same regex |
| **H5** | Any of these seven is blank after trimming: name, area, one-line title, amount, story, handle, contact | the fields a listing cannot exist without |
| **H6** | Normalised handle equals the normalised handle of a log row whose decision is `rejected` | the duplicate screen |
| **H7** | Normalised contact equals the normalised contact of a log row whose decision is `rejected` | the duplicate screen |

### Needs a look → FLAG

| Code | Rule |
|---|---|
| **F1** | Normalised handle equals the handle of an **approved** log row. Not automatically bad — maybe their first request was met and this is a second, honest one — but a person should decide, and the rule is one open request at a time. |
| **F2** | Normalised contact equals the contact of an **approved** log row. Same reasoning as F1. |
| **F3** | The story is a near-copy of any log story (approved or rejected). Similarity ≥ **0.6** by the method below. |
| **F4** | Normalised name **and** normalised area both equal those of a log row (any decision). |
| **F5** | The name has more than one word after trimming. First names only — this one is fixable, so it's a flag, not a reject. |
| **F6** | A street-address pattern appears in the story, the area, or "what the money will buy": a 1–5 digit number, a space, a word, a space, then one of `st street ave avenue rd road dr drive ln lane blvd way ct court` (case-insensitive, whole words). `publish.mjs` has this regex too. Fixable by editing, so: flag. |
| **F7** | "Name one thing we can check" is blank or **shorter than 4 characters** after trimming. (`n/a` is 3.) |
| **F8** | Fewer than all four acknowledgement statements are present in the "Tick all four" cell. |

**On F8:** the cell holds the ticked statements joined with `, ` — but the statements
themselves contain commas, so splitting on commas is wrong. Instead, the tool keeps the four
exact statements (copied from `scripts/create-forms.gs`, lines 128–133) and counts how many
of the four appear in the cell as substrings.

**On F3, story similarity.** Keep it simple and deterministic:

1. Lowercase the story. Split on anything that is not a letter or digit.
2. Keep tokens of **3 or more characters**.
3. Drop these stop words: `the and for that this with have from are was were you your
   not but can get got one two`.
4. Make a **Set** of what's left.
5. Jaccard similarity = (size of the intersection) ÷ (size of the union).

Flag when it's ≥ 0.6 against any log story. The fixture is built so that the one near-copy
scores well above 0.6 and every other pair scores well below it — the threshold needs no
tuning, and if a different story ever fires F3 the bug is in the tokeniser.

## 5. How it is built, in levels

The implementation follows this order. It is also the order to debug in when a test fails:
each level has its own rows in the fixture, so a failure points at one thing.

**Level 1 — read the files.** Write `parseCsv(text) → string[][]`. One pass over the text,
one character at a time, with two pieces of state: *am I inside quotes?* and *the cell I'm
building*. The rules: a `"` when not in quotes starts a quoted cell; inside quotes, `""`
is a literal quote and a single `"` ends the quoted part; a `,` outside quotes ends the
cell; a line break outside quotes ends the row; everything else is appended to the cell.
Handle both `\r\n` and `\n`. About 30 lines. Test it by printing how many rows and columns
the fixture has: you should get 12 response rows and 16 columns, and row 11's story should
contain line breaks.

Then turn `string[][]` into objects: `header` = first row, each later row becomes
`{ row: <index+2>, cells: { [header]: value } }`. Write `col(record, needle)` that returns
the value of the first header containing the needle, case-insensitively, or `""`.

**Level 2 — the hard lines.** H1 through H5 need only the row itself. Add them, run the
tests: rows 3, 4, 5, 13 should pass; 2 and 11 should already be CLEAR.

**Level 3 — the log.** Parse `log.csv` into objects with the fixed columns. Write the
normalisers. Add H6, H7, F1, F2, F4. Rows 6, 7, 12 should pass.

**Level 4 — the soft checks.** F5, F6, F7, F8. Rows 9 and 10.

**Level 5 — similarity.** F3. Row 8. All twelve rows pass.

**Level 6 — the report and `--row`.** Print something you'd actually want to read: one block
per row, verdict in caps, name, amount, title, then the reasons indented. `--row N` filters to
one row. `--json` prints the array and nothing else — `JSON.parse(stdout)` in the test must
succeed, so no banner lines in JSON mode.

**Stretch — `--emit N`.** Write `new-request.json` in the shape `publish.mjs --template`
produces, filled from row N: `category` from the first word of the "kind of thing" answer
(`Food→food`, `Getting there→transport`, `Health→medical`, `Staying housed→housing`,
`Work→work`, `School→school`, `Family→family`, anything else→`other`), `contactMethod` from
the payment answer (`Cash App→cashapp`, `PayPal→paypal`, `Venmo→venmo`), the five review
booleans left `false` because you haven't done the review yet. Refuse (exit 1) if the row's
verdict is REJECT. The test runner checks this only if the flag exists; until then it says
"skipped".

## 6. Things worth knowing when reading or changing it

- `Number("88")` is 88. `Number("$88")` is `NaN`. `Number("")` is `0`, which would pass H2 —
  so check for blank first (that's H5's job) and use `Number.isFinite`.
- Regular expressions with the `i` flag are case-insensitive; `\b` is a word boundary.
- A `Set` gives you cheap intersection: `[...a].filter((t) => b.has(t)).length`.
- `process.argv.slice(2)` is the arguments; `process.exit(2)` for usage errors;
  `console.error` for messages that must not pollute `--json` output on stdout.
- Read `scripts/publish.mjs` for the house style: a `die()` helper, small named functions,
  comments that say *why*. Same voice, your hands.

## 7. What "done" looks like

- `npm run screen:test` prints 12 passes.
- `node scripts/screen.mjs scripts/fixtures/responses.sample.csv scripts/fixtures/log.sample.csv`
  prints a report you'd be happy to read on your phone.
- Every rule in §4 has a row in the fixture that would fail if the rule were removed.
