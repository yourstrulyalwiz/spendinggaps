import { SpendingGapsSection } from "@/pages/SpendingGapsSection";
import { BudgetExecutionSection } from "@/pages/BudgetExecutionSection";

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--econ-paper)" }}>
      {/* Site header */}
      <header className="border-b-4" style={{ borderColor: "var(--econ-red)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "var(--econ-red)", fontFamily: "var(--app-font-heading)" }}>
            Water &amp; Sanitation · Special Report
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-4 space-y-8">
        <SpendingGapsSection />
        <div className="econ-section-rule pt-6">
          <BudgetExecutionSection />
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-3 mt-4 border-t" style={{ borderColor: "var(--econ-rule)" }} />
    </div>
  );
}

export default App;
