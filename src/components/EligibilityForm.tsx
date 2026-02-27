import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import type { CatchmentResult } from "./CatchmentMap";

const CAT4_POSTCODES = ["RG1","RG2","RG30","RG31","RG4","RG5","RG6","RG7","RG8","RG9","RG10","RG40","RG41"];
const CAT5_ONLY_POSTCODES = ["RG12","RG14","RG18","RG19","RG26","RG27","RG42","RG45","GU15","GU17","GU19","GU46","GU47","OX10","SL4","SL5"];
const CAT5_POSTCODES = [...CAT4_POSTCODES, ...CAT5_ONLY_POSTCODES];

const PLACES_INFO: Record<string, { places: string; note: string }> = {
  "Category 1": { places: "Unlimited", note: "Looked After / Previously Looked After Children" },
  "Category 2": { places: "Unlimited", note: "Children with an EHCP naming the school" },
  "Category 3": { places: "~60", note: "Within 4.6 mile radius" },
  "Category 4": { places: "~30", note: "Local postcode area" },
  "Category 5": { places: "~30", note: "Wider postcode area" },
};

function getPostcodePrefix(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?\d/);
  if (match) return match[1];
  const match2 = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)$/);
  if (match2) return match2[1];
  return cleaned;
}

interface FormData {
  dob: string;
  placeType: "day" | "boarding" | "";
  hasEHCP: boolean;
  isLookedAfter: boolean;
  isPupilPremium: boolean;
  isServicePremium: boolean;
  hasSocialWelfare: boolean;
  hasTwin: boolean;
  hasParentStaff: boolean;
  primarySchool: string;
  postcode: string;
}

interface EligibilityResult {
  categories: { name: string; reason: string; subPriorities: string[] }[];
}

const PRIMARY_SCHOOLS = [
  "Please select...",
  "Alfred Sutton Primary School",
  "All Saints CE Infant School",
  "Battle Primary Academy",
  "Caversham Park Primary School",
  "Caversham Primary School",
  "Christ the King Catholic Primary School",
  "Churchend Primary Academy",
  "Coley Primary School",
  "Emmer Green Primary School",
  "English Martyrs Catholic Primary School",
  "Geoffrey Field Junior School",
  "Highdown School",
  "Katesgrove Primary School",
  "Manor Primary School",
  "Micklands Primary School",
  "Moorlands Primary School",
  "New Town Primary School",
  "Oxford Road Community School",
  "Park Lane Primary School",
  "Redlands Primary School",
  "Ridgeway Primary School",
  "St Anne's Catholic Primary School",
  "St Martin's Catholic Primary School",
  "St Mary & All Saints CE Primary School",
  "Thameside Primary School",
  "The Hill Primary School",
  "The Ridgeway Primary School",
  "Whitley Park Primary School",
  "Wilson Primary School",
  "Other (not listed)",
];

function calculateEligibility(data: FormData): EligibilityResult {
  const categories: EligibilityResult["categories"] = [];
  const prefix = getPostcodePrefix(data.postcode);

  const subPriorities: string[] = [];
  if (data.isPupilPremium) subPriorities.push("Pupil Premium eligible");
  if (data.isServicePremium) subPriorities.push("Service Premium eligible");
  if (data.hasSocialWelfare) subPriorities.push("Social/Welfare need");
  if (data.hasParentStaff) subPriorities.push("Parent working at school");
  if (data.hasTwin) subPriorities.push("Twin applying same year");

  if (data.isLookedAfter) {
    categories.push({ name: "Category 1", reason: "Looked After / Previously Looked After Child", subPriorities: [] });
  }
  if (data.hasEHCP) {
    categories.push({ name: "Category 2", reason: "EHCP naming Reading School", subPriorities: [] });
  }
  if (prefix && CAT4_POSTCODES.includes(prefix)) {
    categories.push({
      name: "Category 3",
      reason: "May be eligible — use the map to verify your address is within 4.6 miles.",
      subPriorities: [...subPriorities],
    });
  }
  if (prefix && CAT4_POSTCODES.includes(prefix)) {
    categories.push({ name: "Category 4", reason: `${prefix} is in the Category 4 area`, subPriorities: [...subPriorities] });
  }
  if (prefix && CAT5_POSTCODES.includes(prefix)) {
    categories.push({ name: "Category 5", reason: `${prefix} is in the Category 5 area`, subPriorities: [...subPriorities] });
  }

  return { categories };
}

