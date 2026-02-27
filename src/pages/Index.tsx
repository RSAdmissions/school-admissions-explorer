import { useState } from "react";
import CatchmentMap from "@/components/CatchmentMap";
import EligibilityForm from "@/components/EligibilityForm";
import type { CatchmentResult } from "@/components/CatchmentMap";

const Index = () => {
  const [catchmentResult, setCatchmentResult] = useState<CatchmentResult | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground">
              Reading School
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              Admissions Catchment & Eligibility Tool
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground font-body uppercase tracking-[0.15em] hidden sm:block">
            Est. 1125
          </span>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Map Section */}
        <section>
          <div className="mb-5">
            <p className="section-heading">Step 1</p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
              Explore Catchment Areas
            </h2>
            <p className="text-sm text-muted-foreground font-body max-w-xl">
              Search your address to see which categories you may fall under. Toggle layers on the map to explore boundaries.
            </p>
          </div>
          <CatchmentMap onResult={setCatchmentResult} />
        </section>

        {/* Eligibility Section */}
        <section>
          <div className="mb-5">
            <p className="section-heading">Step 2</p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-1">
              Check Your Eligibility
            </h2>
            <p className="text-sm text-muted-foreground font-body max-w-xl">
              Answer a few questions to find out which admission categories apply to your child.
            </p>
          </div>
          <EligibilityForm catchmentResult={catchmentResult} />
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-[11px] text-muted-foreground font-body">
          This tool provides indicative information only. Please refer to the official Reading School admissions policy.
        </p>
      </footer>
    </div>
  );
};

export default Index;
