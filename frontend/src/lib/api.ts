import {
  CityMeta,
  CityStats,
  District,
  DistrictAnalysis,
  PersonalAffordabilityResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getCities: () => get<CityMeta[]>("/api/cities"),

  getCityDistricts: (city: string) =>
    get<District[]>(`/api/cities/${city}/districts`),

  getCityStats: (city: string) =>
    get<CityStats>(`/api/cities/${city}/stats`),

  getDistrictAnalysis: (districtId: string) =>
    get<DistrictAnalysis>(`/api/analysis/district/${districtId}`),

  getCityAnalysis: (city: string) =>
    get<{ city: string; analysis: string }>(`/api/analysis/city/${city}`),

  getPersonalAffordability: (salary: number, city: string) =>
    post<PersonalAffordabilityResponse>("/api/analysis/personal", {
      salary,
      city,
    }),

  askQuestion: (question: string, city?: string, salary?: number) =>
    post<{ answer: string }>("/api/analysis/query", {
      question,
      city,
      salary,
    }),
};
