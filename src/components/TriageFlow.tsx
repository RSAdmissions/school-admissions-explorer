import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Home,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Shield,
} from "lucide-react";

// --- ENTRY TYPE LOGIC ---

export type EntryType = "year7" | "in-year" | "sixth-form" | null;

export const ENTRY_TABLE = [
  { dobFrom: "2014-09-01", dobTo: "2015-08-31", yearOfEntry: "September 2026", deadline: "30 June 2025" },
  { dobFrom: "2015-09-01", dobTo: "2016-08-31", yearOfEntry: "September 2027", deadline: "30 June 2026" },
  { dobFrom: "2016-09-01", dobTo: "2017-08-31", yearOfEntry: "September 2028", deadline: "30 June 2027" },
  { dobFrom: "2017-09-01", dobTo: "2018-08-31", yearOfEntry: "September 2029", deadline: "30 June 2028" },
  { dobFrom: "2018-09-01", dobTo: "2019-08-31", yearOfEntry: "September 2030", deadline: "30 June 2029" },
];

export const SIXTH_FORM_TABLE = [
  { dobFrom: "2009-09-01", dobTo: "2010-08-31", yearOfEntry: "September 2026", deadline: "1 November 2025" },
  { dobFrom: "2010-09-01", dobTo: "2011-08-31", yearOfEntry: "September 2027", deadline: "1 November 2026" },
  { dobFrom: "2011-09-01", dobTo: "2012-08-31", yearOfEntry: "September 2028", deadline: "1 November 2027" },
  { dobFrom: "2012-09-01", dobTo: "2013-08-31", yearOfEntry: "September 2029", deadline: "1 November 2028" },
  { dobFrom: "2013-09-01", dobTo: "2014-08-31", yearOfEntry: "September 2030", deadline: "1 November 2029" },
];

export function determineEntryType(dob: string): EntryType {
  if (!dob) return null;
  const d = new Date(dob);
  for (const row of ENTRY_TABLE) {
    if (d >= new Date(row.dobFrom) && d <= new Date(row.dobTo)) return "year7";
  }
  for (const row of SIXTH_FORM_TABLE) {
    if (d >= new Date(row.dobFrom) && d <= new Date(row.dobTo)) return "sixth-form";
  }
  if (d >= new Date("2008-09-01") && d <= new Date("2014-08-31")) return "in-year";
  if (d > new Date("2019-08-31")) return null;
  if (d < new Date("2008-09-01")) return null;
  return "in-year";
}

export function getEntryTableRow(dob: string) {
  if (!dob) return null;
  const d = new Date(dob);
  for (const row of ENTRY_TABLE) {
    if (d >= new Date(row.dobFrom) && d <= new Date(row.dobTo)) return row;
  }
  return null;
}

// --- TYPES ---

export interface TriageResult {
  dob: string;
  entryType: EntryType;
  placeType: "day" | "boarding";
}

interface TriageFlowProps {
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
}

// --- ANIMATION ---

