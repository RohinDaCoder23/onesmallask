/**
 * Kindly domain model.
 *
 * The rule that governs this whole file: KINDLY NEVER TOUCHES MONEY AND NEVER
 * BROKERS A PAYMENT. A requester posts a small, specific need. A donor who
 * wants to help is shown how to reach them. The two of them settle it directly,
 * on a payment app of their own choosing, entirely at their own volition.
 *
 * Kindly's only jobs are: review requests before they appear, present them
 * honestly, warn both sides clearly, and count what both sides confirm.
 */

/** Hard cap. Kindly is deliberately for small, concrete asks. */
export const MIN_ASK_USD = 5;
export const MAX_ASK_USD = 100;

export type Category =
  | "food"
  | "transport"
  | "medical"
  | "housing"
  | "work"
  | "school"
  | "family"
  | "other";

export const CATEGORIES: ReadonlyArray<{
  id: Category;
  label: string;
  blurb: string;
}> = [
  { id: "food", label: "Food", blurb: "Groceries, a meal, formula" },
  { id: "transport", label: "Getting there", blurb: "Bus pass, petrol, a fare to work" },
  { id: "medical", label: "Health", blurb: "A prescription, a co-pay, glasses" },
  { id: "housing", label: "Staying housed", blurb: "A utility bill, a late fee, a deposit gap" },
  { id: "work", label: "Work", blurb: "Boots, tools, a uniform, a certification fee" },
  { id: "school", label: "School", blurb: "Supplies, a fee, a textbook" },
  { id: "family", label: "Family", blurb: "Nappies, a school lunch balance, a child's shoes" },
  { id: "other", label: "Something else", blurb: "Small needs that don't fit a box" },
];

/**
 * How a donor reaches the requester. Kindly shows this only after the donor has
 * read the safety screen, and never handles the transfer itself.
 *
 * Zelle is deliberately absent. Zelle transfers reveal the recipient's legal
 * bank-account name plus the phone or email tied to it, which is far more
 * exposure than a requester in a difficult position should be asked to accept
 * from a stranger. See src/data/requests.ts for the full reasoning.
 */
export type ContactMethod = "cashapp" | "paypal" | "venmo" | "email";

export const CONTACT_METHODS: Readonly<
  Record<ContactMethod, { label: string; hint: string; prefix?: string }>
> = {
  cashapp: { label: "Cash App", hint: "Their $cashtag", prefix: "$" },
  paypal: { label: "PayPal", hint: "Their PayPal.me link" },
  venmo: { label: "Venmo", hint: "Their @username", prefix: "@" },
  email: { label: "Email", hint: "An address they check" },
};

export type RequestStatus = "open" | "fulfilled" | "expired" | "removed";

/** What the reviewer actually did before this request went live. Every approved
 *  request carries the full set — the site publishes these checks as a promise,
 *  so a request cannot appear without them. */
export interface ReviewRecord {
  /** ISO date the review was completed. */
  reviewedOn: string;
  /** A 10-second video of the person saying what they need was received and watched. */
  videoReceived: true;
  /** Any photo was reverse-image searched and is not lifted from elsewhere. */
  reverseImageSearched: true;
  /** At least one checkable detail in the story was confirmed to be real. */
  detailCorroborated: true;
  /** Handle, story and details screened against every prior submission. */
  duplicateScreened: true;
  /** Optional short note from the reviewer, shown publicly. No private details. */
  note?: string;
}

export interface HelpRequest {
  id: string;
  /** First name or a chosen display name. Never a full legal name. */
  name: string;
  /** City or area only. Never a street address. */
  area: string;
  category: Category;
  amountUsd: number;
  /** One line, in the requester's own words. */
  title: string;
  /** The full ask, in the requester's own words, lightly edited only for typos. */
  story: string;
  /** Exactly what the money is for. Concrete. */
  forWhat: string;
  contactMethod: ContactMethod;
  /**
   * Stored lightly scrambled, not in plain text. This is a speed bump against
   * naive email/handle harvesters, NOT security — anyone who opens devtools can
   * read it, and the site says so. Use `revealContact()` in lib/contact.ts.
   */
  contactScrambled: string;
  /** Public video URL, only when the requester opted in to publishing it. */
  videoUrl?: string;
  postedOn: string;
  review: ReviewRecord;
  status: RequestStatus;
  /** Set when status is "fulfilled" — what the requester said they received. */
  fulfilledOn?: string;
}

/** A donor pressed "I want to help" and was shown how to make contact. */
export interface ContactReveal {
  id: string;
  ts: string;
  request_id: string;
  request_title: string;
  category: Category;
  amount_usd: number;
  /** Route it came from. No query strings, no PII. */
  source: string;
  /** Random per-browser id. Not tied to any identity. */
  session_id: string;
}

/**
 * A gift BOTH sides confirmed. This is the only figure Kindly ever calls
 * completed. One side alone is never enough — the donor confirms they sent it,
 * the requester confirms they received it, and only a matched pair counts.
 */
export interface ConfirmedGift {
  request_id: string;
  amount_usd: number;
  /** ISO dates each side submitted their confirmation. */
  donor_confirmed_on: string;
  requester_confirmed_on: string;
  /** ISO date the reviewer matched the two confirmations. */
  matched_on: string;
}

export interface ImpactTotals {
  requestsReviewed: number;
  requestsPublished: number;
  contactReveals: number;
  confirmedGifts: number;
  confirmedUsd: number;
  firstRevealTs: string | null;
  lastRevealTs: string | null;
}

/** What the Impact page received and how much to trust it. */
export type ImpactSource = "live" | "snapshot" | "local";

export interface ImpactData {
  totals: ImpactTotals;
  confirmed: ConfirmedGift[];
  source: ImpactSource;
  /** ISO timestamp the snapshot was generated, when source is "snapshot". */
  generatedOn: string | null;
}
