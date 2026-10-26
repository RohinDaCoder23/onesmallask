#!/usr/bin/env node
/**
 * Screen new submissions before a person spends review time on them.
 *
 *   node scripts/screen.mjs <responses.csv> <log.csv>            readable report, every row
 *   node scripts/screen.mjs <responses.csv> <log.csv> --row 7    one row
 *   node scripts/screen.mjs <responses.csv> <log.csv> --json     machine-readable (the tests use this)
 *   node scripts/screen.mjs <responses.csv> <log.csv> --emit 7   write new-request.json for publish.mjs
 *
 * <responses.csv> is the Google Forms responses export for the "ask for help"
 * form (Responses tab → Sheets icon → File → Download → CSV). <log.csv> is the
 * private log of every prior submission, approved AND rejected, with the columns
 * date,name,area,handle,contact,decision,reason,story. Both hold real people's
 * contact details, so both live in scripts/private/, which is git-ignored.
 *
 * MODERATION.md lists four checks before anything is published. Three need a
 * human: watch the video, reverse-image search the photo, corroborate a detail.
 * The fourth — screen against everything submitted before — gets harder every
 * month and is the one a computer is good at. That is this file. Three verdicts:
 *
 *   REJECT  breaks a hard line. Don't spend review time on it; tell the person
 *           kindly and point them at 211.
 *   FLAG    a person needs to look at something specific before deciding.
 *   CLEAR   nothing the rules can catch. Now do the three human checks.
 *
 * It never publishes anything. publish.mjs still does that, and still refuses
 * the same hard lines — this just catches them first, and catches the duplicates
 * that nothing else does. The rules are written down in scripts/SCREEN-SPEC.md
 * and tested by scripts/screen.test.mjs against scripts/fixtures/.
 *
 * Built with AI assistance; see README.md, "Who built this, and how". The lines
 * it enforces are the site's own hard lines from MODERATION.md.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIN_USD = 5;
const MAX_USD = 100;

/** Story similarity at or above this is a FLAG (F3). See SCREEN-SPEC.md §4. */
const SIMILARITY_THRESHOLD = 0.6;

/**
 * The four acknowledgement statements, exactly as scripts/create-forms.gs builds
 * them. The response cell joins the ticked ones with ", " — but the statements
 * contain commas themselves, so the only safe way to count them is to look for
 * each full statement as a substring.
 */
const ACKNOWLEDGEMENTS = [
  "One Small Ask never handles the money — it goes straight from that person to me",
  "I will never send money back to anyone who says they overpaid",
  "I will never share a bank login, card number, security code or my Social Security number",
  "Everything here is true, and I am posting this for myself",
];

// Same patterns publish.mjs refuses, so the two tools cannot disagree.
const STREET_ADDRESS =
  /\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|way|ct|court)\b/i;
const SSN = /\b\d{3}-?\d{2}-?\d{4}\b/;

const STOP_WORDS = new Set(
  "the and for that this with have from are was were you your not but can get got one two".split(" "),
);

/* ---------------------------------------------------------------- CSV parsing */

/**
 * A small RFC-4180 parser. Google Forms wraps any cell that contains a comma, a
 * double quote or a line break in double quotes, and doubles quotes inside such
 * a cell — and paragraph answers routinely contain all three, so splitting on
 * commas is not an option. One pass, one character at a time, two bits of state.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"'; // an escaped quote
          i++;
        } else {
          inQuotes = false; // end of the quoted part
        }
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++; // Windows line ending
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop rows that are entirely empty (a trailing newline, a blank line).
  return rows.filter((r) => r.some((v) => v !== ""));
}

/**
 * Turns the parsed rows into records keyed by header. `row` is the spreadsheet
 * row number — the header is row 1, the first response is row 2 — so a row in
 * this tool's output is the row you click on in Sheets.
 */
function toRecords(text) {
  const [header = [], ...body] = parseCsv(text);
  return body.map((cells, i) => {
    const record = {};
    header.forEach((h, j) => {
      record[h] = cells[j] ?? "";
    });
    return { row: i + 2, cells: record };
  });
}

