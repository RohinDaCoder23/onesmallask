import { Link } from "react-router-dom";
import type { HelpRequest } from "../types";
import { CATEGORIES } from "../types";
import { longDate, usd } from "../lib/format";
import { useContactReveal } from "./ContactContext";
import { Badge, Button } from "./ui";

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** The badge that carries the trust signal on every card. */
export function VerifiedBadge() {
  return (
    <Badge tone="success" className="whitespace-nowrap">
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 1.5l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.6 1 2.6-2.2 1.6-.9 2.6-2.7-.2L10 18.5l-2.2-1.6-2.7.2-.9-2.6-2.2-1.6 1-2.6-1-2.6 2.2-1.6.9-2.6 2.7.2L10 1.5zm3.6 6.3l-1.1-1.1-3.3 3.3-1.7-1.7-1.1 1.1 2.8 2.8 4.4-4.4z"
          clipRule="evenodd"
        />
      </svg>
      Video verified
    </Badge>
  );
}

export function RequestCard({
  request,
  source,
  compact = false,
}: {
  request: HelpRequest;
  source: string;
  compact?: boolean;
}) {
  const { openContact } = useContactReveal();

  return (
    <article className="card card-hover flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-3xl leading-none text-brand-800">
          {usd(request.amountUsd)}
        </span>
        <Badge tone="brand">{categoryLabel(request.category)}</Badge>
      </div>

      <h3 className="mt-3 text-lg leading-snug">
        <Link
          to={`/requests/${request.id}`}
          className="underline-offset-2 hover:text-brand-700 hover:underline"
        >
          {request.title}
        </Link>
      </h3>

      <p className="mt-1 text-sm text-sand-600">
        {request.name} · {request.area}
      </p>

      <p
        className={`mt-3 flex-1 text-sm leading-relaxed text-sand-700 ${
          compact ? "line-clamp-4" : ""
        }`}
      >
        {request.story}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VerifiedBadge />
        <span className="text-xs text-sand-500">
          Reviewed {longDate(request.review.reviewedOn)}
        </span>
      </div>

      <Button className="mt-5 w-full" onClick={() => openContact(request, source)}>
        I want to help
      </Button>
    </article>
  );
}
