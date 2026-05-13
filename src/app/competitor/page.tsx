'use client';

import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { Badge } from '@/components/ui/Badge';
import { Users, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CompetitorPage() {
  const { competitor, updateCompetitor } = useStore();

  const n = (val: number) => (val === 0 ? '' : String(val));
  const setNum = (updater: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updater(Number(e.target.value) || 0);

  const totalWithin1km = competitor.within1km;
  const density =
    totalWithin1km <= 3 ? 'low' : totalWithin1km <= 8 ? 'mid' : 'high';

  const insights: { icon: typeof CheckCircle; text: string; type: 'good' | 'warn' }[] = [];

  if (competitor.specialtyCurlyCount === 0)
    insights.push({ icon: CheckCircle, text: '縮毛矯正特化サロンなし → 差別化チャンス', type: 'good' });
  if (competitor.specialtyHairQualityCount === 0)
    insights.push({ icon: CheckCircle, text: '髪質改善特化サロンなし → 高単価化チャンス', type: 'good' });
  if (competitor.highPriceCount > competitor.lowPriceCount)
    insights.push({ icon: CheckCircle, text: '高単価サロンが多い → 市場が高単価に慣れている', type: 'good' });
  if (competitor.lowPriceCount > competitor.within500m / 2)
    insights.push({ icon: AlertTriangle, text: '低単価サロンが多い → 価格競争リスクあり', type: 'warn' });
  if (competitor.within500m > 8)
    insights.push({ icon: AlertTriangle, text: '500m内に競合が多い → 激戦区', type: 'warn' });
  if (competitor.avgReviewScore >= 4.5)
    insights.push({ icon: AlertTriangle, text: '競合の評価が高い → 差別化が必須', type: 'warn' });

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="競合分析"
        subtitle="出店エリア周辺の競合データを入力してください"
        icon={<Users size={20} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* 競合密度サマリー */}
        <Card accent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-medium">1km圏内の競合密度</p>
              <p className="text-2xl font-bold text-stone-800 mt-0.5">
                {totalWithin1km} <span className="text-sm font-medium">店舗</span>
              </p>
            </div>
            <Badge
              variant={density === 'low' ? 'safe' : density === 'mid' ? 'normal' : 'danger'}
              label={density === 'low' ? '低競合' : density === 'mid' ? '中競合' : '激戦区'}
              size="md"
            />
          </div>
        </Card>

        {/* 店舗数 */}
        <Card>
          <CardTitle>競合店舗数</CardTitle>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="半径500m以内"
                type="number"
                inputMode="numeric"
                placeholder="3"
                value={n(competitor.within500m)}
                onChange={setNum((v) => updateCompetitor({ within500m: v }))}
                unit="店"
              />
              <InputField
                label="半径1km以内"
                type="number"
                inputMode="numeric"
                placeholder="8"
                value={n(competitor.within1km)}
                onChange={setNum((v) => updateCompetitor({ within1km: v }))}
                unit="店"
              />
            </div>
            <InputField
              label="ホットペッパー掲載店舗数"
              type="number"
              inputMode="numeric"
              placeholder="5"
              value={n(competitor.hotpepperListings)}
              onChange={setNum((v) => updateCompetitor({ hotpepperListings: v }))}
              unit="店"
              hint="1km圏内でのHP掲載数"
            />
          </div>
        </Card>

        {/* 単価帯・特化サロン */}
        <Card>
          <CardTitle>単価帯・特化サロン数</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="低単価サロン数"
              type="number"
              inputMode="numeric"
              placeholder="3"
              value={n(competitor.lowPriceCount)}
              onChange={setNum((v) => updateCompetitor({ lowPriceCount: v }))}
              unit="店"
            />
            <InputField
              label="高単価サロン数"
              type="number"
              inputMode="numeric"
              placeholder="2"
              value={n(competitor.highPriceCount)}
              onChange={setNum((v) => updateCompetitor({ highPriceCount: v }))}
              unit="店"
            />
            <InputField
              label="縮毛矯正特化"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={n(competitor.specialtyCurlyCount)}
              onChange={setNum((v) => updateCompetitor({ specialtyCurlyCount: v }))}
              unit="店"
            />
            <InputField
              label="髪質改善特化"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={n(competitor.specialtyHairQualityCount)}
              onChange={setNum((v) => updateCompetitor({ specialtyHairQualityCount: v }))}
              unit="店"
            />
            <InputField
              label="メンズ特化"
              type="number"
              inputMode="numeric"
              placeholder="1"
              value={n(competitor.mensSpecialtyCount)}
              onChange={setNum((v) => updateCompetitor({ mensSpecialtyCount: v }))}
              unit="店"
            />
          </div>
        </Card>

        {/* 競合の料金・評価 */}
        <Card>
          <CardTitle>競合の料金・口コミ</CardTitle>
          <div className="space-y-3">
            <InputField
              label="競合の平均カット料金"
              type="number"
              inputMode="numeric"
              placeholder="4500"
              value={n(competitor.avgCutPrice)}
              onChange={setNum((v) => updateCompetitor({ avgCutPrice: v }))}
              unit="円"
            />
            <InputField
              label="競合の平均カットカラー料金"
              type="number"
              inputMode="numeric"
              placeholder="10000"
              value={n(competitor.avgCutColorPrice)}
              onChange={setNum((v) => updateCompetitor({ avgCutColorPrice: v }))}
              unit="円"
            />
            <InputField
              label="競合の平均口コミ評価"
              type="number"
              inputMode="decimal"
              placeholder="4.2"
              step="0.1"
              min="1"
              max="5"
              value={competitor.avgReviewScore === 4.0 ? '' : String(competitor.avgReviewScore)}
              onChange={(e) => updateCompetitor({ avgReviewScore: Number(e.target.value) || 4.0 })}
              unit="/ 5.0"
              hint="ホットペッパーの星評価平均"
            />
          </div>
        </Card>

        {/* インサイト */}
        {insights.length > 0 && (
          <Card>
            <CardTitle>競合インサイト</CardTitle>
            <div className="space-y-2">
              {insights.map((item, i) => {
                const Icon = item.type === 'good' ? CheckCircle : AlertTriangle;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl ${
                      item.type === 'good' ? 'bg-emerald-50' : 'bg-amber-50'
                    }`}
                  >
                    <Icon
                      size={15}
                      className={item.type === 'good' ? 'text-emerald-600 mt-0.5 shrink-0' : 'text-amber-600 mt-0.5 shrink-0'}
                    />
                    <p className={`text-xs font-medium ${item.type === 'good' ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 価格比較 */}
        {competitor.avgCutPrice > 0 && (
          <Card>
            <CardTitle>競合価格の目安</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">競合平均カット</span>
                <span className="font-bold text-stone-800">¥{competitor.avgCutPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">競合平均カットカラー</span>
                <span className="font-bold text-stone-800">¥{competitor.avgCutColorPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-stone-600">差別化余地（カット）</span>
                <span className="text-sm text-stone-500">
                  {competitor.avgCutPrice < 5000
                    ? '高単価化の余地あり'
                    : '市場平均は高め'}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
