import { NextRequest, NextResponse } from 'next/server';
import { fetchEstatPopulation } from '@/lib/api/estat';
import { getMunicipalityByCode } from '@/lib/data/municipalities';
import { EstatApiResponse } from '@/lib/types/population';

export async function POST(req: NextRequest): Promise<NextResponse<EstatApiResponse>> {
  try {
    const body = await req.json();
    const { municipalityCode } = body as { municipalityCode?: string };

    // バリデーション
    if (!municipalityCode) {
      return NextResponse.json(
        { error: '市区町村コードが指定されていません' },
        { status: 400 }
      );
    }

    // 5桁の数字チェック
    if (!/^\d{5}$/.test(municipalityCode)) {
      return NextResponse.json(
        {
          error: '市区町村コードは5桁の数字で入力してください',
          hint: '例: 13104 (新宿区)、27100 (大阪市)',
        },
        { status: 400 }
      );
    }

    const appId = process.env.ESTAT_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: 'サーバー設定エラー: e-Stat APIキーが未設定です' },
        { status: 503 }
      );
    }

    const municipality = getMunicipalityByCode(municipalityCode);
    const { data, tableId } = await fetchEstatPopulation(appId, municipalityCode);

    const responseData = {
      ...data,
      municipalityCode,
      municipalityName: municipality?.name ?? `コード: ${municipalityCode}`,
      source: 'estat' as const,
      tableId,
    };

    return NextResponse.json({ data: responseData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'データ取得に失敗しました';
    return NextResponse.json(
      {
        error: message,
        hint: 'APIキーの有効性・市区町村コードの正確性を確認してください',
      },
      { status: 500 }
    );
  }
}
