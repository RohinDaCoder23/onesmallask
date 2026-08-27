import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ContactProvider } from "./components/ContactContext";
import { flushQueue } from "./lib/tracking";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  document.body.innerHTML =
    '<p style="font-family:system-ui;padding:2rem">Kindly could not start: #root is missing.</p>';
} else {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary area="app">
        {/*
          HashRouter, not BrowserRouter, and on purpose. GitHub Pages serves
          static files only: with real paths, /needs is a 404 until you add a
          redirect hack, and a wrong base path renders a blank white page. Hash
          routing needs no server rules, so this exact build works at
          username.github.io/kindly, at a custom domain, on Netlify, or opened
          from disk. Deep links and shared URLs never break.
        */}
        <HashRouter
          // Opt in to React Router v7 behaviour now: silences the startup
          // warnings and means a future upgrade is not a breaking change.
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ContactProvider>
            <App />
          </ContactProvider>
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>,
  );
}

// Retry any contact reveals a previous visit could not send. Failure is silent by
// design — this must never block or surface to a donor.
void flushQueue();
