'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardTitle } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { searchStations, getStationRank, getFemaleTargetRank, Station } from '@/lib/data/stations';
import { searchMunicipalities } from '@/lib/data/municipalities';
import { MunicipalityResult, EstatApiResponse } from '@/lib/types/population';
import { calcMonthlyRevenue, calcInitialInvestment } from '@/lib/calculations';
import { MapPin, Search, Download, Loader2, CheckCircle, AlertCircle, Train } from 'lucide-react';

type FetchState = 'idle' | 'loading' | 'success' | 'partial' | 'error';

function calcAreaScore(passengers: number, femaleTarget: number, beautySalonCount: number): number {
  let score = 0;
  if (passengers >= 100000) score += 40;
  else if (passengers >= 50000) score += 32;
  else if (passengers >= 20000) score += 20;
  else if (passengers >= 10000) score += 10;
  else if (passengers > 0) score += 3;

  if (femaleTarget >= 50000) score += 35;
  else if (femaleTarget >= 30000) score += 28;
  else if (femaleTarget >= 15000) score += 18;
  else if (femaleTarget >= 5000) score += 8;
  else if (femaleTarget > 0) score += 2;

  const perSalon = beautySalonCount > 0 ? femaleTarget / beautySalonCount : 0;
  if (perSalon >= 500) score += 25;
  else if (perSalon >= 300) score += 18;
  else if (perSalon >= 150) score += 10;
  else if (perSalon >= 50) score += 4;
  else if (perSalon > 0) score += 1;

  return Math.min(100, Math.round(score));
}

