'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Train, CheckCircle, ChevronRight, PenLine } from 'lucide-react';
import { searchStations, getStationRank, Station } from '@/lib/data/stations';

interface StationData {
  name: string;
  pref: string;
  line: string;
  passengers: number;
}

interface Props {
  onApply: (data: StationData) => void;
}

export function StationFetcher({ onApply }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [manualPassengers, setManualPassengers] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length >= 1 && !useManual) {
      setSuggestions(searchStations(q));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, useManual]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (s: Station) => {
    setSelected(s);
    setQuery(`${s.name} (${s.line})`);
    setShowSuggestions(false);
  };

  const handleApply = () => {
    if (selected) {
      onApply({ name: selected.name, pref: selected.pref, line: selected.line, passengers: selected.passengers });
    } else if (useManual && manualPassengers) {
      onApply({ name: query || '（手入力）', pref: '', line: '手入力', passengers: Number(manualPassengers) || 0 });
    }
  };

  const canApply = selected !== null || (useManual && Number(manualPassengers) > 0);
  const rank = selected ? getStationRank(selected.passengers) : null;

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setUseManual(false); setSelected(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full border transition-colors ${
            !useManual ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-stone-500 border-stone-200'
          }`}
        >
          <Search size={11} />
          駅名で検索
        </button>
        <button
          onClick={() => { setUseManual(true); setSelected(null); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full border transition-colors ${
            useManual ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-stone-500 border-stone-200'
          }`}
        >
          <PenLine size={11} />
          手入力
        </button>
      </div>

      {!useManual ? (
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Train size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="例：渋谷、新宿、吉祥寺"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => {
                const r = getStationRank(s.passengers);
                return (
                  <button
                    key={`${s.name}-${s.line}-${i}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-50 text-left transition-colors border-b border-stone-50 last:border-0"
                  >
                    <div>
                      <span className="text-sm font-semibold text-stone-800">{s.name}</span>
                      <span className="text-xs text-stone-400 ml-1.5">{s.pref}</span>
                      <div className="text-xs text-stone-400 mt-0.5">{s.line}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-bold text-stone-700">{s.passengers.toLocaleString()}<span className="font-normal ml-0.5">人/日</span></div>
                      <span className={`text-xs font-bold ${r.color}`}>{r.grade}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selected && rank && (
            <div className={`mt-2 p-3 rounded-xl border ${rank.bgColor} ${rank.borderColor}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className={`${rank.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-bold ${rank.color}`}>{selected.name}駅</p>
                    <p className="text-xs text-stone-500">{selected.pref}　{selected.line}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${rank.color}`}>{selected.passengers.toLocaleString()}<span className="text-xs font-normal ml-0.5">人/日</span></p>
                  <p className={`text-xs font-bold ${rank.color}`}>{rank.label}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="駅名（任意）"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={manualPassengers}
              onChange={(e) => setManualPassengers(e.target.value)}
              placeholder="1日平均乗降客数（例：30000）"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm font-mono text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          {manualPassengers && Number(manualPassengers) > 0 && (
            <div className={`p-2.5 rounded-xl border ${getStationRank(Number(manualPassengers)).bgColor} ${getStationRank(Number(manualPassengers)).borderColor}`}>
              <p className={`text-xs font-bold ${getStationRank(Number(manualPassengers)).color}`}>
                {Number(manualPassengers).toLocaleString()}人/日 → {getStationRank(Number(manualPassengers)).label}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={!canApply}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-800 text-white text-sm font-bold rounded-xl disabled:opacity-40 active:bg-amber-900 transition-colors"
      >
        <ChevronRight size={15} />
        駅データをフォームに反映する
      </button>
    </div>
  );
}
