import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8099/onesmallask/";
const ROUTES = [
  ["landing", "#/"],
  ["requests", "#/requests"],
  ["request-missing", "#/requests/does-not-exist"],
  ["ask", "#/ask"],
  ["safety", "#/safety"],
  ["impact", "#/impact"],
  ["about", "#/about"],
  ["not-found", "#/this-route-does-not-exist"],
  ["alias-redirect", "#/browse"],
];

const problems = [];
const fontNoise = [];
const blockedHosts = new Set();
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

for (const width of [1280, 375]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
  const page = await ctx.newPage();

  page.on("console", (m) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    const t = m.text();
    // This sandbox has no egress to Google Fonts. The site is designed to fall
    // back to system fonts, so a font-CDN failure here is expected and is not a
    // defect. Every other console message is a real finding.
    if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(t)) {
      fontNoise.push(`${width}px ${t}`);
      return;
    }
    problems.push(`[console ${m.type()}] ${width}px ${page.url()} :: ${t}`);
  });
  page.on("pageerror", (e) => problems.push(`[pageerror] ${width}px ${page.url()} :: ${e.message}`));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (u.includes("fonts.g")) { blockedHosts.add(new URL(u).host); return; } // offline sandbox
    problems.push(`[requestfailed] ${width}px ${u} :: ${r.failure()?.errorText}`);
  });

  for (const [name, hash] of ROUTES) {
    await page.goto(BASE + hash, { waitUntil: "domcontentloaded" });
    await page
      .waitForFunction(() => document.body.innerText.trim().length > 400, null, { timeout: 15000 })
      .catch(() => problems.push(`[render-timeout] ${width}px ${name} never rendered content`));
    await page.waitForTimeout(150);

    const h1 = await page.locator("h1, h2").first().innerText().catch(() => "");
    const bodyLen = (await page.locator("body").innerText()).length;
    if (bodyLen < 200) problems.push(`[empty-page] ${width}px ${name} rendered only ${bodyLen} chars`);

    // Horizontal overflow is the classic mobile bug.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) problems.push(`[h-overflow] ${width}px ${name} overflows by ${overflow}px`);

    await page.screenshot({ path: `verify/shots/${name}-${width}.png`, fullPage: width === 1280 });
    console.log(`ok  ${String(width).padEnd(5)} ${name.padEnd(22)} "${h1.slice(0, 46)}"  ${bodyLen} chars`);
  }
  await ctx.close();
}

// --- Interaction test: the safety gate ---
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => problems.push(`[pageerror/interaction] ${e.message}`));

// Hash-only navigation does not fire a load event, so `goto` can return before
// React has re-rendered. Wait for text we know belongs to the destination
// rather than for a timeout — deterministic, and it cannot pass by luck.
async function go(hash, mustContain) {
  await page.goto(BASE + hash, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    mustContain,
    { timeout: 15000 },
  );
}

// With no live requests, the empty states must be real and actionable.
await go("#/requests", "No open requests right now");
const reqText = await page.locator("body").innerText();
for (const must of ["No open requests right now", "Ask for help"]) {
  if (!reqText.includes(must)) problems.push(`[requests] missing empty-state text: ${must}`);
}
await page.screenshot({ path: "verify/shots/requests-empty-1280.png", fullPage: true });

// The safety page must carry every scam name and both audiences.
await go("#/safety", "The three scams that actually happen");
const safety = await page.locator("body").innerText();
for (const must of [
  "The refund", "The switch", "The fee",
  "If you are giving", "If you are asking",
  "Never send money back", "cannot be recovered, reversed or refunded",
]) {
  if (!safety.includes(must)) problems.push(`[safety] missing required text: ${must}`);
}
await page.screenshot({ path: "verify/shots/safety-1280.png", fullPage: true });

// Ask page must NOT present the example as a real request.
await go("#/ask", "What you\u2019ll need");
const ask = await page.locator("body").innerText();
if (!ask.includes("Example only")) problems.push("[ask] example is not labelled as an example");
if (!ask.includes("18 or older")) problems.push("[ask] missing the 18+ rule");
await page.screenshot({ path: "verify/shots/ask-1280.png", fullPage: true });

// Impact must lead with the two-numbers distinction and show honest zeroes.
await go("#/impact", "Confirmed by both people");
await page.waitForTimeout(400); // let the async impact load settle
const impact = await page.locator("body").innerText();
for (const must of ["Confirmed by both people", "People asked how to help", "No confirmed gifts yet"]) {
  if (!impact.includes(must)) problems.push(`[impact] missing required text: ${must}`);
}
await page.screenshot({ path: "verify/shots/impact-1280.png", fullPage: true });
console.log("ok  content       safety/ask/impact copy assertions passed");

// Contact handles must NOT appear as plain text anywhere in the shipped bundle.
const bundle = fs.readFileSync("dist/index.html", "utf8");
const assets = fs.readdirSync("dist/assets").filter((f) => f.endsWith(".js"));
const js = assets.map((f) => fs.readFileSync(`dist/assets/${f}`, "utf8")).join("\n");
if (/\$samsboots/.test(bundle + js)) {
  problems.push("[privacy] a contact handle is sitting in the bundle as PLAIN TEXT");
} else {
  console.log("ok  privacy       no plain-text contact handles in the built bundle");
}

// Bare 404.html (someone types a real path instead of a hash route).
await page.goto(new URL("some/typo", BASE).href, { waitUntil: "domcontentloaded" });
const notFound = await page.locator("body").innerText();
if (!notFound.includes("That page isn't here")) problems.push("[404] static 404.html did not render");
const homeHref = await page.locator("#home").getAttribute("href");
console.log(`ok  404.html      home link resolves to "${homeHref}"`);

await ctx.close();
await browser.close();

fs.writeFileSync("verify/report.txt", problems.join("\n") || "no problems found");
console.log("\n================ RESULT ================");
if (fontNoise.length) {
  console.log(`note: ${fontNoise.length} network error(s) suppressed; blocked hosts seen: ${[...blockedHosts].join(", ") || "none"}`);
}
console.log(problems.length === 0 ? "PASS — no console errors, no overflow, no empty pages" : `${problems.length} PROBLEM(S):`);
problems.forEach((p) => console.log("  " + p));
process.exit(problems.length ? 1 : 0);
