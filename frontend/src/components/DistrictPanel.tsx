"use client";

import { District } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

const RISK_CONFIG = {
  safe: {
    label: "SAFE",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    icon: CheckCircle,
  },
  moderate: {
    label: "MODERATE",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    icon: AlertCircle,
  },
  dangerous: {
    label: "DANGEROUS",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    icon: AlertTriangle,
  },
};

const TREND_ICONS = {
  improving: TrendingDown,
  stable: Minus,
  worsening: TrendingUp,
};

const TREND_COLORS = {
  improving: "text-green-400",
  stable: "text-slate-400",
  worsening: "text-red-400",
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-slate-100">{value}</div>
    </div>
  );
}

interface Props {
  district: District;
}

export default function DistrictPanel({ district }: Props) {
  const risk = RISK_CONFIG[district.risk_level];
  const RiskIcon = risk.icon;
  const TrendIcon = TREND_ICONS[district.trend];
  const ratioPct = (district.affordability_ratio * 100).toFixed(1);
  const safeIncome = Math.ceil(district.avg_rent_1br / 0.3 / 1000) * 1000;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{district.name}</h3>
          <div className="text-xs text-slate-500 capitalize">{district.city} · {district.population.toLocaleString()} residents</div>
        </div>
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold", risk.color, risk.bg, risk.border)}>
          <RiskIcon size={12} />
          {risk.label}
        </div>
      </div>

      <div
        className={clsx(
          "flex items-center gap-2 p-3 rounded-lg border",
          ratioPct >= "50" ? "border-red-400/30 bg-red-400/10" : ratioPct >= "30" ? "border-amber-400/30 bg-amber-400/10" : "border-green-400/30 bg-green-400/10"
        )}
      >
        <div className="flex-1">
          <div className="text-xs text-slate-400 mb-0.5">Rent eats {ratioPct}% of income</div>
          <div className={clsx("h-2 rounded-full bg-slate-700 overflow-hidden")}>
            <div
              className={clsx("h-full rounded-full transition-all", risk.color.replace("text-", "bg-").replace("-400", "-500"))}
              style={{ width: `${Math.min(100, parseFloat(ratioPct))}%` }}
            />
          </div>
        </div>
        <div className={clsx("text-xl font-black", risk.color)}>{ratioPct}%</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Avg Rent (1BR)" value={`${district.avg_rent_1br.toLocaleString()} KZT`} />
        <Metric label="Avg Rent (2BR)" value={`${district.avg_rent_2br.toLocaleString()} KZT`} />
        <Metric label="Avg Monthly Salary" value={`${district.avg_salary.toLocaleString()} KZT`} />
        <Metric label="Affordability Index" value={`${district.affordability_index} / 100`} />
      </div>

      <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-3">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Annual rent change</div>
          <div className={clsx("text-sm font-semibold flex items-center gap-1", TREND_COLORS[district.trend])}>
            <TrendIcon size={14} />
            +{district.rent_change_pct}% · {district.trend}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-0.5">Safe income needed</div>
          <div className="text-sm font-semibold text-slate-100">{safeIncome.toLocaleString()} KZT</div>
        </div>
      </div>
    </div>
  );
}
