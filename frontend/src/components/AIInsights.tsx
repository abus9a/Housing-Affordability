"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { District, DistrictAnalysis } from "@/lib/types";

interface Props {
  district: District | null;
  city: string;
}

export default function AIInsights({ district, city }: Props) {
  const [analysis, setAnalysis] = useState<DistrictAnalysis | null>(null);
  const [cityAnalysis, setCityAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [activeTab, setActiveTab] = useState<"district" | "city" | "ask">("district");

  useEffect(() => {
    if (!district) return;
    setAnalysis(null);
    setError(null);
    setLoading(true);
    setActiveTab("district");
    api
      .getDistrictAnalysis(district.id)
      .then(setAnalysis)
      .catch(() => setError("Failed to load analysis. Check your Gemini API key."))
      .finally(() => setLoading(false));
  }, [district?.id]);

  useEffect(() => {
    if (activeTab !== "city") return;
    if (cityAnalysis) return;
    setLoading(true);
    setError(null);
    api
      .getCityAnalysis(city)
      .then((r) => setCityAnalysis(r.analysis))
      .catch(() => setError("Failed to load city analysis."))
      .finally(() => setLoading(false));
  }, [activeTab, city]);

  useEffect(() => {
    setCityAnalysis(null);
  }, [city]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const r = await api.askQuestion(question, city);
      setAnswer(r.answer);
    } catch {
      setAnswer("Failed to get answer. Check your Gemini API key.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI Insights</span>
      </div>

      <div className="flex gap-1 mb-3">
        {(["district", "city", "ask"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              activeTab === tab
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab === "district" ? "District" : tab === "city" ? "City" : "Ask AI"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === "district" && (
          <div>
            {!district && (
              <div className="text-sm text-slate-500 text-center py-6">
                Click a district on the map to get AI analysis
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                Analyzing {district?.name}...
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {analysis && !loading && (
              <div className="flex flex-col gap-3">
                {analysis.key_insight && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                    <div className="text-xs font-bold text-indigo-300 mb-1">Key Insight</div>
                    <div className="text-sm text-indigo-100 font-medium">&ldquo;{analysis.key_insight}&rdquo;</div>
                  </div>
                )}
                <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                  {analysis.analysis}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "city" && (
          <div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 size={14} className="animate-spin text-indigo-400" />
                Analyzing {city} market...
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg p-3">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {cityAnalysis && !loading && (
              <div className="text-xs text-slate-400 leading-relaxed">{cityAnalysis}</div>
            )}
          </div>
        )}

        {activeTab === "ask" && (
          <div className="flex flex-col gap-3">
            <form onSubmit={handleAsk} className="flex flex-col gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask about housing in ${city.charAt(0).toUpperCase() + city.slice(1)}…`}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                rows={3}
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                {asking ? <><Loader2 size={12} className="animate-spin" /> Thinking...</> : "Ask"}
              </button>
            </form>
            {answer && (
              <div className="bg-slate-900/60 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
                {answer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
