import { useQuery } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface LocationFilterProps {
  onLocationChange: (locationId: string | null) => void;
  selectedLocationId: string | null;
}

export function LocationFilter({ onLocationChange, selectedLocationId }: LocationFilterProps) {
  const profile = authState.getProfile();
  const role = profile?.role || "";
  
  // Check if user has global access
  const isGlobalAccess = ["business_owner", "super_admin", "operations_manager"].includes(role);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => api.getLocations()
  });

  // Auto-select first location if user is location-scoped and no location selected
  useEffect(() => {
    if (!isGlobalAccess && locations.length > 0 && !selectedLocationId) {
      onLocationChange(locations[0].id);
    }
  }, [locations, isGlobalAccess, selectedLocationId, onLocationChange]);

  // If user has global access or multiple locations, show dropdown
  if (isGlobalAccess || locations.length > 1) {
    return (
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={selectedLocationId || "all"}
          onChange={(e) => onLocationChange(e.target.value === "all" ? null : e.target.value)}
          className="h-8 rounded-lg border border-white/10 bg-black/20 text-xs px-2 outline-none cursor-pointer"
        >
          {isGlobalAccess && <option value="all">All Locations</option>}
          {locations.map((loc: any) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.type})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // If user has only one location, show it as read-only
  if (locations.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          {locations[0].name}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono uppercase">
          ({locations[0].type})
        </span>
      </div>
    );
  }

  return null;
}
