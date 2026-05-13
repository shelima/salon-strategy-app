import { AppState, MenuItem, DiagnosisResult } from './types';

export const MATERIAL_COST_RATE = 0.10;

export function calcMenuHourlyRate(menu: MenuItem): number {
  if (menu.durationMinutes === 0) return 0;
  return Math.round((menu.price / menu.durationMinutes) * 60);
}

export function calcMonthlyRevenue(state: AppState): number {
  const { sales } = state;
  const serviceRevenue =
    sales.avgCustomerSpend * sales.dailyCustomers * sales.operatingDaysPerMonth;
  return serviceRevenue + (sales.shopSales || 0);
}

export function calcTotalFixedCosts(state: AppState): number {
  return Object.values(state.fixedCosts).reduce((sum, v) => sum + (v || 0), 0);
}

export function calcInitialInvestment(state: AppState): number {
  const { property } = state;
  return (property.deposit || 0) + (property.keyMoney || 0) + (property.interiorCost || 0);
}

export function calcDiagnosis(state: AppState): DiagnosisResult {
  const monthlyRevenue = calcMonthlyRevenue(state);
  const annualRevenue = monthlyRevenue * 12;
  const materialCost = monthlyRevenue * MATERIAL_COST_RATE;
  const totalFixedCosts = calcTotalFixedCosts(state);
  const operatingProfit = monthlyRevenue - materialCost - totalFixedCosts;
  const profitRate = monthlyRevenue > 0 ? (operatingProfit / monthlyRevenue) * 100 : 0;
  const breakEvenRevenue = totalFixedCosts / (1 - MATERIAL_COST_RATE);
  const operatingDays = state.sales.operatingDaysPerMonth || 25;
  const avgSpend = state.sales.avgCustomerSpend || 1;
  const requiredDailyCustomers =
    avgSpend > 0 && operatingDays > 0
      ? Math.ceil(breakEvenRevenue / avgSpend / operatingDays)
      : 0;
  const initialInvestment = calcInitialInvestment(state);
  const paybackMonths = operatingProfit > 0 ? initialInvestment / operatingProfit : 9999;
  const rentRatio =
    monthlyRevenue > 0 ? (state.fixedCosts.rent / monthlyRevenue) * 100 : 0;
  const laborCostRatio =
    monthlyRevenue > 0 ? (state.fixedCosts.laborCost / monthlyRevenue) * 100 : 0;
  const adCostRatio =
    monthlyRevenue > 0 ? (state.fixedCosts.hotpepperAds / monthlyRevenue) * 100 : 0;
  const properRent = monthlyRevenue * 0.1;
  const requiredAvgSpend =
    state.sales.dailyCustomers > 0 && operatingDays > 0
      ? Math.ceil(breakEvenRevenue / state.sales.dailyCustomers / operatingDays)
      : 0;
  const requiredMonthlyCustomers =
    avgSpend > 0 ? Math.ceil(breakEvenRevenue / avgSpend) : 0;

  // Score
  let score = 0;

  // Profit rate (30 pts)
  if (profitRate >= 30) score += 30;
  else if (profitRate >= 20) score += 22;
  else if (profitRate >= 10) score += 12;
  else score += 0;

  // Rent ratio (15 pts)
  if (rentRatio <= 10) score += 15;
  else if (rentRatio <= 15) score += 9;
  else score += 2;

  // Payback (15 pts)
  if (paybackMonths <= 12) score += 15;
  else if (paybackMonths <= 24) score += 12;
  else if (paybackMonths <= 36) score += 7;
  else score += 0;

  // Station passengers (15 pts)
  const sp = state.area.stationPassengers;
  if (sp >= 100000) score += 15;
  else if (sp >= 50000) score += 12;
  else if (sp >= 20000) score += 8;
  else if (sp >= 10000) score += 4;
  else if (sp > 0) score += 1;

  // 30-50代女性人口 (10 pts)
  const ft = state.area.femalePopulation3050;
  if (ft >= 50000) score += 10;
  else if (ft >= 30000) score += 8;
  else if (ft >= 15000) score += 5;
  else if (ft >= 5000) score += 2;
  else if (ft > 0) score += 1;

  // Competitor (15 pts)
  let cScore = 6;
  if (state.competitor.specialtyCurlyCount === 0) cScore += 2;
  if (state.competitor.specialtyHairQualityCount === 0) cScore += 2;
  if (state.competitor.highPriceCount >= state.competitor.lowPriceCount) cScore += 3;
  if (state.competitor.avgReviewScore < 4.0) cScore += 2;
  score += Math.min(15, cScore);

  score = Math.min(100, Math.max(0, Math.round(score)));

  let level: DiagnosisResult['level'];
  if (score >= 75) level = 'safe';
  else if (score >= 55) level = 'normal';
  else if (score >= 35) level = 'caution';
  else level = 'danger';

  const strengths: string[] = [];
  if (profitRate >= 20)
    strengths.push(`営業利益率 ${profitRate.toFixed(1)}% は優秀な水準です`);
  if (rentRatio > 0 && rentRatio <= 10)
    strengths.push(`家賃比率 ${rentRatio.toFixed(1)}% は理想的な10%以内です`);
  if (paybackMonths <= 24)
    strengths.push(`初期投資の回収期間 ${Math.round(paybackMonths)} ヶ月は現実的です`);
  if (sp >= 50000)
    strengths.push(`${sp.toLocaleString()}人/日の乗降客数 — 集客力の高い商圏です`);
  if (ft >= 15000)
    strengths.push(`30〜50代女性 ${ft.toLocaleString()}人と主要ターゲット層が豊富です`);
  if (state.competitor.specialtyCurlyCount === 0)
    strengths.push('縮毛矯正特化サロンがなく差別化チャンスがあります');
  if (state.competitor.specialtyHairQualityCount === 0)
    strengths.push('髪質改善特化サロンがなく高単価化の機会があります');
  if (state.competitor.within500m <= 3)
    strengths.push(`500m圏内の競合が少なく(${state.competitor.within500m}店)、立地優位性があります`);
  if (state.area.hasParking)
    strengths.push('駐車場あり — 郊外エリアでの集客に有利です');
  if (strengths.length === 0)
    strengths.push('データを入力すると強みが表示されます');

  const risks: string[] = [];
  if (profitRate < 10 && monthlyRevenue > 0)
    risks.push(`営業利益率 ${profitRate.toFixed(1)}% は危険水準（10%未満）です`);
  if (rentRatio > 15 && monthlyRevenue > 0)
    risks.push(`家賃比率 ${rentRatio.toFixed(1)}% が高く収益を圧迫しています`);
  if (paybackMonths > 36 && initialInvestment > 0)
    risks.push(`回収期間 ${Math.round(paybackMonths)} ヶ月は長期リスクがあります`);
  if (sp > 0 && sp < 10000)
    risks.push(`乗降客数 ${sp.toLocaleString()}人/日 — 集客力の低い駅エリアです`);
  if (ft > 0 && ft < 5000)
    risks.push(`30〜50代女性 ${ft.toLocaleString()}人 — ターゲット層が少ない市場です`);
  if (state.competitor.lowPriceCount > state.competitor.highPriceCount && state.competitor.lowPriceCount > 0)
    risks.push('低単価サロンが多く価格競争に巻き込まれるリスクがあります');
  if (state.competitor.within500m > 8)
    risks.push(`500m圏内に${state.competitor.within500m}店舗と競合が多い激戦区です`);
  if (laborCostRatio > 40 && monthlyRevenue > 0)
    risks.push(`人件費率 ${laborCostRatio.toFixed(1)}% が高すぎます（目標40%以内）`);
  if (risks.length === 0)
    risks.push('データを入力するとリスクが表示されます');

  const improvements: string[] = [];
  if (rentRatio > 15 && properRent > 0)
    improvements.push(`適正家賃は月売上の10%以内。目標: ¥${Math.round(properRent).toLocaleString()}以下に交渉しましょう`);
  if (profitRate < 20 && state.sales.avgCustomerSpend > 0)
    improvements.push(`客単価を¥${Math.round(state.sales.avgCustomerSpend * 1.2).toLocaleString()}に引き上げると利益率が改善します`);
  if (state.competitor.specialtyCurlyCount === 0)
    improvements.push('縮毛矯正を主力メニューにし、特化サロンとして集客の柱にしましょう');
  if (state.competitor.specialtyHairQualityCount === 0)
    improvements.push('髪質改善トリートメントを導入し、高単価化・リピート率向上を目指しましょう');
  if (requiredMonthlyCustomers > 0)
    improvements.push(`損益分岐点達成には月${requiredMonthlyCustomers}名以上の来店が必要です`);
  if (improvements.length === 0)
    improvements.push('各ページでデータを入力すると改善案が表示されます');

  const topMenuByHourlyRate = [...state.menus]
    .filter((m) => m.durationMinutes > 0)
    .sort((a, b) => calcMenuHourlyRate(b) - calcMenuHourlyRate(a));

  const menusToPriceUp = state.menus
    .filter((m) => calcMenuHourlyRate(m) < 3000 && m.monthlyCount > 5)
    .sort((a, b) => a.price - b.price);

  const mainMenuRecommendations: string[] = [];
  if (topMenuByHourlyRate.length > 0)
    mainMenuRecommendations.push(
      `「${topMenuByHourlyRate[0].name}」は時間単価¥${calcMenuHourlyRate(topMenuByHourlyRate[0]).toLocaleString()}で最も効率的です`
    );
  if (state.competitor.specialtyCurlyCount === 0)
    mainMenuRecommendations.push('縮毛矯正: エリア内に特化サロンがなく、集客の核にできます');
  if (state.competitor.specialtyHairQualityCount === 0)
    mainMenuRecommendations.push('髪質改善: 高単価×リピート率向上の両立が期待できます');
  if (mainMenuRecommendations.length === 0)
    mainMenuRecommendations.push('メニューと競合データを入力すると推奨が表示されます');

  return {
    score,
    level,
    monthlyRevenue,
    annualRevenue,
    materialCost,
    totalFixedCosts,
    operatingProfit,
    profitRate,
    breakEvenRevenue,
    requiredDailyCustomers,
    initialInvestment,
    paybackMonths,
    rentRatio,
    laborCostRatio,
    adCostRatio,
    properRent,
    requiredAvgSpend,
    requiredMonthlyCustomers,
    strengths,
    risks,
    improvements,
    topMenuByHourlyRate,
    menusToPriceUp,
    mainMenuRecommendations,
  };
}