const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const TriageFlow = ({ onComplete, onBack }: TriageFlowProps) => {
  const [step, setStep] = useState(0); // 0 = DOB, 1 = Day/Boarding (or sixth-form info)
  const [direction, setDirection] = useState(1);
  const [dob, setDob] = useState("");
  const [placeType, setPlaceType] = useState<"day" | "boarding" | "">("");

  const entryType = useMemo(() => determineEntryType(dob), [dob]);
  const entryRow = useMemo(() => getEntryTableRow(dob), [dob]);

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-secondary/50 text-foreground border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 font-body text-sm transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background flex items-center justify-center"
    >
      <div className="w-full max-w-lg mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-xs font-body font-medium text-muted-foreground mb-4">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Admissions Tool
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Let's get started
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-2">
            A couple of quick questions to point you in the right direction.
          </p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{
                width: step === i ? 24 : 8,
                backgroundColor: step >= i ? "hsl(var(--primary))" : "hsl(var(--muted))",
              }}
              className="h-2 rounded-full"
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Date of Birth */}
            {step === 0 && (
              <motion.div
                key="dob"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                    className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      Child's Date of Birth
                    </h3>
                    <p className="text-xs text-muted-foreground font-body">
                      This determines the entry point for your child
                    </p>
                  </div>
                </div>

                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                />

                {/* Entry type feedback */}
                {dob && entryType && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-body font-semibold text-foreground">
                        {entryType === "year7" && "Year 7 Entry"}
                        {entryType === "in-year" && "In-Year Transfer"}
                        {entryType === "sixth-form" && "Sixth Form (Year 12) Entry"}
                      </span>
                    </div>
                    {entryType === "year7" && entryRow && (
                      <p className="text-xs text-muted-foreground font-body">
                        Your child would enter in <strong className="text-foreground">{entryRow.yearOfEntry}</strong>.
                        Registration deadline: <strong className="text-foreground">{entryRow.deadline}</strong>.
                      </p>
                    )}
                    {entryType === "in-year" && (
                      <p className="text-xs text-muted-foreground font-body">
                        Your child is of secondary school age and would apply for an in-year transfer.
                      </p>
                    )}
                    {entryType === "sixth-form" && (
                      <p className="text-xs text-muted-foreground font-body">
                        Your child is eligible for Year 12 entry. You'll see the full timetable next.
                      </p>
                    )}
                  </motion.div>
                )}

                {dob && !entryType && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-body font-semibold text-foreground">
                        Not eligible for current entry points
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      Based on this date of birth, your child does not fall within the current entry windows.
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-3 bg-secondary text-foreground rounded-xl font-body text-sm font-medium hover:bg-secondary/80 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={dob && entryType ? { scale: 1.02 } : {}}
                    whileTap={dob && entryType ? { scale: 0.98 } : {}}
                    disabled={!dob || !entryType}
                    onClick={() => goTo(1)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Day/Boarding OR Sixth Form Info */}
            {step === 1 && entryType === "sixth-form" && (
              <motion.div
                key="sixth-form"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                    className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      Reading School — Year 12 Entry
                    </h3>
                    <p className="text-xs text-muted-foreground font-body">Sixth Form Admissions</p>
                  </div>
                </div>

                <p className="text-sm font-body text-muted-foreground leading-relaxed mb-6">
                  Sixth Form entry at Reading School follows a separate admissions process. Below is the indicative timetable for the next 5 years.
                </p>

                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year of Entry</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIXTH_FORM_TABLE.map((row, i) => {
                        const fromDate = new Date(row.dobFrom);
                        const toDate = new Date(row.dobTo);
                        const dobStr = `${fromDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} – ${toDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
                        const d = dob ? new Date(dob) : null;
                        const isMatch = d && d >= fromDate && d <= toDate;

                        return (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className={`border-t border-border ${isMatch ? "bg-primary/5" : ""}`}
                          >
                            <td className="px-4 py-3 text-foreground">{dobStr}</td>
                            <td className="px-4 py-3 text-foreground font-semibold">{row.yearOfEntry}</td>
                            <td className="px-4 py-3 text-foreground">{row.deadline}</td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-muted-foreground font-body mt-4 italic">
                  For full details on Sixth Form admissions criteria, entry requirements, and how to apply, please visit the{" "}
                  <a href="https://www.reading-school.co.uk/page/?title=Reading+School+%2D+Year+12+Entry&pid=96" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:opacity-80">
                    Reading School - Year 12 Entry
                  </a>{" "}
                  page.
                </p>

                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goTo(0)}
                    className="flex items-center gap-2 px-5 py-3 bg-secondary text-foreground rounded-xl font-body text-sm font-medium hover:bg-secondary/80 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setStep(0);
                      setDob("");
                      setPlaceType("");
                    }}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    Start Over
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 1 && entryType !== "sixth-form" && (
              <motion.div
                key="placeType"
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                    className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <Home className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-foreground">
                      Day or Boarding?
                    </h3>
                    <p className="text-xs text-muted-foreground font-body">
                      This determines which criteria apply to your application
                    </p>
                  </div>
                </div>

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
                      onClick={() => setPlaceType(type)}
                      className={`p-6 rounded-xl border-2 text-center transition-colors ${
                        placeType === type
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/30 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-3xl block mb-2">{type === "day" ? "🏠" : "🛏️"}</span>
                      <span className={`text-sm font-body font-semibold ${placeType === type ? "text-primary" : "text-muted-foreground"}`}>
                        {type === "day" ? "Day Place" : "Boarding Place"}
                      </span>
                      <p className="text-[11px] text-muted-foreground font-body mt-1">
                        {type === "day"
                          ? "Education is free."
                          : "Lives at school from Monday to Friday. Pays for board and lodging only."}
                      </p>
                      <a
                        href="https://www.reading-school.co.uk/page/?title=Admissions+Policies&pid=56"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-primary underline hover:opacity-80 font-body mt-1 inline-block"
                      >
                        Link to Policy
                      </a>
                    </motion.button>
                  ))}
                </div>

                <div className="flex gap-3 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goTo(0)}
                    className="flex items-center gap-2 px-5 py-3 bg-secondary text-foreground rounded-xl font-body text-sm font-medium hover:bg-secondary/80 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={placeType ? { scale: 1.02 } : {}}
                    whileTap={placeType ? { scale: 0.98 } : {}}
                    disabled={!placeType}
                    onClick={() => {
                      if (placeType && entryType) {
                        onComplete({ dob, entryType, placeType });
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Continue to Eligibility Check
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TriageFlow;
