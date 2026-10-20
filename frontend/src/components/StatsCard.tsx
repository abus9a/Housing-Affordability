"use client";

import { CityStats } from "@/lib/types";
import clsx from "clsx";

function StatBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={clsx("text-xl font-black", color)}>{count}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function IndexGauge({ value }: { value: number }) {
  const color = value >= 60 ? "#22C55E" : value >= 40 ? "#F59E0B" : "#EF4444";
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={40} cy={40} r={32} fill="none" stroke="#334155" strokeWidth={8} />
        <circle
          cx={40}
          cy={40}
          r={32}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-black text-slate-100 leading-none">{value.toFixed(0)}</span>
        <span className="text-[9px] text-slate-500 leading-none">INDEX</span>
      </div>
    </div>
  );
}

export default function StatsCard({ stats }: { stats: CityStats }) {
  return (
    <div className="flex items-center gap-4">
      <IndexGauge value={stats.affordability_index} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="text-xs text-slate-500 flex justify-between">
          <span>Avg Rent (1BR)</span>
          <span className="text-slate-300 font-medium">{stats.avg_rent.toLocaleString()} KZT</span>
        </div>
        <div className="text-xs text-slate-500 flex justify-between">
          <span>Avg Salary</span>
          <span className="text-slate-300 font-medium">{stats.avg_salary.toLocaleString()} KZT</span>
        </div>
        <div className="flex justify-around pt-1 border-t border-slate-700">
          <StatBadge count={stats.safe_districts} label="Safe" color="text-green-400" />
          <StatBadge count={stats.moderate_districts} label="Moderate" color="text-amber-400" />
          <StatBadge count={stats.dangerous_districts} label="Danger" color="text-red-400" />
        </div>
      </div>
    </div>
  );
}
