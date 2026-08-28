import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { SITE } from "../config";
import { ExternalLink } from "./ui";

const NAV = [
  { to: "/requests", label: "Requests" },
  { to: "/ask", label: "Ask for help" },
  { to: "/safety", label: "Safety" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="One Small Ask, home">
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-cream"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12 20.5S3.5 14.9 3.5 9.9C3.5 7.2 5.7 5 8.4 5c1.7 0 3.1.9 3.6 2 .5-1.1 1.9-2 3.6-2 2.7 0 4.9 2.2 4.9 4.9 0 5-8.5 10.6-8.5 10.6z" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">
        {SITE.name}
      </span>
    </Link>
  );
}

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-100 text-brand-800" : "text-sand-700 hover:bg-sand-100 hover:text-ink"
  }`;
}

export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-sand-200 bg-cream/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="rounded-full border border-sand-300 bg-white px-3 py-2 text-sm font-semibold text-ink lg:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="border-t border-sand-200 bg-cream lg:hidden"
          >
            <div className="container-page flex flex-col py-2">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className={navClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="mt-20 border-t border-sand-200 bg-white">
        <div className="container-page py-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr,1fr,1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-700">
                People post one small, specific thing they need. Anyone who wants to help reaches
                them directly and sends it themselves. {SITE.name} never touches the money.
              </p>
            </div>

            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-sand-500">
                Explore
              </div>
              <ul className="space-y-2 text-sm">
                {NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sand-700 underline-offset-2 hover:text-ink hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-sand-500">
                If you need help now
              </div>
              <p className="text-sm leading-relaxed text-sand-700">
                {SITE.name} is slow by design — a request is reviewed before it appears, and there
                is no guarantee anyone answers it. If you need shelter, food, or help tonight, call{" "}
                <ExternalLink
                  href="https://www.211colorado.org/"
                  className="font-semibold text-brand-700 underline underline-offset-2"
                >
                  211
                </ExternalLink>{" "}
                or dial 2-1-1. They can act today; we cannot.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-3 border-t border-sand-200 pt-6 text-xs leading-relaxed text-sand-600">
            <p>
              <strong className="text-sand-800">{SITE.name} never handles money.</strong> There is
              no payment form on this site and no account holding funds. Money goes directly from
              one person to another, on an app they choose, and {SITE.name} is not a party to it —
              which also means we cannot reverse, refund, or recover a payment.
            </p>
            <p>
              <strong className="text-sand-800">Review is not a guarantee.</strong> Every request
              is checked before it appears, and that meaningfully reduces risk without eliminating
              it. Send only what you are prepared to lose, and read the{" "}
              <Link to="/safety" className="underline underline-offset-2">
                safety page
              </Link>{" "}
              before you send anything.
            </p>
            <p>
              {SITE.name} is an independent project, not a registered charity. Gifts made through
              it are personal gifts and are not tax-deductible. Questions, concerns and removal
              requests:{" "}
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="underline underline-offset-2"
              >
                {SITE.contactEmail}
              </a>
              .
            </p>
            <p className="pt-2 text-sand-500">
              &copy; {new Date().getFullYear()} {SITE.name}. Built in Colorado.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
