import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ImpactData } from "../types";
import {
  downloadCsv,
  loadImpact,
  localReveals,
  revealsToCsv,
  trackingConfigured,
} from "../lib/tracking";
import { longDate, num, shortDate, usd } from "../lib/format";
import { SITE } from "../config";
import { Badge, Button, Callout, EmptyState, SectionHeading, Skeleton } from "../components/ui";

/** brand-600. Validated against the white card surface: lightness band, chroma
 *  floor and 3:1 contrast all pass. Single series, so no categorical palette. */
const BAR = "#1f7d57";

function emptyData(): ImpactData {
  return {
    totals: {
      requestsReviewed: 0,
      requestsPublished: 0,
      contactReveals: 0,
      confirmedGifts: 0,
      confirmedUsd: 0,
      firstRevealTs: null,
      lastRevealTs: null,
    },
    confirmed: [],
    source: "snapshot",
    generatedOn: null,
  };
}

function SourceBadge({ data }: { data: ImpactData }) {
  if (data.source === "live") return <Badge tone="success">Live</Badge>;
  if (data.source === "local") return <Badge tone="pending">This device only</Badge>;
  return <Badge tone="sand">Saved snapshot</Badge>;
}

export default function Impact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [mine, setMine] = useState(0);

  useEffect(() => {
    let alive = true;
    loadImpact()
      .then((r) => alive && setData(r))
      // loadImpact is written not to reject; this is belt-and-braces so the
      // page can never sit on a spinner forever.
      .catch(() => alive && setData(emptyData()));
    setMine(localReveals().length);
    return () => {
      alive = false;
    };
  }, []);

  /** Confirmed gifts grouped by month, for the one chart on this page. */
  const byMonth = useMemo(() => {
    if (!data || data.confirmed.length === 0) return [];
    const map = new Map<string, { month: string; usd: number; count: number }>();
    for (const c of data.confirmed) {
      const key = (c.matched_on || "").slice(0, 7);
      if (key.length !== 7) continue;
      const cur = map.get(key) ?? { month: key, usd: 0, count: 0 };
      cur.usd += Number(c.amount_usd) || 0;
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  const maxMonth = Math.max(1, ...byMonth.map((m) => m.usd));

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Impact"
        title="Two numbers, kept strictly apart"
        lead={`${SITE.name} hands you a way to reach someone and stops there — it cannot see a payment happen. So there are two figures here and they never get blended: how many times someone asked how to help, and how many gifts BOTH people confirmed. Only the second one is money.`}
      />

      {!data ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <SourceBadge data={data} />
            {data.source === "snapshot" && data.generatedOn ? (
              <span className="text-xs text-sand-600">
                Committed {longDate(data.generatedOn)}
              </span>
            ) : null}
            {data.totals.lastRevealTs ? (
              <span className="text-xs text-sand-600">
                Most recent interest {shortDate(data.totals.lastRevealTs)}
              </span>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card border-brand-300 bg-brand-50 p-5">
              <div className="font-display text-4xl leading-none text-brand-800">
                {usd(data.totals.confirmedUsd)}
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">Confirmed by both people</div>
              <p className="mt-1 text-xs leading-relaxed text-sand-700">
                {data.totals.confirmedGifts > 0
                  ? `${num(data.totals.confirmedGifts)} gifts where the donor said they sent it AND the requester said they received it.`
                  : "The only figure here that is money. It stays at zero until a donor and a requester both confirm the same gift."}
              </p>
            </div>

            <div className="card p-5">
              <div className="font-display text-4xl leading-none text-brand-800">
                {num(data.totals.contactReveals)}
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">People asked how to help</div>
              <p className="mt-1 text-xs leading-relaxed text-sand-700">
                Someone read the safety screen and was shown how to reach a requester. This is{" "}
                <strong>not</strong> money — plenty of people look and don&rsquo;t send.
              </p>
            </div>

            <div className="card p-5">
              <div className="font-display text-4xl leading-none text-brand-800">
                {num(data.totals.requestsPublished)}
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">Requests published</div>
              <p className="mt-1 text-xs leading-relaxed text-sand-700">
                Requests that passed all four review checks and went live.
              </p>
            </div>

            <div className="card p-5">
              <div className="font-display text-4xl leading-none text-brand-800">
                {num(data.totals.requestsReviewed)}
              </div>
              <div className="mt-2 text-sm font-semibold text-ink">Requests reviewed</div>
              <p className="mt-1 text-xs leading-relaxed text-sand-700">
                Everything submitted, including what was turned down. Published divided by this is
                the approval rate, and we publish both.
              </p>
            </div>
          </div>

          {byMonth.length > 0 ? (
            <section className="mt-14">
              <h2 className="text-2xl">Confirmed gifts by month</h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-sand-700">
                Only gifts both people confirmed.
              </p>
              <div className="card mt-6 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <caption className="sr-only">
                    Confirmed gift value by month, oldest first
                  </caption>
                  <thead>
                    <tr className="border-b border-sand-200 text-left text-xs uppercase tracking-wide text-sand-600">
                      <th scope="col" className="px-5 py-3 font-semibold">Month</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Confirmed</th>
                      <th scope="col" className="px-5 py-3 text-right font-semibold">Gifts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMonth.map((m) => (
                      <tr key={m.month} className="border-b border-sand-100 last:border-0">
                        <th scope="row" className="px-5 py-3 text-left font-semibold text-ink">
                          {longDate(`${m.month}-01`).replace(/ \d+,/, "")}
                        </th>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-3 flex-1 rounded-r-[4px] bg-sand-100">
                              <div
                                className="h-3 rounded-r-[4px]"
                                style={{
                                  width: `${Math.max(2, (m.usd / maxMonth) * 100)}%`,
                                  backgroundColor: BAR,
                                }}
                              />
                            </div>
                            <span className="w-20 shrink-0 text-right font-semibold tabular-nums text-ink">
                              {usd(m.usd)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-sand-700">
                          {num(m.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="mt-14">
              <EmptyState title="No confirmed gifts yet">
                A gift appears here only when the donor confirms they sent it and the requester
                confirms they received it. One side alone is never enough, so this stays empty
                until a real pair matches — and nothing is estimated to fill it.{" "}
                <Link
                  to="/requests"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  See what&rsquo;s open
                </Link>
                .
              </EmptyState>
            </section>
          )}

          <section className="mt-14 grid gap-5 lg:grid-cols-2">
            <Callout title="Why a gift needs two confirmations">
              <p className="mb-3">
                {SITE.name} is not part of the payment, so we have no receipt, no webhook, and no
                way to look. The only honest evidence available is two independent people saying
                the same thing happened.
              </p>
              <p>
                One side alone would be weaker in an obvious way: the person who received the money
                has every reason to confirm, and the person who sent it is the only one who can
                corroborate the amount. So we require both, and a gift stays uncounted until we get
                them.
              </p>
            </Callout>

            <Callout title="What we record, and what we don't" tone="pending">
              <p className="mb-3">
                When someone presses &ldquo;I want to help&rdquo; we store one row: which request,
                the amount, the date, and a random id for that browser. No name, no email, no
                payment details, no location, no third-party analytics or advertising trackers
                anywhere on this site.
              </p>
              <p>
                {trackingConfigured
                  ? "Rows go to a database that this site's public key can only write to, never read. The aggregate figures above are the only thing it can read back."
                  : "The live database is not configured on this build, so these are the figures committed to the repository. Nothing is invented to fill the gap."}
              </p>
            </Callout>
          </section>

          {mine > 0 ? (
            <section className="mt-10">
              <div className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-ink">
                      {num(mine)} {mine === 1 ? "request" : "requests"} you asked about from this
                      browser
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-sand-600">
                      Kept on your own device so nothing is lost if the network drops. Yours to
                      export, and it never leaves this browser unless the database is configured.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      downloadCsv("kindly-my-activity.csv", revealsToCsv(localReveals()))
                    }
                  >
                    Export (CSV)
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
