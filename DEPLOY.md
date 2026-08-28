# Deploying One Small Ask — exact steps

Repo: **`RohinDaCoder23/onesmallask`**
Live URL after step 3: **https://rohindacoder23.github.io/onesmallask/**

Nothing here has been committed or pushed for you. Everything below is yours to run.

---

## Before you start (one minute)

Check you have Node 20 or newer:

```bash
node -v
```

If it prints anything lower than `v20`, install Node 20 LTS from https://nodejs.org first.
The GitHub Action uses Node 20, so matching it locally avoids surprises.

---

## Step 1 — Build and run it once on your own machine

Do this before pushing. If it fails here, it will fail in CI too, and the error
message is much easier to read locally.

```bash
cd "/Users/rohinkethipally/Claude/Projects/DONATION APP/WEBSITE PROJECT/onesmallask"

npm install
npm run typecheck     # must print nothing and exit cleanly
npm run build         # must end with "built in ..."
npm run preview       # opens a local server, usually http://localhost:4173
```

Open the preview URL and click through every page. With no requests published yet
you should see honest empty states, not errors — that is correct. Press `Ctrl+C`
in the terminal to stop the preview server.

If you want the full browser suite as well:

```bash
npm i -D playwright && npx playwright install chromium
bash verify/run.sh
```

---

## Step 2 — Push the code

Your repo already exists at `https://github.com/RohinDaCoder23/onesmallask.git`.

**If the repo is completely empty** (no README, no commits):

```bash
cd "/Users/rohinkethipally/Claude/Projects/DONATION APP/WEBSITE PROJECT/onesmallask"

git init
git branch -M main
git add .
git commit -m "One Small Ask: needs board for Front Range shelters and food banks"
git remote add origin https://github.com/RohinDaCoder23/onesmallask.git
git push -u origin main
```

**If GitHub already created a README or .gitignore in the repo**, the plain push
above will be rejected. Pull the remote history in first:

```bash
cd "/Users/rohinkethipally/Claude/Projects/DONATION APP/WEBSITE PROJECT/onesmallask"

git init
git branch -M main
git remote add origin https://github.com/RohinDaCoder23/onesmallask.git
git fetch origin
git pull --rebase origin main    # or: git pull origin main --allow-unrelated-histories
git add .
git commit -m "One Small Ask: needs board for Front Range shelters and food banks"
git push -u origin main
```

If git asks for a password, GitHub no longer accepts your account password over
HTTPS. Either install the GitHub CLI (`brew install gh`, then `gh auth login`),
or create a personal access token at
https://github.com/settings/tokens and paste that as the password.

**Verify before moving on:** open https://github.com/RohinDaCoder23/onesmallask
and confirm you can see `src/`, `package.json`, and `.github/workflows/deploy.yml`.
If `.github/` is missing, your git client skipped the dotfolder — run
`git add .github -f` and commit again.

---

## Step 3 — Turn on GitHub Pages

This is the one part that is not in the code, and skipping it is the most common
reason a deploy "does nothing."

1. Go to https://github.com/RohinDaCoder23/onesmallask/settings/pages
2. Under **Build and deployment → Source**, open the dropdown and choose
   **GitHub Actions**. (Not "Deploy from a branch." Not `gh-pages`.)
3. That's the whole setting. There is no Save button — it applies immediately.

---

## Step 4 — Watch the first deploy

1. Go to https://github.com/RohinDaCoder23/onesmallask/actions
2. You should see a run called **Deploy to GitHub Pages**. Click it.
3. It runs two jobs, `build` then `deploy`, and takes about 60–90 seconds.
4. Green check on both = live at **https://rohindacoder23.github.io/onesmallask/**

The very first deploy sometimes takes an extra minute to become reachable even
after the Action goes green. If you get a 404 immediately, wait 60 seconds and
hard-refresh (`Cmd+Shift+R`).

Every later push to `main` redeploys automatically. You can also re-run a deploy
by hand from the Actions tab (**Run workflow**) without making a commit.

---

## Step 5 — Verify the live site

Walk this list on the real URL, on a phone as well as a laptop:

- [ ] Home page loads with the emerald header and the hero headline
- [ ] **Requests** shows the honest "nothing open yet" empty state, not an error
- [ ] **Ask for help** loads, the example is clearly labelled *Example only*, and
      the 18-and-over rule is visible
- [ ] **Safety** loads with all three named scams and both "if you are giving" /
      "if you are asking" lists
- [ ] **Impact** loads and shows zeroes with the two-numbers explanation
- [ ] Visit a nonsense URL like `.../onesmallask/#/asdf` → the 404 page appears,
      not a blank screen
- [ ] Open DevTools → Console. Only font warnings are acceptable; nothing red.

Once you publish your first request, come back and check:

- [ ] It appears on **Requests** with the amount and the "Video verified" badge
- [ ] **I want to help** opens the safety screen, and the button stays disabled
      until you tick the acknowledgement
