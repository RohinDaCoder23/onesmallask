import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import type { HelpRequest } from "../types";
import { revealContact, type RevealedContact } from "../lib/contact";
import { logReveal } from "../lib/tracking";
import { usd } from "../lib/format";
import { FORMS, formReady } from "../config";
import { Button, ExternalLink } from "./ui";

interface ContactContextValue {
  openContact: (request: HelpRequest, source: string) => void;
}

const Ctx = createContext<ContactContextValue | null>(null);

export function useContactReveal(): ContactContextValue {
  const value = useContext(Ctx);
  if (!value) throw new Error("useContactReveal must be used inside <ContactProvider>");
  return value;
}

/**
 * The rules a donor has to actually read before a handle is shown.
 *
 * These are not boilerplate. Each one maps to a specific way people lose money
 * in peer-to-peer giving, and the second and third are the ones that empty
 * accounts — the overpayment-refund script, and the mid-conversation switch to
 * a different handle. Do not shorten this list to make the screen tidier.
 */
const RULES: ReadonlyArray<{ head: string; body: string }> = [
  {
    head: "This money cannot be undone",
    body:
      "Cash App, Venmo and PayPal to a person are the same as handing over cash. There is no buyer protection and no chargeback. Kindly cannot reverse it, refund it, or recover it — Kindly is not part of the transfer at all.",
  },
  {
    head: "Never send any of it back",
    body:
      "If anyone says they were overpaid and asks you to return the difference, stop. That is the single most common way people are robbed in peer-to-peer giving, and it is always a scam. Tell us instead.",
  },
  {
    head: "Only the handle on this screen",
    body:
      "If the person asks you to send to a different name, a different app, or a different tag than the one shown here, stop and report it. A real requester has no reason to move you off the handle they gave us.",
  },
  {
    head: "Nobody legitimate needs your details",
    body:
      "No genuine request requires your bank login, card number, security code, or Social Security number. Nobody should be asking, and there is never a reason to say yes.",
  },
  {
    head: "Only what you are fine losing",
    body:
      "Every request here was reviewed, and review is not a guarantee. Treat it the way you would treat handing cash to someone on the street: a good thing to do, and gone once done.",
  },
];

type Phase = "safety" | "revealed";

export function ContactProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [source, setSource] = useState("/");
  const [phase, setPhase] = useState<Phase>("safety");
  const [acknowledged, setAcknowledged] = useState(false);
  const [contact, setContact] = useState<RevealedContact | null>(null);
  const [copied, setCopied] = useState(false);

  const { pathname } = useLocation();
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  const openContact = useCallback((next: HelpRequest, from: string) => {
    restoreFocusTo.current = document.activeElement;
    setRequest(next);
    setSource(from);
    setPhase("safety");
    setAcknowledged(false);
    setContact(null);
    setCopied(false);
  }, []);

  const close = useCallback(() => {
    setRequest(null);
    const el = restoreFocusTo.current;
    if (el instanceof HTMLElement) el.focus();
  }, []);

  // Hash routing never reloads the page, so an open dialog would otherwise
  // follow the visitor onto the next route.
  useEffect(() => {
    setRequest(null);
  }, [pathname]);

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [request, close]);

  useEffect(() => {
    if (request) primaryRef.current?.focus();
  }, [request, phase]);

  const value = useMemo<ContactContextValue>(() => ({ openContact }), [openContact]);

  function reveal() {
    if (!request || !acknowledged) return;
    const revealed = revealContact(request);
    setContact(revealed);
    setPhase("revealed");
    logReveal({
      requestId: request.id,
      requestTitle: request.title,
      category: request.category,
      amountUsd: request.amountUsd,
      source,
    });
  }

  async function copyHandle() {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(contact.handle);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked. The handle is selectable on screen, so this is fine.
    }
  }

  return (
    <Ctx.Provider value={value}>
      {children}

      {request ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            className="max-h-[92dvh] w-full max-w-lg animate-scale-in overflow-y-auto rounded-t-xl2 bg-white p-6 shadow-lift sm:rounded-xl2"
          >
            {phase === "safety" ? (
              <>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-600">
                  Before you send anything
                </div>
                <h2 id="contact-title" className="text-xl">
                  Helping {request.name} with {usd(request.amountUsd)}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-sand-700">
                  Kindly does not handle this money and never will. You will send it directly to{" "}
                  {request.name}, on an app of your choosing, exactly as if you had met in person.
                  Please read these five things first.
                </p>

                <ul className="mt-5 space-y-3.5">
                  {RULES.map((r) => (
                    <li key={r.head} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                      />
                      <div>
                        <div className="text-sm font-bold text-ink">{r.head}</div>
                        <div className="mt-0.5 text-sm leading-relaxed text-sand-700">
                          {r.body}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl2 border border-sand-300 bg-sand-50 p-4">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600"
                  />
                  <span className="text-sm leading-relaxed text-ink">
                    I have read these, I understand Kindly is not part of the payment and cannot
                    recover it, and I am choosing to send money at my own risk.
                  </span>
                </label>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={close}>
                    Not now
                  </Button>
                  <Button ref={primaryRef} size="lg" disabled={!acknowledged} onClick={reveal}>
                    Show me how to reach {request.name}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 id="contact-title" className="text-xl">
                  Reach {request.name} here
                </h2>

                {contact ? (
                  <>
                    <div className="mt-4 rounded-xl2 border border-brand-200 bg-brand-50 p-5">
                      <div className="text-xs font-bold uppercase tracking-widest text-brand-700">
                        {contact.label}
                      </div>
                      <div className="mt-1.5 select-all break-all font-display text-2xl text-brand-900">
                        {contact.handle}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" onClick={copyHandle}>
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        {contact.href ? (
                          <ExternalLink
                            href={contact.href}
                            className="inline-flex items-center justify-center rounded-full border border-sand-300 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-sand-50"
                          >
                            Open {contact.label}
                          </ExternalLink>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl2 border border-amber-200 bg-pending-bg p-4 text-sm leading-relaxed text-pending-fg">
                      <strong>Send only to this handle.</strong> If anyone asks you to use a
                      different one, to send money back, or to share your bank or card details,
                      stop and report it — those are the three things that are always a scam.
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl2 border border-amber-200 bg-pending-bg p-4 text-sm leading-relaxed text-pending-fg">
                    Something went wrong reading this contact detail, so nothing is shown rather
                    than something wrong. Please report it and we will fix the listing.
                  </div>
                )}

                <div className="mt-5 rounded-xl2 border border-sand-200 bg-sand-50 p-4 text-sm leading-relaxed text-sand-800">
                  <div className="mb-1 font-bold text-ink">When you have sent it</div>
                  {formReady(FORMS.donorConfirm) ? (
                    <>
                      Tell us, and we will ask {request.name} to confirm they received it. A gift
                      is only ever counted once <em>both</em> of you have said so.
                      <div className="mt-3">
                        <ExternalLink
                          href={FORMS.donorConfirm}
                          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                          I sent it
                        </ExternalLink>
                      </div>
                    </>
                  ) : (
                    <>
                      Confirmation is not open yet. Once it is, both you and {request.name} will
                      be able to confirm, and only gifts confirmed by both sides are ever counted.
                    </>
                  )}
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  {formReady(FORMS.reportConcern) ? (
                    <ExternalLink
                      href={FORMS.reportConcern}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-sand-700 underline underline-offset-2 hover:text-ink"
                    >
                      Report a problem with this request
                    </ExternalLink>
                  ) : (
                    <span />
                  )}
                  <Button ref={primaryRef} variant="secondary" onClick={close}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}
