import type { HelpRequest } from "../types";

/**
 * ============================================================================
 * EVERY LIVE REQUEST ON ONE SMALL ASK LIVES IN THIS FILE.
 * ============================================================================
 *
 * There is no database and no submission endpoint. A request reaches this array
 * only after a human has reviewed it and pushed a commit. That is not a
 * limitation being worked around — it IS the safety gate. Nothing unreviewed
 * can ever appear on the site, because appearing on the site requires a person
 * to type it here.
 *
 * ----------------------------------------------------------------------------
 * ADDING AN APPROVED REQUEST — the full checklist
 * ----------------------------------------------------------------------------
 * Do not skip a step. The Safety page publishes these four checks as a promise
 * to donors, and a request that appears without them makes the site dishonest.
 *
 *  1. WATCH THE VIDEO. Ten seconds of the person saying who they are and what
 *     the money is for. No video, no listing. Ever.
 *  2. REVERSE-IMAGE SEARCH any photo they sent. Stolen photos from other
 *     fundraisers are the most common way a fake request is built.
 *  3. CORROBORATE ONE DETAIL. Something checkable — the clinic, the employer,
 *     the school, the bus route. Confirm it exists and fits the story.
 *  4. SCREEN FOR DUPLICATES. Check the handle, the name, the area and the story
 *     against every previous submission, approved or rejected. Keep that log.
 *
 * Then:
 *  5. Scramble their handle:  node scripts/scramble.mjs '$theircashtag'
 *     Never paste a handle in plain text here.
 *  6. Add the object below with all four review flags set.
 *  7. npm run build   (it will not compile if you missed a required field)
 *  8. Commit and push.
 *
 * ----------------------------------------------------------------------------
 * RULES THAT ARE NOT NEGOTIABLE
 * ----------------------------------------------------------------------------
 *  - Nobody under 18. If the video or the story suggests a minor, reject it and
 *    point them at 211. No exceptions, however sympathetic the request.
 *  - First names or chosen display names only. Never a full legal name.
 *  - City or area only. Never a street address, never a shelter's address.
 *  - Never collect or store a government ID, an SSN, or a bank account number.
 *    You do not need them, you cannot secure them, and holding them creates
 *    liability far larger than this project.
 *  - $5 to $100. The cap is a safety feature: it keeps the loss small when
 *    something does go wrong, and it keeps One Small Ask out of the territory where
 *    money-transmission and charitable-solicitation rules start to bite.
 *  - No Zelle. A Zelle transfer reveals the recipient's legal bank-account name
 *    and the phone or email tied to it. That is more exposure than a person in
 *    a difficult position should be asked to hand a stranger.
 *  - Publishing the video is OPT-IN. If they did not explicitly agree, leave
 *    videoUrl unset — the card shows a "video verified" badge instead, which
 *    carries the trust signal without the permanent exposure.
 *
 * ----------------------------------------------------------------------------
 * REMOVING A REQUEST
 * ----------------------------------------------------------------------------
 * Set status to "removed" or delete the object outright, then push. Do it the
 * same day it is asked for, by the requester or by anyone raising a concern.
 * Never argue the point first.
 */

export const REQUESTS: readonly HelpRequest[] = [
  // Deliberately empty at launch.
  //
  // No placeholder people, no sample requests, no "coming soon" filler. Every
  // entry here is a real person who was really reviewed. An empty list is an
  // honest description of a site on its first day; invented ones would not be,
  // and a donor who later discovered a seeded request was fictional would be
  // right never to trust the confirmed totals either.
  //
  // The browse page has a proper empty state, and the example below shows the
  // format without pretending to be anyone.
];

/**
 * A worked EXAMPLE shown on the "Post a request" page so people can see what a
 * good request looks like. It is labelled as an example everywhere it appears
 * and is never mixed into the live list.
 */
export const EXAMPLE_REQUEST: HelpRequest = {
  id: "example",
  name: "Sam",
  area: "Aurora",
  category: "work",
  amountUsd: 45,
  title: "Steel-toe boots so I can start Monday",
  story:
    "I got hired at a warehouse last week and start Monday, but the job needs steel-toe boots and I do not get paid until the 15th. I have the rest of what I need. Once I am working I am fine — it is just this one gap.",
  forWhat: "One pair of steel-toe work boots, size 11.",
  contactMethod: "cashapp",
  contactScrambled: "==ge7ZndppHdop3K",
  postedOn: "2026-01-01",
  review: {
    reviewedOn: "2026-01-01",
    videoReceived: true,
    reverseImageSearched: true,
    detailCorroborated: true,
    duplicateScreened: true,
    note: "Example only — not a real request.",
  },
  status: "open",
};

/**
 * A request goes stale after this many days and stops appearing, on its own,
 * with no action from anyone.
 *
 * This matters more than it looks. On a static site the only thing keeping the
 * page honest is somebody remembering to take things down — and somebody always
 * eventually forgets. A donor who sends money against a five-month-old request
 * for a bill that was due in March has been let down by the site, not by the
 * requester. Expiry is computed at render time from `postedOn`, so it happens
 * whether or not anyone is paying attention.
 *
 * If a request is still genuinely live at 30 days, re-date it and push. That is
 * a deliberate act of re-confirming it, which is the point.
 */
export const EXPIRY_DAYS = 30;

export function isExpired(request: HelpRequest, now: Date = new Date()): boolean {
  const posted = new Date(`${request.postedOn}T12:00:00Z`);
  if (Number.isNaN(posted.getTime())) return false;
  return (now.getTime() - posted.getTime()) / 86_400_000 > EXPIRY_DAYS;
}

/** The status to actually render — `status` with expiry applied on top. */
export function effectiveStatus(request: HelpRequest, now: Date = new Date()) {
  if (request.status !== "open") return request.status;
  return isExpired(request, now) ? "expired" : "open";
}

export function daysLeft(request: HelpRequest, now: Date = new Date()): number {
  const posted = new Date(`${request.postedOn}T12:00:00Z`);
  if (Number.isNaN(posted.getTime())) return EXPIRY_DAYS;
  const used = (now.getTime() - posted.getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(EXPIRY_DAYS - used));
}

export function openRequests(): HelpRequest[] {
  return REQUESTS.filter((r) => effectiveStatus(r) === "open");
}

export function getRequest(id: string | undefined): HelpRequest | undefined {
  return id ? REQUESTS.find((r) => r.id === id) : undefined;
}

/**
 * The review standard, published on the Safety page and applied to every single
 * request. Kept here so the promise and the checklist above cannot drift apart.
 */
export const REVIEW_STANDARD: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: "A ten-second video, every time",
    body:
      "Before anything is published, the person sends a short video of themselves saying who they are and what the money is for. Someone watches all of it. No video means no listing — there is no version of this we waive.",
  },
  {
    title: "Photos are reverse-image searched",
    body:
      "Any photo attached to a request is checked against the rest of the web. Lifting an image from someone else's fundraiser is the most common way a fake request gets built, and it is also the easiest to catch.",
  },
  {
    title: "A detail in the story is corroborated",
    body:
      "Every request names something checkable — an employer, a clinic, a school, a fee. At least one of those is confirmed to be real and consistent with what was written. Fabricated stories tend not to survive this.",
  },
  {
    title: "Screened against everything submitted before",
    body:
      "Handles, names, areas and stories are checked against every prior submission, approved or rejected. This is what stops the same person reappearing under a new name, which is the failure mode that grows as a site like this does.",
  },
];
