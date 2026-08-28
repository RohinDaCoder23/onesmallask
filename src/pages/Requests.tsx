import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, type Category } from "../types";
import { openRequests } from "../data/requests";
import { RequestCard } from "../components/Cards";
import { Callout, EmptyState, InternalLinkButton, SectionHeading } from "../components/ui";

const SOURCE = "/requests";
type Filter = Category | "all";

const CHIPS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: "all", label: "Everything" },
  ...CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
];

export default function Requests() {
  const [filter, setFilter] = useState<Filter>("all");
  const all = openRequests();

  const results = useMemo(
    () => (filter === "all" ? all : all.filter((r) => r.category === filter)),
    [filter, all],
  );

  return (
    <div className="container-page py-12">
      <SectionHeading
        eyebrow="Open requests"
        title="One small thing, asked for directly"
        lead="Every request here was reviewed before it appeared: a ten-second video of the person, a reverse-image check on any photo, one detail corroborated, and a screen against everything submitted before. You reach them yourself and send it yourself — One Small Ask is never in the middle of the money."
      />

      <div className="mt-6">
        <Callout title="Read this before you send anything" tone="pending">
          Payments between people are irreversible and carry no buyer protection. Review reduces
          risk; it does not remove it. Send only what you would be fine losing, never send money
          back to anyone who says they were overpaid, and never use a handle other than the one
          shown here.{" "}
          <Link to="/safety" className="font-semibold underline underline-offset-2">
            The full safety page is worth two minutes.
          </Link>
        </Callout>
      </div>

      {all.length > 0 ? (
        <div
          className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by category"
        >
          {CHIPS.map((c) => {
            const active = filter === c.id;
            const count = c.id === "all" ? all.length : all.filter((r) => r.category === c.id).length;
            if (c.id !== "all" && count === 0) return null;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                aria-pressed={active}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-sand-300 bg-white text-ink hover:bg-sand-50"
                }`}
              >
                {c.label}
                <span className={active ? "text-brand-100" : "text-sand-500"}> {count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {all.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No open requests right now">
            <p className="mb-4">
              That is the real answer, not a loading state. Nothing is listed here until a person
              has sent a video, had it watched, and been through the rest of the review — so an
              empty page means nobody has cleared that yet, and we would rather show you nothing
              than invent someone.
            </p>
            <p className="mb-5">
              If you are the person who needs something, this is a good moment to be first.
            </p>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <InternalLinkButton to="/ask">Ask for help</InternalLinkButton>
              <InternalLinkButton to="/safety" variant="secondary">
                How review works
              </InternalLinkButton>
            </div>
          </EmptyState>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Nothing open in that category">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              Show everything
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-sand-600" role="status">
            {results.length} open {results.length === 1 ? "request" : "requests"}
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <RequestCard key={r.id} request={r} source={SOURCE} compact />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
