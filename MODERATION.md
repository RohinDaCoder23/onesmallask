# Running One Small Ask

The site is static. Nothing appears on it until you put it there, and nothing comes down
until you take it down — except expiry, which is automatic. This document is the whole
operation.

Read it once end to end before you accept a single request.

---

## Part 1 — Set up the four forms

Google Forms does the one thing a static site cannot: receive submissions. Create four,
then paste their URLs into `src/config.ts` and push. Until you do, each page shows a clear
"not open yet" state rather than a dead button.

Make all four **"Anyone with the link can respond"** (Settings → Responses → uncheck
*Restrict to users in your organisation*). Turn ON email notifications for every new
response (Responses tab → three dots → *Get email notifications for new responses*), or
you will miss things.

### Form 1 — "Ask for help" → `FORMS.submitRequest`

Put the safety rules at the top of the form as a description, not buried at the end.

| # | Question | Type | Notes |
|---|---|---|---|
| 1 | Are you 18 or older? | Multiple choice, **required** | "No" → branch to a section that says One Small Ask can't accept requests from under-18s, gives 211, and ends the form. This is not negotiable. |
| 2 | First name, or the name you want shown | Short answer, required | Say explicitly: not your full legal name |
| 3 | Your city or area | Short answer, required | Say explicitly: not your address, and don't name where you're staying |
| 4 | In one line, what do you need? | Short answer, required | |
| 5 | Exactly how much? | Short answer, required | State the $5–$100 range in the question |
| 6 | What's going on, and why this amount? | Paragraph, required | This becomes the story on the card |
| 7 | What exactly will the money buy? | Short answer, required | |
| 8 | Name one thing we can check | Short answer, required | "An employer, a clinic, a school, a landlord, a fee — something real we can confirm exists" |
| 9 | Your 10-second video | File upload, required | See the note below — this is the step that loses people |
| 10 | May we publish your video on the site? | Multiple choice, required | Yes / No. **Default to treating a blank as No.** |
| 11 | A photo (optional) | File upload | |
| 12 | How should someone pay you? | Multiple choice, required | Cash App / PayPal / Venmo. **No Zelle** — say why: it reveals your legal bank name |
| 13 | Your handle or PayPal.me link | Short answer, required | |
| 14 | An email or phone we can reach you at | Short answer, required | Say clearly: **never published**, only used to contact you about your request |
| 15 | Tick to confirm you understand | Checkboxes, required | Four boxes: One Small Ask never handles the money · I will never send money back to anyone who says they overpaid · I will never share bank logins, card numbers or my SSN · everything here is true and I am posting it myself |

> **The video upload is your biggest drop-off.** Google Forms file upload requires the
> person to be signed into a Google account, which is a real barrier for someone in
> crisis. Add a line under question 9: *"Can't upload? Text or email it to [YOUR PHONE /
> EMAIL] instead and just write 'sending separately' here."* Then make that field optional
> and check for the video before you approve. Losing a genuine request to a sign-in wall
> is worse than a slightly messier inbox.

### Form 2 — "I sent it" → `FORMS.donorConfirm`

| Question | Type |
|---|---|
| Which request did you help with? | Short answer (title or link), required |
| How much did you send? | Short answer, required |
| What date did you send it? | Date, required |
| Which app? | Multiple choice |
| Your email | Short answer, required — used only to match the two confirmations |
| Anything you want us to know? | Paragraph |

### Form 3 — "I received it" → `FORMS.requesterConfirm`

| Question | Type |
|---|---|
| Which request is yours? | Short answer, required |
| How much did you receive? | Short answer, required |
| What date? | Date, required |
| Your email | Short answer, required |
| Is your request met now? | Multiple choice — Yes, please close it / Not yet |

### Form 4 — "Report a problem" → `FORMS.reportConcern`

| Question | Type |
|---|---|
| What are you reporting? | Multiple choice — a request that looks wrong / someone's behaviour / I want my own request removed / something else |
| Which request? | Short answer |
| What happened? | Paragraph, required |
| How can we reach you? (optional) | Short answer |

---

## Part 2 — The daily routine

