#!/usr/bin/env node
/**
 * Publish, fulfil, or remove a request — without hand-editing src/data/requests.ts.
 *
 *   node scripts/publish.mjs new-request.json     # publish a reviewed request
 *   node scripts/publish.mjs --fulfil sam-boots   # mark it received
 *   node scripts/publish.mjs --remove sam-boots   # take it down now
 *   node scripts/publish.mjs --template           # write a blank new-request.json
 *   node scripts/publish.mjs --list               # what's currently live
 *
 * This exists so publishing a request is a 30-second job you can do yourself at
 * 11pm, rather than something you have to wait on anyone for. A request sitting
 * unpublished for three days is a person waiting three days.
 *
 * It refuses to publish anything that would break the promises on /safety. Those
 * refusals are the point — do not add a --force flag.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src", "data", "requests.ts");

const MIN_USD = 5;
const MAX_USD = 100;
const CATEGORIES = ["food", "transport", "medical", "housing", "work", "school", "family", "other"];
const METHODS = ["cashapp", "paypal", "venmo", "email"];
const SHIFT = 7;

/* ------------------------------------------------------------------ scramble */
// Must stay byte-identical to scripts/scramble.mjs and src/lib/contact.ts.
const shift = (s, by) =>
  [...s].map((c) => String.fromCharCode(c.charCodeAt(0) + by)).join("");
const scramble = (plain) =>
  Buffer.from(shift(plain, SHIFT), "binary").toString("base64").split("").reverse().join("");
const unscramble = (s) =>
  shift(Buffer.from(s.split("").reverse().join(""), "base64").toString("binary"), -SHIFT);

/* --------------------------------------------------------------------- utils */
const die = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);
const today = () => new Date().toISOString().slice(0, 10);

function readData() {
  if (!existsSync(DATA)) die(`Can't find ${DATA}. Run this from the repo root.`);
  return readFileSync(DATA, "utf8");
}

function liveIds(src) {
  return [...src.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]);
}

/* ------------------------------------------------------------------ template */
const TEMPLATE = {
  _README: [
    "Fill this in from the Google Form response, then run:",
    "  node scripts/publish.mjs new-request.json",
    "Delete nothing. Every field below is required except videoUrl.",
  ],
  id: "",
  name: "",
  area: "",
  category: "work",
  amountUsd: 0,
  title: "",
  story: "",
  forWhat: "",
  contactMethod: "cashapp",
  contactHandle: "",
  videoUrl: "",
  reviewNote: "",
  confirmedAdult: false,
  videoWatched: false,
  photoReverseSearched: false,
  detailCorroborated: false,
  duplicateScreened: false,
};

function writeTemplate() {
  const path = join(process.cwd(), "new-request.json");
  if (existsSync(path)) die("new-request.json already exists — fill that one in or delete it.");
  writeFileSync(path, JSON.stringify(TEMPLATE, null, 2) + "\n", "utf8");
  console.log(`\n  Wrote ${path}\n`);
  console.log("  Fill it in from the form response, then run:");
  console.log("    node scripts/publish.mjs new-request.json\n");
}

