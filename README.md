# One Small Ask

**Small asks, answered directly.**

Someone posts one specific thing they need — between $5 and $100, in their own words,
with a ten-second video of themselves saying it. It is reviewed by a person before it
appears. Anyone who wants to help reaches them and sends the money themselves.

**One Small Ask never touches the money.** No payment form, no account, no funds held, no cut
taken. It is a noticeboard, not a fund.

Live: https://rohindacoder23.github.io/onesmallask/
Deploying: [DEPLOY.md](./DEPLOY.md) · Running it day to day: [MODERATION.md](./MODERATION.md)

---

## The rules the whole thing rests on

> **Nothing is published without a person reviewing it.** Every request gets all four
> checks — a ten-second video watched in full, any photo reverse-image searched, one
> checkable detail corroborated, and a screen against everything submitted before.
> There is no fast track and no partial version.

> **No invented content, ever.** No sample requests, no placeholder people, no estimated
> figures. An empty page is an honest description of a site on its first day. A seeded one
> would poison every real number that came after it.

> **Nothing is called money until two people confirm it.** The donor says they sent it,
> the requester says they received it. One side alone is never enough.

`ReviewRecord` in `src/types.ts` types all four checks as literal `true`, so a request
cannot be added to the codebase with a partial review recorded. The compiler enforces the
promise the site makes on `/safety`.

---

## Why One Small Ask never handles the money

A site that collected donations and passed them on would have to hold other people's
money, register as a charitable solicitor in most states, take a cut to cover processing,
and be trusted with funds by people who had never heard of it.

Handing the two people a way to reach each other removes all of that. Every dollar
arrives, it arrives immediately, and nothing about One Small Ask has to be trusted with funds
because it never has any.

The cost is real and the site states it plainly: One Small Ask cannot reverse a payment and
cannot see one happen. `/safety` is built around admitting that, and `/impact` refuses to
call anything money until two people independently confirm it.

The **$5–$100 cap** is the main safety feature. It keeps any single loss small, keeps the
site clear of money-transmission and charitable-solicitation territory, and keeps every
request to a concrete gap a stranger can picture closing.

---

## Architecture

```
src/
├─ main.tsx              Root, error boundary, HashRouter, contact-reveal provider
├─ App.tsx               Routes, one error boundary per page
├─ config.ts             ← contact email + the four Google Form URLs
├─ types.ts              Domain model. ReviewRecord types the review promise.
│
├─ data/
│  ├─ requests.ts        ← EVERY LIVE REQUEST. Plus expiry and the review standard.
│  └─ impact-snapshot.json   Committed fallback so /impact always renders
│
├─ lib/
│  ├─ contact.ts         Handle unscrambling (anti-harvest, NOT security)
│  ├─ tracking.ts        Reveal logging, retry queue, 3-tier impact read
│  ├─ supabase.ts        ~90-line PostgREST client (no SDK dependency)
│  ├─ storage.ts         localStorage that cannot throw
│  ├─ format.ts          Currency, dates, hostnames
│  └─ demo.ts            Local-only demo mode; dead code in every real build
│
├─ components/          Layout, ErrorBoundary, Cards,
│                       ContactContext (the safety gate), ui primitives
└─ pages/               Landing, Requests, RequestDetail, Ask, Safety,
                        Impact, About, NotFound

scripts/
├─ publish.mjs          Publish, fulfil or remove a request without hand-editing
├─ scramble.mjs         Turns a handle into its stored form
├─ SCREEN-SPEC.md       Duplicate-screening tool: the rules, written down first
├─ screen.test.mjs      Its test runner, against scripts/fixtures/
│                       (screen.mjs itself is in progress — see Review tooling)
├─ create-forms.gs      Apps Script that builds the four Google Forms
├─ fix-form.gs          Apps Script: in-form video upload + the review email
└─ private/             Form exports and the submissions log. Git-ignored.

supabase/schema.sql     Optional tracking database
verify/run.sh           The whole verification suite, one command
```

### Decisions worth knowing about

**`base: "./"` in `vite.config.ts`.** Relative asset paths, so the same `dist/` works at
`username.github.io/onesmallask`, at a custom domain, on Netlify, or opened from disk. This
removes the single most common cause of a blank-white GitHub Pages deploy.

