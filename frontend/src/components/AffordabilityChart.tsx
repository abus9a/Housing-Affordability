"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { District } from "@/lib/types";

const RISK_COLORS = {
  safe: "#22C55E",
  moderate: "#F59E0B",
  dangerous: "#EF4444",
};

function fmt(v: number) {
  return v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`;
}

interface Props {
  districts: District[];
  onSelect: (d: District) => void;
}

export default function AffordabilityChart({ districts, onSelect }: Props) {
  const data = districts.map((d) => ({
    name: d.name,
    "Avg Salary": d.avg_salary,
    "Rent 1BR": d.avg_rent_1br,
    riskLevel: d.risk_level,
    district: d,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: "#64748B", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#F8FAFC", fontWeight: 700, marginBottom: 4 }}
            itemStyle={{ color: "#94A3B8" }}
            formatter={(v: number) => [`${v.toLocaleString()} KZT`]}
            cursor={{ fill: "#FFFFFF08" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#94A3B8", paddingTop: 8 }}
          />
          <Bar dataKey="Avg Salary" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="Rent 1BR" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS]}
                cursor="pointer"
                onClick={() => onSelect(entry.district)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
