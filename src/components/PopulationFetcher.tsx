'use client';

import { useState, useRef, useEffect } from 'react';
import { searchMunicipalities } from '@/lib/data/municipalities';
import { MunicipalityResult, PopulationData, EstatApiResponse } from '@/lib/types/population';
import { Search, Download, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

interface Props {
  onApply: (data: PopulationData) => void;
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

export function PopulationFetcher({ onApply }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MunicipalityResult[]>([]);
  const [selected, setSelected] = useState<MunicipalityResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [useManualCode, setUseManualCode] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [result, setResult] = useState<PopulationData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [hint, setHint] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length >= 1) {
      setSuggestions(searchMunicipalities(q));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  // 外側クリックで候補を閉じる
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (m: MunicipalityResult) => {
    setSelected(m);
    setQuery(`${m.prefName} ${m.name}`);
    setShowSuggestions(false);
    setFetchState('idle');
    setResult(null);
  };

  const targetCode = useManualCode ? manualCode : selected?.code ?? '';

  const handleFetch = async () => {
    if (!targetCode) return;
    setFetchState('loading');
    setErrorMsg('');
    setHint('');
    setResult(null);

    try {
      const res = await fetch('/api/estat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipalityCode: targetCode }),
      });

      const json: EstatApiResponse = await res.json();

      if (!res.ok || json.error) {
        setErrorMsg(json.error ?? 'データ取得に失敗しました');
        setHint(json.hint ?? '');
        setFetchState('error');
        return;
      }

      if (json.data) {
        setResult(json.data);
        setFetchState('success');
      }
    } catch {
      setErrorMsg('ネットワークエラーが発生しました');
      setFetchState('error');
    }
  };

  const handleApply = () => {
    if (result) onApply(result);
  };

  return (
    <div className="space-y-3">
      {/* 検索モード切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseManualCode(false)}
          className={`flex-1 py-2 text-xs font-semibold rounded-full border transition-colors ${
            !useManualCode
              ? 'bg-amber-800 text-white border-amber-800'
              : 'bg-white text-stone-500 border-stone-200'
          }`}
        >
          名前で検索
        </button>
        <button
          onClick={() => setUseManualCode(true)}
          className={`flex-1 py-2 text-xs font-semibold rounded-full border transition-colors ${
            useManualCode
              ? 'bg-amber-800 text-white border-amber-800'
              : 'bg-white text-stone-500 border-stone-200'
          }`}
        >
          コードで入力
        </button>
      </div>

      {!useManualCode ? (
        /* 名前検索 */
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
                setFetchState('idle');
                setResult(null);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="例：新宿区、渋谷区、横浜市港北区"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {/* サジェスト */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden">
              {suggestions.map((m) => (
                <button
                  key={m.code}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(m);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-50 text-left transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-stone-800">{m.name}</span>
                    <span className="text-xs text-stone-400 ml-2">{m.prefName}</span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">{m.code}</span>
                </button>
              ))}
              {suggestions.length === 0 && query.length >= 1 && (
                <div className="px-4 py-3 text-sm text-stone-400">
                  一致する市区町村が見つかりません。コード入力をお試しください。
                </div>
              )}
            </div>
          )}

          {/* 選択済み表示 */}
          {selected && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-emerald-800">{selected.name}</span>
                <span className="text-xs text-emerald-600 ml-2">{selected.prefName}</span>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {selected.code}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* 直接コード入力 */
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                setFetchState('idle');
                setResult(null);
              }}
              placeholder="例：13104（新宿区）"
              className="w-full px-3 py-3 rounded-xl border border-stone-200 bg-stone-50 text-base font-mono text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-stone-400">
            5桁の全国地方公共団体コード。
            <a
              href="https://www.soumu.go.jp/denshijiti/code.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 underline ml-1"
            >
              総務省コード一覧
            </a>
          </p>
        </div>
      )}

      {/* 取得ボタン */}
      <button
        onClick={handleFetch}
        disabled={!targetCode || fetchState === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-800 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:bg-amber-900 transition-colors"
      >
        {fetchState === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            e-Statからデータ取得中...
          </>
        ) : (
          <>
            <Download size={16} />
            人口データを自動取得
          </>
        )}
      </button>

      {/* エラー表示 */}
      {fetchState === 'error' && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
              {hint && <p className="text-xs text-red-600 mt-1">{hint}</p>}
              <p className="text-xs text-stone-500 mt-1.5">
                取得できない場合は下の「手入力」セクションから直接入力してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 取得成功: プレビューと反映ボタン */}
      {fetchState === 'success' && result && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">
              {result.municipalityName} のデータを取得しました（{result.dataYear}年国勢調査）
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '総人口', value: result.totalPopulation.toLocaleString(), unit: '人' },
              { label: '世帯数', value: result.totalHouseholds > 0 ? result.totalHouseholds.toLocaleString() : '—', unit: result.totalHouseholds > 0 ? '世帯' : '' },
              { label: '30〜39歳女性', value: result.female30s.toLocaleString(), unit: '人' },
              { label: '40〜49歳女性', value: result.female40s.toLocaleString(), unit: '人' },
              { label: '50〜59歳女性', value: result.female50s.toLocaleString(), unit: '人' },
              { label: '30〜59歳女性計', value: result.femaleTarget.toLocaleString(), unit: '人' },
              ...(result.beautySalonCount != null ? [{
                label: `美容室数（${result.salonDataYear ?? 2014}年）`,
                value: result.beautySalonCount.toLocaleString(),
                unit: '店'
              }] : []),
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-white rounded-lg p-2">
                <p className="text-xs text-stone-500">{label}</p>
                <p className="text-base font-bold text-stone-800">
                  {value}
                  {unit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-xl active:bg-emerald-800"
          >
            <ChevronRight size={15} />
            フォームに反映する
          </button>

          {result.tableId && (
            <p className="text-xs text-stone-400 text-center">使用統計表ID: {result.tableId}</p>
          )}
        </div>
      )}
    </div>
  );
}