Ten minutes, most days. It does not work weekly — a request that sits unreviewed for six
days is a person waiting six days.

1. **Check the report form first.** Always. A report outranks everything else in this
   list. If there is any real doubt about a listed request, take it down *now* and
   investigate after.
2. **Check the request form.** Review anything new (Part 3).
3. **Check both confirmation forms.** Match any pairs (Part 5).
4. **Glance at the live site.** Anything fulfilled or stale that expiry hasn't caught yet.

---

## Part 3 — Reviewing a request

All four checks, every request. The site publishes these as a promise on `/safety`, so a
request that skips one makes the site dishonest — not just sloppy.

### 1. Watch the video, all of it

You are checking three things: a real person is really speaking, they say roughly what the
written request says, and nothing about it suggests they are under 18 or being coached by
someone off-camera. If the video is a still image, a voiceover, or clearly lifted from
somewhere — reject.

If anything makes you think the person is a minor, reject and point them at 211. Do not
negotiate this one with yourself.

### 2. Reverse-image search any photo

Right-click → Search image with Google, or drag it into images.google.com. You are looking
for the same photo on another fundraiser, a stock library, or a news article. This catches
most fabricated requests and takes about a minute.

Do the same with a frame from the video if anything feels off.

### 3. Corroborate one detail

They named something checkable. Confirm it exists and fits:

- An employer → does the business exist, do they hire for that role?
- A clinic or pharmacy → does it exist at that location?
- A school or programme → does it exist, is that fee real?
- A bill amount → is it plausible for that utility in that area?

You are not verifying the person. You are checking whether the *story* survives contact
with reality. Fabricated ones usually don't.

### 4. Screen against everything before

Keep a private sheet of every submission, approved **and rejected**: name, area, handle,
contact email/phone, date, decision, reason. Check every new one against it — handle
first, then contact details, then story.

This is the check that matters more over time. The first duplicate is an accident; the
third is a pattern, and you will only see it if you kept the log.

### Reject when

- No video, or a video that isn't them
- Any indication they're under 18
- The photo appears elsewhere
- The detail doesn't check out
- The story shifts between the form and the video
- They ask for over $100, or for something ongoing rather than one-off
- Any pressure, urgency-manufacturing, or evasion when you ask a follow-up
- The handle or contact matches a previous rejection
- **Your gut says no.** You do not owe anyone a listing, and you never have to justify a
  rejection beyond "this didn't pass review."

Tell people either way, briefly and kindly. If you reject, point them at 211. Nobody
should be left wondering.

---

## Part 4 — Publishing an approved request

```bash
cd "path/to/onesmallask"

# 1. Scramble their handle — never paste it in plain text
node scripts/scramble.mjs '$theircashtag'

# 2. Add the object to REQUESTS in src/data/requests.ts
#    (the file header has the full field-by-field checklist)

# 3. It will not compile if you missed a required field — that's deliberate
npm run build

# 4. Ship it
git add . && git commit -m "Add request: <short description>" && git push
```

The Action redeploys in about 90 seconds. Then **open the live page and check it** — the
name, the amount, and that the contact reveal shows the right handle.

Email the person their link.

### The rules the code can't enforce

- First name only, never a full legal name
- City or area only, never an address, never the name of a shelter
- `videoUrl` only if they explicitly said yes to publishing it
- All four review flags set — they're typed `true`, so you cannot record a partial review
- `postedOn` is today's date, so expiry is measured from now

---

## Part 5 — Recording a confirmed gift

A gift counts only when **both** sides confirm. One alone is never enough: the person who
received it has every reason to confirm, and only the donor can corroborate the amount.

1. A donor confirmation arrives. Nothing happens yet.
2. A requester confirmation arrives for the same request. Check the amounts match and the
   dates are close.
3. If they match, record it. If they don't, email both — usually it's a typo, occasionally
   it's something you need to know about.

**Without Supabase** — edit `src/data/impact-snapshot.json`:

