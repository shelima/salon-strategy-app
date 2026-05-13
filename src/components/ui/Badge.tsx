type BadgeVariant = 'safe' | 'normal' | 'caution' | 'danger' | 'info' | 'neutral';

const variants: Record<BadgeVariant, string> = {
  safe: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  caution: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-stone-100 text-stone-700 border-stone-200',
  neutral: 'bg-white text-stone-600 border-stone-200',
};

const labels: Record<BadgeVariant, string> = {
  safe: '安全',
  normal: '普通',
  caution: '注意',
  danger: '危険',
  info: '情報',
  neutral: '−',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ variant, label, size = 'md' }: BadgeProps) {
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${variants[variant]} ${sizeClass}`}
    >
      {label ?? labels[variant]}
    </span>
  );
}

export function getRentRatioBadge(ratio: number): BadgeVariant {
  if (ratio <= 10) return 'safe';
  if (ratio <= 15) return 'normal';
  return 'danger';
}

export function getProfitRateBadge(rate: number): BadgeVariant {
  if (rate >= 30) return 'safe';
  if (rate >= 20) return 'normal';
  if (rate >= 10) return 'caution';
  return 'danger';
}

export function getPaybackBadge(months: number): BadgeVariant {
  if (months <= 12) return 'safe';
  if (months <= 24) return 'normal';
  if (months <= 36) return 'caution';
  return 'danger';
}

export function getScoreBadge(score: number): BadgeVariant {
  if (score >= 75) return 'safe';
  if (score >= 55) return 'normal';
  if (score >= 35) return 'caution';
  return 'danger';
}
