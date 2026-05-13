import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}

export function Card({ children, className = '', accent = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border ${
        accent ? 'border-amber-200' : 'border-stone-100'
      } p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-stone-600 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

export function StatCard({
  label,
  value,
  unit,
  sub,
  color = 'default',
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: 'default' | 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    default: 'text-stone-800',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-600',
  };

  return (
    <div className="bg-stone-50 rounded-xl p-3">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value}
        {unit && <span className="text-sm font-medium ml-0.5">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}