```json
{
  "totals": {
    "requestsReviewed": 12,
    "requestsPublished": 7,
    "contactReveals": 0,
    "confirmedGifts": 0,
    "confirmedUsd": 0,
    "firstRevealTs": null,
    "lastRevealTs": null
  },
  "confirmed": [
    {
      "request_id": "sam-boots",
      "amount_usd": 45,
      "donor_confirmed_on": "2026-09-04",
      "requester_confirmed_on": "2026-09-05",
      "matched_on": "2026-09-05"
    }
  ]
}
```

`confirmedGifts` and `confirmedUsd` are derived from the `confirmed` array at render time,
so you cannot accidentally publish a total that disagrees with its own rows. Keep
`requestsReviewed` and `requestsPublished` current by hand — reviewed includes rejections.

**With Supabase** — insert into `confirmed_gifts` and update the counters table. Schema and
SQL are in `supabase/schema.sql`.

Then set that request's `status` to `"fulfilled"` with a `fulfilledOn` date, and push.

---

## Part 6 — Keeping the site current

This is the part that decays if you let it, and a stale site is worse than a small one.

**Automatic:** requests expire 30 days after `postedOn` and stop appearing on their own —
no action needed, and it works even if you disappear for a month. `EXPIRY_DAYS` in
`src/data/requests.ts` if you want to change it.

**Weekly, fifteen minutes:**

- Any request still open at ~25 days — message the person. Still needed? Re-date it and
  push, or close it. An expired request that was actually met should be marked
  `"fulfilled"`, not left to lapse.
- Update `requestsReviewed` and `requestsPublished` in the snapshot.
- Click through the live site: every link, the contact reveal on one request, the Impact
  page.
- Re-read one random published request as if you were seeing it cold. Does it still look
  true?

**Monthly:**

- `npm run build` locally to catch a dependency that has drifted.
- Run the verification suite (see `README.md`) and look at the screenshots.
- Check that the four Google Forms still accept responses.

**Every time you change site copy**, make sure `/safety`, `/ask` and `/about` still agree
with each other and with what you actually do. The promise and the practice drifting apart
is the specific failure that would matter most here.

---

## Part 7 — When something goes wrong

**Someone reports a request as fake.** Take it down first. `status: "removed"`, push. Then
look. If it was fake, note the handle and contact in your log — they will try again. If it
was fine, apologise to the requester and put it back.

**A donor says they were scammed.** Be honest and quick: you cannot recover the money and
you should say so immediately rather than let them hope. Remove the listing. Tell them to
report it to their payment app and, if they want, to law enforcement. Then work out how it
got past review and fix that.

**A requester says a donor is harassing them, or asking for money back.** Remove the
request immediately so no one else can reach them. Tell the requester plainly: never send
anything back, block the person, and this is not their fault. Log the donor's details.

**Someone asks to be removed.** Do it the same day. Do not ask why.

**You get overwhelmed.** Stop accepting new requests before you start reviewing badly.
Put a line on `/ask` saying submissions are paused. A pause is recoverable; a request that
went up without a real review is not.

---

## Part 8 — The lines that don't move

Written down because they are easiest to talk yourself out of at 11pm with a sympathetic
request in front of you.

1. **Nobody under 18.** Not with a parent's permission, not "nearly 18," not ever.
2. **No request without a video you watched.**
3. **Never collect a government ID, an SSN, or bank account details.** Not to be more
   thorough. You cannot secure them and you do not need them.
4. **Never publish a full legal name or an address.**
5. **Never publish a video someone didn't explicitly agree to publish.**
6. **Never invent a request, an amount, or a statistic** to make the site look busier.
   An empty page is honest. A fabricated one poisons every real number that follows.
7. **Never handle the money**, even once, even to be helpful. The moment you do, this
   becomes a different thing with different rules.
8. **Never claim more review than you did.** If you skipped a check, don't publish.

---

## A note on the disclaimers

The language on `/safety` is written to be clear, honest, and about as protective as plain
English gets. It is not legal advice and it does not make you immune to anything.

If this grows — real volume, real money, more than a handful of requests a week — have an
adult you trust read it, and consider talking to a lawyer about whether you need anything
more formal. The $100 cap and the no-money-handling design are what actually keep the
stakes low, far more than any paragraph of terms.
