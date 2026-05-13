import stationsData from './stations.json';

export interface Station {
  name: string;
  pref: string;
  line: string;
  passengers: number;
}

const stations: Station[] = stationsData as Station[];

export function searchStations(query: string): Station[] {
  const q = query.trim();
  if (q.length === 0) return [];

  const exact: Station[] = [];
  const starts: Station[] = [];
  const contains: Station[] = [];

  for (const s of stations) {
    if (s.name === q) {
      exact.push(s);
    } else if (s.name.startsWith(q)) {
      starts.push(s);
    } else if (s.name.includes(q) || s.line.includes(q) || s.pref.includes(q)) {
      contains.push(s);
    }
  }

  return [...exact, ...starts, ...contains].slice(0, 12);
}

export interface StationRank {
  label: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getStationRank(passengers: number): StationRank {
  if (passengers >= 100000) return { label: '非常に強い商圏', grade: 'S', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
  if (passengers >= 50000)  return { label: '強い商圏',       grade: 'A', color: 'text-blue-700',    bgColor: 'bg-blue-50',    borderColor: 'border-blue-200'    };
  if (passengers >= 20000)  return { label: '標準的な商圏',   grade: 'B', color: 'text-amber-700',   bgColor: 'bg-amber-50',   borderColor: 'border-amber-200'   };
  if (passengers >= 10000)  return { label: '小商圏',         grade: 'C', color: 'text-orange-700',  bgColor: 'bg-orange-50',  borderColor: 'border-orange-200'  };
  return                           { label: '注意',           grade: 'D', color: 'text-red-700',     bgColor: 'bg-red-50',     borderColor: 'border-red-200'     };
}

export interface FemaleTargetRank {
  label: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getFemaleTargetRank(femaleTarget: number): FemaleTargetRank {
  if (femaleTarget >= 50000) return { label: '非常に大きい市場', grade: 'S', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
  if (femaleTarget >= 30000) return { label: '大きい市場',       grade: 'A', color: 'text-blue-700',    bgColor: 'bg-blue-50',    borderColor: 'border-blue-200'    };
  if (femaleTarget >= 15000) return { label: '標準市場',         grade: 'B', color: 'text-amber-700',   bgColor: 'bg-amber-50',   borderColor: 'border-amber-200'   };
  if (femaleTarget >= 5000)  return { label: '小市場',           grade: 'C', color: 'text-orange-700',  bgColor: 'bg-orange-50',  borderColor: 'border-orange-200'  };
  return                            { label: '注意',             grade: 'D', color: 'text-red-700',     bgColor: 'bg-red-50',     borderColor: 'border-red-200'     };
}