**`HashRouter`, not `BrowserRouter`.** GitHub Pages serves static files only, so real
paths 404 on deep links without a redirect hack. Hash routing needs no server rules at all.

**Requests live in a TypeScript file, not a database.** This is the safety gate, not a
workaround. Publishing requires a human to edit a file and push, so nothing unreviewed can
reach the site by any path.

**Requests expire automatically after 30 days**, computed at render time from `postedOn`.
On a static site the only thing keeping the page honest is somebody remembering to take
things down, and somebody always eventually forgets. A donor sending money against a
five-month-old request has been let down by the site, not by the requester.

**Contact handles are stored scrambled** — a speed bump against the bots that harvest
static sites, explicitly *not* security. Anyone with devtools can read them in thirty
seconds, and `/safety` says exactly that rather than implying protection that isn't there.

**A hand-written Supabase client.** One INSERT and two SELECTs. A fetch wrapper adds zero
KB, cannot break on a major-version bump, and gives every call an explicit timeout.

---

## The site works with no backend

Tracking is optional. With `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` unset, every
page still renders: reveals are written to the visitor's own browser and `/impact` renders
the committed snapshot. `loadImpact()` reads in strict order of trustworthiness — **live**
(the database answered), **snapshot** (figures committed to this repo), then **local**
(this browser's own activity) — and the page labels which one it is showing. It never
spins forever and never shows an error state.

The same is true of the Google Forms. With `FORMS` unset, the affected pages show a clear
"not open yet" state rather than a dead button.

---

## Two numbers, never blended

| Figure | What it means |
|---|---|
| **People asked how to help** | Someone read the safety screen and was shown how to reach a requester. **Not money.** |
| **Confirmed by both people** | A donor confirmed sending and a requester confirmed receiving the same gift. |

One Small Ask is not part of the payment, so there is no receipt and no webhook. Two independent
people saying the same thing happened is the only honest evidence available — and one side
alone would be the weaker side, since the recipient has every reason to confirm and only
the donor can corroborate the amount.

---

## If you work at an organization

You do not need to set anything up, sign anything, or accept any form of payment. Money never
goes to an organization through One Small Ask: it goes from one person directly to the person
who asked, on that person's own Cash App, PayPal or Venmo, and One Small Ask is not in the
middle of it either. Organizations cannot post requests — every listing is one adult, on
camera, asking for one specific thing under $100.

The only thing asked of a case manager, a pantry or a shelter is a sentence: if someone you
serve has a small, one-off gap, tell them this exists, alongside 211 and everything else you
already do. That is the whole integration. `/about` says the same thing on the site.

## Privacy

One row per reveal: which request, the amount, the date, and a random per-browser id. No
names, no emails, no payment details, no location, no third-party analytics, no
advertising trackers. The Supabase anon key is public by design and row-level security
restricts it to INSERT-only on `contact_reveals` plus SELECT on two aggregate views — it
cannot read raw rows or write a confirmed gift.

---

## Commands

```bash
npm install
npm run dev          # local dev server
npm run demo         # dev server in demo mode — see "Demo mode" below
npm run typecheck    # tsc --noEmit, strict, no `any`
npm run build        # typecheck + production build to dist/
npm run build:demo   # demo build to dist-demo/ (never deployed; the workflow checks)
npm run preview      # serve the production build
npm run screen:test  # run the screening tool against its fixtures

node scripts/scramble.mjs '$handle'   # prepare a contact handle for requests.ts
node scripts/publish.mjs --help       # publish / fulfil / remove a request
bash verify/run.sh                    # the full browser suite (production build)
bash verify/run.sh demo               # the same suite against the demo build
```

### Verification suite

`verify/run.sh` builds, serves the output from a **subpath** via
`verify/ghpages_server.py` — reproducing the real deploy shape including 404.html
handling — drives a real Chromium against it, then tears everything down.

It checks all 9 routes at 1280px and 375px for console errors, page errors, failed
requests, horizontal overflow and empty renders. Then it asserts the safety copy is
actually present (all three named scams, both audiences, the irreversibility warning),
that the example request is labelled as an example, that the 18+ rule appears, that the
Impact page leads with the two-numbers distinction, **that no stored contact handle
appears as plain text anywhere in the built bundle** (each one is unscrambled from
`requests.ts` and searched for, so the check is derived from the data rather than
hard-coded), **that no demo-mode code is in the production bundle**, and that the static
404 resolves correctly. Against the demo build (`bash verify/run.sh demo`) it also drives
the whole donor path: safety gate shown, reveal button disabled until the acknowledgement
is ticked, and the exact handle appearing only afterwards. Screenshots land in
`verify/shots/`.

Playwright is a dev dependency; the browser itself is a one-time install:

```bash
npx playwright install chromium
bash verify/run.sh
```

---

## Demo mode (local only)

The live site launches empty and stays that way until a real person has been through the
full review. That is the right rule for a page strangers send money from, and the wrong shape
for showing someone how the site works. So:

```bash
npm run demo
```

starts the dev server with `--mode demo`, which lists the worked example from the Ask page
(Sam, $45, steel-toe boots) as if it were an open request, puts a banner on every page saying
exactly that, shows labelled demo figures on `/impact`, and switches the database off so
nothing done in a demo is recorded. The whole donor path can then be walked on a laptop.

It cannot leak. The flag is a compile-time constant (`__OSA_DEMO__` in `vite.config.ts`), so
in a normal build every demo branch is dead code and is stripped from the bundle; the deploy
workflow then greps the output for the demo marker and refuses to publish if it is ever
present, and `verify/check.mjs` asserts the same thing. `src/lib/demo.ts` has the details.

## Review tooling

Three of the four review checks need a human. The fourth — screening a new submission
against everything submitted before — gets harder every month and is the one a computer is
good at. `scripts/SCREEN-SPEC.md` specifies a tool for it: it reads the Google Forms
responses export and the private submissions log, applies a fixed set of rules (the hard
lines that mean an automatic no, and the duplicate checks on handle, contact, name, area and
story similarity that mean a person needs to look), and prints a verdict with reasons,
never publishing anything. `npm run screen:test` checks an implementation against twelve
fixture submissions with known answers. **The implementation, `scripts/screen.mjs`, is in
progress and not in the repository yet** — until it lands, the duplicate screen is done by
hand against the log, exactly as `MODERATION.md` Part 3 describes.

`scripts/publish.mjs` then does the publishing: it validates the same hard lines, scrambles
the handle, and inserts the entry into `src/data/requests.ts`, refusing anything that would
break a promise made on `/safety`. The Google Forms themselves are built by
`scripts/create-forms.gs`, and `scripts/fix-form.gs` adds the in-form video upload and the
review email that arrives for every new submission.

## Who built this, and how

One Small Ask is built and run by **Rohin Kethipally**, a high-school student in Parker,
Colorado. The product and safety decisions are his: the peer-to-peer model, never touching
the money, the $5–$100 cap, 18+ only, no Zelle, the two-numbers rule, launching empty, and
the four-check review standard. He runs it day to day — reviewing submissions, the Google
Forms intake, and the outreach to Colorado organizations.

**AI assistance, disclosed in full.** Parts of the code were written by Rohin directly.
Claude (Anthropic) was used to build the user interface, to review the code, to set up the
GitHub Pages deployment, to add the local demo mode and its deploy guard, and to generate
some of the Google Forms scripts; most of the documentation in this repository was drafted
with AI assistance. The duplicate-screening tool's spec, fixtures and test runner
(`scripts/SCREEN-SPEC.md`, `scripts/fixtures/`, `scripts/screen.test.mjs`) were
AI-generated so that the tool can be checked against a fixed, independent standard; the
tool itself, `scripts/screen.mjs`, is Rohin's to write without AI code generation and is
not in the repository until he commits it.

Open-source dependencies: React, React Router, Vite, TypeScript and Tailwind CSS, plus
Playwright for the verification suite. Fonts are Fraunces and Plus Jakarta Sans from Google
Fonts. Everything else in this repository is first-party.

## Legal posture

One Small Ask is an independent project. It is not a charity, a bank, a payment processor, an
escrow service, or a party to any transfer between two people who find each other here. It
holds no money at any point. Gifts made through it are personal gifts between individuals
and are not tax-deductible.

Requests are reviewed in good faith and capped at $100. That is a real reduction in risk
and it is not a guarantee. `/safety` says so in those words rather than implying more.
