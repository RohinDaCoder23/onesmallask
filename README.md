# Kindly

**Small asks, answered directly.**

Someone posts one specific thing they need — between $5 and $100, in their own words,
with a ten-second video of themselves saying it. It is reviewed by a person before it
appears. Anyone who wants to help reaches them and sends the money themselves.

**Kindly never touches the money.** No payment form, no account, no funds held, no cut
taken. It is a noticeboard, not a fund.

Live: https://rohindacoder23.github.io/kindly.org/
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

## Why Kindly never handles the money

A site that collected donations and passed them on would have to hold other people's
money, register as a charitable solicitor in most states, take a cut to cover processing,
and be trusted with funds by people who had never heard of it.

Handing the two people a way to reach each other removes all of that. Every dollar
arrives, it arrives immediately, and nothing about Kindly has to be trusted with funds
because it never has any.

The cost is real and the site states it plainly: Kindly cannot reverse a payment and
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
│  └─ format.ts          Currency, dates, hostnames
│
├─ components/          Layout, ErrorBoundary, Cards,
│                       ContactContext (the safety gate), ui primitives
└─ pages/               Landing, Requests, RequestDetail, Ask, Safety,
                        Impact, About, NotFound

scripts/scramble.mjs    Turns a handle into its stored form
supabase/schema.sql     Optional tracking database
verify/run.sh           The whole verification suite, one command
```

### Decisions worth knowing about

**`base: "./"` in `vite.config.ts`.** Relative asset paths, so the same `dist/` works at
`username.github.io/kindly.org`, at a custom domain, on Netlify, or opened from disk. This
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

Kindly is not part of the payment, so there is no receipt and no webhook. Two independent
people saying the same thing happened is the only honest evidence available — and one side
alone would be the weaker side, since the recipient has every reason to confirm and only
the donor can corroborate the amount.

---

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
npm run typecheck    # tsc --noEmit, strict, no `any`
npm run build        # typecheck + production build to dist/
npm run preview      # serve the production build

node scripts/scramble.mjs '$handle'   # prepare a contact handle for requests.ts
bash verify/run.sh                    # the full browser suite
```

### Verification suite

`verify/run.sh` builds, serves the output from a **subpath** via
`verify/ghpages_server.py` — reproducing the real deploy shape including 404.html
handling — drives a real Chromium against it, then tears everything down.

It checks all 9 routes at 1280px and 375px for console errors, page errors, failed
requests, horizontal overflow and empty renders. Then it asserts the safety copy is
actually present (all three named scams, both audiences, the irreversibility warning),
that the example request is labelled as an example, that the 18+ rule appears, that the
Impact page leads with the two-numbers distinction, **that no contact handle appears as
plain text anywhere in the built bundle**, and that the static 404 resolves correctly.
Screenshots land in `verify/shots/`.

Playwright is deliberately **not** a dependency — that keeps CI's `npm ci` fast and unable
to fail on a browser download:

```bash
npm i -D playwright && npx playwright install chromium
bash verify/run.sh
```

---

## Legal posture

Kindly is an independent project. It is not a charity, a bank, a payment processor, an
escrow service, or a party to any transfer between two people who find each other here. It
holds no money at any point. Gifts made through it are personal gifts between individuals
and are not tax-deductible.

Requests are reviewed in good faith and capped at $100. That is a real reduction in risk
and it is not a guarantee. `/safety` says so in those words rather than implying more.
