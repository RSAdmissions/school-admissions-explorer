import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Circle, Grid3X3, Globe } from "lucide-react";
import { CAT4_POSTCODES_LIST, CAT5_ONLY_POSTCODES_LIST } from "@/data/postcodeAreas";

const SCHOOL_LAT = 51.4543;
const SCHOOL_LNG = -0.9465;
const RADIUS_MILES = 4.6;
const RADIUS_METERS = RADIUS_MILES * 1609.34;

const ALL_CAT5_POSTCODES = [...CAT4_POSTCODES_LIST, ...CAT5_ONLY_POSTCODES_LIST];

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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CatchmentMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ text: string; categories: string[] } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([SCHOOL_LAT, SCHOOL_LNG], 11);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      html: `<div style="background:hsl(330,100%,70%);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
      iconSize: [18, 18],
      className: "",
    });
    L.marker([SCHOOL_LAT, SCHOOL_LNG], { icon: schoolIcon })
      .addTo(map)
      .bindPopup("<strong>Reading School</strong><br/>Erleigh Road Gate");

    // Category 3 circle — the only overlay
    L.circle([SCHOOL_LAT, SCHOOL_LNG], {
      radius: RADIUS_METERS,
      color: "hsl(200, 70%, 50%)",
      fillColor: "hsl(200, 70%, 50%)",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "8 5",
    })
      .addTo(map)
      .bindTooltip("Category 3: 4.6 mile radius", { sticky: true });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchResult(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ", UK")}&format=json&limit=1&addressdetails=1`
      );
      const data = await res.json();
      if (!data.length) {
        setSearchResult({ text: "Address not found. Please try a more specific search.", categories: [] });
        return;
      }

      const { lat, lon, address } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      const postcode = address?.postcode || "";
      const prefix = getPostcodePrefix(postcode);
      const distMeters = haversineDistance(SCHOOL_LAT, SCHOOL_LNG, latNum, lngNum);
      const distMiles = distMeters / 1609.34;

      if (markerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }
      if (mapInstance.current) {
        const pinIcon = L.divIcon({
          html: `<div style="background:hsl(330,100%,70%);width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [12, 12],
          className: "",
        });
        markerRef.current = L.marker([latNum, lngNum], { icon: pinIcon }).addTo(mapInstance.current);
        mapInstance.current.setView([latNum, lngNum], 13);
      }

      const categories: string[] = [];
      if (distMeters <= RADIUS_METERS) categories.push("Category 3");
      if (CAT4_POSTCODES_LIST.includes(prefix)) categories.push("Category 4");
      if (ALL_CAT5_POSTCODES.includes(prefix)) categories.push("Category 5");

      const locationLabel = postcode || searchQuery;
      const distLabel = `${distMiles.toFixed(1)} miles from school`;

      if (categories.length === 0) {
        setSearchResult({
          text: `${locationLabel} (${prefix || "?"}) — ${distLabel}. This address does not fall within any catchment category.`,
          categories: [],
        });
      } else {
        setSearchResult({
          text: `${locationLabel} (${prefix || "?"}) — ${distLabel}.`,
          categories,
        });
      }
    } catch {
      setSearchResult({ text: "Search failed. Please try again.", categories: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search your address or postcode..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground border border-border rounded-md placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-body text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-body text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div className="p-4 bg-secondary rounded-md border border-border">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-body text-foreground">{searchResult.text}</p>
              {searchResult.categories.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {searchResult.categories.map((cat) => (
                    <span
                      key={cat}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full font-body ${
                        cat === "Category 3"
                          ? "bg-cat3/20 text-cat3"
                          : cat === "Category 4"
                          ? "bg-cat4/20 text-cat4"
                          : "bg-cat5/20 text-cat5"
                      }`}
                    >
                      ✓ {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full h-[500px] rounded-md border border-border" />

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Cat 3 */}
        <div className="p-4 rounded-md border border-border bg-secondary/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cat3/20 flex items-center justify-center">
              <Circle className="h-4 w-4 text-cat3" />
            </div>
            <h4 className="font-heading font-semibold text-foreground text-sm">Category 3</h4>
          </div>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            Within a <strong className="text-foreground">4.6 mile radius</strong> of Reading School's Erleigh Road gate. Shown as the dashed circle on the map.
          </p>
        </div>

        {/* Cat 4 */}
        <div className="p-4 rounded-md border border-border bg-secondary/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cat4/20 flex items-center justify-center">
              <Grid3X3 className="h-4 w-4 text-cat4" />
            </div>
            <h4 className="font-heading font-semibold text-foreground text-sm">Category 4</h4>
          </div>
          <div className="flex flex-wrap gap-1">
            {CAT4_POSTCODES_LIST.map((pc) => (
              <span key={pc} className="text-[11px] font-body font-medium px-1.5 py-0.5 rounded bg-cat4/10 text-cat4">
                {pc}
              </span>
            ))}
          </div>
        </div>

        {/* Cat 5 */}
        <div className="p-4 rounded-md border border-border bg-secondary/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cat5/20 flex items-center justify-center">
              <Globe className="h-4 w-4 text-cat5" />
            </div>
            <h4 className="font-heading font-semibold text-foreground text-sm">Category 5</h4>
          </div>
          <p className="text-[11px] text-muted-foreground font-body mb-1.5">All Cat 4 postcodes plus:</p>
          <div className="flex flex-wrap gap-1">
            {CAT5_ONLY_POSTCODES_LIST.map((pc) => (
              <span key={pc} className="text-[11px] font-body font-medium px-1.5 py-0.5 rounded bg-cat5/10 text-cat5">
                {pc}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-body italic">
        ⚠️ The circle boundary is approximate. Please refer to the official admissions policy for definitive catchment information.
      </p>
    </div>
  );
};

export default CatchmentMap;
