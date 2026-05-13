'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RatioChartProps {
  data: { name: string; value: number; color: string }[];
  total?: number;
}

export function RatioChart({ data, total }: RatioChartProps) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-stone-400 text-sm">
        データを入力してください
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="45%"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {filtered.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const v = Number(value);
            return [`¥${v.toLocaleString()} (${total && total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`, ''];
          }}
          contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span className="text-stone-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
