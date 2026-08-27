import { Link } from "react-router-dom";
import { MAX_ASK_USD, MIN_ASK_USD } from "../types";
import { usd } from "../lib/format";
import { SITE } from "../config";
import { ExternalLink, SectionHeading } from "../components/ui";

export default function About() {
  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="About"
        title={`What ${SITE.name} is, and the things it deliberately isn't`}
      />

      <div className="prose-kindly mt-8 max-w-2xl">
        <p>
          {SITE.name} is a noticeboard. Someone posts one specific thing they need — between{" "}
          {usd(MIN_ASK_USD)} and {usd(MAX_ASK_USD)}, in their own words, with a ten-second video of
          themselves saying it. It is reviewed before it appears. Anyone who wants to help reaches
          that person directly and sends the money themselves.
        </p>
        <p>
          That last part is the whole design. {SITE.name} is not in the middle of the payment, has
          no account holding funds, takes no percentage, and never sees a card number. What you
          send is what arrives.
        </p>

        <h2>Why it works this way</h2>
        <p>
          A site that collected donations and passed them on would have to hold other
          people&rsquo;s money, register as a charitable solicitor in most states, take a cut to
          cover processing, and be trusted with funds by people who had never heard of it. Every
          one of those is a reason for a project like this to quietly become something worse.
        </p>
        <p>
          Handing the two people a way to reach each other removes all of it at once. All of the
          money arrives. It arrives immediately. And nothing about {SITE.name} has to be trusted
          with funds, because it never has any.
        </p>
        <p>
          The cost of that choice is real and we do not hide it: we cannot reverse a payment, and
          we cannot see one happen. The{" "}
          <Link to="/safety">safety page</Link> is built around admitting that rather than papering
          over it, and the <Link to="/impact">impact page</Link> refuses to call anything money
          until two people independently confirm it.
        </p>

        <h2>Why the cap</h2>
        <p>
          Nothing above {usd(MAX_ASK_USD)}. That is not modesty — it is the main safety feature.
          A small cap keeps the loss small on the day something does go wrong, keeps the site out
          of the territory where money-transmission and charitable-solicitation rules start to
          apply, and keeps every request to the kind of concrete gap a stranger can actually
          picture closing.
        </p>
        <p>
          &ldquo;$45 for boots so I can start Monday&rdquo; gets answered. &ldquo;Help with my
          bills&rdquo; does not, and it never has.
        </p>

        <h2>How requests are reviewed</h2>
        <p>
          Nothing is published automatically, and there is no way to submit a request and have it
          appear. Every one is checked by a person first: the video is watched, any photo is
          reverse-image searched, one checkable detail in the story is corroborated, and the whole
          thing is screened against everything submitted before.
        </p>
        <p>
          Requests that fail get told why. Requests that raise doubt later come down first and get
          looked at afterwards. Removal is honoured the same day, without asking anyone to justify
          it. The full standard is on the <Link to="/safety">safety page</Link>, published as a
          promise rather than kept as an internal policy — which is the only version that means
          anything to somebody deciding whether to trust it.
        </p>

        <h2>What we will not do</h2>
        <ul>
          <li>Hold, process, or route anyone&rsquo;s money.</li>
          <li>Take a percentage, charge a fee, or run advertising.</li>
          <li>
            Collect government IDs, Social Security numbers, or bank account details from anyone.
            We could not secure them and we do not need them.
          </li>
          <li>Publish anybody&rsquo;s full legal name or address.</li>
          <li>Publish a request from anyone under 18.</li>
          <li>Publish a video someone did not explicitly agree to have published.</li>
          <li>Invent a request, an amount, or a figure to make the site look busier than it is.</li>
        </ul>

        <h2>Where it stands</h2>
        <p>
          Being straightforward about the stage this is at: it is new, it is small, and the numbers
          on the <Link to="/impact">impact page</Link> are whatever they honestly are, including
          zero. Those numbers are published from the first day precisely so that nobody has to
          wonder later whether the early ones were flattering.
        </p>

        <h2>If you need help</h2>
        <p>
          {SITE.name} is slow on purpose and nobody is obliged to answer a request. It is not a
          service and it cannot arrange shelter, food, or assistance. In Colorado, dial 2-1-1 or
          visit <ExternalLink href="https://www.211colorado.org/">211colorado.org</ExternalLink> to
          be connected to real services near you — use this alongside them, never instead.
        </p>

        <h2>Contact</h2>
        <p>
          Corrections, concerns, removal requests and questions all go to{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Reports about a specific
          request are read the day they arrive.
        </p>
      </div>
    </div>
  );
}
