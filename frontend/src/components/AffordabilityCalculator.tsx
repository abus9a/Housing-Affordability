"use client";

import { useState } from "react";
import { Calculator, Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { PersonalAffordabilityResponse } from "@/lib/types";
import clsx from "clsx";

interface Props {
  city: string;
}

function DistrictBadge({ name, type }: { name: string; type: "affordable" | "borderline" | "expensive" }) {
  const styles = {
    affordable: "bg-green-400/10 text-green-400 border-green-400/30",
    borderline: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    expensive: "bg-red-400/10 text-red-400 border-red-400/30",
  };
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium", styles[type])}>
      {name}
    </span>
  );
}

export default function AffordabilityCalculator({ city }: Props) {
  const [salary, setSalary] = useState("");
  const [result, setResult] = useState<PersonalAffordabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    const s = parseInt(salary.replace(/\D/g, ""));
    if (!s || s < 50000) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await api.getPersonalAffordability(s, city);
      setResult(r);
    } catch {
      setError("Calculation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function formatSalary(v: string) {
    const n = v.replace(/\D/g, "");
    return n ? parseInt(n).toLocaleString("en") : "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Calculator size={14} className="text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Personal Affordability</span>
      </div>

      <form onSubmit={handleCalculate} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5">Your monthly salary (KZT)</label>
          <div className="relative">
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(formatSalary(e.target.value))}
              placeholder="e.g. 500,000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">KZT</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !salary}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Calculate"}
        </button>
      </form>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 rounded-lg p-3 flex items-center gap-2">
          <XCircle size={12} />
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-4 text-xs text-slate-500">
            <span>30% threshold: <span className="text-slate-300 font-semibold">{Math.round(result.salary * 0.3).toLocaleString()} KZT/mo</span></span>
            <span>50% threshold: <span className="text-slate-300 font-semibold">{Math.round(result.salary * 0.5).toLocaleString()} KZT/mo</span></span>
          </div>

          {result.affordable_districts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-green-400 font-medium mb-2">
                <CheckCircle size={11} />
                Comfortable ({result.affordable_districts.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.affordable_districts.map((d) => (
                  <DistrictBadge key={d} name={d} type="affordable" />
                ))}
              </div>
            </div>
          )}

          {result.borderline_districts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-2">
                <AlertCircle size={11} />
                Borderline ({result.borderline_districts.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.borderline_districts.map((d) => (
                  <DistrictBadge key={d} name={d} type="borderline" />
                ))}
              </div>
            </div>
          )}

          {result.expensive_districts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mb-2">
                <XCircle size={11} />
                Too Expensive ({result.expensive_districts.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.expensive_districts.map((d) => (
                  <DistrictBadge key={d} name={d} type="expensive" />
                ))}
              </div>
            </div>
          )}

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
            <div className="text-xs font-bold text-indigo-300 mb-1.5 flex items-center gap-1">
              <span className="text-indigo-400">AI</span> Recommendation
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">{result.recommendation}</div>
          </div>
        </div>
      )}
    </div>
  );
}