/**
 * Finds a column by a case-insensitive substring of its header, not by position
 * or exact title. fix-form.gs does the same, for the same reason: if a question
 * gets reworded in the form editor, nothing here breaks.
 */
function col(record, needle) {
  const want = needle.toLowerCase();
  const key = Object.keys(record.cells).find((h) => h.toLowerCase().includes(want));
  return key ? String(record.cells[key] ?? "") : "";
}

/* ------------------------------------------------------------- normalisation */

/** "$SamsBoots ", "@sams-boots", "paypal.me/SamsBoots/" → comparable forms. */
export function normaliseHandle(handle) {
  let h = handle.trim().toLowerCase();
  const at = h.indexOf("paypal.me/");
  if (at !== -1) h = h.slice(at + "paypal.me/".length);
  return h.replace(/^[$@]/, "").replace(/\/+$/, "");
}

/** Phones become their last ten digits; emails are lowercased. */
export function normaliseContact(contact) {
  const c = contact.trim().toLowerCase();
  const digits = c.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : c;
}

function normaliseText(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** The story as a set of meaningful words, for similarity. */
export function tokens(story) {
  return new Set(
    story
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3 && !STOP_WORDS.has(t)),
  );
}

/** Jaccard similarity: shared words over all words. 0 = nothing in common, 1 = identical. */
export function similarity(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / (a.size + b.size - shared);
}

/* -------------------------------------------------------------------- rules */

/**
 * Applies every rule to one response and returns the verdict with reasons.
 * Every rule runs — a rejected person still deserves the complete list of what
 * was wrong — with one exception: when the 18+ answer is not Yes, the form ended
 * on that question, so every other cell is blank by design and reporting
 * "amount is blank" would be noise about a form they never saw.
 */
