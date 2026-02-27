import { useState } from "react";
import { MapPin, ClipboardCheck, ArrowRight, GraduationCap, Shield } from "lucide-react";
import CatchmentMap from "@/components/CatchmentMap";
import EligibilityForm from "@/components/EligibilityForm";
import type { CatchmentResult } from "@/components/CatchmentMap";

const Index = () => {
  const [screen, setScreen] = useState<"intro" | "tool">("intro");
  const [activeTab, setActiveTab] = useState<"map" | "eligibility">("map");
  const [catchmentResult, setCatchmentResult] = useState<CatchmentResult | null>(null);

  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-float-slow" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px] animate-float-slower" />
          <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px] animate-float-medium" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12">
          {/* Header badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-body font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Official Admissions Tool
            </div>
          </div>

          {/* Main title */}
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight mb-4">
              Reading School
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
              Explore catchment areas and check your child's admission eligibility
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="h-px w-12 bg-border" />
              <span className="text-[11px] text-muted-foreground font-body uppercase tracking-[0.2em]">Est. 1125</span>
              <span className="h-px w-12 bg-border" />
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="glass-card rounded-2xl p-6 group hover:border-primary/30 transition-all cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Search your address and instantly see which catchment categories apply. Visualise Category 3, 4 & 5 boundaries.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 group hover:border-primary/30 transition-all cursor-default">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">Eligibility Checker</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                Answer a few questions to find out which admission categories your child may qualify for, with indicative place numbers.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => setScreen("tool")}
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-body text-base font-semibold hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] transition-all duration-300 flex items-center gap-3"
            >
              <GraduationCap className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-[11px] text-muted-foreground/60 font-body mt-10 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
            This tool provides indicative information only. Please refer to the official admissions policy for definitive guidance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header with tabs */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <button onClick={() => setScreen("intro")} className="flex items-center gap-2 group">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-base font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                Reading School
              </span>
            </button>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/50">
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold transition-all ${
                  activeTab === "map"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Map
              </button>
              <button
                onClick={() => setActiveTab("eligibility")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold transition-all ${
                  activeTab === "eligibility"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Eligibility
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {activeTab === "map" && (
          <div className="animate-fade-in">
            <div className="mb-5">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Catchment Areas</h2>
              <p className="text-sm text-muted-foreground font-body">
                Search your address to see which categories you may be eligible for.
              </p>
            </div>
            <CatchmentMap onResult={setCatchmentResult} />
            {catchmentResult && catchmentResult.categories.length > 0 && (
              <div className="mt-4 flex justify-center animate-fade-in">
                <button
                  onClick={() => setActiveTab("eligibility")}
                  className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl text-sm font-body font-semibold text-primary hover:bg-primary/10 transition-all"
                >
                  Continue to Eligibility Checker
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "eligibility" && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="mb-5">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Check Your Eligibility</h2>
              <p className="text-sm text-muted-foreground font-body">
                Answer a few questions to find out which admission categories apply.
              </p>
            </div>
            <EligibilityForm catchmentResult={catchmentResult} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-[11px] text-muted-foreground font-body">
          Indicative information only. Refer to the official Reading School admissions policy.
        </p>
      </footer>
    </div>
  );
};

export default Index;
