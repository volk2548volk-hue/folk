import React, { useState, useEffect } from 'react';
import { MonthlyBudget } from '../types/finance';
import { formatThaiMonthYear, formatCurrency } from '../constants/categories';
import { X, Target, Check } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // YYYY-MM
  currentBudget?: MonthlyBudget;
  onSaveBudget: (budget: MonthlyBudget) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  currentBudget,
  onSaveBudget,
}) => {
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget?.amount ? currentBudget.amount.toString() : '');
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount) || 0;
    onSaveBudget({
      month: selectedMonth,
      amount: parsed,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">ตั้งค่างบประมาณรายเดือน</h3>
              <p className="text-xs text-slate-400">{formatThaiMonthYear(selectedMonth)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              งบประมาณรายจ่ายเป้าหมาย (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                step="100"
                min="0"
                required
                placeholder="เช่น 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-lg font-bold rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              ระบบจะแสดงเปอร์เซ็นต์ความคืบหน้าและการแจ้งเตือนเมื่อการใช้จ่ายเข้าใกล้งบประมาณ
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4" />
              บันทึกงบประมาณ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
