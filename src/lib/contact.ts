import type { ContactMethod, HelpRequest } from "../types";
import { CONTACT_METHODS } from "../types";

/**
 * Contact handles are stored scrambled rather than in plain text.
 *
 * BE CLEAR ABOUT WHAT THIS IS. It is a speed bump against the automated
 * harvesters that crawl static sites scraping `@handles` and anything shaped
 * like an email address. It is NOT security. Anyone who opens developer tools
 * can read every handle on this site in about thirty seconds, and the Safety
 * page says exactly that rather than implying protection we cannot give.
 *
 * What it does buy: a requester's payment handle does not sit in the page
 * source as matchable plain text, so the cheap bulk scrapers miss it. For
 * someone who is already in a difficult position, that is a real if modest
 * reduction in the junk and the targeting that follows.
 *
 * The genuine protections are elsewhere: the review gate, the $100 cap, the
 * absence of Zelle, and the safety screen a donor must read before a handle is
 * ever shown.
 */

const SHIFT = 7;

function shift(input: string, by: number): string {
  let out = "";
  for (let i = 0; i < input.length; i += 1) {
    out += String.fromCharCode(input.charCodeAt(i) + by);
  }
  return out;
}

/** Inverse of the scramble applied by scripts/scramble.mjs. Never throws. */
export function unscramble(scrambled: string): string {
  try {
    const b64 = scrambled.split("").reverse().join("");
    return shift(atob(b64), -SHIFT);
  } catch {
    return "";
  }
}

export interface RevealedContact {
  method: ContactMethod;
  label: string;
  /** The handle as the requester gave it, ready to display. */
  handle: string;
  /** A link that opens the right app or client, when one exists. */
  href: string | null;
}

export function revealContact(request: HelpRequest): RevealedContact | null {
  const raw = unscramble(request.contactScrambled).trim();
  if (!raw) return null;

  const meta = CONTACT_METHODS[request.contactMethod];
  const handle = meta.prefix && !raw.startsWith(meta.prefix) ? `${meta.prefix}${raw}` : raw;

  let href: string | null = null;
  switch (request.contactMethod) {
    case "cashapp":
      href = `https://cash.app/${encodeURIComponent(handle)}`;
      break;
    case "venmo":
      href = `https://venmo.com/${encodeURIComponent(handle.replace(/^@/, ""))}`;
      break;
    case "paypal":
      href = /^https?:\/\//i.test(raw)
        ? raw
        : `https://paypal.me/${encodeURIComponent(raw.replace(/^@/, ""))}`;
      break;
    case "email":
      href = `mailto:${raw}`;
      break;
  }

  return { method: request.contactMethod, label: meta.label, handle, href };
}
