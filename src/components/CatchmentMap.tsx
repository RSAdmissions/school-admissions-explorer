import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";
import { CAT4_AREAS, CAT5_ONLY_AREAS, CAT4_POSTCODES_LIST, CAT5_ONLY_POSTCODES_LIST } from "@/data/postcodeAreas";

const SCHOOL_LAT = 51.4543;
const SCHOOL_LNG = -0.9465;
const RADIUS_MILES = 4.6;
const RADIUS_METERS = RADIUS_MILES * 1609.34;

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
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CatchmentMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [showCat3, setShowCat3] = useState(true);
  const [showCat4, setShowCat4] = useState(true);
  const [showCat5, setShowCat5] = useState(true);
  const layersRef = useRef<{ cat3: L.Layer[]; cat4: L.Layer[]; cat5: L.Layer[] }>({ cat3: [], cat4: [], cat5: [] });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([SCHOOL_LAT, SCHOOL_LNG], 10);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      html: `<div style="background:hsl(330,100%,80%);width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [16, 16],
      className: "",
    });
    L.marker([SCHOOL_LAT, SCHOOL_LNG], { icon: schoolIcon }).addTo(map).bindPopup("<strong>Reading School</strong><br/>Erleigh Road Gate");

    // Category 3 circle
    const circle = L.circle([SCHOOL_LAT, SCHOOL_LNG], {
      radius: RADIUS_METERS,
      color: CAT3_COLOR,
      fillColor: CAT3_COLOR,
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "6 4",
    }).addTo(map);
    circle.bindTooltip("Category 3: 4.6 mile radius", { sticky: true });
    layersRef.current.cat3 = [circle];

    // Category 4 polygons
    CAT4_AREAS.forEach((area) => {
      const polygon = L.polygon(area.coords, {
        color: CAT4_COLOR,
        fillColor: CAT4_COLOR,
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);
      polygon.bindTooltip(area.name, { sticky: true });
      layersRef.current.cat4.push(polygon);
    });

    // Category 5 only polygons
    CAT5_ONLY_AREAS.forEach((area) => {
      const polygon = L.polygon(area.coords, {
        color: CAT5_COLOR,
        fillColor: CAT5_COLOR,
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(map);
      polygon.bindTooltip(area.name, { sticky: true });
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
    layersRef.current.cat3.forEach(l => showCat3 ? l.addTo(map) : map.removeLayer(l));
  }, [showCat3]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    layersRef.current.cat4.forEach(l => showCat4 ? l.addTo(map) : map.removeLayer(l));
  }, [showCat4]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    layersRef.current.cat5.forEach(l => showCat5 ? l.addTo(map) : map.removeLayer(l));
  }, [showCat5]);

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

      if (markerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }
      if (mapInstance.current) {
        markerRef.current = L.marker([latNum, lngNum]).addTo(mapInstance.current);
        mapInstance.current.setView([latNum, lngNum], 13);
      }

      const categories: string[] = [];
      if (distMeters <= RADIUS_METERS) categories.push("Category 3 (within 4.6 mile radius)");
      if (CAT4_POSTCODES_LIST.includes(prefix)) categories.push("Category 4");
      if (ALL_CAT5_POSTCODES.includes(prefix)) categories.push("Category 5");

      if (categories.length === 0) {
        setSearchResult(
          `📍 ${postcode || searchQuery} (${prefix || "?"}) — ${distMiles.toFixed(1)} miles from school. This address does not fall within any catchment category.`
        );
      } else {
        setSearchResult(
          `📍 ${postcode || searchQuery} (${prefix || "?"}) — ${distMiles.toFixed(1)} miles from school. Eligible for: ${categories.join(", ")}.`
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

      {/* Interactive Legend */}
      <div className="flex flex-wrap gap-4 text-sm font-body">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={showCat3} onChange={(e) => setShowCat3(e.target.checked)} className="accent-[#3b9ed6]" />
          <span className="w-4 h-4 rounded-sm inline-block" style={{ backgroundColor: CAT3_COLOR }} />
          <span>Category 3 — 4.6 mile radius</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={showCat4} onChange={(e) => setShowCat4(e.target.checked)} className="accent-[#4caf7a]" />
          <span className="w-4 h-4 rounded-sm inline-block" style={{ backgroundColor: CAT4_COLOR }} />
          <span>Category 4 — Local postcodes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={showCat5} onChange={(e) => setShowCat5(e.target.checked)} className="accent-[#e6952e]" />
          <span className="w-4 h-4 rounded-sm inline-block" style={{ backgroundColor: CAT5_COLOR }} />
          <span>Category 5 — Wider area</span>
        </label>
      </div>

      {/* Postcode lists */}
      <div className="grid md:grid-cols-2 gap-4 text-sm font-body">
        <div className="p-4 bg-secondary rounded">
          <h4 className="font-semibold mb-2" style={{ color: CAT4_COLOR }}>Category 4 Postcodes</h4>
          <p className="text-muted-foreground">{CAT4_POSTCODES_LIST.join(", ")}</p>
        </div>
        <div className="p-4 bg-secondary rounded">
          <h4 className="font-semibold mb-2" style={{ color: CAT5_COLOR }}>Category 5 Additional Postcodes</h4>
          <p className="text-muted-foreground">{CAT5_ONLY_POSTCODES_LIST.join(", ")}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-body italic">
        ⚠️ Postcode boundaries shown are approximate and for indicative purposes only. Please refer to the official admissions policy for definitive catchment information.
      </p>
    </div>
  );
};

export default CatchmentMap;
