import CatchmentMap from "@/components/CatchmentMap";
import EligibilityForm from "@/components/EligibilityForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight">Reading School</h1>
            <p className="text-sm text-muted-foreground font-body">Admissions Catchment & Eligibility Tool</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground font-body uppercase tracking-wider">Est. 1125</span>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Map Section */}
        <section>
          <p className="section-heading">Catchment Area Map</p>
          <h2 className="text-3xl font-heading font-bold mb-2">Catchment Areas</h2>
          <p className="text-sm text-muted-foreground font-body mb-6 max-w-2xl">
            Search for your address to see which admission categories you may be eligible for.
            The blue circle shows the 4.6 mile radius from Reading School's Erleigh Road gate (Category 3).
          </p>
          <CatchmentMap />
        </section>

        {/* Form Section */}
        <section>
          <p className="section-heading">Admissions Eligibility</p>
          <h2 className="text-3xl font-heading font-bold mb-2">Check Your Eligibility</h2>
          <p className="text-sm text-muted-foreground font-body mb-6 max-w-2xl">
            Complete the form below to see which admission category or categories your child may be eligible for,
            along with indicative place availability.
          </p>
          <EligibilityForm />
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground font-body">
        This tool provides indicative information only. Please refer to the official Reading School admissions policy.
      </footer>
    </div>
  );
};

export default Index;
