import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [unitSystem, setUnitSystem] = useState(
    localStorage.getItem("unitSystem") || "metric"
  );

  useEffect(() => {
    localStorage.setItem("unitSystem", unitSystem);
  }, [unitSystem]);

  const convertValue = (value, type) => {
    if (unitSystem === "metric" || value == null) return value;

    switch (type) {
      case "temperature":
        return (value * 1.8 + 32).toFixed(1);
      case "flowrate":
        return (value * 4.403).toFixed(1); // m3/h to GPM
      case "pressure":
        return (value * 0.000145).toFixed(3); // Pa to psi
      default:
        return value;
    }
  };

  const getUnit = (type) => {
    if (unitSystem === "metric") {
      switch (type) {
        case "temperature": return "°C";
        case "flowrate": return "m³/h";
        case "pressure": return "Pa";
        default: return "";
      }
    } else {
      switch (type) {
        case "temperature": return "°F";
        case "flowrate": return "GPM";
        case "pressure": return "psi";
        default: return "";
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ unitSystem, setUnitSystem, convertValue, getUnit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
