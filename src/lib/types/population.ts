/** e-Stat 国勢調査から取得する人口データ */
export interface PopulationData {
  municipalityCode: string;
  municipalityName: string;
  totalPopulation: number;
  totalHouseholds: number;
  female30s: number;   // 30〜39歳女性
  female40s: number;   // 40〜49歳女性
  female50s: number;   // 50〜59歳女性
  femaleTarget: number; // 30〜59歳女性合計
  beautySalonCount?: number;  // 美容室数（経済センサス）
  populationChangeRate?: number; // 前回比 (%) — 取得できる場合のみ
  dataYear: number;
  salonDataYear?: number;  // 美容室数データの年
  source: 'estat' | 'manual';
  tableId?: string;    // 使用した統計表ID（デバッグ用）
}

/** 市区町村検索結果 */
export interface MunicipalityResult {
  code: string;        // 5桁の全国地方公共団体コード
  name: string;        // 市区町村名
  prefCode: string;    // 都道府県コード (2桁)
  prefName: string;    // 都道府県名
}

/** e-Stat API レスポンス内部型 */
export interface EstatClassItem {
  '@code': string;
  '@name': string;
  '@level'?: string;
  '@unit'?: string;
  '@parentCode'?: string;
}

export interface EstatClassObj {
  '@id': string;
  '@name': string;
  CLASS: EstatClassItem | EstatClassItem[];
}

export interface EstatDataValue {
  [key: string]: string;
  $: string;
}

/** API ルートのレスポンス型 */
export interface EstatApiResponse {
  data?: PopulationData;
  error?: string;
  hint?: string;
}

// ---------------------------------------------------------------------------
// RESAS API — 2025年3月24日提供終了のため直接連携しない
// 将来の代替 API（国土数値情報・総務省統計 REST API 等）への移行を考慮し
// 型定義のみ保持する
// ---------------------------------------------------------------------------

/** 将来拡張用: 地域経済データ（RESAS 後継 API に対応予定） */
export interface RegionalEconomyData {
  municipalityCode: string;
  populationPyramid?: PopulationPyramidEntry[];
  industryComposition?: IndustryEntry[];
  /** データソース識別子 — RESAS 後継確定後に更新 */
  source: 'pending' | string;
}

export interface PopulationPyramidEntry {
  ageGroup: string;
  male: number;
  female: number;
  year: number;
}

export interface IndustryEntry {
  industryCode: string;
  industryName: string;
  value: number;
}
