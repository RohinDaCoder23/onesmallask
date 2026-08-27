import { forwardRef, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 border border-transparent",
  secondary:
    "bg-white text-ink hover:bg-sand-50 active:bg-sand-100 border border-sand-300",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50 border border-transparent",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function buttonClass(variant: Variant = "primary", size: Size = "md"): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]}`;
}

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${buttonClass(variant, size)} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export function InternalLinkButton({
  to,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return (
    <Link to={to} className={`${buttonClass(variant, size)} ${className}`}>
      {children}
    </Link>
  );
}

/** Every outbound link on the site goes through here: new tab, noopener. */
export function ExternalLink({
  href,
  children,
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer external"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

const TONE: Record<string, string> = {
  brand: "bg-brand-100 text-brand-800 border-brand-200",
  sand: "bg-sand-100 text-sand-800 border-sand-200",
  info: "bg-info-bg text-info-fg border-blue-200",
  pending: "bg-pending-bg text-pending-fg border-amber-200",
  success: "bg-success-bg text-success-fg border-green-200",
};

export function Badge({
  children,
  tone = "sand",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof TONE;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        TONE[tone] ?? TONE.sand
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="font-display text-3xl leading-none text-brand-800 sm:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{label}</div>
      {hint ? <div className="mt-1 text-xs leading-relaxed text-sand-600">{hint}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow ? (
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      {lead ? <p className="mt-3 leading-relaxed text-sand-700">{lead}</p> : null}
    </div>
  );
}

export function Callout({
  title,
  tone = "sand",
  children,
}: {
  title?: string;
  tone?: keyof typeof TONE;
  children: ReactNode;
}) {
  const border =
    tone === "brand"
      ? "border-brand-200 bg-brand-50"
      : tone === "pending"
        ? "border-amber-200 bg-pending-bg"
        : tone === "info"
          ? "border-blue-200 bg-info-bg"
          : "border-sand-200 bg-sand-50";
  return (
    <div className={`rounded-xl2 border p-5 ${border}`}>
      {title ? <div className="mb-1.5 text-sm font-bold text-ink">{title}</div> : null}
      <div className="text-sm leading-relaxed text-sand-800">{children}</div>
    </div>
  );
}

/**
 * Renders an organization's own wording plus a link to the page it is on.
 * Every dollar claim on the site is wrapped in one of these.
 */
export function SourceNote({
  quote,
  url,
  verifiedOn,
}: {
  quote: string;
  url: string;
  verifiedOn: string;
}) {
  return (
    <div className="mt-3 border-l-2 border-sand-300 pl-3 text-xs leading-relaxed text-sand-600">
      <span className="italic">&ldquo;{quote}&rdquo;</span>{" "}
      <ExternalLink
        href={url}
        className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
      >
        Source
      </ExternalLink>
      <span className="text-sand-500"> · checked {verifiedOn}</span>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="card p-10 text-center">
      <div className="font-display text-lg text-ink">{title}</div>
      {children ? (
        <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sand-600">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-sand-100 ${className}`} aria-hidden />;
}
