'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { calcDiagnosis, calcMonthlyRevenue, calcTotalFixedCosts } from '@/lib/calculations';
import { Card } from '@/components/ui/Card';
import { Badge, getScoreBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  Scissors,
  MapPin,
  Users,
  TrendingUp,
  Calculator,
  Star,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const steps = [
  {
    href: '/area',
    icon: MapPin,
    title: 'エリア情報',
    desc: '駅名・商圏人口・立地タイプなど',
    step: 1,
  },
  {
    href: '/competitor',
    icon: Users,
    title: '競合分析',
    desc: '半径500m・1km内の競合店舗数',
    step: 2,
  },
  {
    href: '/simulation',
    icon: TrendingUp,
    title: '売上シミュレーション',
    desc: 'メニュー・客単価・営業日数',
    step: 3,
  },
  {
    href: '/profit-loss',
    icon: Calculator,
    title: '損益・回収期間',
    desc: '固定費・初期投資・損益分岐点',
    step: 4,
  },
  {
    href: '/diagnosis',
    icon: Star,
    title: '出店診断結果',
    desc: '100点採点・改善提案・総評',
    step: 5,
  },
];

export default function HomePage() {
  const state = useStore();
  const diagnosis = calcDiagnosis(state);
  const monthlyRevenue = calcMonthlyRevenue(state);
  const totalFixed = calcTotalFixedCosts(state);
  const hasData = monthlyRevenue > 0 || state.area.stationName !== '';

  return (
    <div className="max-w-md mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-700 px-5 pt-14 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <Scissors size={20} className="text-amber-200" />
          <span className="text-amber-200 text-xs font-semibold tracking-widest uppercase">
            Salon Strategy
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug mb-1">
          出店戦略
          <br />
          情報局
        </h1>
        <p className="text-amber-200 text-sm mt-2 leading-relaxed">
          美容室・サロンの新規開業・2店舗目出店を
          <br />
          データで判断するシミュレーターです
        </p>
      </div>

      {/* Quick summary if data exists */}
      {hasData && (
        <div className="px-4 -mt-4">
          <Card accent className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-stone-700">現在のスコア</span>
              <Badge variant={getScoreBadge(diagnosis.score)} size="lg" label={`${diagnosis.score}点`} />
            </div>
            <ProgressBar
              value={diagnosis.score}
              max={100}
              color={diagnosis.score >= 75 ? 'green' : diagnosis.score >= 55 ? 'amber' : 'red'}
            />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-xs text-stone-400">月間売上予測</p>
                <p className="text-lg font-bold text-stone-800">
                  ¥{(monthlyRevenue / 10000).toFixed(1)}<span className="text-xs">万</span>
                </p>
              </div>
              <div className="bg-stone-50 rounded-xl p-2.5">
                <p className="text-xs text-stone-400">月間固定費</p>
                <p className="text-lg font-bold text-stone-800">
                  ¥{(totalFixed / 10000).toFixed(1)}<span className="text-xs">万</span>
                </p>
              </div>
            </div>
            {diagnosis.risks[0] && diagnosis.risks[0] !== 'データを入力するとリスクが表示されます' && (
              <div className="flex items-start gap-2 mt-3 p-2.5 bg-red-50 rounded-xl">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{diagnosis.risks[0]}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Steps */}
      <div className="px-4 pt-2 pb-4 space-y-3">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
          {hasData ? '入力ステップ' : '入力ステップ — ここから始めましょう'}
        </p>
        {steps.map(({ href, icon: Icon, title, desc, step }) => (
          <Link key={href} href={href}>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex items-center gap-4 active:bg-stone-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-amber-800" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full">
                    STEP {step}
                  </span>
                </div>
                <p className="font-semibold text-stone-800 text-sm mt-0.5">{title}</p>
                <p className="text-xs text-stone-400 truncate">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-stone-300 shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Info banner */}
      <div className="mx-4 mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">全データはブラウザに自動保存されます。</span>
          <br />
          ページを再読み込みしてもデータは残ります。将来的にJSTAT MAP・RESAS・ホットペッパーとの連携にも対応予定です。
        </p>
      </div>
    </div>
  );
}