export function screen(record, log) {
  const adult = col(record, "18 or older").trim();
  const name = col(record, "First name");
  const area = col(record, "city or area");
  const title = col(record, "In one line");
  const amountRaw = col(record, "Exactly how much");
  const story = col(record, "What is going on");
  const forWhat = col(record, "money buy");
  const checkable = col(record, "we can check");
  const method = col(record, "How should someone send");
  const handle = col(record, "Your handle");
  const contact = col(record, "reach you at");
  const acknowledged = col(record, "Tick all four");

  const codes = [];
  const reasons = [];
  const add = (code, reason) => {
    codes.push(code);
    reasons.push(reason);
  };

  const required = { name, area, title, amount: amountRaw, story, handle, contact };
  const missing = Object.entries(required)
    .filter(([, v]) => v.trim().length === 0)
    .map(([k]) => k);

  // H1 — the one line that never moves. The form ends here for a "No", so the
  // rest of the row is empty by design; report that and stop.
  if (adult !== "Yes") {
    add("H1", `"Are you 18 or older?" is ${adult ? `"${adult}"` : "blank"} — it has to be Yes`);
    if (missing.length) add("H5", `missing: ${missing.join(", ")}`);
    return finish(record, name, codes, reasons);
  }

  // H2 — the $5–$100 cap. Blank is H5's job; everything else must be a number in range.
  const amount = Number(amountRaw.replace(/[^0-9.]/g, ""));
  if (amountRaw.trim() && (!Number.isFinite(amount) || amount < MIN_USD || amount > MAX_USD)) {
    add("H2", `amount $${amountRaw.trim()} is outside the $${MIN_USD}–$${MAX_USD} range`);
  }

  // H3 — no Zelle: it reveals the recipient's legal bank-account name.
  if (/zelle/i.test(`${handle} ${method} ${story} ${forWhat}`)) {
    add("H3", "Zelle is mentioned — Cash App, PayPal or Venmo only");
  }

  // H4 — a Social Security number must never be collected, let alone published.
  if (SSN.test(`${story} ${forWhat}`)) {
    add("H4", "something that looks like a Social Security number is in the text");
  }

  // H5 — the seven fields a listing cannot exist without.
  if (missing.length) add("H5", `missing: ${missing.join(", ")}`);

  // The duplicate screen — the whole reason this tool exists.
  const myHandle = normaliseHandle(handle);
  const myContact = normaliseContact(contact);
  const myName = normaliseText(name);
  const myArea = normaliseText(area);
  const myStory = tokens(story);

  for (const prior of log) {
    const rejected = String(prior.decision ?? "").trim().toLowerCase() === "rejected";
    const who = `${prior.name || "someone"}'s ${rejected ? "REJECTED" : "approved"} submission on ${prior.date}`;
    const why = prior.reason ? ` (${prior.reason})` : "";

    // H6 / F1 — same payment handle as before.
    if (myHandle && normaliseHandle(prior.handle ?? "") === myHandle) {
      add(rejected ? "H6" : "F1", `handle matches ${who}${why}`);
    }
    // H7 / F2 — same email or phone as before.
    if (myContact && normaliseContact(prior.contact ?? "") === myContact) {
      add(rejected ? "H7" : "F2", `contact matches ${who}${why}`);
    }
    // F3 — the story is a near-copy of an earlier one.
    const score = similarity(myStory, tokens(prior.story ?? ""));
    if (score >= SIMILARITY_THRESHOLD) {
      add("F3", `story is ${Math.round(score * 100)}% similar to ${who}`);
    }
    // F4 — same first name AND same area.
    if (myName && myArea && normaliseText(prior.name ?? "") === myName && normaliseText(prior.area ?? "") === myArea) {
      add("F4", `same first name and area as ${who}`);
    }
  }

  // F5 — first names only. Fixable by editing, so a flag rather than a reject.
  if (name.trim().split(/\s+/).length > 1) {
    add("F5", `"${name.trim()}" looks like more than a first name — first names only`);
  }

  // F6 — a street address must never be published. Also fixable by editing.
  if (STREET_ADDRESS.test(`${story} ${area} ${forWhat}`)) {
    add("F6", "something that looks like a street address is in the text");
  }

  // F7 — nothing checkable named. "n/a" is three characters.
  if (checkable.trim().length < 4) {
    add("F7", "nothing checkable was named — there is no detail to corroborate");
  }

  // F8 — all four acknowledgements, counted as substrings (see ACKNOWLEDGEMENTS).
  const ticked = ACKNOWLEDGEMENTS.filter((s) => acknowledged.includes(s)).length;
  if (ticked < ACKNOWLEDGEMENTS.length) {
    add("F8", `only ${ticked} of the ${ACKNOWLEDGEMENTS.length} acknowledgements ticked`);
  }

  return finish(record, name, codes, reasons);
}

function finish(record, name, codes, reasons) {
  const verdict = codes.some((c) => c.startsWith("H")) ? "REJECT" : codes.length ? "FLAG" : "CLEAR";
  return { row: record.row, name: name.trim(), verdict, codes, reasons };
}

/* ------------------------------------------------------------------- --emit */

/** Maps the form's category answer to the site's category id (see src/types.ts). */
function categoryOf(kind) {
  const k = kind.toLowerCase();
  if (k.startsWith("food")) return "food";
  if (k.startsWith("getting")) return "transport";
  if (k.startsWith("health")) return "medical";
  if (k.startsWith("staying")) return "housing";
  if (k.startsWith("work")) return "work";
  if (k.startsWith("school")) return "school";
  if (k.startsWith("family")) return "family";
  return "other";
}

function contactMethodOf(answer) {
  if (answer.startsWith("PayPal")) return "paypal";
  if (answer.startsWith("Venmo")) return "venmo";
  return "cashapp";
}

/**
 * Writes new-request.json in the shape `publish.mjs --template` produces, filled
 * from one row. The five review booleans are left false on purpose: the human
 * review has not happened yet, and publish.mjs will refuse the file until it has.
 */
