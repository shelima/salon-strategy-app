'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  monthlyRevenue: number;
  materialCost: number;
  totalFixedCosts: number;
  operatingProfit: number;
}

const fmt = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(1)}万` : `${v.toLocaleString()}`;

export function RevenueChart({ monthlyRevenue, materialCost, totalFixedCosts, operatingProfit }: Props) {
  const data = [
    {
      name: '月間収支',
      売上: monthlyRevenue,
      材料費: materialCost,
      固定費: totalFixedCosts,
      利益: operatingProfit > 0 ? operatingProfit : 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#78716c' }} width={44} />
        <Tooltip
          formatter={(value) => [`¥${Number(value).toLocaleString()}`, '']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="売上" fill="#d97706" radius={[6, 6, 0, 0]} />
        <Bar dataKey="材料費" fill="#a8a29e" radius={[6, 6, 0, 0]} />
        <Bar dataKey="固定費" fill="#78716c" radius={[6, 6, 0, 0]} />
        <Bar dataKey="利益" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
