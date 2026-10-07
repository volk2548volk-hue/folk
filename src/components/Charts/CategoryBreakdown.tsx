import React, { useMemo } from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../constants/categories';
import { CategoryIcon } from '../CategoryIcon';
import { ArrowUpRight, Flame } from 'lucide-react';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  onSelectCategory,
}) => {
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense');
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [expenseTransactions]);

  const rankedCategories = useMemo(() => {
    if (totalExpense === 0) return [];

    const map = new Map<string, {
      id: string;
      name: string;
      icon: string;
      color: string;
      total: number;
      count: number;
    }>();

    expenseTransactions.forEach((t) => {
      const existing = map.get(t.categoryId);
      if (existing) {
        existing.total += t.amount;
        existing.count += 1;
      } else {
        map.set(t.categoryId, {
          id: t.categoryId,
          name: t.categoryName,
          icon: t.categoryIcon,
          color: t.categoryColor,
          total: t.amount,
          count: 1,
        });
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: (item.total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenseTransactions, totalExpense]);

  if (rankedCategories.length === 0) {
    return null;
  }

  const topCategory = rankedCategories[0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">อันดับหมวดหมู่ค่าใช้จ่ายสูงสุด</h4>
            <p className="text-xs text-slate-400">ภาพรวมการใช้จ่ายที่ต้องระวังเป็นพิเศษ</p>
          </div>
        </div>

        {topCategory && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-medium text-rose-600">
            <span>ใช้มากที่สุด: <strong>{topCategory.name}</strong></span>
            <span>({topCategory.percentage.toFixed(0)}%)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankedCategories.map((cat, index) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory?.(cat.id)}
            className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer bg-slate-50/40 hover:bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  #{index + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                  {cat.name}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(cat.total)}
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5 font-medium">
                  ({cat.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(cat.percentage, 100)}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
              <span>{cat.count} รายการ</span>
              <span className="flex items-center text-indigo-500 hover:text-indigo-600 font-medium">
                ดูรายการ <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
