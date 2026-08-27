import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Requests from "./pages/Requests";
import RequestDetail from "./pages/RequestDetail";
import Ask from "./pages/Ask";
import Safety from "./pages/Safety";
import Impact from "./pages/Impact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

/** Each page gets its own boundary so one broken page cannot take down the shell. */
function Page({ area, children }: { area: string; children: React.ReactNode }) {
  return <ErrorBoundary area={area}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Page area="landing"><Landing /></Page>} />
        <Route path="/requests" element={<Page area="requests"><Requests /></Page>} />
        <Route
          path="/requests/:requestId"
          element={<Page area="request-detail"><RequestDetail /></Page>}
        />
        <Route path="/ask" element={<Page area="ask"><Ask /></Page>} />
        <Route path="/safety" element={<Page area="safety"><Safety /></Page>} />
        <Route path="/impact" element={<Page area="impact"><Impact /></Page>} />
        <Route path="/about" element={<Page area="about"><About /></Page>} />

        {/* Friendly aliases so a mistyped or older link still lands somewhere real. */}
        <Route path="/needs" element={<Navigate to="/requests" replace />} />
        <Route path="/browse" element={<Navigate to="/requests" replace />} />
        <Route path="/post" element={<Navigate to="/ask" replace />} />
        <Route path="/help" element={<Navigate to="/ask" replace />} />
        <Route path="/request" element={<Navigate to="/ask" replace />} />

        <Route path="*" element={<Page area="not-found"><NotFound /></Page>} />
      </Routes>
    </Layout>
  );
}
