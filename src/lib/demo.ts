import type { HelpRequest, ImpactData } from "../types";

/**
 * DEMO MODE — for showing the site on a laptop, never for the live site.
 *
 * The live site launches empty and stays honest: nothing is listed until a real
 * person has been through the full review. That is the right rule for a page
 * strangers send money from, and the wrong shape for a three-minute demo video.
 *
 * So `npm run demo` starts the dev server with `--mode demo`, which flips the
 * compile-time constant `__OSA_DEMO__` to true and does exactly three things:
 *
 *   1. Lists the worked example from the Ask page (Sam, $45, steel-toe boots)
 *      as if it were an open request, re-dated to today so it has not expired.
 *      Its review note says "example only" and every page carries a banner.
 *   2. Shows demo figures on /impact — one confirmed gift — labelled as demo data.
 *   3. Switches the database off, so nothing a demo does is ever recorded.
 *
 * Everything in this file is dead code in a normal build. Rollup strips it, and
 * the deploy workflow greps dist/ for DEMO_MARKER and refuses to publish if it
 * ever shows up. verify/check.mjs asserts the same thing.
 */

export const DEMO_MODE: boolean = __OSA_DEMO__;

/** The string the deploy guard looks for. Change it in deploy.yml too. */
export const DEMO_MARKER = "osa-demo-build";

export const DEMO_BANNER =
  "Demo build. The request shown is a labelled example, not a real person, and the figures on Impact are demo data. This build cannot be deployed.";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** The Ask-page example, dressed as an open request for the demo list only. */
export function demoRequests(example: HelpRequest): HelpRequest[] {
  const today = isoDaysAgo(0);
  return [
    {
      ...example,
      postedOn: today,
      review: {
        ...example.review,
        reviewedOn: today,
        note: "Demo build — this is the worked example from the Ask page, not a real request.",
      },
      status: "open",
    },
  ];
}

/**
 * Demo figures for /impact. Small on purpose, and labelled on the page as demo
 * data. `contactReveals` is passed in from this browser's own activity so that
 * pressing "I want to help" during a demo visibly moves the number.
 */
export function demoImpact(contactReveals: number): ImpactData {
  const donor = isoDaysAgo(6);
  const requester = isoDaysAgo(5);
  return {
    totals: {
      requestsReviewed: 3,
      requestsPublished: 1,
      contactReveals,
      confirmedGifts: 1,
      confirmedUsd: 45,
      firstRevealTs: null,
      lastRevealTs: null,
    },
    confirmed: [
      {
        request_id: "example-earlier",
        amount_usd: 45,
        donor_confirmed_on: donor,
        requester_confirmed_on: requester,
        matched_on: requester,
      },
    ],
    source: "demo",
    generatedOn: null,
  };
}
