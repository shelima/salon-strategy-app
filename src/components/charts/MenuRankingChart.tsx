'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { MenuItem } from '@/lib/types';
import { calcMenuHourlyRate } from '@/lib/calculations';

interface Props {
  menus: MenuItem[];
}

const COLORS = ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];

export function MenuRankingChart({ menus }: Props) {
  const data = [...menus]
    .filter((m) => m.durationMinutes > 0)
    .sort((a, b) => calcMenuHourlyRate(b) - calcMenuHourlyRate(a))
    .slice(0, 8)
    .map((m) => ({
      name: m.name.length > 8 ? m.name.slice(0, 8) + '…' : m.name,
      時間単価: calcMenuHourlyRate(m),
    }));

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-stone-400 text-sm">
        メニューを登録してください
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: '#78716c' }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#57534e' }}
          width={72}
        />
        <Tooltip
          formatter={(value) => [`¥${Number(value).toLocaleString()}/h`, '時間単価']}
          contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }}
        />
        <Bar dataKey="時間単価" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
