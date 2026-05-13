import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.e-stat.go.jp/rest/3.0/app/json';

export async function GET(req: NextRequest) {
  const appId = process.env.ESTAT_APP_ID!;
  const statsDataId = req.nextUrl.searchParams.get('id') ?? '0003411638';
  const areaCode = req.nextUrl.searchParams.get('area') ?? '13104';

  const params = new URLSearchParams({ appId, statsDataId, cdArea: areaCode, metaGetFlg: 'Y', cntGetFlg: 'N', limit: '20' });
  const res = await fetch(`${BASE}/getStatsData?${params}`, { cache: 'no-store' });
  const json = await res.json();
  const sd = json?.GET_STATS_DATA?.STATISTICAL_DATA;

  return NextResponse.json({
    status: json?.GET_STATS_DATA?.RESULT?.STATUS,
    error: json?.GET_STATS_DATA?.RESULT?.ERROR_MSG,
    totalRecords: sd?.RESULT_INF?.TOTAL_NUMBER,
    classObjs: sd?.CLASS_INF?.CLASS_OBJ,
    sampleValues: (sd?.DATA_INF?.VALUE ?? []).slice(0, 20),
  }, { status: 200 });
}