const STEPS = ["About You", "Circumstances", "School & Location"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

interface EligibilityFormProps {
  catchmentResult?: CatchmentResult | null;
}

const EligibilityForm = ({ catchmentResult }: EligibilityFormProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    dob: "",
    placeType: "",
    hasEHCP: false,
    isLookedAfter: false,
    isPupilPremium: false,
    isServicePremium: false,
    hasSocialWelfare: false,
    hasTwin: false,
    hasParentStaff: false,
    primarySchool: "",
    postcode: catchmentResult?.postcode || "",
  });
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  const handleSubmit = () => {
    setResult(calculateEligibility(formData));
    setDirection(1);
    setStep(4);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const inputClass =
    "w-full px-4 py-3 bg-secondary/50 text-foreground border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 font-body text-sm transition-all";
  const labelClass = "block text-sm font-medium font-body mb-1.5 text-foreground";

  // Gate
  if (step === 0) {
    return (
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <AlertCircle className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">Before You Begin</h3>
              <p className="text-xs text-muted-foreground font-body">Please read carefully</p>
            </div>
          </div>
          <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">
            This tool provides <strong className="text-foreground">indicative information only</strong> and does not guarantee 
            a place at Reading School. Category eligibility and place availability are subject to change. 
            You must read the official admissions policy for definitive guidance.
          </p>
          <motion.label
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg cursor-pointer group hover:bg-secondary transition-colors mb-6"
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
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Start Eligibility Check
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Results
  if (step === 4 && result) {
    return (
      <motion.div
        ref={formRef}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">Your Results</h3>
              <p className="text-xs text-muted-foreground font-body">Based on the information you provided</p>
            </div>
          </div>

          {result.categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-secondary/50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm font-body text-muted-foreground">
                This postcode doesn't appear to fall within any catchment category.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {result.categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                      >
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      </motion.div>
                      <span className="font-semibold font-body text-sm text-foreground">{cat.name}</span>
                    </div>
                    {PLACES_INFO[cat.name] && (
                      <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-medium">
                        {PLACES_INFO[cat.name].places} places
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-body mb-1">{cat.reason}</p>
                  {cat.subPriorities.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-[11px] font-semibold text-foreground font-body mb-1">Sub-priorities:</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.subPriorities.map((sp) => (
                          <span key={sp} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { goTo(1); setResult(null); }}
              className="flex-1 py-3 bg-secondary text-foreground rounded-lg font-body text-sm font-medium hover:bg-secondary/80 transition-all"
            >
              Start Over
            </motion.button>
          </div>

          <p className="text-[11px] text-muted-foreground font-body italic mt-4">
            ⚠️ Indicative only. Place numbers are approximate and subject to change.
          </p>
        </div>
      </motion.div>
    );
  }

  // Multi-step form
  return (
    <div ref={formRef} className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-6 md:px-8 md:pt-8">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => { if (i + 1 < step) goTo(i + 1); }}
                className={`flex items-center gap-2 text-xs font-body font-medium transition-colors ${
                  i + 1 === step ? "text-primary" : i + 1 < step ? "text-foreground cursor-pointer" : "text-muted-foreground"
                }`}
              >
                <motion.span
                  animate={{
                    backgroundColor:
                      i + 1 === step
                        ? "hsl(330 100% 80%)"
                        : i + 1 < step
                        ? "hsl(330 100% 80% / 0.2)"
                        : "hsl(220 35% 22%)",
                    color:
                      i + 1 === step
                        ? "hsl(220 40% 13%)"
                        : i + 1 < step
                        ? "hsl(330 100% 80%)"
                        : "hsl(215 20% 65%)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold"
                >
                  {i + 1 < step ? "✓" : i + 1}
                </motion.span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <motion.div
                  className="flex-1 h-px"
                  animate={{ backgroundColor: i + 1 < step ? "hsl(330 100% 80% / 0.4)" : "hsl(220 30% 25%)" }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6 md:px-8 md:pb-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Interested in</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["day", "boarding"] as const).map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChange("placeType", type)}
                      className={`p-4 rounded-lg border text-sm font-body font-medium text-center transition-colors ${
                        formData.placeType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {type === "day" ? "🏠 Day Place" : "🛏️ Boarding Place"}
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.button
                whileHover={formData.dob && formData.placeType ? { scale: 1.02 } : {}}
                whileTap={formData.dob && formData.placeType ? { scale: 0.98 } : {}}
                onClick={() => goTo(2)}
                disabled={!formData.dob || !formData.placeType}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground font-body">Select all that apply:</p>
              <div className="space-y-2">
                {[
                  { key: "hasEHCP" as const, label: "Has an EHCP", emoji: "📋" },
                  { key: "isLookedAfter" as const, label: "Looked After / Previously Looked After", emoji: "🏡" },
                  { key: "isPupilPremium" as const, label: "Eligible for Pupil Premium", emoji: "💰" },
                  { key: "isServicePremium" as const, label: "Eligible for Service Premium", emoji: "🎖️" },
                  { key: "hasSocialWelfare" as const, label: "Social or Welfare need", emoji: "❤️" },
                  { key: "hasTwin" as const, label: "Twin applying same year", emoji: "👥" },
                  { key: "hasParentStaff" as const, label: "Parent works at the school", emoji: "🏫" },
                ].map(({ key, label, emoji }, i) => (
                  <motion.button
                    key={key}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleChange(key, !formData[key])}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-lg border text-sm font-body text-left transition-colors ${
                      formData[key]
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="flex-1">{label}</span>
                    <AnimatePresence>
                      {formData[key] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => goTo(1)} className="flex-1 py-3 bg-secondary text-foreground rounded-lg font-body text-sm font-medium hover:bg-secondary/80 transition-all">
                  Back
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => goTo(3)} className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-5"
            >
              <div>
                <label className={labelClass}>Primary School</label>
                <select value={formData.primarySchool} onChange={(e) => handleChange("primarySchool", e.target.value)} className={inputClass}>
                  {PRIMARY_SCHOOLS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Postcode</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleChange("postcode", e.target.value)}
                  placeholder="e.g. RG1 5AG"
                  className={inputClass}
                />
                {catchmentResult && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] text-primary font-body mt-1.5"
                  >
                    ✓ Pre-filled from your map search
                  </motion.p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => goTo(2)} className="flex-1 py-3 bg-secondary text-foreground rounded-lg font-body text-sm font-medium hover:bg-secondary/80 transition-all">
                  Back
                </motion.button>
                <motion.button
                  whileHover={formData.postcode ? { scale: 1.02 } : {}}
                  whileTap={formData.postcode ? { scale: 0.98 } : {}}
                  onClick={handleSubmit}
                  disabled={!formData.postcode}
                  className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-lg font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Check Eligibility
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EligibilityForm;
