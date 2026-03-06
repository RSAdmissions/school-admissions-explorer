import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Loader2, X, ChevronRight, GraduationCap, CheckCircle, Info } from "lucide-react";
import { CAT4_AREAS, CAT5_ONLY_AREAS, CAT4_POSTCODES_LIST, CAT5_ONLY_POSTCODES_LIST } from "@/data/postcodeAreas";
import { FEEDER_SCHOOLS } from "@/data/feederSchools";

const SCHOOL_LAT = 51.4493;
const SCHOOL_LNG = -0.9536;
const CAT3_MILES = 4.6;
const CAT3_METERS = CAT3_MILES * 1609.34;
const ALL_CAT5_POSTCODES = [...CAT4_POSTCODES_LIST, ...CAT5_ONLY_POSTCODES_LIST];

const CAT3_COLOR = "#3b9ed6";
const CAT4_COLOR = "#4caf7a";
const CAT5_COLOR = "#e6952e";

function getPostcodePrefix(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?\d/);
  if (match) return match[1];
  const match2 = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)$/);
  if (match2) return match2[1];
  return cleaned;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CatchmentResult {
  postcode: string;
  prefix: string;
  distMiles: number;
  categories: string[];
  lat: number;
  lng: number;
  inCatchment: boolean;
}

interface CatchmentMapProps {
  onResult?: (result: CatchmentResult | null) => void;
  externalPostcode?: string;
}

