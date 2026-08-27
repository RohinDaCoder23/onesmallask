import { Link } from "react-router-dom";
import { REVIEW_STANDARD } from "../data/requests";
import { MAX_ASK_USD, MIN_ASK_USD } from "../types";
import { FORMS, SITE, formReady, mailto } from "../config";
import { usd } from "../lib/format";
import { Callout, ExternalLink, SectionHeading } from "../components/ui";

const SCAMS = [
  {
    name: "The refund",
    how: "Someone says they sent too much — a typo, a slip, the wrong button — and asks you to send the difference back. Sometimes they show a screenshot of a payment that never cleared, or one that will be reversed after you have already sent yours.",
    rule: "Never send money back to anyone, for any reason. If a payment really was a mistake, the person who sent it can resolve it with their own bank or app. You never need to.",
  },
  {
    name: "The switch",
    how: "Partway through, the handle changes. 'My Cash App is locked, use this instead.' 'Send it to my cousin.' 'Use this other app.' The new handle belongs to someone else entirely.",
    rule: "Only ever send to the handle this site showed you. If it changes, stop and report it. A real requester has no reason to move you.",
  },
  {
    name: "The fee",
    how: "Someone tells a requester they must pay a small processing fee, verification charge, or deposit before a larger gift can be released. The larger gift does not exist.",
    rule: "Nobody ever has to pay to receive a gift. If you are asked to send anything at all in order to receive something, it is a scam without exception.",
  },
];