- [ ] After ticking, the correct handle appears — check it character by character
- [ ] The **Copy** button works

---

## Step 6 (optional) — Turn on live tracking

The site works fully without this. Skip it and the Impact page renders the
snapshot committed at `src/data/impact-snapshot.json`; reveals are still recorded
in each visitor's own browser and exportable from the Impact page.

Turn it on when you want one shared database across all visitors — which is
what makes the Impact numbers meaningful on an application.

1. Create a free account at https://supabase.com and make a new project.
   Choose a region close to Colorado (`us-west-1` or `us-east-1`).
2. In the Supabase dashboard, open **SQL Editor → New query**.
3. Paste the entire contents of `supabase/schema.sql` from this repo and press
   **Run**. It creates two tables, two read-only views, and the security
   policies. It is safe to run more than once.
4. Go to **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (a long string beginning `eyJ`)
5. In GitHub, go to
   https://github.com/RohinDaCoder23/onesmallask/settings/secrets/actions
   and add two repository secrets, named exactly:
   - `VITE_SUPABASE_URL` → the Project URL
   - `VITE_SUPABASE_ANON_KEY` → the anon key
6. Push any commit, or re-run the workflow from the Actions tab. The next build
   picks the secrets up.
7. Load the live site, press **I want to help** on a request, then open
   **Impact**. The badge should read **Live** instead of "Saved snapshot."

**On the anon key being public:** it is meant to be. It ends up in the JavaScript
bundle and anyone can read it. The policies in `schema.sql` are what protect you:
that key can *insert* reveal rows and *read* the two aggregate views, and nothing
else. It cannot read raw rows, cannot write a confirmed gift, and cannot reach any
other table. The comments at the bottom of `schema.sql` include a curl command
that proves the confirmed-gifts table rejects anon writes — run it once. Verification commands are in the comments at the bottom of
`schema.sql` — run them once and see for yourself.

**Recording a confirmed gift.** Only when you have matched a donor confirmation
AND a requester confirmation for the same gift:

```sql
insert into public.confirmed_gifts
  (request_id, amount_usd, donor_confirmed_on, requester_confirmed_on, note)
values
  ('sam-boots', 45.00, '2026-09-04', '2026-09-05',
   'Both confirmed by form');
```

And keep your review counters current:

```sql
update public.site_counters
   set requests_reviewed = 14, requests_published = 8, updated_at = now()
 where id;
```

`request_id` must match the `id` in `src/data/requests.ts`. Those rows are the
only thing that moves the "Confirmed by both people" figure.

---

## Updating content later

| What you want to change | File to edit |
|---|---|
| Publish, edit or remove a request | `src/data/requests.ts` |
| Your contact email, the site URL, the four form links | `src/config.ts` |
| How long a request stays up before expiring | `EXPIRY_DAYS` in `src/data/requests.ts` |
| The review standard shown on /safety | `REVIEW_STANDARD` in `src/data/requests.ts` |
| Colours, fonts, spacing | `tailwind.config.js` |
| Frozen Impact figures used when the database is off | `src/data/impact-snapshot.json` |

Then: `npm run build` to check it compiles, `git add . && git commit -m "..." && git push`.
The Action redeploys within about 90 seconds.

**Rule for `src/data/requests.ts`:** never add a request you have not personally
reviewed against all four checks. The four review flags are typed as literal
`true`, so the compiler will not let you record a partial review — but it cannot
tell whether you actually watched the video. That one is on you, and it is the
line the entire site rests on.

**Never paste a contact handle in plain text.** Run
`node scripts/scramble.mjs '$handle'` and paste what it prints.

The full day-to-day routine — setting up the forms, reviewing, publishing,
recording confirmed gifts, and the weekly sweep that keeps the site current — is
in [MODERATION.md](./MODERATION.md). Read it before you accept a single request.

---

## Troubleshooting

**The page is blank and white.**
Open DevTools → Console. If you see 404s for `/assets/index-xxxx.js`, the base
path is wrong. This build uses `base: "./"` in `vite.config.ts`, which produces
relative paths and cannot have this problem — so if you hit it, check that you
did not change that line.

**The Action fails on `npm ci` with "lock file out of sync".**
Run `npm install` locally, then commit the updated `package-lock.json`.

**The Action fails on `npm run typecheck`.**
Run `npm run typecheck` locally to see the same error with full context. It will
name a file and a line.

**Pushing says "Updates were rejected".**
The remote has commits you don't. Run `git pull --rebase origin main`, resolve
anything it flags, then push again.

**The Actions tab shows no runs at all.**
`.github/workflows/deploy.yml` did not reach GitHub. Confirm it is visible in the
repo file browser; if not, `git add .github -f`, commit, push.

**Pages settings has no "GitHub Actions" option.**
The repository is private on a plan without private Pages. Make the repo public
(Settings → General → bottom of the page), which is fine and appropriate here.
