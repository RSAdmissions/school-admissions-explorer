import { useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const CAT4_POSTCODES = ["RG1", "RG2", "RG30", "RG31", "RG4", "RG5", "RG6", "RG7", "RG8", "RG9", "RG10", "RG40", "RG41"];
const CAT5_ONLY_POSTCODES = ["RG12", "RG14", "RG18", "RG19", "RG26", "RG27", "RG42", "RG45", "GU15", "GU17", "GU19", "GU46", "GU47", "OX10", "SL4", "SL5"];
const CAT5_POSTCODES = [...CAT4_POSTCODES, ...CAT5_ONLY_POSTCODES];

// Indicative place numbers (these should be updated with real data)
const PLACES_INFO: Record<string, { places: string; note: string }> = {
  "Category 1": { places: "Unlimited", note: "Looked After / Previously Looked After Children" },
  "Category 2": { places: "Unlimited", note: "Children with an EHCP naming the school" },
  "Category 3": { places: "~60", note: "Children living within 4.6 mile radius" },
  "Category 4": { places: "~30", note: "Children living in local postcode area" },
  "Category 5": { places: "~30", note: "Children living in wider postcode area" },
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
  acknowledged: boolean;
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
  "I will provide the list later",
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

  // Sub-priorities applicable within Cat 3/4/5
  const subPriorities: string[] = [];
  if (data.isPupilPremium) subPriorities.push("Pupil Premium eligible (higher sub-priority)");
  if (data.isServicePremium) subPriorities.push("Service Premium eligible (higher sub-priority)");
  if (data.hasSocialWelfare) subPriorities.push("Social/Welfare need (higher sub-priority)");
  if (data.hasParentStaff) subPriorities.push("Parent working at the school (higher sub-priority)");
  if (data.hasTwin) subPriorities.push("Twin applying in the same year");

  if (data.isLookedAfter) {
    categories.push({
      name: "Category 1",
      reason: "Looked After / Previously Looked After Child",
      subPriorities: [],
    });
  }

  if (data.hasEHCP) {
    categories.push({
      name: "Category 2",
      reason: "Child has an Education, Health and Care Plan (EHCP) naming Reading School",
      subPriorities: [],
    });
  }

  // Cat 3 - can't determine distance from postcode alone, note this
  if (prefix && CAT4_POSTCODES.includes(prefix)) {
    categories.push({
      name: "Category 3",
      reason: "May be eligible — depends on whether address is within 4.6 miles of Reading School's Erleigh Road gate. Use the map above to check.",
      subPriorities: [...subPriorities],
    });
  }

  if (prefix && CAT4_POSTCODES.includes(prefix)) {
    categories.push({
      name: "Category 4",
      reason: `Postcode ${prefix} is in the Category 4 area`,
      subPriorities: [...subPriorities],
    });
  }

  if (prefix && CAT5_POSTCODES.includes(prefix)) {
    categories.push({
      name: "Category 5",
      reason: `Postcode ${prefix} is in the Category 5 area`,
      subPriorities: [...subPriorities],
    });
  }

  return { categories };
}

const EligibilityForm = () => {
  const [formData, setFormData] = useState<FormData>({
    acknowledged: false,
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
    postcode: "",
  });
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculateEligibility(formData));
  };

  const inputClass = "w-full px-3 py-2.5 bg-secondary text-foreground border border-border rounded placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-body text-sm";
  const labelClass = "block text-sm font-medium font-body mb-1";
  const checkboxRowClass = "flex items-start gap-3 py-2";

  if (!showForm) {
    return (
      <div className="bg-card border border-border rounded p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm font-body text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Important Notice</p>
            <p>
              All information provided by this tool is <strong>indicative only</strong> and does not guarantee a place at Reading School. 
              Thorough reading of the relevant admissions policies is required. Category eligibility and place availability 
              are subject to change. Please refer to the official admissions documentation for definitive guidance.
            </p>
          </div>
        </div>
        <label className={checkboxRowClass}>
          <input
            type="checkbox"
            checked={formData.acknowledged}
            onChange={(e) => handleChange("acknowledged", e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <span className="text-sm font-body">I acknowledge that this information is indicative only and that I must read the relevant admissions policies.</span>
        </label>
        <button
          disabled={!formData.acknowledged}
          onClick={() => setShowForm(true)}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded font-body text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Eligibility Checker
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded p-6 space-y-6">
      {/* Date of birth */}
      <div>
        <label className={labelClass}>Date of Birth</label>
        <input type="date" value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} className={inputClass} required />
      </div>

      {/* Day or Boarding */}
      <div>
        <label className={labelClass}>Interested in</label>
        <select value={formData.placeType} onChange={(e) => handleChange("placeType", e.target.value as "day" | "boarding")} className={inputClass} required>
          <option value="">Please select...</option>
          <option value="day">Day Place</option>
          <option value="boarding">Boarding Place</option>
        </select>
      </div>

      {/* Criteria checkboxes */}
      <fieldset className="space-y-1">
        <legend className={labelClass}>Please indicate if any of the following apply:</legend>
        {[
          { key: "hasEHCP" as const, label: "Has an Education, Health and Care Plan (EHCP)" },
          { key: "isLookedAfter" as const, label: "Is a Looked After Child or Previously Looked After Child" },
          { key: "isPupilPremium" as const, label: "Is eligible for Pupil Premium" },
          { key: "isServicePremium" as const, label: "Is eligible for Service Premium" },
          { key: "hasSocialWelfare" as const, label: "Has a Social or Welfare need" },
          { key: "hasTwin" as const, label: "Has a twin applying in the same year" },
          { key: "hasParentStaff" as const, label: "Has a parent working at the school" },
        ].map(({ key, label }) => (
          <label key={key} className={checkboxRowClass}>
            <input
              type="checkbox"
              checked={formData[key]}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-sm font-body">{label}</span>
          </label>
        ))}
      </fieldset>

      {/* Primary school */}
      <div>
        <label className={labelClass}>Primary School</label>
        <select value={formData.primarySchool} onChange={(e) => handleChange("primarySchool", e.target.value)} className={inputClass}>
          {PRIMARY_SCHOOLS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Postcode */}
      <div>
        <label className={labelClass}>Postcode</label>
        <input
          type="text"
          value={formData.postcode}
          onChange={(e) => handleChange("postcode", e.target.value)}
          placeholder="e.g. RG1 5AG"
          className={inputClass}
          required
        />
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded font-body text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Check Eligibility
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xl font-heading font-bold">Results</h3>
          {result.categories.length === 0 ? (
            <div className="p-4 bg-secondary rounded flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm font-body">
                Based on the information provided, this postcode does not appear to fall within any catchment category.
                Please check the map above or consult the admissions policy.
              </p>
            </div>
          ) : (
            result.categories.map((cat) => (
              <div key={cat.name} className="p-4 bg-secondary rounded space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-semibold font-body">{cat.name}</span>
                  {PLACES_INFO[cat.name] && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded ml-auto">
                      ~{PLACES_INFO[cat.name].places} places (indicative)
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-body">{cat.reason}</p>
                {cat.subPriorities.length > 0 && (
                  <div className="text-sm font-body">
                    <p className="font-medium text-foreground mb-1">Sub-priorities that may apply:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      {cat.subPriorities.map((sp, i) => (
                        <li key={i}>{sp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
          <p className="text-xs text-muted-foreground font-body italic">
            ⚠️ These results are indicative only. Place numbers are approximate and subject to change.
            Please read the full admissions policy for definitive information.
          </p>
        </div>
      )}
    </form>
  );
};

export default EligibilityForm;
