class SettingsManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SettingsManager, cls).__new__(cls)
            cls._instance.unit_system = "metric"
        return cls._instance

    def toggle_units(self):
        self.unit_system = "imperial" if self.unit_system == "metric" else "metric"
        return self.unit_system

    def convert_value(self, value, type_str):
        if self.unit_system == "metric" or value is None:
            return value
            
        try:
            val = float(value)
            if "temp" in type_str.lower():
                return f"{(val * 1.8 + 32):.1f}"
            if "flow" in type_str.lower():
                return f"{(val * 4.403):.1f}"
            if "pressure" in type_str.lower():
                return f"{(val * 0.000145):.3f}"
            return value
        except:
            return value

    def get_unit(self, type_str):
        if self.unit_system == "metric":
            if "temp" in type_str.lower(): return "°C"
            if "flow" in type_str.lower(): return "m³/h"
            if "pressure" in type_str.lower(): return "Pa"
        else:
            if "temp" in type_str.lower(): return "°F"
            if "flow" in type_str.lower(): return "GPM"
            if "pressure" in type_str.lower(): return "psi"
        return ""

settings_manager = SettingsManager()
