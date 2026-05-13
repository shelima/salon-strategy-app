'use client';

import { useStore } from '@/lib/store';
import { calcDiagnosis, calcMenuHourlyRate } from '@/lib/calculations';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge, getScoreBadge, getProfitRateBadge, getRentRatioBadge, getPaybackBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { MenuRankingChart } from '@/components/charts/MenuRankingChart';
import { RatioChart } from '@/components/charts/RatioChart';
import {
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Crown,
  ArrowUp,
} from 'lucide-react';

const levelLabel: Record<string, string> = {
  safe: '安全',
  normal: '普通',
  caution: '注意',
  danger: '危険',
};

const levelBg: Record<string, string> = {
  safe: 'from-emerald-800 to-emerald-600',
  normal: 'from-blue-800 to-blue-600',
  caution: 'from-amber-800 to-amber-600',
  danger: 'from-red-800 to-red-700',
};

export default function DiagnosisPage() {
  const state = useStore();
  const d = calcDiagnosis(state);

  const ratioData = [
    { name: '材料費', value: d.materialCost, color: '#a8a29e' },
    { name: '家賃', value: state.fixedCosts.rent, color: '#7c3aed' },
    { name: '人件費', value: state.fixedCosts.laborCost, color: '#2563eb' },
    { name: '広告費', value: state.fixedCosts.hotpepperAds, color: '#db2777' },
    {
      name: 'その他',
      value:
        d.totalFixedCosts -
        state.fixedCosts.rent -
        state.fixedCosts.laborCost -
        state.fixedCosts.hotpepperAds,
      color: '#78716c',
    },
    { name: '営業利益', value: d.operatingProfit > 0 ? d.operatingProfit : 0, color: '#10b981' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="出店診断結果"
        subtitle="入力データをもとに出店可否を総合判定します"
        icon={<Star size={20} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* スコアヒーロー */}
        <div
          className={`bg-gradient-to-br ${levelBg[d.level]} rounded-3xl p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold opacity-70 uppercase tracking-widest mb-1">
                出店おすすめ度
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black">{d.score}</span>
                <span className="text-2xl font-bold opacity-70">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black mb-1">{levelLabel[d.level]}</div>
              <p className="text-xs opacity-70">総合判定</p>
            </div>
          </div>
          <ProgressBar
            value={d.score}
            max={100}
            color={d.level === 'safe' ? 'green' : d.level === 'normal' ? 'blue' : d.level === 'caution' ? 'amber' : 'red'}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-xs opacity-70">月間売上予測</p>
              <p className="text-xl font-bold">¥{(d.monthlyRevenue / 10000).toFixed(1)}万</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-xs opacity-70">営業利益</p>
              <p className={`text-xl font-bold ${d.operatingProfit < 0 ? 'text-red-300' : ''}`}>
                {d.operatingProfit < 0 ? '-' : ''}¥{(Math.abs(d.operatingProfit) / 10000).toFixed(1)}万
              </p>
            </div>
          </div>
        </div>

        {/* キー指標バッジ */}
        <Card>
          <CardTitle>主要指標</CardTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: '利益率',
                value: `${d.profitRate.toFixed(1)}%`,
                badge: getProfitRateBadge(d.profitRate),
              },
              {
                label: '家賃比率',
                value: `${d.rentRatio.toFixed(1)}%`,
                badge: getRentRatioBadge(d.rentRatio),
              },
              {
                label: '回収期間',
                value:
                  d.paybackMonths >= 9999
                    ? '∞'
                    : `${Math.round(d.paybackMonths)}ヶ月`,
                badge: getPaybackBadge(d.paybackMonths),
              },
            ].map(({ label, value, badge }) => (
              <div key={label} className="bg-stone-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-stone-500 mb-1">{label}</p>
                <p className="text-base font-bold text-stone-800 mb-1.5">{value}</p>
                <Badge variant={badge} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* 強み */}
        <Card>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" />
              強み
            </span>
          </CardTitle>
          <div className="space-y-2">
            {d.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-emerald-50 rounded-xl">
                <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-sm text-emerald-800">{s}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* リスク */}
        <Card>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600" />
              リスク
            </span>
          </CardTitle>
          <div className="space-y-2">
            {d.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">{r}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 改善案 */}
        <Card>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <Lightbulb size={14} className="text-blue-600" />
              改善案・アドバイス
            </span>
          </CardTitle>
          <div className="space-y-2">
            {d.improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-blue-50 rounded-xl">
                <Lightbulb size={14} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 数値目標 */}
        <Card accent>
          <CardTitle>出店に必要な数値目標</CardTitle>
          <div className="space-y-2">
            {[
              {
                label: '適正家賃（売上の10%以内）',
                value: `¥${Math.round(d.properRent).toLocaleString()}`,
                current:
                  state.fixedCosts.rent > 0
                    ? `現在: ¥${state.fixedCosts.rent.toLocaleString()}`
                    : undefined,
              },
              {
                label: '必要客単価（損益分岐点ベース）',
                value: `¥${d.requiredAvgSpend.toLocaleString()}`,
                current:
                  state.sales.avgCustomerSpend > 0
                    ? `現在: ¥${state.sales.avgCustomerSpend.toLocaleString()}`
                    : undefined,
              },
              {
                label: '必要月間来店人数',
                value: `${d.requiredMonthlyCustomers} 人`,
                current:
                  state.sales.dailyCustomers > 0
                    ? `現在: ${state.sales.dailyCustomers * state.sales.operatingDaysPerMonth}人/月`
                    : undefined,
              },
              {
                label: '必要1日来客数',
                value: `${d.requiredDailyCustomers} 人/日`,
                current:
                  state.sales.dailyCustomers > 0
                    ? `現在: ${state.sales.dailyCustomers}人/日`
                    : undefined,
              },
            ].map(({ label, value, current }) => (
              <div key={label} className="flex justify-between items-start py-2 border-b border-stone-50 last:border-0">
                <div>
                  <p className="text-sm text-stone-600">{label}</p>
                  {current && <p className="text-xs text-stone-400">{current}</p>}
                </div>
                <span className="text-base font-bold text-amber-800 shrink-0 ml-2">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 主力にすべきメニュー */}
        <Card>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <Crown size={14} className="text-amber-600" />
              主力にすべきメニュー
            </span>
          </CardTitle>
          <div className="space-y-2">
            {d.mainMenuRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-amber-50 rounded-xl">
                <Crown size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">{rec}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 値上げ候補メニュー */}
        {d.menusToPriceUp.length > 0 && (
          <Card>
            <CardTitle>
              <span className="flex items-center gap-1.5">
                <ArrowUp size={14} className="text-blue-600" />
                値上げ検討メニュー（時間単価が低い）
              </span>
            </CardTitle>
            <div className="space-y-2">
              {d.menusToPriceUp.slice(0, 4).map((menu) => (
                <div key={menu.id} className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{menu.name}</p>
                    <p className="text-xs text-stone-500">¥{menu.price.toLocaleString()} / {menu.durationMinutes}分</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-700 font-bold">
                      ¥{calcMenuHourlyRate(menu).toLocaleString()}/h
                    </p>
                    <p className="text-xs text-stone-400">目標¥3,000+/h</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 時間単価ランキング */}
        {state.menus.length > 0 && (
          <Card>
            <CardTitle>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-amber-600" />
                時間単価ランキング
              </span>
            </CardTitle>
            <MenuRankingChart menus={state.menus} />
          </Card>
        )}

        {/* 月間収支グラフ */}
        {d.monthlyRevenue > 0 && (
          <Card>
            <CardTitle>月間収支グラフ</CardTitle>
            <RevenueChart
              monthlyRevenue={d.monthlyRevenue}
              materialCost={d.materialCost}
              totalFixedCosts={d.totalFixedCosts}
              operatingProfit={d.operatingProfit}
            />
          </Card>
        )}

        {/* 売上内訳 */}
        {d.monthlyRevenue > 0 && (
          <Card>
            <CardTitle>売上の内訳</CardTitle>
            <RatioChart
              data={ratioData.filter((x) => x.value > 0)}
              total={d.monthlyRevenue}
            />
          </Card>
        )}

        {/* 年間シミュレーション */}
        {d.monthlyRevenue > 0 && (
          <Card>
            <CardTitle>年間シミュレーション</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-1.5 text-xs text-stone-500 font-medium w-20">期間</th>
                    <th className="text-right py-1.5 text-xs text-stone-500 font-medium">売上</th>
                    <th className="text-right py-1.5 text-xs text-stone-500 font-medium">利益</th>
                    <th className="text-right py-1.5 text-xs text-stone-500 font-medium">累計利益</th>
                  </tr>
                </thead>
                <tbody>
                  {[3, 6, 12, 24, 36].map((month) => {
                    const rev = d.monthlyRevenue * month;
                    const profit = d.operatingProfit * month;
                    const recovered = d.initialInvestment > 0
                      ? Math.min(100, (profit / d.initialInvestment) * 100)
                      : 100;
                    return (
                      <tr key={month} className="border-b border-stone-50">
                        <td className="py-2 text-stone-600 font-medium">{month}ヶ月</td>
                        <td className="py-2 text-right text-stone-700">
                          ¥{(rev / 10000).toFixed(0)}万
                        </td>
                        <td className={`py-2 text-right font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {profit < 0 ? '-' : ''}¥{(Math.abs(profit) / 10000).toFixed(0)}万
                        </td>
                        <td className="py-2 text-right text-xs text-stone-400">
                          {d.initialInvestment > 0
                            ? `回収${recovered.toFixed(0)}%`
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* スコア詳細 */}
        <Card>
          <CardTitle>スコア内訳</CardTitle>
          <div className="space-y-3">
            {[
              {
                label: '営業利益率',
                desc: d.profitRate >= 30 ? '35/35' : d.profitRate >= 20 ? '26/35' : d.profitRate >= 10 ? '14/35' : '0/35',
                value: Math.round(d.profitRate >= 30 ? 35 : d.profitRate >= 20 ? 26 : d.profitRate >= 10 ? 14 : 0),
                max: 35,
              },
              {
                label: '家賃比率',
                desc: d.rentRatio <= 10 ? '20/20' : d.rentRatio <= 15 ? '12/20' : '3/20',
                value: Math.round(d.rentRatio <= 10 ? 20 : d.rentRatio <= 15 ? 12 : 3),
                max: 20,
              },
              {
                label: '初期投資回収期間',
                desc:
                  d.paybackMonths <= 12
                    ? '25/25'
                    : d.paybackMonths <= 24
                    ? '20/25'
                    : d.paybackMonths <= 36
                    ? '12/25'
                    : '0/25',
                value: Math.round(
                  d.paybackMonths <= 12 ? 25 : d.paybackMonths <= 24 ? 20 : d.paybackMonths <= 36 ? 12 : 0
                ),
                max: 25,
              },
              {
                label: '競合環境',
                desc: '20点満点',
                value: d.score - Math.round(
                  (d.profitRate >= 30 ? 35 : d.profitRate >= 20 ? 26 : d.profitRate >= 10 ? 14 : 0) +
                  (d.rentRatio <= 10 ? 20 : d.rentRatio <= 15 ? 12 : 3) +
                  (d.paybackMonths <= 12 ? 25 : d.paybackMonths <= 24 ? 20 : d.paybackMonths <= 36 ? 12 : 0)
                ),
                max: 20,
              },
            ].map(({ label, desc, value, max }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-stone-600">{label}</span>
                  <span className="text-sm font-bold text-stone-800">{value}/{max}</span>
                </div>
                <ProgressBar
                  value={value}
                  max={max}
                  color={value >= max * 0.7 ? 'green' : value >= max * 0.4 ? 'amber' : 'red'}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* フッター */}
        <div className="p-4 bg-stone-100 rounded-2xl text-center mb-2">
          <p className="text-xs text-stone-500 leading-relaxed">
            このシミュレーションは参考値です。実際の出店判断は税理士・経営コンサルタントにご相談ください。
          </p>
        </div>
      </div>
    </div>
  );
}