export default function Safety() {
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Safety"
        title="How this works, what we check, and what we cannot promise"
        lead={`${SITE.name} is a noticeboard where people ask for one small thing and other people answer directly. Because the money never passes through us, we cannot reverse a payment, refund one, or get one back. That makes what we do before a request appears — and what you know before you send — the whole of the protection.`}
      />

      <div className="mt-8 max-w-3xl">
        <Callout title="The short version" tone="brand">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>We never touch the money.</strong> No payment form, no account, no funds
              held. It goes person to person, on an app you choose.
            </li>
            <li>
              <strong>Every request is reviewed before it appears</strong> — a video of the person,
              a photo check, a corroborated detail, a duplicate screen. All four, every time.
            </li>
            <li>
              <strong>Review is not a guarantee.</strong> It removes the easy fakes. It cannot
              read minds.
            </li>
            <li>
              <strong>Send only what you would be fine losing.</strong> Requests are capped at{" "}
              {usd(MAX_ASK_USD)} partly for that reason.
            </li>
          </ul>
        </Callout>
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">What we check before a request appears</h2>
        <p className="mt-2 leading-relaxed text-sand-700">
          Nothing is published automatically. There is no way to submit a request and have it go
          live — publishing requires a person to review it and act. These four checks are done on
          every single request, with no fast track and no exceptions.
        </p>
        <div className="mt-6 space-y-4">
          {REVIEW_STANDARD.map((step, i) => (
            <div key={step.title} className="card p-6">
              <div className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-800">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-sand-700">{step.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">What review cannot do</h2>
        <p className="mt-2 leading-relaxed text-sand-700">
          It would be easy to leave this part out. Here it is instead, because a donor who is
          surprised later was not warned properly now.
        </p>
        <ul className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed text-sand-700">
          <li>
            <strong className="text-ink">We verify a person, not a future.</strong> The video shows
            a real person really asking. It cannot prove they will spend it the way they said.
          </li>
            <li>
            <strong className="text-ink">We are not verifying identity documents.</strong> We do
            not collect government IDs, Social Security numbers or bank details — we could not
            secure them, and holding them would create a far bigger risk than it removes.
          </li>
          <li>
            <strong className="text-ink">We cannot see the payment.</strong> It happens on an app
            we have no access to. We only know a gift happened when both people tell us.
          </li>
          <li>
            <strong className="text-ink">We cannot get money back.</strong> Not some of it, not in
            unusual cases. Once sent, it is gone, exactly as if it had been cash.
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">The three scams that actually happen</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-sand-700">
          These are worth knowing by name. Two of them target the person <em>asking</em> for help,
          not the person giving — which is the part most people do not expect.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {SCAMS.map((s) => (
            <div key={s.name} className="card flex h-full flex-col p-6">
              <h3 className="font-display text-xl text-ink">{s.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-sand-700">{s.how}</p>
              <div className="mt-4 rounded-xl2 border border-amber-200 bg-pending-bg p-3 text-sm font-semibold leading-relaxed text-pending-fg">
                {s.rule}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl">If you are giving</h2>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-sand-700">
            <li>Treat it as cash. Send only what you are prepared to lose entirely.</li>
            <li>Use only the handle shown on this site. Never a substitute.</li>
            <li>Never send money back to anyone, whatever the explanation.</li>
            <li>
              Never share your bank login, card number, security code, or Social Security number.
              No genuine request needs any of them.
            </li>
            <li>You are under no obligation to explain yourself, negotiate, or send more.</li>
            <li>If something feels wrong, it costs nothing to stop. Report it and we will look.</li>
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-xl">If you are asking</h2>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-sand-700">
            <li>You never have to pay anything to receive a gift. Ever.</li>
            <li>
              Never send money back to a donor who says they overpaid. That is aimed at you, and
              it is the most common way people in your position lose money.
            </li>
            <li>
              Never share a bank login, card number, security code, or Social Security number with
              a donor. Your payment handle is all anyone needs.
            </li>
            <li>Do not share your address, your workplace, or where you are staying.</li>
            <li>
              You can have your request removed at any time, for any reason, without explaining.
              Same day.
            </li>
            <li>You are not obliged to reply to anyone, thank anyone, or account for anything.</li>
          </ul>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">Reporting, and taking things down</h2>
        <p className="mt-2 leading-relaxed text-sand-700">
          If a request looks wrong, if someone is behaving badly, or if you simply want your own
          request gone — tell us. Removal requests are honoured the same day and we do not ask you
          to justify one. If there is any real doubt about a request, it comes down first and gets
          looked at afterwards.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {formReady(FORMS.reportConcern) ? (
            <ExternalLink
              href={FORMS.reportConcern}
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
            >
              Report a problem
            </ExternalLink>
          ) : null}
          <a
            href={mailto(
              "Kindly — reporting a problem",
              "What I want to report:\n\n\nWhich request (link or title):\n\n\nAnything else that would help:\n\n",
            )}
            className="inline-flex items-center justify-center rounded-full border border-sand-300 bg-white px-6 py-3 text-base font-semibold text-ink transition hover:bg-sand-50"
          >
            Email {SITE.contactEmail}
          </a>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">What this site stores about you</h2>
        <ul className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed text-sand-700">
          <li>
            <strong className="text-ink">If you are browsing:</strong> when someone presses
            &ldquo;I want to help&rdquo;, we record which request, the amount, the date, and a
            random identifier for your browser. No name, no email, no payment details, no
            location, no advertising trackers.
          </li>
          <li>
            <strong className="text-ink">If you posted a request:</strong> what appears on the site
            is what you agreed to publish. Your video is not published unless you asked for it to
            be. We never publish your full name or address.
          </li>
          <li>
            <strong className="text-ink">Contact handles are lightly scrambled in the page,</strong>{" "}
            which keeps them away from the bots that harvest static sites. That is a speed bump,
            not protection — anyone determined can read them, and we would rather say so than
            imply a safety that does not exist.
          </li>
        </ul>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">The limits, plainly</h2>
        <div className="card mt-4 p-6 text-sm leading-relaxed text-sand-700">
          <p className="mb-3">
            {SITE.name} is a noticeboard. It is not a bank, a charity, a payment processor, an
            escrow service, or a party to any transfer made between two people who find each other
            here. It holds no money at any point.
          </p>
          <p className="mb-3">
            Requests are reviewed in good faith using the four checks described above, and requests
            are capped at {usd(MIN_ASK_USD)}&ndash;{usd(MAX_ASK_USD)} to keep any single loss
            small. That is a real reduction in risk and it is not a guarantee of anything. Any
            money you send is sent at your own discretion and your own risk, and cannot be
            recovered, reversed or refunded by us.
          </p>
          <p className="mb-3">
            Gifts made through {SITE.name} are personal gifts between individuals. They are not
            tax-deductible, {SITE.name} is not a registered charity, and no receipt is issued.
          </p>
          <p>
            If you believe someone has committed fraud, report it to us and also to your payment
            app and to law enforcement — we will help where we can and we will remove a listing
            immediately, but we have no power to recover funds.
          </p>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <Callout title="If you need help today" tone="pending">
          {SITE.name} is deliberately slow — a request is reviewed before it appears, and nobody is
          obliged to answer it. If you need shelter, food, utilities or rent help now, call{" "}
          <ExternalLink
            href="https://www.211colorado.org/"
            className="font-semibold underline underline-offset-2"
          >
            211 Colorado
          </ExternalLink>{" "}
          or dial 2-1-1. Use this site alongside real services, never instead of them.{" "}
          <Link to="/ask" className="font-semibold underline underline-offset-2">
            Posting a request
          </Link>{" "}
          should never be your only plan.
        </Callout>
      </section>
    </div>
  );
}