/* ------------------------------------------------------------------ validate */
function validate(r, src) {
  const errs = [];
  const need = (k) =>
    typeof r[k] === "string" && r[k].trim().length > 0 ? null : errs.push(`${k} is empty`);

  ["id", "name", "area", "title", "story", "forWhat", "contactHandle"].forEach(need);

  if (!/^[a-z0-9-]+$/.test(r.id || ""))
    errs.push("id must be lowercase letters, numbers and hyphens only (e.g. sam-boots-0901)");
  if (liveIds(src).includes(r.id)) errs.push(`id "${r.id}" is already in requests.ts`);

  if (!CATEGORIES.includes(r.category))
    errs.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  if (!METHODS.includes(r.contactMethod))
    errs.push(`contactMethod must be one of: ${METHODS.join(", ")}`);

  const amt = Number(r.amountUsd);
  if (!Number.isFinite(amt) || amt < MIN_USD || amt > MAX_USD)
    errs.push(`amountUsd must be a number between ${MIN_USD} and ${MAX_USD} (got ${r.amountUsd})`);
  if (Number.isFinite(amt) && Math.round(amt * 100) !== amt * 100)
    errs.push("amountUsd can have at most 2 decimal places");

  // The four review checks are published as a promise on /safety. All four, always.
  const checks = {
    confirmedAdult: "you confirmed they are 18 or older",
    videoWatched: "you watched the whole ten-second video",
    photoReverseSearched: "you reverse-image searched any photo (true if there was no photo)",
    detailCorroborated: "you corroborated one checkable detail",
    duplicateScreened: "you screened against everything submitted before",
  };
  for (const [k, why] of Object.entries(checks)) {
    if (r[k] !== true) errs.push(`${k} is not true — set it only when ${why}`);
  }

  // Things that must never reach the page.
  if ((r.name || "").trim().split(/\s+/).length > 1)
    errs.push(`name "${r.name}" looks like more than a first name — first names only`);
  if (/\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|way|ct|court)\b/i.test(
    `${r.story} ${r.area} ${r.forWhat}`,
  ))
    errs.push("something in the text looks like a street address — never publish one");
  if (/\bzelle\b/i.test(`${r.story} ${r.forWhat} ${r.contactHandle}`))
    errs.push("Zelle is not supported — it reveals the person's legal bank-account name");
  if (/\b\d{3}-?\d{2}-?\d{4}\b/.test(`${r.story} ${r.forWhat}`))
    errs.push("that looks like an SSN — it must never be collected or published");

  // Handle shape, per method.
  const h = (r.contactHandle || "").trim();
  if (r.contactMethod === "cashapp" && !h.startsWith("$"))
    errs.push('Cash App handles start with "$" (e.g. $samsboots)');
  if (r.contactMethod === "venmo" && !h.startsWith("@"))
    errs.push('Venmo handles start with "@" (e.g. @sams-boots)');
  if (r.contactMethod === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(h))
    errs.push("that doesn't look like an email address");
  if (r.contactMethod === "paypal" && !/paypal\.me\//i.test(h))
    errs.push("PayPal should be a paypal.me link");
  if (/[^\x20-\x7E]/.test(h)) errs.push("handle must be plain ASCII");

  if (r.videoUrl && !/^https?:\/\//.test(r.videoUrl))
    errs.push("videoUrl must be a full https:// link, or empty");

  return errs;
}

/* ------------------------------------------------------------------- publish */
function publish(path) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    die(`Couldn't read ${path} as JSON — ${e.message}`);
  }
  delete raw._README;

  const src = readData();
  const errs = validate(raw, src);
  if (errs.length) {
    console.error("\n  Not published. Fix these first:\n");
    errs.forEach((e) => console.error(`    ✗ ${e}`));
    console.error("");
    process.exit(1);
  }

  const handle = raw.contactHandle.trim();
  const scrambled = scramble(handle);
  if (unscramble(scrambled) !== handle) die("Handle scramble failed its round-trip check.");
  ok(`handle scrambled and verified (decodes back to ${JSON.stringify(handle)})`);

  const esc = (s) => String(s).trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const entry =
    `  {\n` +
    `    id: "${esc(raw.id)}",\n` +
    `    name: "${esc(raw.name)}",\n` +
    `    area: "${esc(raw.area)}",\n` +
    `    category: "${raw.category}",\n` +
    `    amountUsd: ${Number(raw.amountUsd)},\n` +
    `    title: "${esc(raw.title)}",\n` +
    `    story:\n      "${esc(raw.story)}",\n` +
    `    forWhat: "${esc(raw.forWhat)}",\n` +
    `    contactMethod: "${raw.contactMethod}",\n` +
    `    contactScrambled: "${scrambled}",\n` +
    (raw.videoUrl ? `    videoUrl: "${esc(raw.videoUrl)}",\n` : "") +
    `    postedOn: "${today()}",\n` +
    `    review: {\n` +
    `      reviewedOn: "${today()}",\n` +
    `      videoReceived: true,\n` +
    `      reverseImageSearched: true,\n` +
    `      detailCorroborated: true,\n` +
    `      duplicateScreened: true,\n` +
    (raw.reviewNote ? `      note: "${esc(raw.reviewNote)}",\n` : "") +
    `    },\n` +
    `    status: "open",\n` +
    `  },\n`;

  const anchor = "export const REQUESTS: readonly HelpRequest[] = [\n";
  const at = src.indexOf(anchor);
  if (at === -1) die("Couldn't find the REQUESTS array in requests.ts.");
  const insertAt = at + anchor.length;

  writeFileSync(DATA, src.slice(0, insertAt) + entry + src.slice(insertAt), "utf8");

  ok(`added "${raw.id}" to src/data/requests.ts`);
  console.log(`\n  Now check it compiles, then push:\n`);
  console.log(`    npm run build`);
  console.log(`    git commit -am "Publish request: ${raw.id}"`);
  console.log(`    git push\n`);
  console.log(`  Live in about 90 seconds at`);
  console.log(`    https://rohindacoder23.github.io/onesmallask/#/requests/${raw.id}\n`);
  console.log(`  Then email that link to them, along with the "I received it" form.\n`);
}

