import { Link, useParams } from "react-router-dom";
import {
  EXPIRY_DAYS,
  REVIEW_STANDARD,
  daysLeft,
  effectiveStatus,
  getRequest,
} from "../data/requests";
import { longDate, usd } from "../lib/format";
import { FORMS, formReady } from "../config";
import { useContactReveal } from "../components/ContactContext";
import { VerifiedBadge, categoryLabel } from "../components/Cards";
import {
  Badge,
  Button,
  Callout,
  ExternalLink,
  InternalLinkButton,
} from "../components/ui";

export default function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const request = getRequest(requestId);
  const { openContact } = useContactReveal();

  if (!request) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-2xl">This request isn&rsquo;t here</h1>
          <p className="mt-3 text-sm leading-relaxed text-sand-700">
            It may have been fulfilled, expired, or taken down at the person&rsquo;s request —
            all three happen, and all three mean the page goes away.
          </p>
          <div className="mt-6">
            <InternalLinkButton to="/requests">See open requests</InternalLinkButton>
          </div>
        </div>
      </div>
    );
  }

  const source = `/requests/${request.id}`;
  const state = effectiveStatus(request);
  const closed = state !== "open";
  const remaining = daysLeft(request);

  return (
    <div className="container-page py-12">
      <Link
        to="/requests"
        className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
      >
        ← All open requests
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr,1fr] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{categoryLabel(request.category)}</Badge>
            <Badge>{request.area}</Badge>
            <VerifiedBadge />
            {closed ? (
              <Badge tone="sand">
                {state === "expired" ? "Expired" : state === "fulfilled" ? "Fulfilled" : "Closed"}
              </Badge>
            ) : remaining <= 7 ? (
              <Badge tone="pending">
                {remaining === 0 ? "Expires today" : `${remaining} days left`}
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl">{request.title}</h1>
          <p className="mt-2 text-lg text-sand-600">
            {request.name} · {request.area}
          </p>

          {request.videoUrl ? (
            <div className="mt-6 overflow-hidden rounded-xl2 border border-sand-200 bg-black">
              <video
                src={request.videoUrl}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full"
              >
                Your browser cannot play this video.
              </video>
            </div>
          ) : null}

          <div className="prose-osa mt-6">
            <h2 className="text-xl">In their words</h2>
            <p className="whitespace-pre-line">{request.story}</p>

            <h2 className="text-xl">What the money is for</h2>
            <p>{request.forWhat}</p>
          </div>

          <section className="mt-10">
            <h2 className="text-xl">What was checked before this appeared</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-sand-700">
              Completed {longDate(request.review.reviewedOn)}. Every request goes through all four
              — there is no partial version.
            </p>
            <ul className="mt-4 space-y-3">
              {REVIEW_STANDARD.map((step) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-bg text-success-fg"
                  >
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink">{step.title}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-sand-700">{step.body}</div>
                  </div>
                </li>
              ))}
            </ul>
            {request.review.note ? (
              <p className="mt-4 border-l-2 border-sand-300 pl-3 text-sm italic leading-relaxed text-sand-600">
                {request.review.note}
              </p>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="card p-6">
            <div className="font-display text-4xl leading-none text-brand-800">
              {usd(request.amountUsd)}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-sand-700">{request.forWhat}</p>

            {closed ? (
              <div className="mt-5 rounded-xl2 border border-sand-200 bg-sand-50 p-4 text-sm leading-relaxed text-sand-700">
                {state === "expired"
                  ? `This request expired. Requests come down automatically after ${EXPIRY_DAYS} days so nobody sends money against something that is no longer current.`
                  : state === "fulfilled"
                    ? `${request.name} confirmed this was met${request.fulfilledOn ? ` on ${longDate(request.fulfilledOn)}` : ""}.`
                    : "This request is closed."}{" "}
                <Link
                  to="/requests"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  See what is still open.
                </Link>
              </div>
            ) : (
              <>
                <Button
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => openContact(request, source)}
                >
                  I want to help
                </Button>
                <p className="mt-3 text-xs leading-relaxed text-sand-600">
                  You&rsquo;ll read a short safety screen, then see how to reach {request.name}.
                  You send the money yourself, directly to them. One Small Ask never touches it and
                  cannot recover it.
                </p>
              </>
            )}
          </div>

          <div className="mt-5">
            <Callout title="Something look wrong?" tone="sand">
              <p className="mb-3">
                If anything here seems off — a story that does not add up, a photo you have seen
                elsewhere, a message asking you to send money back — tell us. Reports are read,
                and a request comes down the same day if there is doubt.
              </p>
              {formReady(FORMS.reportConcern) ? (
                <ExternalLink
                  href={FORMS.reportConcern}
                  className="inline-flex items-center justify-center rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50"
                >
                  Report this request
                </ExternalLink>
              ) : (
                <Link
                  to="/safety"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  How to report a problem
                </Link>
              )}
            </Callout>
          </div>
        </aside>
      </div>
    </div>
  );
}
