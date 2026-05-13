export type LocationType = 'residential' | 'station-front' | 'commercial' | 'suburban';

export interface AreaInfo {
  stationName: string;
  stationLine: string;
  stationPref: string;
  stationPassengers: number;
  walkingMinutes: number;
  municipalityName: string;
  tradeAreaPopulation: number;
  female30s: number;
  female40s: number;
  female50s: number;
  femalePopulation3050: number;
  households: number;
  beautySalonCount: number;
  annualBeautySpend: number;
  averageIncome: number;
  hasParking: boolean;
  locationType: LocationType;
}

export interface PropertyInfo {
  tsubo: number;
  rent: number;
  managementFee: number;
  deposit: number;
  keyMoney: number;
  interiorCost: number;
  seatCount: number;
  shampooCount: number;
  staffCount: number;
  isSoloSalon: boolean;
}

export interface CompetitorInfo {
  within500m: number;
  within1km: number;
  hotpepperListings: number;
  lowPriceCount: number;
  highPriceCount: number;
  specialtyCurlyCount: number;
  specialtyHairQualityCount: number;
  mensSpecialtyCount: number;
  avgReviewScore: number;
  avgCutPrice: number;
  avgCutColorPrice: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  monthlyCount: number;
}

export interface SalesInfo {
  avgCustomerSpend: number;
  dailyCustomers: number;
  operatingDaysPerMonth: number;
  shopSales: number;
  repeatRate: number;
  newCustomers: number;
}

export interface FixedCosts {
  rent: number;
  utilities: number;
  communication: number;
  hotpepperAds: number;
  accountant: number;
  insurance: number;
  miscellaneous: number;
  loanRepayment: number;
  laborCost: number;
  other: number;
}

export interface AppState {
  area: AreaInfo;
  property: PropertyInfo;
  competitor: CompetitorInfo;
  menus: MenuItem[];
  sales: SalesInfo;
  fixedCosts: FixedCosts;
}

export interface DiagnosisResult {
  score: number;
  level: 'safe' | 'normal' | 'caution' | 'danger';
  monthlyRevenue: number;
  annualRevenue: number;
  materialCost: number;
  totalFixedCosts: number;
  operatingProfit: number;
  profitRate: number;
  breakEvenRevenue: number;
  requiredDailyCustomers: number;
  initialInvestment: number;
  paybackMonths: number;
  rentRatio: number;
  laborCostRatio: number;
  adCostRatio: number;
  properRent: number;
  requiredAvgSpend: number;
  requiredMonthlyCustomers: number;
  strengths: string[];
  risks: string[];
  improvements: string[];
  topMenuByHourlyRate: MenuItem[];
  menusToPriceUp: MenuItem[];
  mainMenuRecommendations: string[];
}
