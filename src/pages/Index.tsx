import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ClipboardCheck, ArrowRight, GraduationCap, Shield } from "lucide-react";
import CatchmentMap from "@/components/CatchmentMap";
import EligibilityForm from "@/components/EligibilityForm";
import TriageFlow from "@/components/TriageFlow";
import type { TriageResult } from "@/components/TriageFlow";
import type { CatchmentResult } from "@/components/CatchmentMap";
import { CAT4_POSTCODES_LIST, CAT5_ONLY_POSTCODES_LIST } from "@/data/postcodeAreas";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const [screen, setScreen] = useState<"intro" | "triage" | "tool">("intro");
  const [activeTab, setActiveTab] = useState<"map" | "eligibility">("map");
  const [catchmentResult, setCatchmentResult] = useState<CatchmentResult | null>(null);
  const [formPostcode, setFormPostcode] = useState("");
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const handleTriageComplete = (result: TriageResult) => {
    setTriageResult(result);
    // Day students benefit from seeing the map first; boarding skips geography
    setActiveTab(result.placeType === "day" ? "map" : "eligibility");
    setScreen("tool");
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "intro" ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[150px]"
            />
            <motion.div
              animate={{ x: [0, 15, 0], y: [0, 15, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]"
            />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-body font-medium text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Official Admissions Tool
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeUp} custom={1} className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight mb-4">
                Reading School
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
                Explore catchment areas and check your child's admission eligibility
              </p>
              <motion.div
                variants={fadeUp}
                custom={2}
                className="flex items-center justify-center gap-3 mt-4"
              >
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                  className="h-px bg-border block"
                />
                <span className="text-[11px] text-muted-foreground font-body uppercase tracking-[0.2em]">
                  Est. 1125
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                  className="h-px bg-border block"
                />
              </motion.div>
            </motion.div>

            {/* Feature cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                {
                  icon: MapPin,
                  title: "Interactive Map",
                  desc: "Search your address and instantly see which catchment categories apply. Visualise Category 3, 4 & 5 boundaries.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Eligibility Checker",
                  desc: "Answer a few questions to find out which admission categories your child may qualify for, with indicative place numbers.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  custom={3 + i}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card rounded-2xl p-6 group cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                  >
                    <card.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={5} className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 40px hsl(330 100% 80% / 0.25)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setScreen("triage")}
                className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-body text-base font-semibold transition-colors duration-300 flex items-center gap-3"
              >
                <GraduationCap className="h-5 w-5" />
                Get Started
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </motion.button>
            </motion.div>

            {/* Disclaimer */}
            <motion.p
              variants={fadeUp}
              custom={6}
              className="text-center text-[11px] text-muted-foreground/60 font-body mt-10 max-w-md mx-auto"
            >
              This tool provides indicative information only. Please refer to the official admissions policy for definitive guidance.
            </motion.p>
          </motion.div>
        </motion.div>
      ) : screen === "triage" ? (
        <TriageFlow
          key="triage"
          onComplete={handleTriageComplete}
          onBack={() => setScreen("intro")}
        />
      ) : (
        <motion.div
          key="tool"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-screen bg-background"
        >
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl"
          >
            <div className="container max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-between py-3">
                <button onClick={() => setScreen("intro")} className="flex items-center gap-2 group">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="text-base font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                    Reading School
                  </span>
                </button>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/50 relative">
                  {/* Animated pill background */}
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-sm"
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                      left: activeTab === "map" ? 4 : "50%",
                      right: activeTab === "eligibility" ? 4 : "50%",
                    }}
                  />
                  <button
                    onClick={() => setActiveTab("map")}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold transition-colors ${
                      activeTab === "map" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Map
                  </button>
                  <button
                    onClick={() => setActiveTab("eligibility")}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold transition-colors ${
                      activeTab === "eligibility" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Eligibility
                  </button>
                </div>
              </div>
            </div>
          </motion.header>

          <main className="container max-w-6xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              {activeTab === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-5"
                  >
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Catchment Areas</h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Search your address to see which categories you may be eligible for.
                    </p>
                  </motion.div>
                  <CatchmentMap onResult={setCatchmentResult} externalPostcode={formPostcode} entryType={triageResult?.entryType} />

                  {/* Persistent prompt to go to eligibility */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-5 glass-card rounded-2xl flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm font-body font-semibold text-foreground">
                        Ready to check eligibility?
                      </p>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {catchmentResult
                          ? `We've noted your postcode (${catchmentResult.postcode}). Continue to see which categories apply.`
                          : "Answer a few questions to see which admission categories your child may qualify for."}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab("eligibility")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-body font-semibold hover:opacity-90 transition-all whitespace-nowrap"
                    >
                      Check Eligibility
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </motion.div>

                  {/* Postcode reference lists */}
                  <div className="grid md:grid-cols-2 gap-3 mt-4">
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#4caf7a" }} />
                        <h4 className="text-xs font-semibold font-body text-foreground uppercase tracking-wider">Priority Home Postcodes</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {CAT4_POSTCODES_LIST.map((pc) => (
                          <span key={pc} className="text-[11px] font-body font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {pc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#e6952e" }} />
                        <h4 className="text-xs font-semibold font-body text-foreground uppercase tracking-wider">Wider Catchment Area Home Postcodes</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {CAT5_ONLY_POSTCODES_LIST.map((pc) => (
                          <span key={pc} className="text-[11px] font-body font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {pc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "eligibility" && triageResult && (
                <motion.div
                  key="eligibility"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-5"
                  >
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-1">Check Your Eligibility</h2>
                    <p className="text-sm text-muted-foreground font-body">
                      Answer a few questions to find out which admission categories apply.
                    </p>
                  </motion.div>
                  <EligibilityForm
                    catchmentResult={catchmentResult}
                    onPostcodeChange={setFormPostcode}
                    entryType={triageResult.entryType}
                    placeType={triageResult.placeType}
                    onStartOver={() => {
                      setTriageResult(null);
                      setScreen("triage");
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="border-t border-border py-6 text-center">
            <p className="text-[11px] text-muted-foreground font-body">
              Indicative information only. Refer to the{" "}
              <a href="https://www.reading-school.co.uk/page/?title=Admissions+Policies&pid=56" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                official Reading School admissions policy
              </a>.
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
