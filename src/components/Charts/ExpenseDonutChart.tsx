import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency } from '../../constants/categories';
import { CategoryIcon } from '../CategoryIcon';
import { PieChart, TrendingDown, TrendingUp } from 'lucide-react';

interface ExpenseDonutChartProps {
  transactions: Transaction[];
  currentType: TransactionType;
  onTypeChange: (type: TransactionType) => void;
}

interface SegmentData {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  count: number;
  startAngle: number;
  endAngle: number;
  pathD: string;
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({
  transactions,
  currentType,
  onTypeChange,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter transactions by selected type
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === currentType);
  }, [transactions, currentType]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredTransactions]);

  // Aggregate by category
  const segments: SegmentData[] = useMemo(() => {
    if (totalAmount <= 0) return [];

    const map = new Map<string, {
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      categoryIcon: string;
      amount: number;
      count: number;
    }>();

    filteredTransactions.forEach((t) => {
      const existing = map.get(t.categoryId);
      if (existing) {
        existing.amount += t.amount;
        existing.count += 1;
      } else {
        map.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: t.categoryName,
          categoryColor: t.categoryColor,
          categoryIcon: t.categoryIcon,
          amount: t.amount,
          count: 1,
        });
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.amount - a.amount);

    // Compute SVG arcs
    const radius = 90;
    const innerRadius = 58;
    const center = 110;
    let currentAngle = -Math.PI / 2; // start at top

    return sorted.map((item) => {
      const percentage = (item.amount / totalAmount) * 100;
      const angle = (item.amount / totalAmount) * (2 * Math.PI);
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Arc coordinates
      const x1 = center + radius * Math.cos(startAngle);
      const y1 = center + radius * Math.sin(startAngle);
      const x2 = center + radius * Math.cos(endAngle);
      const y2 = center + radius * Math.sin(endAngle);

      const ix1 = center + innerRadius * Math.cos(endAngle);
      const iy1 = center + innerRadius * Math.sin(endAngle);
      const ix2 = center + innerRadius * Math.cos(startAngle);
      const iy2 = center + innerRadius * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      // When there's only 1 category taking 100%
      let pathD = '';
      if (percentage >= 99.9) {
        pathD = `
          M ${center} ${center - radius}
          A ${radius} ${radius} 0 1 0 ${center} ${center + radius}
          A ${radius} ${radius} 0 1 0 ${center} ${center - radius}
          M ${center} ${center - innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center + innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 1 ${center} ${center - innerRadius}
          Z
        `;
      } else {
        pathD = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${ix1} ${iy1}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
          Z
        `;
      }

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        pathD,
      };
    });
  }, [filteredTransactions, totalAmount]);

  const activeSegment = segments.find((s) => s.categoryId === hoveredCategory);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">สัดส่วนตามหมวดหมู่</h3>
            <p className="text-xs text-slate-400">วิเคราะห์การกระจายตัวของรายรับ-รายจ่าย</p>
          </div>
        </div>

        {/* Type Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => onTypeChange('expense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentType === 'expense'
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            รายจ่าย
          </button>
          <button
            onClick={() => onTypeChange('income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentType === 'income'
                ? 'bg-emerald-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            รายรับ
          </button>
        </div>
      </div>

      {totalAmount <= 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <PieChart className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูล{currentType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
          <p className="text-xs text-slate-400 mt-1">คลิก "+ บันทึกรายการใหม่" เพื่อเริ่มต้นบันทึกข้อมูล</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
          {/* SVG Donut Center */}
          <div className="md:col-span-6 flex flex-col items-center justify-center relative">
            <svg
              viewBox="0 0 220 220"
              className="w-56 h-56 transform -rotate-90 filter drop-shadow-xs"
            >
              {segments.map((s) => {
                const isHovered = hoveredCategory === s.categoryId;
                return (
                  <path
                    key={s.categoryId}
                    d={s.pathD}
                    fill={s.categoryColor}
                    opacity={hoveredCategory && !isHovered ? 0.35 : 1}
                    className="transition-all duration-200 cursor-pointer hover:opacity-90"
                    onMouseEnter={() => setHoveredCategory(s.categoryId)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      transformOrigin: '110px 110px',
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xs font-medium text-slate-400">
                {activeSegment ? activeSegment.categoryName : `ยอดรวม${currentType === 'expense' ? 'รายจ่าย' : 'รายรับ'}`}
              </span>
              <span className="text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                {activeSegment
                  ? formatCurrency(activeSegment.amount)
                  : formatCurrency(totalAmount)}
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
                {activeSegment
                  ? `${activeSegment.percentage.toFixed(1)}% (${activeSegment.count} รายการ)`
                  : `${segments.length} หมวดหมู่`}
              </span>
            </div>
          </div>

          {/* Categories List Legend */}
          <div className="md:col-span-6 max-h-64 overflow-y-auto pr-1 space-y-2">
            {segments.map((s) => {
              const isHovered = hoveredCategory === s.categoryId;
              return (
                <div
                  key={s.categoryId}
                  onMouseEnter={() => setHoveredCategory(s.categoryId)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                    isHovered
                      ? 'bg-slate-50 border-slate-200 shadow-2xs translate-x-1'
                      : 'border-transparent hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: s.categoryColor }}
                    >
                      <CategoryIcon name={s.categoryIcon} className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {s.categoryName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {s.count} รายการ ({s.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">
                      {formatCurrency(s.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
