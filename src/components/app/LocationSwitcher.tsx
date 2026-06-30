import { MapPin, Building2, Warehouse, Globe } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { authState } from "@/lib/api/client";

export function LocationSwitcher() {
  const { selectedLocationId, setSelectedLocationId, availableLocations, isGlobalView, selectedLocation } = useLocation();
  const profile = authState.getProfile();
  const isBusinessOwner = profile?.role === "business_owner" || profile?.role === "super_admin";

  // Don't show switcher if user has only one location and is not business owner
  if (!isBusinessOwner && availableLocations.length <= 1) {
    return null;
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "STORE":
        return <Building2 className="w-3.5 h-3.5" />;
      case "WAREHOUSE":
        return <Warehouse className="w-3.5 h-3.5" />;
      default:
        return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative">
      <select
        value={selectedLocationId || "all"}
        onChange={(e) => setSelectedLocationId(e.target.value === "all" ? null : e.target.value)}
        className="h-9 pl-3 pr-8 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm text-xs text-foreground outline-none focus:border-primary transition-all appearance-none cursor-pointer hover:bg-black/40"
        style={{ minWidth: "180px" }}
      >
        {isBusinessOwner && (
          <option value="all">🌐 All Locations</option>
        )}
        {availableLocations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.type === "STORE" ? "🏬" : "🏭"} {loc.name} ({loc.code})
          </option>
        ))}
      </select>
      
      {/* Visual indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Current selection badge (optional visual) */}
      {!isGlobalView && selectedLocation && (
        <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-primary border border-black"></div>
      )}
    </div>
  );
}
