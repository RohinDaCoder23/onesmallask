import { Link } from "react-router-dom";
import { openRequests, REVIEW_STANDARD } from "../data/requests";
import { MAX_ASK_USD, MIN_ASK_USD } from "../types";
import { usd } from "../lib/format";
import { SITE } from "../config";
import { RequestCard } from "../components/Cards";
import { InternalLinkButton, SectionHeading } from "../components/ui";

const STEPS = [
  {
    n: "1",
    title: "Someone asks for one specific thing",
    body: `A single, concrete gap between ${usd(MIN_ASK_USD)} and ${usd(MAX_ASK_USD)} — boots for a job starting Monday, a prescription co-pay, an electric bill before it's shut off. In their own words, with a ten-second video of them saying it.`,
  },
  {
    n: "2",
    title: "It's reviewed before anyone sees it",
    body: "The video is watched, any photo is reverse-image searched, a detail in the story is corroborated, and the whole thing is screened against everything submitted before. Nothing is published automatically.",
  },
  {
    n: "3",
    title: "You reach them and send it yourself",
    body: `You read a short safety screen, then see how to contact them. You send it directly, on whatever app you both prefer. ${SITE.name} is never in the middle — no cut, no account, no funds held.`,
  },
];

export default function Landing() {
  const open = openRequests();

  return (
    <>
      <section className="bg-grain border-b border-sand-200">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700">
              Every request reviewed before it appears
            </div>
            <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
              Small asks, answered directly.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-700">
              People post one specific thing they need — under {usd(MAX_ASK_USD)}, in their own
              words, with a video of themselves saying it. If you want to help, you reach them and
              send it yourself.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-sand-700">
              <strong className="text-ink">{SITE.name} never touches the money.</strong> There is
              no payment form here, no account, and no cut taken. Which also means we cannot
              reverse a payment — so read the safety page before you send anything.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InternalLinkButton to="/requests" size="lg">
                See open requests
              </InternalLinkButton>
              <InternalLinkButton to="/ask" variant="secondary" size="lg">
                I need help with something
              </InternalLinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <SectionHeading eyebrow="How it works" title="Three steps, and the money isn't ours" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 font-display text-lg font-semibold text-brand-800">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sand-700">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {open.length > 0 ? (
        <section className="container-page py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Open right now"
              title="Someone is a small amount away from being fine"
            />
            <Link
              to="/requests"
              className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              See all {open.length} →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {open.slice(0, 3).map((r) => (
              <RequestCard key={r.id} request={r} source="/" compact />
            ))}
          </div>
        </section>
      ) : (
        <section className="container-page py-6">
          <div className="rounded-xl2 border border-sand-200 bg-white p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl">Nothing is open yet</h2>
              <p className="mt-4 leading-relaxed text-sand-800">
                Not a loading state — the honest answer. Nothing appears on {SITE.name} until a
                person has sent a video, had it watched, and cleared the rest of the review. Nobody
                has finished that yet.
              </p>
              <p className="mt-3 leading-relaxed text-sand-800">
                We could have filled this page with invented examples. We would rather you trusted
                the numbers on this site later, so it stays empty until it is genuinely not.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <InternalLinkButton to="/ask">Be the first to ask</InternalLinkButton>
                <InternalLinkButton to="/safety" variant="secondary">
                  How review works
                </InternalLinkButton>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Why you can take this seriously"
          title="Four checks, on every request, with no fast track"
          lead="This is the whole reason the site can exist. Anyone can put up a page asking strangers for money; the review is what separates this from that."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
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
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-sand-700">
          Review removes the easy fakes. It cannot read minds, and we say so plainly on the{" "}
          <Link to="/safety" className="font-semibold text-brand-700 underline underline-offset-2">
            safety page
          </Link>{" "}
          — along with the three scams that actually happen and how to spot them.
        </p>
      </section>

      <section className="container-page pb-20">
        <div className="rounded-xl2 border border-brand-200 bg-brand-50 p-8 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl">
              The gap between fine and not fine is often about forty dollars.
            </h2>
            <p className="mt-4 leading-relaxed text-sand-800">
              Not a crisis fund, not a campaign, not a percentage of a big round number. One
              person, one specific thing, one amount you would not miss.
            </p>
            <p className="mt-3 leading-relaxed text-sand-800">
              And because it goes straight from you to them, all of it arrives — no processing
              fee, no platform cut, nothing skimmed on the way.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <InternalLinkButton to="/requests" size="lg">
                See who&rsquo;s asking
              </InternalLinkButton>
              <InternalLinkButton to="/impact" variant="secondary" size="lg">
                What&rsquo;s actually happened so far
              </InternalLinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
