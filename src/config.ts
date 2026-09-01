/**
 * Every value a human needs to change lives here. Nothing else in the app
 * hard-codes a name, an address, or a URL.
 */
export const SITE = {
  name: "One Small Ask",
  tagline: "Small asks, answered directly.",
  region: "Colorado",

  /**
   * The address shown publicly for concerns, removals and questions.
   *
   * Strongly consider a dedicated address rather than a personal one. It keeps
   * this separate from the rest of your mail, it survives you handing the
   * project on, and it does not put your own name in front of every requester
   * and donor on the site.
   */
  contactEmail: "rohinkethipally44@gmail.com",

  /** Set after the first deploy so outreach can carry a real link. */
  publicUrl: "https://rohindacoder23.github.io/onesmallask/",
} as const;

/**
 * Google Forms do the work a static site cannot: receiving submissions.
 *
 * Replace each placeholder with the real form URL. Until you do, the site shows
 * a clear "not open yet" state on the affected page rather than a dead button —
 * it never pretends a form exists when it does not.
 *
 * Setting them up is documented step by step in MODERATION.md.
 */
export const FORMS = {
  /** Where someone asks for help. Feeds your private review queue. */
  submitRequest: "https://forms.gle/oSLPd32EQtSgcrpDA",
  /** Donor says "I sent it." One half of a confirmed gift. */
  donorConfirm: "https://forms.gle/NGSYGM8EyNrqNvPC9",
  /** Requester says "I received it." The other half. */
  requesterConfirm: "https://forms.gle/Fxa49NdoitWaAcvz7",
  /** Anyone flagging a request as suspicious, or asking to be removed. */
  reportConcern: "https://forms.gle/VhmiEFyy7ZMCZVRUA",
} as const;

export function formReady(url: string): boolean {
  return url.trim().length > 0;
}

/** Builds a mailto: with subject and body pre-filled and correctly escaped. */
export function mailto(subject: string, body: string): string {
  return `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}