function scoreStyle(score: number) {
  if (score >= 80) return { label: '非常に良い', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  if (score >= 65) return { label: '良い',       color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    bar: 'bg-blue-500'    };
  if (score >= 50) return { label: '標準',       color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   bar: 'bg-amber-500'   };
  if (score >= 35) return { label: '条件次第',   color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  bar: 'bg-orange-500'  };
  return               { label: '要検討',       color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     bar: 'bg-red-500'     };
}

export default function AreaPage() {
  const state = useStore();
  const { area, property, updateArea, updateProperty, updateFixedCosts } = state;

  const [stationQuery, setStationQuery] = useState(area.stationName ? `${area.stationName}（${area.stationLine}）` : '');
  const [stationSuggestions, setStationSuggestions] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showStation, setShowStation] = useState(false);
  const stationRef = useRef<HTMLDivElement>(null);

  const [munQuery, setMunQuery] = useState(area.municipalityName || '');
  const [munSuggestions, setMunSuggestions] = useState<MunicipalityResult[]>([]);
  const [selectedMun, setSelectedMun] = useState<MunicipalityResult | null>(null);
  const [showMun, setShowMun] = useState(false);
  const munRef = useRef<HTMLDivElement>(null);

  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [popError, setPopError] = useState('');

  useEffect(() => {
    const q = stationQuery.trim();
    if (q.length >= 1 && !selectedStation) {
      setStationSuggestions(searchStations(q));
      setShowStation(true);
    } else {
      setStationSuggestions([]);
      setShowStation(false);
    }
  }, [stationQuery, selectedStation]);

  useEffect(() => {
    const q = munQuery.trim();
    if (q.length >= 1 && !selectedMun) {
      setMunSuggestions(searchMunicipalities(q));
      setShowMun(true);
    } else {
      setMunSuggestions([]);
      setShowMun(false);
    }
  }, [munQuery, selectedMun]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stationRef.current && !stationRef.current.contains(e.target as Node)) setShowStation(false);
      if (munRef.current && !munRef.current.contains(e.target as Node)) setShowMun(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFetch = async () => {
    if (!selectedStation && !selectedMun) return;
    setFetchState('loading');
    setPopError('');

    if (selectedStation) {
      updateArea({
        stationName: selectedStation.name,
        stationPref: selectedStation.pref,
        stationLine: selectedStation.line,
        stationPassengers: selectedStation.passengers,
      });
    }

    let popOk = true;
    if (selectedMun) {
      try {
        const res = await fetch('/api/estat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ municipalityCode: selectedMun.code }),
        });
        const json: EstatApiResponse = await res.json();
        if (!res.ok || json.error) {
          setPopError(json.error ?? 'e-Statデータ取得失敗');
          popOk = false;
        } else if (json.data) {
          const d = json.data;
          updateArea({
            municipalityName: d.municipalityName,
            tradeAreaPopulation: d.totalPopulation,
            households: d.totalHouseholds,
            female30s: d.female30s,
            female40s: d.female40s,
            female50s: d.female50s,
            femalePopulation3050: d.femaleTarget,
            beautySalonCount: d.beautySalonCount ?? 0,
          });
        }
      } catch {
        setPopError('ネットワークエラー');
        popOk = false;
      }
    }

    const stationOk = !selectedStation || !!selectedStation;
    setFetchState(!stationOk || !popOk ? 'partial' : 'success');
  };

  const n = (val: number) => (val === 0 ? '' : String(val));
  const setNum = (fn: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => fn(Number(e.target.value) || 0);

  const hasAreaData = area.stationPassengers > 0 || area.femalePopulation3050 > 0;
  const stationRank = area.stationPassengers > 0 ? getStationRank(area.stationPassengers) : null;
  const femaleRank = area.femalePopulation3050 > 0 ? getFemaleTargetRank(area.femalePopulation3050) : null;
  const targetPerSalon = area.femalePopulation3050 > 0 && area.beautySalonCount > 0
    ? Math.round(area.femalePopulation3050 / area.beautySalonCount) : 0;
  const areaScore = hasAreaData
    ? calcAreaScore(area.stationPassengers, area.femalePopulation3050, area.beautySalonCount) : null;
  const ss = areaScore !== null ? scoreStyle(areaScore) : null;

  const monthlyRevenue = calcMonthlyRevenue(state);
  const rentRatio = monthlyRevenue > 0 && property.rent > 0 ? (property.rent / monthlyRevenue) * 100 : null;
  const initialCost = calcInitialInvestment(state);

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="エリア基本情報"
        subtitle="4項目を入力してデータを自動取得"
        icon={<MapPin size={20} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* ── 入力フォーム ── */}
        <Card accent>
          <CardTitle>基本情報を入力</CardTitle>
          <div className="space-y-3 mt-3">

            {/* 駅名 */}
            <div ref={stationRef} className="relative">
              <p className="text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
                <Train size={11} />① 駅名
              </p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={stationQuery}
                  onChange={(e) => { setStationQuery(e.target.value); setSelectedStation(null); setFetchState('idle'); }}
                  onFocus={() => stationSuggestions.length > 0 && setShowStation(true)}
                  placeholder="例：渋谷、吉祥寺、たまプラーザ"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              {showStation && stationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden max-h-52 overflow-y-auto">
                  {stationSuggestions.map((s, i) => (
                    <button
                      key={`${s.name}-${s.line}-${i}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedStation(s);
                        setStationQuery(`${s.name}（${s.line}）`);
                        setShowStation(false);
                        setFetchState('idle');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-50 text-left border-b border-stone-50 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-semibold text-stone-800">{s.name}</span>
                        <span className="text-xs text-stone-400 ml-1">{s.pref}</span>
                        <div className="text-xs text-stone-400">{s.line}</div>
                      </div>
                      <span className="text-xs font-bold text-stone-600 shrink-0 ml-2">
                        {s.passengers >= 10000
                          ? `${(s.passengers / 10000).toFixed(0)}万人/日`
                          : `${s.passengers.toLocaleString()}人/日`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedStation && (
                <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle size={11} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">{selectedStation.name}駅</span>
                  <span className="text-xs text-emerald-600">{selectedStation.line}</span>
                  <span className="text-xs font-mono text-emerald-700 ml-auto">{selectedStation.passengers.toLocaleString()}人/日</span>
                </div>
              )}
            </div>

            {/* 市区町村名 */}
            <div ref={munRef} className="relative">
              <p className="text-xs font-medium text-stone-600 mb-1">② 市区町村名</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={munQuery}
                  onChange={(e) => { setMunQuery(e.target.value); setSelectedMun(null); setFetchState('idle'); }}
                  onFocus={() => munSuggestions.length > 0 && setShowMun(true)}
                  placeholder="例：新宿区、渋谷区、横浜市港北区"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              {showMun && munSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden max-h-52 overflow-y-auto">
                  {munSuggestions.map((m) => (
                    <button
                      key={m.code}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedMun(m);
                        setMunQuery(`${m.prefName} ${m.name}`);
                        setShowMun(false);
                        setFetchState('idle');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-50 text-left border-b border-stone-50 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-semibold text-stone-800">{m.name}</span>
                        <span className="text-xs text-stone-400 ml-1">{m.prefName}</span>
                      </div>
                      <span className="text-xs font-mono text-stone-400">{m.code}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedMun && (
                <div className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle size={11} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">{selectedMun.name}</span>
                  <span className="text-xs text-emerald-600">{selectedMun.prefName}</span>
                  <span className="text-xs font-mono text-emerald-700 ml-auto">{selectedMun.code}</span>
                </div>
              )}
            </div>

            {/* 家賃・初期費用 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-stone-600 mb-1">③ 家賃（月額）</p>
                <InputField
                  label=""
                  type="number"
                  inputMode="numeric"
                  placeholder="150000"
                  value={n(property.rent)}
                  onChange={setNum((v) => {
                    updateProperty({ rent: v });
                    updateFixedCosts({ rent: v });
                  })}
                  unit="円"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-600 mb-1">④ 初期費用（総額）</p>
                <InputField
                  label=""
                  type="number"
                  inputMode="numeric"
                  placeholder="3000000"
                  value={n(property.interiorCost)}
                  onChange={setNum((v) => updateProperty({ interiorCost: v, deposit: 0, keyMoney: 0 }))}
                  unit="円"
                />
              </div>
            </div>

            {/* 自動取得ボタン */}
            <button
              onClick={handleFetch}
              disabled={(!selectedStation && !selectedMun) || fetchState === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-800 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:bg-amber-900 transition-colors"
            >
              {fetchState === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" />データ取得中...</>
              ) : (
                <><Download size={16} />データを自動取得</>
              )}
            </button>

            {popError && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{popError}</p>
              </div>
            )}

            {(fetchState === 'success' || fetchState === 'partial') && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">
                  {fetchState === 'success' ? '取得完了 — 下に結果が表示されています' : '一部取得完了'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ── 取得結果 ── */}
        {hasAreaData && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-amber-700" />
              <CardTitle>エリア基本情報</CardTitle>
            </div>

            <div className="space-y-3">
              {/* 駅 */}
              {area.stationName && stationRank && (
                <div className={`rounded-xl p-3 border ${stationRank.bgColor} ${stationRank.borderColor}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-stone-500 mb-0.5">駅名</p>
                      <p className={`text-base font-bold ${stationRank.color}`}>{area.stationName}駅</p>
                      <p className="text-xs text-stone-500 mt-0.5">{area.stationPref}　{area.stationLine}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xl font-bold ${stationRank.color}`}>
                        {area.stationPassengers >= 10000
                          ? `${(area.stationPassengers / 10000).toFixed(0)}万`
                          : area.stationPassengers.toLocaleString()}
                        <span className="text-xs font-normal ml-0.5">人/日</span>
                      </p>
                      <span className={`text-xs font-bold ${stationRank.color}`}>{stationRank.grade}　{stationRank.label}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 市区町村・人口 */}
              {area.tradeAreaPopulation > 0 && (
                <>
                  {area.municipalityName && (
                    <div className="bg-stone-50 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-stone-500">市区町村名</p>
                      <p className="text-sm font-bold text-stone-800">{area.municipalityName}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-stone-500">総人口</p>
                      <p className="text-sm font-bold text-stone-800">
                        {area.tradeAreaPopulation >= 10000
                          ? `${(area.tradeAreaPopulation / 10000).toFixed(0)}万`
                          : area.tradeAreaPopulation.toLocaleString()}
                        <span className="text-xs font-normal">人</span>
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-stone-500">世帯数</p>
                      <p className="text-sm font-bold text-stone-800">
                        {area.households >= 10000
                          ? `${(area.households / 10000).toFixed(0)}万`
                          : area.households.toLocaleString()}
                        <span className="text-xs font-normal">世帯</span>
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-stone-500">美容室数</p>
                      <p className="text-sm font-bold text-stone-800">{area.beautySalonCount.toLocaleString()}<span className="text-xs font-normal">店</span></p>
                    </div>
                  </div>
                </>
              )}

              {/* 30〜50代女性人口 */}
              {area.femalePopulation3050 > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-amber-700">30〜50代女性人口（ターゲット層）</p>
                    {femaleRank && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border bg-white ${femaleRank.borderColor} ${femaleRank.color}`}>
                        {femaleRank.grade}　{femaleRank.label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '30代', value: area.female30s },
                      { label: '40代', value: area.female40s },
                      { label: '50代', value: area.female50s },
                      { label: '合計', value: area.femalePopulation3050, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className={`rounded-lg p-2 text-center ${highlight ? 'bg-amber-100' : 'bg-white'}`}>
                        <p className="text-xs text-stone-500">{label}</p>
                        <p className={`text-xs font-bold ${highlight ? 'text-amber-800' : 'text-stone-800'}`}>
                          {value > 0
                            ? value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value.toLocaleString()
                            : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1店舗あたりターゲット人口 */}
              {targetPerSalon > 0 && (
                <div className="bg-stone-50 rounded-xl p-3">
                  <p className="text-xs text-stone-500">1店舗あたりターゲット人口</p>
                  <p className="text-xl font-bold text-stone-800 mt-0.5">
                    {targetPerSalon.toLocaleString()}
                    <span className="text-sm font-normal ml-1">人/店</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">30〜50代女性 {area.femalePopulation3050.toLocaleString()}人 ÷ 美容室 {area.beautySalonCount}店</p>
                </div>
              )}

              {/* 出店おすすめ度 */}
              {areaScore !== null && ss && (
                <div className={`rounded-xl p-3 border ${ss.bg} ${ss.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-stone-600">出店おすすめ度</p>
                    <span className={`text-xs font-bold ${ss.color}`}>{ss.label}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className={`text-4xl font-bold ${ss.color}`}>{areaScore}</p>
                    <p className={`text-sm mb-1 ${ss.color}`}>/ 100</p>
                  </div>
                  <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${ss.bar}`} style={{ width: `${areaScore}%` }} />
                  </div>
                </div>
              )}

              {/* 家賃・初期費用 */}
              {(property.rent > 0 || initialCost > 0) && (
                <div className="grid grid-cols-2 gap-2">
                  {property.rent > 0 && (
                    <div className="bg-stone-50 rounded-xl p-2.5">
                      <p className="text-xs text-stone-500">家賃（月額）</p>
                      <p className="text-sm font-bold text-stone-800">¥{property.rent.toLocaleString()}</p>
                      {rentRatio !== null && (
                        <p className={`text-xs font-semibold mt-0.5 ${rentRatio <= 10 ? 'text-emerald-600' : rentRatio <= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                          家賃比率 {rentRatio.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  )}
                  {initialCost > 0 && (
                    <div className="bg-stone-50 rounded-xl p-2.5">
                      <p className="text-xs text-stone-500">初期費用（総額）</p>
                      <p className="text-sm font-bold text-stone-800">¥{initialCost.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