const CatchmentMap = ({ onResult, externalPostcode }: CatchmentMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CatchmentResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(["cat3", "cat4", "cat5"]));
  const layersRef = useRef<{ cat3: L.Layer[]; cat4: L.Layer[]; cat5: L.Layer[] }>({
    cat3: [],
    cat4: [],
    cat5: [],
  });

  const toggleCategory = useCallback(
    (cat: string) => {
      setActiveCategories((prev) => {
        const next = new Set(prev);
        if (next.has(cat)) next.delete(cat);
        else next.add(cat);
        return next;
      });
    },
    []
  );

  // Close school dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setShowSchoolDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([SCHOOL_LAT, SCHOOL_LNG], 10);
    mapInstance.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      html: `<div class="school-marker"><div class="school-marker-pulse"></div><div class="school-marker-dot"></div></div>`,
      iconSize: [24, 24],
      className: "",
    });
    L.marker([SCHOOL_LAT, SCHOOL_LNG], { icon: schoolIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:'Open Sans',sans-serif;text-align:center;padding:4px 0;">
          <strong style="font-size:14px;">Reading School</strong><br/>
          <span style="font-size:11px;opacity:0.7;">Erleigh Road Gate</span>
        </div>`
      );

    // Cat 3 circle
    const circle = L.circle([SCHOOL_LAT, SCHOOL_LNG], {
      radius: CAT3_METERS,
      color: CAT3_COLOR,
      fillColor: CAT3_COLOR,
      fillOpacity: 0.06,
      weight: 2,
      dashArray: "8 6",
    }).addTo(map);
    circle.bindTooltip("Category 3 — 4.6 mi radius", { sticky: true, className: "map-tooltip" });
    layersRef.current.cat3 = [circle];

    // Cat 4 polygons
    CAT4_AREAS.forEach((area) => {
      const polygon = L.polygon(area.coords, {
        color: CAT4_COLOR,
        fillColor: CAT4_COLOR,
        fillOpacity: 0.1,
        weight: 1.5,
      }).addTo(map);
      polygon.bindTooltip(area.name, { sticky: true, className: "map-tooltip" });
      layersRef.current.cat4.push(polygon);
    });

    // Cat 5 polygons
    CAT5_ONLY_AREAS.forEach((area) => {
      const polygon = L.polygon(area.coords, {
        color: CAT5_COLOR,
        fillColor: CAT5_COLOR,
        fillOpacity: 0.1,
        weight: 1.5,
      }).addTo(map);
      polygon.bindTooltip(area.name, { sticky: true, className: "map-tooltip" });
      layersRef.current.cat5.push(polygon);
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Toggle layers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    (["cat3", "cat4", "cat5"] as const).forEach((cat) => {
      layersRef.current[cat].forEach((l) => {
        if (activeCategories.has(cat)) {
          if (!map.hasLayer(l)) l.addTo(map);
        } else {
          if (map.hasLayer(l)) map.removeLayer(l);
        }
      });
    });
  }, [activeCategories]);

  const handleSearch = async (queryOverride?: string) => {
    const q = (queryOverride ?? searchQuery).trim();
    if (!q) {
      setSearchError("Please enter a postcode.");
      return;
    }
    if (!selectedSchool) {
      setSearchError("Please select a primary school.");
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", UK")}&format=json&limit=1&addressdetails=1`
      );
      const data = await res.json();
      if (!data.length) {
        setSearchError("Address not found. Try a full postcode like RG1 5AG.");
        setIsSearching(false);
        return;
      }

      const { lat, lon, address } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      const postcode = address?.postcode || q;
      const prefix = getPostcodePrefix(postcode);
      const distMeters = haversineDistance(SCHOOL_LAT, SCHOOL_LNG, latNum, lngNum);
      const distMiles = distMeters / 1609.34;

      // Place marker
      if (markerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }
      if (mapInstance.current) {
        const pinIcon = L.divIcon({
          html: `<div class="search-marker"></div>`,
          iconSize: [14, 14],
          className: "",
        });
        markerRef.current = L.marker([latNum, lngNum], { icon: pinIcon }).addTo(mapInstance.current);
        mapInstance.current.flyTo([latNum, lngNum], 12, { duration: 1.2 });
      }

      // Check if postcode is in ANY catchment area
      const isInCat3Radius = distMeters <= CAT3_METERS;
      const isPriority = CAT4_POSTCODES_LIST.includes(prefix);
      const isCatchment = ALL_CAT5_POSTCODES.includes(prefix);
      const inCatchment = isInCat3Radius || isPriority || isCatchment;

      // If not in catchment at all, not eligible for any day student category
      const categories: string[] = [];
      if (inCatchment) {
        const isFeeder = FEEDER_SCHOOLS.includes(selectedSchool);
        if (isFeeder) categories.push("Category 3");
        if (isPriority) categories.push("Category 4");
        if (isCatchment) categories.push("Category 5");
      }

      const result: CatchmentResult = { postcode, prefix, distMiles, categories, lat: latNum, lng: lngNum, inCatchment };
      setSearchResult(result);
      onResult?.(result);
    } catch {
      setSearchError("Search failed. Please check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Sync external postcode from eligibility form
  const lastExternalRef = useRef<string>("");
  useEffect(() => {
    if (externalPostcode && externalPostcode !== lastExternalRef.current && externalPostcode.length >= 3) {
      lastExternalRef.current = externalPostcode;
      setSearchQuery(externalPostcode);
      handleSearch(externalPostcode);
    }
  }, [externalPostcode]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResult(null);
    setSearchError(null);
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    mapInstance.current?.flyTo([SCHOOL_LAT, SCHOOL_LNG], 10, { duration: 1 });
    onResult?.(null);
  };

  const legendItems = [
    { key: "cat3", color: CAT3_COLOR, label: "Cat 3 — 4.6 mi radius" },
    { key: "cat4", color: CAT4_COLOR, label: "Cat 4 — Local postcodes" },
    { key: "cat5", color: CAT5_COLOR, label: "Cat 5 — Wider area" },
  ];

  return (
    <div className="space-y-0">
      {/* Floating search bar overlaid on map */}
      <div className="relative z-0">
        <div ref={mapRef} className="w-full h-[560px] rounded-lg overflow-hidden relative z-0" />

        {/* Search overlay */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="max-w-lg mx-auto space-y-2">
            {/* Postcode input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && selectedSchool && handleSearch()}
                placeholder="Enter your postcode or address…"
                className="w-full pl-11 pr-24 py-3 bg-card/95 backdrop-blur-md text-foreground border border-border/50 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm shadow-lg"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button onClick={clearSearch} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim() || !selectedSchool}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-body text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                >
                  {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                </button>
              </div>
            </div>

            {/* Primary school selector */}
            <div className="relative" ref={schoolDropdownRef}>
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={selectedSchool ? selectedSchool : schoolSearch}
                onChange={(e) => {
                  setSchoolSearch(e.target.value);
                  setSelectedSchool("");
                  setShowSchoolDropdown(true);
                }}
                onFocus={() => setShowSchoolDropdown(true)}
                placeholder="Select primary school…"
                className="w-full pl-11 pr-10 py-3 bg-card/95 backdrop-blur-md text-foreground border border-border/50 rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm shadow-lg"
              />
              {selectedSchool && (
                <button
                  onClick={() => { setSelectedSchool(""); setSchoolSearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {showSchoolDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg">
                  {(schoolSearch
                    ? FEEDER_SCHOOLS.filter((s) => s.toLowerCase().includes(schoolSearch.toLowerCase()))
                    : FEEDER_SCHOOLS
                  ).map((school) => (
                    <button
                      key={school}
                      onClick={() => {
                        setSelectedSchool(school);
                        setSchoolSearch("");
                        setShowSchoolDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-body text-foreground hover:bg-primary/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {school}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedSchool("Other (not listed)");
                      setSchoolSearch("");
                      setShowSchoolDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-body text-muted-foreground italic hover:bg-primary/10 transition-colors last:rounded-b-xl"
                  >
                    Other (not listed)
                  </button>
                </div>
              )}
            </div>

            {/* Selected school badge */}
            {selectedSchool && (
              <div className="flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg">
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-body text-foreground truncate">{selectedSchool}</span>
                {FEEDER_SCHOOLS.includes(selectedSchool) && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-semibold whitespace-nowrap">
                    Feeder School ✓
                  </span>
                )}
              </div>
            )}

            {/* Search result card */}
            {(searchResult || searchError) && (
              <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-lg animate-fade-in">
                {searchError ? (
                  <p className="text-sm font-body text-destructive">{searchError}</p>
                ) : searchResult && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-body font-semibold text-foreground">
                        {searchResult.postcode}
                      </span>
                      <span className="text-xs text-muted-foreground font-body">
                        {searchResult.distMiles.toFixed(1)} miles from school
                      </span>
                    </div>

                    {!searchResult.inCatchment ? (
                      <div className="space-y-2">
                        <p className="text-xs font-body font-semibold text-destructive">
                          This postcode is outside the catchment area — not eligible for day student Categories 1–5.
                        </p>
                        <p className="text-[11px] font-body text-muted-foreground">
                          Boarding places are assessed separately and do not depend on home postcode or primary school.
                        </p>
                      </div>
                    ) : searchResult.categories.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {searchResult.categories.map((cat) => (
                            <CategoryBadge key={cat} category={cat} />
                          ))}
                        </div>
                        <p className="text-[11px] font-body text-muted-foreground italic">
                          Boarding places are assessed separately — postcode and school are not relevant.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-body">
                        Not within any specific priority category. You may still be eligible under Category 6 (Others).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-lg">
            <div className="flex flex-col gap-1.5">
              {legendItems.map(({ key, color, label }) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`flex items-center gap-2 text-xs font-body transition-opacity ${
                    activeCategories.has(key) ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-foreground whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Postcode reference */}
      <div className="grid md:grid-cols-2 gap-3 pt-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CAT4_COLOR }} />
            <h4 className="text-xs font-semibold font-body text-foreground uppercase tracking-wider">Category 4 Postcodes</h4>
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
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CAT5_COLOR }} />
            <h4 className="text-xs font-semibold font-body text-foreground uppercase tracking-wider">Category 5 Additional</h4>
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

      <p className="text-[11px] text-muted-foreground font-body italic pt-2">
        ⚠️ Boundaries shown are approximate and for indicative purposes only. Please refer to the official admissions policy.
      </p>
    </div>
  );
};

export default CatchmentMap;
