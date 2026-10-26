#!/usr/bin/env node
/**
 * Test runner for scripts/screen.mjs — the duplicate-screening tool.
 *
 *   npm run screen:test
 *
 * Runs the tool against the fixtures in scripts/fixtures/ and compares every row's
 * verdict and rule codes with scripts/fixtures/expected.json. It tells you, in plain
 * words, which rows pass, which fail, and which rule in SCREEN-SPEC.md to look at.
 *
 * This runner and the fixtures were generated with AI. The tool it tests is not.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TOOL = join(HERE, "screen.mjs");
const RESPONSES = join(HERE, "fixtures", "responses.sample.csv");
const LOG = join(HERE, "fixtures", "log.sample.csv");
const EXPECTED = JSON.parse(readFileSync(join(HERE, "fixtures", "expected.json"), "utf8"));

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

if (!existsSync(TOOL)) {
  console.log(`
  ${bold("scripts/screen.mjs does not exist yet.")}

  That is the file you are writing. Start with scripts/SCREEN-SPEC.md — section 5 has a
  level-by-level path, and this runner will start passing rows as soon as Level 2 works.
`);
  process.exit(1);
}

/* -------------------------------------------------------------- run the tool */
const run = spawnSync(process.execPath, [TOOL, RESPONSES, LOG, "--json"], {
  cwd: ROOT,
  encoding: "utf8",
  timeout: 30_000,
});

if (run.error) {
  console.log(red(`\n  Could not run the tool: ${run.error.message}\n`));
  process.exit(1);
}
if (run.status !== 0) {
  console.log(red(`\n  The tool exited with code ${run.status} instead of 0.\n`));
  if (run.stderr.trim()) console.log(dim(indent(run.stderr.trim())));
  if (run.stdout.trim()) console.log(dim(indent(run.stdout.trim().slice(0, 1500))));
  console.log(`
  A crash this early usually means the CSV parser or the argument handling. Section 5,
  Level 1 of the spec. Exit code 2 is for usage errors only — with valid files it must be 0.
`);
  process.exit(1);
}

let output;
try {
  output = JSON.parse(run.stdout);
} catch {
  console.log(red("\n  --json mode printed something that is not valid JSON.\n"));
  console.log(dim(indent(run.stdout.trim().slice(0, 1500) || "(nothing on stdout)")));
  console.log(`
  In --json mode, stdout must be ONLY the JSON array — no banner, no "Screening 12 rows…"
  line, nothing else. Anything meant for a human goes to console.error, or only prints in
  the normal (non-JSON) mode.
`);
  process.exit(1);
}

if (!Array.isArray(output)) {
  console.log(red("\n  --json mode must print an ARRAY, one object per response row.\n"));
  process.exit(1);
}

/* ------------------------------------------------------------------- compare */
console.log(`\n  ${bold("screen.mjs")} against ${EXPECTED.rows.length} fixture rows\n`);

let pass = 0;
const failures = [];

for (const want of EXPECTED.rows) {
  const got = output.find((r) => Number(r?.row) === want.row);
  const label = `row ${String(want.row).padStart(2)}  ${(want.name || "(blank)").padEnd(14)}`;

  if (!got) {
    failures.push(want.row);
    console.log(`  ${red("FAIL")}  ${label} ${dim(want.tests)}`);
    console.log(`        no object with "row": ${want.row} in the output. Rows are spreadsheet rows — header is 1, first response is 2.`);
    continue;
  }

  const wantCodes = [...want.codes].sort();
  const gotCodes = Array.isArray(got.codes) ? [...got.codes].map(String).sort() : null;
  const codesOk = gotCodes !== null && JSON.stringify(gotCodes) === JSON.stringify(wantCodes);
  const verdictOk = got.verdict === want.verdict;

  if (codesOk && verdictOk) {
    pass += 1;
    console.log(`  ${green("ok  ")}  ${label} ${dim(want.tests)}`);
    continue;
  }

  failures.push(want.row);
  console.log(`  ${red("FAIL")}  ${label} ${dim(want.tests)}`);
  if (!verdictOk) {
    console.log(`        verdict: expected ${bold(want.verdict)}, got ${bold(String(got.verdict))}`);
  }
  if (gotCodes === null) {
    console.log(`        "codes" is missing or not an array`);
  } else if (!codesOk) {
    const missing = wantCodes.filter((c) => !gotCodes.includes(c));
    const extra = gotCodes.filter((c) => !wantCodes.includes(c));
    if (missing.length) console.log(`        should have fired but didn't: ${bold(missing.join(", "))}  ${dim(hint(missing))}`);
    if (extra.length) console.log(`        fired but shouldn't have:     ${bold(extra.join(", "))}  ${dim(hint(extra))}`);
  }
  if (Array.isArray(got.reasons) && got.reasons.length) {
    console.log(dim(`        tool said: ${got.reasons.join(" | ")}`));
  }
}

