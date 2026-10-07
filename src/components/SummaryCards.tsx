import React from 'react';
import { MonthSummary, MonthlyBudget } from '../types/finance';
import { formatCurrency } from '../constants/categories';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  AlertTriangle,
  Percent,
  Sliders
} from 'lucide-react';

interface SummaryCardsProps {
  summary: MonthSummary;
  budget?: MonthlyBudget;
  onOpenBudgetModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  budget,
  onOpenBudgetModal,
}) => {
  const budgetAmount = budget?.amount || 0;
  const budgetSpentPct = budgetAmount > 0 
    ? (summary.totalExpense / budgetAmount) * 100 
    : 0;
  const budgetRemaining = budgetAmount > 0 
    ? budgetAmount - summary.totalExpense 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              รายรับรวม (Income)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <span>+{summary.incomeCount} รายการรับเข้า</span>
          </div>
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              รายจ่ายรวม (Expense)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalExpense)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span className="text-rose-600 font-medium">{summary.expenseCount} รายการ</span>
            <span className="text-[11px] text-slate-400">
              เฉลี่ย {formatCurrency(summary.dailyAverageExpense)}/วัน
            </span>
          </div>
        </div>
      </div>

      {/* 3. Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              คงเหลือสุทธิ (Net Balance)
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              summary.balance >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold tracking-tight ${
            summary.balance >= 0 ? 'text-indigo-900' : 'text-red-600'
          }`}>
            {formatCurrency(summary.balance)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
            <span className="flex items-center text-slate-500">
              <Percent className="w-3 h-3 mr-0.5 text-indigo-500" />
              อัตราการออม:
            </span>
            <span className={summary.savingsRate >= 0 ? 'text-indigo-600 font-semibold' : 'text-red-500 font-semibold'}>
              {summary.savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. Budget Status */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              งบประมาณเดือนนี้
            </span>
            <button
              onClick={onOpenBudgetModal}
              title="ตั้งค่างบประมาณ"
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-lg hover:bg-indigo-50"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {budgetAmount > 0 ? (
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(summary.totalExpense, false)}
                </span>
                <span className="text-xs text-slate-400">
                  / {formatCurrency(budgetAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetSpentPct > 100
                      ? 'bg-red-500'
                      : budgetSpentPct > 80
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(budgetSpentPct, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className={budgetSpentPct > 100 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                  ใช้ไป {budgetSpentPct.toFixed(0)}%
                </span>
                <span className={budgetRemaining < 0 ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                  {budgetRemaining >= 0 
                    ? `เหลือ ${formatCurrency(budgetRemaining)}` 
                    : `เกิน ${formatCurrency(Math.abs(budgetRemaining))}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <p className="text-xs text-slate-500 mb-2">ยังไม่ได้กำหนดงบประมาณสำหรับเดือนนี้</p>
              <button
                onClick={onOpenBudgetModal}
                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                ตั้งค่างบประมาณ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
