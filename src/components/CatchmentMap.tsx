import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";

const SCHOOL_LAT = 51.4543;
const SCHOOL_LNG = -0.9465;
const RADIUS_MILES = 4.6;
const RADIUS_METERS = RADIUS_MILES * 1609.34;

const CAT4_POSTCODES = ["RG1", "RG2", "RG30", "RG31", "RG4", "RG5", "RG6", "RG7", "RG8", "RG9", "RG10", "RG40", "RG41"];
const CAT5_ONLY_POSTCODES = ["RG12", "RG14", "RG18", "RG19", "RG26", "RG27", "RG42", "RG45", "GU15", "GU17", "GU19", "GU46", "GU47", "OX10", "SL4", "SL5"];
const CAT5_POSTCODES = [...CAT4_POSTCODES, ...CAT5_ONLY_POSTCODES];

function getPostcodePrefix(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, "");
  // Match the outward code (letters + digits, possibly with trailing letters before the inward code)
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?\d/);
  if (match) return match[1];
  // If no inward code provided, just return the cleaned input
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
  const [searchResult, setSearchResult] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([SCHOOL_LAT, SCHOOL_LNG], 11);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      html: `<div style="background:hsl(330,100%,80%);width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>`,
      iconSize: [14, 14],
      className: "",
    });
    L.marker([SCHOOL_LAT, SCHOOL_LNG], { icon: schoolIcon }).addTo(map).bindPopup("<strong>Reading School</strong><br/>Erleigh Road Gate");

    // Category 3 circle
    L.circle([SCHOOL_LAT, SCHOOL_LNG], {
      radius: RADIUS_METERS,
      color: "hsl(200,70%,50%)",
      fillColor: "hsl(200,70%,50%)",
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map);

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
        setSearchResult("Address not found. Please try a more specific search.");
        return;
      }

      const { lat, lon, address } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);
      const postcode = address?.postcode || "";
      const prefix = getPostcodePrefix(postcode);
      const distMeters = haversineDistance(SCHOOL_LAT, SCHOOL_LNG, latNum, lngNum);
      const distMiles = distMeters / 1609.34;

      // Place marker
      if (markerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }
      if (mapInstance.current) {
        markerRef.current = L.marker([latNum, lngNum]).addTo(mapInstance.current);
        mapInstance.current.setView([latNum, lngNum], 13);
      }

      // Determine categories
      const categories: string[] = [];
      if (distMeters <= RADIUS_METERS) categories.push("Category 3 (within 4.6 mile radius)");
      if (CAT4_POSTCODES.includes(prefix)) categories.push("Category 4");
      if (CAT5_POSTCODES.includes(prefix)) categories.push("Category 5");

      if (categories.length === 0) {
        setSearchResult(
          `📍 ${postcode} (${prefix}) — ${distMiles.toFixed(1)} miles from school. This address does not fall within any catchment category.`
        );
      } else {
        setSearchResult(
          `📍 ${postcode} (${prefix}) — ${distMiles.toFixed(1)} miles from school. Eligible for: ${categories.join(", ")}.`
        );
      }
    } catch {
      setSearchResult("Search failed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
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
            className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground border border-border rounded placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-body text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded font-body text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      {searchResult && (
        <div className="p-3 bg-secondary rounded text-sm font-body">{searchResult}</div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full h-[500px] rounded border border-border" />

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm font-body">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-cat3 inline-block" />
          <span>Category 3 — 4.6 mile radius</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-cat4 inline-block" />
          <span>Category 4 — Local postcodes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-cat5 inline-block" />
          <span>Category 5 — Wider area postcodes</span>
        </div>
      </div>

      {/* Postcode lists */}
      <div className="grid md:grid-cols-2 gap-4 text-sm font-body">
        <div className="p-4 bg-secondary rounded">
          <h4 className="font-semibold text-cat4 mb-2">Category 4 Postcodes</h4>
          <p className="text-muted-foreground">{CAT4_POSTCODES.join(", ")}</p>
        </div>
        <div className="p-4 bg-secondary rounded">
          <h4 className="font-semibold text-cat5 mb-2">Category 5 Additional Postcodes</h4>
          <p className="text-muted-foreground">{CAT5_ONLY_POSTCODES.join(", ")}</p>
        </div>
      </div>
    </div>
  );
};

export default CatchmentMap;