/* ------------------------------------------------------- shape of the output */
const shapeProblems = [];
for (const r of output) {
  if (typeof r.row !== "number") shapeProblems.push(`"row" should be a number (got ${JSON.stringify(r.row)})`);
  if (!["CLEAR", "FLAG", "REJECT"].includes(r.verdict)) shapeProblems.push(`"verdict" must be CLEAR, FLAG or REJECT (got ${JSON.stringify(r.verdict)})`);
  if (!Array.isArray(r.codes)) shapeProblems.push(`"codes" must be an array`);
  if (!Array.isArray(r.reasons)) shapeProblems.push(`"reasons" must be an array`);
  else if (Array.isArray(r.codes) && r.reasons.length !== r.codes.length)
    shapeProblems.push(`row ${r.row}: ${r.codes.length} code(s) but ${r.reasons.length} reason(s) — one sentence per code`);
  const vd = r.codes?.some((c) => String(c).startsWith("H")) ? "REJECT" : r.codes?.length ? "FLAG" : "CLEAR";
  if (Array.isArray(r.codes) && r.verdict !== vd)
    shapeProblems.push(`row ${r.row}: codes ${JSON.stringify(r.codes)} imply ${vd} but verdict is ${r.verdict}`);
}
if (output.length !== EXPECTED.rows.length)
  shapeProblems.push(`expected ${EXPECTED.rows.length} rows in the output, got ${output.length}`);

const uniqueShape = [...new Set(shapeProblems)];
if (uniqueShape.length) {
  console.log(`\n  ${red("Output shape problems:")}`);
  for (const p of uniqueShape.slice(0, 12)) console.log(`    - ${p}`);
}

/* ------------------------------------------------- stretch goal: --emit */
let emitNote = "";
{
  const dir = mkdtempSync(join(tmpdir(), "osa-screen-"));
  const emit = spawnSync(process.execPath, [TOOL, RESPONSES, LOG, "--emit", "2"], {
    cwd: dir,
    encoding: "utf8",
    timeout: 30_000,
  });
  const out = join(dir, "new-request.json");
  if (emit.status === 2) {
    emitNote = dim("  --emit: skipped (stretch goal, not implemented yet)");
  } else if (!existsSync(out)) {
    emitNote = red("  --emit 2 ran but did not write new-request.json in the current directory");
  } else {
    try {
      const j = JSON.parse(readFileSync(out, "utf8"));
      const problems = [];
      if (j.name !== "Avery") problems.push(`name should be "Avery"`);
      if (j.category !== "transport") problems.push(`category should be "transport" (from "Getting there — …")`);
      if (j.contactMethod !== "cashapp") problems.push(`contactMethod should be "cashapp"`);
      if (Number(j.amountUsd) !== 88) problems.push(`amountUsd should be 88`);
      if (j.contactHandle !== "$test-avery") problems.push(`contactHandle should be "$test-avery"`);
      for (const k of ["confirmedAdult", "videoWatched", "photoReverseSearched", "detailCorroborated", "duplicateScreened"]) {
        if (j[k] !== false) problems.push(`${k} must start as false — the human review hasn't happened yet`);
      }
      for (const k of ["id", "area", "title", "story", "forWhat"]) {
        if (typeof j[k] !== "string" || !j[k].trim()) problems.push(`${k} is empty`);
      }
      emitNote = problems.length
        ? red(`  --emit 2: wrote new-request.json but: ${problems.join("; ")}`)
        : green("  --emit 2: new-request.json matches the publish.mjs template");
    } catch {
      emitNote = red("  --emit 2: new-request.json is not valid JSON");
    }
  }
  rmSync(dir, { recursive: true, force: true });
}

/* ------------------------------------------------------------------- summary */
console.log(`\n  ${pass}/${EXPECTED.rows.length} rows pass${failures.length ? `, failing: ${failures.join(", ")}` : ""}`);
if (emitNote) console.log(emitNote);
console.log("");

const ok = failures.length === 0 && uniqueShape.length === 0;
console.log(ok ? green("  PASS") : red("  not yet"));
console.log("");
process.exit(ok ? 0 : 1);

/* --------------------------------------------------------------------- utils */
function indent(s) {
  return s.split("\n").map((l) => `        ${l}`).join("\n");
}

function hint(codes) {
  const h = {
    H1: "spec §4 H1 — the 18+ answer must be exactly 'Yes'",
    H2: "spec §4 H2 — strip to digits and '.', Number(), 5 ≤ n ≤ 100, Number.isFinite",
    H3: "spec §4 H3 — /zelle/i across handle, method, story, forWhat",
    H4: "spec §4 H4 — \\b\\d{3}-?\\d{2}-?\\d{4}\\b in story or forWhat",
    H5: "spec §4 H5 — seven required fields, blank after trim",
    H6: "spec §4 H6 — normalised handle vs REJECTED log rows (trim, lowercase, drop $/@)",
    H7: "spec §4 H7 — normalised contact vs REJECTED log rows",
    F1: "spec §4 F1 — normalised handle vs APPROVED log rows",
    F2: "spec §4 F2 — normalised contact vs APPROVED log rows (lowercase the email!)",
    F3: "spec §4 F3 — Jaccard on token sets, ≥ 0.6; check your tokeniser and stop words",
    F4: "spec §4 F4 — name AND area both match a log row, normalised",
    F5: "spec §4 F5 — more than one word in the name",
    F6: "spec §4 F6 — street-address regex over story, area, forWhat",
    F7: "spec §4 F7 — 'one thing we can check' shorter than 4 chars after trim",
    F8: "spec §4 F8 — count the four exact statements as substrings, don't split on commas",
  };
  return codes.map((c) => h[c] ?? "").filter(Boolean).join("; ");
}
