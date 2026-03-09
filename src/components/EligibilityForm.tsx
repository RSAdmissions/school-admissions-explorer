import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Home,
  School,
  MapPin as MapPinIcon,
  Trophy,
} from "lucide-react";
import type { CatchmentResult } from "./CatchmentMap";

// --- DATA ---

const PRIORITY_POSTCODES = [
  "RG1","RG2","RG30","RG31","RG4","RG5","RG6","RG7","RG8","RG9","RG10","RG40","RG41",
];
const CATCHMENT_ONLY_POSTCODES = [
  "RG12","RG14","RG18","RG19","RG26","RG27","RG42","RG45",
  "GU15","GU17","GU19","GU46","GU47","OX10","SL4","SL5",
];
const CATCHMENT_POSTCODES = [...PRIORITY_POSTCODES, ...CATCHMENT_ONLY_POSTCODES];

import { FEEDER_SCHOOLS } from "@/data/feederSchools";

function getPostcodePrefix(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?\d/);
  if (match) return match[1];
  const match2 = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)$/);
  if (match2) return match2[1];
  return cleaned;
}

// --- TYPES ---

interface FormData {
  dob: string;
  placeType: "day" | "boarding" | "";
  hasEHCP: boolean;
  isLookedAfter: boolean;
  isPupilPremium: boolean;
  isServicePremium: boolean;
  hasSocialWelfare: boolean;
  hasParentStaff: boolean;
  hasSportingAptitude: boolean;
  primarySchool: string;
  postcode: string;
}

interface CategoryResult {
  name: string;
  description: string;
  allocation: string;
  highlight?: boolean;
}

// --- LOGIC ---

function calculateEligibility(data: FormData): CategoryResult[] {
  const results: CategoryResult[] = [];
  const prefix = getPostcodePrefix(data.postcode);
  const isFeeder = FEEDER_SCHOOLS.includes(data.primarySchool);
  const isPriority = PRIORITY_POSTCODES.includes(prefix);
  const isCatchment = CATCHMENT_POSTCODES.includes(prefix);

  if (data.hasEHCP) {
    results.push({
      name: "Category 0",
      description: "EHCP — place allocated as long as an eligible score is achieved.",
      allocation: "As needed",
      highlight: true,
    });
  }

  const cat1Reasons: string[] = [];
  if (data.isLookedAfter) cat1Reasons.push("(Previously) Looked After / Adopted");
  if (data.isPupilPremium) cat1Reasons.push("Pupil Premium");
  if (data.isServicePremium) cat1Reasons.push("Service Premium");
  if (data.hasSocialWelfare) cat1Reasons.push("Social & Welfare Need");
  if (data.hasParentStaff) cat1Reasons.push("Child of Staff");

  if (cat1Reasons.length > 0) {
    results.push({
      name: "Category 1",
      description: `${cat1Reasons.join(", ")} — as many places as apply and achieve an eligible score, prioritised in the order listed.`,
      allocation: "As many as qualify",
      highlight: true,
    });
  }

  if (data.hasSportingAptitude) {
    results.push({
      name: "Category 2",
      description: "Sporting Aptitude — 15 places reserved across day and boarding.",
      allocation: "15 places total",
    });
  }

  if (isFeeder) {
    results.push({
      name: "Category 3",
      description: `${data.primarySchool} is a named Reading feeder school — 50% of remaining places after Categories 1 & 2.`,
      allocation: "50% of remaining",
    });
  }

  if (isPriority) {
    results.push({
      name: "Category 4",
      description: `${prefix} is a Priority Postcode — 80% of remaining places after Categories 1–3.`,
      allocation: "80% of remaining",
    });
  }

  if (isCatchment) {
    results.push({
      name: "Category 5",
      description: `${prefix} is in the Catchment Area — any remaining places after Categories 1–4.`,
      allocation: "Remaining places",
    });
  }

  // Cat 6 always applies
  if (!data.hasEHCP && cat1Reasons.length === 0 && !data.hasSportingAptitude && !isFeeder && !isPriority && !isCatchment) {
    results.push({
      name: "Category 6",
      description: "All other eligible candidates — places allocated after all other categories.",
      allocation: "Any remaining",
    });
  }

  return results;
}

// --- ANIMATION ---

const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

// --- COMPONENT ---

interface EligibilityFormProps {
  catchmentResult?: CatchmentResult | null;
  onPostcodeChange?: (postcode: string) => void;
}

// Total questions: 0=gate, 1=dob, 2=placeType, 3=EHCP, 4=circumstances, 5=sporting, 6=school, 7=postcode, 8=results
const TOTAL_QUESTIONS = 8;

