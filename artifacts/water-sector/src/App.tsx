import { SpendingGapsSection } from "@/pages/SpendingGapsSection";

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--econ-paper)" }}>
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-4">
        <SpendingGapsSection />
      </main>
    </div>
  );
}

export default App;
