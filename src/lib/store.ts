'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState,
  AreaInfo,
  PropertyInfo,
  CompetitorInfo,
  MenuItem,
  SalesInfo,
  FixedCosts,
} from './types';

const defaultArea: AreaInfo = {
  stationName: '',
  stationLine: '',
  stationPref: '',
  stationPassengers: 0,
  walkingMinutes: 5,
  municipalityName: '',
  tradeAreaPopulation: 0,
  female30s: 0,
  female40s: 0,
  female50s: 0,
  femalePopulation3050: 0,
  households: 0,
  beautySalonCount: 0,
  annualBeautySpend: 60000,
  averageIncome: 0,
  hasParking: false,
  locationType: 'residential',
};

const defaultProperty: PropertyInfo = {
  tsubo: 0,
  rent: 0,
  managementFee: 0,
  deposit: 0,
  keyMoney: 0,
  interiorCost: 0,
  seatCount: 0,
  shampooCount: 0,
  staffCount: 1,
  isSoloSalon: true,
};

const defaultCompetitor: CompetitorInfo = {
  within500m: 0,
  within1km: 0,
  hotpepperListings: 0,
  lowPriceCount: 0,
  highPriceCount: 0,
  specialtyCurlyCount: 0,
  specialtyHairQualityCount: 0,
  mensSpecialtyCount: 0,
  avgReviewScore: 4.0,
  avgCutPrice: 4000,
  avgCutColorPrice: 10000,
};

const defaultSales: SalesInfo = {
  avgCustomerSpend: 8000,
  dailyCustomers: 5,
  operatingDaysPerMonth: 25,
  shopSales: 0,
  repeatRate: 60,
  newCustomers: 10,
};

const defaultFixedCosts: FixedCosts = {
  rent: 0,
  utilities: 30000,
  communication: 10000,
  hotpepperAds: 0,
  accountant: 20000,
  insurance: 10000,
  miscellaneous: 20000,
  loanRepayment: 0,
  laborCost: 0,
  other: 0,
};

interface StoreState extends AppState {
  updateArea: (data: Partial<AreaInfo>) => void;
  updateProperty: (data: Partial<PropertyInfo>) => void;
  updateCompetitor: (data: Partial<CompetitorInfo>) => void;
  addMenu: (menu: MenuItem) => void;
  updateMenu: (id: string, data: Partial<MenuItem>) => void;
  removeMenu: (id: string) => void;
  updateSales: (data: Partial<SalesInfo>) => void;
  updateFixedCosts: (data: Partial<FixedCosts>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      area: defaultArea,
      property: defaultProperty,
      competitor: defaultCompetitor,
      menus: [],
      sales: defaultSales,
      fixedCosts: defaultFixedCosts,

      updateArea: (data) =>
        set((state) => ({ area: { ...state.area, ...data } })),
      updateProperty: (data) =>
        set((state) => ({ property: { ...state.property, ...data } })),
      updateCompetitor: (data) =>
        set((state) => ({ competitor: { ...state.competitor, ...data } })),
      addMenu: (menu) =>
        set((state) => ({ menus: [...state.menus, menu] })),
      updateMenu: (id, data) =>
        set((state) => ({
          menus: state.menus.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      removeMenu: (id) =>
        set((state) => ({ menus: state.menus.filter((m) => m.id !== id) })),
      updateSales: (data) =>
        set((state) => ({ sales: { ...state.sales, ...data } })),
      updateFixedCosts: (data) =>
        set((state) => ({ fixedCosts: { ...state.fixedCosts, ...data } })),
    }),
    {
      name: 'salon-strategy-v1',
      version: 2,
      migrate: (state: unknown, fromVersion: number) => {
        const s = state as Record<string, unknown>;
        if (fromVersion < 2) {
          const area = s.area as Record<string, unknown> | undefined;
          if (area && area.annualBeautySpend === 100000) {
            area.annualBeautySpend = 60000;
          }
        }
        return s;
      },
    }
  )
);