const EligibilityForm = ({ catchmentResult, onPostcodeChange }: EligibilityFormProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    dob: "",
    placeType: "",
    hasEHCP: false,
    isLookedAfter: false,
    isPupilPremium: false,
    isServicePremium: false,
    hasSocialWelfare: false,
    hasParentStaff: false,
    hasSportingAptitude: false,
    primarySchool: "",
    postcode: catchmentResult?.postcode || "",
  });
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [searchSchool, setSearchSchool] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "postcode" && typeof value === "string") {
      onPostcodeChange?.(value);
    }
  };

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const handleSubmit = () => {
    setResults(calculateEligibility(formData));
    goTo(TOTAL_QUESTIONS);
  };

  const progress = step === 0 ? 0 : step >= TOTAL_QUESTIONS ? 100 : Math.round((step / (TOTAL_QUESTIONS - 1)) * 100);

  const filteredSchools = searchSchool
    ? FEEDER_SCHOOLS.filter((s) => s.toLowerCase().includes(searchSchool.toLowerCase()))
    : FEEDER_SCHOOLS;

  const inputClass =
    "w-full px-4 py-3.5 bg-secondary/50 text-foreground border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 font-body text-sm transition-all";

  const NavButtons = ({ canContinue = true, isSubmit = false }: { canContinue?: boolean; isSubmit?: boolean }) => (
    <div className="flex gap-3 mt-8">
      {step > 1 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={back}
          className="flex items-center gap-2 px-5 py-3 bg-secondary text-foreground rounded-xl font-body text-sm font-medium hover:bg-secondary/80 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      )}
      <motion.button
        whileHover={canContinue ? { scale: 1.02 } : {}}
        whileTap={canContinue ? { scale: 0.98 } : {}}
        onClick={isSubmit ? handleSubmit : next}
        disabled={!canContinue}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {isSubmit ? (
          <>
            <Sparkles className="h-4 w-4" />
            See My Results
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </motion.button>
    </div>
  );

  const QuestionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
        className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
      >
        <Icon className="h-5 w-5 text-primary" />
      </motion.div>
      <div>
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-heading font-bold text-foreground"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground font-body"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Progress bar */}
      {step > 0 && step < TOTAL_QUESTIONS && (
        <div className="h-1 bg-secondary">
          <motion.div
            className="h-full bg-primary rounded-r-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Gate */}
          {step === 0 && (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionHeader icon={AlertCircle} title="Before You Begin" subtitle="Important information" />
              <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">
                This tool provides <strong className="text-foreground">indicative information only</strong> and does not guarantee
                a place at Reading School. Category eligibility and place availability are subject to change.
                You must read the official admissions policy for definitive guidance.
              </p>
              <motion.label
                whileHover={{ scale: 1.005 }}
                className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary transition-colors mb-6 border border-border/50"
              >
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-sm font-body text-foreground leading-relaxed">
                  I understand this is indicative only and will read the official admissions policy.
                </span>
              </motion.label>
              <motion.button
                whileHover={acknowledged ? { scale: 1.02 } : {}}
                whileTap={acknowledged ? { scale: 0.98 } : {}}
                disabled={!acknowledged}
                onClick={() => goTo(1)}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Start Eligibility Check
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* Q1: DOB */}
          {step === 1 && (
            <motion.div
              key="q1"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={Calendar} title="Date of Birth" subtitle="Question 1 of 7" />
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className={inputClass}
              />
              <NavButtons canContinue={!!formData.dob} />
            </motion.div>
          )}

          {/* Q2: Day or Boarding */}
          {step === 2 && (
            <motion.div
              key="q2"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={Home} title="Day or Boarding?" subtitle="Question 2 of 7" />
              <div className="grid grid-cols-2 gap-3">
                {(["day", "boarding"] as const).map((type, i) => (
                  <motion.button
                    key={type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleChange("placeType", type)}
                    className={`p-6 rounded-xl border-2 text-center transition-colors ${
                      formData.placeType === type
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/30"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{type === "day" ? "🏠" : "🛏️"}</span>
                    <span className={`text-sm font-body font-semibold ${formData.placeType === type ? "text-primary" : "text-muted-foreground"}`}>
                      {type === "day" ? "Day Place" : "Boarding Place"}
                    </span>
                  </motion.button>
                ))}
              </div>
              <NavButtons canContinue={!!formData.placeType} />
            </motion.div>
          )}

          {/* Q3: EHCP */}
          {step === 3 && (
            <motion.div
              key="q3"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={AlertCircle} title="Education, Health & Care Plan" subtitle="Question 3 of 7" />
              <p className="text-sm text-muted-foreground font-body mb-4">
                Does your child have an EHCP that names Reading School?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map((val, i) => (
                  <motion.button
                    key={String(val)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleChange("hasEHCP", val)}
                    className={`p-5 rounded-xl border-2 text-center transition-colors ${
                      formData.hasEHCP === val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                    } font-body font-semibold text-sm`}
                  >
                    {val ? "Yes" : "No"}
                  </motion.button>
                ))}
              </div>
              <NavButtons />
            </motion.div>
          )}

          {/* Q4: Circumstances */}
          {step === 4 && (
            <motion.div
              key="q4"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={CheckCircle} title="Priority Criteria" subtitle="Question 4 of 7 — select all that apply" />
              <div className="space-y-2">
                {[
                  { key: "isLookedAfter" as const, label: "Looked After / Previously Looked After / Adopted", emoji: "🏡" },
                  { key: "isPupilPremium" as const, label: "Eligible for Pupil Premium", emoji: "💰" },
                  { key: "isServicePremium" as const, label: "Eligible for Service Premium", emoji: "🎖️" },
                  { key: "hasSocialWelfare" as const, label: "Social or Welfare need", emoji: "❤️" },
                  { key: "hasParentStaff" as const, label: "Parent/carer works at the school", emoji: "🏫" },
                ].map(({ key, label, emoji }, i) => (
                  <motion.button
                    key={key}
                    type="button"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleChange(key, !formData[key])}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-sm font-body text-left transition-colors ${
                      formData[key]
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="flex-1">{label}</span>
                    <AnimatePresence>
                      {formData[key] && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400 }}>
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground font-body mt-3 italic">
                These are listed in priority order as per the admissions policy. Skip if none apply.
              </p>
              <NavButtons />
            </motion.div>
          )}

          {/* Q5: Sporting Aptitude */}
          {step === 5 && (
            <motion.div
              key="q5"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={Trophy} title="Sporting Aptitude" subtitle="Question 5 of 7" />
              <p className="text-sm text-muted-foreground font-body mb-4">
                Will your child be applying under the Sporting Aptitude criteria? (15 places reserved across day & boarding)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map((val, i) => (
                  <motion.button
                    key={String(val)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => handleChange("hasSportingAptitude", val)}
                    className={`p-5 rounded-xl border-2 text-center transition-colors ${
                      formData.hasSportingAptitude === val
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                    } font-body font-semibold text-sm`}
                  >
                    {val ? "Yes" : "No"}
                  </motion.button>
                ))}
              </div>
              <NavButtons />
            </motion.div>
          )}

          {/* Q6: Primary School */}
          {step === 6 && (
            <motion.div
              key="q6"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={School} title="Primary School" subtitle="Question 6 of 7" />
              <div className="relative mb-3">
                <School className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchSchool}
                  onChange={(e) => setSearchSchool(e.target.value)}
                  placeholder="Search for your school…"
                  className={`${inputClass} pl-10`}
                />
                {searchSchool && (
                  <button
                    type="button"
                    onClick={() => setSearchSchool("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {filteredSchools.map((school, i) => (
                  <motion.button
                    key={school}
                    type="button"
                    initial={i < 10 ? { opacity: 0, x: -10 } : {}}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.03 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { handleChange("primarySchool", school); setSearchSchool(""); }}
                    className={`w-full text-left p-3 rounded-lg text-sm font-body transition-colors ${
                      formData.primarySchool === school
                        ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                        : "bg-secondary/30 text-muted-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    {school}
                  </motion.button>
                ))}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleChange("primarySchool", "Other (not listed)")}
                  className={`w-full text-left p-3 rounded-lg text-sm font-body transition-colors ${
                    formData.primarySchool === "Other (not listed)"
                      ? "bg-primary/10 text-primary border border-primary/30 font-semibold"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary border border-transparent"
                  }`}
                >
                  Other (not listed)
                </motion.button>
              </div>
              {formData.primarySchool && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs font-body text-primary flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Selected: {formData.primarySchool}
                  {FEEDER_SCHOOLS.includes(formData.primarySchool) && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold">
                      Feeder School ✓
                    </span>
                  )}
                </motion.div>
              )}
              <NavButtons canContinue={!!formData.primarySchool} />
            </motion.div>
          )}

          {/* Q7: Postcode */}
          {step === 7 && (
            <motion.div
              key="q7"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <QuestionHeader icon={MapPinIcon} title="Your Postcode" subtitle="Question 7 of 7" />
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => handleChange("postcode", e.target.value.toUpperCase())}
                placeholder="e.g. RG1 5AG"
                className={inputClass}
                autoFocus
              />
              {catchmentResult && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-primary font-body mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Pre-filled from your map search
                </motion.p>
              )}
              <NavButtons canContinue={!!formData.postcode.trim()} isSubmit />
            </motion.div>
          )}

          {/* Results */}
          {step === TOTAL_QUESTIONS && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground">Your Results</h3>
                  <p className="text-xs text-muted-foreground font-body">Based on the information you provided</p>
                </div>
              </div>

              {results.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-secondary/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground mb-1">Category 6</p>
                    <p className="text-sm font-body text-muted-foreground">
                      Based on the information provided, your child would fall under Category 6 — all other eligible candidates.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {results.map((cat, i) => (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.1, duration: 0.35 }}
                      className={`p-4 rounded-xl border ${cat.highlight ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/50"}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.1, type: "spring" }}
                          >
                            <CheckCircle className={`h-4 w-4 shrink-0 ${cat.highlight ? "text-primary" : "text-cat4"}`} />
                          </motion.div>
                          <span className="font-semibold font-body text-sm text-foreground">{cat.name}</span>
                        </div>
                        <span className="text-[11px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-body font-medium">
                          {cat.allocation}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">{cat.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setResults([]);
                    goTo(0);
                    setAcknowledged(false);
                  }}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-body text-sm font-medium hover:bg-secondary/80 transition-all"
                >
                  Start Over
                </motion.button>
              </div>

              <p className="text-[11px] text-muted-foreground font-body italic mt-4">
                ⚠️ Indicative only. Please refer to the official Reading School admissions policy for definitive information.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EligibilityForm;