/* ------------------------------------------------------------ status changes */
function setStatus(id, status) {
  const src = readData();
  if (!liveIds(src).includes(id)) die(`No request with id "${id}". Try --list.`);

  // Narrow to just this entry's object literal, then flip its status.
  const start = src.indexOf(`id: "${id}"`);
  const end = src.indexOf("\n  },", start);
  if (start === -1 || end === -1) die(`Couldn't locate the entry for "${id}".`);

  let block = src.slice(start, end);
  if (!/status: "[a-z]+"/.test(block)) die(`Entry "${id}" has no status field.`);
  block = block.replace(/status: "[a-z]+"/, `status: "${status}"`);

  if (status === "fulfilled" && !/fulfilledOn:/.test(block)) {
    block = block.replace(/(\n\s+status: ")/, `\n    fulfilledOn: "${today()}",$1`);
  }

  writeFileSync(DATA, src.slice(0, start) + block + src.slice(end), "utf8");
  ok(`"${id}" is now ${status}`);
  console.log(`\n    npm run build && git commit -am "${status}: ${id}" && git push\n`);
  if (status === "fulfilled") {
    console.log(`  Reminder: this does NOT count on the Impact page until BOTH`);
    console.log(`  the donor and the requester have filed their confirmation forms.\n`);
  }
}

function list() {
  const src = readData();
  const ids = liveIds(src);
  if (!ids.length) {
    console.log("\n  Nothing published yet.\n");
    return;
  }
  console.log(`\n  ${ids.length} request${ids.length === 1 ? "" : "s"} in requests.ts:\n`);
  for (const id of ids) {
    const at = src.indexOf(`id: "${id}"`);
    const block = src.slice(at, src.indexOf("\n  },", at));
    const status = (block.match(/status: "([a-z]+)"/) || [])[1] ?? "?";
    const amount = (block.match(/amountUsd: ([\d.]+)/) || [])[1] ?? "?";
    const title = (block.match(/title: "([^"]+)"/) || [])[1] ?? "";
    const posted = (block.match(/postedOn: "([\d-]+)"/) || [])[1] ?? "";
    console.log(`    ${status.padEnd(10)} $${String(amount).padEnd(5)} ${id}  ${posted}`);
    console.log(`               ${title}`);
  }
  console.log("");
}

/* ---------------------------------------------------------------------- main */
const [flag, arg] = process.argv.slice(2);

if (!flag || flag === "--help" || flag === "-h") {
  console.log(`
  node scripts/publish.mjs --template          write a blank new-request.json
  node scripts/publish.mjs new-request.json    publish a reviewed request
  node scripts/publish.mjs --list              show what's in requests.ts
  node scripts/publish.mjs --fulfil <id>       mark a request received
  node scripts/publish.mjs --remove <id>       take a request down now
`);
  process.exit(0);
}

if (flag === "--template") writeTemplate();
else if (flag === "--list") list();
else if (flag === "--fulfil" || flag === "--fulfill") {
  if (!arg) die("Which one? e.g. --fulfil sam-boots-0901");
  setStatus(arg, "fulfilled");
} else if (flag === "--remove") {
  if (!arg) die("Which one? e.g. --remove sam-boots-0901");
  setStatus(arg, "removed");
} else publish(flag);