function emit(record, result) {
  if (result.verdict === "REJECT") {
    console.error(`\n  ✗ Row ${record.row} is REJECT — not emitting a publish file for it.\n`);
    process.exit(1);
  }
  const out = join(process.cwd(), "new-request.json");
  if (existsSync(out)) die("new-request.json already exists here — publish or delete it first.");

  const name = col(record, "First name").trim();
  const title = col(record, "In one line").trim();
  const slug = `${name}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 3)
    .join("-");
  const d = new Date();
  const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  const json = {
    id: `${slug}-${mmdd}`,
    name,
    area: col(record, "city or area").trim(),
    category: categoryOf(col(record, "kind of thing")),
    amountUsd: Number(col(record, "Exactly how much").replace(/[^0-9.]/g, "")),
    title,
    story: col(record, "What is going on").trim(),
    forWhat: col(record, "money buy").trim(),
    contactMethod: contactMethodOf(col(record, "How should someone send")),
    contactHandle: col(record, "Your handle").trim(),
    videoUrl: "",
    reviewNote: "",
    confirmedAdult: false,
    videoWatched: false,
    photoReverseSearched: false,
    detailCorroborated: false,
    duplicateScreened: false,
  };
  writeFileSync(out, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.error(`\n  ✓ wrote ${out}`);
  console.error(`    Do the review, set the five checks to true, then: node scripts/publish.mjs new-request.json\n`);
}

/* ------------------------------------------------------------------- report */

function report(results, records) {
  if (results.length === 0) {
    console.log("\n  No response rows to screen.\n");
    return;
  }
  const counts = { REJECT: 0, FLAG: 0, CLEAR: 0 };
  for (const r of results) {
    counts[r.verdict]++;
    const record = records.find((x) => x.row === r.row);
    const amount = col(record, "Exactly how much").trim();
    const title = col(record, "In one line").trim();
    console.log(
      `\n${r.verdict.padEnd(7)} row ${String(r.row).padStart(3)}  ${r.name || "(no name)"}` +
        `${amount ? `  $${amount}` : ""}${title ? `  ${title}` : ""}`,
    );
    for (const reason of r.reasons) console.log(`            - ${reason}`);
  }
  console.log(
    `\n  ${results.length} screened: ${counts.REJECT} reject, ${counts.FLAG} flag, ${counts.CLEAR} clear.` +
      `\n  CLEAR means the rules found nothing — the three human checks still apply.\n`,
  );
}

/* --------------------------------------------------------------------- main */

function die(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(2);
}

function usage() {
  console.log(`
  node scripts/screen.mjs <responses.csv> <log.csv>             readable report, every row
  node scripts/screen.mjs <responses.csv> <log.csv> --row N     one row (spreadsheet row number)
  node scripts/screen.mjs <responses.csv> <log.csv> --json      machine-readable output
  node scripts/screen.mjs <responses.csv> <log.csv> --emit N    write new-request.json for publish.mjs

  The rules: scripts/SCREEN-SPEC.md.   The tests: npm run screen:test
`);
}

function main(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    usage();
    process.exit(argv.length === 0 ? 2 : 0);
  }

  const files = [];
  let json = false;
  let rowFilter = null;
  let emitRow = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") json = true;
    else if (a === "--row") rowFilter = Number(argv[++i]);
    else if (a === "--emit") emitRow = Number(argv[++i]);
    else if (a.startsWith("--")) die(`unknown option ${a}`);
    else files.push(a);
  }
  if (files.length !== 2) die("usage: node scripts/screen.mjs <responses.csv> <log.csv> [--json] [--row N] [--emit N]");
  if (rowFilter !== null && !Number.isInteger(rowFilter)) die("--row needs a row number");
  if (emitRow !== null && !Number.isInteger(emitRow)) die("--emit needs a row number");

  const read = (path) => {
    try {
      return readFileSync(path, "utf8");
    } catch (e) {
      return die(`could not read ${path}: ${e.message}`);
    }
  };
  const responses = toRecords(read(files[0]));
  const log = toRecords(read(files[1])).map((r) => r.cells);

  let records = responses;
  if (rowFilter !== null) {
    records = responses.filter((r) => r.row === rowFilter);
    if (records.length === 0) die(`no row ${rowFilter} — rows are numbered as in the spreadsheet (header is 1)`);
  }
  const results = records.map((r) => screen(r, log));

  if (emitRow !== null) {
    const record = responses.find((r) => r.row === emitRow);
    if (!record) die(`no row ${emitRow} to emit`);
    emit(record, screen(record, log));
    return;
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  report(results, records);
}

main(process.argv.slice(2));
