'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardTitle, StatCard } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { calcMonthlyRevenue, calcMenuHourlyRate, MATERIAL_COST_RATE } from '@/lib/calculations';
import { MenuItem } from '@/lib/types';
import { TrendingUp, Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import { MenuRankingChart } from '@/components/charts/MenuRankingChart';

let idCounter = Date.now();

const defaultNewMenu = (): Omit<MenuItem, 'id'> => ({
  name: '',
  price: 0,
  durationMinutes: 60,
  monthlyCount: 0,
});

export default function SimulationPage() {
  const { sales, menus, updateSales, addMenu, updateMenu, removeMenu } = useStore();
  const state = useStore();
  const [newMenu, setNewMenu] = useState(defaultNewMenu());
  const [showForm, setShowForm] = useState(false);

  const n = (val: number) => (val === 0 ? '' : String(val));
  const setNum = (updater: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    updater(Number(e.target.value) || 0);

  const monthlyRevenue = calcMonthlyRevenue(state);
  const annualRevenue = monthlyRevenue * 12;
  const materialCost = monthlyRevenue * MATERIAL_COST_RATE;
  const menuRevenue = menus.reduce((sum, m) => sum + m.price * m.monthlyCount, 0);

  const handleAddMenu = () => {
    if (!newMenu.name) return;
    addMenu({ ...newMenu, id: String(++idCounter) });
    setNewMenu(defaultNewMenu());
    setShowForm(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <PageHeader
        title="売上シミュレーション"
        subtitle="メニュー・客数・営業日数を入力してください"
        icon={<TrendingUp size={20} />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* 売上サマリー */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="月間売上予測"
            value={`¥${(monthlyRevenue / 10000).toFixed(1)}`}
            unit="万"
            color={monthlyRevenue > 0 ? 'amber' : 'default'}
          />
          <StatCard
            label="年間売上予測"
            value={`¥${(annualRevenue / 10000).toFixed(0)}`}
            unit="万"
            color={annualRevenue > 0 ? 'amber' : 'default'}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="材料費（売上×10%）"
            value={`¥${(materialCost / 10000).toFixed(1)}`}
            unit="万"
            color="default"
          />
          <StatCard
            label="売上後の残り"
            value={`¥${((monthlyRevenue - materialCost) / 10000).toFixed(1)}`}
            unit="万"
            color={monthlyRevenue - materialCost > 0 ? 'green' : 'red'}
          />
        </div>

        {/* 基本売上設定 */}
        <Card>
          <CardTitle>売上基本設定</CardTitle>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="客単価"
                type="number"
                inputMode="numeric"
                placeholder="8000"
                value={n(sales.avgCustomerSpend)}
                onChange={setNum((v) => updateSales({ avgCustomerSpend: v }))}
                unit="円"
              />
              <InputField
                label="1日の来客数"
                type="number"
                inputMode="numeric"
                placeholder="5"
                value={n(sales.dailyCustomers)}
                onChange={setNum((v) => updateSales({ dailyCustomers: v }))}
                unit="人"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="月の営業日数"
                type="number"
                inputMode="numeric"
                placeholder="25"
                value={n(sales.operatingDaysPerMonth)}
                onChange={setNum((v) => updateSales({ operatingDaysPerMonth: v }))}
                unit="日"
              />
              <InputField
                label="店販売上"
                type="number"
                inputMode="numeric"
                placeholder="20000"
                value={n(sales.shopSales)}
                onChange={setNum((v) => updateSales({ shopSales: v }))}
                unit="円/月"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="リピート率"
                type="number"
                inputMode="numeric"
                placeholder="60"
                value={n(sales.repeatRate)}
                onChange={setNum((v) => updateSales({ repeatRate: v }))}
                unit="%"
              />
              <InputField
                label="月間新規客数"
                type="number"
                inputMode="numeric"
                placeholder="10"
                value={n(sales.newCustomers)}
                onChange={setNum((v) => updateSales({ newCustomers: v }))}
                unit="人"
              />
            </div>
          </div>

          {/* 月間売上内訳 */}
          {monthlyRevenue > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl space-y-1.5">
              <p className="text-xs font-bold text-amber-800">月間売上内訳</p>
              <div className="flex justify-between text-xs text-amber-700">
                <span>施術売上（{sales.dailyCustomers}人×{sales.operatingDaysPerMonth}日×¥{sales.avgCustomerSpend.toLocaleString()}）</span>
                <span>¥{(sales.avgCustomerSpend * sales.dailyCustomers * sales.operatingDaysPerMonth).toLocaleString()}</span>
              </div>
              {sales.shopSales > 0 && (
                <div className="flex justify-between text-xs text-amber-700">
                  <span>店販売上</span>
                  <span>¥{sales.shopSales.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-amber-900 border-t border-amber-200 pt-1 mt-1">
                <span>合計</span>
                <span>¥{monthlyRevenue.toLocaleString()}</span>
              </div>
            </div>
          )}
        </Card>

        {/* メニュー管理 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <CardTitle>メニュー管理</CardTitle>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full active:bg-amber-100"
            >
              <Plus size={13} />
              追加
            </button>
          </div>

          {/* New menu form */}
          {showForm && (
            <div className="mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <p className="text-xs font-bold text-stone-600">新規メニュー</p>
              <InputField
                label="メニュー名"
                type="text"
                placeholder="例：カットカラー"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="料金"
                  type="number"
                  inputMode="numeric"
                  placeholder="9000"
                  value={n(newMenu.price)}
                  onChange={(e) => setNewMenu({ ...newMenu, price: Number(e.target.value) || 0 })}
                  unit="円"
                />
                <InputField
                  label="施術時間"
                  type="number"
                  inputMode="numeric"
                  placeholder="120"
                  value={n(newMenu.durationMinutes)}
                  onChange={(e) => setNewMenu({ ...newMenu, durationMinutes: Number(e.target.value) || 0 })}
                  unit="分"
                />
              </div>
              <InputField
                label="月間施術回数"
                type="number"
                inputMode="numeric"
                placeholder="20"
                value={n(newMenu.monthlyCount)}
                onChange={(e) => setNewMenu({ ...newMenu, monthlyCount: Number(e.target.value) || 0 })}
                unit="回/月"
              />
              {newMenu.price > 0 && newMenu.durationMinutes > 0 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                  <Clock size={13} className="text-amber-700" />
                  <span className="text-xs text-amber-800 font-medium">
                    時間単価: ¥{calcMenuHourlyRate(newMenu as MenuItem).toLocaleString()}/時間
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAddMenu}
                  disabled={!newMenu.name}
                  className="flex-1 py-2.5 bg-amber-800 text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:bg-amber-900"
                >
                  登録する
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewMenu(defaultNewMenu()); }}
                  className="px-4 py-2.5 bg-stone-200 text-stone-600 text-sm font-semibold rounded-xl active:bg-stone-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* Menu list */}
          {menus.length === 0 ? (
            <div className="text-center py-6 text-stone-400">
              <DollarSign size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">メニューを登録してください</p>
              <p className="text-xs mt-1">時間単価ランキングを自動計算します</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map((menu) => {
                const hourlyRate = calcMenuHourlyRate(menu);
                const monthlyMenuRevenue = menu.price * menu.monthlyCount;
                return (
                  <div key={menu.id} className="p-3 bg-stone-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800 text-sm">{menu.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          ¥{menu.price.toLocaleString()} / {menu.durationMinutes}分
                          {menu.monthlyCount > 0 && ` / 月${menu.monthlyCount}回`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-bold text-amber-700">
                            ¥{hourlyRate.toLocaleString()}/h
                          </p>
                          {monthlyMenuRevenue > 0 && (
                            <p className="text-xs text-stone-400">
                              月¥{(monthlyMenuRevenue / 10000).toFixed(1)}万
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeMenu(menu.id)}
                          className="w-7 h-7 flex items-center justify-center text-stone-300 hover:text-red-400 active:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {menuRevenue > 0 && (
                <div className="p-2.5 bg-amber-50 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-800">メニューベース月間売上</span>
                  <span className="text-sm font-bold text-amber-900">¥{menuRevenue.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 時間単価ランキング */}
        {menus.length > 0 && (
          <Card>
            <CardTitle>時間単価ランキング</CardTitle>
            <MenuRankingChart menus={menus} />
            <p className="text-xs text-stone-400 mt-2 text-center">
              高い順に表示（¥/時間）
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
