interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'stone';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const colorMap = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  stone: 'bg-stone-400',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'amber',
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className={`w-full bg-stone-100 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-stone-400 mt-0.5 text-right">{value.toFixed(1)}%</p>
      )}
    </div>
  );
}
