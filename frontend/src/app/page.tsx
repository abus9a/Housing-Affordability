"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, BarChart2, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { District, CityStats, CityMeta } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import DistrictPanel from "@/components/DistrictPanel";
import AffordabilityChart from "@/components/AffordabilityChart";
import AffordabilityCalculator from "@/components/AffordabilityCalculator";
import AIInsights from "@/components/AIInsights";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

const CITY_META: Record<string, CityMeta> = {
  almaty: { id: "almaty", name: "Almaty", center: [43.222, 76.8512], zoom: 12 },
  astana: { id: "astana", name: "Astana", center: [51.1694, 71.4491], zoom: 12 },
};

const RISK_LABEL: Record<string, string> = {
  safe: "Rent < 30% of income",
  moderate: "Rent 30–50% of income",
  dangerous: "Rent > 50% of income",
};

export default function HomePage() {
  const [city, setCity] = useState<"almaty" | "astana">("almaty");
  const [districts, setDistricts] = useState<District[]>([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activePanel, setActivePanel] = useState<"district" | "insights" | "calculator">("district");

  const loadCity = useCallback(async (c: string) => {
    setLoadingData(true);
    setSelectedDistrict(null);
    try {
      const [d, s] = await Promise.all([api.getCityDistricts(c), api.getCityStats(c)]);
      setDistricts(d);
      setStats(s);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadCity(city);
  }, [city, loadCity]);

  function handleDistrictSelect(d: District) {
    setSelectedDistrict(d);
    setActivePanel("district");
  }

  const meta = CITY_META[city];

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Building2 size={14} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-none">Housing Affordability Intelligence</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kazakhstan · Powered by Gemini AI</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(["almaty", "astana"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                city === c
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
              }`}
            >
              {CITY_META[c].name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          {(["safe", "moderate", "dangerous"] as const).map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${r === "safe" ? "bg-green-400" : r === "moderate" ? "bg-amber-400" : "bg-red-400"}`} />
              <span className="hidden lg:block">{RISK_LABEL[r]}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {loadingData && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                Loading {meta.name}...
              </div>
            </div>
          )}
          <MapComponent
            districts={districts}
            selectedDistrict={selectedDistrict}
            onDistrictSelect={handleDistrictSelect}
            center={meta.center}
            zoom={meta.zoom}
          />

          {selectedDistrict && (
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-3 max-w-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={11} className="text-indigo-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Selected District</span>
              </div>
              <div className="text-sm font-bold text-slate-100">{selectedDistrict.name}</div>
              <div className={`text-xs font-semibold mt-0.5 ${
                selectedDistrict.risk_level === "safe" ? "text-green-400" :
                selectedDistrict.risk_level === "moderate" ? "text-amber-400" : "text-red-400"
              }`}>
                Rent eats {(selectedDistrict.affordability_ratio * 100).toFixed(1)}% of income
              </div>
            </div>
          )}
        </div>

        <aside className="w-[360px] shrink-0 border-l border-slate-800 flex flex-col overflow-hidden">
          {stats && (
            <div className="p-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart2 size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{meta.name} City Overview</span>
              </div>
              <StatsCard stats={stats} />
            </div>
          )}

          <div className="flex border-b border-slate-800 shrink-0">
            {([
              { key: "district", label: "District" },
              { key: "insights", label: "AI" },
              { key: "calculator", label: "Calc" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  activePanel === key
                    ? "text-indigo-400 border-b-2 border-indigo-500"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            {activePanel === "district" && (
              <div>
                {!selectedDistrict ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <MapPin size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-400">No district selected</div>
                      <div className="text-xs text-slate-600 mt-1">Click any circle on the map</div>
                    </div>
                    <div className="mt-4 w-full">
                      <div className="text-xs text-slate-500 mb-2 font-medium">All districts</div>
                      <div className="flex flex-col gap-1">
                        {districts.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleDistrictSelect(d)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-left"
                          >
                            <span className="text-xs text-slate-300">{d.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{d.avg_rent_1br.toLocaleString()} KZT</span>
                              <div className={`w-2 h-2 rounded-full ${
                                d.risk_level === "safe" ? "bg-green-400" :
                                d.risk_level === "moderate" ? "bg-amber-400" : "bg-red-400"
                              }`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <DistrictPanel district={selectedDistrict} />
                )}
              </div>
            )}

            {activePanel === "insights" && (
              <div className="h-full">
                <AIInsights district={selectedDistrict} city={city} />
              </div>
            )}

            {activePanel === "calculator" && (
              <AffordabilityCalculator city={city} />
            )}
          </div>
        </aside>
      </div>

      <div className="border-t border-slate-800 px-5 py-4 shrink-0">
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart2 size={12} className="text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {meta.name} — Salary vs Rent by District
          </span>
        </div>
        {districts.length > 0 && (
          <AffordabilityChart districts={districts} onSelect={handleDistrictSelect} />
        )}
      </div>
    </div>
  );
}
