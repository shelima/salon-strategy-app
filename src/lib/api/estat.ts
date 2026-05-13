/**
 * e-Stat API クライアント (サーバーサイド専用)
 * https://www.e-stat.go.jp/api/
 *
 * 使用統計表:
 *   0003447398 — 令和2年国勢調査 男女・年齢(5歳階級)・現住地別人口
 *   0003445098 — 令和2年国勢調査 世帯の種類別世帯数
 *   0003353932 — 平成26年経済センサス 産業(小分類)別事業所数・従業者数（市区町村）
 */

import { PopulationData } from '@/lib/types/population';

const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json';

// 確認済み統計表ID
const POPULATION_TABLE  = '0003447398'; // 人口：男女×年齢(5歳)×現住地別
const HOUSEHOLD_TABLE   = '0003445098'; // 世帯数：世帯種類別
const SALON_TABLE       = '0003353932'; // 美容業事業所数（2014年）

function parseValue(s: string | undefined): number {
  if (!s || s === '-' || s === '…' || s === 'X') return 0;
  const n = parseInt(s.replace(/,/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/** 人口データ取得: cat01=gender, cat02=age, cat03=0(現住者) */
async function fetchPopulation(appId: string, areaCode: string) {
  // 一括取得: 女性 × 全年齢 + 総数 × 総数
  const params = new URLSearchParams({
    appId,
    statsDataId: POPULATION_TABLE,
    cdArea: areaCode,
    cdCat03: '0',          // 常住者（現住地による人口）
    metaGetFlg: 'N',
    cntGetFlg: 'N',
  });

  const res = await fetch(`${BASE_URL}/getStatsData?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`e-Stat HTTP ${res.status}`);

  const json = await res.json();
  const apiResult = json?.GET_STATS_DATA?.RESULT;
  if (apiResult?.STATUS !== 0) {
    throw new Error(`e-Stat エラー: ${apiResult?.ERROR_MSG ?? 'データなし'} (コード: ${areaCode})`);
  }

  const values = toArray<Record<string, string>>(
    json?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
  );

  const get = (cat01: string, cat02: string): number => {
    const v = values.find((r) => r['@cat01'] === cat01 && r['@cat02'] === cat02);
    return parseValue(v?.['$']);
  };

  const totalPopulation = get('0', '00'); // 総数 × 総数

  // 女性 (cat01=2) × 各5歳階級
  // 07=30-34, 08=35-39, 09=40-44, 10=45-49, 11=50-54, 12=55-59
  const female30s = get('2', '07') + get('2', '08');
  const female40s = get('2', '09') + get('2', '10');
  const female50s = get('2', '11') + get('2', '12');

  if (totalPopulation === 0) {
    throw new Error(
      `市区町村コード「${areaCode}」の人口データが見つかりませんでした。コードを確認してください。`
    );
  }

  return { totalPopulation, female30s, female40s, female50s };
}

/** 世帯数取得: tab=2020_13(世帯数), cat01=1(一般世帯) */
async function fetchHouseholds(appId: string, areaCode: string): Promise<number> {
  const params = new URLSearchParams({
    appId,
    statsDataId: HOUSEHOLD_TABLE,
    cdArea: areaCode,
    cdTab: '2020_13',  // 世帯数
    cdCat01: '1',      // 一般世帯
    metaGetFlg: 'N',
    cntGetFlg: 'N',
  });

  const res = await fetch(`${BASE_URL}/getStatsData?${params}`, { cache: 'no-store' });
  if (!res.ok) return 0;

  const json = await res.json();
  if (json?.GET_STATS_DATA?.RESULT?.STATUS !== 0) return 0;

  const values = toArray<Record<string, string>>(
    json?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
  );
  return parseValue(values[0]?.['$']);
}

/** 美容室数取得: cat01=5760(783 美容業), tab=003(事業所数) — 2014年経済センサス */
async function fetchBeautySalonCount(appId: string, areaCode: string): Promise<number> {
  const params = new URLSearchParams({
    appId,
    statsDataId: SALON_TABLE,
    cdArea: areaCode,
    cdCat01: '5760',   // 783 美容業
    cdTab: '003',      // 事業所数
    metaGetFlg: 'N',
    cntGetFlg: 'N',
  });

  const res = await fetch(`${BASE_URL}/getStatsData?${params}`, { cache: 'no-store' });
  if (!res.ok) return 0;

  const json = await res.json();
  if (json?.GET_STATS_DATA?.RESULT?.STATUS !== 0) return 0;

  const values = toArray<Record<string, string>>(
    json?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE
  );
  // 最新年のデータを返す（最後の値）
  const lastVal = values[values.length - 1];
  return parseValue(lastVal?.['$']);
}

// ──────────────────────────────────────────────────────────
// メインエントリーポイント
// ──────────────────────────────────────────────────────────

export interface EstatFetchResult {
  data: Omit<PopulationData, 'municipalityCode' | 'municipalityName' | 'source'>;
  tableId: string;
}

export async function fetchEstatPopulation(
  appId: string,
  areaCode: string
): Promise<EstatFetchResult> {
  // 人口・世帯数・美容室数を並列取得
  const [popData, totalHouseholds, beautySalonCount] = await Promise.all([
    fetchPopulation(appId, areaCode),
    fetchHouseholds(appId, areaCode).catch(() => 0),
    fetchBeautySalonCount(appId, areaCode).catch(() => 0),
  ]);

  return {
    data: {
      totalPopulation: popData.totalPopulation,
      totalHouseholds,
      female30s: popData.female30s,
      female40s: popData.female40s,
      female50s: popData.female50s,
      femaleTarget: popData.female30s + popData.female40s + popData.female50s,
      beautySalonCount: beautySalonCount > 0 ? beautySalonCount : undefined,
      dataYear: 2020,
      salonDataYear: beautySalonCount > 0 ? 2014 : undefined,
    },
    tableId: POPULATION_TABLE,
  };
}
