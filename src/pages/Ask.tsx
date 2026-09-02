import { Link } from "react-router-dom";
import { EXAMPLE_REQUEST } from "../data/requests";
import { MAX_ASK_USD, MIN_ASK_USD, CONTACT_METHODS } from "../types";
import { FORMS, SITE, formReady } from "../config";
import { usd } from "../lib/format";
import { Badge, Callout, ExternalLink, SectionHeading } from "../components/ui";

const NEEDED = [
  {
    title: "One specific thing, between $5 and $100",
    body: `Not "help with bills" — "$38 for my electric bill so it isn't shut off Thursday." The more exact it is, the more likely someone answers it. Asks over ${usd(MAX_ASK_USD)} are outside what this site is for.`,
  },
  {
    title: "A ten-second video of you saying what it's for",
    body: "Filmed on your phone, in one take, no editing. This is the check that makes the whole site work, and there is no way around it. It goes to review only — it is not published unless you tick the box saying you want it to be.",
  },
  {
    title: "A first name, and your city or area",
    body: "A first name or any name you want to go by. Never your full legal name, never your address. If you are staying somewhere, do not name the place.",
  },
  {
    title: "One way to be paid",
    body: `A ${Object.values(CONTACT_METHODS).map((m) => m.label).join(", ")} handle. It is shown to someone only after they read the safety screen and say they intend to help.`,
  },
  {
    title: "One detail we can check",
    body: "The clinic, the employer, the school, the landlord, the fee. We confirm one checkable thing before publishing — it is what separates a real ask from a made-up one, and it protects the people who do post honestly.",
  },
];

const RULES = [
  "You must be 18 or older. There is no exception to this one, and we will ask.",
  "One open request at a time. When it is met or expires, you can post again.",
  "Never send money to anyone who contacts you first, for any reason. Nobody has to pay a fee to receive a gift.",
  "If a donor says they overpaid and asks for some back, do not send it. That is a scam and it is aimed at you. Tell us instead.",
  "Never share a bank login, card number, security code, or Social Security number with anyone. No genuine donor will ask.",
];

export default function Ask() {
  const open = formReady(FORMS.submitRequest);

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Ask for help"
        title="One small thing you need, in your own words"
        lead={`${SITE.name} is for a single, specific ask between ${usd(MIN_ASK_USD)} and ${usd(MAX_ASK_USD)} — the kind of gap that is genuinely solvable and that someone reading it can picture. It is reviewed before it appears, and if someone decides to help, they contact you and send it to you directly. Nothing passes through us.`}
      />

      <div className="mt-8">
        {open ? (
          <ExternalLink
            href={FORMS.submitRequest}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
          >
            Start a request
          </ExternalLink>
        ) : (
          <Callout title="Requests aren't open yet" tone="pending">
            The submission form is not live yet. When it is, this is where it will be. In the
            meantime, if you need shelter, food or help today, call{" "}
            <ExternalLink
              href="https://www.211colorado.org/"
              className="font-semibold underline underline-offset-2"
            >
              211
            </ExternalLink>{" "}
            or dial 2-1-1 — they can act now, and this site cannot.
          </Callout>
        )}
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">What you&rsquo;ll need</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {NEEDED.map((n) => (
            <div key={n.title} className="card p-5">
              <h3 className="text-base font-bold text-ink">{n.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-700">{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">What a good request looks like</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sand-700">
          This is an invented example, not a real person — it is here to show the shape, not to
          fill the site up.
        </p>

        <div className="mt-5 max-w-xl">
          <article className="card border-dashed p-5">
            <div className="mb-3">
              <Badge tone="sand">Example only — not a real request</Badge>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-3xl leading-none text-brand-800">
                {usd(EXAMPLE_REQUEST.amountUsd)}
              </span>
              <Badge tone="brand">Work</Badge>
            </div>
            <h3 className="mt-3 text-lg leading-snug">{EXAMPLE_REQUEST.title}</h3>
            <p className="mt-1 text-sm text-sand-600">
              {EXAMPLE_REQUEST.name} · {EXAMPLE_REQUEST.area}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-sand-700">{EXAMPLE_REQUEST.story}</p>
            <p className="mt-3 text-sm leading-relaxed text-sand-700">
              <strong className="text-ink">For:</strong> {EXAMPLE_REQUEST.forWhat}
            </p>
          </article>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-sand-700">
          Notice what makes it work: one thing, an exact amount, a reason it is urgent, a checkable
          detail, and an end to it. &ldquo;Once I am working I am fine&rdquo; is the sentence that
          makes a stranger want to close the gap.
        </p>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">Rules, and the ones that protect you</h2>
        <div className="card mt-5 p-6">
          <ul className="space-y-3.5">
            {RULES.map((r) => (
              <li key={r} className="flex gap-3 text-sm leading-relaxed text-sand-800">
                <span aria-hidden className="mt-0.5 font-bold text-brand-600">
                  •
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-sand-700">
          The last three are there because in peer-to-peer giving the person asking is targeted at
          least as often as the person giving. Read the{" "}
          <Link to="/safety" className="font-semibold text-brand-700 underline underline-offset-2">
            safety page
          </Link>{" "}
          before you post.
        </p>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">What happens after you submit</h2>
        <ol className="mt-5 space-y-4">
          {[
            ["Your request goes to review, not to the site.", "Nothing you send appears anywhere until a person has read it and watched your video. Submitting is not publishing."],
            ["We check four things.", "The video, any photo, one detail in your story, and whether it matches anything submitted before. Usually a day or two."],
            ["If it is published, you will hear from us with the link.", "If it is not, you will hear that too, with the reason. We do not leave people wondering."],
            ["Someone who wants to help reaches you directly.", "They read a safety screen, then see your handle. They send it to you themselves — it never passes through us, so there is nothing for us to take a cut of and nothing for us to lose."],
            ["Both of you confirm.", "When you have received something, you tell us on your own request page \u2014 there is an \u201cI received it\u201d button on it \u2014 and the donor tells us too. Only gifts confirmed by both sides are ever counted anywhere on this site."],
          ].map(([head, body], i) => (
            <li key={head} className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-800">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-bold text-ink">{head}</div>
                <div className="mt-0.5 text-sm leading-relaxed text-sand-700">{body}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 max-w-3xl">
        <Callout title="Being honest about what this is" tone="brand">
          <p className="mb-3">
            {SITE.name} is small and slow. A request might sit unanswered — there is no fund behind
            it, no guarantee anyone reads yours, and no promise of a timeline. It is a noticeboard,
            not a service.
          </p>
          <p>
            If what you need is urgent, please do not wait on this. Call{" "}
            <ExternalLink
              href="https://www.211colorado.org/"
              className="font-semibold underline underline-offset-2"
            >
              211
            </ExternalLink>{" "}
            or dial 2-1-1 for shelter, food, utilities and rent assistance in Colorado. Use this
            alongside that, not instead of it.
          </p>
        </Callout>
      </section>
    </div>
  );
}
