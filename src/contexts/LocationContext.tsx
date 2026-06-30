import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Location {
  id: string;
  name: string;
  code: string;
  type: "STORE" | "WAREHOUSE" | "EXTERNAL_WAREHOUSE";
  city: string;
}

interface LocationContextType {
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  availableLocations: Location[];
  setAvailableLocations: (locations: Location[]) => void;
  isGlobalView: boolean;
  selectedLocation: Location | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationIdState] = useState<string | null>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("nexastock_selected_location") || null;
    }
    return null;
  });

  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

  // Persist selection to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedLocationId) {
        localStorage.setItem("nexastock_selected_location", selectedLocationId);
      } else {
        localStorage.removeItem("nexastock_selected_location");
      }
    }
  }, [selectedLocationId]);

  const setSelectedLocationId = (id: string | null) => {
    setSelectedLocationIdState(id);
  };

  const isGlobalView = selectedLocationId === null || selectedLocationId === "all";
  const selectedLocation = availableLocations.find(loc => loc.id === selectedLocationId) || null;

  return (
    <LocationContext.Provider
      value={{
        selectedLocationId,
        setSelectedLocationId,
        availableLocations,
        setAvailableLocations,
        isGlobalView,
        selectedLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return context;
}
