export interface District {
  id: string;
  name: string;
  city: string;
  avg_rent_1br: number;
  avg_rent_2br: number;
  avg_salary: number;
  affordability_ratio: number;
  affordability_index: number;
  risk_level: "safe" | "moderate" | "dangerous";
  population: number;
  lat: number;
  lng: number;
  rent_change_pct: number;
  trend: "improving" | "stable" | "worsening";
}

export interface CityStats {
  city: string;
  city_name: string;
  avg_rent: number;
  avg_salary: number;
  affordability_index: number;
  total_districts: number;
  safe_districts: number;
  moderate_districts: number;
  dangerous_districts: number;
}

export interface CityMeta {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
}

export interface DistrictAnalysis {
  district_id: string;
  district_name: string;
  analysis: string;
  key_insight: string;
}

export interface PersonalAffordabilityResponse {
  salary: number;
  city: string;
  affordable_districts: string[];
  borderline_districts: string[];
  expensive_districts: string[];
  recommendation: string;
}

export type RiskLevel = "safe" | "moderate" | "dangerous";
