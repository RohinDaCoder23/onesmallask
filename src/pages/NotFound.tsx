import { useLocation } from "react-router-dom";
import { InternalLinkButton } from "../components/ui";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="container-page py-20">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <div className="font-display text-5xl text-brand-800">404</div>
        <h1 className="mt-4 text-2xl">That page isn&rsquo;t here</h1>
        <p className="mt-3 text-sm leading-relaxed text-sand-700">
          Nothing exists at <code className="break-all text-sand-800">{pathname}</code>. The link
          may be old, or an organization may have asked for its listing to be removed.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <InternalLinkButton to="/needs">Browse what&rsquo;s needed</InternalLinkButton>
          <InternalLinkButton to="/" variant="secondary">
            Go home
          </InternalLinkButton>
        </div>
      </div>
    </div>
  );
}
