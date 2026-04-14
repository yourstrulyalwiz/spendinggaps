import { lazy, Suspense } from "react";

const SpendingGapsSection = lazy(() =>
  import("@/pages/SpendingGapsSection").then((m) => ({
    default: m.SpendingGapsSection,
  }))
);

function MapFallback() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ height: 490, background: "#f8f5f0", borderRadius: 2 }}
    >
      <p style={{ color: "#6b7280", fontFamily: "Nunito, sans-serif", fontSize: 14 }}>
        Loading map…
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--econ-paper)" }}>
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-4">
        <Suspense fallback={<MapFallback />}>
          <SpendingGapsSection />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
