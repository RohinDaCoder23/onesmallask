#!/usr/bin/env node
/**
 * Turns a contact handle into the `contactScrambled` value that goes in
 * src/data/requests.ts.
 *
 *   node scripts/scramble.mjs '$theircashtag'
 *   node scripts/scramble.mjs 'someone@example.com'
 *
 * This is an anti-harvesting speed bump, not encryption — see the long note in
 * src/lib/contact.ts. Never treat it as protection, and never tell a requester
 * their handle is hidden. It is not; it is just not sitting in the page source
 * as plain matchable text.
 */

const SHIFT = 7;

function shift(input, by) {
  let out = "";
  for (let i = 0; i < input.length; i += 1) {
    out += String.fromCharCode(input.charCodeAt(i) + by);
  }
  return out;
}

function scramble(plain) {
  const b64 = Buffer.from(shift(plain, SHIFT), "binary").toString("base64");
  return b64.split("").reverse().join("");
}

function unscramble(scrambled) {
  const b64 = scrambled.split("").reverse().join("");
  return shift(Buffer.from(b64, "base64").toString("binary"), -SHIFT);
}

const input = process.argv[2];

if (!input) {
  console.error("Usage: node scripts/scramble.mjs '<handle or email>'");
  process.exit(1);
}

if (/[^\x20-\x7E]/.test(input)) {
  console.error("Only plain ASCII handles are supported. Got a non-ASCII character.");
  process.exit(1);
}

const out = scramble(input);
const roundTrip = unscramble(out);

if (roundTrip !== input) {
  console.error("Round-trip check FAILED — do not use this value.");
  console.error(`  in:  ${JSON.stringify(input)}`);
  console.error(`  out: ${JSON.stringify(roundTrip)}`);
  process.exit(1);
}

console.log(`\n  contactScrambled: "${out}",\n`);
console.log(`  (verified: decodes back to ${JSON.stringify(input)})\n`);
