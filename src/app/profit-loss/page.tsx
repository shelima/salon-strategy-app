'use client';

import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardTitle, StatCard } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { Badge, getProfitRateBadge, getRentRatioBadge, getPaybackBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  calcMonthlyRevenue,
  calcTotalFixedCosts,
  calcInitialInvestment,
  MATERIAL_COST_RATE,
} from '@/lib/calculations';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { RatioChart } from '@/components/charts/RatioChart';
import { Calculator } from 'lucide-react';

export default function ProfitLossPage() {
  const state = useStore();
  const { fixedCosts, property, updateFixedCosts } = state;

  const n = (val: number) => (val === 0 ? '' : String(val));
  const setNum = (key: keyof typeof fixedCosts) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFixedCosts({ [key]: Number(e.target.value) || 0 });

  const monthlyRevenue = calcMonthlyRevenue(state);
  const materialCost = monthlyRevenue * MATERIAL_COST_RATE;
  const totalFixed = calcTotalFixedCosts(state);
  const operatingProfit = monthlyRevenue - materialCost - totalFixed;
  const profitRate = monthlyRevenue > 0 ? (operatingProfit / monthlyRevenue) * 100 : 0;
  const breakEven = totalFixed / (1 - MATERIAL_COST_RATE);
  const initialInvestment = calcInitialInvestment(state);
  const paybackMonths = operatingProfit > 0 ? initialInvestment / operatingProfit : 9999;
  const rentRatio =
    monthlyRevenue > 0 ? (fixedCosts.rent / monthlyRevenue) * 100 : 0;
  const laborRatio =
    monthlyRevenue > 0 ? (fixedCosts.laborCost / monthlyRevenue) * 100 : 0;
  const adRatio =
    monthlyRevenue > 0 ? (fixedCosts.hotpepperAds / monthlyRevenue) * 100 : 0;
  const requiredDailyCustomers =
    state.sales.avgCustomerSpend > 0 && state.sales.operatingDaysPerMonth > 0
      ? Math.ceil(breakEven / state.sales.avgCustomerSpend / state.sales.operatingDaysPerMonth)
      : 0;

  const ratioData = [
    { name: '材料費', value: materialCost, color: '#a8a29e' },
    { name: '家賃', value: fixedCosts.rent, color: '#7c3aed' },
    { name: '人件費', value: fixedCosts.laborCost, color: '#2563eb' },
    { name: '広告費', value: fixedCosts.hotpepperAds, color: '#db2777' },
    { name: 'その他固定費', value: totalFixed - fixedCosts.rent - fixedCosts.laborCost - fixedCosts.hotpepperAds, color: '#78716c' },
    { name: '営業利益', value: operatingProfit > 0 ? operatingProfit : 0, color: '#10b981' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="損益・回収期間"
        subtitle="固定費を入力して損益分岐点を確認してください"
        icon={<Calculator size={20} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* 主要指標 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="月間営業利益"
            value={`¥${Math.abs(operatingProfit / 10000).toFixed(1)}`}
            unit="万"
            color={operatingProfit > 0 ? 'green' : 'red'}
            sub={operatingProfit < 0 ? '赤字' : '黒字'}
          />
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-3">
            <p className="text-xs text-stone-400 mb-1">営業利益率</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-stone-800">
                {profitRate.toFixed(1)}<span className="text-sm">%</span>
              </p>
            </div>
            <div className="mt-1">
              <Badge variant={getProfitRateBadge(profitRate)} size="sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-3">
            <p className="text-xs text-stone-400 mb-1">家賃比率</p>
            <p className="text-2xl font-bold text-stone-800">
              {rentRatio.toFixed(1)}<span className="text-sm">%</span>
            </p>
            <div className="mt-1">
              <Badge variant={getRentRatioBadge(rentRatio)} size="sm" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-3">
            <p className="text-xs text-stone-400 mb-1">初期投資回収期間</p>
            <p className="text-2xl font-bold text-stone-800">
              {paybackMonths >= 9999
                ? '∞'
                : paybackMonths < 1
                ? `${Math.round(paybackMonths * 30)}日`
                : `${Math.round(paybackMonths)}`}
              {paybackMonths < 9999 && <span className="text-sm">ヶ月</span>}
            </p>
            <div className="mt-1">
              <Badge
                variant={getPaybackBadge(paybackMonths)}
                size="sm"
                label={
                  paybackMonths <= 12
                    ? '優秀'
                    : paybackMonths <= 24
                    ? '現実的'
                    : paybackMonths <= 36
                    ? 'やや長い'
                    : '危険'
                }
              />
            </div>
          </div>
        </div>

        {/* 固定費入力 */}
        <Card>
          <CardTitle>固定費（月額）</CardTitle>
          <div className="space-y-3">
            <div className="p-2 bg-stone-50 rounded-lg flex justify-between items-center">
              <span className="text-xs text-stone-500">エリアページの家賃+共益費</span>
              <span className="text-xs font-bold text-stone-700">
                ¥{(property.rent + property.managementFee).toLocaleString()}
              </span>
            </div>
            <InputField
              label="家賃（固定費として）"
              type="number"
              inputMode="numeric"
              placeholder="165000"
              value={n(fixedCosts.rent)}
              onChange={setNum('rent')}
              unit="円"
              hint="家賃＋共益費の合計"
            />
            <button
              onClick={() =>
                updateFixedCosts({ rent: property.rent + property.managementFee })
              }
              className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-full"
            >
              エリアページから自動入力
            </button>
            <InputField
              label="水道光熱費"
              type="number"
              inputMode="numeric"
              placeholder="30000"
              value={n(fixedCosts.utilities)}
              onChange={setNum('utilities')}
              unit="円"
            />
            <InputField
              label="通信費"
              type="number"
              inputMode="numeric"
              placeholder="10000"
              value={n(fixedCosts.communication)}
              onChange={setNum('communication')}
              unit="円"
            />
            <InputField
              label="ホットペッパー広告費"
              type="number"
              inputMode="numeric"
              placeholder="50000"
              value={n(fixedCosts.hotpepperAds)}
              onChange={setNum('hotpepperAds')}
              unit="円"
            />
            <InputField
              label="税理士費用"
              type="number"
              inputMode="numeric"
              placeholder="20000"
              value={n(fixedCosts.accountant)}
              onChange={setNum('accountant')}
              unit="円"
            />
            <InputField
              label="保険"
              type="number"
              inputMode="numeric"
              placeholder="10000"
              value={n(fixedCosts.insurance)}
              onChange={setNum('insurance')}
              unit="円"
            />
            <InputField
              label="雑費"
              type="number"
              inputMode="numeric"
              placeholder="20000"
              value={n(fixedCosts.miscellaneous)}
              onChange={setNum('miscellaneous')}
              unit="円"
            />
            <InputField
              label="借入返済"
              type="number"
              inputMode="numeric"
              placeholder="50000"
              value={n(fixedCosts.loanRepayment)}
              onChange={setNum('loanRepayment')}
              unit="円"
            />
            <InputField
              label="人件費"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={n(fixedCosts.laborCost)}
              onChange={setNum('laborCost')}
              unit="円"
              hint="1人サロンの場合は自分の報酬も含める"
            />
            <InputField
              label="その他固定費"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={n(fixedCosts.other)}
              onChange={setNum('other')}
              unit="円"
            />
          </div>

          {/* 合計 */}
          <div className="mt-3 p-3 bg-stone-800 rounded-xl text-white">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-stone-300">固定費合計</span>
              <span className="text-xl font-bold">¥{totalFixed.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* P&L サマリー */}
        {monthlyRevenue > 0 && (
          <Card>
            <CardTitle>月間損益計算書</CardTitle>
            <div className="space-y-2">
              {[
                { label: '月間売上', value: monthlyRevenue, bold: false },
                { label: '材料費（売上×10%）', value: -materialCost, bold: false },
                { label: '固定費合計', value: -totalFixed, bold: false },
                { label: '営業利益', value: operatingProfit, bold: true },
              ].map(({ label, value, bold }) => (
                <div
                  key={label}
                  className={`flex justify-between items-center py-2 ${
                    bold ? 'border-t-2 border-stone-200 pt-2.5' : 'border-b border-stone-50'
                  }`}
                >
                  <span className={`text-sm ${bold ? 'font-bold text-stone-800' : 'text-stone-600'}`}>
                    {label}
                  </span>
                  <span
                    className={`font-bold ${
                      bold
                        ? value >= 0
                          ? 'text-emerald-700 text-lg'
                          : 'text-red-600 text-lg'
                        : value < 0
                        ? 'text-stone-600'
                        : 'text-stone-800'
                    }`}
                  >
                    {value < 0 ? '-' : ''}¥{Math.abs(value).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 売上 vs 費用チャート */}
        {monthlyRevenue > 0 && (
          <Card>
            <CardTitle>月間収支グラフ</CardTitle>
            <RevenueChart
              monthlyRevenue={monthlyRevenue}
              materialCost={materialCost}
              totalFixedCosts={totalFixed}
              operatingProfit={operatingProfit}
            />
          </Card>
        )}

        {/* 費用内訳 */}
        {monthlyRevenue > 0 && (
          <Card>
            <CardTitle>売上の使われ方</CardTitle>
            <RatioChart data={ratioData.filter((d) => d.value > 0)} total={monthlyRevenue} />
          </Card>
        )}

        {/* 比率チェック */}
        {monthlyRevenue > 0 && (
          <Card>
            <CardTitle>主要比率チェック</CardTitle>
            <div className="space-y-3">
              {[
                {
                  label: '家賃比率',
                  value: rentRatio,
                  target: '10%以下が理想',
                  color: rentRatio <= 10 ? 'green' : rentRatio <= 15 ? 'amber' : 'red',
                },
                {
                  label: '人件費率',
                  value: laborRatio,
                  target: '40%以下が目標',
                  color: laborRatio <= 40 ? 'green' : 'amber',
                },
                {
                  label: '広告費率',
                  value: adRatio,
                  target: '5%以下が理想',
                  color: adRatio <= 5 ? 'green' : 'amber',
                },
              ].map(({ label, value, target, color }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-stone-600">{label}</span>
                    <span className="text-sm font-bold text-stone-800">{value.toFixed(1)}%</span>
                  </div>
                  <ProgressBar
                    value={value}
                    max={50}
                    color={color as 'green' | 'amber' | 'red'}
                  />
                  <p className="text-xs text-stone-400 mt-0.5">{target}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 損益分岐点 */}
        {totalFixed > 0 && (
          <Card accent>
            <CardTitle>損益分岐点</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">必要月間売上</span>
                <span className="text-lg font-bold text-stone-800">¥{Math.round(breakEven).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600">必要1日来客数</span>
                <span className="text-lg font-bold text-stone-800">{requiredDailyCustomers} 人</span>
              </div>
              {monthlyRevenue > 0 && (
                <>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-stone-500 mb-1">
                      <span>達成率（現在の売上 / 損益分岐点）</span>
                      <span>{((monthlyRevenue / breakEven) * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar
                      value={monthlyRevenue}
                      max={breakEven}
                      color={monthlyRevenue >= breakEven ? 'green' : 'amber'}
                    />
                  </div>
                  {monthlyRevenue < breakEven && (
                    <p className="text-xs text-red-600 font-medium">
                      あと ¥{(breakEven - monthlyRevenue).toLocaleString()} の売上が必要です
                    </p>
                  )}
                  {monthlyRevenue >= breakEven && (
                    <p className="text-xs text-emerald-700 font-medium">
                      損益分岐点を超えています！ 月¥{(monthlyRevenue - breakEven).toLocaleString()} の余裕があります
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
