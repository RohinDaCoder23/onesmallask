import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Shown in the fallback so a crash names the area it happened in. */
  area?: string;
}

interface State {
  error: Error | null;
}

/**
 * Wraps the whole app and each page. A thrown render error shows a readable
 * recovery card instead of a white screen — the failure mode that makes a
 * static site look dead.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(`[onesmallask] render error in ${this.props.area ?? "app"}`, error, info);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-xl">Something on this page broke</h1>
          <p className="mt-3 text-sm leading-relaxed text-sand-700">
            The rest of One Small Ask still works. You can reload, or go back to the needs list — and
            you can always give directly on any organization&rsquo;s own website.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="inline-flex items-center justify-center rounded-full border border-sand-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-sand-50"
            >
              Try again
            </button>
            <a
              href="./"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Reload One Small Ask
            </a>
          </div>
          <p className="mt-6 break-words text-left text-xs text-sand-500">
            {error.name}: {error.message}
          </p>
        </div>
      </div>
    );
  }
}
