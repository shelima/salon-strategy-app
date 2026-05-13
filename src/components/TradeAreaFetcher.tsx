'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Train, Download, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { searchMunicipalities } from '@/lib/data/municipalities';
import { searchStations, getStationRank, getFemaleTargetRank, Station } from '@/lib/data/stations';
import { MunicipalityResult, EstatApiResponse } from '@/lib/types/population';

export interface LocationData {
  stationName?: string;
  stationPref?: string;
  stationLine?: string;
  stationPassengers?: number;
  municipalityCode?: string;
  municipalityName?: string;
  totalPopulation?: number;
  totalHouseholds?: number;
  femaleTarget?: number;
  beautySalonCount?: number;
  dataYear?: number;
  salonDataYear?: number;
}

interface Props {
  onApply: (data: LocationData) => void;
}

type FetchState = 'idle' | 'loading' | 'success' | 'partial' | 'error';

export function TradeAreaFetcher({ onApply }: Props) {
  const [stationQuery, setStationQuery] = useState('');
  const [stationSuggestions, setStationSuggestions] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showStation, setShowStation] = useState(false);
  const stationRef = useRef<HTMLDivElement>(null);

  const [munQuery, setMunQuery] = useState('');
  const [munSuggestions, setMunSuggestions] = useState<MunicipalityResult[]>([]);
  const [selectedMun, setSelectedMun] = useState<MunicipalityResult | null>(null);
  const [showMun, setShowMun] = useState(false);
  const munRef = useRef<HTMLDivElement>(null);

  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [result, setResult] = useState<LocationData | null>(null);
  const [stationErr, setStationErr] = useState('');
  const [popErr, setPopErr] = useState('');

  useEffect(() => {
    const q = stationQuery.trim();
    if (q.length >= 1) { setStationSuggestions(searchStations(q)); setShowStation(true); }
    else { setStationSuggestions([]); setShowStation(false); }
  }, [stationQuery]);

  useEffect(() => {
    const q = munQuery.trim();
    if (q.length >= 1) { setMunSuggestions(searchMunicipalities(q)); setShowMun(true); }
    else { setMunSuggestions([]); setShowMun(false); }
  }, [munQuery]);

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
    setStationErr('');
    setPopErr('');
    setResult(null);

    // Station: local lookup (instant)
    let stationData: Partial<LocationData> = {};
    if (selectedStation) {
      stationData = {
        stationName: selectedStation.name,
        stationPref: selectedStation.pref,
        stationLine: selectedStation.line,
        stationPassengers: selectedStation.passengers,
      };
    }

    // Population: e-Stat API
    let popData: Partial<LocationData> = {};
    if (selectedMun) {
      try {
        const res = await fetch('/api/estat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ municipalityCode: selectedMun.code }),
        });
        const json: EstatApiResponse = await res.json();
        if (!res.ok || json.error) {
          setPopErr(json.error ?? 'e-Statデータ取得失敗');
        } else if (json.data) {
          const d = json.data;
          popData = {
            municipalityCode: d.municipalityCode,
            municipalityName: d.municipalityName,
            totalPopulation: d.totalPopulation,
            totalHouseholds: d.totalHouseholds,
            femaleTarget: d.femaleTarget,
            beautySalonCount: d.beautySalonCount,
            dataYear: d.dataYear,
            salonDataYear: d.salonDataYear,
          };
        }
      } catch {
        setPopErr('ネットワークエラー');
      }
    }

    const combined: LocationData = { ...stationData, ...popData };

    if (!combined.stationPassengers && !combined.totalPopulation) {
      setFetchState('error');
      return;
    }

    setResult(combined);

    const stationFailed = !!selectedStation && !combined.stationPassengers;
    const popFailed = !!selectedMun && !combined.totalPopulation;
    setFetchState(stationFailed || popFailed ? 'partial' : 'success');
  };

  const canFetch = selectedStation !== null || selectedMun !== null;
  const isSuccess = fetchState === 'success' || fetchState === 'partial';

  return (
    <div className="space-y-3">
      {/* Station input */}
      <div ref={stationRef} className="relative">
        <p className="text-xs font-medium text-stone-600 mb-1 flex items-center gap-1">
          <Train size={11} />最寄り駅
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

      {/* Municipality input */}
      <div ref={munRef} className="relative">
        <p className="text-xs font-medium text-stone-600 mb-1">市区町村（人口・美容室数取得用）</p>
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

      {/* Fetch button */}
      <button
        onClick={handleFetch}
        disabled={!canFetch || fetchState === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-800 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:bg-amber-900 transition-colors"
      >
        {fetchState === 'loading' ? (
          <><Loader2 size={16} className="animate-spin" />データ取得中...</>
        ) : (
          <><Download size={16} />データを自動取得</>
        )}
      </button>

      {/* Both failed */}
      {fetchState === 'error' && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
          <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">データ取得に失敗しました。手入力に切り替えてください。</p>
        </div>
      )}

      {/* Results */}
      {isSuccess && result && (
        <div className={`p-3 rounded-xl border space-y-2.5 ${fetchState === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className={fetchState === 'success' ? 'text-emerald-600' : 'text-amber-600'} />
            <p className={`text-xs font-bold ${fetchState === 'success' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {fetchState === 'success' ? '取得完了' : '一部取得完了'}
            </p>
          </div>

          {/* Partial failure notices */}
          {stationErr && (
            <div className="flex items-center gap-1.5 text-xs text-orange-700">
              <AlertCircle size={11} className="shrink-0" />駅データ: {stationErr}
            </div>
          )}
          {popErr && (
            <div className="flex items-center gap-1.5 text-xs text-orange-700">
              <AlertCircle size={11} className="shrink-0" />人口データ: {popErr}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {/* Station block */}
            {result.stationPassengers != null && result.stationPassengers > 0 && (() => {
              const r = getStationRank(result.stationPassengers);
              return (
                <>
                  <div className="bg-white rounded-lg p-2 col-span-2">
                    <p className="text-xs text-stone-500">最寄り駅</p>
                    <p className="text-sm font-bold text-stone-800">{result.stationName}駅
                      <span className="text-xs font-normal text-stone-400 ml-1">{result.stationLine}</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-2 col-span-2">
                    <p className="text-xs text-stone-500">1日平均乗降客数</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-base font-bold text-stone-800">
                        {result.stationPassengers.toLocaleString()}
                        <span className="text-xs font-normal ml-0.5">人/日</span>
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${r.bgColor} ${r.borderColor} ${r.color}`}>
                        {r.grade}　{r.label}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Population block */}
            {result.totalPopulation != null && result.totalPopulation > 0 && (
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-stone-500">市区町村人口</p>
                <p className="text-sm font-bold text-stone-800">
                  {result.totalPopulation.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">人</span>
                </p>
                {result.municipalityName && <p className="text-xs text-stone-400 mt-0.5">{result.municipalityName}（{result.dataYear}年）</p>}
              </div>
            )}
            {result.totalHouseholds != null && result.totalHouseholds > 0 && (
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-stone-500">世帯数</p>
                <p className="text-sm font-bold text-stone-800">
                  {result.totalHouseholds.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">世帯</span>
                </p>
              </div>
            )}
            {result.femaleTarget != null && result.femaleTarget > 0 && (() => {
              const r = getFemaleTargetRank(result.femaleTarget!);
              return (
                <div className="bg-white rounded-lg p-2 col-span-2">
                  <p className="text-xs text-stone-500">30〜50代女性（商圏人口）</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-base font-bold text-stone-800">
                      {result.femaleTarget.toLocaleString()}
                      <span className="text-xs font-normal ml-0.5">人</span>
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${r.bgColor} ${r.borderColor} ${r.color}`}>
                      {r.grade}　{r.label}
                    </span>
                  </div>
                </div>
              );
            })()}
            {result.beautySalonCount != null && result.beautySalonCount > 0 && (
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-stone-500">美容室数（{result.salonDataYear ?? 2014}年）</p>
                <p className="text-sm font-bold text-stone-800">
                  {result.beautySalonCount.toLocaleString()}
                  <span className="text-xs font-normal ml-0.5">店</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onApply(result)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-xl active:bg-emerald-800"
          >
            <ChevronRight size={15} />
            フォームに反映する
          </button>
        </div>
      )}
    </div>
  );
}
